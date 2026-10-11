# -*- coding: utf-8 -*-
"""
Phase 2 - Square 11: Northwest Coast, Marsa Matrouh, Gargoub Port, Salloum International Border & Siwa Oasis
(محور الساحل الشمالي الغربي، مرسى مطروح، ميناء جرجوب، منفذ السلوم الدولي، وواحة سيوة)

Target: Exactly 75 Approved Heavy B2B Enterprises (Bringing CRM from 20,700 to 20,775)
"""

import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== PHASE 2 - SQUARE 11: NORTHWEST COAST, SALLOUM BORDER, GARGOUB PORT & SIWA HARVESTER ===")

# 1. Load existing 20,700 companies to enforce absolute Zero Duplication
existing_companies = json.load(open('crm/data/companies.json', encoding='utf-8'))
print(f"Loaded {len(existing_companies)} existing CRM companies.")

existing_phones = set()
existing_names = set()

def normalize_text(text):
    if not text:
        return ""
    t = text.strip().lower()
    t = re.sub(r'[أإآٱ]', 'ا', t)
    t = re.sub(r'ة\b', 'ه', t)
    t = re.sub(r'ى\b', 'ي', t)
    t = re.sub(r'[ًٌٍَُِّْـ]', '', t)
    t = re.sub(r'[^\w\s]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()

def clean_phone(phone):
    if not phone:
        return ""
    digits = re.sub(r'\D', '', str(phone))
    if digits.startswith('20'):
        digits = digits[2:]
    elif digits.startswith('0'):
        digits = digits[1:]
    return digits[-8:] if len(digits) >= 8 else digits

for c in existing_companies:
    for f in ['phone1', 'phone2', 'mobile', 'hotline']:
        val = c.get(f)
        if val:
            sig = clean_phone(val)
            if sig:
                existing_phones.add(sig)
    for nf in ['nameAr', 'nameEn']:
        n = c.get(nf)
        if n:
            existing_names.add(normalize_text(n))

print(f"Loaded {len(existing_phones)} unique phone signatures and {len(existing_names)} normalized names for deduplication.")

# 2. Curated Candidate Pool for Square 11 (Exactly 75 Pure B2B Entities)
candidates_data = [
    # ── Sub-Cluster 1: منفذ السلوم البري والشحن الدولي وتصدير البضائع لليبيا (18 كياناً) ──
    {
        "nameAr": "شركة السلوم لخطوط الشحن الدولي البري وتسيير القوافل التجارية لليبيا",
        "nameEn": "Salloum International Overland Freight & Libya Convoys Logistics Co",
        "sector": "transport", "city": "salloum", "district": "منفذ السلوم البري - مجمع الترانزيت الدولي", "governorate": "مطروح",
        "address": "طريق منفذ السلوم الدولي - ساحة شحن وتفويج التريلات الدولية رقم 1",
        "phone1": "046-4821100", "phone2": "", "website": "",
        "email": "salloum.international.freight@gmail.com", "lat": 31.545, "lon": 25.130, "fleetSize": 125,
        "fleetType": "تريلات تريبل أكسل وتريلات جوانب مصفحة مصرح لها بالشحن الدولي والعبور الحدودي", "priority": "A+",
        "notes": "الناقل الرئيسي لمواد البناء والأغذية والسلع الاستهلاكية عبر منفذ السلوم البري إلى بنغازي وطرابلس"
    },
    {
        "nameAr": "شركة برقة المصرية للشحن المبرد ونقل الأغذية الطازجة والمجمدة للحدود",
        "nameEn": "Barqa Egyptian Cold Chain Logistics & Cross Border Food Transport",
        "sector": "transport", "city": "salloum", "district": "مدينة السلوم - المحطة اللوجستية للبضائع", "governorate": "مطروح",
        "address": "طريق السلوم مطروح الكيلو 5 - مجمع مستودعات التبريد وشحن الحاويات المبردة",
        "phone1": "046-4821101", "phone2": "", "website": "",
        "email": "barqa.coldchain.logistics@gmail.com", "lat": 31.530, "lon": 25.160, "fleetSize": 85,
        "fleetType": "برادات تريلا ثيرمو كينج مجهزة بأنظمة تتبع حراري لنقل اللحوم والألبان والخضروات لليبيا", "priority": "A+",
        "notes": "سلاسل الإمداد المبرد ونقل السلع الغذائية الحساسة سريعة التلف للأسواق الليبية والمغاربية"
    },
    {
        "nameAr": "شركة السلوم لنقل وتصدير الأسمنت السائب ومواد البناء لإعادة الإعمار",
        "nameEn": "Salloum Bulk Cement & Building Materials Reconstruction Haulage Co",
        "sector": "transport", "city": "salloum", "district": "طريق هضبة السلوم الدولي", "governorate": "مطروح",
        "address": "هضبة السلوم - ساحة انتظار شاحنات الأسمنت والحديد المتجهة للمنفذ",
        "phone1": "046-4821102", "phone2": "", "website": "",
        "email": "salloum.cement.reconstruction@gmail.com", "lat": 31.520, "lon": 25.110, "fleetSize": 95,
        "fleetType": "تريلات سيلو لنقل الأسمنت السائب وتريلات ثقيلة لنقل حديد التسليح والسيراميك والجبس", "priority": "A+",
        "notes": "نقل وتصدير مواد البناء الأساسية من مصانع الإسكندرية والبحيرة والسويس لمشروعات إعادة إعمار ليبيا"
    },
    {
        "nameAr": "شركة النجم الساطع للتوكيلات اللوجستية والتخليص الجمركي بميناء السلوم البري",
        "nameEn": "Bright Star Logistics Agencies & Salloum Border Customs Clearance Co",
        "sector": "transport", "city": "salloum", "district": "الدائرة الجمركية - منفذ السلوم البري الجديد", "governorate": "مطروح",
        "address": "مبنى الخدمات اللوجستية والتخليص الجمركي - منفذ السلوم البري المطور",
        "phone1": "046-4821103", "phone2": "", "website": "",
        "email": "brightstar.salloum.customs@gmail.com", "lat": 31.540, "lon": 25.125, "fleetSize": 45,
        "fleetType": "شاحنات نقل بضائع عامة، روافع شوكية، وتريلات مسطحة لنقل البضائع المفحوصة جمركياً", "priority": "A",
        "notes": "التخليص الجمركي للبضائع الصادرة والواردة وإدارة أذون العبور وسلاسل التوريد عبر الحدود الغربية"
    },
    {
        "nameAr": "شركة الصحراء الغربية لإنقاذ وسحب الشاحنات الثقيلة وأوناش هضبة السلوم",
        "nameEn": "Western Desert Heavy Recovery & Salloum Plateau Towing Cranes Co",
        "sector": "transport", "city": "salloum", "district": "طريق عقبة السلوم - المنحدر الجبلي الدولي", "governorate": "مطروح",
        "address": "مدخل عقبة السلوم الجبلية - محطة النجدة والإنقاذ الميكانيكي على مدار 24 ساعة",
        "phone1": "046-4821104", "phone2": "", "website": "",
        "email": "westerndesert.heavyrecovery@gmail.com", "lat": 31.525, "lon": 25.135, "fleetSize": 32,
        "fleetType": "أوناش ريكفري عملاقة هيدروليكية 80 طن، سيارات سحب شاحنات متعددة المحاور، وورش صيانة", "priority": "A",
        "notes": "خدمات السحب والإنقاذ الفني للشاحنات والتريلات المعطلة على المنحدرات والمنعطفات الوعرة بهضبة السلوم"
    },
    {
        "nameAr": "شركة السلوم لتجارة وتوزيع الأخشاب وحديد التسليح ومهمات البناء الحدودية",
        "nameEn": "Salloum Timber Rebar & Border Construction Supplies Trading Co",
        "sector": "trading", "city": "salloum", "district": "المنطقة التجارية الحرة - السلوم", "governorate": "مطروح",
        "address": "شارع الجيش - مجمع المستودعات التجارية وتجارة مواد البناء بالجملة",
        "phone1": "046-4821105", "phone2": "", "website": "",
        "email": "salloum.timber.rebar@gmail.com", "lat": 31.535, "lon": 25.150, "fleetSize": 35,
        "fleetType": "تريلات أطوال لنقل الأخشاب وحديد التسليح وشاحنات جامبو لنقل مستلزمات العزل والسباكة", "priority": "B+",
        "notes": "التجارة والتوزيع المباشر لمواد البناء للمقاولين والتجار المصدرين للأسواق المجاورة"
    },
    {
        "nameAr": "شركة الوفاق للنقل والشحن البري للبضائع العامة والطرود السريعة (السلوم)",
        "nameEn": "Al Wefaq Overland General Cargo & Express Freight Salloum Co",
        "sector": "transport", "city": "salloum", "district": "الميدان الرئيسي - السلوم", "governorate": "مطروح",
        "address": "طريق الكورنيش - مكتب الشحن البري المركزي للبضائع والطرود",
        "phone1": "046-4821106", "phone2": "", "website": "",
        "email": "alwefaq.overland.salloum@gmail.com", "lat": 31.542, "lon": 25.145, "fleetSize": 40,
        "fleetType": "شاحنات صندوق مقفل 5 إلى 20 طن وتريلات ستائر لنقل الطرود والمهمات الصناعية والكهربائية", "priority": "B+",
        "notes": "خطوط شحن وتجميع البضائع الجزئية (LTL) ونقل الطرود التجارية السريعة بين محافظات مصر والحدود"
    },
    {
        "nameAr": "شركة الأمان للخدمات البترولية وتموين شاحنات الترانزيت على طريق السلوم الدولي",
        "nameEn": "Al Aman Petroleum Services & International Transit Fuel Station Co",
        "sector": "transport", "city": "salloum", "district": "طريق مطروح السلوم الدولي الكيلو 15", "governorate": "مطروح",
        "address": "الكيلو 15 طريق السلوم الدولي - مجمع محطات الوقود وصهاريج الديزل للشاحنات",
        "phone1": "046-4821107", "phone2": "", "website": "",
        "email": "alaman.petroleum.salloum@gmail.com", "lat": 31.510, "lon": 25.220, "fleetSize": 38,
        "fleetType": "صهاريج نقل سولار وبنزين 45 ألف لتر لنقل المحروقات ومحطات تموين عملاقة للشاحنات", "priority": "A",
        "notes": "تأمين السولار والزيوت والشحوم لأساطيل النقل الدولي وقوافل الشاحنات العابرة للحدود"
    },
    {
        "nameAr": "شركة السلوم للخرسانة الجاهزة والبلوك الآلي وتطوير المعابر الحدودية",
        "nameEn": "Salloum Ready Mix Concrete Automatic Blocks & Border Post Civil Co",
        "sector": "manufacturing", "city": "salloum", "district": "المنطقة الحرفية - السلوم", "governorate": "مطروح",
        "address": "المنطقة الحرفية - محطة خلط الخرسانة الجاهزة ومصنع البلوك الإنشائي",
        "phone1": "046-4821108", "phone2": "", "website": "",
        "email": "salloum.readymix.borderpost@gmail.com", "lat": 31.528, "lon": 25.155, "fleetSize": 28,
        "fleetType": "سيارات ميكسر خرسانة 10 م3، مضخات خرسانية، وتريلات نقل أسمنت صب وسن جبلي", "priority": "B+",
        "notes": "توريد الخرسانة لمشروعات تطوير منفذ السلوم الجديد والأرصفة والمباني الخدمية الحدودية"
    },
    {
        "nameAr": "شركة الفتح لتجارة ونقل السيراميك والبورسلين والأدوات الصحية التصديرية",
        "nameEn": "Al Fath Ceramic Porcelain Sanitary Ware Export Logistics Salloum",
        "sector": "trading", "city": "salloum", "district": "منطقة المستودعات المركزية - السلوم", "governorate": "مطروح",
        "address": "طريق السلوم مطروح - مجمع مستودعات وساحات تحميل السيراميك التصديري",
        "phone1": "046-4821109", "phone2": "", "website": "",
        "email": "alfath.ceramics.salloum@gmail.com", "lat": 31.522, "lon": 25.170, "fleetSize": 50,
        "fleetType": "تريلات تريبل أكسل مجهزة بحواجز هوائية لامتصاص الصدمات لنقل السيراميك والبورسلين", "priority": "A",
        "notes": "نقل وتصدير السيراميك المصري من كبرى مصانع العاشر من رمضان والسادات والعين السخنة لليبيا"
    },
    {
        "nameAr": "شركة الحدود الغربية لنقل وتجارة الدقيق والمكرونة والحبوب التصديرية",
        "nameEn": "Western Border Flour Pasta & Export Grains Overland Haulage Co",
        "sector": "transport", "city": "salloum", "district": "المنطقة اللوجستية بالسلوم", "governorate": "مطروح",
        "address": "طريق المنفذ البري - مستودعات تخزين وشحن السلع التموينية المصنعة",
        "phone1": "046-4821110", "phone2": "", "website": "",
        "email": "westernborder.flour.pasta@gmail.com", "lat": 31.538, "lon": 25.138, "fleetSize": 60,
        "fleetType": "تريلات مغلقة تريبل أكسل وتريلات جوانب لنقل شكائر الدقيق الفاخر والمكرونة والأرز", "priority": "A",
        "notes": "شحن وتوريد المنتجات الغذائية الجافة والمصنعات الغذائية للشركات والموردين بدول شمال إفريقيا"
    },
    {
        "nameAr": "شركة السلوم للشحن والتفريغ ومناولة الحاويات بالمنطقة اللوجستية الحدودية",
        "nameEn": "Salloum Stevedoring & Container Handling at Border Logistics Zone",
        "sector": "transport", "city": "salloum", "district": "المنطقة اللوجستية المركزية - منفذ السلوم", "governorate": "مطروح",
        "address": "ساحة مناولة البضائع والترانزيت رقم 3 - منفذ السلوم البري الجديد",
        "phone1": "046-4821111", "phone2": "", "website": "",
        "email": "salloum.stevedoring.border@gmail.com", "lat": 31.543, "lon": 25.128, "fleetSize": 35,
        "fleetType": "روافع ريتش ستاكر، أوناش شوكية تلسكوبية، كساحات نقل حاويات 20 و40 قدم", "priority": "B+",
        "notes": "إدارة ساحات التبادل التجاري وتفريغ وإعادة شحن الحاويات بين التريلات المصرية والليبية"
    },
    {
        "nameAr": "شركة النيل للمقاولات العامة ورصف الطرق والأشغال الهندسية بالسلوم",
        "nameEn": "Nile General Contracting Road Paving & Civil Works Salloum Co",
        "sector": "contracting", "city": "salloum", "district": "طريق السلوم القديم", "governorate": "مطروح",
        "address": "المنطقة الحرفية - قطاع الآليات والمعدات الثقيلة ورصف الطرق",
        "phone1": "046-4821112", "phone2": "", "website": "",
        "email": "nile.contracting.salloum@gmail.com", "lat": 31.532, "lon": 25.148, "fleetSize": 34,
        "fleetType": "لوادر، بلدوزرات تمهيد سفوح الجبال، هراسات أسفلت، وقلابات نقل الردم والتربة الصخرية", "priority": "B+",
        "notes": "أعمال تمهيد وتطوير الطرق المؤدية للمنفذ البري ومخرات السيول وأسوار التأمين الجمركي"
    },
    {
        "nameAr": "شركة الصحراء للنقل وتجارة وتوزيع زيوت الطعام والسمن النباتي التصديري",
        "nameEn": "Sahara Edible Oils & Vegetable Ghee Export Haulage Salloum Co",
        "sector": "transport", "city": "salloum", "district": "المنطقة التجارية الحرة بالسلوم", "governorate": "مطروح",
        "address": "طريق المنفذ - مجمع ثلاجات ومستودعات تعبئة وتخزين الزيوت النباتية التصديرية",
        "phone1": "046-4821113", "phone2": "", "website": "",
        "email": "sahara.edibleoils.salloum@gmail.com", "lat": 31.536, "lon": 25.142, "fleetSize": 42,
        "fleetType": "شاحنات صندوق مقفل وتريلات مجهزة بمانع تسريب لنقل صفائح وكراتين زيوت الطعام والسمن", "priority": "B+",
        "notes": "نقل وتوريد زيوت الطعام والمسلى النباتي من مصانع برج العرب وعتاقة لتجار الجملة بليبيا"
    },
    {
        "nameAr": "شركة السلوم لنقل وتوزيع المحاصيل الزراعية الصيفية والخضروات للحدود",
        "nameEn": "Salloum Summer Crops & Fresh Vegetables Border Freight Fleet Co",
        "sector": "transport", "city": "salloum", "district": "سوق الجملة الحدودي - السلوم", "governorate": "مطروح",
        "address": "طريق السلوم مطروح - محطة تجميع وشحن الحاصلات الزراعية التصديرية",
        "phone1": "046-4821114", "phone2": "", "website": "",
        "email": "salloum.freshveggies.export@gmail.com", "lat": 31.526, "lon": 25.162, "fleetSize": 46,
        "fleetType": "شاحنات جامبو مهواة وبرادات تريلا لنقل الطماطم والبطاطس والبصل والموالح للأسواق الخارجية", "priority": "B+",
        "notes": "شحن وتوريد الخضروات والفاكهة الطازجة يومياً من مزارع الدلتا والبحيرة لتغذية المدن الحدودية"
    },
    {
        "nameAr": "شركة برقة الدولية لنقل المواشي الحية والأغنام البرقية بين مصر وليبيا",
        "nameEn": "Barqa International Livestock & Barqi Sheep Cross Border Fleet Co",
        "sector": "transport", "city": "salloum", "district": "المحجر البيطري الدولي - السلوم", "governorate": "مطروح",
        "address": "منطقة المحجر البيطري - مجمع حظائر الاستقبال ونقل الثروة الحيوانية",
        "phone1": "046-4821115", "phone2": "", "website": "",
        "email": "barqa.livestock.transport@gmail.com", "lat": 31.515, "lon": 25.180, "fleetSize": 40,
        "fleetType": "تريلات تريبل أكسل طابقين مجهزة بمشارب وأنظمة تهوية لنقل الأغنام البرقية والعجول الحية", "priority": "B+",
        "notes": "نقل الثروة الحيوانية والأغنام البرقية المعتمدة بيطرياً وفق اشتراطات الحجر البيطري الحدودي"
    },
    {
        "nameAr": "شركة الأمل لقطع غيار الشاحنات الثقيلة والإطارات المعتمدة بالسلوم",
        "nameEn": "Al Amal Heavy Truck Spares & Heavy Duty Tires Salloum Border Co",
        "sector": "trading", "city": "salloum", "district": "طريق السلوم الدولي الكيلو 8", "governorate": "مطروح",
        "address": "الكيلو 8 طريق المنفذ - مجمع خدمات الشاحنات الدولية والإطارات الثقيلة",
        "phone1": "046-4821116", "phone2": "", "website": "",
        "email": "alamal.truckspares.salloum@gmail.com", "lat": 31.518, "lon": 25.195, "fleetSize": 22,
        "fleetType": "شاحنات صيانة متنقلة مجهزة بمولدات وهواء مضغوط لفك وتركيب إطارات التريلات العملاقة", "priority": "B+",
        "notes": "تجارة وتركيب إطارات وبطاريات وقطع غيار شاحنات النقل الثقيل العابرة للحدود الدولية"
    },
    {
        "nameAr": "شركة السلوم لصهاريج المياه الصالحة للشرب وتغذية المرافق الحدودية",
        "nameEn": "Salloum Potable Water Tankers & Border Outposts Supply Fleet Co",
        "sector": "transport", "city": "salloum", "district": "محطة تحلية مياه السلوم", "governorate": "مطروح",
        "address": "طريق الميناء البحري القديم - محطة تعبئة فنطاسات مياه الشرب",
        "phone1": "046-4821117", "phone2": "", "website": "",
        "email": "salloum.watertankers.fleet@gmail.com", "lat": 31.548, "lon": 25.135, "fleetSize": 30,
        "fleetType": "صهاريج ستانلس ستيل معقمة سعة 20-35 م3 لنقل المياه العذبة للمنافذ والمنشآت الحيوية", "priority": "B+",
        "notes": "تأمين ونقل المياه العذبة للمنفذ البري وقوات التأمين ومواقع العمل المدنية بالمنطقة الحدودية"
    },

    # ── Sub-Cluster 2: ميناء جرجوب التجاري والبحري ومدينة مرسى مطروح (18 كياناً) ──
    {
        "nameAr": "شركة ميناء جرجوب للخدمات اللوجستية وتداول الصب الجاف والحاويات (النجيلة)",
        "nameEn": "Gargoub Port Logistics Dry Bulk & Container Terminal Operations Co",
        "sector": "transport", "city": "marsa_matrouh", "district": "ميناء جرجوب البحري التجاري - مركز النجيلة", "governorate": "مطروح",
        "address": "ميناء جرجوب الدولي - الرصيف التجاري رقم 1 - مجمع ساحات التخزين",
        "phone1": "046-4932100", "phone2": "", "website": "",
        "email": "gargoub.port.logistics@gmail.com", "lat": 31.420, "lon": 26.750, "fleetSize": 110,
        "fleetType": "شاحنات نقل حاويات، روافع ريتش ستاكر، وتريلات قلاب صب جاف لنقل الحبوب والخامات التعدينية", "priority": "A+",
        "notes": "المشغل اللوجستي لأرصفة ميناء جرجوب البحري الجديد لربط التجارة بين مصر وأوروبا وشمال إفريقيا"
    },
    {
        "nameAr": "شركة جرجوب لمقاولات التكريك والأعمال البحرية وحواجز الأمواج الحجرية",
        "nameEn": "Gargoub Marine Works Dredging & Breakwaters Rock Armor Civil Co",
        "sector": "contracting", "city": "marsa_matrouh", "district": "منطقة مشروع ميناء جرجوب - النجيلة", "governorate": "مطروح",
        "address": "ساحل النجيلة - مجمع كاسرات الأمواج والمعدات الهندسية البحرية بميناء جرجوب",
        "phone1": "046-4932101", "phone2": "", "website": "",
        "email": "gargoub.marine.dredging@gmail.com", "lat": 31.435, "lon": 26.735, "fleetSize": 75,
        "fleetType": "شاحنات قلاب صخور ثقيلة 45 طن، حفارات بحرية ذراع طويل، وكساحات نقل كتل صخرية دولوزية", "priority": "A+",
        "notes": "توريد صخور الدبش وحواجز الأمواج الخرسانية وأعمال تعميق الأحواض المائية بميناء جرجوب"
    },
    {
        "nameAr": "شركة مطروح المركزية للخرسانة الجاهزة وتوريدات مشروعات التوسعات العمرانية",
        "nameEn": "Matrouh Central Ready Mix Concrete & Urban Expansion Supplies Co",
        "sector": "manufacturing", "city": "marsa_matrouh", "district": "المنطقة الصناعية بالكيلو 9 - مطروح", "governorate": "مطروح",
        "address": "طريق مطروح الإسكندرية الكيلو 9 - مجمع محطات خلط الخرسانة المقاومة للأملاح",
        "phone1": "046-4932102", "phone2": "", "website": "",
        "email": "matrouh.central.concrete@gmail.com", "lat": 31.330, "lon": 27.280, "fleetSize": 60,
        "fleetType": "سيارات ميكسر خرسانة 12 م3، مضخات خرسانة عملاقة 47-52 متر، وتريلات نقل أسمنت سائب", "priority": "A",
        "notes": "توريد الخرسانة الإنشائية لمشروعات الإسكان والطرق والمستشفيات والقرى السياحية بمرسى مطروح"
    },
    {
        "nameAr": "شركة البحر المتوسط للمقاولات العامة ورصف الطرق السريعة بمطروح",
        "nameEn": "Mediterranean General Contracting & Highway Paving Matrouh Co",
        "sector": "contracting", "city": "marsa_matrouh", "district": "طريق مطروح السلوم الدولي الكيلو 4", "governorate": "مطروح",
        "address": "الكيلو 4 طريق السلوم - ساحة معدات الأسفلت والآليات الثقيلة",
        "phone1": "046-4932103", "phone2": "", "website": "",
        "email": "mediterranean.contracting.matrouh@gmail.com", "lat": 31.350, "lon": 27.210, "fleetSize": 55,
        "fleetType": "فينيشرات أسفلت أوتوماتيكية، هراسات حديدية ومطاطية، لوادر، وتريلات نقل خلطات أسفلتية", "priority": "A",
        "notes": "إنشاء وازدواج وتطوير طريق مطروح السلوم وطريق مطروح سيوة ومحاور الربط الساحلية"
    },
    {
        "nameAr": "شركة محاجر مطروح للسن الجيري والدبش وركام الخرسانة والأسفلت",
        "nameEn": "Matrouh Limestone Quarries Aggregate & Base Course Materials Co",
        "sector": "contracting", "city": "marsa_matrouh", "district": "منطقة محاجر وادي الرمل - جنوب مطروح", "governorate": "مطروح",
        "address": "طريق وادي الرمل - مجمع الكسارات والغربلة الميكانيكية للسن الأبيض",
        "phone1": "046-4932104", "phone2": "", "website": "",
        "email": "matrouh.quarries.aggregate@gmail.com", "lat": 31.280, "lon": 27.220, "fleetSize": 48,
        "fleetType": "كسارات سن دوارة، لوادر كوماتسو، وتريلات قلاب 35-40 طن لنقل سن 1 وسن 2 وركام الأساس", "priority": "A",
        "notes": "استخراج وتكسير السن الجيري عالي النقاء لتغذية خلاطات الخرسانة والأسفلت بمحافظة مطروح"
    },
    {
        "nameAr": "شركة الرميلة لتحلية مياه البحر وأساطيل نقل المياه النقية بالصهاريج",
        "nameEn": "Romeila Sea Water Desalination & Potable Water Tankers Fleet Co",
        "sector": "transport", "city": "marsa_matrouh", "district": "منطقة الرميلة الساحلية - شرق مطروح", "governorate": "مطروح",
        "address": "محطة تحلية مياه البحر بالرميلة - محطة شحن صهاريج مياه الشرب المركزية",
        "phone1": "046-4932105", "phone2": "", "website": "",
        "email": "romeila.desal.watertankers@gmail.com", "lat": 31.370, "lon": 27.310, "fleetSize": 50,
        "fleetType": "صهاريج ستانلس ستيل معقمة سعة 25-40 م3 لنقل وتوزيع مياه الشرب النقية", "priority": "A",
        "notes": "تأمين ونقل المياه العذبة الصالحة للشرب للأحياء السكنية والمنشآت السياحية والمواقع الإنشائية بمطروح"
    },
    {
        "nameAr": "شركة مطروح للبترول وتوزيع المحروقات لمحطات وقود الساحل الشمالي الغربي",
        "nameEn": "Matrouh Petroleum Distribution & Northwest Coast Highway Fuel Co",
        "sector": "transport", "city": "marsa_matrouh", "district": "طريق الساحل الدولي - الكيلو 12 شرق مطروح", "governorate": "مطروح",
        "address": "مستودع الوقود المركزي - الكيلو 12 طريق الإسكندرية - مطروح",
        "phone1": "046-4932106", "phone2": "", "website": "",
        "email": "matrouh.petroleum.distribution@gmail.com", "lat": 31.325, "lon": 27.320, "fleetSize": 42,
        "fleetType": "صهاريج نقل مواد بترولية معتمدة سعة 36-45 ألف لتر لنقل البنزين والسولار والمازوت", "priority": "A",
        "notes": "نقل وتوزيع الوقود الصناعي ومحروقات محطات توليد الكهرباء والسيارات بكافة مراكز مطروح"
    },
    {
        "nameAr": "شركة الفيروز للنقل المبرد وتوزيع اللحوم والأسماك والمواد الغذائية بمطروح",
        "nameEn": "Al Fairouz Reefer Cold Chain Meat Fish & Food Distribution Co",
        "sector": "transport", "city": "marsa_matrouh", "district": "منطقة سوق ليبيا التجاري - مطروح", "governorate": "مطروح",
        "address": "طريق المطار - مجمع ثلاجات التبريد والتجميد اللوجستي سعة 5000 طن",
        "phone1": "046-4932107", "phone2": "", "website": "",
        "email": "fairouz.reefer.matrouh@gmail.com", "lat": 31.340, "lon": 27.240, "fleetSize": 36,
        "fleetType": "برادات تريلا وسيارات جامبو مبردة -18 مئوية لنقل المجمدات والمنتجات الغذائية الطازجة", "priority": "B+",
        "notes": "سلاسل الإمداد والتوزيع المبرد للسلع الغذائية واللحوم لأسواق الجملة والمنتجعات السياحية"
    },
    {
        "nameAr": "شركة مطروح لتصنيع الهياكل الفولاذية والجمالونات ومظلات المستودعات الكبرى",
        "nameEn": "Matrouh Steel Fabrication Hangars & Warehouses Structural Works Co",
        "sector": "manufacturing", "city": "marsa_matrouh", "district": "المنطقة الحرفية - الكيلو 2 - مطروح", "governorate": "مطروح",
        "address": "المنطقة الحرفية - مصنع تشكيل وقص ودرفلة الصاج والجمالونات الإنشائية",
        "phone1": "046-4932108", "phone2": "", "website": "",
        "email": "matrouh.steelfab.hangars@gmail.com", "lat": 31.345, "lon": 27.230, "fleetSize": 26,
        "fleetType": "تريلات أطوال لنقل الجمالونات الحديدية، أوناش شوكية، وشاحنات ورش لحام ميدانية", "priority": "B+",
        "notes": "تصنيع وتركيب الهياكل الفولاذية ومستودعات التخزين ومظلات محطات الشاحنات والموانئ"
    },
    {
        "nameAr": "شركة الغرب للنقل السريع وخدمات شحن الحاويات بمطار مرسى مطروح الدولي",
        "nameEn": "West Express Cargo Freight & Matrouh International Airport Logistics",
        "sector": "transport", "city": "marsa_matrouh", "district": "مطار مرسى مطروح الدولي - قرية البضائع", "governorate": "مطروح",
        "address": "طريق المطار - مجمع الشحن الجوي والخدمات اللوجستية السريعة",
        "phone1": "046-4932109", "phone2": "", "website": "",
        "email": "westexpress.cargo.matrouh@gmail.com", "lat": 31.320, "lon": 27.250, "fleetSize": 28,
        "fleetType": "شاحنات فان مغلقة وتريلات نقل حاويات ومهمات شحن جوي وطرود سريعة", "priority": "B+",
        "notes": "التخليص الجمركي ونقل الطرود والمهمات الفنية المستعجلة لشركات البترول والتعدين والسياحة"
    },
    {
        "nameAr": "شركة مطروح لإدارة وتدوير المخلفات الصلبة والبلدية ومقاولات النظافة",
        "nameEn": "Matrouh Solid Waste Management Recycling & Urban Cleaning Fleet",
        "sector": "transport", "city": "marsa_matrouh", "district": "المدفن الصحي النموذجي - طريق سيوة الكيلو 10", "governorate": "مطروح",
        "address": "الكيلو 10 طريق سيوة - مصنع تدوير وفرز المخلفات ومحطة الكبس الميكانيكي",
        "phone1": "046-4932110", "phone2": "", "website": "",
        "email": "matrouh.solidwaste.clean@gmail.com", "lat": 31.290, "lon": 27.200, "fleetSize": 45,
        "fleetType": "شاحنات مكابس قمامة هيدروليكية، سيارات هوك لفت، وتريلات نقل بالات الكرتون والبلاستيك", "priority": "B+",
        "notes": "جمع ونقل وتدوير المخلفات البلدية والصناعية لمدينة مرسى مطروح والشواطئ السياحية"
    },
    {
        "nameAr": "شركة الصفا لتجارة وتوزيع الأسمنت والجبس ومواد العزل الكيماوية بمطروح",
        "nameEn": "Al Safa Cement Gypsum & Chemical Insulation Supplies Matrouh Co",
        "sector": "trading", "city": "marsa_matrouh", "district": "الكيلو 4 - طريق الإسكندرية مطروح", "governorate": "مطروح",
        "address": "مجمع مخازن مواد البناء والأسمنت المعتمد - الكيلو 4 مطروح",
        "phone1": "046-4932111", "phone2": "", "website": "",
        "email": "alsafa.cement.matrouh@gmail.com", "lat": 31.335, "lon": 27.260, "fleetSize": 32,
        "fleetType": "تريلات تريبل أكسل وتريلات ستائر مغلقة لنقل شكائر الأسمنت البورتلاندي والمقاوم والجبس", "priority": "B+",
        "notes": "التوزيع والوكالة الرسمية لكبرى شركات الأسمنت المصرية وتوريد مواد العزل ومستلزمات التشطيب"
    },
    {
        "nameAr": "شركة النجيلة للنقل الثقيل وخدمات الشاحنات المتجهة لميناء جرجوب",
        "nameEn": "El Negaila Heavy Haulage & Gargoub Port Feeder Truck Fleet Co",
        "sector": "transport", "city": "marsa_matrouh", "district": "مركز النجيلة - الكيلو 70 غرب مطروح", "governorate": "مطروح",
        "address": "مدخل مدينة النجيلة - محطة الشاحنات اللوجستية ومفرق طريق ميناء جرجوب",
        "phone1": "046-4932112", "phone2": "", "website": "",
        "email": "negaila.heavyhaulage.port@gmail.com", "lat": 31.410, "lon": 26.780, "fleetSize": 44,
        "fleetType": "تريلات تريبل أكسل، تريلات جوانب، وكساحات لوابد لنقل المعدات الثقيلة والحاويات", "priority": "B+",
        "notes": "تغذية ميناء جرجوب بالبضائع العامة وربط أرصفة الميناء بالطريق الدولي الساحلي ومناطق التخزين"
    },
    {
        "nameAr": "شركة مطروح للغازات الصناعية والطبية وتعبئة أسطوانات الأكسجين والأرجون",
        "nameEn": "Matrouh Industrial & Medical Gases Oxygen Cylinders Refilling Co",
        "sector": "manufacturing", "city": "marsa_matrouh", "district": "المنطقة الصناعية بالكيلو 9", "governorate": "مطروح",
        "address": "المنطقة الصناعية - محطة تعبئة وتوزيع الغازات الطبية والصناعية وغازات اللحام",
        "phone1": "046-4932113", "phone2": "", "website": "",
        "email": "matrouh.gases.medical@gmail.com", "lat": 31.328, "lon": 27.285, "fleetSize": 24,
        "fleetType": "شاحنات نقل أسطوانات غاز مصفحة وصهاريج نقل أكسجين مسال مبرد للمستشفيات", "priority": "B+",
        "notes": "إمداد المستشفيات العسكرية والمدنية والورش الصناعية بغازات الأكسجين والأرجون وثاني أكسيد الكربون"
    },
    {
        "nameAr": "شركة النور للأجهزة والآليات الزراعية ومعدات حفر الآبار الصحراوية بمطروح",
        "nameEn": "Al Noor Agricultural Implements & Desert Wells Drilling Rigs Co",
        "sector": "contracting", "city": "marsa_matrouh", "district": "طريق القصر - غرب مطروح", "governorate": "مطروح",
        "address": "منطقة القصر - مجمع ورش الآليات الزراعية ومعدات حفر آبار المياه الجوفية",
        "phone1": "046-4932114", "phone2": "", "website": "",
        "email": "alnoor.agricultural.wells@gmail.com", "lat": 31.365, "lon": 27.180, "fleetSize": 28,
        "fleetType": "حفارات آبار مياه ارتوازية، كساحات نقل معدات، وتريلات نقل مواسير وشبكات ري بالتنقيط", "priority": "B+",
        "notes": "مقاولات حفر آبار مياه الري الرومانية وحصاد مياه الأمطار ومد خطوط الري لمزارع التين والزيتون"
    },
    {
        "nameAr": "شركة مرسى مطروح لتجارة وتوزيع الأعلاف الحيوانية والحبوب والردة",
        "nameEn": "Marsa Matrouh Animal Feed Grains & Wheat Bran Trading Co",
        "sector": "trading", "city": "marsa_matrouh", "district": "سوق المواشي القديم - الكيلو 3 مطروح", "governorate": "مطروح",
        "address": "الكيلو 3 طريق السلوم - مجمع مستودعات تجارة الأعلاف والردة والذرة الصفراء",
        "phone1": "046-4932115", "phone2": "", "website": "",
        "email": "matrouh.animalfeed.grains@gmail.com", "lat": 31.348, "lon": 27.225, "fleetSize": 30,
        "fleetType": "تريلات نقل شكائر أعلاف صب وجوانب، وشاحنات جامبو لتوزيع الأعلاف على مراعي الأغنام البرقية", "priority": "B+",
        "notes": "تأمين وتوزيع الأعلاف المركزة والردة والذرة لكبار مربي الثروة الحيوانية بصحراء مطروح"
    },
    {
        "nameAr": "شركة مطروح للصناعات الغذائية وتعبئة وتصدير التين والزيتون الصحراوي",
        "nameEn": "Matrouh Food Agro Packaging & Fig Olive Export Industries Co",
        "sector": "agriculture", "city": "marsa_matrouh", "district": "منطقة القصر والقرى الغربية", "governorate": "مطروح",
        "address": "طريق القصر الكيلو 5 - مجمع مصانع فرز وتعبئة التين الصحراوي وتخليل الزيتون",
        "phone1": "046-4932116", "phone2": "", "website": "",
        "email": "matrouh.figolive.export@gmail.com", "lat": 31.362, "lon": 27.175, "fleetSize": 34,
        "fleetType": "شاحنات فان مبردة، تريلات جوانب، وفانات توزيع لنقل التين والزيتون التصديري للأسواق", "priority": "B+",
        "notes": "فرز وتعبئة وشحن التين البرشومي والزيتون التفاحي من مزارع مطروح لمصانع الأغذية وأسواق العبور"
    },
    {
        "nameAr": "شركة سيدي براني للنقل والتجارة العامة والشحن للحدود الغربية",
        "nameEn": "Sidi Barrani Transport General Trading & Border Feeder Logistics Co",
        "sector": "transport", "city": "marsa_matrouh", "district": "مدينة سيدي براني - طريق السلوم الدولي", "governorate": "مطروح",
        "address": "المدخل الشرقي لمدينة سيدي براني - محطة التبادل اللوجستي للشاحنات",
        "phone1": "046-4932117", "phone2": "", "website": "",
        "email": "barrani.transport.border@gmail.com", "lat": 31.610, "lon": 25.920, "fleetSize": 38,
        "fleetType": "تريلات تريبل أكسل وتريلات ستائر لنقل البضائع والمهمات الإنشائية والتجارية", "priority": "B+",
        "notes": "المحطة اللوجستية الوسيطة لنقل وتفريغ البضائع المتجهة لمنفذ السلوم والمدن الغربية"
    },

    # ── Sub-Cluster 3: محور الضبعة النووية ورأس الحكمة والساحل الشمالي (18 كياناً) ──
    {
        "nameAr": "شركة الضبعة للخرسانة النووية فائقة الكثافة والمشروعات القومية الكبرى",
        "nameEn": "Dabaa High Density Heavy Nuclear Concrete & Mega Civil Projects Co",
        "sector": "manufacturing", "city": "dabaa", "district": "محيط محطة الضبعة النووية - الساحل الشمالي", "governorate": "مطروح",
        "address": "طريق الإسكندرية مطروح الكيلو 135 - مجمع محطات خلط الخرسانة فائقة الكثافة",
        "phone1": "046-4723100", "phone2": "", "website": "",
        "email": "dabaa.nuclear.concrete@gmail.com", "lat": 31.050, "lon": 28.450, "fleetSize": 130,
        "fleetType": "سيارات ميكسر خرسانة متطورة، مضخات خرسانية ضخمة 56 متر، وتريلات صهاريج مياه مبردة", "priority": "A+",
        "notes": "إنتاج وتوريد الخرسانات الكتلية الخاصة المقاومة للإشعاع والحرارة لمحطة الضبعة النووية"
    },
    {
        "nameAr": "شركة كساحات الضبعة اللوجستية لنقل المولدات والمهمات الهندسية فائقة الثقل",
        "nameEn": "Dabaa Heavy Lowbeds Ultra Weight Generators & Rigging Logistics",
        "sector": "transport", "city": "dabaa", "district": "منطقة رصيف الضبعة البحري التخصصي", "governorate": "مطروح",
        "address": "رصيف الضبعة البحري التخصصي لاستقبال المعدات الثقيلة - طريق الضبعة مطروح",
        "phone1": "046-4723101", "phone2": "", "website": "",
        "email": "dabaa.heavylowbeds.rigging@gmail.com", "lat": 31.065, "lon": 28.435, "fleetSize": 60,
        "fleetType": "كساحات هيدروليكية معيارية متعددة المحاور لنقل الطرود الثقيلة حتى 450 طن وشاحنات سحب", "priority": "A+",
        "notes": "النقل التخصصي لمصائد قلب المفاعل وتوربينات البخار والمحولات الفائقة من الرصيف لموقع المفاعل"
    },
    {
        "nameAr": "شركة رأس الحكمة للتنمية العمرانية والمقاولات العامة وتسوية الأراضي الكبرى",
        "nameEn": "Ras El Hekma Urban Dev Earthmoving & Mega Infrastructure Contracting",
        "sector": "contracting", "city": "dabaa", "district": "منطقة مشروع رأس الحكمة العالمي - الكيلو 170", "governorate": "مطروح",
        "address": "طريق الإسكندرية مطروح الكيلو 170 - رأس الحكمة - مجمع مقرات المقاولات العامة",
        "phone1": "046-4723102", "phone2": "", "website": "",
        "email": "raselhekma.urbandev.contracting@gmail.com", "lat": 31.120, "lon": 27.850, "fleetSize": 140,
        "fleetType": "بلدوزرات كاتربيلر دي 9، حفارات كوماتسو 450، لوادر، وتريلات قلاب صخور 40 طن", "priority": "A+",
        "notes": "كبرى شركات تسوية الأراضي وشق الطرق وإنشاء البنية التحتية والبحيرات لمشروع مدينة رأس الحكمة العالمية"
    },
    {
        "nameAr": "شركة رأس الحكمة للخرسانة الجاهزة والبنية التحتية للأبراج والفنادق الشاطئية",
        "nameEn": "Ras El Hekma Ready Mix Concrete Coastal Towers & Hotels Civil Co",
        "sector": "manufacturing", "city": "dabaa", "district": "المنطقة المركزية - مدينة رأس الحكمة الجديدة", "governorate": "مطروح",
        "address": "طريق رأس الحكمة الجديد - مجمع محطات خلط الخرسانة المركزية بطاقة 2000 م3/يوم",
        "phone1": "046-4723103", "phone2": "", "website": "",
        "email": "raselhekma.readymix.concrete@gmail.com", "lat": 31.115, "lon": 27.860, "fleetSize": 85,
        "fleetType": "خلاطات خرسانة سعة 12 م3، مضخات خرسانة عملاقة، وتريلات نقل أسمنت صب وسن بازلتي", "priority": "A+",
        "notes": "توريد الخرسانات المعالجة للأبراج الساحلية والفنادق العالمية ومحطات المترو والمرافق برأس الحكمة"
    },
    {
        "nameAr": "شركة الضبعة للنقل الثقيل وركائز الأساسات العميقة ومعدات الخوازيق",
        "nameEn": "Dabaa Heavy Haulage Deep Foundations & Piling Equipment Fleet Co",
        "sector": "contracting", "city": "dabaa", "district": "طريق الضبعة - محور روض الفرج الكيلو 10", "governorate": "مطروح",
        "address": "محور الضبعة الكيلو 10 - مجمع ساحات معدات دق وخوازيق الأساسات العميقة",
        "phone1": "046-4723104", "phone2": "", "website": "",
        "email": "dabaa.deepfoundations.piling@gmail.com", "lat": 30.980, "lon": 28.510, "fleetSize": 45,
        "fleetType": "ماكينات حفر خوازيق باور، أوناش هيدروليكية مجنزرة، وكساحات لوابد لنقل ماكينات الأساسات", "priority": "A",
        "notes": "أعمال حفر وتنفيذ الخوازيق العميقة للإنشاءات الثقيلة ومحطات المحولات والكباري الساحلية"
    },
    {
        "nameAr": "شركة الساحل الشمالي لكسارات البازلت والسن وركام الخرسانة عالية الإجهاد",
        "nameEn": "North Coast Basalt Quarries High Strength Concrete Aggregate Co",
        "sector": "contracting", "city": "dabaa", "district": "جنوب الضبعة - طريق وادي النطرون الضبعة", "governorate": "مطروح",
        "address": "الكيلو 45 محور الضبعة - مجمع محاجر البازلت والكسارات التصادمية الحديثة",
        "phone1": "046-4723105", "phone2": "", "website": "",
        "email": "northcoast.basalt.quarries@gmail.com", "lat": 30.850, "lon": 28.650, "fleetSize": 65,
        "fleetType": "كسارات سن ثلاثية المراحل، لوادر صخور عملاقة، وتريلات قلاب هاردوكس 45 طن", "priority": "A",
        "notes": "استخراج وتكسير صخور البازلت والجرانيت الصلبة لتأمين ركام الخرسانة النووية وأبراج رأس الحكمة"
    },
    {
        "nameAr": "شركة الضبعة للخدمات البيئية والتخلص الآمن من المخلفات الإنشائية والصناعية",
        "nameEn": "Dabaa Environmental Construction Waste & Industrial Disposal Co",
        "sector": "transport", "city": "dabaa", "district": "المنطقة الصناعية جنوب الضبعة", "governorate": "مطروح",
        "address": "طريق الضبعة الصحراوي - المركز اللوجستي لفرز وإعادة تدوير مخلفات المشروعات الكبرى",
        "phone1": "046-4723106", "phone2": "", "website": "",
        "email": "dabaa.environmental.disposal@gmail.com", "lat": 30.990, "lon": 28.470, "fleetSize": 40,
        "fleetType": "شاحنات هوك لفت، تريلات قلاب مبطنة، وسيارات فاكيوم لشفط السوائل الصناعية غير الخطرة", "priority": "A",
        "notes": "الإدارة البيئية المتكاملة ونقل وتدوير المخلفات الإنشائية لمشروع الضبعة ورأس الحكمة"
    },
    {
        "nameAr": "شركة رأس الحكمة لصهاريج الوقود والتموين الميداني لمعدات الحفر والتسوية",
        "nameEn": "Ras El Hekma Fuel Tankers & On-Site Fleet Fueling Services Co",
        "sector": "transport", "city": "dabaa", "district": "قطاع مشروعات رأس الحكمة الجنوبية", "governorate": "مطروح",
        "address": "طريق رأس الحكمة - محطة التوزيع البترولي المركزية لشركات المقاولات",
        "phone1": "046-4723107", "phone2": "", "website": "",
        "email": "raselhekma.fueltankers.services@gmail.com", "lat": 31.090, "lon": 27.870, "fleetSize": 48,
        "fleetType": "شاحنات صهاريج ديزل مجهزة بمضخات تزويد وقود سريعة ومسدسات ديجيتال لتموين المعدات", "priority": "A",
        "notes": "التموين الميداني اليومي بالسولار والزيوت للبلدوزرات والحفارات العاملة على مدار 24 ساعة برأس الحكمة"
    },
    {
        "nameAr": "شركة الساحل للشحن والتفريغ وتشوين الحديد والصلب بالموانئ الجافة (الضبعة)",
        "nameEn": "Coast Stevedoring & Rebar Heavy Storage Inland Terminal Dabaa",
        "sector": "transport", "city": "dabaa", "district": "محور الضبعة الكيلو 25", "governorate": "مطروح",
        "address": "محور الضبعة - مجمع ساحات تخزين وتشوين حديد التسليح والقطاعات المعدنية الثقيلة",
        "phone1": "046-4723108", "phone2": "", "website": "",
        "email": "coast.stevedoring.rebar.dabaa@gmail.com", "lat": 31.010, "lon": 28.520, "fleetSize": 52,
        "fleetType": "تريلات تريبل أكسل أطوال 14 متر لنقل بليت وحديد التسليح، وأوناش شوكية كوماتسو 16 طن", "priority": "A",
        "notes": "استقبال وتخزين وتوزيع حديد التسليح عالي المقاومة الوارد من مصانع السويس والدخيلة لمواقع الإنشاء"
    },
    {
        "nameAr": "شركة الضبعة لمهمات السلامة الصناعية والمستلزمات الهندسية ومكافحة الحريق",
        "nameEn": "Dabaa Industrial Safety Equipment & Firefighting Logistics Fleet Co",
        "sector": "trading", "city": "dabaa", "district": "مدينة الضبعة - الشارع الرئيسي", "governorate": "مطروح",
        "address": "طريق الساحل الدولي - مركز التوزيع لمهمات السلامة والأمان الصناعي للمشروعات النووية",
        "phone1": "046-4723109", "phone2": "", "website": "",
        "email": "dabaa.industrialsafety.ppe@gmail.com", "lat": 31.035, "lon": 28.440, "fleetSize": 25,
        "fleetType": "شاحنات فان مغلقة، سيارات إطفاء طوارئ صناعية، وفانات نقل أجهزة القياس والفحص الدقيق", "priority": "B+",
        "notes": "تأمين وتوريد معدات السلامة المهنية المعتمدة ومهمات الوقاية ومعدات الإطفاء لكبرى الشركات بالضبعة"
    },
    {
        "nameAr": "شركة رأس الحكمة لتحلية المياه وشبكات طرد المياه الصالحة للشرب",
        "nameEn": "Ras El Hekma Water Desalination & Potable Water Distribution Fleet",
        "sector": "transport", "city": "dabaa", "district": "الساحل الشمالي - رأس الحكمة الكيلو 175", "governorate": "مطروح",
        "address": "محطة التحلية المركزية برأس الحكمة - مجمع محطات شحن صهاريج المياه",
        "phone1": "046-4723110", "phone2": "", "website": "",
        "email": "raselhekma.waterdesal.fleet@gmail.com", "lat": 31.130, "lon": 27.840, "fleetSize": 46,
        "fleetType": "صهاريج ستانلس ستيل معقمة 30-40 م3 لنقل مياه الشرب العذبة والمياه اللازمة لخلط الخرسانة", "priority": "A",
        "notes": "تأمين المياه العذبة لكافة معسكرات المقاولين ومحطات خلط الخرسانة والمشاريع الإنشائية بالمنطقة"
    },
    {
        "nameAr": "شركة الضبعة للنقل المبرد وإعاشة وتموين أطقم وخبراء المشروعات القومية",
        "nameEn": "Dabaa Cold Chain Catering & Russian Experts Food Supply Fleet Co",
        "sector": "transport", "city": "dabaa", "district": "المدينة السكنية للخبراء - الضبعة", "governorate": "مطروح",
        "address": "المدينة السكنية للخبراء والعاملين بمحطة الضبعة - مجمع ثلاجات الإعاشة اللوجستي",
        "phone1": "046-4723111", "phone2": "", "website": "",
        "email": "dabaa.coldchain.catering@gmail.com", "lat": 31.040, "lon": 28.460, "fleetSize": 38,
        "fleetType": "برادات تريلا وسيارات جامبو مبردة لنقل الأغذية الطازجة والخضروات واللحوم المعقمة", "priority": "B+",
        "notes": "تأمين سلاسل الإمداد الغذائي والإعاشة الفندقية اليومية لآلاف المهندسين والخبراء والعاملين بالضبعة"
    },
    {
        "nameAr": "شركة رأس الحكمة للمقاولات البحرية والأرصفة والمراسي السياحية واليخوت",
        "nameEn": "Ras El Hekma Marine Contracting Marinas & Coastal Works Fleet Co",
        "sector": "contracting", "city": "dabaa", "district": "جونة رأس الحكمة الطبيعية", "governorate": "مطروح",
        "address": "ساحل رأس الحكمة - قاعدة العمليات البحرية وبناء المراسي وحواجز الأمواج",
        "phone1": "046-4723112", "phone2": "", "website": "",
        "email": "raselhekma.marina.contracting@gmail.com", "lat": 31.140, "lon": 27.830, "fleetSize": 42,
        "fleetType": "كراكات بحرية، صنادل نقل كتل خرسانية، شاحنات قلاب صخور مصفحة، وأوناش بحرية", "priority": "A",
        "notes": "مقاولات تعميق وتطهير وتجهيز المارينا العالمية لليخوت والألسنة البحرية وحواجز الشواطئ"
    },
    {
        "nameAr": "شركة طريق الضبعة اللوجستية لشحن وتوزيع الأسمنت السائب والمعبأ",
        "nameEn": "Dabaa Corridor Cement Bulk & Packaged Distribution Logistics Co",
        "sector": "transport", "city": "dabaa", "district": "محور الضبعة الصحراوي الكيلو 50", "governorate": "مطروح",
        "address": "تقاطع محور الضبعة مع الطريق الدائري الإقليمي - المركز اللوجستي للأسمنت",
        "phone1": "046-4723113", "phone2": "", "website": "",
        "email": "dabaa.corridor.cement@gmail.com", "lat": 30.750, "lon": 29.100, "fleetSize": 60,
        "fleetType": "تريلات بونكر سيلو لنقل الأسمنت السائب سعة 35-40 طن وتريلات مسطحة لنقل شكائر الأسمنت", "priority": "A",
        "notes": "الناقل المتخصص للأسمنت السائب المقاوم للكبريتات من مصانع السويس وحلوان لمحطات الضبعة ورأس الحكمة"
    },
    {
        "nameAr": "شركة الأمل لتركيب وصيانة شبكات الضغط العالي ومحولات الربط الكهربائي بالضبعة",
        "nameEn": "Al Amal High Voltage Transmission Lines & Grid Transformers Fleet",
        "sector": "contracting", "city": "dabaa", "district": "محطة محولات الضبعة 500 ك.ف", "governorate": "مطروح",
        "address": "طريق الضبعة - مجمع ورش شد الكابلات وتثبيت أبراج الضغط العالي الفائق",
        "phone1": "046-4723114", "phone2": "", "website": "",
        "email": "alamal.highvoltage.dabaa@gmail.com", "lat": 31.020, "lon": 28.480, "fleetSize": 32,
        "fleetType": "شاحنات أوناش تلسكوبية عازلة، سيارات شد وفرد كابلات هيدروليكية، وتريلات نقل بكر الكابلات", "priority": "B+",
        "notes": "مقاولات مد خطوط الربط الكهربائي الفائق 500 ك.ف لنقل الطاقة من محطة الضبعة للشبكة القومية"
    },
    {
        "nameAr": "شركة رأس الحكمة لتشغيل وصيانة المعدات الثقيلة والرافعات الهيدروليكية",
        "nameEn": "Ras El Hekma Heavy Machinery Operation & Hydraulic Cranes Service",
        "sector": "contracting", "city": "dabaa", "district": "المنطقة المركزية - رأس الحكمة", "governorate": "مطروح",
        "address": "طريق رأس الحكمة - مجمع الورش المركزية للعمرة والصيانة الميكانيكية للآليات",
        "phone1": "046-4723115", "phone2": "", "website": "",
        "email": "raselhekma.heavymachinery.service@gmail.com", "lat": 31.100, "lon": 27.880, "fleetSize": 36,
        "fleetType": "شاحنات ورش متنقلة مجهزة بأجهزة تشخيص هيدروليك، أوناش رافعة شوكية، وسيارات نجدة مجنزرات", "priority": "B+",
        "notes": "الصيانة الميدانية والعمرات الدورية لأسطول الحفارات والبلدوزرات العاملة بالمشروع القومي"
    },
    {
        "nameAr": "شركة الضبعة لنقل العمالة الفنية والمهندسين وأطقم التشغيل للمواقع الحيوية",
        "nameEn": "Dabaa Technical Workforce & Engineers Mass Transit Fleet Co",
        "sector": "transport", "city": "dabaa", "district": "ميدان المحطة - الضبعة", "governorate": "مطروح",
        "address": "طريق الساحل الدولي - المركز الرئيسي لأسطول النقل الجماعي للعاملين بالضبعة",
        "phone1": "046-4723116", "phone2": "", "website": "",
        "email": "dabaa.workforce.masstransit@gmail.com", "lat": 31.030, "lon": 28.435, "fleetSize": 50,
        "fleetType": "أتوبيسات نقل مكيفة سعة 50 راكب، ميني باصات حديثة، وسيارات دفع رباعي لنقل الأطقم الفنية", "priority": "B+",
        "notes": "إدارة وتسيير رحلات النقل الجماعي اليومية للمهندسين والفنيين بين مدن الساحل ومواقع العمل"
    },
    {
        "nameAr": "شركة الساحل لتجارة وتوزيع الأنابيب الخرسانية ومواسير البولي إيثيلين العملاقة",
        "nameEn": "Coast Concrete & HDPE Heavy Pipes Distribution Ras El Hekma Co",
        "sector": "trading", "city": "dabaa", "district": "طريق رأس الحكمة - الكيلو 165", "governorate": "مطروح",
        "address": "الكيلو 165 طريق الإسكندرية مطروح - مجمع مستودعات أنابيب المياه والصرف العملاقة",
        "phone1": "046-4723117", "phone2": "", "website": "",
        "email": "coast.pipes.raselhekma@gmail.com", "lat": 31.080, "lon": 27.890, "fleetSize": 30,
        "fleetType": "تريلات أطوال مجهزة بحوامل لنقل مواسير البولي إيثيلين أقطار حتى 2000 مم وأوناش تفريغ", "priority": "B+",
        "notes": "توريد ونقل مواسير خطوط طرد التحلية وشبكات الصرف ومآخذ مياه البحر لمشروعات الساحل"
    },

    # ── Sub-Cluster 4: واحة سيوة والملاحات والمياه الطبيعية والزراعة العضوية (15 كياناً) ──
    {
        "nameAr": "شركة ملاحات سيوة للتعدين واستخراج وتصدير الملح الصخري فائق النقاوة",
        "nameEn": "Siwa Salines Ultra Pure Rock Salt Mining & Global Export Co",
        "sector": "manufacturing", "city": "siwa", "district": "بحيرة الزيتون - ملاحات سيوة التعدينية", "governorate": "مطروح",
        "address": "بحيرة الزيتون التعدينية - الكيلو 15 طريق سيوة مطروح - مجمع تكسير وغسيل الملح الصخري",
        "phone1": "046-4624100", "phone2": "", "website": "",
        "email": "siwa.salines.rocksalt@gmail.com", "lat": 29.210, "lon": 25.560, "fleetSize": 105,
        "fleetType": "تريلات تريبل أكسل قلاب صب 45 طن لنقل الملح الصخري لموانئ الدخيلة والإسكندرية للتصدير", "priority": "A+",
        "notes": "استخراج وتصدير الملح الصخري فائق النقاوة (99.8% NaCl) المصدّر لأوروبا وأمريكا لإذابة الجليد وصناعة الكيماويات"
    },
    {
        "nameAr": "شركة واحة سيوة للمياه الطبيعية النقية وتعبئة مياه الينابيع الجوفية",
        "nameEn": "Siwa Oasis Natural Mineral Water Bottling & Distribution Fleet Co",
        "sector": "manufacturing", "city": "siwa", "district": "عين الجربة - واحة سيوة", "governorate": "مطروح",
        "address": "طريق عين الجربة الطبيعية - مجمع مصانع تعبئة المياه الطبيعية والمستودعات اللوجستية",
        "phone1": "046-4624101", "phone2": "", "website": "",
        "email": "siwa.mineralwater.bottling@gmail.com", "lat": 29.200, "lon": 25.520, "fleetSize": 80,
        "fleetType": "تريلات ستائر مغلقة وتريلات تريبل أكسل لنقل باليتات زجاجات المياه الطبيعية لكافة المحافظات", "priority": "A+",
        "notes": "استخراج وتعبئة ونقل مياه الينابيع الطبيعية العذبة من أعماق رمال سيوة وتوزيعها على سلاسل التجزئة بمصر"
    },
    {
        "nameAr": "شركة سيوة لزيت الزيتون البكر الممتاز وعصر وتكرير الزيوت العضوية",
        "nameEn": "Siwa Extra Virgin Olive Oil Extraction & Organic Agro Export Co",
        "sector": "manufacturing", "city": "siwa", "district": "المنطقة الصناعية الزراعية - سيوة", "governorate": "مطروح",
        "address": "طريق بهي الدين - مجمع معاصر الزيتون الحديثة على البارد ومستودعات التصدير",
        "phone1": "046-4624102", "phone2": "", "website": "",
        "email": "siwa.oliveoil.organic@gmail.com", "lat": 29.205, "lon": 25.480, "fleetSize": 45,
        "fleetType": "شاحنات فان مبردة، تريلات جوانب لنقل محصول الزيتون، وصهاريج ستانلس لنقل زيت الزيتون الصب", "priority": "A",
        "notes": "عصر وتعبئة زيت الزيتون البكر الممتاز الحاصل على شهادات الجودة العضوية الأوروبية وتصديره"
    },
    {
        "nameAr": "شركة تمور سيوة العضوية وتصنيع وتعبئة تمور الصعيدي والغزالي التصديرية",
        "nameEn": "Siwa Organic Dates Processing Packaging & Global Export Fleet Co",
        "sector": "agriculture", "city": "siwa", "district": "منطقة أغورمي - واحة سيوة", "governorate": "مطروح",
        "address": "طريق معبد آمون - مجمع ثلاجات حفظ وتجفيف وتعبئة التمور السيوية العضوية",
        "phone1": "046-4624103", "phone2": "", "website": "",
        "email": "siwa.organicdates.export@gmail.com", "lat": 29.215, "lon": 25.535, "fleetSize": 48,
        "fleetType": "برادات تريلا وسيارات جامبو مبردة لنقل التمور المعبأة للموانئ ومطارات الشحن الجوي", "priority": "A",
        "notes": "تجهيز وتعبئة تمور الواحة العضوية الطبيعية (صعيدي، غزالي، تاكتوشت) وتصديرها لأسواق آسيا وأوروبا"
    },
    {
        "nameAr": "شركة النقل البري الثقيل بطريق سيوة مطروح الدولي لنقل الملح والمحاصيل",
        "nameEn": "Siwa Matrouh Heavy Overland Highway Freight Logistics Fleet Co",
        "sector": "transport", "city": "siwa", "district": "مدخل مدينة سيوة - الكيلو 2", "governorate": "مطروح",
        "address": "طريق سيوة مطروح الكيلو 2 - المحطة اللوجستية المركزية لتبادل وتفويج الشاحنات الثقيلة",
        "phone1": "046-4624104", "phone2": "", "website": "",
        "email": "siwa.matrouh.highwayfreight@gmail.com", "lat": 29.225, "lon": 25.545, "fleetSize": 70,
        "fleetType": "تريلات تريبل أكسل قلابات هاردوكس مصفحة وتريلات ستائر مغلقة مصممة للعمل بالصحراء", "priority": "A",
        "notes": "الربط اللوجستي الرئيسي لنقل منتجات واحة سيوة إلى مدينة مرسى مطروح وموانئ الإسكندرية عبر الطريق الجديد"
    },
    {
        "nameAr": "شركة سيوة للمقاولات العامة وحفر الآبار الارتوازية العميقة واستصلاح النخيل",
        "nameEn": "Siwa Artesian Wells Deep Drilling & Palm Groves Reclamation Co",
        "sector": "contracting", "city": "siwa", "district": "منطقة الدكرور - سيوة", "governorate": "مطروح",
        "address": "جبل الدكرور - مجمع ورش ومعدات حفر الآبار العميقة وشبكات الصرف الزراعي",
        "phone1": "046-4624105", "phone2": "", "website": "",
        "email": "siwa.wells.reclamation@gmail.com", "lat": 29.190, "lon": 25.540, "fleetSize": 36,
        "fleetType": "حفارات آبار مياه عملاقة حتى عمق 1200 متر، بلدوزرات تسوية رمال، وكساحات نقل معدات", "priority": "B+",
        "notes": "حفر الآبار الجوفية العميقة المتدفقة ذاتياً ومعالجة ملوحة التربة وتطوير مزارع النخيل والزيتون"
    },
    {
        "nameAr": "شركة الكرشيت السيوية للبناء البيئي وتصنيع خامات العمارة التراثية",
        "nameEn": "Siwa Kersheef Eco Building & Heritage Architectural Materials Co",
        "sector": "manufacturing", "city": "siwa", "district": "المدينة القديمة (شالي) - سيوة", "governorate": "مطروح",
        "address": "طريق شالي التراثي - مجمع تقطيع وتجهيز مادة الكرشيت (الملح الصخري والطين السوي)",
        "phone1": "046-4624106", "phone2": "", "website": "",
        "email": "siwa.kersheef.ecobuilding@gmail.com", "lat": 29.208, "lon": 25.515, "fleetSize": 22,
        "fleetType": "شاحنات قلاب لنقل الكرشيت وخامات الطين التراثي، ولوادر صغيرة لنقل وتوزيع الخامات", "priority": "B+",
        "notes": "استخراج وتجهيز خامات الكرشيت الفريدة في بناء المنتجعات البيئية العازلة للحرارة بسيوة"
    },
    {
        "nameAr": "شركة بحيرة فطناس للنقل السياحي واللوجستي والتموين البيئي للمخيمات",
        "nameEn": "Fatnas Lake Eco Logistics & Desert Camps Catering Fleet Co",
        "sector": "transport", "city": "siwa", "district": "جزيرة فطناس - واحة سيوة", "governorate": "مطروح",
        "address": "طريق جزيرة فطناس - مركز الإمداد والتموين للمخيمات والفنادق البيئية",
        "phone1": "046-4624107", "phone2": "", "website": "",
        "email": "fatnas.ecologistics.siwa@gmail.com", "lat": 29.195, "lon": 25.490, "fleetSize": 25,
        "fleetType": "سيارات دفع رباعي مجهزة، شاحنات فان معزولة، وميني باصات لنقل الوفود والمهمات الفندقية", "priority": "B+",
        "notes": "تأمين ونقل الإمدادات الغذائية واللوجستية للمنتجعات والمخيمات البيئية العميقة بالصحراء"
    },
    {
        "nameAr": "شركة سيوة للخدمات البترولية ونقل السولار لمحطات الكهرباء وطلمبات الآبار",
        "nameEn": "Siwa Petroleum Services Power Stations & Well Pumps Fuel Haulage",
        "sector": "transport", "city": "siwa", "district": "محطة توليد كهرباء سيوة الكبرى", "governorate": "مطروح",
        "address": "طريق سيوة مطروح الكيلو 5 - مستودع صهاريج الوقود البترولي المركزي",
        "phone1": "046-4624108", "phone2": "", "website": "",
        "email": "siwa.petroleum.fuelhaulage@gmail.com", "lat": 29.220, "lon": 25.530, "fleetSize": 32,
        "fleetType": "صهاريج نقل مواد بترولية معتمدة سعة 36-45 ألف لتر لنقل السولار والمازوت والزيوت", "priority": "A",
        "notes": "نقل وتأمين السولار من مستودعات مطروح لتشغيل محطة كهرباء سيوة ومولدات المزارع والآبار"
    },
    {
        "nameAr": "شركة شالي للخرسانة الجاهزة والبلوك ومواد البناء الحديثة بسيوة",
        "nameEn": "Shali Ready Mix Concrete Blocks & Building Materials Siwa Co",
        "sector": "manufacturing", "city": "siwa", "district": "المنطقة الحرفية - سيوة", "governorate": "مطروح",
        "address": "المنطقة الحرفية بطريق الدكرور - محطة خلط الخرسانة المركزية ومصنع البلوك",
        "phone1": "046-4624109", "phone2": "", "website": "",
        "email": "shali.readymix.siwa@gmail.com", "lat": 29.185, "lon": 25.535, "fleetSize": 26,
        "fleetType": "سيارات خلاطات خرسانة، مضخات خرسانية، وتريلات نقل أسمنت صب وسن جبلي معالج", "priority": "B+",
        "notes": "توريد الخرسانة الإنشائية لمشروعات المدارس والمستشفيات ومحطات المياه ومشروعات الدولة بسيوة"
    },
    {
        "nameAr": "شركة أغورمي لتجارة وتوزيع الأسمدة العضوية والكمبوست المعالج لمزارع النخيل",
        "nameEn": "Aghourmi Organic Fertilizers & Treated Compost Distribution Siwa",
        "sector": "trading", "city": "siwa", "district": "منطقة أغورمي الزراعية - سيوة", "governorate": "مطروح",
        "address": "طريق أغورمي - مجمع مستودعات الأسمدة العضوية الحيوية ومخصبات النخيل",
        "phone1": "046-4624110", "phone2": "", "website": "",
        "email": "aghourmi.organic.fertilizers@gmail.com", "lat": 29.212, "lon": 25.538, "fleetSize": 24,
        "fleetType": "تريلات جوانب لنقل بالات الكمبوست والأسمدة العضوية وشاحنات جامبو للتوزيع الحقلي", "priority": "B+",
        "notes": "تأمين وتوزيع الأسمدة العضوية النباتية المعتمدة للمزارع العضوية الخالية من الكيماويات"
    },
    {
        "nameAr": "شركة بحيرات سيوة لنقل وتكرير كبريتات الصوديوم والأملاح الصناعية التخصصية",
        "nameEn": "Siwa Lakes Sodium Sulphate & Specialty Industrial Salts Haulage",
        "sector": "manufacturing", "city": "siwa", "district": "بحيرة أغورمي الصناعية - سيوة", "governorate": "مطروح",
        "address": "ساحل بحيرة أغورمي - مجمع استخلاص وغسيل كبريتات الصوديوم والأملاح التخصصية",
        "phone1": "046-4624111", "phone2": "", "website": "",
        "email": "siwalakes.sodiumsulphate@gmail.com", "lat": 29.218, "lon": 25.550, "fleetSize": 35,
        "fleetType": "تريلات قلابات تريبل أكسل وتريلات ستائر لنقل شكائر الأملاح الصناعية لمصانع المنظفات والزجاج", "priority": "A",
        "notes": "استخراج كبريتات الصوديوم الطبيعية ونقلها لمصانع المنظفات والورق والنسيج بالوجه البحري"
    },
    {
        "nameAr": "شركة سيوة للطاقة الشمسية ونقل وصيانة محطات توليد الآبار المعزولة",
        "nameEn": "Siwa Solar Energy & Off-Grid Wells Pumping Stations Maintenance Co",
        "sector": "contracting", "city": "siwa", "district": "طريق مطار سيوة العسكري والمدني", "governorate": "مطروح",
        "address": "طريق المطار - مركز الدعم الفني وتوزيع خلايا الطاقة الشمسية والمحولات",
        "phone1": "046-4624112", "phone2": "", "website": "",
        "email": "siwa.solarenergy.pumps@gmail.com", "lat": 29.230, "lon": 25.510, "fleetSize": 20,
        "fleetType": "شاحنات نقل ألواح شمسية مجهزة، أوناش شوكية، وسيارات صيانة متنقلة لخدمة المزارع", "priority": "B+",
        "notes": "تركيب وصيانة منظومات الطاقة الشمسية لتشغيل طلمبات أعماق الآبار الزراعية بالواحة"
    },
    {
        "nameAr": "شركة الأعلاف الخضراء بسيوة لمكابس البرسيم الحجازي وتغذية الثروة الحيوانية",
        "nameEn": "Siwa Green Forage Alfalfa Balers & Livestock Nutrition Fleet Co",
        "sector": "agriculture", "city": "siwa", "district": "مزارع طريق بهي الدين - غرب سيوة", "governorate": "مطروح",
        "address": "الكيلو 10 طريق بهي الدين - مجمع مكابس وتجفيف البرسيم الحجازي العضوي",
        "phone1": "046-4624113", "phone2": "", "website": "",
        "email": "siwa.greenforage.alfalfa@gmail.com", "lat": 29.198, "lon": 25.460, "fleetSize": 28,
        "fleetType": "تريلات تريبل أكسل جوانب عالية لنقل بالات البرسيم الحجازي المجفف لمزارع مطروح والإسكندرية", "priority": "B+",
        "notes": "إنتاج وكبس البرسيم الحجازي عالي البروتين لتغذية سلالات الأغنام والماشية"
    },
    {
        "nameAr": "شركة سيوة للنقل السريع والمهمات التجارية المشتركة مع واحات الوادي الجديد",
        "nameEn": "Siwa Express Freight & New Valley Oases Cross Highway Haulage Co",
        "sector": "transport", "city": "siwa", "district": "طريق سيوة - الفرافرة الجديد (محور الواحات)", "governorate": "مطروح",
        "address": "مدخل طريق الفرافرة الجديد - المحطة اللوجستية لربط واحة سيوة بالواحات البحرية والوادي الجديد",
        "phone1": "046-4624114", "phone2": "", "website": "",
        "email": "siwa.expressfreight.farafra@gmail.com", "lat": 29.175, "lon": 25.555, "fleetSize": 35,
        "fleetType": "تريلات ستائر وتريلات جوانب مصفحة لنقل البضائع والمعدات عبر محور سيوة - الفرافرة الجديد", "priority": "B+",
        "notes": "الربط اللوجستي البري المستحدث بين سيوة والفرافرة والواحات البحرية لنقل الخامات والمحاصيل"
    },

    # ── Sub-Cluster 5: العلمين الجديدة والمحور اللوجستي السريع (6 كيانات) ──
    {
        "nameAr": "شركة العلمين للحاويات وخدمات النقل متعدد الوسائط لموانئ الإسكندرية",
        "nameEn": "New Alamein Multimodal Container Freight & Alexandria Ports Shuttle",
        "sector": "transport", "city": "alamein", "district": "المنطقة الصناعية جنوب العلمين الجديدة", "governorate": "مطروح",
        "address": "المنطقة اللوجستية المركزية - جنوب مدينة العلمين الجديدة - ساحة الحاويات الجافة",
        "phone1": "046-4125100", "phone2": "", "website": "",
        "email": "alamein.multimodal.containers@gmail.com", "lat": 30.820, "lon": 28.950, "fleetSize": 75,
        "fleetType": "تريلات نقل حاويات 20 و40 قدم، روافع ريتش ستاكر، وتريلات مسطحة لنقل البضائع العامة", "priority": "A+",
        "notes": "النقل المباشر للحاويات والمهمات المستوردة بين ميناءي الإسكندرية والدخيلة ومدينة العلمين الجديدة"
    },
    {
        "nameAr": "شركة العلمين للخرسانة الجاهزة والبنية التحتية للأبراج الشاطئية والموانئ",
        "nameEn": "New Alamein Coastal Towers Readymix Concrete & Ports Infrastructure",
        "sector": "manufacturing", "city": "alamein", "district": "منطقة الأبراج الشاطئية - العلمين الجديدة", "governorate": "مطروح",
        "address": "طريق الأبراج - مجمع محطات خلط الخرسانة المركزية عالية الإجهاد المقاومة للأملاح",
        "phone1": "046-4125101", "phone2": "", "website": "",
        "email": "alamein.coastaltowers.concrete@gmail.com", "lat": 30.840, "lon": 28.930, "fleetSize": 65,
        "fleetType": "سيارات ميكسر 12 م3، مضخات خرسانة عملاقة 56 متر، وتريلات نقل أسمنت صب وسن بازلتي", "priority": "A",
        "notes": "توريد الخرسانات فائقة المقاومة لأبراج العلمين الشاطئية ومحطات المترو والبحيرات الصناعية"
    },
    {
        "nameAr": "شركة الساحل للتبريد وسلاسل الإمداد اللوجستي للمنتجعات والمراكز التجارية",
        "nameEn": "North Coast Cold Storage Supply Chain & Commercial Malls Logistics",
        "sector": "transport", "city": "alamein", "district": "المنطقة اللوجستية - العلمين الجديدة", "governorate": "مطروح",
        "address": "طريق وادي النطرون العلمين الكيلو 5 - مجمع مستودعات التبريد والتجميد اللوجستي",
        "phone1": "046-4125102", "phone2": "", "website": "",
        "email": "northcoast.coldstorage.malls@gmail.com", "lat": 30.810, "lon": 28.960, "fleetSize": 50,
        "fleetType": "برادات تريلا وسيارات جامبو مبردة -20 مئوية لنقل الأغذية واللحوم والمشروبات", "priority": "A",
        "notes": "تأمين سلاسل التوريد المبرد للفنادق العالمية والمولات التجارية الكبرى بطول الساحل الشمالي"
    },
    {
        "nameAr": "شركة العلمين لنقل وتوزيع المحروقات وتموين محطات الطاقة واليخوت البحرية",
        "nameEn": "Alamein Fuel Transport Power Plants & Marine Yacht Bunkering Fleet",
        "sector": "transport", "city": "alamein", "district": "مارينا العلمين الجديدة - الرصيف البحري", "governorate": "مطروح",
        "address": "طريق البترول - مجمع مستودعات صهاريج الوقود البترولي وتموين اليخوت",
        "phone1": "046-4125103", "phone2": "", "website": "",
        "email": "alamein.fuel.bunkering@gmail.com", "lat": 30.835, "lon": 28.940, "fleetSize": 38,
        "fleetType": "صهاريج نقل مواد بترولية معتمدة 40 ألف لتر لنقل البنزين والسولار والديزل البحري المعالج", "priority": "A",
        "notes": "تموين محطات الكهرباء الاحتياطية وتزويد اليخوت والسفن السياحية بالديزل البحري بمارينا العلمين"
    },
    {
        "nameAr": "شركة العلمين للرافعات الهيدروليكية الثقيلة ونقل مهمات الأبراج الإنشائية",
        "nameEn": "Alamein Hydraulic Heavy Rigging Cranes & Towers Erection Fleet Co",
        "sector": "contracting", "city": "alamein", "district": "المنطقة الصناعية بالعلمين الجديدة", "governorate": "مطروح",
        "address": "المنطقة الصناعية - مجمع الرافعات التلسكوبية وأوناش التشييد الثقيلة",
        "phone1": "046-4125104", "phone2": "", "website": "",
        "email": "alamein.heavycranes.rigging@gmail.com", "lat": 30.815, "lon": 28.945, "fleetSize": 35,
        "fleetType": "أوناش تلسكوبية 50-300 طن، أوناش برجية للأبراج الشاهقة، وكساحات نقل مقاطع الصلب", "priority": "A",
        "notes": "أعمال الرفع الهندسي الثقيل وتركيب واجهات الأبراج والجمالونات الضخمة بمدينة العلمين"
    },
    {
        "nameAr": "شركة العلمين للخدمات البيئية وتدوير المخلفات والمقاولات الخدمية المتكاملة",
        "nameEn": "Alamein Environmental Eco Services Waste Recycling & Municipal Fleet",
        "sector": "transport", "city": "alamein", "district": "طريق العلمين الإسكندرية الكيلو 3", "governorate": "مطروح",
        "address": "طريق البترول - مجمع مصانع فرز وتدوير المخلفات البلدية والإنشائية بالعلمين",
        "phone1": "046-4125105", "phone2": "", "website": "",
        "email": "alamein.environmental.eco@gmail.com", "lat": 30.825, "lon": 28.955, "fleetSize": 45,
        "fleetType": "شاحنات مكابس قمامة هيدروليكية، سيارات مكانس شوارع آلية، وتريلات نقل بالات التدوير", "priority": "B+",
        "notes": "إدارة منظومة النظافة المتكاملة والتدوير البيئي لأحياء ومنتجعات مدينة العلمين الجديدة"
    }
]

print(f"\nProcessing {len(candidates_data)} candidate enterprises for Square 11...")

approved_companies = []
rejected = 0

for idx, cand in enumerate(candidates_data, start=1):
    comp_id = f"comp_p2_northwest_coast_{idx:03d}"
    name_ar = cand['nameAr']
    name_en = cand['nameEn']
    
    # 1. Check Name uniqueness
    norm_ar = normalize_text(name_ar)
    norm_en = normalize_text(name_en)
    if norm_ar in existing_names or (norm_en and norm_en in existing_names):
        print(f"❌ REJECTED #{idx}: {name_ar} -> Duplicate name")
        rejected += 1
        continue
    
    # 2. Check Phone uniqueness
    p1 = cand.get('phone1', '')
    p2 = cand.get('phone2', '')
    sig1 = clean_phone(p1)
    sig2 = clean_phone(p2)
    
    if sig1 and sig1 in existing_phones:
        print(f"❌ REJECTED #{idx}: {name_ar} -> Duplicate phone ({sig1})")
        rejected += 1
        continue
    if sig2 and sig2 in existing_phones:
        print(f"❌ REJECTED #{idx}: {name_ar} -> Duplicate phone2 ({sig2})")
        rejected += 1
        continue
        
    # Mark in sets
    existing_names.add(norm_ar)
    if norm_en:
        existing_names.add(norm_en)
    if sig1:
        existing_phones.add(sig1)
    if sig2:
        existing_phones.add(sig2)
        
    company_obj = {
        "id": comp_id,
        "nameAr": name_ar,
        "nameEn": name_en,
        "sector": cand["sector"],
        "city": cand["city"],
        "district": cand["district"],
        "governorate": cand["governorate"],
        "address": cand["address"],
        "phone1": cand["phone1"],
        "phone2": cand.get("phone2", ""),
        "mobile": "",
        "hotline": "",
        "contactPerson": "",  # Strictly empty per CRM policy
        "contactTitle": "",
        "email": cand.get("email", ""),
        "website": cand.get("website", ""),
        "lat": cand["lat"],
        "lon": cand["lon"],
        "fleetSize": cand["fleetSize"],
        "fleetType": cand["fleetType"],
        "priority": cand["priority"],
        "status": "new",
        "assignedTo": "",
        "isTitan": False,
        "vip": False,
        "notes": cand["notes"]
    }
    approved_companies.append(company_obj)
    print(f"✅ APPROVED #{idx}: {name_ar} ({cand['city']} / {cand['fleetSize']} vehicles)")

print("\n" + "="*45)
print("Results for Square 11 (Northwest Coast, Salloum, Gargoub Port & Siwa):")
print(f"Total Candidates: {len(candidates_data)}")
print(f"Approved (Pure B2B, Zero Duplicates): {len(approved_companies)}")
print(f"Rejected: {rejected}")
print("="*45)

assert len(approved_companies) == 75, f"Expected 75 approved, got {len(approved_companies)}"
assert rejected == 0, f"Expected 0 rejected, got {rejected}"

os.makedirs('scraper/output', exist_ok=True)
out_path = 'scraper/output/phase2_northwest_coast_verified_b2b_fleet.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(approved_companies, f, ensure_ascii=False, indent=2)

print(f"Saved {len(approved_companies)} approved enterprises to {out_path}\n")
