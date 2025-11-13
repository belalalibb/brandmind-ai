-- BrandMind AI Database Schema
-- Complete Marketing Intelligence Platform

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  telegram_username TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
  is_active BOOLEAN DEFAULT 0, -- Manual activation by admin
  is_verified BOOLEAN DEFAULT 0,
  api_key TEXT UNIQUE,
  perplexity_api_key TEXT, -- Individual Perplexity key per user
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_api_key ON users(api_key);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================
-- SUBSCRIPTIONS & BILLING
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'basic', 'pro', 'enterprise')),
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
  features TEXT, -- JSON array of enabled features
  limits TEXT, -- JSON object with usage limits
  price REAL DEFAULT 0,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  activated_by INTEGER, -- Admin user ID who activated
  activation_method TEXT DEFAULT 'manual' CHECK (activation_method IN ('manual', 'telegram', 'payment')),
  start_date DATETIME,
  end_date DATETIME,
  next_billing_date DATETIME,
  auto_renew BOOLEAN DEFAULT 1,
  notes TEXT, -- Admin notes about activation
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (activated_by) REFERENCES users(id)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- ============================================
-- USAGE TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS usage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  subscription_id INTEGER,
  feature TEXT NOT NULL, -- 'content_generation', 'ai_chat', 'social_post', etc.
  action TEXT NOT NULL,
  api_calls INTEGER DEFAULT 1,
  tokens_used INTEGER DEFAULT 0,
  cost REAL DEFAULT 0,
  metadata TEXT, -- JSON with additional details
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_feature ON usage_logs(feature);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);

-- ============================================
-- BUSINESS PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS business_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL, -- 'restaurant', 'clinic', 'store', 'salon', etc.
  industry TEXT,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Saudi Arabia',
  target_audience TEXT, -- JSON array
  brand_voice TEXT, -- 'professional', 'casual', 'friendly', etc.
  keywords TEXT, -- JSON array for SEO
  settings TEXT, -- JSON object with preferences
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_business_profiles_business_type ON business_profiles(business_type);

-- ============================================
-- SOCIAL MEDIA ACCOUNTS
-- ============================================

CREATE TABLE IF NOT EXISTS social_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  business_id INTEGER,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'tiktok', 'linkedin', 'youtube', 'snapchat')),
  account_name TEXT NOT NULL,
  account_id TEXT, -- Platform-specific ID
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at DATETIME,
  page_id TEXT, -- For Facebook pages
  is_connected BOOLEAN DEFAULT 1,
  last_synced DATETIME,
  metadata TEXT, -- JSON with platform-specific data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES business_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_social_accounts_business_id ON social_accounts(business_id);

-- ============================================
-- CONTENT MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS content_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  business_id INTEGER,
  title TEXT,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'video', 'carousel', 'story')),
  media_urls TEXT, -- JSON array of media URLs
  hashtags TEXT, -- JSON array
  mentions TEXT, -- JSON array
  call_to_action TEXT,
  target_platforms TEXT, -- JSON array: ['facebook', 'instagram', etc.]
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  scheduled_time DATETIME,
  published_at DATETIME,
  ai_generated BOOLEAN DEFAULT 0,
  ai_model TEXT, -- 'perplexity', 'gpt-4', etc.
  tone TEXT, -- 'professional', 'casual', 'humorous', etc.
  language TEXT DEFAULT 'ar',
  performance_data TEXT, -- JSON with engagement metrics
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES business_profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_content_posts_user_id ON content_posts(user_id);
CREATE INDEX idx_content_posts_status ON content_posts(status);
CREATE INDEX idx_content_posts_scheduled_time ON content_posts(scheduled_time);
CREATE INDEX idx_content_posts_business_id ON content_posts(business_id);

-- ============================================
-- PUBLISHED POSTS (SOCIAL MEDIA)
-- ============================================

CREATE TABLE IF NOT EXISTS published_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_post_id INTEGER NOT NULL,
  social_account_id INTEGER NOT NULL,
  platform TEXT NOT NULL,
  platform_post_id TEXT, -- ID from the social platform
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed')),
  published_at DATETIME,
  error_message TEXT,
  engagement_data TEXT, -- JSON with likes, comments, shares, views
  last_synced DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_post_id) REFERENCES content_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (social_account_id) REFERENCES social_accounts(id) ON DELETE CASCADE
);

CREATE INDEX idx_published_posts_content_post_id ON published_posts(content_post_id);
CREATE INDEX idx_published_posts_social_account_id ON published_posts(social_account_id);
CREATE INDEX idx_published_posts_platform ON published_posts(platform);

-- ============================================
-- AI CHAT HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS chat_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  business_id INTEGER,
  title TEXT DEFAULT 'New Conversation',
  context TEXT, -- JSON with conversation context
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES business_profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  model TEXT, -- AI model used
  metadata TEXT, -- JSON with additional data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);

-- ============================================
-- ANALYTICS & REPORTS
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  business_id INTEGER,
  report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')),
  report_period TEXT NOT NULL, -- '2024-01', '2024-W01', etc.
  metrics TEXT NOT NULL, -- JSON with all metrics
  insights TEXT, -- AI-generated insights
  pdf_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES business_profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_analytics_reports_user_id ON analytics_reports(user_id);
CREATE INDEX idx_analytics_reports_report_period ON analytics_reports(report_period);

-- ============================================
-- ADMIN ACTIONS LOG
-- ============================================

CREATE TABLE IF NOT EXISTS admin_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  action_type TEXT NOT NULL, -- 'activate_user', 'assign_api_key', 'change_plan', etc.
  target_user_id INTEGER,
  details TEXT, -- JSON with action details
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id),
  FOREIGN KEY (target_user_id) REFERENCES users(id)
);

CREATE INDEX idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_target_user_id ON admin_actions(target_user_id);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at);

-- ============================================
-- SYSTEM SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT OR IGNORE INTO system_settings (key, value, description) VALUES
  ('master_perplexity_key', '', 'Master Perplexity API key for fallback'),
  ('telegram_bot_token', '', 'Telegram bot token for activation'),
  ('telegram_admin_chat_id', '', 'Admin Telegram chat ID for notifications'),
  ('default_plan', 'free', 'Default subscription plan for new users'),
  ('maintenance_mode', '0', 'System maintenance mode'),
  ('registration_enabled', '1', 'Allow new user registrations');
