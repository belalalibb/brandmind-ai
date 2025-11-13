// BrandMind AI - Authentication Routes

import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { 
  generateToken, 
  generateRefreshToken, 
  verifyToken,
  hashPassword, 
  verifyPassword,
  generateApiKey,
  isValidEmail,
  isStrongPassword,
  getSubscriptionLimits,
  getSubscriptionFeatures
} from '../utils/auth'
import type { Bindings, User } from '../types'

const auth = new Hono<{ Bindings: Bindings }>()

/**
 * POST /api/auth/register
 * Register new user
 */
auth.post('/register', async (c) => {
  try {
    const { DB, KV } = c.env
    const { email, password, name, phone, telegram_username } = await c.req.json()

    // Validation
    if (!email || !password || !name) {
      return c.json({
        success: false,
        error: 'missing_fields',
        message: 'البريد الإلكتروني وكلمة المرور والاسم مطلوبة'
      }, 400)
    }

    if (!isValidEmail(email)) {
      return c.json({
        success: false,
        error: 'invalid_email',
        message: 'البريد الإلكتروني غير صالح'
      }, 400)
    }

    const passwordCheck = isStrongPassword(password)
    if (!passwordCheck.valid) {
      return c.json({
        success: false,
        error: 'weak_password',
        message: passwordCheck.message
      }, 400)
    }

    // Check if email already exists
    const { results: existingUsers } = await DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).all()

    if (existingUsers && existingUsers.length > 0) {
      return c.json({
        success: false,
        error: 'email_exists',
        message: 'البريد الإلكتروني مسجل مسبقاً'
      }, 409)
    }

    // Hash password and generate API key
    const passwordHash = await hashPassword(password)
    const apiKey = await generateApiKey()

    // Create user (inactive by default - requires admin activation)
    const userResult = await DB.prepare(`
      INSERT INTO users (email, password_hash, name, phone, telegram_username, role, is_active, is_verified, api_key)
      VALUES (?, ?, ?, ?, ?, 'user', 0, 0, ?)
    `).bind(email, passwordHash, name, phone || null, telegram_username || null, apiKey).run()

    const userId = userResult.meta.last_row_id

    // Create free subscription (inactive until admin activates)
    const limits = getSubscriptionLimits('free')
    const features = getSubscriptionFeatures('free')

    await DB.prepare(`
      INSERT INTO subscriptions (user_id, plan, status, features, limits, price)
      VALUES (?, 'free', 'inactive', ?, ?, 0)
    `).bind(userId, JSON.stringify(features), JSON.stringify(limits)).run()

    return c.json({
      success: true,
      message: 'تم التسجيل بنجاح! يرجى انتظار تفعيل حسابك من قبل الإدارة. يمكنك التواصل عبر Telegram لتفعيل الحساب.',
      data: {
        user_id: userId,
        email,
        name,
        telegram_username,
        status: 'pending_activation',
        activation_instructions: 'للتفعيل الفوري، تواصل معنا عبر Telegram وأرسل بريدك الإلكتروني'
      }
    }, 201)
  } catch (error) {
    console.error('Register error:', error)
    return c.json({
      success: false,
      error: 'registration_error',
      message: 'خطأ في التسجيل'
    }, 500)
  }
})

/**
 * POST /api/auth/login
 * User login
 */
auth.post('/login', async (c) => {
  try {
    const { DB, KV } = c.env
    const { email, password } = await c.req.json()

    if (!email || !password) {
      return c.json({
        success: false,
        error: 'missing_credentials',
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان'
      }, 400)
    }

    // Find user
    const { results } = await DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).all()

    if (!results || results.length === 0) {
      return c.json({
        success: false,
        error: 'invalid_credentials',
        message: 'بيانات الدخول غير صحيحة'
      }, 401)
    }

    const user = results[0] as User

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return c.json({
        success: false,
        error: 'invalid_credentials',
        message: 'بيانات الدخول غير صحيحة'
      }, 401)
    }

    // Check if user is active
    if (!user.is_active) {
      return c.json({
        success: false,
        error: 'account_inactive',
        message: 'حسابك غير مفعل. يرجى التواصل مع الإدارة عبر Telegram للتفعيل',
        telegram_activation: true
      }, 403)
    }

    // Get active subscription
    const { results: subResults } = await DB.prepare(
      'SELECT * FROM subscriptions WHERE user_id = ? AND status = "active" ORDER BY created_at DESC LIMIT 1'
    ).bind(user.id).all()

    const subscription = subResults && subResults.length > 0 ? subResults[0] as any : null
    const plan = subscription ? subscription.plan : 'free'

    // Generate tokens
    const accessToken = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      plan
    })

    const refreshToken = await generateRefreshToken(user.id)

    // Store refresh token in KV
    await KV.put(`refresh_token:${user.id}`, refreshToken, {
      expirationTtl: 2592000 // 30 days
    })

    // Update last login
    await DB.prepare(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(user.id).run()

    return c.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          telegram_username: user.telegram_username
        },
        subscription: subscription ? {
          plan: subscription.plan,
          status: subscription.status,
          end_date: subscription.end_date,
          features: JSON.parse(subscription.features || '[]'),
          limits: JSON.parse(subscription.limits || '{}')
        } : null,
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: 'Bearer',
          expires_in: 3600
        },
        api_key: user.api_key
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({
      success: false,
      error: 'login_error',
      message: 'خطأ في تسجيل الدخول'
    }, 500)
  }
})

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
auth.post('/refresh', async (c) => {
  try {
    const { DB, KV } = c.env
    const { refresh_token } = await c.req.json()

    if (!refresh_token) {
      return c.json({
        success: false,
        error: 'missing_token',
        message: 'رمز التحديث مطلوب'
      }, 400)
    }

    // Extract user ID from refresh token
    const parts = refresh_token.split('_')
    if (parts.length < 3 || parts[0] !== 'rt') {
      return c.json({
        success: false,
        error: 'invalid_token',
        message: 'رمز تحديث غير صالح'
      }, 401)
    }

    const userId = parseInt(parts[1])

    // Verify refresh token in KV
    const storedToken = await KV.get(`refresh_token:${userId}`)
    if (storedToken !== refresh_token) {
      return c.json({
        success: false,
        error: 'invalid_token',
        message: 'رمز تحديث غير صالح'
      }, 401)
    }

    // Get user and subscription
    const { results } = await DB.prepare(
      'SELECT * FROM users WHERE id = ? AND is_active = 1'
    ).bind(userId).all()

    if (!results || results.length === 0) {
      return c.json({
        success: false,
        error: 'user_not_found',
        message: 'المستخدم غير موجود'
      }, 401)
    }

    const user = results[0] as User

    const { results: subResults } = await DB.prepare(
      'SELECT * FROM subscriptions WHERE user_id = ? AND status = "active" ORDER BY created_at DESC LIMIT 1'
    ).bind(user.id).all()

    const subscription = subResults && subResults.length > 0 ? subResults[0] as any : null
    const plan = subscription ? subscription.plan : 'free'

    // Generate new tokens
    const newAccessToken = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      plan
    })

    const newRefreshToken = await generateRefreshToken(user.id)

    // Update refresh token in KV
    await KV.put(`refresh_token:${userId}`, newRefreshToken, {
      expirationTtl: 2592000 // 30 days
    })

    return c.json({
      success: true,
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        token_type: 'Bearer',
        expires_in: 3600
      }
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    return c.json({
      success: false,
      error: 'refresh_error',
      message: 'خطأ في تحديث الرمز'
    }, 500)
  }
})

/**
 * POST /api/auth/logout
 * Logout user
 */
auth.post('/logout', authMiddleware, async (c) => {
  try {
    const { KV } = c.env
    const userId = c.get('userId')

    // Remove refresh token from KV
    await KV.delete(`refresh_token:${userId}`)

    return c.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return c.json({
      success: false,
      error: 'logout_error',
      message: 'خطأ في تسجيل الخروج'
    }, 500)
  }
})

/**
 * GET /api/auth/me
 * Get current user info
 */
auth.get('/me', authMiddleware, async (c) => {
  try {
    const { DB } = c.env
    const userId = c.get('userId')

    const { results } = await DB.prepare(`
      SELECT 
        u.*,
        s.plan,
        s.status as subscription_status,
        s.end_date,
        s.features,
        s.limits
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      WHERE u.id = ?
    `).bind(userId).all()

    if (!results || results.length === 0) {
      return c.json({
        success: false,
        error: 'user_not_found',
        message: 'المستخدم غير موجود'
      }, 404)
    }

    const userData = results[0] as any

    return c.json({
      success: true,
      data: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        telegram_username: userData.telegram_username,
        role: userData.role,
        is_active: userData.is_active,
        is_verified: userData.is_verified,
        api_key: userData.api_key,
        has_perplexity_key: !!userData.perplexity_api_key,
        subscription: userData.plan ? {
          plan: userData.plan,
          status: userData.subscription_status,
          end_date: userData.end_date,
          features: JSON.parse(userData.features || '[]'),
          limits: JSON.parse(userData.limits || '{}')
        } : null,
        created_at: userData.created_at,
        last_login: userData.last_login
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
 * PUT /api/auth/change-password
 * Change password
 */
auth.put('/change-password', authMiddleware, async (c) => {
  try {
    const { DB } = c.env
    const userId = c.get('userId')
    const { current_password, new_password } = await c.req.json()

    if (!current_password || !new_password) {
      return c.json({
        success: false,
        error: 'missing_fields',
        message: 'كلمة المرور الحالية والجديدة مطلوبة'
      }, 400)
    }

    // Validate new password
    const passwordCheck = isStrongPassword(new_password)
    if (!passwordCheck.valid) {
      return c.json({
        success: false,
        error: 'weak_password',
        message: passwordCheck.message
      }, 400)
    }

    // Get user
    const { results } = await DB.prepare(
      'SELECT password_hash FROM users WHERE id = ?'
    ).bind(userId).all()

    if (!results || results.length === 0) {
      return c.json({
        success: false,
        error: 'user_not_found',
        message: 'المستخدم غير موجود'
      }, 404)
    }

    const user = results[0] as any

    // Verify current password
    const isValid = await verifyPassword(current_password, user.password_hash)
    if (!isValid) {
      return c.json({
        success: false,
        error: 'invalid_password',
        message: 'كلمة المرور الحالية غير صحيحة'
      }, 401)
    }

    // Hash new password and update
    const newPasswordHash = await hashPassword(new_password)
    await DB.prepare(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(newPasswordHash, userId).run()

    return c.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    })
  } catch (error) {
    console.error('Change password error:', error)
    return c.json({
      success: false,
      error: 'change_password_error',
      message: 'خطأ في تغيير كلمة المرور'
    }, 500)
  }
})

/**
 * POST /api/auth/regenerate-api-key
 * Regenerate API key for current user
 */
auth.post('/regenerate-api-key', authMiddleware, async (c) => {
  try {
    const { DB } = c.env
    const userId = c.get('userId')

    const newApiKey = await generateApiKey()

    await DB.prepare(
      'UPDATE users SET api_key = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(newApiKey, userId).run()

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

export default auth
