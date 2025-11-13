# 🚀 دليل التفعيل السريع لـ BrandMind AI

<div dir="rtl">

## للمستخدمين الجدد: كيفية البدء

### 1️⃣ التسجيل في المنصة

1. **افتح المنصة**: https://brandmind-ai.pages.dev
2. **اضغط "إنشاء حساب"**
3. **املأ البيانات**:
   - الاسم الكامل
   - البريد الإلكتروني
   - كلمة مرور قوية (8 أحرف، أرقام، أحرف كبيرة وصغيرة)
   - **Telegram Username** (مهم جداً للتفعيل!) مثال: @username
4. **اضغط "إنشاء الحساب"**

✅ **ستحصل على رسالة**: "تم التسجيل بنجاح! يرجى انتظار تفعيل حسابك"

---

### 2️⃣ التفعيل عبر Telegram (أسرع طريقة)

#### للحصول على تفعيل فوري:

1. **راسل البوت على Telegram**: [@YourBrandMindBot](https://t.me/YOUR_TELEGRAM_BOT)
2. **أرسل رسالة تحتوي على**:
   ```
   تفعيل حساب
   البريد: your-email@example.com
   الباقة المطلوبة: [free/basic/pro/enterprise]
   ```

3. **انتظر التفعيل** (عادة خلال دقائق)
4. **ستحصل على إشعار** بتفعيل حسابك

---

### 3️⃣ تسجيل الدخول

بعد التفعيل:

1. **ارجع للمنصة** وسجل دخول ببريدك وكلمة المرور
2. **ستحصل على**:
   - Access Token للاستخدام
   - API Key للتطبيقات الخارجية
   - لوحة التحكم الخاصة بك

---

## للأدمن: كيفية تفعيل المستخدمين

### ✅ الطريقة الأولى: لوحة الأدمن (موصى بها)

#### الخطوات:

1. **سجل دخول كأدمن**:
   ```
   البريد: admin@brandmind.ai
   كلمة المرور: Admin@123
   ```

2. **افتح لوحة الأدمن**:
   - ستظهر تلقائياً بعد تسجيل الدخول
   - أو اذهب لـ: `/api/admin/dashboard`

3. **اختر "إدارة المستخدمين"** أو اذهب مباشرة لـ:
   ```
   GET /api/admin/users
   ```

4. **ابحث عن المستخدم**:
   - بالبريد الإلكتروني
   - أو باسم Telegram (@username)
   - استخدم filters: `?status=inactive&search=email@example.com`

5. **اضغط "تفعيل"** ثم املأ النموذج:
   - **الباقة**: free/basic/pro/enterprise
   - **المدة**: 30 يوم (افتراضي)
   - **مفتاح Perplexity** (اختياري):
     - إذا أدخلت مفتاح: المستخدم يستخدم مفتاحه الخاص
     - إذا تركته فارغ: المستخدم يستخدم Master Key
   - **ملاحظات**: مثل "تفعيل عبر Telegram" أو "عميل VIP"

6. **اضغط "حفظ"**

✅ **تم التفعيل!** المستخدم يمكنه تسجيل الدخول مباشرة.

---

### ✅ الطريقة الثانية: API مباشر

إذا تفضل استخدام API:

```bash
# 1. سجل دخول كأدمن وخذ Token
curl -X POST https://brandmind-ai.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@brandmind.ai",
    "password": "Admin@123"
  }'

# سيعطيك: access_token

# 2. فعّل المستخدم
curl -X POST https://brandmind-ai.pages.dev/api/admin/users/5/activate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "pro",
    "duration_days": 30,
    "perplexity_api_key": "pplx-your-key-here",
    "notes": "Activated via API"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "تم تفعيل المستخدم Test User بنجاح",
  "data": {
    "user_id": 5,
    "plan": "pro",
    "start_date": "2024-11-13T...",
    "end_date": "2024-12-13T...",
    "features": ["content_generation", "ai_chat", ...],
    "limits": { "max_posts": 500, ... }
  }
}
```

---

## 🔑 إدارة مفاتيح Perplexity API

### Master Key (للجميع)

#### تعيين مفتاح رئيسي واحد للنظام:

```bash
# عبر Wrangler
npx wrangler d1 execute brandmind-production \
  --command="INSERT OR REPLACE INTO system_settings (key, value) 
             VALUES ('master_perplexity_key', 'pplx-your-master-key-here')"

# أو عبر API Admin
curl -X PUT https://brandmind-ai.pages.dev/api/admin/settings \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "master_perplexity_key": "pplx-your-master-key-here"
  }'
```

✅ **الآن كل المستخدمين بدون مفاتيح خاصة سيستخدمون هذا المفتاح**

---

### مفاتيح مخصصة لكل مستخدم

#### لإعطاء مستخدم مفتاح خاص به:

```bash
curl -X PUT https://brandmind-ai.pages.dev/api/admin/users/5/perplexity-key \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "pplx-user-specific-key"
  }'
```

**مميزات المفاتيح المخصصة:**
- ✅ تحكم دقيق في استخدام كل مستخدم
- ✅ فصل Usage Limits
- ✅ أمان أعلى (إذا تم اختراق مفتاح واحد)
- ✅ مناسب للعملاء Enterprise

---

### أي طريقة أفضل؟

| الحالة | الطريقة المناسبة |
|-------|-----------------|
| **مشروع تجريبي** | Master Key واحد |
| **عملاء قليلون (<10)** | Master Key |
| **عملاء كثيرون** | مفاتيح مخصصة |
| **Enterprise** | مفاتيح مخصصة |
| **Usage Control مهم** | مفاتيح مخصصة |

---

## 📊 لوحة تحكم الأدمن - الأقسام

### 1. Dashboard (الرئيسية)

**المعلومات المعروضة:**
- إجمالي المستخدمين
- المستخدمون النشطون
- بانتظار التفعيل
- الاشتراكات النشطة
- توزيع الباقات
- أحدث التسجيلات

**Endpoint:**
```
GET /api/admin/dashboard
```

---

### 2. إدارة المستخدمين

**الوظائف:**
- عرض قائمة المستخدمين
- البحث والفلترة
- التفعيل/الإلغاء
- تعديل الاشتراكات
- تعيين مفاتيح Perplexity
- إعادة توليد API Keys

**Endpoints:**
```
GET    /api/admin/users                      # List all
GET    /api/admin/users/:id                  # Get details
POST   /api/admin/users/:id/activate         # Activate
POST   /api/admin/users/:id/deactivate       # Deactivate
PUT    /api/admin/users/:id/perplexity-key   # Set Perplexity key
PUT    /api/admin/users/:id/subscription     # Update plan
POST   /api/admin/users/:id/regenerate-api-key  # New API key
```

---

### 3. سجل الإجراءات

**تتبع كل إجراء admin:**
- من قام بالإجراء
- على من تم الإجراء
- نوع الإجراء (activate, deactivate, change_plan, etc.)
- التفاصيل
- التاريخ والوقت

**Endpoint:**
```
GET /api/admin/actions?page=1&limit=50
```

---

### 4. الإعدادات

**إدارة:**
- Master Perplexity Key
- Telegram Bot Token
- Telegram Admin Chat ID
- Default Plan للمستخدمين الجدد
- Maintenance Mode
- Registration Enabled/Disabled

**Endpoints:**
```
GET  /api/admin/settings     # Get all
PUT  /api/admin/settings     # Update
```

---

## 🎯 Workflow الكامل: من التسجيل للاستخدام

### سيناريو كامل:

1. **مستخدم جديد** يسجل:
   ```
   POST /api/auth/register
   {
     "email": "user@example.com",
     "password": "StrongPass@123",
     "name": "Ahmed Mohammed",
     "telegram_username": "@ahmed_m"
   }
   ```
   
2. **يحصل على**:
   ```json
   {
     "success": true,
     "message": "تم التسجيل بنجاح! يرجى انتظار التفعيل",
     "data": {
       "user_id": 10,
       "status": "pending_activation"
     }
   }
   ```

3. **المستخدم يراسل** Telegram Bot:
   ```
   تفعيل حساب
   user@example.com
   الباقة: pro
   ```

4. **الأدمن يرى** الرسالة ويفتح Admin Panel

5. **الأدمن يبحث** عن المستخدم:
   ```
   GET /api/admin/users?search=user@example.com
   ```

6. **الأدمن يفعّل** الحساب:
   ```
   POST /api/admin/users/10/activate
   {
     "plan": "pro",
     "duration_days": 30,
     "perplexity_api_key": "pplx-pro-user-key",
     "notes": "Telegram activation - VIP customer"
   }
   ```

7. **النظام يرسل إشعار** للمستخدم (مستقبلاً عبر Telegram Bot)

8. **المستخدم يسجل دخول**:
   ```
   POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "StrongPass@123"
   }
   ```

9. **يحصل على Tokens**:
   ```json
   {
     "success": true,
     "data": {
       "tokens": {
         "access_token": "eyJhbGc...",
         "refresh_token": "rt_10_abc..."
       },
       "subscription": {
         "plan": "pro",
         "status": "active",
         "end_date": "2024-12-13T..."
       }
     }
   }
   ```

10. **يبدأ الاستخدام**:
    ```
    POST /api/content/generate/post
    {
      "topic": "عرض رمضان الخاص",
      "platform": "instagram"
    }
    ```

---

## 🔧 Troubleshooting

### مشكلة: المستخدم لا يستطيع تسجيل الدخول بعد التفعيل

**الحل:**
1. تحقق من تفعيل الحساب:
   ```sql
   SELECT is_active FROM users WHERE email = 'user@example.com'
   ```
2. يجب أن يكون `is_active = 1`
3. إذا كان 0، فعّل يدوياً عبر API

---

### مشكلة: "لا يوجد مفتاح Perplexity API متاح"

**الحل:**
1. تحقق من Master Key:
   ```sql
   SELECT value FROM system_settings WHERE key = 'master_perplexity_key'
   ```
2. إذا فارغ، أضف مفتاح:
   ```bash
   npx wrangler d1 execute brandmind-production \
     --command="INSERT OR REPLACE INTO system_settings (key, value) 
                VALUES ('master_perplexity_key', 'your-key')"
   ```
3. أو عيّن مفتاح مخصص للمستخدم

---

### مشكلة: Rate Limit Exceeded

**السبب:** المستخدم تجاوز حد الطلبات اليومي

**الحد الافتراضي:**
- Free: 50 طلب/يوم
- Basic: 200 طلب/يوم
- Pro: 1,000 طلب/يوم
- Enterprise: 10,000 طلب/يوم

**الحل:**
1. انتظر reset (منتصف الليل UTC)
2. أو ترقية الباقة

---

## 📞 الدعم الفني

**للمساعدة:**
- Telegram: @YOUR_TELEGRAM_BOT
- Email: support@brandmind.ai
- GitHub Issues: https://github.com/belalalibb/brandmind-ai/issues

---

**آخر تحديث**: 2024-11-13  
**الإصدار**: 1.0.0

</div>
