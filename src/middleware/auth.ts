// BrandMind AI - Authentication & Authorization Middleware

import { Context, Next } from 'hono'
import { verifyToken, hasFeatureAccess } from '../utils/auth'
import type { Bindings, UserRole, User } from '../types'

/**
 * Extend Context with user data
 */
declare module 'hono' {
  interface ContextVariableMap {
    user: User
    userId: number
    userRole: UserRole
    userPlan: string
  }
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token and loads user data
 */
export async function authMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
  try {
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({
        success: false,
        error: 'missing_token',
        message: 'رمز المصادقة مطلوب'
      }, 401)
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token)

    if (!payload) {
      return c.json({
        success: false,
        error: 'invalid_token',
        message: 'رمز مصادقة غير صالح أو منتهي الصلاحية'
      }, 401)
    }

    // Load full user data from database
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ? AND is_active = 1'
    ).bind(payload.userId).all()

    if (!results || results.length === 0) {
      return c.json({
        success: false,
        error: 'user_not_found',
        message: 'المستخدم غير موجود أو غير نشط'
      }, 401)
    }

    const user = results[0] as User

    // Store user data in context
    c.set('user', user)
    c.set('userId', user.id)
    c.set('userRole', user.role)
    c.set('userPlan', payload.plan)

    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return c.json({
      success: false,
      error: 'auth_error',
      message: 'خطأ في المصادقة'
    }, 500)
  }
}

/**
 * Optional Authentication Middleware
 * Loads user data if token provided, but doesn't fail if missing
 */
export async function optionalAuthMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
  try {
    const authHeader = c.req.header('Authorization')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const payload = await verifyToken(token)

      if (payload) {
        const { results } = await c.env.DB.prepare(
          'SELECT * FROM users WHERE id = ? AND is_active = 1'
        ).bind(payload.userId).all()

        if (results && results.length > 0) {
          const user = results[0] as User
          c.set('user', user)
          c.set('userId', user.id)
          c.set('userRole', user.role)
          c.set('userPlan', payload.plan)
        }
      }
    }

    await next()
  } catch (error) {
    // Silently fail for optional auth
    await next()
  }
}

/**
 * Role-based Access Control Middleware
 */
export function requireRole(requiredRole: UserRole | UserRole[]) {
  return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    const userRole = c.get('userRole')

    if (!userRole) {
      return c.json({
        success: false,
        error: 'unauthorized',
        message: 'غير مصرح لك بالوصول'
      }, 403)
    }

    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    
    // Superadmin has access to everything
    if (userRole === 'superadmin') {
      await next()
      return
    }

    // Admin has access to admin and user routes
    if (userRole === 'admin' && (allowedRoles.includes('admin') || allowedRoles.includes('user'))) {
      await next()
      return
    }

    // Check if user role is in allowed roles
    if (allowedRoles.includes(userRole)) {
      await next()
      return
    }

    return c.json({
      success: false,
      error: 'forbidden',
      message: 'ليس لديك صلاحية للوصول إلى هذا المورد'
    }, 403)
  }
}

/**
 * Subscription Plan Requirement Middleware
 */
export function requireSubscription(requiredPlan: string | string[]) {
  return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    const userId = c.get('userId')

    if (!userId) {
      return c.json({
        success: false,
        error: 'unauthorized',
        message: 'مطلوب تسجيل الدخول'
      }, 401)
    }

    // Get user's active subscription
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM subscriptions WHERE user_id = ? AND status = "active" ORDER BY created_at DESC LIMIT 1'
    ).bind(userId).all()

    if (!results || results.length === 0) {
      return c.json({
        success: false,
        error: 'no_subscription',
        message: 'يجب تفعيل اشتراك لاستخدام هذه الميزة'
      }, 403)
    }

    const subscription = results[0] as any
    const allowedPlans = Array.isArray(requiredPlan) ? requiredPlan : [requiredPlan]

    // Check plan hierarchy: enterprise > pro > basic > free
    const planHierarchy: Record<string, number> = {
      free: 1,
      basic: 2,
      pro: 3,
      enterprise: 4
    }

    const userPlanLevel = planHierarchy[subscription.plan] || 0
    const requiredLevel = Math.min(...allowedPlans.map(p => planHierarchy[p] || 99))

    if (userPlanLevel >= requiredLevel) {
      await next()
      return
    }

    return c.json({
      success: false,
      error: 'upgrade_required',
      message: `هذه الميزة متاحة لباقة ${allowedPlans.join(' أو ')} وأعلى`,
      required_plan: allowedPlans
    }, 403)
  }
}

/**
 * Feature Access Middleware
 */
export function requireFeature(feature: string) {
  return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    const userId = c.get('userId')

    if (!userId) {
      return c.json({
        success: false,
        error: 'unauthorized',
        message: 'مطلوب تسجيل الدخول'
      }, 401)
    }

    // Get user's active subscription
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM subscriptions WHERE user_id = ? AND status = "active" ORDER BY created_at DESC LIMIT 1'
    ).bind(userId).all()

    if (!results || results.length === 0) {
      return c.json({
        success: false,
        error: 'no_subscription',
        message: 'يجب تفعيل اشتراك لاستخدام هذه الميزة'
      }, 403)
    }

    const subscription = results[0] as any
    const features = JSON.parse(subscription.features || '[]')

    if (hasFeatureAccess(features, feature)) {
      await next()
      return
    }

    return c.json({
      success: false,
      error: 'feature_not_available',
      message: `الميزة "${feature}" غير متاحة في باقتك الحالية`,
      current_plan: subscription.plan
    }, 403)
  }
}

/**
 * API Key Authentication Middleware
 */
export async function apiKeyMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
  try {
    const apiKey = c.req.header('X-API-Key')

    if (!apiKey) {
      return c.json({
        success: false,
        error: 'missing_api_key',
        message: 'مفتاح API مطلوب'
      }, 401)
    }

    // Verify API key
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM users WHERE api_key = ? AND is_active = 1'
    ).bind(apiKey).all()

    if (!results || results.length === 0) {
      return c.json({
        success: false,
        error: 'invalid_api_key',
        message: 'مفتاح API غير صالح'
      }, 401)
    }

    const user = results[0] as User
    c.set('user', user)
    c.set('userId', user.id)
    c.set('userRole', user.role)

    await next()
  } catch (error) {
    console.error('API key middleware error:', error)
    return c.json({
      success: false,
      error: 'api_key_error',
      message: 'خطأ في التحقق من مفتاح API'
    }, 500)
  }
}

/**
 * Rate Limiting Middleware (using KV)
 */
export async function rateLimitMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
  try {
    const userId = c.get('userId')
    
    if (!userId) {
      await next()
      return
    }

    // Get user's subscription for rate limits
    const { results } = await c.env.DB.prepare(
      'SELECT limits FROM subscriptions WHERE user_id = ? AND status = "active" ORDER BY created_at DESC LIMIT 1'
    ).bind(userId).all()

    let dailyLimit = 50 // Default for free tier

    if (results && results.length > 0) {
      const subscription = results[0] as any
      const limits = JSON.parse(subscription.limits || '{}')
      dailyLimit = limits.api_calls_per_day || 50
    }

    // Check current usage from KV
    const today = new Date().toISOString().split('T')[0]
    const rateLimitKey = `ratelimit:${userId}:${today}`
    
    const currentCount = await c.env.KV.get(rateLimitKey)
    const count = currentCount ? parseInt(currentCount) : 0

    if (count >= dailyLimit) {
      return c.json({
        success: false,
        error: 'rate_limit_exceeded',
        message: 'لقد تجاوزت الحد اليومي للطلبات',
        limit: dailyLimit,
        reset_at: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
      }, 429)
    }

    // Increment counter
    await c.env.KV.put(rateLimitKey, (count + 1).toString(), {
      expirationTtl: 86400 // 24 hours
    })

    // Add rate limit headers
    c.header('X-RateLimit-Limit', dailyLimit.toString())
    c.header('X-RateLimit-Remaining', (dailyLimit - count - 1).toString())
    c.header('X-RateLimit-Reset', new Date(new Date().setHours(24, 0, 0, 0)).toISOString())

    await next()
  } catch (error) {
    console.error('Rate limit middleware error:', error)
    // Don't block on error
    await next()
  }
}

/**
 * Security Headers Middleware
 */
export function securityHeadersMiddleware(c: Context, next: Next) {
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('X-XSS-Protection', '1; mode=block')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  return next()
}
