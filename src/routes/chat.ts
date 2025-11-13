// BrandMind AI - AI Chat Routes

import { Hono } from 'hono'
import { authMiddleware, requireFeature } from '../middleware/auth'
import { chatWithAI } from '../utils/perplexity'
import type { Bindings, PerplexityMessage } from '../types'

const chat = new Hono<{ Bindings: Bindings }>()

// Apply authentication and feature check
chat.use('/*', authMiddleware)
chat.use('/*', requireFeature('ai_chat'))

/**
 * POST /api/chat/message
 * Send message to AI assistant
 */
chat.post('/message', async (c) => {
  try {
    const { DB } = c.env
    const userId = c.get('userId')
    const user = c.get('user')
    const { message, conversation_id, business_id } = await c.req.json()

    if (!message) {
      return c.json({
        success: false,
        error: 'missing_message',
        message: 'الرسالة مطلوبة'
      }, 400)
    }

    // Get Perplexity API key (user's key or master key)
    let apiKey = user.perplexity_api_key

    if (!apiKey) {
      // Fallback to master key
      const { results } = await DB.prepare(
        'SELECT value FROM system_settings WHERE key = "master_perplexity_key"'
      ).all()
      
      if (results && results.length > 0) {
        apiKey = (results[0] as any).value
      }
      
      if (!apiKey) {
        return c.json({
          success: false,
          error: 'no_api_key',
          message: 'لا يوجد مفتاح Perplexity API متاح. يرجى التواصل مع الإدارة.'
        }, 503)
      }
    }

    let conversationId = conversation_id

    // Create new conversation if not provided
    if (!conversationId) {
      const convResult = await DB.prepare(
        'INSERT INTO chat_conversations (user_id, business_id, title) VALUES (?, ?, ?)'
      ).bind(userId, business_id || null, 'محادثة جديدة').run()

      conversationId = convResult.meta.last_row_id
    }

    // Get conversation history
    const { results: historyResults } = await DB.prepare(
      'SELECT role, content FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 20'
    ).bind(conversationId).all()

    const history: PerplexityMessage[] = (historyResults || []).map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }))

    // Add user message to history
    history.push({
      role: 'user',
      content: message
    })

    // Get business context if provided
    let businessContext
    if (business_id) {
      const { results: businessResults } = await DB.prepare(
        'SELECT business_name, business_type, description FROM business_profiles WHERE id = ? AND user_id = ?'
      ).bind(business_id, userId).all()

      if (businessResults && businessResults.length > 0) {
        const business = businessResults[0] as any
        businessContext = {
          name: business.business_name,
          type: business.business_type,
          description: business.description
        }
      }
    }

    // Call Perplexity AI
    const { response: aiResponse, tokensUsed } = await chatWithAI(apiKey, history, businessContext)

    // Save user message
    await DB.prepare(
      'INSERT INTO chat_messages (conversation_id, role, content, tokens_used) VALUES (?, ?, ?, ?)'
    ).bind(conversationId, 'user', message, 0).run()

    // Save assistant response
    await DB.prepare(
      'INSERT INTO chat_messages (conversation_id, role, content, tokens_used, model) VALUES (?, ?, ?, ?, ?)'
    ).bind(conversationId, 'assistant', aiResponse, tokensUsed, 'perplexity').run()

    // Log usage
    await DB.prepare(
      'INSERT INTO usage_logs (user_id, feature, action, tokens_used) VALUES (?, ?, ?, ?)'
    ).bind(userId, 'ai_chat', 'message_sent', tokensUsed).run()

    // Update conversation title if first message
    if (!conversation_id) {
      const title = message.substring(0, 50) + (message.length > 50 ? '...' : '')
      await DB.prepare(
        'UPDATE chat_conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(title, conversationId).run()
    }

    return c.json({
      success: true,
      data: {
        conversation_id: conversationId,
        message: {
          role: 'assistant',
          content: aiResponse,
          tokens_used: tokensUsed
        }
      }
    })
  } catch (error) {
    console.error('Chat error:', error)
    return c.json({
      success: false,
      error: 'chat_error',
      message: error instanceof Error ? error.message : 'خطأ في المحادثة'
    }, 500)
  }
})

/**
 * GET /api/chat/conversations
 * Get user's conversations
 */
chat.get('/conversations', async (c) => {
  try {
    const { DB } = c.env
    const userId = c.get('userId')

    const { results } = await DB.prepare(`
      SELECT 
        c.*,
        COUNT(m.id) as message_count,
        MAX(m.created_at) as last_message_at
      FROM chat_conversations c
      LEFT JOIN chat_messages m ON c.id = m.conversation_id
      WHERE c.user_id = ? AND c.is_active = 1
      GROUP BY c.id
      ORDER BY last_message_at DESC
    `).bind(userId).all()

    return c.json({
      success: true,
      data: results
    })
  } catch (error) {
    console.error('Get conversations error:', error)
    return c.json({
      success: false,
      error: 'get_conversations_error',
      message: 'خطأ في تحميل المحادثات'
    }, 500)
  }
})

/**
 * GET /api/chat/conversations/:id/messages
 * Get conversation messages
 */
chat.get('/conversations/:id/messages', async (c) => {
  try {
    const { DB } = c.env
    const userId = c.get('userId')
    const conversationId = parseInt(c.req.param('id'))

    // Verify ownership
    const { results: convResults } = await DB.prepare(
      'SELECT * FROM chat_conversations WHERE id = ? AND user_id = ?'
    ).bind(conversationId, userId).all()

    if (!convResults || convResults.length === 0) {
      return c.json({
        success: false,
        error: 'conversation_not_found',
        message: 'المحادثة غير موجودة'
      }, 404)
    }

    // Get messages
    const { results } = await DB.prepare(
      'SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC'
    ).bind(conversationId).all()

    return c.json({
      success: true,
      data: {
        conversation: convResults[0],
        messages: results
      }
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return c.json({
      success: false,
      error: 'get_messages_error',
      message: 'خطأ في تحميل الرسائل'
    }, 500)
  }
})

/**
 * DELETE /api/chat/conversations/:id
 * Delete conversation
 */
chat.delete('/conversations/:id', async (c) => {
  try {
    const { DB } = c.env
    const userId = c.get('userId')
    const conversationId = parseInt(c.req.param('id'))

    // Soft delete
    await DB.prepare(
      'UPDATE chat_conversations SET is_active = 0 WHERE id = ? AND user_id = ?'
    ).bind(conversationId, userId).run()

    return c.json({
      success: true,
      message: 'تم حذف المحادثة بنجاح'
    })
  } catch (error) {
    console.error('Delete conversation error:', error)
    return c.json({
      success: false,
      error: 'delete_conversation_error',
      message: 'خطأ في حذف المحادثة'
    }, 500)
  }
})

export default chat
