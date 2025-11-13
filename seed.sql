-- BrandMind AI - Seed Data
-- Test data for development

-- Create admin user (password: Admin@123)
INSERT OR IGNORE INTO users (id, email, password_hash, name, role, is_active, is_verified, api_key, perplexity_api_key) VALUES 
  (1, 'admin@brandmind.ai', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Super Admin', 'superadmin', 1, 1, 'bm_live_superadmin_key_123456', 'pplx-admin-key-here');

-- Create test users
INSERT OR IGNORE INTO users (id, email, password_hash, name, telegram_username, role, is_active, is_verified, api_key) VALUES 
  (2, 'user1@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Ahmed Mohammed', '@ahmed_mohammed', 'user', 1, 1, 'bm_live_test_key_001'),
  (3, 'user2@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Sarah Ali', '@sarah_ali', 'user', 0, 1, 'bm_live_test_key_002'),
  (4, 'user3@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Khaled Hassan', '@khaled_h', 'user', 1, 1, 'bm_live_test_key_003');

-- Create subscriptions
INSERT OR IGNORE INTO subscriptions (user_id, plan, status, features, limits, price, activated_by, activation_method, start_date, end_date, notes) VALUES 
  (2, 'pro', 'active', '["content_generation","ai_chat","social_scheduling","analytics","smart_replies","ad_generator","trend_scanner","pdf_reports"]', '{"max_posts":500,"max_accounts":10,"api_calls_per_day":1000}', 599, 1, 'manual', datetime('now'), datetime('now', '+30 days'), 'Activated via Telegram - Premium customer'),
  (3, 'free', 'inactive', '["content_generation","ai_chat"]', '{"max_posts":10,"max_accounts":1,"api_calls_per_day":50}', 0, NULL, 'manual', NULL, NULL, 'Waiting for activation'),
  (4, 'basic', 'active', '["content_generation","ai_chat","social_scheduling"]', '{"max_posts":50,"max_accounts":3,"api_calls_per_day":200}', 299, 1, 'telegram', datetime('now'), datetime('now', '+30 days'), 'Telegram activation');

-- Create business profiles
INSERT OR IGNORE INTO business_profiles (user_id, business_name, business_type, description, target_audience, brand_voice) VALUES 
  (2, 'مطعم الذوق الرفيع', 'restaurant', 'مطعم عربي فاخر متخصص في المأكولات التقليدية', '["families","food_lovers","tourists"]', 'professional'),
  (4, 'عيادة النور الطبية', 'clinic', 'عيادة طبية متخصصة في طب الأسنان والتجميل', '["adults","health_conscious"]', 'professional');

-- Create social accounts
INSERT OR IGNORE INTO social_accounts (user_id, business_id, platform, account_name, is_connected) VALUES 
  (2, 1, 'instagram', '@althoq_restaurant', 1),
  (2, 1, 'facebook', 'Althoq Restaurant', 1),
  (4, 2, 'instagram', '@noor_clinic', 1);

-- Create sample content posts
INSERT OR IGNORE INTO content_posts (user_id, business_id, title, content, content_type, hashtags, status, ai_generated) VALUES 
  (2, 1, 'عرض اليوم الخاص', 'استمتع بعرضنا الخاص اليوم! خصم 20% على جميع الأطباق الرئيسية 🍽️\n\nاحجز طاولتك الآن!', 'image', '["مطاعم","طعام_عربي","عروض"]', 'published', 1),
  (2, 1, 'قائمة رمضان', 'قائمة رمضان الخاصة متاحة الآن! 🌙\nتذوق أشهى الأطباق الرمضانية', 'text', '["رمضان","إفطار","مطاعم"]', 'draft', 1),
  (4, 2, 'نصائح صحية', '5 نصائح للحفاظ على صحة أسنانك:\n1. فرش أسنانك مرتين يومياً\n2. استخدم الخيط الطبي\n3. قلل السكريات\n4. زر طبيب الأسنان دورياً\n5. اشرب الماء بكثرة', 'text', '["صحة","أسنان","نصائح"]', 'scheduled', 1);

-- Create chat conversations
INSERT OR IGNORE INTO chat_conversations (user_id, business_id, title) VALUES 
  (2, 1, 'استراتيجية محتوى رمضان'),
  (4, 2, 'أفكار حملات إعلانية');

-- Create chat messages
INSERT OR IGNORE INTO chat_messages (conversation_id, role, content) VALUES 
  (1, 'user', 'ساعدني في إنشاء استراتيجية محتوى لشهر رمضان'),
  (1, 'assistant', 'بالتأكيد! سأساعدك في إنشاء استراتيجية محتوى متكاملة لشهر رمضان...');
