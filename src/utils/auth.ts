// BrandMind AI - Authentication Utilities

import type { JWTPayload, SubscriptionPlan } from '../types'

// JWT Configuration
const JWT_SECRET = 'brandmind-ai-secret-key-2024-change-in-production'
const JWT_EXPIRY = 3600 // 1 hour
const REFRESH_TOKEN_EXPIRY = 2592000 // 30 days

/**
 * Generate JWT Token using Web Crypto API (HMAC-SHA256)
 */
export async function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }

  const now = Math.floor(Date.now() / 1000)
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRY
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload))
  const data = `${encodedHeader}.${encodedPayload}`

  const signature = await signHMAC(data, JWT_SECRET)
  return `${data}.${signature}`
}

/**
 * Verify JWT Token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [header, payload, signature] = parts
    const data = `${header}.${payload}`
    
    const expectedSignature = await signHMAC(data, JWT_SECRET)
    if (signature !== expectedSignature) return null

    const decoded: JWTPayload = JSON.parse(base64UrlDecode(payload))
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (decoded.exp < now) return null

    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Generate Refresh Token (Random secure string)
 */
export async function generateRefreshToken(userId: number): Promise<string> {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32))
  const token = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return `rt_${userId}_${token}`
}

/**
 * Hash password using SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

/**
 * Generate API Key
 */
export async function generateApiKey(): Promise<string> {
  const randomBytes = crypto.getRandomValues(new Uint8Array(24))
  const key = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return `bm_live_${key}`
}

/**
 * Generate HMAC-SHA256 signature
 */
export async function signHMAC(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return base64UrlEncode(signature)
}

/**
 * Generate response signature for API security
 */
export async function generateResponseSignature(data: any): Promise<string> {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data)
  return await signHMAC(dataString, JWT_SECRET)
}

/**
 * Base64 URL encode
 */
function base64UrlEncode(data: string | ArrayBuffer): string {
  let base64: string
  
  if (typeof data === 'string') {
    base64 = btoa(data)
  } else {
    const bytes = new Uint8Array(data)
    const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('')
    base64 = btoa(binary)
  }
  
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Base64 URL decode
 */
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) {
    str += '='
  }
  return atob(str)
}

/**
 * Get subscription limits by plan
 */
export function getSubscriptionLimits(plan: SubscriptionPlan) {
  const limits = {
    free: {
      max_posts: 10,
      max_accounts: 1,
      api_calls_per_day: 50,
      ai_generations_per_day: 10,
      storage_mb: 100
    },
    basic: {
      max_posts: 50,
      max_accounts: 3,
      api_calls_per_day: 200,
      ai_generations_per_day: 50,
      storage_mb: 500
    },
    pro: {
      max_posts: 500,
      max_accounts: 10,
      api_calls_per_day: 1000,
      ai_generations_per_day: 200,
      storage_mb: 2000
    },
    enterprise: {
      max_posts: -1, // unlimited
      max_accounts: -1, // unlimited
      api_calls_per_day: 10000,
      ai_generations_per_day: -1, // unlimited
      storage_mb: 10000
    }
  }

  return limits[plan] || limits.free
}

/**
 * Get subscription features by plan
 */
export function getSubscriptionFeatures(plan: SubscriptionPlan): string[] {
  const features = {
    free: ['content_generation', 'ai_chat'],
    basic: ['content_generation', 'ai_chat', 'social_scheduling', 'basic_analytics'],
    pro: ['content_generation', 'ai_chat', 'social_scheduling', 'analytics', 'smart_replies', 'ad_generator', 'trend_scanner', 'pdf_reports'],
    enterprise: ['content_generation', 'ai_chat', 'social_scheduling', 'analytics', 'smart_replies', 'ad_generator', 'trend_scanner', 'pdf_reports', 'white_label', 'api_access', 'priority_support', 'custom_ai_models']
  }

  return features[plan] || features.free
}

/**
 * Check if user has feature access
 */
export function hasFeatureAccess(userFeatures: string[], feature: string): boolean {
  return userFeatures.includes(feature)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل' }
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل' }
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل' }
  }
  
  return { valid: true }
}

/**
 * Generate random password
 */
export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(values, v => charset[v % charset.length]).join('')
}
