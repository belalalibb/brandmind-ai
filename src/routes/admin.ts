// BrandMind AI - Admin Routes
// Dashboard for manual user activation and API key management

import { Hono } from 'hono'
import { authMiddleware, requireRole } from '../middleware/auth'
import { getSubscriptionLimits, getSubscriptionFeatures, generateApiKey } from '../utils/auth'
import type { Bindings, User, Subscription } from '../types'

const admin = new Hono<{ Bindings: Bindings }>()

// Apply admin authentication to all routes
admin.use('/*', authMiddleware)
admin.use('/*', requireRole(['admin', 'superadmin']))

/**
 * GET /api/admin/dashboard
 * Dashboard statistics
 */
admin.get('/dashboard', async (c) => {
  try {
    const { DB } = c.env

    // Get statistics
    const [totalUsers, activeUsers, pendingUsers, totalSubscriptions, activeSubscriptions] = await Promise.all([
      DB.prepare('SELECT COUNT(*) as count FROM users').first(),
      DB.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').first(),
      DB.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 0').first(),
      DB.prepare('SELECT COUNT(*) as count FROM subscriptions').first(),
      DB.prepare('SELECT COUNT(*) as count FROM subscriptions WHERE status = "active"').first()
    ])

    // Get plan distribution
    const { results: planStats } = await DB.prepare(
      'SELECT plan, COUNT(*) as count FROM subscriptions WHERE status = "active" GROUP BY plan'
    ).all()

    // Get recent registrations
    const { results: recentUsers } = await DB.prepare(
      'SELECT id, email, name, telegram_username, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 10'
    ).all()

    // Get revenue (mock for now)
    const revenue = {
      today: 0,
      this_month: 0,
      total: 0
    }

    return c.json({
      success: true,
      data: {
        stats: {
          total_users: (totalUsers as any).count,
          active_users: (activeUsers as any).count,
          pending_users: (pendingUsers as any).count,
          total_subscriptions: (totalSubscriptions as any).count,
          active_subscriptions: (activeSubscriptions as any).count
        },
        plan_distribution: planStats,
        recent_users: recentUsers,
        revenue
      }
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return c.json({
      success: false,
      error: 'dashboard_error',
      message: 'خطأ في تحميل لوحة التحكم'
    }, 500)
  }
})

/**
 * GET /api/admin/users
 * List all users with filters
 */
admin.get('/users', async (c) => {
  try {
    const { DB } = c.env
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const status = c.req.query('status') // 'active', 'inactive', 'all'
    const search = c.req.query('search')
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        u.*,
        s.plan,
        s.status as subscription_status,
        s.end_date as subscription_end_date
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      WHERE 1=1
    `
    const bindings: any[] = []

    if (status === 'active') {
      query += ' AND u.is_active = 1'
    } else if (status === 'inactive') {
      query += ' AND u.is_active = 0'
    }

    if (search) {
      query += ' AND (u.email LIKE ? OR u.name LIKE ? OR u.telegram_username LIKE ?)'
      const searchTerm = `%${search}%`
      bindings.push(searchTerm, searchTerm, searchTerm)
    }

    query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?'
    bindings.push(limit, offset)

    const { results: users } = await DB.prepare(query).bind(...bindings).all()

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM users WHERE 1=1'
    const countBindings: any[] = []

    if (status === 'active') {
      countQuery += ' AND is_active = 1'
    } else if (status === 'inactive') {
      countQuery += ' AND is_active = 0'
    }

    if (search) {
      countQuery += ' AND (email LIKE ? OR name LIKE ? OR telegram_username LIKE ?)'
      const searchTerm = `%${search}%`
      countBindings.push(searchTerm, searchTerm, searchTerm)
    }

    const totalCount = await DB.prepare(countQuery).bind(...countBindings).first() as any

    return c.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: totalCount.count,
          total_pages: Math.ceil(totalCount.count / limit)
        }
      }
    })
  } catch (error) {
    console.error('List users error:', error)
    return c.json({
      success: false,
      error: 'list_users_error',
      message: 'خطأ في تحميل قائمة المستخدمين'
    }, 500)
  }
})

/**
 * GET /api/admin/users/:id
 * Get user details
 */
admin.get('/users/:id', async (c) => {
  try {
    const { DB } = c.env
    const userId = parseInt(c.req.param('id'))

    const { results } = await DB.prepare(`
      SELECT 
        u.*,
        s.id as subscription_id,
        s.plan,
        s.status as subscription_status,
        s.start_date,
        s.end_date,
        s.features,
        s.limits,
        s.notes
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE u.id = ?
      ORDER BY s.created_at DESC
      LIMIT 1
    `).bind(userId).all()

    if (!results || results.length === 0) {
      return c.json({
        success: false,
        error: 'user_not_found',
        message: 'المستخدم غير موجود'
      }, 404)
    }

    const user = results[0]

    // Get usage statistics
    const { results: usageStats } = await DB.prepare(
      'SELECT feature, COUNT(*) as count, SUM(api_calls) as total_calls FROM usage_logs WHERE user_id = ? GROUP BY feature'
    ).bind(userId).all()

    // Get admin actions for this user
    const { results: adminActions } = await DB.prepare(
      'SELECT * FROM admin_actions WHERE target_user_id = ? ORDER BY created_at DESC LIMIT 10'
    ).bind(userId).all()

    return c.json({
      success: true,
      data: {
        user,
        usage_stats: usageStats,
        admin_actions: adminActions
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    return c.json({
      success: false,
      error: 'get_user_error',
      message: 'خطأ في تحميل بيانات المستخدم'
    }, 500)
  }
})

/**
 * POST /api/admin/users/:id/activate
 * Activate user and create subscription (TELEGRAM ACTIVATION)
 */
admin.post('/users/:id/activate', async (c) => {
  try {
    const { DB } = c.env
    const userId = parseInt(c.req.param('id'))
    const adminId = c.get('userId')
    const body = await c.req.json()
    
    const {
      plan = 'free',
      duration_days = 30,
      perplexity_api_key,
      notes
    } = body

    // Validate plan
    if (!['free', 'basic', 'pro', 'enterprise'].includes(plan)) {
      return c.json({
        success: false,
        error: 'invalid_plan',
        message: 'باقة غير صالحة'
      }, 400)
    }

    // Check if user exists
    const { results: userResults } = await DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).all()

    if (!userResults || userResults.length === 0) {
      return c.json({
        success: false,
        error: 'user_not_found',
        message: 'المستخدم غير موجود'
      }, 404)
    }

    const user = userResults[0] as User

    // Activate user
    await DB.prepare(
      'UPDATE users SET is_active = 1, is_verified = 1, perplexity_api_key = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(perplexity_api_key || null, userId).run()

    // Get subscription details
    const limits = getSubscriptionLimits(plan as any)
    const features = getSubscriptionFeatures(plan as any)
    const prices = { free: 0, basic: 299, pro: 599, enterprise: 1499 }
    const price = prices[plan as keyof typeof prices]

    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + duration_days * 24 * 60 * 60 * 1000)

    // Create or update subscription
    const { results: existingSub } = await DB.prepare(
      'SELECT * FROM subscriptions WHERE user_id = ?'
    ).bind(userId).all()

    if (existingSub && existingSub.length > 0) {
      // Update existing subscription
      await DB.prepare(`
        UPDATE subscriptions 
        SET plan = ?, status = 'active', features = ?, limits = ?, price = ?,
            activated_by = ?, activation_method = 'manual', start_date = ?, end_date = ?,
            notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).bind(
        plan,
        JSON.stringify(features),
        JSON.stringify(limits),
        price,
        adminId,
        startDate.toISOString(),
        endDate.toISOString(),
        notes || 'Activated via admin panel',
        userId
      ).run()
    } else {
      // Create new subscription
      await DB.prepare(`
        INSERT INTO subscriptions (user_id, plan, status, features, limits, price, activated_by, activation_method, start_date, end_date, notes)
        VALUES (?, ?, 'active', ?, ?, ?, ?, 'manual', ?, ?, ?)
      `).bind(
        userId,
        plan,
        JSON.stringify(features),
        JSON.stringify(limits),
        price,
        adminId,
        startDate.toISOString(),
        endDate.toISOString(),
        notes || 'Activated via admin panel'
      ).run()
    }

    // Log admin action
    await DB.prepare(
      'INSERT INTO admin_actions (admin_id, action_type, target_user_id, details) VALUES (?, ?, ?, ?)'
    ).bind(
      adminId,
      'activate_user',
      userId,
      JSON.stringify({ plan, duration_days, has_perplexity_key: !!perplexity_api_key })
    ).run()

    return c.json({
      success: true,
      message: `تم تفعيل المستخدم ${user.name} بنجاح`,
      data: {
        user_id: userId,
        plan,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        features,
        limits
      }
    })
  } catch (error) {
    console.error('Activate user error:', error)
    return c.json({
      success: false,
      error: 'activation_error',
      message: 'خطأ في تفعيل المستخدم'
    }, 500)
  }
})

/**
 * POST /api/admin/users/:id/deactivate
 * Deactivate user
 */
admin.post('/users/:id/deactivate', async (c) => {
  try {
    const { DB } = c.env
    const userId = parseInt(c.req.param('id'))
    const adminId = c.get('userId')
    const { reason } = await c.req.json()

    await DB.prepare(
      'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(userId).run()

    await DB.prepare(
      'UPDATE subscriptions SET status = "inactive", updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).bind(userId).run()

    // Log admin action
    await DB.prepare(
      'INSERT INTO admin_actions (admin_id, action_type, target_user_id, details) VALUES (?, ?, ?, ?)'
    ).bind(
      adminId,
      'deactivate_user',
      userId,
      JSON.stringify({ reason })
    ).run()

    return c.json({
      success: true,
      message: 'تم إلغاء تفعيل المستخدم بنجاح'
    })
  } catch (error) {
    console.error('Deactivate user error:', error)
    return c.json({
      success: false,
      error: 'deactivation_error',
      message: 'خطأ في إلغاء تفعيل المستخدم'
    }, 500)
  }
})

/**
 * PUT /api/admin/users/:id/perplexity-key
 * Update user's Perplexity API key
 */
admin.put('/users/:id/perplexity-key', async (c) => {
  try {
    const { DB } = c.env
    const userId = parseInt(c.req.param('id'))
    const adminId = c.get('userId')
    const { api_key } = await c.req.json()

    if (!api_key) {
      return c.json({
        success: false,
        error: 'missing_api_key',
        message: 'مفتاح API مطلوب'
      }, 400)
    }

    await DB.prepare(
      'UPDATE users SET perplexity_api_key = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(api_key, userId).run()

    // Log admin action
    await DB.prepare(
      'INSERT INTO admin_actions (admin_id, action_type, target_user_id, details) VALUES (?, ?, ?, ?)'
    ).bind(
      adminId,
      'update_perplexity_key',
      userId,
      JSON.stringify({ key_prefix: api_key.substring(0, 10) + '...' })
    ).run()

    return c.json({
      success: true,
      message: 'تم تحديث مفتاح Perplexity بنجاح'
    })
  } catch (error) {
    console.error('Update Perplexity key error:', error)
    return c.json({
      success: false,
      error: 'update_key_error',
      message: 'خطأ في تحديث المفتاح'
    }, 500)
  }
})

/**
 * POST /api/admin/users/:id/regenerate-api-key
 * Regenerate user's API key
 */
admin.post('/users/:id/regenerate-api-key', async (c) => {
  try {
    const { DB } = c.env
    const userId = parseInt(c.req.param('id'))
    const adminId = c.get('userId')

    const newApiKey = await generateApiKey()

    await DB.prepare(
      'UPDATE users SET api_key = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(newApiKey, userId).run()

    // Log admin action
    await DB.prepare(
      'INSERT INTO admin_actions (admin_id, action_type, target_user_id, details) VALUES (?, ?, ?, ?)'
    ).bind(
      adminId,
      'regenerate_api_key',
      userId,
      JSON.stringify({ new_key_prefix: newApiKey.substring(0, 15) + '...' })
    ).run()

    return c.json({
      success: true,
      message: 'تم إنشاء مفتاح API جديد بنجاح',
      data: {
        api_key: newApiKey
      }
    })
  } catch (error) {
    console.error('Regenerate API key error:', error)
    return c.json({
      success: false,
      error: 'regenerate_key_error',
      message: 'خطأ في إنشاء مفتاح جديد'
    }, 500)
  }
})

/**
 * PUT /api/admin/users/:id/subscription
 * Update user's subscription plan
 */
admin.put('/users/:id/subscription', async (c) => {
  try {
    const { DB } = c.env
    const userId = parseInt(c.req.param('id'))
    const adminId = c.get('userId')
    const { plan, duration_days, notes } = await c.req.json()

    if (!['free', 'basic', 'pro', 'enterprise'].includes(plan)) {
      return c.json({
        success: false,
        error: 'invalid_plan',
        message: 'باقة غير صالحة'
      }, 400)
    }

    const limits = getSubscriptionLimits(plan)
    const features = getSubscriptionFeatures(plan)
    const prices = { free: 0, basic: 299, pro: 599, enterprise: 1499 }
    const price = prices[plan as keyof typeof prices]

    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + (duration_days || 30) * 24 * 60 * 60 * 1000)

    await DB.prepare(`
      UPDATE subscriptions 
      SET plan = ?, features = ?, limits = ?, price = ?, 
          start_date = ?, end_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(
      plan,
      JSON.stringify(features),
      JSON.stringify(limits),
      price,
      startDate.toISOString(),
      endDate.toISOString(),
      notes || null,
      userId
    ).run()

    // Log admin action
    await DB.prepare(
      'INSERT INTO admin_actions (admin_id, action_type, target_user_id, details) VALUES (?, ?, ?, ?)'
    ).bind(
      adminId,
      'change_subscription_plan',
      userId,
      JSON.stringify({ new_plan: plan, duration_days })
    ).run()

    return c.json({
      success: true,
      message: 'تم تحديث الاشتراك بنجاح',
      data: {
        plan,
        end_date: endDate.toISOString(),
        features,
        limits
      }
    })
  } catch (error) {
    console.error('Update subscription error:', error)
    return c.json({
      success: false,
      error: 'update_subscription_error',
      message: 'خطأ في تحديث الاشتراك'
    }, 500)
  }
})

/**
 * GET /api/admin/actions
 * Get admin actions log
 */
admin.get('/actions', async (c) => {
  try {
    const { DB } = c.env
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = (page - 1) * limit

    const { results: actions } = await DB.prepare(`
      SELECT 
        a.*,
        u1.name as admin_name,
        u2.name as target_user_name
      FROM admin_actions a
      LEFT JOIN users u1 ON a.admin_id = u1.id
      LEFT JOIN users u2 ON a.target_user_id = u2.id
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all()

    const totalCount = await DB.prepare('SELECT COUNT(*) as count FROM admin_actions').first() as any

    return c.json({
      success: true,
      data: {
        actions,
        pagination: {
          page,
          limit,
          total: totalCount.count,
          total_pages: Math.ceil(totalCount.count / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get admin actions error:', error)
    return c.json({
      success: false,
      error: 'get_actions_error',
      message: 'خطأ في تحميل سجل الإجراءات'
    }, 500)
  }
})

/**
 * GET /api/admin/settings
 * Get system settings
 */
admin.get('/settings', async (c) => {
  try {
    const { DB } = c.env

    const { results: settings } = await DB.prepare(
      'SELECT * FROM system_settings'
    ).all()

    const settingsObj: Record<string, any> = {}
    settings?.forEach((setting: any) => {
      settingsObj[setting.key] = setting.value
    })

    return c.json({
      success: true,
      data: settingsObj
    })
  } catch (error) {
    console.error('Get settings error:', error)
    return c.json({
      success: false,
      error: 'get_settings_error',
      message: 'خطأ في تحميل الإعدادات'
    }, 500)
  }
})

/**
 * PUT /api/admin/settings
 * Update system settings
 */
admin.put('/settings', async (c) => {
  try {
    const { DB } = c.env
    const settings = await c.req.json()

    for (const [key, value] of Object.entries(settings)) {
      await DB.prepare(
        'INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
      ).bind(key, value).run()
    }

    return c.json({
      success: true,
      message: 'تم تحديث الإعدادات بنجاح'
    })
  } catch (error) {
    console.error('Update settings error:', error)
    return c.json({
      success: false,
      error: 'update_settings_error',
      message: 'خطأ في تحديث الإعدادات'
    }, 500)
    }
})

export default admin
