// BrandMind AI - Main Application Entry Point
// Complete Marketing Intelligence Platform

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { securityHeadersMiddleware } from './middleware/auth'

// Import routes
import auth from './routes/auth'
import admin from './routes/admin'
import chat from './routes/chat'
import content from './routes/content'

import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// Global middleware
app.use('*', securityHeadersMiddleware)
app.use('/api/*', cors({
  origin: ['http://localhost:3000', 'https://*.pages.dev'],
  credentials: true
}))

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Health check
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'BrandMind AI is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// Mount API routes
app.route('/api/auth', auth)
app.route('/api/admin', admin)
app.route('/api/chat', chat)
app.route('/api/content', content)

// Main page - Arabic RTL interface with complete dashboard
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BrandMind AI - منصة الذكاء التسويقي الشامل</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap" rel="stylesheet">
    <style>
        * {
            font-family: 'Tajawal', sans-serif;
        }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card-hover {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .section-hidden {
            display: none;
        }
        .section-active {
            display: block;
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="gradient-bg text-white shadow-lg">
        <div class="container mx-auto px-6 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-4 space-x-reverse">
                    <i class="fas fa-brain text-3xl"></i>
                    <h1 class="text-2xl font-bold">BrandMind AI</h1>
                    <span class="text-sm bg-white/20 px-3 py-1 rounded-full">v1.0</span>
                </div>
                <div class="flex items-center space-x-4 space-x-reverse">
                    <div id="user-info" class="hidden">
                        <span id="user-name" class="mr-4"></span>
                        <button onclick="logout()" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
                            <i class="fas fa-sign-out-alt ml-2"></i>
                            تسجيل الخروج
                        </button>
                    </div>
                    <div id="auth-buttons">
                        <button onclick="showLogin()" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
                            <i class="fas fa-sign-in-alt ml-2"></i>
                            تسجيل الدخول
                        </button>
                        <button onclick="showRegister()" class="bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition mr-2">
                            <i class="fas fa-user-plus ml-2"></i>
                            إنشاء حساب
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="container mx-auto px-6 py-8">
        
        <!-- Welcome Section -->
        <section id="welcome-section" class="section-active">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-rocket text-purple-600 ml-2"></i>
                    مرحباً بك في BrandMind AI
                </h2>
                <p class="text-xl text-gray-600 mb-8">
                    أول منصة ذكاء تسويقي شامل بالعربية - منافس Buffer و HubSpot
                </p>
            </div>

            <!-- Features Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <!-- Feature Card 1 -->
                <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                    <div class="text-4xl mb-4">🎯</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Business Profiler</h3>
                    <p class="text-gray-600">إدارة ملفات الأنشطة التجارية بذكاء</p>
                </div>

                <!-- Feature Card 2 -->
                <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                    <div class="text-4xl mb-4">✨</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Content Generator</h3>
                    <p class="text-gray-600">إنشاء محتوى تسويقي بالذكاء الاصطناعي</p>
                </div>

                <!-- Feature Card 3 -->
                <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                    <div class="text-4xl mb-4">💬</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">AI Chat Assistant</h3>
                    <p class="text-gray-600">مساعد ذكي للتسويق والمحتوى</p>
                </div>

                <!-- Feature Card 4 -->
                <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                    <div class="text-4xl mb-4">📅</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Smart Scheduler</h3>
                    <p class="text-gray-600">جدولة ونشر تلقائي للمحتوى</p>
                </div>

                <!-- Feature Card 5 -->
                <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                    <div class="text-4xl mb-4">📊</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Analytics Dashboard</h3>
                    <p class="text-gray-600">تحليلات وتقارير ذكية</p>
                </div>

                <!-- Feature Card 6 -->
                <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                    <div class="text-4xl mb-4">🔐</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Enterprise Security</h3>
                    <p class="text-gray-600">أمان متقدم مع JWT & HMAC</p>
                </div>
            </div>

            <!-- Subscription Plans -->
            <div class="mb-12">
                <h3 class="text-3xl font-bold text-center text-gray-800 mb-8">باقات الاشتراك</h3>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <!-- Free Plan -->
                    <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                        <h4 class="text-2xl font-bold text-gray-800 mb-2">مجاني</h4>
                        <p class="text-3xl font-bold text-purple-600 mb-4">0 ر.س</p>
                        <ul class="text-gray-600 space-y-2 mb-6">
                            <li><i class="fas fa-check text-green-500 ml-2"></i> 10 منشورات شهرياً</li>
                            <li><i class="fas fa-check text-green-500 ml-2"></i> حساب واحد</li>
                            <li><i class="fas fa-check text-green-500 ml-2"></i> محتوى AI</li>
                        </ul>
                    </div>

                    <!-- Basic Plan -->
                    <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                        <h4 class="text-2xl font-bold text-gray-800 mb-2">أساسي</h4>
                        <p class="text-3xl font-bold text-purple-600 mb-4">299 ر.س <span class="text-sm text-gray-500">/شهر</span></p>
                        <ul class="text-gray-600 space-y-2 mb-6">
                            <li><i class="fas fa-check text-green-500 ml-2"></i> 50 منشور شهرياً</li>
                            <li><i class="fas fa-check text-green-500 ml-2"></i> 3 حسابات</li>
                            <li><i class="fas fa-check text-green-500 ml-2"></i> جدولة تلقائية</li>
                        </ul>
                    </div>

                    <!-- Pro Plan -->
                    <div class="bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl shadow-xl p-6 border-2 border-purple-600 transform scale-105">
                        <div class="bg-white text-purple-600 text-sm font-bold px-3 py-1 rounded-full inline-block mb-2">الأكثر شعبية</div>
                        <h4 class="text-2xl font-bold text-white mb-2">احترافي</h4>
                        <p class="text-3xl font-bold text-white mb-4">599 ر.س <span class="text-sm text-purple-100">/شهر</span></p>
                        <ul class="text-white space-y-2 mb-6">
                            <li><i class="fas fa-check ml-2"></i> منشورات غير محدودة</li>
                            <li><i class="fas fa-check ml-2"></i> 10 حسابات</li>
                            <li><i class="fas fa-check ml-2"></i> كل المميزات</li>
                        </ul>
                    </div>

                    <!-- Enterprise Plan -->
                    <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                        <h4 class="text-2xl font-bold text-gray-800 mb-2">مؤسسات</h4>
                        <p class="text-3xl font-bold text-purple-600 mb-4">1499 ر.س <span class="text-sm text-gray-500">/شهر</span></p>
                        <ul class="text-gray-600 space-y-2 mb-6">
                            <li><i class="fas fa-check text-green-500 ml-2"></i> كل شيء غير محدود</li>
                            <li><i class="fas fa-check text-green-500 ml-2"></i> API مخصص</li>
                            <li><i class="fas fa-check text-green-500 ml-2"></i> دعم أولوية</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- How to Activate -->
            <div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
                <i class="fas fa-info-circle text-4xl text-blue-600 mb-4"></i>
                <h3 class="text-2xl font-bold text-gray-800 mb-4">كيفية التفعيل</h3>
                <p class="text-lg text-gray-700 mb-6">
                    بعد التسجيل، تواصل معنا عبر <strong>Telegram</strong> لتفعيل حسابك فوراً!
                </p>
                <div class="flex justify-center items-center space-x-4 space-x-reverse">
                    <a href="https://t.me/YOUR_TELEGRAM_BOT" target="_blank" class="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold transition">
                        <i class="fab fa-telegram ml-2"></i>
                        تواصل عبر Telegram
                    </a>
                    <button onclick="showRegister()" class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold transition">
                        <i class="fas fa-rocket ml-2"></i>
                        ابدأ الآن مجاناً
                    </button>
                </div>
            </div>
        </section>

        <!-- Login Section -->
        <section id="login-section" class="section-hidden max-w-md mx-auto">
            <div class="bg-white rounded-xl shadow-xl p-8">
                <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">
                    <i class="fas fa-sign-in-alt text-purple-600 ml-2"></i>
                    تسجيل الدخول
                </h2>
                <form id="login-form" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 mb-2">البريد الإلكتروني</label>
                        <input type="email" name="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="your@email.com">
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">كلمة المرور</label>
                        <input type="password" name="password" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="••••••••">
                    </div>
                    <button type="submit" class="w-full gradient-bg text-white py-3 rounded-lg font-bold hover:opacity-90 transition">
                        <i class="fas fa-arrow-left ml-2"></i>
                        دخول
                    </button>
                </form>
                <p class="text-center mt-4 text-gray-600">
                    ليس لديك حساب؟
                    <a href="#" onclick="showRegister()" class="text-purple-600 hover:underline font-bold">سجل الآن</a>
                </p>
            </div>
        </section>

        <!-- Register Section -->
        <section id="register-section" class="section-hidden max-w-md mx-auto">
            <div class="bg-white rounded-xl shadow-xl p-8">
                <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">
                    <i class="fas fa-user-plus text-purple-600 ml-2"></i>
                    إنشاء حساب جديد
                </h2>
                <form id="register-form" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 mb-2">الاسم الكامل</label>
                        <input type="text" name="name" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="محمد أحمد">
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">البريد الإلكتروني</label>
                        <input type="email" name="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="your@email.com">
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">كلمة المرور</label>
                        <input type="password" name="password" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="••••••••">
                        <p class="text-xs text-gray-500 mt-1">8 أحرف على الأقل، تحتوي على أحرف كبيرة وصغيرة وأرقام</p>
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">حساب Telegram (اختياري)</label>
                        <input type="text" name="telegram_username" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="@username">
                        <p class="text-xs text-gray-500 mt-1">للتفعيل السريع عبر Telegram</p>
                    </div>
                    <button type="submit" class="w-full gradient-bg text-white py-3 rounded-lg font-bold hover:opacity-90 transition">
                        <i class="fas fa-rocket ml-2"></i>
                        إنشاء الحساب
                    </button>
                </form>
                <p class="text-center mt-4 text-gray-600">
                    لديك حساب بالفعل؟
                    <a href="#" onclick="showLogin()" class="text-purple-600 hover:underline font-bold">سجل الدخول</a>
                </p>
            </div>
        </section>

        <!-- Dashboard Section (After Login) -->
        <section id="dashboard-section" class="section-hidden">
            <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-tachometer-alt text-purple-600 ml-2"></i>
                    لوحة التحكم
                </h2>
                <div id="dashboard-content" class="text-gray-600">
                    <p>جاري التحميل...</p>
                </div>
            </div>
        </section>

        <!-- Admin Section (Admin Only) -->
        <section id="admin-section" class="section-hidden">
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-shield-alt text-red-600 ml-2"></i>
                    لوحة الأدمن
                </h2>
                <div id="admin-content">
                    <p class="text-gray-600">جاري تحميل لوحة الأدمن...</p>
                </div>
            </div>
        </section>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8 mt-12">
        <div class="container mx-auto px-6 text-center">
            <p class="mb-2">
                <i class="fas fa-brain ml-2"></i>
                BrandMind AI - منصة الذكاء التسويقي الشامل
            </p>
            <p class="text-gray-400 text-sm">
                © 2024 BrandMind AI. All rights reserved.
            </p>
            <div class="mt-4 space-x-4 space-x-reverse">
                <a href="https://github.com/belalalibb/brandmind-ai" target="_blank" class="text-gray-400 hover:text-white transition">
                    <i class="fab fa-github text-xl"></i>
                </a>
                <a href="#" class="text-gray-400 hover:text-white transition">
                    <i class="fab fa-telegram text-xl"></i>
                </a>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script>
        // API Base URL
        const API_BASE = '/api';

        // Store auth token
        let authToken = localStorage.getItem('authToken');
        let userData = null;

        // Show/Hide Sections
        function hideAllSections() {
            document.querySelectorAll('section').forEach(section => {
                section.classList.remove('section-active');
                section.classList.add('section-hidden');
            });
        }

        function showLogin() {
            hideAllSections();
            document.getElementById('login-section').classList.add('section-active');
        }

        function showRegister() {
            hideAllSections();
            document.getElementById('register-section').classList.add('section-active');
        }

        function showWelcome() {
            hideAllSections();
            document.getElementById('welcome-section').classList.add('section-active');
        }

        function showDashboard() {
            hideAllSections();
            document.getElementById('dashboard-section').classList.add('section-active');
            loadDashboard();
        }

        // Login Form
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                email: formData.get('email'),
                password: formData.get('password')
            };

            try {
                const response = await axios.post(API_BASE + '/auth/login', data);
                if (response.data.success) {
                    authToken = response.data.data.tokens.access_token;
                    userData = response.data.data.user;
                    localStorage.setItem('authToken', authToken);
                    localStorage.setItem('userData', JSON.stringify(userData));
                    
                    alert('تم تسجيل الدخول بنجاح!');
                    updateUIAfterLogin();
                    
                    if (userData.role === 'admin' || userData.role === 'superadmin') {
                        showAdmin();
                    } else {
                        showDashboard();
                    }
                } else {
                    alert(response.data.message || 'خطأ في تسجيل الدخول');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert(error.response?.data?.message || 'خطأ في تسجيل الدخول');
            }
        });

        // Register Form
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                telegram_username: formData.get('telegram_username')
            };

            try {
                const response = await axios.post(API_BASE + '/auth/register', data);
                if (response.data.success) {
                    alert(response.data.message);
                    showWelcome();
                } else {
                    alert(response.data.message || 'خطأ في التسجيل');
                }
            } catch (error) {
                console.error('Register error:', error);
                alert(error.response?.data?.message || 'خطأ في التسجيل');
            }
        });

        // Logout
        function logout() {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            authToken = null;
            userData = null;
            updateUIAfterLogout();
            showWelcome();
        }

        // Update UI after login
        function updateUIAfterLogin() {
            document.getElementById('auth-buttons').classList.add('hidden');
            document.getElementById('user-info').classList.remove('hidden');
            document.getElementById('user-name').textContent = userData.name;
        }

        // Update UI after logout
        function updateUIAfterLogout() {
            document.getElementById('auth-buttons').classList.remove('hidden');
            document.getElementById('user-info').classList.add('hidden');
        }

        // Load Dashboard
        async function loadDashboard() {
            try {
                const response = await axios.get(API_BASE + '/auth/me', {
                    headers: { 'Authorization': \`Bearer \${authToken}\` }
                });
                
                if (response.data.success) {
                    const user = response.data.data;
                    document.getElementById('dashboard-content').innerHTML = \`
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="bg-purple-50 p-6 rounded-lg">
                                <h3 class="font-bold text-lg mb-2">معلوماتك</h3>
                                <p><strong>الاسم:</strong> \${user.name}</p>
                                <p><strong>البريد:</strong> \${user.email}</p>
                                <p><strong>API Key:</strong> <code class="text-sm bg-gray-200 px-2 py-1 rounded">\${user.api_key}</code></p>
                            </div>
                            <div class="bg-blue-50 p-6 rounded-lg">
                                <h3 class="font-bold text-lg mb-2">اشتراكك</h3>
                                <p><strong>الباقة:</strong> \${user.subscription?.plan || 'غير مفعل'}</p>
                                <p><strong>الحالة:</strong> \${user.subscription?.status || 'غير نشط'}</p>
                                <p class="text-sm text-gray-600 mt-2">للتفعيل تواصل عبر Telegram</p>
                            </div>
                        </div>
                    \`;
                }
            } catch (error) {
                console.error('Load dashboard error:', error);
            }
        }

        // Load Admin Dashboard
        async function showAdmin() {
            hideAllSections();
            document.getElementById('admin-section').classList.add('section-active');
            
            try {
                const response = await axios.get(API_BASE + '/admin/dashboard', {
                    headers: { 'Authorization': \`Bearer \${authToken}\` }
                });
                
                if (response.data.success) {
                    const stats = response.data.data.stats;
                    document.getElementById('admin-content').innerHTML = \`
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div class="bg-blue-50 p-4 rounded-lg">
                                <h4 class="font-bold">إجمالي المستخدمين</h4>
                                <p class="text-3xl font-bold text-blue-600">\${stats.total_users}</p>
                            </div>
                            <div class="bg-green-50 p-4 rounded-lg">
                                <h4 class="font-bold">المستخدمون النشطون</h4>
                                <p class="text-3xl font-bold text-green-600">\${stats.active_users}</p>
                            </div>
                            <div class="bg-yellow-50 p-4 rounded-lg">
                                <h4 class="font-bold">بانتظار التفعيل</h4>
                                <p class="text-3xl font-bold text-yellow-600">\${stats.pending_users}</p>
                            </div>
                            <div class="bg-purple-50 p-4 rounded-lg">
                                <h4 class="font-bold">الاشتراكات النشطة</h4>
                                <p class="text-3xl font-bold text-purple-600">\${stats.active_subscriptions}</p>
                            </div>
                        </div>
                        <div class="text-center">
                            <a href="/api/admin/users" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
                                إدارة المستخدمين
                            </a>
                        </div>
                    \`;
                }
            } catch (error) {
                console.error('Load admin error:', error);
            }
        }

        // Check if already logged in
        if (authToken) {
            userData = JSON.parse(localStorage.getItem('userData') || '{}');
            updateUIAfterLogin();
            if (userData.role === 'admin' || userData.role === 'superadmin') {
                showAdmin();
            } else {
                showDashboard();
            }
        } else {
            showWelcome();
        }
    </script>
</body>
</html>
  `)
})

export default app
