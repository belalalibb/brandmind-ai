# BrandMind AI - منصة الذكاء التسويقي الشامل 🚀

<div dir="rtl">

> **أول منصة ذكاء تسويقي شامل بالعربية** - منافس Buffer و HubSpot للسوق العربي

</div>

## 🌟 نظرة عامة

BrandMind AI هي منصة تسويقية متكاملة بالذكاء الاصطناعي، مصممة خصيصاً للسوق العربي. توفر المنصة حلاً شاملاً لإدارة التسويق الرقمي، من إنشاء المحتوى إلى الجدولة والتحليلات.

**🔗 روابط مهمة:**
- **Live Demo**: https://3000-icb5pqhrr88qp0gucjfnp-0e616f0a.sandbox.novita.ai
- **GitHub Repository**: https://github.com/belalalibb/brandmind-ai
- **API Health Check**: https://3000-icb5pqhrr88qp0gucjfnp-0e616f0a.sandbox.novita.ai/api/health

---

## ✨ المميزات الرئيسية

### 🔐 نظام أمان متقدم (Enterprise-Grade Security)
- ✅ **JWT Authentication** مع Refresh Tokens
- ✅ **HMAC SHA-256** للتوقيع الرقمي على الاستجابات
- ✅ **API Keys** للتطبيقات الخارجية
- ✅ **Rate Limiting** ذكي حسب الباقة
- ✅ **RBAC** (Role-Based Access Control)
- ✅ **Session Management** مع Cloudflare KV
- ✅ **Password Hashing** باستخدام SHA-256

### 🎯 الوحدات الأساسية

#### 1. Business Profiler (ملف النشاط التجاري)
- إدارة ملفات الأنشطة التجارية
- دعم أنواع متعددة: مطاعم، عيادات، متاجر، صالونات، عطور
- تخصيص brand voice و target audience

#### 2. AI Content Generator (مولد المحتوى بالذكاء الاصطناعي)
- إنشاء محتوى تسويقي باستخدام **Perplexity AI**
- دعم منصات متعددة (Instagram, Facebook, Twitter, TikTok)
- أنماط محتوى متنوعة (text, image, video, carousel)
- توليد hashtags تلقائي

#### 3. Chat Assistant (مساعد الدردشة الذكي)
- مساعد AI مخصص لاستشارات التسويق
- ذاكرة محادثة context-aware
- دعم متعدد اللغات (عربي/إنجليزي)

#### 4. Smart Scheduler (جدولة ذكية)
- جدولة ونشر تلقائي للمحتوى
- دعم multiple social accounts
- تتبع حالة المنشورات

#### 5. Analytics Dashboard (تحليلات ذكية)
- تحليل engagement metrics
- تقارير PDF قابلة للتنزيل
- رؤى تسويقية بالذكاء الاصطناعي

#### 6. Admin Dashboard (لوحة تحكم الأدمن)
- **تفعيل يدوي للمستخدمين عبر Telegram**
- إدارة الاشتراكات والباقات
- تعيين مفاتيح Perplexity API لكل مستخدم
- تتبع Usage Logs
- سجل إجراءات الأدمن

---

## 🏗️ البنية التقنية

### Technology Stack

#### Backend
- **Framework**: Hono (Lightweight, Fast, Edge-first)
- **Runtime**: Cloudflare Workers (Edge Computing)
- **Database**: Cloudflare D1 (Distributed SQLite)
- **Cache/Sessions**: Cloudflare KV
- **AI Engine**: Perplexity AI API

#### Frontend
- **HTML5 + Tailwind CSS** (RTL Support)
- **Vanilla JavaScript** (No Framework Overhead)
- **Arabic First** (تصميم عربي كامل)

#### Security
- **JWT** with HMAC-SHA256 signing
- **Refresh Token** rotation
- **API Key** authentication
- **Rate Limiting** per subscription tier
- **CORS** configuration
- **Security Headers** (X-Frame-Options, CSP, etc.)

### Project Structure

```
brandmind-ai/
├── src/
│   ├── index.tsx              # Main application entry
│   ├── routes/
│   │   ├── auth.ts            # Authentication routes
│   │   ├── admin.ts           # Admin dashboard routes
│   │   ├── chat.ts            # AI chat routes
│   │   └── content.ts         # Content generation routes
│   ├── middleware/
│   │   └── auth.ts            # Auth & authorization middleware
│   ├── utils/
│   │   ├── auth.ts            # Auth utilities (JWT, hashing)
│   │   └── perplexity.ts      # Perplexity AI integration
│   └── types/
│       └── index.ts           # TypeScript types
├── migrations/
│   └── 0001_initial_schema.sql  # Database schema
├── public/                    # Static assets
├── dist/                      # Build output
├── wrangler.jsonc             # Cloudflare configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite build config
└── ecosystem.config.cjs       # PM2 configuration

```

---

## 🚀 التثبيت والتشغيل

### المتطلبات

- Node.js 18+ 
- npm أو yarn
- Perplexity API Key
- Cloudflare Account (for production deployment)

### 1. Clone & Install

```bash
git clone https://github.com/belalalibb/brandmind-ai.git
cd brandmind-ai
npm install --legacy-peer-deps
```

### 2. إعداد قاعدة البيانات المحلية

```bash
# تطبيق migrations
npm run db:migrate:local

# إضافة بيانات تجريبية
npm run db:seed
```

### 3. Build المشروع

```bash
npm run build
```

### 4. تشغيل محلي (Development)

```bash
# باستخدام PM2 (موصى به)
pm2 start ecosystem.config.cjs

# أو مباشرة
npm run dev:sandbox
```

### 5. اختبار التشغيل

```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "BrandMind AI is running",
  "version": "1.0.0",
  "timestamp": "2024-11-13T..."
}
```

---

## 📋 API Documentation

### Base URL
```
Development: http://localhost:3000/api
Production: https://brandmind-ai.pages.dev/api
```

### Authentication Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Core Endpoints

#### 🔐 Authentication

**POST /api/auth/register**
```json
{
  "email": "user@example.com",
  "password": "StrongPass@123",
  "name": "User Name",
  "telegram_username": "@username"
}
```

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "StrongPass@123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "email": "...", "name": "...", "role": "user" },
    "tokens": {
      "access_token": "eyJhbGc...",
      "refresh_token": "rt_1_abc...",
      "expires_in": 3600
    },
    "subscription": {
      "plan": "free",
      "status": "inactive"
    }
  }
}
```

#### 👑 Admin Routes (Requires Admin Role)

**POST /api/admin/users/:id/activate**
```json
{
  "plan": "pro",
  "duration_days": 30,
  "perplexity_api_key": "pplx-xxx",
  "notes": "Activated via Telegram"
}
```

**GET /api/admin/dashboard**
- إحصائيات شاملة
- عدد المستخدمين النشطين
- الاشتراكات الفعالة
- Pending activations

**GET /api/admin/users**
- قائمة المستخدمين مع pagination
- Filters: status, search
- عرض الاشتراكات

**PUT /api/admin/users/:id/perplexity-key**
```json
{
  "api_key": "pplx-new-key"
}
```

#### 💬 Chat Routes

**POST /api/chat/message**
```json
{
  "message": "ساعدني في إنشاء استراتيجية محتوى",
  "conversation_id": 1,
  "business_id": 1
}
```

**GET /api/chat/conversations**
- قائمة المحادثات

**GET /api/chat/conversations/:id/messages**
- رسائل محادثة محددة

#### ✨ Content Routes

**POST /api/content/generate/post**
```json
{
  "business_id": 1,
  "topic": "عرض خاص للعيد",
  "platform": "instagram",
  "tone": "friendly",
  "save_as_draft": true
}
```

**POST /api/content/generate/ad**
```json
{
  "business_id": 1,
  "product_service": "قهوة عربية فاخرة",
  "target_audience": "عشاق القهوة العربية",
  "goal": "زيادة المبيعات"
}
```

**POST /api/content/ideas**
```json
{
  "business_id": 1,
  "count": 10
}
```

---

## 💳 الباقات والأسعار

| الباقة | السعر الشهري | المنشورات | الحسابات | API Calls/Day | المميزات |
|--------|--------------|-----------|----------|---------------|----------|
| **مجاني** | 0 ر.س | 10 | 1 | 50 | محتوى AI، محادثات |
| **أساسي** | 299 ر.س | 50 | 3 | 200 | + جدولة، تحليلات أساسية |
| **احترافي** | 599 ر.س | غير محدود | 10 | 1,000 | + كل المميزات، تقارير PDF |
| **مؤسسات** | 1,499 ر.س | غير محدود | غير محدود | 10,000 | + API مخصص، دعم أولوية |

---

## 🔧 إعدادات الأدمن

### كيفية تفعيل المستخدمين عبر Telegram

1. **المستخدم يسجل** في المنصة ويضيف username Telegram
2. **المستخدم يراسل** البوت على Telegram مع بريده الإلكتروني
3. **الأدمن يدخل** لوحة التحكم `/api/admin/users`
4. **يبحث عن المستخدم** باستخدام البريد أو Telegram username
5. **ينقر "تفعيل"** ويختار:
   - الباقة (free, basic, pro, enterprise)
   - مدة الاشتراك (days)
   - مفتاح Perplexity API (اختياري)
6. **التفعيل الفوري** - المستخدم يمكنه تسجيل الدخول مباشرة

### إدارة مفاتيح Perplexity

#### خيارات API Keys:

1. **Master Key** (في system_settings):
   - مفتاح احتياطي لجميع المستخدمين
   - يستخدم إذا لم يكن للمستخدم مفتاح خاص

2. **User-Specific Keys**:
   - الأدمن يعين مفتاح لكل مستخدم
   - **Endpoint**: `PUT /api/admin/users/:id/perplexity-key`
   - يتيح control كامل على usage

3. **تعديل المفاتيح**:
   ```bash
   # من لوحة الأدمن
   PUT /api/admin/users/5/perplexity-key
   {
     "api_key": "pplx-new-key-here"
   }
   ```

---

## 🔒 الأمان

### مميزات الأمان المطبقة

1. **JWT Authentication**
   - HMAC-SHA256 signing
   - 1-hour expiry
   - Secure token storage

2. **Refresh Tokens**
   - 30-day validity
   - Stored in Cloudflare KV
   - Rotation on refresh

3. **Password Security**
   - SHA-256 hashing
   - Strong password requirements
   - Minimum 8 characters, mixed case, numbers

4. **API Key System**
   - Unique key per user
   - `bm_live_` prefix
   - Regeneration on demand

5. **Rate Limiting**
   - Per-subscription limits
   - KV-based counting
   - Daily reset

6. **RBAC (Role-Based Access)**
   - user, admin, superadmin roles
   - Middleware-enforced
   - Route-level protection

7. **Security Headers**
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - CSP, HSTS, etc.

---

## 📊 قاعدة البيانات

### Main Tables

- **users**: معلومات المستخدمين والأمان
- **subscriptions**: الاشتراكات والباقات
- **business_profiles**: ملفات الأنشطة التجارية
- **social_accounts**: حسابات السوشيال ميديا المربوطة
- **content_posts**: المحتوى المنشأ
- **chat_conversations & chat_messages**: محادثات AI
- **usage_logs**: تتبع الاستخدام
- **admin_actions**: سجل إجراءات الأدمن
- **system_settings**: إعدادات النظام

### بيانات تجريبية

بعد تشغيل `npm run db:seed`، ستحصل على:

**Admin User:**
- Email: `admin@brandmind.ai`
- Password: `Admin@123`
- Role: superadmin

**Test Users:**
- user1@example.com (Active, Pro plan)
- user2@example.com (Inactive, Free)
- user3@example.com (Active, Basic)

---

## 🌐 Deployment

### Cloudflare Pages (Production)

#### 1. إنشاء قواعد البيانات

```bash
# D1 Database
npx wrangler d1 create brandmind-production

# KV Namespace
npx wrangler kv:namespace create brandmind_KV
npx wrangler kv:namespace create brandmind_KV --preview
```

#### 2. تحديث wrangler.jsonc

```jsonc
{
  "d1_databases": [{
    "binding": "DB",
    "database_name": "brandmind-production",
    "database_id": "YOUR_DATABASE_ID"  // من output الأمر السابق
  }],
  "kv_namespaces": [{
    "binding": "KV",
    "id": "YOUR_KV_ID",
    "preview_id": "YOUR_KV_PREVIEW_ID"
  }]
}
```

#### 3. تطبيق Migrations على Production

```bash
npm run db:migrate:prod
```

#### 4. Deploy

```bash
npm run deploy:prod
```

#### 5. إعداد Environment Variables

```bash
# إضافة Master Perplexity Key
npx wrangler d1 execute brandmind-production \
  --command="INSERT OR REPLACE INTO system_settings (key, value) VALUES ('master_perplexity_key', 'your-key-here')"

# Telegram Bot Settings
npx wrangler d1 execute brandmind-production \
  --command="INSERT OR REPLACE INTO system_settings (key, value) VALUES ('telegram_bot_token', 'your-bot-token')"
```

---

## 🧪 Testing

### Manual API Testing

```bash
# Health Check
curl http://localhost:3000/api/health

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123","name":"Test User"}'

# Login (inactive user will get error)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123"}'

# Admin Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@brandmind.ai","password":"Admin@123"}'

# Get User Info (with token)
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Generate Content (with token)
curl -X POST http://localhost:3000/api/content/generate/post \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"business_id":1,"topic":"عرض خاص","platform":"instagram"}'
```

---

## 📝 الحالة الحالية والخطوات التالية

### ✅ مكتمل

- [x] نظام المصادقة الكامل (JWT, Refresh Tokens)
- [x] Admin Dashboard للتفعيل اليدوي
- [x] إدارة مفاتيح Perplexity
- [x] نظام الاشتراكات (4 باقات)
- [x] Chat AI Integration
- [x] Content Generation
- [x] Database Schema & Migrations
- [x] Rate Limiting & Security
- [x] Arabic RTL Interface
- [x] PM2 Configuration

### 🚧 قيد التطوير

- [ ] ربط حسابات السوشيال ميديا (OAuth)
  - Facebook/Instagram Business API
  - Twitter API v2
  - TikTok Business API
- [ ] Telegram Bot للتفعيل الآلي
- [ ] Payment Integration (Stripe/Paymob)
- [ ] Email Notifications
- [ ] Advanced Analytics Dashboard
- [ ] PDF Report Generation

### 💡 خطط مستقبلية

- [ ] Mobile App (React Native)
- [ ] White-Label Solution
- [ ] Multi-language Support (English)
- [ ] AI Image Generation (DALL-E, Midjourney)
- [ ] Video Editing Tools
- [ ] Competitor Analysis
- [ ] Influencer Discovery

---

## 🤝 المساهمة

نرحب بالمساهمات! يرجى قراءة [CONTRIBUTING.md](CONTRIBUTING.md) للتفاصيل.

### طرق المساهمة:

1. **Fork** المشروع
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** التغييرات: `git commit -m 'Add amazing feature'`
4. **Push** للبranch: `git push origin feature/amazing-feature`
5. **افتح Pull Request**

---

## 📄 الترخيص

هذا المشروع مرخص تحت MIT License - انظر [LICENSE](LICENSE) للتفاصيل.

---

## 📞 التواصل

**للاستفسارات والدعم:**

- **Telegram**: @YOUR_TELEGRAM_BOT
- **Email**: support@brandmind.ai
- **GitHub Issues**: https://github.com/belalalibb/brandmind-ai/issues

---

## 🙏 شكر خاص

- **Cloudflare** - للبنية التحتية Edge Computing
- **Hono** - للفريم ورك السريع والخفيف
- **Perplexity AI** - لمحرك الذكاء الاصطناعي
- **Tailwind CSS** - للتصميم الجميل
- **المجتمع العربي** - للدعم والتشجيع

---

<div align="center">

**صنع بـ ❤️ للسوق العربي**

**BrandMind AI** © 2024

[⬆ العودة للأعلى](#brandmind-ai---منصة-الذكاء-التسويقي-الشامل-)

</div>
