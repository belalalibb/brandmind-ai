// BrandMind AI - Content Generation Routes

import { Hono } from 'hono'
import { authMiddleware, requireFeature } from '../middleware/auth'
import { generateSocialPost, generateAdCopy, generateContentIdeas } from '../utils/perplexity'
import type { Bindings } from '../types'

const content = new Hono<{ Bindings: Bindings }>()

// Apply authentication
content.use('/*', authMiddleware)

/**
 * POST /api/content/generate/post
 * Generate social media post
 */
content.post('/generate/post', requireFeature('content_generation'), async (c) => {
  try {
    const { DB } = c.env
    const userId = c.get('userId')
    const user = c.get('user')
    const { business_id, topic, platform, tone, save_as_draft } = await c.req.json()

    if (!topic || !platform) {
      return c.json({
        success: false,
        error: 'missing_fields',
        message: 'الموضوع والمنصة مطلوبان'
      }, 400)
    }

    // Get business info
    const { results: businessResults } = await DB.prepare(
      'SELECT * FROM business_profiles WHERE id = ? AND user_id = ?'
    ).bind(business_id, userId).all()

    if (!businessResults || businessResults.length === 0) {
      return c.json({
        success: false,
        error: 'business_not_found',
        message: 'النشاط التجاري غير موجود'
      }, 404)
    }

    const business = businessResults[0] as any

    // Get API key
    let apiKey = user.perplexity_api_key
    if (!apiKey) {
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
          message: 'لا يوجد مفتاح Perplexity API متاح'
        }, 503)
      }
    }

    // Generate post
    const { content, hashtags } = await generateSocialPost(
      apiKey,
      business.business_name,
      business.business_type,
      topic,
      platform,
      tone || business.brand_voice || 'friendly'
    )

    // Save as draft if requested
    let postId = null
    if (save_as_draft) {
      const result = await DB.prepare(`
        INSERT INTO content_posts (user_id, business_id, content, content_type, hashtags, target_platforms, status, ai_generated, ai_model, tone)
        VALUES (?, ?, ?, 'text', ?, ?, 'draft', 1, 'perplexity', ?)
      `).bind(
        userId,
        business_id,
        content,
        JSON.stringify(hashtags),
        JSON.stringify([platform]),
        tone || 'friendly'
      ).run()

      postId = result.meta.last_row_id
    }

    // Log usage
    await DB.prepare(
      'INSERT INTO usage_logs (user_id, feature, action, api_calls) VALUES (?, ?, ?, 1)'
    ).bind(userId, 'content_generation', 'social_post_generated').run()

    return c.json({
      success: true,
      data: {
        post_id: postId,
        content,
        hashtags,
        platform,
        business_name: business.business_name
      }
    })
  } catch (error) {
    console.error('Generate post error:', error)
    return c.json({
      success: false,
      error: 'generate_post_error',
      message: error instanceof Error ? error.message : 'خطأ في إنشاء المحتوى'
    }, 500)
  }
})

/**
 * POST /api/content/generate/ad
 * Generate ad copy
 */
content.post('/generate/ad', requireFeature('ad_generator'), async (c) => {
  try {
    const { DB } = c.env
    const userId = c.get('userId')
    const user = c.get('user')
    const { business_id, product_service, target_audience, goal } = await c.req.json()

    if (!product_service || !target_audience || !goal) {
      return c.json({
        success: false,
        error: 'missing_fields',
        message: 'المنتج/الخدمة والجمهور المستهدف والهدف مطلوبة'
      }, 400)
    }

    // Get business info
    const { results: businessResults } = await DB.prepare(
      'SELECT * FROM business_profiles WHERE id = ? AND user_id = ?'
    ).bind(business_id, userId).all()

    if (!businessResults || businessResults.length === 0) {
      return c.json({
        success: false,
        error: 'business_not_found',
        message: 'النشاط التجاري غير موجود'
      }, 404)
    }

    const business = businessResults[0] as any

    // Get API key
    let apiKey = user.perplexity_api_key
    if (!apiKey) {
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
          message: 'لا يوجد مفتاح Perplexity API متاح'
        }, 503)
      }
    }

    // Generate ad copy
    const adCopy = await generateAdCopy(
      apiKey,
      business.business_name,
      product_service,
      target_audience,
      goal
    )

    // Log usage
    await DB.prepare(
      'INSERT INTO usage_logs (user_id, feature, action, api_calls) VALUES (?, ?, ?, 1)'
    ).bind(userId, 'content_generation', 'ad_copy_generated').run()

    return c.json({
      success: true,
      data: adCopy
    })
  } catch (error) {
    console.error('Generate ad error:', error)
    return c.json({
      success: false,
      error: 'generate_ad_error',
      message: error instanceof Error ? error.message : 'خطأ في إنشاء الإعلان'
    }, 500)
  }
})

/**
 * POST /api/content/ideas
 * Generate content ideas
 */
content.post('/ideas', requireFeature('content_generation'), async (c) => {
  try {
    const { DB } = c.env
    const userId = c.get('userId')
    const user = c.get('user')
    const { business_id, count = 10 } = await c.req.json()

    // Get business info
    const { results: businessResults } = await DB.prepare(
      'SELECT * FROM business_profiles WHERE id = ? AND user_id = ?'
    ).bind(business_id, userId).all()

    if (!businessResults || businessResults.length === 0) {
      return c.json({
        success: false,
        error: 'business_not_found',
        message: 'النشاط التجاري غير موجود'
      }, 404)
    }

    const business = businessResults[0] as any

    // Get API key
    let apiKey = user.perplexity_api_key
    if (!apiKey) {
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
          message: 'لا يوجد مفتاح Perplexity API متاح'
        }, 503)
      }
    }

    // Generate ideas
    const ideas = await generateContentIdeas(apiKey, business.business_type, count)

    return c.json({
      success: true,
      data: {
        business_type: business.business_type,
        ideas
      }
    })
  } catch (error) {
    console.error('Generate ideas error:', error)
    return c.json({
      success: false,
      error: 'generate_ideas_error',
      message: error instanceof Error ? error.message : 'خطأ في إنشاء الأفكار'
    }, 500)
  }
})

/**
 * GET /api/content/posts
 * Get user's content posts
 */
content.get('/posts', async (c) => {
  try {
    const { DB } = c.env
    const userId = c.get('userId')
    const status = c.req.query('status') || 'all'
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')

    let query = `
      SELECT p.*, b.business_name
      FROM content_posts p
      LEFT JOIN business_profiles b ON p.business_id = b.id
      WHERE p.user_id = ?
    `
    const bindings: any[] = [userId]

    if (status !== 'all') {
      query += ' AND p.status = ?'
      bindings.push(status)
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
    bindings.push(limit, offset)

    const { results } = await DB.prepare(query).bind(...bindings).all()

    return c.json({
      success: true,
      data: results
    })
  } catch (error) {
    console.error('Get posts error:', error)
    return c.json({
      success: false,
      error: 'get_posts_error',
      message: 'خطأ في تحميل المنشورات'
    }, 500)
  }
})

/**
 * DELETE /api/content/posts/:id
 * Delete content post
 */
content.delete('/posts/:id', async (c) => {
  try {
    const { DB } = c.env
    const userId = c.get('userId')
    const postId = parseInt(c.req.param('id'))

    await DB.prepare(
      'DELETE FROM content_posts WHERE id = ? AND user_id = ?'
    ).bind(postId, userId).run()

    return c.json({
      success: true,
      message: 'تم حذف المنشور بنجاح'
    })
  } catch (error) {
    console.error('Delete post error:', error)
    return c.json({
      success: false,
      error: 'delete_post_error',
      message: 'خطأ في حذف المنشور'
    }, 500)
  }
})

export default content
