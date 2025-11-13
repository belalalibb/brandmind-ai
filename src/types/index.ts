// BrandMind AI - Type Definitions

export type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

export type UserRole = 'user' | 'admin' | 'superadmin'

export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise'

export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'expired'

export interface User {
  id: number
  email: string
  password_hash: string
  name: string
  phone?: string
  telegram_username?: string
  role: UserRole
  is_active: boolean
  is_verified: boolean
  api_key: string
  perplexity_api_key?: string
  last_login?: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: number
  user_id: number
  plan: SubscriptionPlan
  status: SubscriptionStatus
  features: string[] // JSON parsed
  limits: SubscriptionLimits
  price: number
  billing_cycle: 'monthly' | 'yearly'
  activated_by?: number
  activation_method: 'manual' | 'telegram' | 'payment'
  start_date?: string
  end_date?: string
  next_billing_date?: string
  auto_renew: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface SubscriptionLimits {
  max_posts: number // -1 for unlimited
  max_accounts: number // -1 for unlimited
  api_calls_per_day: number
  ai_generations_per_day?: number
  storage_mb?: number
}

export interface JWTPayload {
  userId: number
  email: string
  role: UserRole
  plan: SubscriptionPlan
  iat: number
  exp: number
}

export interface BusinessProfile {
  id: number
  user_id: number
  business_name: string
  business_type: string
  industry?: string
  description?: string
  logo_url?: string
  website?: string
  address?: string
  city?: string
  country: string
  target_audience?: string[] // JSON parsed
  brand_voice?: string
  keywords?: string[] // JSON parsed
  settings?: Record<string, any> // JSON parsed
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SocialAccount {
  id: number
  user_id: number
  business_id?: number
  platform: 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'linkedin' | 'youtube' | 'snapchat'
  account_name: string
  account_id?: string
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
  page_id?: string
  is_connected: boolean
  last_synced?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ContentPost {
  id: number
  user_id: number
  business_id?: number
  title?: string
  content: string
  content_type: 'text' | 'image' | 'video' | 'carousel' | 'story'
  media_urls?: string[] // JSON parsed
  hashtags?: string[] // JSON parsed
  mentions?: string[] // JSON parsed
  call_to_action?: string
  target_platforms?: string[] // JSON parsed
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  scheduled_time?: string
  published_at?: string
  ai_generated: boolean
  ai_model?: string
  tone?: string
  language: string
  performance_data?: Record<string, any>
  notes?: string
  created_at: string
  updated_at: string
}

export interface ChatConversation {
  id: number
  user_id: number
  business_id?: number
  title: string
  context?: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: number
  conversation_id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens_used: number
  model?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface UsageLog {
  id: number
  user_id: number
  subscription_id?: number
  feature: string
  action: string
  api_calls: number
  tokens_used: number
  cost: number
  metadata?: Record<string, any>
  created_at: string
}

export interface AdminAction {
  id: number
  admin_id: number
  action_type: string
  target_user_id?: number
  details?: Record<string, any>
  ip_address?: string
  created_at: string
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
  signature?: string
}
