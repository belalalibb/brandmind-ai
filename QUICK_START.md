# 🚀 Quick Start Guide - BrandMind AI

## تشغيل المشروع في 5 دقائق

### 1. التثبيت

```bash
# Clone المشروع
git clone https://github.com/belalalibb/brandmind-ai.git
cd brandmind-ai

# تثبيت Dependencies
npm install --legacy-peer-deps
```

### 2. إعداد قاعدة البيانات

```bash
# تطبيق Schema
npm run db:migrate:local

# إضافة بيانات تجريبية
npm run db:seed
```

### 3. Build و Run

```bash
# Build المشروع
npm run build

# تشغيل مع PM2
pm2 start ecosystem.config.cjs

# اختبار
curl http://localhost:3000/api/health
```

---

## 🔑 بيانات الدخول التجريبية

### Admin Account
```
البريد: admin@brandmind.ai
كلمة المرور: Admin@123
الدور: superadmin
```

### Test Users
```
1. user1@example.com (Pro - Active)
2. user2@example.com (Free - Inactive)
3. user3@example.com (Basic - Active)

كلمة المرور للجميع: Admin@123
```

---

## 🎯 أول 3 خطوات بعد التشغيل

### 1. سجل دخول كأدمن
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@brandmind.ai","password":"Admin@123"}'
```

### 2. افتح لوحة الأدمن
```
http://localhost:3000
# سيظهر Dashboard تلقائياً للأدمن
```

### 3. أضف Perplexity API Key
```bash
# عبر Database
npx wrangler d1 execute brandmind-production --local \
  --command="INSERT OR REPLACE INTO system_settings (key, value) 
             VALUES ('master_perplexity_key', 'YOUR_KEY_HERE')"

# أو عبر Admin API
curl -X PUT http://localhost:3000/api/admin/settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"master_perplexity_key":"YOUR_KEY_HERE"}'
```

---

## 📱 اختبار الوظائف الأساسية

### Test 1: تسجيل مستخدم جديد
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test@123",
    "name":"Test User",
    "telegram_username":"@testuser"
  }'
```

### Test 2: تفعيل المستخدم (كأدمن)
```bash
# احصل على user_id من الخطوة السابقة (مثلاً: 5)
curl -X POST http://localhost:3000/api/admin/users/5/activate \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan":"pro",
    "duration_days":30,
    "notes":"Test activation"
  }'
```

### Test 3: إنشاء محتوى بالذكاء الاصطناعي
```bash
curl -X POST http://localhost:3000/api/content/generate/post \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "business_id":1,
    "topic":"عرض خاص",
    "platform":"instagram",
    "save_as_draft":true
  }'
```

---

## 🔗 روابط مهمة

- **Live Demo**: https://3000-icb5pqhrr88qp0gucjfnp-0e616f0a.sandbox.novita.ai
- **GitHub**: https://github.com/belalalibb/brandmind-ai
- **API Docs**: في README.md
- **Activation Guide**: في ACTIVATION_GUIDE.md

---

## ⚡ أوامر مفيدة

```bash
# إيقاف الخدمة
pm2 stop brandmind-ai

# إعادة تشغيل
pm2 restart brandmind-ai

# عرض Logs
pm2 logs brandmind-ai --lines 50

# حذف من PM2
pm2 delete brandmind-ai

# إعادة بناء
npm run build && pm2 restart brandmind-ai

# تنظيف Port
fuser -k 3000/tcp
```

---

## 🐛 مشاكل شائعة

### المشكلة: Port 3000 محجوز
**الحل:**
```bash
fuser -k 3000/tcp 2>/dev/null || true
pm2 restart brandmind-ai
```

### المشكلة: Build failed
**الحل:**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### المشكلة: Database error
**الحل:**
```bash
npm run db:reset  # يحذف ويعيد إنشاء DB
```

---

## 📞 الدعم

- GitHub Issues: https://github.com/belalalibb/brandmind-ai/issues
- Telegram: @YOUR_TELEGRAM_BOT

**جاهز للانطلاق! 🚀**
