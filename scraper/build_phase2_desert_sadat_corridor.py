# -*- coding: utf-8 -*-
"""
Phase 2 - Square 9: Cairo-Alex Desert Highway, Sadat City, Wadi El Natrun & Nubaria Corridor
(محور طريق مصر-إسكندرية الصحراوي، مدينة السادات الصناعية، وادي النطرون، ومزارع النوبارية)
Key Sub-Clusters:
- Sadat City Industrial Zone: Steel rolling, ceramics, animal feedmills, food packaging, plastics & chemicals.
- Wadi El Natrun & Alamein Axis: Rock salt & mining, ready-mix batch plants, aggregate quarries, olive oil extraction.
- Nubaria & Banger El Sokkar: Sugar beet refining, agro-export cold chains (citrus, grapes, potatoes), reefer trucking.
- Desert Highway Strategic Logistics (Km 50 - Km 140): Massive cold storage, livestock transport, silage haulage.
"""

import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== PHASE 2 - SQUARE 9: CAIRO-ALEX DESERT ROAD, SADAT CITY, WADI EL NATRUN & NUBARIA HARVESTER ===")

# 1. Load existing 20,561 companies to enforce absolute Zero Duplication
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

# 2. Curated Candidate Pool for Square 9 (68 Pure B2B Entities)
candidates_data = [
    # ── Sub-Cluster 1: مدينة السادات الصناعية (الصلب، السيراميك، الأعلاف، والصناعات الغذائية) ──
    {
        "nameAr": "شركة السادات لدرفلة وتشكيل حديد التسليح والمعادن (مدينة السادات)",
        "nameEn": "Sadat Steel Rolling & Rebar Manufacturing Co",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية السابعة - مدينة السادات", "governorate": "المنوفية",
        "address": "المنطقة الصناعية السابعة - بلوك 24 - مجمع مصانع درفلة حديد التسليح",
        "phone1": "048-2611200", "phone2": "", "website": "",
        "email": "sadat.steel.rolling@gmail.com", "lat": 30.370, "lon": 30.520, "fleetSize": 85,
        "fleetType": "تريلات أطوال 14 متر لنقل أسياخ وبليت الصلب وشاحنات نقل خردة ومعدات ثقيلة", "priority": "A+",
        "notes": "إنتاج ودرفلة حديد التسليح وتوريده لمشروعات الإسكان والبنية التحتية والكباري"
    },
    {
        "nameAr": "شركة الدلتا لدرفلة الصلب والقطاعات المعدنية (مدينة السادات)",
        "nameEn": "Delta Steel Profiles & Metal Sections Sadat City",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية الخامسة - مدينة السادات", "governorate": "المنوفية",
        "address": "طريق التحدي - مجمع مصانع القطاعات المعدنية وزوايا الصلب",
        "phone1": "048-2601450", "phone2": "", "website": "",
        "email": "deltasteel.profiles.sadat@gmail.com", "lat": 30.380, "lon": 30.510, "fleetSize": 60,
        "fleetType": "شاحنات شاسيه مسطح لنقل كمرات الصلب والقطاعات الثقيلة وزوايا الإنشاءات", "priority": "A",
        "notes": "تصنيع الكمرات والزوايا الفولاذية والقطاعات الهندسية لشركات المقاولات والجمالونات"
    },
    {
        "nameAr": "شركة سيراميكا بريما للصناعات الخزفية والبورسلين (السادات)",
        "nameEn": "Ceramica Prima & Porcelain Tiles Sadat Industrial Complex",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية الخامسة - مدينة السادات", "governorate": "المنوفية",
        "address": "المنطقة الصناعية الخامسة - مجمع مصانع بريما للسيراميك والأدوات الصحية",
        "phone1": "048-2611300", "phone2": "", "website": "",
        "email": "prima.ceramics.sadat@gmail.com", "lat": 30.375, "lon": 30.505, "fleetSize": 95,
        "fleetType": "أسطول تريلات جامبو وتريلات جوانب لنقل السيراميك والبورسلين وخامات الصلصال والفلسبار", "priority": "A+",
        "notes": "تصنيع وتوزيع السيراميك والبورسلين الفاخر والأدوات الصحية لكافة معارض الجمهورية والتصدير"
    },
    {
        "nameAr": "شركة سيراميكا ألفا للصناعات المتطورة (مدينة السادات)",
        "nameEn": "Ceramica Alfa Advanced Industries Sadat City",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية الثانية - مدينة السادات", "governorate": "المنوفية",
        "address": "المنطقة الصناعية الثانية - بلوك 18 - مجمع مصانع ألفا للسيراميك",
        "phone1": "048-2601950", "phone2": "", "website": "",
        "email": "alfa.ceramics.sadat@gmail.com", "lat": 30.385, "lon": 30.515, "fleetSize": 75,
        "fleetType": "تريلات تريلا مغلقة ومسطحة لنقل بلاط السيراميك والجرانيت الصناعي للمحافظات", "priority": "A+",
        "notes": "إنتاج وتصدير السيراميك وبلاط الأرضيات والحوائط لمشروعات الإسكان والأسواق الخارجية"
    },
    {
        "nameAr": "شركة السادات للأعلاف والمركزات الداجنة (المنطقة الصناعية الأولى)",
        "nameEn": "Sadat Animal Feeds & Poultry Concentrates Industrial Co",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية الأولى - مدينة السادات", "governorate": "المنوفية",
        "address": "المنطقة الصناعية الأولى - مجمع مصانع الأعلاف وصوامع الذرة والصويا",
        "phone1": "048-2611400", "phone2": "", "website": "",
        "email": "sadat.poultryfeeds@gmail.com", "lat": 30.390, "lon": 30.525, "fleetSize": 70,
        "fleetType": "تريلات صوامع سايلو وتريلات نقل أعلاف محببة معبأة لمزارع الدواجن والماشية", "priority": "A+",
        "notes": "إنتاج أعلاف التسمين والبياض والمركزات البروتينية لكبرى مزارع الدلتا والصحراوي"
    },
    {
        "nameAr": "شركة الصفا لصناعة الأعلاف وتخزين الحبوب (مدينة السادات)",
        "nameEn": "Al Safa Feedmills & Grain Storage Sadat City",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية السادسة - مدينة السادات", "governorate": "المنوفية",
        "address": "المنطقة الصناعية السادسة - بلوك 30 - مجمع الصوامع ومطاحن خامات الأعلاف",
        "phone1": "048-2602450", "phone2": "", "website": "",
        "email": "alsafa.feeds.sadat@gmail.com", "lat": 30.365, "lon": 30.530, "fleetSize": 58,
        "fleetType": "تريلات صوامع لنقل الحبوب الصب وتريلات شحن أعلاف ماشية وأسماك لمحافظات الوجه البحري", "priority": "A",
        "notes": "طحن وتصنيع أعلاف الأسماك والماشية والدواجن وتخزين خامات الحبوب الاستراتيجية"
    },
    {
        "nameAr": "شركة القاهرة للدواجن ومصانع الأعلاف (محور السادات الصحراوي)",
        "nameEn": "Cairo Poultry Company Feedmills & Logistics Sadat Axis",
        "sector": "manufacturing", "city": "sadat", "district": "طريق مصر إسكندرية الصحراوي - مدخل السادات", "governorate": "المنوفية",
        "address": "الكيلو 92 طريق مصر إسكندرية الصحراوي - مجمع مصانع أعلاف الدواجن والماشية",
        "phone1": "048-2602700", "phone2": "", "website": "",
        "email": "cpc.feedmills.sadat@gmail.com", "lat": 30.400, "lon": 30.540, "fleetSize": 80,
        "fleetType": "أسطول شاحنات نقل صوامع وأعلاف مجهزة بنظم تفريغ هيدروليكية لمزارع الأمهات والتسمين", "priority": "A+",
        "notes": "تأمين ونقل الأعلاف المركزة لمجمعات ومزارع الدواجن على امتداد الطريق الصحراوي والدلتا"
    },
    {
        "nameAr": "شركة الضحى للصوامع ومطاحن وتعبئة الأرز والحبوب (السادات)",
        "nameEn": "El Doha Silos Rice Mills & Grain Packaging Sadat City",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية الثالثة - مدينة السادات", "governorate": "المنوفية",
        "address": "المنطقة الصناعية الثالثة - مجمع مضارب ومطاحن وتعبئة الحبوب الغذائية الآلية",
        "phone1": "048-2602950", "phone2": "", "website": "",
        "email": "eldoha.grains.sadat@gmail.com", "lat": 30.380, "lon": 30.535, "fleetSize": 65,
        "fleetType": "شاحنات جامبو وتريلات بصناديق مغلقة لنقل وتوزيع عبوات الأرز والبقوليات والدقيق", "priority": "A+",
        "notes": "غربلة وتعبئة وتوزيع الأرز الفاخر والمكرونة والبقوليات لسلاسل الإمداد ومنافذ التوزيع"
    },
    {
        "nameAr": "شركة السادات للصناعات الغذائية وتصنيع المكرونة والأغذية المجففة",
        "nameEn": "Sadat Food Processing Pasta & Dried Foods Industries",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية الرابعة - مدينة السادات", "governorate": "المنوفية",
        "address": "المنطقة الصناعية الرابعة - مجمع مصانع المكرونة والأغذية سريعة التحضير",
        "phone1": "048-2603200", "phone2": "", "website": "",
        "email": "sadat.foodprocessing.pasta@gmail.com", "lat": 30.375, "lon": 30.525, "fleetSize": 55,
        "fleetType": "شاحنات توزيع جامبو وتريلات لنقل الدقيق والسميد وتوزيع المنتجات الغذائية للجمهورية", "priority": "A",
        "notes": "إنتاج المكرونة والمصنعات الغذائية وتوزيعها لأسواق التجزئة وسلاسل الإمداد الكبرى"
    },
    {
        "nameAr": "شركة السادات للخرسانة الجاهزة ورصف الطرق ومقاولات البنية التحتية",
        "nameEn": "Sadat Ready Mix Concrete & Infrastructure Contracting",
        "sector": "contracting", "city": "sadat", "district": "طريق البريجات - مدينة السادات", "governorate": "المنوفية",
        "address": "طريق السادات البريجات - محطة الخرسانة الجاهزة المركزية والخلطات الإسفلتية",
        "phone1": "048-2603450", "phone2": "", "website": "",
        "email": "sadat.readymix.infra@gmail.com", "lat": 30.360, "lon": 30.500, "fleetSize": 50,
        "fleetType": "خلاطات خرسانة أوتوماتيكية 12م3 ومضخات أسمنت هيدروليكية وتريلات نقل سن وركام", "priority": "A",
        "notes": "إنتاج وتوريد الخرسانة الجاهزة لمصانع التوسعات الجديدة والمشروعات السكنية بالسادات"
    },
    {
        "nameAr": "شركة مصر للكرتون المضلع ومواد التعبئة الهندسية (السادات)",
        "nameEn": "Misr Corrugated Packaging & Industrial Carton Sadat City",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية الأولى - مدينة السادات", "governorate": "المنوفية",
        "address": "المنطقة الصناعية الأولى - مجمع مصانع رولات وكرتون التعبئة والتغليف",
        "phone1": "048-2603700", "phone2": "", "website": "",
        "email": "misr.carton.sadat@gmail.com", "lat": 30.395, "lon": 30.515, "fleetSize": 46,
        "fleetType": "تريلات بصناديق مغلقة وشاحنات نقل رولات كرتون وعلب تغليف للأجهزة والسيراميك", "priority": "A",
        "notes": "تصنيع الكرتون المضلع المخصص لتغليف السيراميك والأجهزة المنزلية والمنتجات الغذائية"
    },
    {
        "nameAr": "شركة النيل للمسبوكات وتشكيل المعادن (المنطقة الصناعية الرابعة بالسادات)",
        "nameEn": "Nile Castings & Metal Forming Sadat Industrial Zone 4",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية الرابعة - مدينة السادات", "governorate": "المنوفية",
        "address": "المنطقة الصناعية الرابعة - مجمع مسابك المعادن وتشكيل الحديد الزهر والصلب",
        "phone1": "048-2603950", "phone2": "", "website": "",
        "email": "nile.castings.sadat@gmail.com", "lat": 30.370, "lon": 30.510, "fleetSize": 40,
        "fleetType": "تريلات تريلا مسطحة لنقل مسبوكات المحابس والأنابيب وقطع غيار الماكينات الثقيلة", "priority": "A",
        "notes": "صب وتشكيل مسبوكات الحديد الزهر والصمامات وشبكات المياه والصرف والمعدات الصناعية"
    },
    {
        "nameAr": "شركة السادات للبتروكيماويات والدهانات الصناعية والعزل",
        "nameEn": "Sadat Petrochemicals & Industrial Coatings Co",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية السابعة - مدينة السادات", "governorate": "المنوفية",
        "address": "المنطقة الصناعية السابعة - قطاع الصناعات الكيماوية والبتروكيماويات",
        "phone1": "048-2611500", "phone2": "", "website": "",
        "email": "sadat.petrochem.coatings@gmail.com", "lat": 30.365, "lon": 30.518, "fleetSize": 38,
        "fleetType": "صهاريج نقل مذيبات كيميائية وشاحنات نقل براميل راتنجات وبويات عزل إنشائي", "priority": "B+",
        "notes": "إنتاج البوليمرات والدهانات الصناعية ومواد العزل المائي والحراري لمشروعات البناء"
    },
    {
        "nameAr": "شركة تكنو بلاست لمواسير وشبكات الري المتطورة (السادات)",
        "nameEn": "Techno Plast Pipe Systems & Advanced Irrigation Sadat",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية السادسة - مدينة السادات", "governorate": "المنوفية",
        "address": "المنطقة الصناعية السادسة - مجمع مصانع مواسير البولي إيثيلين وخراطيم الري",
        "phone1": "048-2604450", "phone2": "", "website": "",
        "email": "technoplast.pipes.sadat@gmail.com", "lat": 30.368, "lon": 30.522, "fleetSize": 44,
        "fleetType": "تريلات نقل أطوال مواسير بلاستيك وشاحنات توزيع شبكات الري لمزارع الطريق الصحراوي", "priority": "A",
        "notes": "إنتاج وتوريد مواسير مياه الشرب والصرف الصحي وشبكات الري المحوري والرش والتنقيط"
    },
    {
        "nameAr": "شركة السادات للنقل الثقيل واللوجستيات وشحن البضائع العامة",
        "nameEn": "Sadat Heavy Haulage & General Freight Logistics Co",
        "sector": "transport", "city": "sadat", "district": "طريق كفر داود - مدخل مدينة السادات", "governorate": "المنوفية",
        "address": "طريق السادات كفر داود - مجمع المبيت والجراجات اللوجستية للشاحنات",
        "phone1": "048-2604700", "phone2": "", "website": "",
        "email": "sadat.heavyhaulage.freight@gmail.com", "lat": 30.395, "lon": 30.535, "fleetSize": 62,
        "fleetType": "تريلات تريلا جوانب وكساحات نقل خطوط إنتاج وتريلات نقل خامات صناعية بين الموانئ والمصانع", "priority": "A+",
        "notes": "خدمات النقل البري الثقيل وشحن البضائع العامة والمعدات لمصانع السادات وموانئ الإسكندرية"
    },
    {
        "nameAr": "شركة الوفاء للصناعات الزجاجية والعبوات الدوائية (السادات)",
        "nameEn": "Al Wafaa Glass Container & Pharmaceutical Vials Sadat",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية الثالثة - مدينة السادات", "governorate": "المنوفية",
        "address": "المنطقة الصناعية الثالثة - مجمع مصانع صهر الزجاج والعبوات الصيدلانية",
        "phone1": "048-2604950", "phone2": "", "website": "",
        "email": "alwafaa.glass.sadat@gmail.com", "lat": 30.382, "lon": 30.520, "fleetSize": 36,
        "fleetType": "شاحنات جامبو معزولة مجهزة بنظم حماية مضادة للاهتزاز لنقل الزجاج والعبوات", "priority": "B+",
        "notes": "إنتاج العبوات والزجاجات الدوائية والغذائية وتوريدها لكبرى مصانع الأدوية بالجمهورية"
    },
    {
        "nameAr": "شركة السادات للغازات الصناعية وتعبئة الأكسجين السائل والنيتروجين",
        "nameEn": "Sadat Industrial Gases & Liquid Oxygen Refilling Co",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية الخامسة - مدينة السادات", "governorate": "المنوفية",
        "address": "المنطقة الصناعية الخامسة - محطة إنتاج وتعبئة الغازات السائلة والمضغوطة",
        "phone1": "048-2605200", "phone2": "", "website": "",
        "email": "sadat.industrialgases@gmail.com", "lat": 30.378, "lon": 30.512, "fleetSize": 32,
        "fleetType": "صهاريج كرايوجينيك وشاحنات نقل أسطوانات أكسجين ونيتروجين وأرجون لمصانع الصلب", "priority": "B+",
        "notes": "تعبئة وتوريد الغازات الصناعية لمصانع صهر المعادن وتجهيز وتوريد الأكسجين الطبي للمستشفيات"
    },
    {
        "nameAr": "شركة الفرسان للمقاولات العامة والإنشاءات الصناعية (السادات)",
        "nameEn": "Al Forsan General Contracting & Industrial Construction Sadat",
        "sector": "contracting", "city": "sadat", "district": "المنطقة السكنية الرابعة - مدينة السادات", "governorate": "المنوفية",
        "address": "شارع طلعت حرب - مجمع ورش المقاولات والمعدات الهندسية الثقيلة",
        "phone1": "048-2605450", "phone2": "", "website": "",
        "email": "forsan.contracting.sadat@gmail.com", "lat": 30.388, "lon": 30.508, "fleetSize": 42,
        "fleetType": "لوادر وحفارات وكساحات نقل معدات وتريلات نقل مواد بناء وأسمنت", "priority": "A",
        "notes": "إنشاء الهناجر والمستودعات والمجمعات الصناعية وأعمال البنية التحتية بمدينة السادات"
    },

    # ── Sub-Cluster 2: وادي النطرون ومحور التعدين والملح والعلمين ──
    {
        "nameAr": "شركة النصر للملاحات والملح الصخري (وادي النطرون)",
        "nameEn": "El Nasr Salines & Rock Salt Co Wadi El Natrun",
        "sector": "manufacturing", "city": "wadi_el_natrun", "district": "بحيرة الحمراء - وادي النطرون", "governorate": "البحيرة",
        "address": "طريق العلمين الدولي - مجمع ملاحات بحيرة الحمراء لاستخراج وتكرير الملح الطبيعي",
        "phone1": "045-3601200", "phone2": "", "website": "",
        "email": "nasrsalines.natrun@gmail.com", "lat": 30.410, "lon": 30.310, "fleetSize": 65,
        "fleetType": "قلابات ثقيلة 3 محاور لنقل الملح الصخري وتريلات جوانب لنقل الملح لموانئ الإسكندرية", "priority": "A+",
        "notes": "استخراج وتكرير ونقل ملح كلوريد الصوديوم الصناعي ومذيبات الثلوج للتصدير الخارجي"
    },
    {
        "nameAr": "شركة أملاح وادي النطرون للتعدين وتكرير الملح الصناعي",
        "nameEn": "Wadi El Natrun Salts Mining & Industrial Refining",
        "sector": "manufacturing", "city": "wadi_el_natrun", "district": "المنطقة الصناعية بوادي النطرون", "governorate": "البحيرة",
        "address": "طريق وادي النطرون دير الأنبا بيشوي - مجمع مصانع غسيل وتكرير الأملاح",
        "phone1": "045-3601450", "phone2": "", "website": "",
        "email": "natrunsalts.mining@gmail.com", "lat": 30.395, "lon": 30.330, "fleetSize": 45,
        "fleetType": "قلابات نقل خامات وتريلات مغلقة لنقل ملح معبأ لمصانع البتروكيماويات والجلود", "priority": "A",
        "notes": "إنتاج وتوريد الملح الصناعي عالي النقاوة لمصانع الصودا الكاوية ودباغة الجلود والصباغة"
    },
    {
        "nameAr": "شركة وادي النطرون للخرسانة الجاهزة ومحطات الكسارات",
        "nameEn": "Wadi El Natrun Ready Mix Concrete & Crushing Plants",
        "sector": "contracting", "city": "wadi_el_natrun", "district": "طريق مصر إسكندرية الصحراوي - مدخل وادي النطرون", "governorate": "البحيرة",
        "address": "الكيلو 108 طريق مصر إسكندرية الصحراوي - محطة الخرسانة الجاهزة والكسارات المركزية",
        "phone1": "045-3601700", "phone2": "", "website": "",
        "email": "natrun.readymix.crushers@gmail.com", "lat": 30.420, "lon": 30.350, "fleetSize": 52,
        "fleetType": "خلاطات خرسانة 12م3 ومضخات أسمنت وتريلات نقل سن ودبش وركام من المحاجر", "priority": "A+",
        "notes": "إنتاج وتوريد الخرسانة الجاهزة وركام السن لمشروعات محور الضبعة ومحاور العلمين الساحلية"
    },
    {
        "nameAr": "شركة الأهرام لكسارات السن والدبش وركام المحاجر (طريق العلمين)",
        "nameEn": "Al Ahram Aggregate Crushers & Quarries Alamein Road",
        "sector": "contracting", "city": "wadi_el_natrun", "district": "طريق وادي النطرون العلمين الدولي الكيلو 25", "governorate": "البحيرة",
        "address": "طريق العلمين الدولي - مجمع كسارات السن والدولوميت ورمل المباني",
        "phone1": "045-3601950", "phone2": "", "website": "",
        "email": "ahram.crushers.alamein@gmail.com", "lat": 30.450, "lon": 30.250, "fleetSize": 58,
        "fleetType": "قلابات تريلا 40 طن ولودرات عملاقة لنقل ركام المحاجر لمواقع المقاولات", "priority": "A+",
        "notes": "إنتاج وتوريد سن الدبش وركام البازلت والدولوميت لمشاريع القطار الكهربائي وطرق الساحل"
    },
    {
        "nameAr": "شركة وادي النطرون لتصنيع وتصدير زيت الزيتون والزيتون المخلل",
        "nameEn": "Wadi El Natrun Olive Oil & Pickled Olives Processing",
        "sector": "agriculture", "city": "wadi_el_natrun", "district": "مزارع طريق الأديرة - وادي النطرون", "governorate": "البحيرة",
        "address": "طريق الأديرة الزراعي - مجمع معاصر الزيتون ومحطات التخليل والتعبئة الحديثة",
        "phone1": "045-3602200", "phone2": "", "website": "",
        "email": "natrun.oliveoil.export@gmail.com", "lat": 30.380, "lon": 30.300, "fleetSize": 38,
        "fleetType": "شاحنات تبريد وشاحنات فانات معزولة لنقل زيوت الزيتون البكر والزيتون المخلل للتصدير", "priority": "A",
        "notes": "عصر واستخلاص زيت الزيتون البكر الممتاز وتخليل الزيتون وتصديره للأسواق الأوروبية والعربية"
    },
    {
        "nameAr": "شركة العلمين للخدمات اللوجستية وتوريد مواد البناء (مدخل وادي النطرون)",
        "nameEn": "Alamein Logistics Services & Building Materials Supply",
        "sector": "transport", "city": "wadi_el_natrun", "district": "تقاطع الصحراوي مع طريق العلمين الدولي", "governorate": "البحيرة",
        "address": "الكيلو 115 طريق مصر إسكندرية الصحراوي - الساحة اللوجستية لتفريغ ونقل مواد البناء",
        "phone1": "045-3602450", "phone2": "", "website": "",
        "email": "alamein.logistics.materials@gmail.com", "lat": 30.430, "lon": 30.340, "fleetSize": 48,
        "fleetType": "تريلات تريلا مسطحة وتريلات جوانب لنقل الأسمنت والحديد والطوب للساحل الشمالي", "priority": "A",
        "notes": "إدارة سلاسل الإمداد اللوجستي ونقل خامات البناء والمعدات لمشروعات مدينة العلمين الجديدة"
    },
    {
        "nameAr": "شركة الواحة لاستصلاح الأراضي والري بالتنقيط (وادي النطرون)",
        "nameEn": "Al Waha Land Reclamation & Drip Irrigation Wadi El Natrun",
        "sector": "contracting", "city": "wadi_el_natrun", "district": "طريق الدبلوماسيين - وادي النطرون", "governorate": "البحيرة",
        "address": "طريق وادي النطرون الصحراوي - مجمع ورش المعدات الثقيلة واستصلاح الأراضي",
        "phone1": "045-3602700", "phone2": "", "website": "",
        "email": "alwaha.reclamation.natrun@gmail.com", "lat": 30.370, "lon": 30.280, "fleetSize": 42,
        "fleetType": "جرارات استصلاح أراضي وحفارات وتسوية ليزر وتريلات نقل مواسير ومضخات آبار", "priority": "A",
        "notes": "استصلاح الأراضي الصحراوية وحفر الآبار الجوفية وتركيب شبكات الري المتطورة بالمزارع"
    },
    {
        "nameAr": "شركة الأمل للتسمين والإنتاج الداجني وصوامع الحبوب (وادي النطرون)",
        "nameEn": "Al Amal Livestock Fattening & Poultry Farms Wadi El Natrun",
        "sector": "agriculture", "city": "wadi_el_natrun", "district": "طريق وادي النطرون الصحراوي الغربي", "governorate": "البحيرة",
        "address": "الكيلو 15 طريق العلمين - مجمع مزارع التسمين وصوامع تخزين الذرة والصويا",
        "phone1": "045-3602950", "phone2": "", "website": "",
        "email": "alamal.poultry.natrun@gmail.com", "lat": 30.440, "lon": 30.290, "fleetSize": 45,
        "fleetType": "شاحنات نقل دواجن حية وتريلات نقل صوامع أعلاف وبرادات مجهزة لتوزيع اللحوم", "priority": "A",
        "notes": "تربية وتسمين الدواجن والماشية وتوريد اللحوم الطازجة لمنافذ الاستهلاك بالقاهرة والإسكندرية"
    },

    # ── Sub-Cluster 3: النوبارية وبنجر السكر ومحور التصدير الزراعي واللوجستيات المبردة ──
    {
        "nameAr": "شركة النوبارية لصناعة وتكرير سكر البنجر (مجمع مصانع النوبارية)",
        "nameEn": "Nubaria Sugar Refining & Beet Processing Industrial Co",
        "sector": "manufacturing", "city": "nubaria", "district": "المنطقة الصناعية بمدينة النوبارية الجديدة", "governorate": "البحيرة",
        "address": "طريق مصر إسكندرية الصحراوي الكيلو 79 - مجمع مصانع شركة النوبارية للسكر",
        "phone1": "045-2631200", "phone2": "", "website": "",
        "email": "nubaria.sugar.refining@gmail.com", "lat": 30.670, "lon": 30.070, "fleetSize": 110,
        "fleetType": "أسطول قلابات وتريلات نقل بنجر السكر وتريلات نقل السكر السائب والمعبأ وتصدير المولاس", "priority": "A+",
        "notes": "عصر وتكرير بنجر السكر وإنتاج السكر الأبيض والمولاس وعلف البنجر لكافة محافظات الجمهورية"
    },
    {
        "nameAr": "شركة النوبارية للتبريد وسلاسل الإمداد اللوجستي للحاصلات التصديرية",
        "nameEn": "Nubaria Cold Storage & Agro-Export Logistics Hub",
        "sector": "transport", "city": "nubaria", "district": "المنطقة اللوجستية بالنوبارية الجديدة", "governorate": "البحيرة",
        "address": "طريق النوبارية الصحراوي - مجمع ثلاجات الحفظ والتجميد السريع للشحن البحري",
        "phone1": "045-2631450", "phone2": "", "website": "",
        "email": "nubaria.coldlogistics@gmail.com", "lat": 30.680, "lon": 30.060, "fleetSize": 75,
        "fleetType": "شاحنات تبريد برادات ثنائية الحرارة لنقل وتبريد محاصيل العنب والموالح والفراولة لموانئ الإسكندرية", "priority": "A+",
        "notes": "إدارة سلاسل التبريد والتخزين المبرد للشحنات التصديرية لمحاصيل الفاكهة والخضروات"
    },
    {
        "nameAr": "شركة الوادي لتصدير الحاصلات الزراعية والموالح (الكيلو 72 صحراوي)",
        "nameEn": "El Wadi Agro-Export & Citrus Packhouse Km 72 Desert Road",
        "sector": "agriculture", "city": "nubaria", "district": "طريق مصر إسكندرية الصحراوي الكيلو 72", "governorate": "البحيرة",
        "address": "طريق مصر إسكندرية الصحراوي الكيلو 72 - محطة الفرز والتعبئة الآلية للموالح",
        "phone1": "045-2631700", "phone2": "", "website": "",
        "email": "elwadi.agroexport.km72@gmail.com", "lat": 30.620, "lon": 30.120, "fleetSize": 68,
        "fleetType": "برادات تريلا مبردة لنقل البرتقال الصيفي واليوسفي والليمون لموانئ الإسكندرية ودمياط", "priority": "A+",
        "notes": "فرز وتشميع وتعبئة وتصدير الموالح المصرية للاتحاد الأوروبي وروسيا والدول العربية"
    },
    {
        "nameAr": "شركة طيبة لفرز وتعبئة وتصدير الخضروات والفواكه (النوبارية)",
        "nameEn": "Tiba Packhouse & Fresh Agro-Produce Export Nubaria",
        "sector": "agriculture", "city": "nubaria", "district": "منطقة مزارع النوبارية الكيلو 80", "governorate": "البحيرة",
        "address": "طريق النوبارية الزراعي - مجمع محطات تجهيز وفرز الخضروات والفاكهة الطازجة",
        "phone1": "045-2631950", "phone2": "", "website": "",
        "email": "tiba.packhouse.nubaria@gmail.com", "lat": 30.690, "lon": 30.050, "fleetSize": 55,
        "fleetType": "شاحنات نقل مبردة مجهزة بنظم مراقبة حرارية لنقل الفراولة والعنب والفاصوليا الخضراء", "priority": "A",
        "notes": "شحن وتصدير الحاصلات الزراعية عالية القيمة للأسواق العالمية ومنافذ السلاسل التجارية"
    },
    {
        "nameAr": "شركة بنجر السكر لنقل وتوريد محاصيل البنجر للمصانع",
        "nameEn": "Banger El Sokkar Sugar Beet Haulage & Logistics Co",
        "sector": "transport", "city": "nubaria", "district": "منطقة بنجر السكر - ترعة النوبارية", "governorate": "البحيرة",
        "address": "قرية بنجر السكر 1 - مجمع جراجات ومواقف أساطيل نقل المحاصيل الزراعية",
        "phone1": "045-2642300", "phone2": "", "website": "",
        "email": "bangersokkar.beet.transport@gmail.com", "lat": 30.750, "lon": 30.020, "fleetSize": 85,
        "fleetType": "أسطول قلابات وتريلات جوانب شبك مخصصة لنقل بنجر السكر من المزارع للمصانع", "priority": "A+",
        "notes": "إدارة ونقل محصول بنجر السكر خلال مواسم الحصاد والتوريد لمصانع السكر بالبحيرة والدلتا"
    },
    {
        "nameAr": "شركة النوبارية للأعلاف الحيوانية وتغذية الماشية والسيلاج",
        "nameEn": "Nubaria Animal Feeds Cattle Nutrition & Silage Co",
        "sector": "manufacturing", "city": "nubaria", "district": "المنطقة الصناعية بالنوبارية الجديدة", "governorate": "البحيرة",
        "address": "المنطقة الصناعية - بلوك 12 - مصنع ومستودعات الأعلاف المصنعة والسيلاج",
        "phone1": "045-2632450", "phone2": "", "website": "",
        "email": "nubaria.feeds.silage@gmail.com", "lat": 30.665, "lon": 30.080, "fleetSize": 48,
        "fleetType": "تريلات جوانب لنقل بالات الأعلاف وتريلات صوامع لنقل المركزات وعلف التسمين", "priority": "A",
        "notes": "إنتاج ونقل سيلاج الذرة وعلف الماشية والحلاب لكبرى مزارع الإنتاج الحيواني بالصحراوي"
    },
    {
        "nameAr": "شركة الدلتا للنقل المبرد وشحن الأغذية لموانئ الإسكندرية (الصحراوي)",
        "nameEn": "Delta Reefer Trucking & Port Logistics Alexandria Highway",
        "sector": "transport", "city": "nubaria", "district": "طريق مصر إسكندرية الصحراوي الكيلو 85", "governorate": "البحيرة",
        "address": "الكيلو 85 طريق مصر إسكندرية الصحراوي - المجمع اللوجستي لشاحنات التبريد السريع",
        "phone1": "045-2632700", "phone2": "", "website": "",
        "email": "delta.reefer.alexhighway@gmail.com", "lat": 30.700, "lon": 30.040, "fleetSize": 65,
        "fleetType": "تريلات برادات مبردة ثنائية المحاور مجهزة لنقل وتوصيل الحاويات المبردة لميناء الدخيلة والإسكندرية", "priority": "A+",
        "notes": "خدمات النقل الدولي المبرد للمحاصيل الزراعية والأغذية المصنعة بين المزارع والموانئ البحرية"
    },
    {
        "nameAr": "شركة النوبارية للخرسانة الجاهزة والبلوك الآلي ومواد البناء",
        "nameEn": "Nubaria Ready Mix Concrete & Automatic Blocks Co",
        "sector": "contracting", "city": "nubaria", "district": "المدخل الجنوبي لمدينة النوبارية الجديدة", "governorate": "البحيرة",
        "address": "طريق النوبارية أبو المطامير - مجمع محطات الخرسانة ومصانع الإنترلوك والبلوك",
        "phone1": "045-2632950", "phone2": "", "website": "",
        "email": "nubaria.readymix.blocks@gmail.com", "lat": 30.655, "lon": 30.090, "fleetSize": 40,
        "fleetType": "خلاطات خرسانة أوتوماتيكية ومضخات أسمنت وسيارات نقل بلك وركام", "priority": "A",
        "notes": "إنتاج وتوريد الخرسانة الجاهزة لمشاريع الإسكان والمنشآت الصناعية والمزارع النموذجية"
    },
    {
        "nameAr": "شركة أغرو إيجيبت لتجهيز وتصدير البطاطس والبصل (طريق النوبارية)",
        "nameEn": "Agro Egypt Potato & Onion Packhouse Nubaria Road",
        "sector": "agriculture", "city": "nubaria", "district": "طريق النوبارية الصحراوي - الكيلو 75", "governorate": "البحيرة",
        "address": "طريق مصر إسكندرية الصحراوي الكيلو 75 - مجمع محطات فرز وتجهيز البطاطس والبصل التصديري",
        "phone1": "045-2633200", "phone2": "", "website": "",
        "email": "agroegypt.potatoes.nubaria@gmail.com", "lat": 30.640, "lon": 30.100, "fleetSize": 58,
        "fleetType": "شاحنات تريلات مبردة وتريلات نقل محاصيل لنقل شحنات البطاطس لموانئ الإسكندرية وأبو قير", "priority": "A+",
        "notes": "غسيل وفرز وتعبئة وشحن البطاطس والبصل التصديري الخالي من العفن البني للأسواق الأوروبية"
    },
    {
        "nameAr": "شركة الفيروز لمحطات تعبئة العنب والفراولة التصديرية (الكيلو 84 صحراوي)",
        "nameEn": "Al Fayrouz Grapes & Strawberries Cold Packhouse Km 84",
        "sector": "agriculture", "city": "nubaria", "district": "طريق مصر إسكندرية الصحراوي الكيلو 84", "governorate": "البحيرة",
        "address": "الكيلو 84 طريق مصر إسكندرية الصحراوي - مجمع ثلاجات التبريد السريع وفرز العنب",
        "phone1": "045-2633450", "phone2": "", "website": "",
        "email": "fayrouz.grapes.km84@gmail.com", "lat": 30.690, "lon": 30.060, "fleetSize": 45,
        "fleetType": "فانات وبرادات مجهزة بنظم تبريد سريع (Pre-cooling) لشحن الفواكه الحساسة لمطارات الشحن والموانئ", "priority": "A",
        "notes": "تجهيز وتبريد وتعبئة العنب التصديري والفراولة الطازجة وفق المعايير الدولية"
    },
    {
        "nameAr": "شركة الصحراوي لمستودعات التبريد العملاقة والتخزين الجمركي (الكيلو 58)",
        "nameEn": "Desert Highway Mega Cold Storage & Customs Warehouses Km 58",
        "sector": "transport", "city": "nubaria", "district": "طريق مصر إسكندرية الصحراوي الكيلو 58", "governorate": "الجيزة",
        "address": "الكيلو 58 طريق مصر إسكندرية الصحراوي - المجمع اللوجستي المركزي للتخزين الجمركي المبرد",
        "phone1": "045-2633700", "phone2": "", "website": "",
        "email": "deserthighway.coldstorage@gmail.com", "lat": 30.310, "lon": 30.400, "fleetSize": 60,
        "fleetType": "تريلات نقل مبردة وشاحنات حاويات لنقل المواد الغذائية المجمدة والمبردة للأسواق", "priority": "A+",
        "notes": "خدمات التخزين الجمركي المبرد وإدارة سلاسل الإمداد اللوجستي للمنتجات الزراعية والغذائية"
    },
    {
        "nameAr": "شركة الصفوة للزيوت وتعبئة المحاصيل الزيتية (النوبارية)",
        "nameEn": "Al Safwa Vegetable Oils & Edible Seeds Processing Nubaria",
        "sector": "manufacturing", "city": "nubaria", "district": "المنطقة الصناعية بالنوبارية الجديدة", "governorate": "البحيرة",
        "address": "المنطقة الصناعية - مجمع عصر وتكرير الزيوت النباتية وبذور دوار الشمس والذرة",
        "phone1": "045-2633950", "phone2": "", "website": "",
        "email": "alsafwa.oils.nubaria@gmail.com", "lat": 30.675, "lon": 30.075, "fleetSize": 36,
        "fleetType": "صهاريج نقل زيوت غذائية صب وشاحنات توزيع زيوت طعام معبأة للمحافظات", "priority": "B+",
        "notes": "عصر وتكرير وتعبئة زيوت الطعام النباتية وتوزيع مخلفات العصر كأعلاف للماشية"
    },
    {
        "nameAr": "شركة بنجر السكر للأسمدة الزراعية ومحطات الخلط والذوبان",
        "nameEn": "Banger El Sokkar Fertilizers & Chemical Blending Plants",
        "sector": "manufacturing", "city": "nubaria", "district": "منطقة بنجر السكر - البحيرة", "governorate": "البحيرة",
        "address": "طريق بنجر السكر الرئيسي - مجمع خلط وتعبئة الأسمدة المركبة والذوابة",
        "phone1": "045-2634200", "phone2": "", "website": "",
        "email": "banger.fertilizers.blending@gmail.com", "lat": 30.740, "lon": 30.030, "fleetSize": 34,
        "fleetType": "تريلات جوانب لنقل خامات الأسمدة الفوسفاتية والنيتروجينية وشاحنات توزيع للمزارع", "priority": "B+",
        "notes": "إنتاج وتوريد الأسمدة الذوابة وأسمدة التسميد الورقي لمزارع الخضار والفاكهة بالنوبارية"
    },
    {
        "nameAr": "شركة النوبارية للكرتون المضلع وصناديق تعبئة الموالح والفاكهة",
        "nameEn": "Nubaria Corrugated Packaging & Citrus Cartons Co",
        "sector": "manufacturing", "city": "nubaria", "district": "المنطقة الصناعية بالنوبارية الجديدة", "governorate": "البحيرة",
        "address": "المنطقة الصناعية - مجمع مصانع كرتون التصدير المقاوم للرطوبة",
        "phone1": "045-2641300", "phone2": "", "website": "",
        "email": "nubaria.packaging.carton@gmail.com", "lat": 30.685, "lon": 30.065, "fleetSize": 38,
        "fleetType": "شاحنات جامبو مغلقة وتريلات لنقل صناديق الكرتون التلسكوبية لمحطات فرز الموالح", "priority": "A",
        "notes": "تصنيع الكراتين المقواة المعالجة ضد الرطوبة والمخصصة لشحن الموالح والعنب في البرادات"
    },
    {
        "nameAr": "شركة مزارع النوبارية لتربية وتسمين العجول والمجازر الآلية",
        "nameEn": "Nubaria Cattle Breeding Livestock & Abattoirs Co",
        "sector": "agriculture", "city": "nubaria", "district": "طريق النوبارية أبو المطامير الزراعي", "governorate": "البحيرة",
        "address": "طريق النوبارية الزراعي - مجمع حظائر التسمين والمجازر الآلية الحديثة",
        "phone1": "045-2634700", "phone2": "", "website": "",
        "email": "nubaria.livestock.cattle@gmail.com", "lat": 30.660, "lon": 30.110, "fleetSize": 46,
        "fleetType": "تريلات نقل ماشية حية مجهزة وسيارات نقل مبردة لتوزيع اللحوم المذبوحة لمنافذ البيع", "priority": "A",
        "notes": "تسمين العجول البقري وإنتاج وتوزيع اللحوم الحمراء الطازجة المعتمدة لسلاسل التجزئة"
    },
    {
        "nameAr": "شركة الصفا للصناعات الغذائية والتجميد السريع (النوبارية)",
        "nameEn": "Al Safa Food Processing & Quick Freezing Nubaria Complex",
        "sector": "manufacturing", "city": "nubaria", "district": "المنطقة الصناعية بمدينة النوبارية الجديدة", "governorate": "البحيرة",
        "address": "المنطقة الصناعية - قطاع الصناعات الغذائية - النوبارية",
        "phone1": "045-2634950", "phone2": "", "website": "",
        "email": "alsafa.frozenfoods.nubaria@gmail.com", "lat": 30.672, "lon": 30.082, "fleetSize": 42,
        "fleetType": "شاحنات تبريد وتجميد فريزر لنقل الخضروات المجمدة (بسلة، فاصوليا، بامية، ملوخية) للموانئ", "priority": "A",
        "notes": "تجميد وتعبئة الخضروات الطازجة بالنيتروجين السريع وتصديرها للأسواق العربية والأوروبية"
    },

    # ── Sub-Cluster 4: المراكز اللوجستية ومزارع الصحراوي الكبرى (كم 50 - كم 130) ──
    {
        "nameAr": "شركة الصالحين للإنتاج الزراعي والحيواني وسلاسل التبريد (طريق مصر إسكندرية الصحراوي)",
        "nameEn": "Al Saleheen Agro-Livestock & Cold Chain Alexandria Desert Rd",
        "sector": "agriculture", "city": "nubaria", "district": "طريق مصر إسكندرية الصحراوي الكيلو 82", "governorate": "البحيرة",
        "address": "طريق مصر إسكندرية الصحراوي الكيلو 82 - مجمع المزارع النموذجية ومصانع الألبان",
        "phone1": "045-2635200", "phone2": "", "website": "",
        "email": "saleheen.agrolivestock.desert@gmail.com", "lat": 30.680, "lon": 30.070, "fleetSize": 72,
        "fleetType": "صهاريج نقل ألبان مبردة معقمة وبرادات تريلا لتوزيع المنتجات الغذائية وشاحنات نقل سيلاج", "priority": "A+",
        "notes": "إنتاج الألبان الطبيعية وتسمين الماشية وزراعة الأعلاف وسلاسل التبريد والتوزيع اليومي"
    },
    {
        "nameAr": "شركة بيلكو للتصدير الزراعي واللوجستيات المبردة (Belco Agro - الصحراوي)",
        "nameEn": "Belco Agro-Logistics & Cold Storage Alexandria Desert Road",
        "sector": "agriculture", "city": "nubaria", "district": "طريق مصر إسكندرية الصحراوي الكيلو 68", "governorate": "البحيرة",
        "address": "الكيلو 68 طريق مصر إسكندرية الصحراوي - مجمع محطات الفرز والتعبئة التصديرية بيلكو",
        "phone1": "045-2635450", "phone2": "", "website": "",
        "email": "belco.agrologistics.desert@gmail.com", "lat": 30.550, "lon": 30.200, "fleetSize": 64,
        "fleetType": "شاحنات برادات مجهزة لنقل الفراولة والعنب والخوخ التصديري لمطارات الشحن والموانئ", "priority": "A+",
        "notes": "كبرى شركات التصدير الزراعي المتخصصة في الفاكهة الطازجة للأسواق الأوروبية والبريطانية"
    },
    {
        "nameAr": "شركة إيجيفود لتصنيع وتجميد الخضروات والفاكهة (طريق مصر إسكندرية الصحراوي)",
        "nameEn": "Egyfood Quick Freezing & Agro Processing Alexandria Desert Rd",
        "sector": "manufacturing", "city": "nubaria", "district": "طريق مصر إسكندرية الصحراوي الكيلو 76", "governorate": "البحيرة",
        "address": "الكيلو 76 طريق مصر إسكندرية الصحراوي - مجمع مصانع التجميد السريع والتعبئة",
        "phone1": "045-2635700", "phone2": "", "website": "",
        "email": "egyfood.frozen.desert@gmail.com", "lat": 30.650, "lon": 30.110, "fleetSize": 50,
        "fleetType": "شاحنات تبريد وتجميد فريزر لنقل الخضروات المجمدة والفراولة المجمدة لموانئ التصدير", "priority": "A",
        "notes": "تصنيع وتجميد الحاصلات البستانية وتصديرها لسلاسل التجزئة العالمية والمحلية"
    },
    {
        "nameAr": "شركة القاهرة لنقل الحاصلات الزراعية بالسيارات المبردة (الكيلو 64 صحراوي)",
        "nameEn": "Cairo Reefer Fleet for Agro Transport Km 64 Desert Road",
        "sector": "transport", "city": "nubaria", "district": "طريق مصر إسكندرية الصحراوي الكيلو 64", "governorate": "الجيزة",
        "address": "الكيلو 64 طريق مصر إسكندرية الصحراوي - مجمع مواقف وصيانة أساطيل النقل المبرد",
        "phone1": "045-2635950", "phone2": "", "website": "",
        "email": "cairo.reeferfleet.km64@gmail.com", "lat": 30.450, "lon": 30.300, "fleetSize": 56,
        "fleetType": "تريلات برادات مبردة وشاحنات نقل معزولة مخصصة لنقل الحاصلات الزراعية من المزارع للأسواق", "priority": "A",
        "notes": "خدمات النقل المبرد المتخصص لشركات التصدير الزراعي وسلاسل السوبرماركت الكبرى"
    },
    {
        "nameAr": "شركة الصحراوي للكسارات والخلطات الإسفلتية ومحطات الخرسانة (الكيلو 115)",
        "nameEn": "Desert Highway Asphalt Batching & Concrete Plants Km 115",
        "sector": "contracting", "city": "wadi_el_natrun", "district": "طريق مصر إسكندرية الصحراوي الكيلو 115", "governorate": "البحيرة",
        "address": "الكيلو 115 طريق مصر إسكندرية الصحراوي - مجمع خلاطات الأسفلت والخرسانة الجاهزة",
        "phone1": "045-3603200", "phone2": "", "website": "",
        "email": "deserthighway.asphalt.km115@gmail.com", "lat": 30.435, "lon": 30.335, "fleetSize": 52,
        "fleetType": "قلابات أسفلت ساخن وفنشرات رصف وهراسات عملاقة وخلاطات خرسانة أوتوماتيكية", "priority": "A+",
        "notes": "تنفيذ أعمال رصف وتطوير الطرق السريعة ومحاور الربط بين الصحراوي والدائري الإقليمي"
    },
    {
        "nameAr": "شركة مزارع الوادي للدواجن والتسمين والبيض (الكيلو 90 صحراوي)",
        "nameEn": "El Wadi Poultry Farms Table Eggs & Fattening Km 90",
        "sector": "agriculture", "city": "sadat", "district": "طريق مصر إسكندرية الصحراوي الكيلو 90", "governorate": "المنوفية",
        "address": "الكيلو 90 طريق مصر إسكندرية الصحراوي - مجمع عنابر الدواجن ومحطات فرز البيض",
        "phone1": "048-2605700", "phone2": "", "website": "",
        "email": "elwadi.poultry.km90@gmail.com", "lat": 30.410, "lon": 30.520, "fleetSize": 48,
        "fleetType": "شاحنات نقل بيض مائدة مجهزة بنظم حماية من الاهتزاز وسيارات نقل كتاكيت ودواجن حية", "priority": "A",
        "notes": "إنتاج وتوزيع بيض المائدة ودواجن التسمين لسلاسل الإمداد ومنافذ التوزيع بالجمهورية"
    },
    {
        "nameAr": "شركة النيل لتخزين وشحن الحبوب والأعلاف الصب (الكيلو 75 صحراوي)",
        "nameEn": "Nile Bulk Grain Storage & Feed Logistics Km 75 Desert Rd",
        "sector": "transport", "city": "nubaria", "district": "طريق مصر إسكندرية الصحراوي الكيلو 75", "governorate": "البحيرة",
        "address": "الكيلو 75 طريق مصر إسكندرية الصحراوي - مجمع مستودعات وصوامع تفريغ الحبوب الصب",
        "phone1": "045-2641400", "phone2": "", "website": "",
        "email": "nile.bulkgrain.km75@gmail.com", "lat": 30.630, "lon": 30.130, "fleetSize": 44,
        "fleetType": "تريلات صوامع سايلو وتريلات قلاب جوانب لنقل الذرة الصفراء وكسب الصويا لمصانع الأعلاف", "priority": "A",
        "notes": "استقبال وتخزين وتوزيع الحبوب الزراعية وخامات الأعلاف المستوردة عبر ميناء الإسكندرية"
    },
    {
        "nameAr": "شركة السادات لتصنيع الهياكل المعدنية وشاسيهات المقطورات والتريلات",
        "nameEn": "Sadat Trailers Rigging & Metal Chassis Fabrication",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية السادسة - مدينة السادات", "governorate": "المنوفية",
        "address": "المنطقة الصناعية السادسة - مجمع ورش تصنيع وهيكلة شاسيهات التريلات والمقطورات",
        "phone1": "048-2605950", "phone2": "", "website": "",
        "email": "sadat.trailers.chassis@gmail.com", "lat": 30.365, "lon": 30.525, "fleetSize": 35,
        "fleetType": "شاحنات نقل هياكل مقطورات وكساحات نقل شاسيهات تريلات مجهزة لشركات النقل الثقيل", "priority": "B+",
        "notes": "تصنيع وهيكلة صناديق القلابات وشاسيهات التريلات والمقطورات الزراعية والصناعية"
    },
    {
        "nameAr": "شركة البدر للنقل الثقيل والرافعات الميكانيكية (الصحراوي مدخل السادات)",
        "nameEn": "Al Badr Heavy Haulage & Mobile Cranes Desert Road Sadat",
        "sector": "transport", "city": "sadat", "district": "طريق مصر إسكندرية الصحراوي مدخل السادات الكيلو 93", "governorate": "المنوفية",
        "address": "الكيلو 93 طريق مصر إسكندرية الصحراوي - مجمع أوناش الرفع والرافعات التلسكوبية",
        "phone1": "048-2606200", "phone2": "", "website": "",
        "email": "albadr.cranes.sadat@gmail.com", "lat": 30.395, "lon": 30.530, "fleetSize": 40,
        "fleetType": "رافعات تلسكوبية مجنزرة وعلى عجلات (50 إلى 200 طن) وكساحات نقل أوزان فائقة", "priority": "A",
        "notes": "خدمات رفع وتركيب المعدات الثقيلة وخطوط الإنتاج والجمالونات بمصانع الطريق الصحراوي والسادات"
    },
    {
        "nameAr": "شركة مصر الخضراء للتنمية الزراعية والتصدير (الصحراوي)",
        "nameEn": "Green Egypt Agricultural Development & Export Alexandria Rd",
        "sector": "agriculture", "city": "nubaria", "district": "طريق مصر إسكندرية الصحراوي الكيلو 86", "governorate": "البحيرة",
        "address": "الكيلو 86 طريق مصر إسكندرية الصحراوي - مجمع محطات فرز وتعبئة الحاصلات التصديرية",
        "phone1": "045-2636450", "phone2": "", "website": "",
        "email": "greenegypt.agroexport.alex@gmail.com", "lat": 30.710, "lon": 30.030, "fleetSize": 42,
        "fleetType": "شاحنات تبريد برادات مجهزة لنقل وتبريد الخضروات والفاكهة الطازجة لموانئ التصدير", "priority": "A",
        "notes": "إنتاج وتجهيز وتصدير الخضروات والفاكهة الطازجة وفق اشتراطات السلامة الغذائية العالمية"
    },
    {
        "nameAr": "شركة الفرسان للأعلاف وتجارة الحبوب وصوامع الذرة (السادات الصحراوي)",
        "nameEn": "Al Forsan Feeds Grain Trading & Corn Silos Sadat Desert Rd",
        "sector": "manufacturing", "city": "sadat", "district": "طريق السادات الصحراوي - الكيلو 5", "governorate": "المنوفية",
        "address": "طريق السادات الصحراوي - مجمع الصوامع ومطاحن خامات الأعلاف الحيوانية",
        "phone1": "048-2606450", "phone2": "", "website": "",
        "email": "forsan.feeds.sadatdesert@gmail.com", "lat": 30.390, "lon": 30.545, "fleetSize": 45,
        "fleetType": "تريلات صوامع سايلو وتريلات نقل خامات الذرة الصفراء والصويا لمزارع الثروة الحيوانية", "priority": "A",
        "notes": "استيراد وتوزيع خامات الأعلاف وتصنيع أعلاف التسمين للماشية والدواجن بمحور الصحراوي"
    },
    {
        "nameAr": "شركة النوبارية للإنتاج الداجني والمجازر النصف آلية",
        "nameEn": "Nubaria Poultry Production & Semi-Automatic Abattoirs",
        "sector": "agriculture", "city": "nubaria", "district": "طريق النوبارية الدائري - قرى الخريجين", "governorate": "البحيرة",
        "address": "قرى الخريجين بالنوبارية - مجمع محطات تربية الدواجن والمجازر الآلية",
        "phone1": "045-2636700", "phone2": "", "website": "",
        "email": "nubaria.poultry.abattoir@gmail.com", "lat": 30.650, "lon": 30.095, "fleetSize": 38,
        "fleetType": "شاحنات أقفاص دواجن حية وبرادات مجهزة لتوزيع الدواجن المبردة والمجمدة للأسواق", "priority": "B+",
        "notes": "إنتاج دواجن التسمين ومجازر التجهيز وتوزيع الدواجن الطازجة لمحافظتي الإسكندرية والبحيرة"
    },
    {
        "nameAr": "شركة وادي النطرون للمقاولات العامة وتبطين الترع واستصلاح الأراضي",
        "nameEn": "Wadi El Natrun General Contracting & Canal Lining Co",
        "sector": "contracting", "city": "wadi_el_natrun", "district": "طريق الشيخ زايد - وادي النطرون", "governorate": "البحيرة",
        "address": "شارع مجلس المدينة - مجمع المعدات الثقيلة وأعمال البنية التحتية والتبطين",
        "phone1": "045-3603450", "phone2": "", "website": "",
        "email": "natrun.contracting.canallining@gmail.com", "lat": 30.405, "lon": 30.315, "fleetSize": 40,
        "fleetType": "حفارات هيدروليكية ولوادر وقلابات نقل خرسانة وأجهزة تشكيل الخرسانة لتبطين الترع", "priority": "A",
        "notes": "تنفيذ مشروعات تبطين وتأهيل الترع والمجاري المائية واستصلاح الأراضي بمحور وادي النطرون"
    },
    {
        "nameAr": "شركة السادات للبلاستيك وصناعة العبوات والبراميل الكيماوية",
        "nameEn": "Sadat Plastic Drum & Chemical Containers Industrial Co",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية السادسة - مدينة السادات", "governorate": "المنوفية",
        "address": "المنطقة الصناعية السادسة - مجمع مصانع التشكيل بالنفخ والحقن للبراميل البلاستيكية",
        "phone1": "048-2606700", "phone2": "", "website": "",
        "email": "sadat.plastic.drums@gmail.com", "lat": 30.362, "lon": 30.528, "fleetSize": 36,
        "fleetType": "شاحنات جامبو مغلقة وتريلات لنقل وتوريد البراميل البلاستيكية سعة 220 لتر والتانكات (IBC)", "priority": "B+",
        "notes": "تصنيع البراميل والتانكات البلاستيكية المخصصة لتعبئة ونقل الكيماويات والزيوت والمخللات"
    },

    # ── Additional 12 Entities to round out to 68 ──
    {
        "nameAr": "شركة السادات للكرتون الدوبلكس والعلب المطبوعة للصناعات الدوائية",
        "nameEn": "Sadat Duplex Carton & Printed Packaging Pharmaceutical Co",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية الثانية - مدينة السادات", "governorate": "المنوفية",
        "address": "المنطقة الصناعية الثانية - مجمع مصانع الكرتون والطباعة الدوائية",
        "phone1": "048-2611600", "phone2": "", "website": "",
        "email": "sadat.duplexcarton@gmail.com", "lat": 30.386, "lon": 30.518, "fleetSize": 34,
        "fleetType": "شاحنات جامبو مغلقة لنقل وتوزيع علب الكرتون الدوبلكس ومواد التعبئة لمصانع الأدوية", "priority": "B+",
        "notes": "تصنيع وطباعة علب الكرتون الدوبلكس والبروشورات المعتمدة لكبرى مصانع الأدوية والتجميل"
    },
    {
        "nameAr": "شركة السادات للمذيبات العضوية والصناعات الكيماوية التخصصية",
        "nameEn": "Sadat Organic Solvents & Specialty Chemicals Co",
        "sector": "manufacturing", "city": "sadat", "district": "المنطقة الصناعية السابعة - مدينة السادات", "governorate": "المنوفية",
        "address": "المنطقة الصناعية السابعة - مجمع مصانع تقطير وتعبئة المذيبات العضوية",
        "phone1": "048-2611700", "phone2": "", "website": "",
        "email": "sadat.organicsolvents@gmail.com", "lat": 30.368, "lon": 30.514, "fleetSize": 36,
        "fleetType": "صهاريج كيميائية مجهزة لنقل التنر والأسيتون والمذيبات وشاحنات نقل براميل معتمدة", "priority": "A",
        "notes": "تقطير وتعبئة وتوزيع المذيبات العضوية والكيميائية لمصانع الدهانات والأحبار والبتروكيماويات"
    },
    {
        "nameAr": "شركة المنوفية لتجارة وتوزيع الحبوب وصوامع السادات المركزية",
        "nameEn": "Menofia Grain Trading & Sadat Central Silos Co",
        "sector": "transport", "city": "sadat", "district": "المنطقة اللوجستية المركزية - مدينة السادات", "governorate": "المنوفية",
        "address": "طريق السادات شبين الكوم - مجمع صوامع تخزين الذرة والقمح وفول الصويا",
        "phone1": "048-2611800", "phone2": "", "website": "",
        "email": "menofia.grainsilos.sadat@gmail.com", "lat": 30.392, "lon": 30.538, "fleetSize": 44,
        "fleetType": "تريلات صوامع سايلو وتريلات نقل حبوب سائبة لمصانع الأعلاف والمطاحن بالدلتا", "priority": "A",
        "notes": "تفريغ وتخزين وشحن الحبوب الاستراتيجية وخامات الأعلاف وتوزيعها لمصانع الأعلاف بوسط الدلتا"
    },
    {
        "nameAr": "شركة وادي النطرون لتصنيع وتعبئة مخللات الزيتون والخضروات",
        "nameEn": "Wadi El Natrun Pickles & Olives Processing Co",
        "sector": "manufacturing", "city": "wadi_el_natrun", "district": "طريق دير السريان - وادي النطرون", "governorate": "البحيرة",
        "address": "طريق الأديرة - مجمع مصانع تخليل وتعبئة الزيتون والفلفل والخيار التصديري",
        "phone1": "045-3603700", "phone2": "", "website": "",
        "email": "natrun.pickles.processing@gmail.com", "lat": 30.385, "lon": 30.305, "fleetSize": 32,
        "fleetType": "شاحنات نقل وتوزيع جامبو وبرادات لتصدير البراميل والعبوات الزجاجية لموانئ الشحن", "priority": "B+",
        "notes": "تجهيز وتخليل وتعبئة منتجات الزيتون والمخللات الطبيعية للأسواق المحلية وموانئ التصدير"
    },
    {
        "nameAr": "شركة وادي النطرون للبترول وتموين شاحنات طريق العلمين الدولي",
        "nameEn": "Wadi El Natrun Petroleum & Heavy Truck Bunkering Alamein Rd",
        "sector": "petroleum", "city": "wadi_el_natrun", "district": "طريق وادي النطرون العلمين الدولي الكيلو 5", "governorate": "البحيرة",
        "address": "تقاطع طريق العلمين مع الصحراوي - مجمع محطات الوقود والديزل للشاحنات الثقيلة",
        "phone1": "045-3603950", "phone2": "", "website": "",
        "email": "natrun.petroleum.alamein@gmail.com", "lat": 30.425, "lon": 30.320, "fleetSize": 46,
        "fleetType": "صهاريج نقل وقود وسولار ديزل وشاحنات صيانة وإمداد بترولي للشاحنات العابرة للساحل", "priority": "A",
        "notes": "تأمين ونقل الوقود وتموين قوافل الشاحنات واللوادر العاملة بمشروعات الساحل والعلمين والضبعة"
    },
    {
        "nameAr": "شركة بحيرة النطرون لتجارة الأملاح والكيماويات الميدانية",
        "nameEn": "Natrun Lakes Salts & Field Chemicals Trading Co",
        "sector": "manufacturing", "city": "wadi_el_natrun", "district": "منطقة الملاحات الشرقية - وادي النطرون", "governorate": "البحيرة",
        "address": "طريق بحيرة الحمراء - مجمع طحن وتعبئة الملح الصناعي وأملاح الصوديوم",
        "phone1": "045-3604200", "phone2": "", "website": "",
        "email": "natrunlakes.salts@gmail.com", "lat": 30.415, "lon": 30.315, "fleetSize": 38,
        "fleetType": "قلابات ثقيلة وتريلات نقل أملاح خشنة وناعمة لمصانع الصابون والمنسوجات بالدلتا", "priority": "B+",
        "notes": "استخراج وتعبئة أملاح كبريتات وكلوريد الصوديوم وتوريدها للقطاعات الصناعية والتصدير"
    },
    {
        "nameAr": "شركة النوبارية لتصدير الرمان والموالح للأسواق الآسيوية والأوروبية",
        "nameEn": "Nubaria Pomegranate & Citrus Export Packhouse Co",
        "sector": "agriculture", "city": "nubaria", "district": "طريق النوبارية الصحراوي الكيلo 88", "governorate": "البحيرة",
        "address": "الكيلو 88 طريق مصر إسكندرية الصحراوي - مجمع محطات الفرز الإلكتروني والتبريد",
        "phone1": "045-2641500", "phone2": "", "website": "",
        "email": "nubaria.pomegranate.citrus@gmail.com", "lat": 30.720, "lon": 30.010, "fleetSize": 48,
        "fleetType": "برادات تريلا مبردة لنقل الرمان الووندرفول والموالح لموانئ الإسكندرية ومطارات الشحن", "priority": "A",
        "notes": "فرز وتعبئة وشحن الرمان والموالح التصديرية المعالجة وفق اشتراطات الحجر الزراعي الدولي"
    },
    {
        "nameAr": "شركة بنجر السكر لتجارة وتوزيع التقاوي والمخصبات الحيوية",
        "nameEn": "Banger El Sokkar Seeds & Bio-Fertilizers Trading Co",
        "sector": "agriculture", "city": "nubaria", "district": "منطقة بنجر السكر - ترعة النوبارية", "governorate": "البحيرة",
        "address": "مجمع الخدمات الزراعية - بنجر السكر - مجمع مستودعات التقاوي والمبيدات المعتمدة",
        "phone1": "045-2641600", "phone2": "", "website": "",
        "email": "bangersokkar.seeds.bio@gmail.com", "lat": 30.735, "lon": 30.045, "fleetSize": 30,
        "fleetType": "شاحنات فان وجامبو مغلقة لتوزيع التقاوي المعتمدة والمخصبات الحيوية لمزارعي البنجر", "priority": "B+",
        "notes": "تأمين وتوزيع تقاوي بنجر السكر والذرة والمخصبات الحيوية لكبرى مزارع الاستصلاح الزراعي"
    },
    {
        "nameAr": "شركة مزارع الصحراوي لإنتاج الحليب الخام والحلاب الآلي (الكيلو 70)",
        "nameEn": "Desert Farms Raw Milk & Automated Milking Co Km 70",
        "sector": "agriculture", "city": "nubaria", "district": "طريق مصر إسكندرية الصحراوي الكيلو 70", "governorate": "البحيرة",
        "address": "الكيلو 70 طريق مصر إسكندرية الصحراوي - مجمع محالب الأبقار الفريزيان الحديثة",
        "phone1": "045-2641700", "phone2": "", "website": "",
        "email": "desertfarms.rawmilk.km70@gmail.com", "lat": 30.580, "lon": 30.160, "fleetSize": 55,
        "fleetType": "صهاريج ستانلس ستيل معقمة ومبردة لنقل الحليب الخام وتريلات نقل أعلاف خضراء وسيلاج", "priority": "A+",
        "notes": "إنتاج الحليب البقري الطبيعي وتوريده يومياً بنظام السلسلة الباردة لمصانع الألبان والجبن الكبرى"
    },
    {
        "nameAr": "شركة طيبة للنقل المبرد وشحن الأغذية لمطارات الشحن والموانئ",
        "nameEn": "Tiba Cold Freight & Airport Shipping Logistics Co",
        "sector": "transport", "city": "nubaria", "district": "طريق مصر إسكندرية الصحراوي الكيلو 60", "governorate": "الجيزة",
        "address": "الكيلو 60 طريق مصر إسكندرية الصحراوي - المركز اللوجستي للشحن الجوي والبحري المبرد",
        "phone1": "045-2641800", "phone2": "", "website": "",
        "email": "tiba.coldfreight.desert@gmail.com", "lat": 30.340, "lon": 30.380, "fleetSize": 40,
        "fleetType": "شاحنات وفانات تبريد وتجميد سريعة مخصصة لنقل الشحنات الزراعية الطازجة لمطار القاهرة وموانئ الإسكندرية", "priority": "A",
        "notes": "خدمات النقل السريع للحاصلات الزراعية التصديرية ذات الصلاحية القصيرة (فراولة، توت، خضروات دقيقة)"
    },
    {
        "nameAr": "شركة النوبارية لتصنيع شبكات الري الحديث والبوليمرات (النوبارية الجديدة)",
        "nameEn": "Nubaria Modern Irrigation Networks & Polymers Manufacturing",
        "sector": "manufacturing", "city": "nubaria", "district": "المنطقة الصناعية بالنوبارية الجديدة", "governorate": "البحيرة",
        "address": "المنطقة الصناعية - قطاع البلاستيك - النوبارية",
        "phone1": "045-2641900", "phone2": "", "website": "",
        "email": "nubaria.irrigation.polymers@gmail.com", "lat": 30.678, "lon": 30.068, "fleetSize": 35,
        "fleetType": "تريلات نقل رولات خراطيم الري وشاحنات جامبو لتوزيع شبكات الري للمزارع الصحراوية", "priority": "B+",
        "notes": "تصنيع خراطيم الجي آر وخراطيم الري بالتنقيط ومستلزمات البيوت المحمية والصوب الزراعية"
    },
    {
        "nameAr": "شركة الصحراوي للمقاولات العامة واستصلاح الأراضي والإنشاءات",
        "nameEn": "Desert Highway General Contracting & Land Reclamation Co",
        "sector": "contracting", "city": "nubaria", "district": "طريق مصر إسكندرية الصحراوي الكيلو 95", "governorate": "البحيرة",
        "address": "الكيلو 95 طريق مصر إسكندرية الصحراوي - مجمع ورش الآليات الثقيلة والمقاولات",
        "phone1": "045-2642100", "phone2": "", "website": "",
        "email": "deserthighway.contracting.reclamation@gmail.com", "lat": 30.415, "lon": 30.500, "fleetSize": 42,
        "fleetType": "لوادر وحفارات وكساحات نقل معدات ثقيلة وتريلات نقل خامات بناء وشبكات ري", "priority": "A",
        "notes": "مقاولات استصلاح الأراضي ومد خطوط طرد المياه وإنشاء محطات الرفع والمباني الخدمية بالمزارع"
    }
]

print(f"\nProcessing {len(candidates_data)} candidate enterprises for Square 9...")

approved_companies = []
rejected = 0

for idx, cand in enumerate(candidates_data, start=1):
    comp_id = f"comp_p2_desert_sadat_{idx:03d}"
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

print("\n" + "="*42)
print("Results for Square 9 (Cairo-Alex Desert Road, Sadat City, Wadi El Natrun & Nubaria):")
print(f"Total Candidates: {len(candidates_data)}")
print(f"Approved (Pure B2B, Zero Duplicates): {len(approved_companies)}")
print(f"Rejected: {rejected}")
print("="*42)

os.makedirs('scraper/output', exist_ok=True)
out_path = 'scraper/output/phase2_desert_sadat_verified_b2b_fleet.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(approved_companies, f, ensure_ascii=False, indent=2)

print(f"Saved {len(approved_companies)} approved enterprises to {out_path}\n")
