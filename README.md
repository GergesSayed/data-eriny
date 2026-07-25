# 🚛 Fleet CRM — نظام إدارة مبيعات الإطارات للأساطيل

<div align="center">

![Version](https://img.shields.io/badge/version-4.4.0-blue)
![Status](https://img.shields.io/badge/deployment-Vercel%20%7C%20Netlify-success)
![Languages](https://img.shields.io/badge/languages-JavaScript%20%7C%20Python%20%7C%20HTML%20%7C%20CSS-orange)
![License](https://img.shields.io/badge/license-Proprietary-red)

**[English](#english) | [العربية](#arabic)**

</div>

---

<a name="arabic"></a>
## 🇪🇬 العربية

### 📋 عن المشروع
نظام **Fleet CRM** هو منصة متكاملة لإدارة علاقات العملاء ومبيعات الإطارات، مصمم خصيصاً للسوق المصري. يستهدف الشركات والمصانع التي تمتلك أساطيل سيارات (نقل ثقيل، نقل خفيف، ركاب) لبيع الإطارات لها.

### ✨ المميزات الرئيسية

#### 📊 واجهة CRM
- **لوحة تحكم** احترافية مع إحصائيات حية ورسوم بيانية
- **إدارة الشركات**: قاعدة بيانات كاملة مع فلاتر متقدمة (قطاع، منطقة، حجم أسطول، أولوية)
- **سجل المكالمات**: تتبع المكالمات والمتابعات مع تجميع ذكي حسب الشركة
- **خط المبيعات (Kanban)**: 6 مراحل من الاتصال الأولي حتى إتمام البيع
- **تقارير**: تحليلات الأداء، المبيعات، القطاعات، والتوزيع الجغرافي
- **إدارة الفريق**: صلاحيات متعددة (مدير عام / مشرف / موظف مبيعات)
- **فحص البيانات**: محرك تدقيق ودمج التكرارات (Data Audit Engine)

#### 🕷️ سكرابر استخراج البيانات
- **Ultra Scraper**: Google Maps متقدم مع شبكة جغرافية لتجاوز حدود النتائج
- **Mega Scraper**: متعدد المصادر (Yellow Pages + Google + Wuzzuf + EGX)
- **LinkedIn Enricher**: إثراء بيانات الشركات بصفحات LinkedIn وصناع القرار
- **Smart Puller**: استخراج ذكي من Google Search (300+ استعلام)
- **Google Places API**: استخراج من واجهة Google الرسمية

### 📦 التقنيات المستخدمة

| الطبقة | التقنيات |
|--------|---------|
| **الواجهة** | HTML5, CSS3 (Dark Mode), JavaScript (Vanilla), Chart.js |
| **التخزين** | localStorage + IndexedDB |
| **السكرابر** | Python, Selenium, undetected-chromedriver, BeautifulSoup |
| **المكتبات** | Font Awesome, SheetJS (xlsx), Google Fonts (Cairo) |
| **النشر** | Vercel / Netlify (Static), Python Server (Backend) |

### 🚀 التشغيل المحلي

#### تشغيل السكرابر (Backend)
```bash
cd scraper
pip install -r requirements.txt
python server.py 8888
```

#### تشغيل الـ CRM (Frontend)
```bash
cd crm
npx -y http-server . -p 8080 -c-1 --cors
```
أو افتح `start_system.bat` لتشغيل كل شيء دفعة واحدة.

### 🔑 بيانات الدخول الافتراضية
| المستخدم | كلمة المرور | الصلاحية |
|----------|-----------|----------|
| `admin@fleet.com` / `admin` | مستخدم واحد | مدير عام (كامل الصلاحيات) |

> ⚠️ **تنبيه هام**: يرجى تغيير كلمة المرور الافتراضية فوراً بعد أول دخول.

### 🌐 النشر على الإنترنت
- **Vercel**: [https://data-eriny.vercel.app](https://data-eriny.vercel.app/#dashboard)
- **GitHub**: [https://github.com/GergesSayed/data-eriny](https://github.com/GergesSayed/data-eriny)

> **ملاحظة**: السكرابر وميزات الاستيراد التلقائي تعمل فقط عند التشغيل المحلي. على Vercel، تتوفر واجهة CRM كاملة ولكن بدون Backend.

### 📁 هيكل المشروع
```
data-eriny/
├── index.html              # صفحة التوجيه الرئيسية
├── vercel.json             # إعدادات Vercel للنشر
├── netlify.toml            # إعدادات Netlify (احتياطي)
├── start_system.bat        # تشغيل النظام كاملاً
├── crm/                    # واجهة CRM الأمامية
│   ├── index.html          # التطبيق الرئيسي (1,513 سطر)
│   ├── css/style.css       # التصميم (2,392 سطر)
│   └── js/                 # منطق التطبيق (11 ملف)
│       ├── app.js          # المتحكم الرئيسي + التوجيه
│       ├── storage.js      # إدارة البيانات + الصلاحيات
│       ├── companies.js    # إدارة الشركات
│       ├── calls.js        # سجل المكالمات
│       ├── pipeline.js     # خط المبيعات
│       ├── dashboard.js    # لوحة التحكم
│       ├── reports.js      # التقارير والإحصائيات
│       ├── scraper.js      # إعدادات السكرابر
│       ├── team.js         # إدارة الفريق
│       ├── excel-handler.js# استيراد/تصدير Excel
│       └── settings.js     # إعدادات عامة
└── scraper/                # أدوات استخراج البيانات
    ├── server.py           # HTTP API Server (Port 8888)
    ├── config.py           # 15 قطاع + 13 مدينة
    ├── ultra_scraper.py    # Google Maps متقدم
    ├── mega_scraper.py     # متعدد المصادر
    ├── linkedin_enricher.py# LinkedIn إثراء
    ├── smart_puller.py     # استخراج من Google Search
    ├── browser_scraper.py  # سكرابر المتصفح
    ├── google_places_scraper.py # Google Places API
    ├── requirements.txt    # مكتبات Python
    └── output/             # مخرجات السكرابر
```

### 📊 الإحصائيات
- **15 قطاع** مدعوم (نقل، أغذية، أدوية، مقاولات، بترول...)
- **13 مدينة** في القاهرة الكبرى
- **8 صفحات** في CRM
- **6 أدوات** سكرابر مختلفة
- **20+ شركة عينة** مدمجة مسبقاً

---

<a name="english"></a>
## 🇬🇧 English

### 📋 About
**Fleet CRM** is a comprehensive Customer Relationship Management and Tire Sales platform designed for the Egyptian market. It targets companies and factories with vehicle fleets (heavy transport, light transport, passenger) for tire sales.

### ✨ Key Features
- **Dashboard** with live stats and charts (Chart.js)
- **Company Management** with advanced filters (sector, area, fleet size, priority)
- **Call Log** with smart company grouping
- **Sales Pipeline** (Kanban board with 6 stages)
- **Reports** with performance analytics
- **Team Management** with role-based access (Admin / Supervisor / Agent)
- **Data Audit Engine** for deduplication and cleanup
- **Multiple Scrapers**: Google Maps, Yellow Pages, Google Search, LinkedIn
- **Excel Import/Export** support

### 🚀 Quick Start
```bash
# Backend (Scraper)
cd scraper && pip install -r requirements.txt && python server.py 8888

# Frontend (CRM)
cd crm && npx -y http-server . -p 8080 -c-1 --cors

# Or run both:
start_system.bat
```

### 🔑 Default Credentials
| User | Password | Role |
|------|----------|------|
| `admin@fleet.com` / `admin` | admin | Full Admin |

> ⚠️ **Important**: Change the default password immediately after first login.

### 🌐 Live Demo
- **Vercel**: [https://data-eriny.vercel.app](https://data-eriny.vercel.app/#dashboard)
- **GitHub**: [https://github.com/GergesSayed/data-eriny](https://github.com/GergesSayed/data-eriny)

> **Note**: Scraper features only work locally. Vercel deployment provides full CRM UI without backend connectivity.

### 📊 Project Stats
- ~18,000+ lines of code
- 15 sectors, 13 cities
- 6 scraper tools
- 3 user roles
- 8 CRM pages

---

<div align="center">
  <sub>Built with ❤️ for the Egyptian tire sales market | v4.4.0 © 2026</sub>
</div>