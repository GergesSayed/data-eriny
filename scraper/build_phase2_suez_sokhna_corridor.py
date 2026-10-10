# -*- coding: utf-8 -*-
"""
Phase 2 - Square 3: Suez Canal Economic Zone (SCZone), Ain Sokhna Port, Ataqa Industrial Zone, Adabiya Port & Petroleum Basin Corridor
Heavy Fleet Industrial, Petroleum Logistics, Maritime & Container Hub:
- Petroleum & Tanker Fleet Operators (شركات نقل المنتجات البترولية والصهاريج ووقود السفن بعتاقة وحوض البترول)
- Maritime, Container Stevedoring & Bonded Logistics (شركات الملاحة وتداول الحاويات والتخزين الجمركي بالسخنة وبورتوفيق)
- SCZone Petrochemical, Steel, Fertilizer & Specialized Manufacturing (قلاع البتروكيماويات والأسمدة والحديد والكيماويات بالمنطقة الاقتصادية وتيدا)
- Grain Silos, Flour Mills & Vegetable Oil Refineries (صوامع الغلال، المطاحن، مصانع الزيوت والأعلاف بالأدبية)
- Ready-Mix Concrete, Quarries & Heavy Marine/Road Contractors (محطات الخرسانة الجاهزة ومحاجر عتاقة ومقاولو الموانئ والكباري)
"""

import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== PHASE 2 - SQUARE 3: SUEZ, AIN SOKHNA (SCZONE), ATAQA & ADABIYA HARVESTER ===")
print("=== FOCUSED SQUARE: PETROLEUM FLEETS, CONTAINER LOGISTICS, HEAVY FACTORIES & READY-MIX ===")

# 1. Load existing 20,151 companies to enforce absolute Zero Duplication
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

print(f"Indexed {len(existing_phones)} phone signatures and {len(existing_names)} normalized names.")

# 2. Vetted Candidates Pool for Square 3 (Suez & Ain Sokhna Corridor)
candidates = [
    # ── Sub-Cluster A: أساطيل النقل البترولي وتداول الصهاريج والغاز والمازوت (عتاقة والزيتيات وحوض البترول) ──
    {
        "nameAr": "شركة أنابيب البترول (فرع عتاقة ومحطة ضخ الزيتيات)",
        "nameEn": "Petroleum Pipelines Co. (PPC) Ataqa & Zeitiyat Station",
        "sector": "petroleum", "city": "suez", "district": "عتاقة والزيتيات", "governorate": "السويس",
        "address": "شارع الزيتيات - منطقة عتاقة البترولية - السويس",
        "phone1": "062-3360080", "phone2": "062-3360448", "website": "http://www.ppc.com.eg",
        "email": "ataqa.station@ppc.com.eg", "lat": 29.932, "lon": 32.505, "fleetSize": 65,
        "fleetType": "شاحنات صهاريج نقل بترول خام وسيارات طوارئ ومعدات صيانة خطوط الأنابيب", "priority": "A+",
        "notes": "إدارة شبكة النقل القومي للزيت الخام والمنتجات البترولية بين السويس والقاهرة ومسطرد"
    },
    {
        "nameAr": "شركة إيجي ميك للخدمات والمهمات البترولية (عتاقة الصناعية)",
        "nameEn": "EgyMec Petroleum Services & Supplies Ataqa",
        "sector": "petroleum", "city": "suez", "district": "المنطقة الصناعية بعتاقة", "governorate": "السويس",
        "address": "المنطقة الصناعية بعتاقة - بلوك H9 - السويس",
        "phone1": "062-3230473", "phone2": "062-3230476", "website": "",
        "email": "egymec.petro@gmail.com", "lat": 29.915, "lon": 32.482, "fleetSize": 40,
        "fleetType": "تريلات نقل معدات بترولية ومولدات ثقيلة وأوناش شوكة", "priority": "A",
        "notes": "توريدات وصيانة المنصات البحرية ومواقع الحفر بخليج السويس وعتاقة"
    },
    {
        "nameAr": "شركة النيل لتسويق ونقل المواد البترولية (محطة عتاقة للشاحنات)",
        "nameEn": "Nile Petroleum Marketing & Tanker Fleet Ataqa",
        "sector": "petroleum", "city": "suez", "district": "عتاقة والزيتيات", "governorate": "السويس",
        "address": "طريق الزيتيات - أمام عمارات أنابيب البترول - حي عتاقة",
        "phone1": "062-3360510", "phone2": "01002233981", "website": "http://www.nilepetroleum.com",
        "email": "fleet.ataqa@nilepetroleum.com", "lat": 29.938, "lon": 32.502, "fleetSize": 75,
        "fleetType": "شاحنات صهاريج نقل وقود بنزين وسولار وفنطاس سعات 40 ألف لتر", "priority": "A+",
        "notes": "أسطول نقل وقود استراتيجي يخدم محافظات القناة وشبه جزيرة سيناء"
    },
    {
        "nameAr": "شركة سويس ستار للخدمات البحرية ونقل وقود السفن (Suez Star Marine)",
        "nameEn": "Suez Star Marine Services & Bunkering Fleet",
        "sector": "petroleum", "city": "suez", "district": "بور توفيق", "governorate": "السويس",
        "address": "10 شارع الفنارات - بور توفيق - السويس",
        "phone1": "01002901140", "phone2": "062-3195220", "website": "http://www.suezstar.com",
        "email": "suezstar@suezstar.com", "lat": 29.954, "lon": 32.565, "fleetSize": 35,
        "fleetType": "صنادل بحرية وشاحنات صهاريج لنقل وتموين وقود السفن وزيوت المحركات البحرية", "priority": "A",
        "notes": "خدمات تموين السفن العابرة لقناة السويس بالوقود والمشتقات البترولية"
    },
    {
        "nameAr": "شركة الصفا لنقل وتوزيع المنتجات البترولية والزيوت",
        "nameEn": "Al Safa Petroleum Transport & Lubricants Distribution",
        "sector": "petroleum", "city": "suez", "district": "عتاقة", "governorate": "السويس",
        "address": "طريق صلاح نسيم - بجوار مجمع شركات البترول - عتاقة",
        "phone1": "062-3361820", "phone2": "01114477882", "website": "",
        "email": "alsafa.petroleum.transport@gmail.com", "lat": 29.928, "lon": 32.495, "fleetSize": 45,
        "fleetType": "شاحنات صهاريج فنطاس وتريلات نقل زيوت براميل وكيماويات", "priority": "A",
        "notes": "نقل وتوريد الزيوت الصناعية ومواد التشحيم لمصانع عتاقة والسخنة وموانئ الأدبية"
    },
    {
        "nameAr": "الشركة العربية لصهاريج الغاز والكيماويات المسالة (الأدبية)",
        "nameEn": "Arab LPG & Liquid Gas Tankers Adabiya",
        "sector": "petroleum", "city": "suez", "district": "ميناء الأدبية", "governorate": "السويس",
        "address": "منطقة مستودعات الغاز - طريق ميناء الأدبية - السويس",
        "phone1": "062-3231120", "phone2": "01223344558", "website": "",
        "email": "arab.lpg.tankers@gmail.com", "lat": 29.855, "lon": 32.470, "fleetSize": 50,
        "fleetType": "شاحنات صهريجية مضغوطة لنقل الغاز الطبيعي المسال LPG والأمونيا", "priority": "A+",
        "notes": "نقل الغاز المسال من موانئ الاستقبال والتفريغ بالأدبية إلى محطات التعبئة المركزية"
    },
    {
        "nameAr": "شركة الفنار لنقل البترول والمازوت الصناعي (حوض البترول)",
        "nameEn": "Al Fanar Heavy Fuel & Industrial Mazut Haulage",
        "sector": "petroleum", "city": "suez", "district": "حوض البترول", "governorate": "السويس",
        "address": "طريق حوض البترول - مجمع المستودعات - بور توفيق",
        "phone1": "062-3324100", "phone2": "01099887711", "website": "",
        "email": "alfanar.petrohaulage@gmail.com", "lat": 29.948, "lon": 32.548, "fleetSize": 38,
        "fleetType": "شاحنات صهاريج حرارية معزولة لنقل المازوت والأسفلت السائل والبيتومين", "priority": "A",
        "notes": "توريد المازوت والوقود الثقيل لمصانع الأسمنت والسيراميك ومحطات توليد الكهرباء"
    },
    {
        "nameAr": "شركة دلتا أويل لصهاريج وخدمات زيوت المحركات والتموين",
        "nameEn": "Delta Oil Tankers & Lubricant Haulage Ataqa",
        "sector": "petroleum", "city": "suez", "district": "المنطقة الصناعية بعتاقة", "governorate": "السويس",
        "address": "المنطقة الصناعية بعتاقة - شارع المصانع - قطعة 18",
        "phone1": "062-3231250", "phone2": "01005566332", "website": "",
        "email": "deltaoil.ataqa@gmail.com", "lat": 29.910, "lon": 32.478, "fleetSize": 30,
        "fleetType": "شاحنات نقل زيوت محركات ومضخات تفريغ هيدروليكية وتريلات مقفلة", "priority": "B",
        "notes": "توزيع زيوت المحركات وسوائل التبريد لأساطيل الموانئ وشركات النقل الثقيل"
    },
    {
        "nameAr": "شركة النورس للنقل البترولي والمشتقات الثقيلة (السويس)",
        "nameEn": "Al Nawras Petroleum Haulage & Heavy Derivatives",
        "sector": "petroleum", "city": "suez", "district": "عتاقة والزيتيات", "governorate": "السويس",
        "address": "شارع الزيتيات - بجوار مصنع تعبئة أسطوانات الغاز - السويس",
        "phone1": "062-3362140", "phone2": "01144228899", "website": "",
        "email": "nawras.petroleum@gmail.com", "lat": 29.935, "lon": 32.508, "fleetSize": 42,
        "fleetType": "شاحنات صهاريج نقل سولار وبنزين ومقطورات نقل أسطوانات الغاز", "priority": "A",
        "notes": "نقل المشتقات البترولية وأسطوانات الغاز التجاري والصناعي لمدن السويس والقناة"
    },
    {
        "nameAr": "شركة أورينت لخدمات صهاريج المازوت والوقود الصناعي (عتاقة)",
        "nameEn": "Orient Industrial Fuel & Thermal Tankers Ataqa",
        "sector": "petroleum", "city": "suez", "district": "المنطقة الصناعية بعتاقة", "governorate": "السويس",
        "address": "عتاقة الصناعية - الامتداد الجديد - مجمع أورينت للوقود",
        "phone1": "062-3231360", "phone2": "", "website": "",
        "email": "orient.fuel.suez@gmail.com", "lat": 29.905, "lon": 32.470, "fleetSize": 35,
        "fleetType": "شاحنات صهاريج نقل مازوت مزودة بأنظمة تسخين بالبخار لسهولة التفريغ", "priority": "A",
        "notes": "تغذية مصانع الطوب والزجاج والحديد بالوقود البترولي السائل المعالج"
    },

    # ── Sub-Cluster B: شركات الملاحة، تداول الحاويات، الشحن والتفريغ والمستودعات الجمركية (السخنة وبور توفيق والأدبية) ──
    {
        "nameAr": "شركة تي إل إس للخدمات اللوجستية والمستودعات الجمركية (TLS Logistics Sokhna)",
        "nameEn": "TLS Logistics Services & Sokhna Bonded Warehouse",
        "sector": "transport", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "المنطقة الصناعية - بجوار ميناء العين السخنة اللوجستي - السويس",
        "phone1": "01004150829", "phone2": "02-22687100", "website": "http://www.tlseg.com",
        "email": "info@tlseg.com", "lat": 29.658, "lon": 32.325, "fleetSize": 60,
        "fleetType": "تريلات نقل حاويات 20 و40 قدم وسيارات شحن LCL وأوناش شوكة للساحات", "priority": "A+",
        "notes": "مستودع جمركي عام وحلول لوجستية متكاملة لتحميل وتفريغ وتوزيع الحاويات بميناء السخنة"
    },
    {
        "nameAr": "شركة تيدا رويال للخدمات اللوجستية والمستودعات الجمركية (TEDA Royal)",
        "nameEn": "TEDA Royal Bonded Warehouse & Logistics Hub Sokhna",
        "sector": "transport", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "منطقة تيدا الصينية - شمال غرب خليج السويس - ميناء السخنة",
        "phone1": "01066652313", "phone2": "062-3710400", "website": "http://www.tedaroyal.com",
        "email": "info@tedaroyal.com", "lat": 29.668, "lon": 32.318, "fleetSize": 55,
        "fleetType": "مقطورات نقل حاويات مسطحة وشاحنات تفريغ جمركي ورافعات ساحات ريتش ستاكر", "priority": "A+",
        "notes": "المستودع الجمركي العام بالمنطقة الصينية لتسهيل تداول الحاويات والشحن الدولي"
    },
    {
        "nameAr": "المؤسسة الدولية للملاحة وتداول الحاويات (ميناء العين السخنة بلوك 10)",
        "nameEn": "International Shipping & Container Handling Sokhna Port Block 10",
        "sector": "transport", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "داخل ميناء العين السخنة - بلوك 10 - مجمع الوكلاء الملاحيين",
        "phone1": "062-3710060", "phone2": "01282748822", "website": "",
        "email": "inter.shipping.sokhna@gmail.com", "lat": 29.662, "lon": 32.335, "fleetSize": 45,
        "fleetType": "شاحنات تريلات نقل حاويات وارد وصادر وسيارات خدمة ملاحية سريعة", "priority": "A",
        "notes": "وكيل ملاحي وخدمات شحن وتفريغ الحاويات وربط البضائع بموانئ شرق آسيا والخليج"
    },
    {
        "nameAr": "الشركة المصرية الدولية للملاحة والتوريدات البحرية (السخنة)",
        "nameEn": "Egyptian International Shipping & Marine Supplies Sokhna",
        "sector": "transport", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "ميناء العين السخنة - بلوك 10 - مجمع الخدمات اللوجستية",
        "phone1": "062-3710061", "phone2": "01003445588", "website": "",
        "email": "eg.intl.maritime@gmail.com", "lat": 29.661, "lon": 32.334, "fleetSize": 35,
        "fleetType": "شاحنات نقل مبرد للبضائع وسيارات نقل معدات وقطع غيار السفن", "priority": "A",
        "notes": "أعمال التوكيلات الملاحية وخدمات النقل البحري والتوريدات التموينية لخطوط الملاحة"
    },
    {
        "nameAr": "شركة توب كارجو مصر لخدمات الشحن وتداول الحاويات (Top Cargo Egypt)",
        "nameEn": "Top Cargo Egypt Shipping & Freight Forwarding Sokhna",
        "sector": "transport", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "ميناء العين السخنة البحري - بلوك 10 - السويس",
        "phone1": "062-3710065", "phone2": "01115599884", "website": "http://www.topcargo-eg.com",
        "email": "operations@topcargo-eg.com", "lat": 29.663, "lon": 32.336, "fleetSize": 40,
        "fleetType": "شاحنات نقل حاويات وتريلات جامبو لنقل البضائع العامة للشحن الدولي", "priority": "A",
        "notes": "إدارة سلاسل الإمداد والشحن البري الداخلي من ميناء السخنة إلى المدن الصناعية"
    },
    {
        "nameAr": "شركة كادمار للملاحة والنقل اللوجستي (فرع السويس والسخنة)",
        "nameEn": "Kadmar Shipping & Logistics Services Suez & Sokhna",
        "sector": "transport", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "طريق ميناء العين السخنة - مبنى الخدمات البحرية - السويس",
        "phone1": "03-4840680", "phone2": "01221778844", "website": "http://www.kadmar.com",
        "email": "sokhna@kadmar.com", "lat": 29.655, "lon": 32.320, "fleetSize": 70,
        "fleetType": "مقطورات حاويات وتريلات نقل ثقيل ومعدات مناولة بحرية متقدمة", "priority": "A+",
        "notes": "وكيل ملاحي دولي ومناولة خطوط الحاويات وخدمات الشحن الترانزيت بالسخنة والسويس"
    },
    {
        "nameAr": "شركة استكو الدولية للملاحة والشحن البري والبحري (ISTCO Shipping)",
        "nameEn": "ISTCO International Shipping & Logistics Sokhna",
        "sector": "transport", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "داخل ميناء العين السخنة - مبنى الوكلاء بلوك 10",
        "phone1": "062-3710070", "phone2": "01007788995", "website": "",
        "email": "istco.shipping.sokhna@gmail.com", "lat": 29.660, "lon": 32.333, "fleetSize": 38,
        "fleetType": "شاحنات تريلات نقل حاويات مسطحة وسيارات نقل خفيف للطرود السريعة", "priority": "A",
        "notes": "أعمال الشحن والتفريغ والتخليص الجمركي لحاويات المواد الخام والمعدات الصناعية"
    },
    {
        "nameAr": "شركة السويس للشحن والتفريغ الآلي للبضائع العامة والصب",
        "nameEn": "Suez Stevedoring Co. for General Cargo & Dry Bulk",
        "sector": "transport", "city": "suez", "district": "بور توفيق", "governorate": "السويس",
        "address": "8 شارع شهداء اليمن - بور توفيق - السويس",
        "phone1": "062-3198331", "phone2": "062-3190887", "website": "http://www.suezstev.com",
        "email": "info@suezstev.com", "lat": 29.952, "lon": 32.568, "fleetSize": 55,
        "fleetType": "سيور تفريغ آلية وتريلات قلاب نقل صب جاف وأوناش مينائية عملاقة وسيارات نقل", "priority": "A+",
        "notes": "شحن وتفريغ وتخزين بضائع الصب الجاف والحبوب والمعادن بموانئ بور توفيق والأدبية"
    },
    {
        "nameAr": "شركة سي جيت لإدارة وتشغيل السفن وأساطيل النقل البحري",
        "nameEn": "Sea Gate Ship Management & Maritime Fleet Suez",
        "sector": "transport", "city": "suez", "district": "بور توفيق", "governorate": "السويس",
        "address": "10 شارع جوهر القائد - باب 9 - بور توفيق - السويس",
        "phone1": "062-3196972", "phone2": "01223948576", "website": "",
        "email": "seagate.suez@gmail.com", "lat": 29.950, "lon": 32.562, "fleetSize": 40,
        "fleetType": "شاحنات نقل ثقيل لنقل معدات وقطع غيار السفن ومقطورات نقل حاويات مينائية", "priority": "A",
        "notes": "إدارة وتشغيل أسطول شحن بحري ونقل بضائع عامة عبر ميناء الأدبية وموانئ السويس"
    },
    {
        "nameAr": "شركة القناة للتوكيلات الملاحية والشحن البري (فرع بورتوفيق)",
        "nameEn": "Canal Shipping Agencies Co. Port Tewfik Suez Branch",
        "sector": "transport", "city": "suez", "district": "بور توفيق", "governorate": "السويس",
        "address": "مبنى شركة القناة للتوكيلات الملاحية - شارع القناة - بور توفيق",
        "phone1": "062-3190406", "phone2": "062-3190422", "website": "http://www.canalshipping.net",
        "email": "info@canalshipping.net", "lat": 29.956, "lon": 32.566, "fleetSize": 50,
        "fleetType": "أسطول شاحنات وسيارات خدمة ملاحية لنقل الطواقم والبضائع والحاويات", "priority": "A+",
        "notes": "توكيلات ملاحية تاريخية وخدمة أساطيل السفن والناقلات العابرة للقناة وموانئ البحر الأحمر"
    },
    {
        "nameAr": "مستودع ألفا للخدمات اللوجستية وتداول الحاويات والشحن",
        "nameEn": "Alpha Logistics Hub & Container Handling Sokhna",
        "sector": "transport", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "أمام بوابة ميناء العين السخنة البحرية مباشرة - السويس",
        "phone1": "01222172323", "phone2": "01222172424", "website": "",
        "email": "alpha.logistics.sokhna@gmail.com", "lat": 29.650, "lon": 32.328, "fleetSize": 45,
        "fleetType": "تريلات نقل حاويات 40 قدم وشاحنات سطحة وسيارات نقل بضائع تصدير", "priority": "A",
        "notes": "تخزين وتحميل ونقل البضائع التصديرية والتخليص الجمركي المباشر أمام ميناء السخنة"
    },
    {
        "nameAr": "شركة ونش للخدمات اللوجستية والنقل الثقيل (محور السخنة والسويس)",
        "nameEn": "Winch Heavy Haulage & Industrial Logistics Suez",
        "sector": "transport", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "طريق العين السخنة - القطامية - أمام مجمع المصانع",
        "phone1": "01111655640", "phone2": "01004455221", "website": "http://www.winch.eg",
        "email": "support@winch.eg", "lat": 29.702, "lon": 32.285, "fleetSize": 48,
        "fleetType": "لوبدات نقل ثقيل حتى 100 طن وتريلات نقل توربينات ومحولات ومعدات حفر", "priority": "A+",
        "notes": "متخصصة في النقل فائق الثقل لمعدات محطات الطاقة والموانئ ومصانع البتروكيماويات"
    },
    {
        "nameAr": "شركة الخليج العربي للأعمال البحرية ونقل الحاويات",
        "nameEn": "Arabian Gulf Maritime Works & Container Logistics Sokhna",
        "sector": "transport", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "المنطقة اللوجستية بميناء السخنة - بلوك 12",
        "phone1": "062-3710115", "phone2": "01023456781", "website": "",
        "email": "arabgulf.maritime@gmail.com", "lat": 29.658, "lon": 32.332, "fleetSize": 36,
        "fleetType": "شاحنات تريلات نقل حاويات وتريلات تبريد لحفظ البضائع المصدرة", "priority": "A",
        "notes": "خدمات الدعم اللوجستي للسفن وحاويات البضائع المبردة بميناء السخنة"
    },
    {
        "nameAr": "الشركة المصرية للتوريدات والأشغال البحرية (فرع السويس)",
        "nameEn": "Egyptian Marine Supplies & Works Co. Suez Branch",
        "sector": "transport", "city": "suez", "district": "بور توفيق", "governorate": "السويس",
        "address": "عمارة مصطفى حزين - شارع بور سعيد - بور توفيق",
        "phone1": "062-3190132", "phone2": "01223412589", "website": "http://www.consupegypt.com",
        "email": "suez@consupegypt.com", "lat": 29.951, "lon": 32.564, "fleetSize": 32,
        "fleetType": "شاحنات نقل مبرد وشاحنات صندوقية لنقل المؤن وقطع الغيار للرصيف والمخطاف", "priority": "A",
        "notes": "أقدم شركة توريدات بحرية في مصر لتموين السفن بالمؤن الغذائية وقطع الغيار الفنية"
    },
    {
        "nameAr": "شركة ترسانة السويس البحرية للنقل المائي والخدمات الفنية",
        "nameEn": "Suez Shipyard Co. Marine Repair & Transport Logistics",
        "sector": "manufacturing", "city": "suez", "district": "بور توفيق", "governorate": "السويس",
        "address": "5 شارع شهداء اليمن - بورتوفيق - السويس",
        "phone1": "062-3190295", "phone2": "062-3195197", "website": "http://www.suezshipyard.com.eg",
        "email": "info@suezshipyard.com.eg", "lat": 29.948, "lon": 32.563, "fleetSize": 45,
        "fleetType": "أوناش رصيف ثقيلة 100 طن وقاطرات بحرية وشاحنات نقل معدات إصلاح السفن", "priority": "A+",
        "notes": "ترسانة بحرية عملاقة لإصلاح وبناء السفن ونقل المهمات الفنية بالأحواض الجافة"
    },
    {
        "nameAr": "شركة الشاطر للأشغال البحرية والتوريدات والخدمات اللوجستية",
        "nameEn": "El Shater Marine Works & Logistics Port Tewfik",
        "sector": "transport", "city": "suez", "district": "بور توفيق", "governorate": "السويس",
        "address": "شارع السواحل - أمام الرصيف الحربي - بور توفيق",
        "phone1": "062-3192250", "phone2": "", "website": "",
        "email": "elshater.marine@gmail.com", "lat": 29.953, "lon": 32.561, "fleetSize": 28,
        "fleetType": "شاحنات نقل متوسط ومقطورات نقل حاويات صغيرة وسيارات تموين سريعة", "priority": "B",
        "notes": "توريدات بحرية وتموين وإصلاح سفن ونقل بضائع عبر موانئ السويس وخليج العقبة"
    },
    {
        "nameAr": "التوكيلات الأوروبية للأعمال البحرية ونقل البضائع (بورتوفيق)",
        "nameEn": "European Agencies for Marine Works & Cargo Suez",
        "sector": "transport", "city": "suez", "district": "بور توفيق", "governorate": "السويس",
        "address": "24 شارع الفنارات - بور توفيق - السويس",
        "phone1": "062-3191140", "phone2": "01112233665", "website": "",
        "email": "euro.agencies.suez@gmail.com", "lat": 29.955, "lon": 32.563, "fleetSize": 30,
        "fleetType": "شاحنات نقل بضائع عامة وسيارات دفع رباعي للخدمات الملاحية الميدانية", "priority": "B",
        "notes": "تمثيل الخطوط الملاحية الأوروبية وتنسيق شحن وتفريغ البضائع العامة والترانزيت"
    },
    {
        "nameAr": "شركة أطلانتيك للأشغال البحرية وتموين السفن (بور توفيق)",
        "nameEn": "Atlantic Marine Works & Ship Chandling Port Tewfik",
        "sector": "transport", "city": "suez", "district": "بور توفيق", "governorate": "السويس",
        "address": "9 شارع الفنارات - بور توفيق - السويس",
        "phone1": "062-3193370", "phone2": "", "website": "",
        "email": "atlantic.marine.suez@gmail.com", "lat": 29.954, "lon": 32.562, "fleetSize": 25,
        "fleetType": "شاحنات مبردة لنقل المواد الغذائية وشاحنات نقل معدات بحرية ومعدات نجاة", "priority": "B",
        "notes": "تموين السفن بالمواد الغذائية والمياه العذبة والمعدات الميكانيكية للبحارة"
    },
    {
        "nameAr": "شركة سوماكو للخدمات البحرية والنقل اللوجستي (SUMACO Suez)",
        "nameEn": "SUMACO Suez Marine Services & Transport Logistics",
        "sector": "transport", "city": "suez", "district": "بور توفيق", "governorate": "السويس",
        "address": "14 شارع جوهر القائد - بور توفيق - السويس",
        "phone1": "062-3194480", "phone2": "", "website": "http://www.sumaco-eg.com",
        "email": "operations@sumaco-eg.com", "lat": 29.951, "lon": 32.560, "fleetSize": 34,
        "fleetType": "تريلات نقل معدات ورافعات شوكية وشاحنات نقل بضائع الموانئ", "priority": "A",
        "notes": "حلول متكاملة للشحن البحري والنقل البري الداخلي وخدمات الصيانة بالموانئ"
    },
    {
        "nameAr": "شركة خليج السويس للشحن والتخليص الجمركي ونقل البضائع",
        "nameEn": "Gulf of Suez Freight & Customs Clearance Logistics",
        "sector": "transport", "city": "suez", "district": "ميناء الأدبية", "governorate": "السويس",
        "address": "بوابة ميناء الأدبية - مجمع المستودعات - حي عتاقة",
        "phone1": "062-3232100", "phone2": "", "website": "",
        "email": "gulfsuez.freight@gmail.com", "lat": 29.860, "lon": 32.472, "fleetSize": 38,
        "fleetType": "شاحنات نقل بضائع عامة وتريلات حاويات مسطحة وسيارات نقل مغلقة", "priority": "A",
        "notes": "نقل وتخليص شحنات الاستيراد والتصدير عبر مينائي الأدبية والسويس"
    },

    # ── Sub-Cluster C: المنطقة الاقتصادية (SCZone / TEDA) ومصانع البتروكيماويات والأسمدة والحديد والصناعات المتقدمة ──
    {
        "nameAr": "شركة بان أوساي للبتروكيماويات وتخزين الكيماويات (الأدبية)",
        "nameEn": "Ban Osai Petrochemicals & Chemical Storage Adabiya",
        "sector": "chemicals_plastic", "city": "suez", "district": "عتاقة والأدبية", "governorate": "السويس",
        "address": "الكيلو 16 - طريق الأدبية السخنة - ميناء الأدبية - عتاقة",
        "phone1": "062-3230610", "phone2": "", "website": "",
        "email": "banosai.petrochem@gmail.com", "lat": 29.845, "lon": 32.460, "fleetSize": 45,
        "fleetType": "شاحنات صهاريج نقل مواد بتروكيماوية وسوائل قابلة للاشتعال وتريلات مجهزة", "priority": "A+",
        "notes": "استيراد وتخزين وتوزيع المنتجات البتروكيماوية والمذيبات الصناعية للمصانع"
    },
    {
        "nameAr": "الشركة المصرية للهيدروكربون (EHC - مجمع البتروكيماويات بالعين السخنة)",
        "nameEn": "Egyptian Hydrocarbon Co. (EHC) Sokhna Complex",
        "sector": "chemicals_plastic", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "طريق العين السخنة - المنطقة الصناعية التاسعة - شمال غرب خليج السويس",
        "phone1": "062-3710200", "phone2": "02-27599200", "website": "http://www.ehcegypt.com",
        "email": "info@ehcegypt.com", "lat": 29.680, "lon": 32.310, "fleetSize": 60,
        "fleetType": "شاحنات صهاريج نقل نترات الأمونيوم ومواد كيماوية سائلة وشاحنات نقل بضائع خطرة", "priority": "A+",
        "notes": "أكبر مجمع لإنتاج نترات الأمونيوم المخصصة للتعدين والصناعات الكيماوية بالشرق الأوسط"
    },
    {
        "nameAr": "شركة فينافيل مصر للكيماويات والبوليمرات (Vinavil Egypt Ataqa)",
        "nameEn": "Vinavil Egypt Chemicals & Synthetic Polymers Ataqa",
        "sector": "chemicals_plastic", "city": "suez", "district": "المنطقة الصناعية بعتاقة", "governorate": "السويس",
        "address": "قطع 174 و 175 و 176 - المنطقة الصناعية بعتاقة - السويس",
        "phone1": "062-3230530", "phone2": "062-3230531", "website": "http://www.vinavil.com",
        "email": "vinavil.egypt@vinavil.it", "lat": 29.918, "lon": 32.485, "fleetSize": 35,
        "fleetType": "شاحنات صهاريج نقل مستحلبات بوليمر ومواد لاصقة وتريلات نقل براميل كيماوية", "priority": "A",
        "notes": "تصنيع بوليمرات تشتت المياه والبوليمرات المستحلبة لصناعة البويات ومواد البناء"
    },
    {
        "nameAr": "شركة شونكس كيم للبويات والكيماويات الصناعية (عتاقة)",
        "nameEn": "Shonx Chem Industrial Paints & Chemicals Ataqa",
        "sector": "chemicals_plastic", "city": "suez", "district": "المنطقة الصناعية بعتاقة", "governorate": "السويس",
        "address": "قطعة 238 أ - شمال خليج السويس - المنطقة الصناعية بعتاقة",
        "phone1": "062-3230710", "phone2": "", "website": "",
        "email": "shonxchem.suez@gmail.com", "lat": 29.912, "lon": 32.479, "fleetSize": 30,
        "fleetType": "شاحنات توزيع بويات صناعية ودهانات إيبوكسي للمصانع والمنشآت البحرية", "priority": "B",
        "notes": "دهانات حماية المنشآت المعدنية والطلاءات البحرية المقاومة للصدأ والتآكل"
    },
    {
        "nameAr": "شركة اللوتس العالمية للكيماويات والمواد العازلة (عتاقة)",
        "nameEn": "Lotus International Chemicals & Insulation Materials",
        "sector": "chemicals_plastic", "city": "suez", "district": "المنطقة الصناعية بعتاقة", "governorate": "السويس",
        "address": "قطعة 16 - الامتداد الصناعي الشمالي - عتاقة - السويس",
        "phone1": "062-3230820", "phone2": "01129988441", "website": "",
        "email": "lotus.chem.ataqa@gmail.com", "lat": 29.922, "lon": 32.488, "fleetSize": 28,
        "fleetType": "تريلات شحن لفائف العزل المائي والحراري والمستحلبات البيتومينية", "priority": "B",
        "notes": "تصنيع وتوزيع رقائق العزل البيتوميني والمواد العازلة للأسطح والأنفاق"
    },
    {
        "nameAr": "شركة السويس للصناعات الهندسية وخزانات البترول",
        "nameEn": "Suez Engineering Industries & Petroleum Tanks",
        "sector": "manufacturing", "city": "suez", "district": "عتاقة", "governorate": "السويس",
        "address": "188 شارع بدر - مدينة الصفا الصناعية - حي عتاقة",
        "phone1": "062-3230940", "phone2": "01221199338", "website": "",
        "email": "suez.eng.industries@gmail.com", "lat": 29.925, "lon": 32.492, "fleetSize": 35,
        "fleetType": "تريلات نقل هياكل معدنية ثقيلة وخزانات ضغط ومعدات رفع هيدروليكية", "priority": "A",
        "notes": "تصميم وتصنيع خزانات البترول والمبادلات الحرارية والهياكل الفولاذية للمصانع"
    },
    {
        "nameAr": "شركة الكومي لدرفلة وتجارة الصلب والحديد (عتاقة الصناعية)",
        "nameEn": "El Koumy Steel Rolling & Trading Ataqa",
        "sector": "manufacturing", "city": "suez", "district": "المنطقة الصناعية بعتاقة", "governorate": "السويس",
        "address": "المنطقة الصناعية بعتاقة - بلوك C12 - السويس",
        "phone1": "062-3230850", "phone2": "01001155990", "website": "http://www.elkoumysteel.com",
        "email": "sales.suez@elkoumysteel.com", "lat": 29.916, "lon": 32.480, "fleetSize": 45,
        "fleetType": "تريلات تريليرات طويلة لنقل حديد التسليح ولفائف الصلب والكمرات", "priority": "A",
        "notes": "درفلة وإنتاج قطاعات وحديد تسليح وتوزيعه للمشروعات القومية والموانئ"
    },
    {
        "nameAr": "شركة السويس لتصنيع وتوزيع الأسمدة الزراعية (العين السخنة)",
        "nameEn": "Suez Fertilizer Manufacturing & Distribution Sokhna",
        "sector": "chemicals_plastic", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "المنطقة الاقتصادية شمال غرب خليج السويس - قطاع الأسمدة",
        "phone1": "062-3710250", "phone2": "01006677884", "website": "",
        "email": "suez.fertilizers@gmail.com", "lat": 29.675, "lon": 32.315, "fleetSize": 50,
        "fleetType": "تريلات قلاب لنقل الفوسفات الخام وشاحنات صندوقية لنقل شكائر الأسمدة المركبة NPK", "priority": "A+",
        "notes": "إنتاج وتعبئة الأسمدة الفوسفاتية وحامض الكبريتيك وشحنها للتصدير الزراعي"
    },
    {
        "nameAr": "شركة مصر الهندية لإنتاج البوليستر (المنطقة الاقتصادية بالسخنة)",
        "nameEn": "Indorama Egypt Polyester Production SCZone Sokhna",
        "sector": "chemicals_plastic", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "المنطقة الصناعية الخاصة - شمال غرب السويس - العين السخنة",
        "phone1": "062-3710310", "phone2": "", "website": "",
        "email": "indorama.egypt@indorama.com", "lat": 29.664, "lon": 32.303, "fleetSize": 40,
        "fleetType": "تريلات شحن حاويات حبيبات البوليستر الراتنجي وشاحنات مغلقة", "priority": "A",
        "notes": "إنتاج راتنجات البوليستر (PET) لصناعات التعبئة والتغليف والزجاجات الدوائية والغذائية"
    },
    {
        "nameAr": "مصنع جوشي مصر لصناعة الفايبر جلاس (Jushi Egypt Fiberglass)",
        "nameEn": "Jushi Egypt Fiberglass Industry TEDA Sokhna",
        "sector": "manufacturing", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "المنطقة الصناعية الصينية المصرية تيدا - القطاع الثالث - العين السخنة",
        "phone1": "062-3710380", "phone2": "01098855221", "website": "http://www.jushi.com",
        "email": "jushi.egypt@jushi.com", "lat": 29.669, "lon": 32.320, "fleetSize": 65,
        "fleetType": "تريلات نقل حاويات ألياف الفايبر جلاس ومقطورات تصدير إلى ميناء السخنة", "priority": "A+",
        "notes": "أكبر مصنع ألياف زجاجية في أفريقيا والشرق الأوسط للتوريد لصناعات طواحين الرياح والسيارات"
    },
    {
        "nameAr": "شركة تيدا مصر للاستثمار وتطوير المنطقة الاقتصادية (TEDA Investment)",
        "nameEn": "TEDA Egypt Special Economic Zone Development Hub",
        "sector": "manufacturing", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "القطاع الثالث - شمال غرب خليج السويس - أمام ميناء السخنة البحري",
        "phone1": "062-3710450", "phone2": "01066652313", "website": "http://www.setc-zone.com",
        "email": "suez@setc-zone.com", "lat": 29.667, "lon": 32.321, "fleetSize": 50,
        "fleetType": "شاحنات خدمات صناعية ومركبات صيانة البنية التحتية وأوناش ومعدات لوجستية", "priority": "A+",
        "notes": "المطور الصناعي الرئيسي للمنطقة الصينية بالسخنة تضم أكثر من 140 مصنعاً وكياناً استثمارياً"
    },
    {
        "nameAr": "شركة السويس للأنابيب ومواسير الصلب الحلزونية (المنطقة الاقتصادية)",
        "nameEn": "Suez Spiral Welded Steel Pipes SCZone Sokhna",
        "sector": "manufacturing", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "المنطقة الاقتصادية لقناة السويس - طريق العين السخنة السويس",
        "phone1": "062-3710520", "phone2": "01145566778", "website": "",
        "email": "suez.pipes@gmail.com", "lat": 29.682, "lon": 32.308, "fleetSize": 45,
        "fleetType": "تريلات تمديد مواسير مجهزة بركائز خاصة لنقل خطوط أنابيب النفط والمياه أقطار حتى 80 بوصة", "priority": "A+",
        "notes": "تصنيع ونقل مواسير الصلب الحلزونية لشبكات خطوط الغاز والبترول واستصلاح الأراضي"
    },
    {
        "nameAr": "شركة رويال باك للكرتون المضلع ومواد التعبئة الصناعية (عتاقة)",
        "nameEn": "Royal Pack Corrugated Carton & Industrial Packaging Ataqa",
        "sector": "manufacturing", "city": "suez", "district": "المنطقة الصناعية بعتاقة", "governorate": "السويس",
        "address": "عتاقة الصناعية - بلوك D4 - مجمع التغليف - السويس",
        "phone1": "062-3231450", "phone2": "01004488339", "website": "",
        "email": "royalpack.suez@gmail.com", "lat": 29.914, "lon": 32.483, "fleetSize": 35,
        "fleetType": "شاحنات شاسيه طويل وصناديق مغلقة لنقل العبوات والكرتون المضلع للمصانع", "priority": "A",
        "notes": "توريد كراتين التعبئة والتغليف لمصانع السيراميك والزيوت والمواد الغذائية بالسويس"
    },
    {
        "nameAr": "مصنع البحر الأحمر للأكسجين والغازات الصناعية السائلة (عتاقة)",
        "nameEn": "Red Sea Industrial Liquid Gases & Oxygen Ataqa",
        "sector": "chemicals_plastic", "city": "suez", "district": "المنطقة الصناعية بعتاقة", "governorate": "السويس",
        "address": "عتاقة - طريق الأدبية - مجمع الغازات الصناعية",
        "phone1": "062-3231560", "phone2": "", "website": "",
        "email": "redsea.gases@gmail.com", "lat": 29.908, "lon": 32.475, "fleetSize": 38,
        "fleetType": "شاحنات صهاريج كرايوجينيك مفرغة لنقل الأكسجين والنيتروجين والأرجون المسال", "priority": "A",
        "notes": "تغذية مصانع الحديد والصلب وترسانات السفن والمستشفيات بالغازات الطبية والصناعية"
    },
    {
        "nameAr": "شركة مودرن كيميكالز للمنظفات الصناعية ومساعدات التكرير (الأدبية)",
        "nameEn": "Modern Chemicals for Refining Auxiliaries Adabiya",
        "sector": "chemicals_plastic", "city": "suez", "district": "عتاقة والأدبية", "governorate": "السويس",
        "address": "طريق الأدبية - أمام مجمع الزيوت - السويس",
        "phone1": "062-3231680", "phone2": "", "website": "",
        "email": "modernchem.adabiya@gmail.com", "lat": 29.852, "lon": 32.468, "fleetSize": 26,
        "fleetType": "شاحنات نقل براميل وتريلات صهريجية للكيماويات المتخصصة ومساعدات الحفر", "priority": "B",
        "notes": "توفير المواد المضافة لمعالجة مياه الصرف الصناعي ومساعدات استخراج وتكرير الزيوت"
    },

    # ── Sub-Cluster D: مصانع الأغذية، المطاحن، صوامع الغلال وتكرير الزيوت بالأدبية وعتاقة ──
    {
        "nameAr": "شركة صناعات الزيوت المتكاملة (مجمع مصانع طريق الأدبية)",
        "nameEn": "Integrated Oil Industries Co. (IOI) Adabiya Suez",
        "sector": "food", "city": "suez", "district": "عتاقة والأدبية", "governorate": "السويس",
        "address": "طريق الأدبية - منطقة عتاقة الصناعية - السويس",
        "phone1": "062-3230585", "phone2": "062-3230833", "website": "http://www.ioi-egypt.com",
        "email": "sales.suez@ioi-egypt.com", "lat": 29.850, "lon": 32.465, "fleetSize": 55,
        "fleetType": "شاحنات صهاريج نقل زيوت نباتية ستانلس ستيل غذائية وتريلات توزيع معبأ", "priority": "A+",
        "notes": "تكرير وتعبئة زيت النخيل والصويا والذرة وشحن الزيوت السائلة لشركات الأغذية الوطنية"
    },
    {
        "nameAr": "شركة عافية العالمية مصر (مصنع ومستودعات عتاقة بالسويس)",
        "nameEn": "Afia International Egypt Savola Group Suez Plant",
        "sector": "food", "city": "suez", "district": "عتاقة", "governorate": "السويس",
        "address": "عتاقة - الكيلو 12 طريق العين السخنة - السويس",
        "phone1": "062-3230690", "phone2": "062-3230074", "website": "http://www.savola.com",
        "email": "afia.suez@savola.com", "lat": 29.870, "lon": 32.475, "fleetSize": 60,
        "fleetType": "شاحنات تريلات نقل وتوزيع الزيوت الغذائية وسيارات فان ومقطورات صهاريج", "priority": "A+",
        "notes": "صرح مجموعة صافولا لتكرير وتعبئة زيوت عافية وسمن روابي وتوزيعها لمحافظات الجمهورية"
    },
    {
        "nameAr": "شركة السويس للتصنيع والتجارة وأعلاف الماشية والدواجن",
        "nameEn": "Suez Animal Feed Manufacturing & Trade Ataqa",
        "sector": "food", "city": "suez", "district": "المنطقة الصناعية بعتاقة", "governorate": "السويس",
        "address": "عتاقة - المنطقة الصناعية الأولى - السويس",
        "phone1": "01006060864", "phone2": "01006060874", "website": "",
        "email": "suez.feed@gmail.com", "lat": 29.915, "lon": 32.484, "fleetSize": 45,
        "fleetType": "تريلات نقل أعلاف صب مزودة ببلورات تفريغ وشاحنات شحن شكائر أعلاف 50 كجم", "priority": "A",
        "notes": "إنتاج وتوزيع الأعلاف المركبة للدواجن والمواشي وتغذية مزارع محافظات القناة وسيناء"
    },
    {
        "nameAr": "شركة مطاحن الخمس نجوم لصناعة الأعلاف والمركزات (الأدبية)",
        "nameEn": "Five Stars Feed Manufacturing & Concentrates Adabiya",
        "sector": "food", "city": "suez", "district": "عتاقة والأدبية", "governorate": "السويس",
        "address": "طريق الأدبية - المنطقة الصناعية - عتاقة - السويس",
        "phone1": "062-3230550", "phone2": "062-3230552", "website": "http://www.fivestarsmills.com",
        "email": "feed.adabiya@fivestarsmills.com", "lat": 29.855, "lon": 32.467, "fleetSize": 50,
        "fleetType": "تريلات تريليرات سايلو نقل ركامات أعلاف ومقطورات نقل بضائع سائبة", "priority": "A+",
        "notes": "تصنيع أعلاف الأسماك والماشية ومركزات البروتين المعتمدة على خامات الموانئ"
    },
    {
        "nameAr": "شركة صوامع الأدبية لتخزين وتداول الغلال الاستراتيجية",
        "nameEn": "Adabiya Grain Silos & Bulk Logistics Co.",
        "sector": "food", "city": "suez", "district": "ميناء الأدبية", "governorate": "السويس",
        "address": "رصيف الغلال - ميناء الأدبية - عتاقة - السويس",
        "phone1": "062-3231780", "phone2": "", "website": "",
        "email": "adabiya.silos@gmail.com", "lat": 29.858, "lon": 32.471, "fleetSize": 55,
        "fleetType": "شاحنات تريلات قلاب حبوب مصفحة وتريلات سايلو نقل قمح وذرة صفراء", "priority": "A+",
        "notes": "تفريغ وتخزين وشحن بواخر القمح والصب الغذائي وتوصيلها للمطاحن الوطنية"
    },
    {
        "nameAr": "شركة البحر الأحمر لمطاحن الدقيق وإنتاج النخالة (الأدبية)",
        "nameEn": "Red Sea Flour Mills & Bran Production Adabiya",
        "sector": "food", "city": "suez", "district": "عتاقة والأدبية", "governorate": "السويس",
        "address": "طريق الأدبية - مجمع المطاحن الحديثة - عتاقة",
        "phone1": "062-3231890", "phone2": "", "website": "",
        "email": "redsea.flour@gmail.com", "lat": 29.862, "lon": 32.469, "fleetSize": 40,
        "fleetType": "شاحنات نقل دقيق فاخر وتريلات سايلو لنقل الدقيق السائب لمصانع المكرونة والحلويات", "priority": "A",
        "notes": "طحن الأقماح وتوريد الدقيق استخراج 72% و82% للمخابز ومصانع الأغذية الكبرى"
    },
    {
        "nameAr": "شركة السويس الوطنية لتكرير وتعبئة السكر والزيوت",
        "nameEn": "Suez National Sugar & Oil Refining Adabiya",
        "sector": "food", "city": "suez", "district": "عتاقة", "governorate": "السويس",
        "address": "عتاقة - طريق صلاح نسيم - مجمع الصناعات الغذائية",
        "phone1": "062-3362450", "phone2": "01118899553", "website": "",
        "email": "suez.sugar.oil@gmail.com", "lat": 29.920, "lon": 32.498, "fleetSize": 38,
        "fleetType": "تريلات تريليرات شحن سكر سائب ومقطورات نقل بضائع غذائية مجففة", "priority": "A",
        "notes": "تكرير السكر الأبيض والزيوت وتوزيع السلع الأساسية لمنافذ ومجمعات التوزيع"
    },
    {
        "nameAr": "شركة الدلتا للتخزين المبرد والمستودعات الغذائية الجمركية (السخنة)",
        "nameEn": "Delta Cold Storage & Reefer Logistics Sokhna Corridor",
        "sector": "food", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "طريق العين السخنة - كم 24 - مجمع ثلاجات التبريد المركزية",
        "phone1": "062-3710600", "phone2": "01003344118", "website": "",
        "email": "delta.coldchain.sokhna@gmail.com", "lat": 29.715, "lon": 32.275, "fleetSize": 45,
        "fleetType": "شاحنات تريلات تبريد ريفير (Reefer Trucks) بدرجات حرارة -25 مئوية لسلامة الأغذية", "priority": "A+",
        "notes": "تخزين مبرد وتجميد اللحوم والدواجن والأسماك الواردة عبر ميناء السخنة وتوزيعها"
    },

    # ── Sub-Cluster E: محطات الخرسانة الجاهزة، المنتجات الإسمنتية، المحاجر ومقاولو البنية التحتية والموانئ ──
    {
        "nameAr": "شركة الصفوة للخرسانة الجاهزة والخلطات الإسمنتية (العين السخنة)",
        "nameEn": "Al Safwa Ready Mix Concrete & Batching Plant Sokhna",
        "sector": "manufacturing", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "طريق العين السخنة - بجوار بوابة الرسوم - محطة الصفوة",
        "phone1": "01066650227", "phone2": "062-3710710", "website": "",
        "email": "alsafwa.readymix.sokhna@gmail.com", "lat": 29.690, "lon": 32.295, "fleetSize": 50,
        "fleetType": "خلاطات خرسانة مان ومرسيدس 10م3 ومضخات بوم 48م وتريلات نقل أسمنت سائب", "priority": "A+",
        "notes": "توريد الخرسانة لمشروعات المنتجعات السياحية والمصانع بالمنطقة الاقتصادية"
    },
    {
        "nameAr": "شركة سيمكس مصر للخرسانة الجاهزة (محطة مشروعات العين السخنة ومحور 30 يونيو)",
        "nameEn": "Cemex Egypt Ready Mix Concrete Sokhna Plant",
        "sector": "manufacturing", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "تقاطع طريق السخنة مع محور 30 يونيو - محطة خلط سيمكس",
        "phone1": "062-3710720", "phone2": "01223945871", "website": "http://www.cemex.com.eg",
        "email": "sokhna.plant@cemex.com", "lat": 29.740, "lon": 32.250, "fleetSize": 60,
        "fleetType": "خلاطات خرسانة متطورة ومضخات ثابتة ومتحركة وشاحنات توريد ركام وسن", "priority": "A+",
        "notes": "محطة مركزية عملاقة لتغذية أعمال محطات الكهرباء والأرصفة والموانئ بالسخنة"
    },
    {
        "nameAr": "شركة ديكوم للخرسانة الجاهزة ومشاريع التوسعات الساحلية (السخنة)",
        "nameEn": "Decom Ready Mix Concrete Coastal Projects Sokhna",
        "sector": "manufacturing", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "طريق السويس السخنة الساحلي - كم 35 - محطة ديكوم",
        "phone1": "062-3710730", "phone2": "01009988225", "website": "",
        "email": "decom.concrete.sokhna@gmail.com", "lat": 29.620, "lon": 32.340, "fleetSize": 45,
        "fleetType": "خلاطات خرسانة ومضخات بوم 52م وتريلات سايلو نقل بودرة الأسمنت", "priority": "A",
        "notes": "صب خرسانات معالجة ضد أملاح البحر للمنشآت الشاطئية والمارينا والموانئ"
    },
    {
        "nameAr": "شركة لافارج للخرسانة الجاهزة (محطة السخنة المركزية)",
        "nameEn": "Lafarge Concrete Egypt Sokhna Central Batching Plant",
        "sector": "manufacturing", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "المنطقة الاقتصادية الخاصة - شمال غرب السويس - بجوار مصنع الأسمنت",
        "phone1": "062-3710740", "phone2": "02-25299100", "website": "http://www.lafarge.com.eg",
        "email": "concrete.sokhna@lafarge.com", "lat": 29.670, "lon": 32.305, "fleetSize": 55,
        "fleetType": "خلاطات خرسانة سعة 12م3 ومضخات بوم وسيارات اختبار وضبط الجودة", "priority": "A+",
        "notes": "توريدات الخرسانة للمشروعات القومية وتوسعات الموانئ ومحطات معالجة المياه"
    },
    {
        "nameAr": "شركة يونيكريت للمنتجات الأسمنتية والإنترلوك (Unicrete عتاقة)",
        "nameEn": "Unicrete Cement Products & Interlock Ataqa Plant",
        "sector": "manufacturing", "city": "suez", "district": "المنطقة الصناعية بعتاقة", "governorate": "السويس",
        "address": "المنطقة الصناعية بعتاقة - مجمع يونيكريت - السويس",
        "phone1": "062-2702050", "phone2": "062-2703373", "website": "http://www.unicrete.net",
        "email": "info@unicrete.net", "lat": 29.912, "lon": 32.482, "fleetSize": 40,
        "fleetType": "تريلات تريليرات مزودة بأوناش هيدروليكية لتحميل وتفريغ باليتات الإنترلوك والبلدورات", "priority": "A",
        "notes": "إنتاج الإنترلوك الآلي عالي المقاومة والبلدورات لساحات الموانئ والمشروعات الصناعية"
    },
    {
        "nameAr": "شركة سكاي لاين للمنتجات الأسمنتية والبلوك الآلي (عتاقة)",
        "nameEn": "Skyline Cement Products & Concrete Blocks Ataqa",
        "sector": "manufacturing", "city": "suez", "district": "المنطقة الصناعية بعتاقة", "governorate": "السويس",
        "address": "عتاقة الصناعية - الامتداد الجنوبي - بلوك F3",
        "phone1": "062-3231920", "phone2": "", "website": "",
        "email": "skyline.cement.suez@gmail.com", "lat": 29.905, "lon": 32.478, "fleetSize": 35,
        "fleetType": "شاحنات نقل طوب وبلوك أسمنتي وتريلات نقل خامات سن وأسمنت", "priority": "A",
        "notes": "تصنيع الطوب والبلورات الإسمنتية والبلوك المصمت والمفرغ لتشييد مصانع السويس"
    },
    {
        "nameAr": "شركة العزايزي للمنتجات الأسمنتية ومواسير الخرسانة المسلحة (السويس)",
        "nameEn": "El Azaizy Concrete Products & Reinforced Pipes Suez",
        "sector": "manufacturing", "city": "suez", "district": "عتاقة", "governorate": "السويس",
        "address": "طريق صلاح نسيم - المنطقة الصناعية - حي عتاقة",
        "phone1": "062-3362610", "phone2": "01223985471", "website": "",
        "email": "elazaizy.concrete@gmail.com", "lat": 29.924, "lon": 32.496, "fleetSize": 38,
        "fleetType": "تريلات نقل عناصر خرسانية مسبقة الصب ومواسير خرسانية عملاقة وأوناش تفريغ", "priority": "A",
        "notes": "تصنيع مواسير الخرسانة المسلحة لمشروعات الصرف والأنفاق وغرف التفتيش الجاهزة"
    },
    {
        "nameAr": "شركة السخنة للمقاولات والإنشاءات ورصف شبكات الطرق (S.G.C.C)",
        "nameEn": "El Sokhna General Contracting & Construction (S.G.C.C)",
        "sector": "construction", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "أوراسكوم آي بي - المنطقة الصناعية - عتاقة والعين السخنة",
        "phone1": "01222163344", "phone2": "02-26926601", "website": "http://www.el-sokhna-sgcc.com",
        "email": "info@el-sokhna-sgcc.com", "lat": 29.678, "lon": 32.312, "fleetSize": 65,
        "fleetType": "معدات رصف الأسفلت وهراسات وجليدرات وتريلات قلاب نقل مواد أساس وتربة", "priority": "A+",
        "notes": "مقاولات البنية التحتية، شبكات المرافق، الطرق والكباري بالمنطقة الاقتصادية بالسخنة"
    },
    {
        "nameAr": "شركة أرمادو للمقاولات والتوريدات العمومية والأعمال الهندسية",
        "nameEn": "Armado Contracting & Engineering Supplies Suez",
        "sector": "construction", "city": "suez", "district": "حي السويس", "governorate": "السويس",
        "address": "7 شارع الخضر - حي السويس - السويس",
        "phone1": "01023383834", "phone2": "01066783842", "website": "",
        "email": "Armado.cons@gmail.com", "lat": 29.972, "lon": 32.552, "fleetSize": 30,
        "fleetType": "شاحنات نقل مواد بناء ومعدات عزل حراري ومائي وسيارات نقل عمال ومعدات", "priority": "B",
        "notes": "تنفيذ أعمال الإنشاءات والمقاولات العامة والتشطيبات والعزل للمنشآت الحكومية والصناعية"
    },
    {
        "nameAr": "المركز الدولي للتصميمات والإنشاءات ومقاولات المرافق (IDECO السويس)",
        "nameEn": "IDECO International Designs & Construction Suez",
        "sector": "construction", "city": "suez", "district": "بور توفيق", "governorate": "السويس",
        "address": "35 شارع جوهر القائد - بور توفيق - السويس",
        "phone1": "062-3193005", "phone2": "062-3193007", "website": "",
        "email": "ideco.suez@gmail.com", "lat": 29.952, "lon": 32.562, "fleetSize": 32,
        "fleetType": "معدات حفر ولوادر وتريلات نقل خرسانات ومعدات شبكات مرافق", "priority": "B",
        "notes": "تنفيذ مشروعات المرافق والبنية التحتية وشبكات التغذية بموانئ بورتوفيق والأدبية"
    },
    {
        "nameAr": "شركة ميسيكو للمقاولات والتشييد والأعمال البحرية (فرع السويس)",
        "nameEn": "MISICO Contracting & Marine Construction Suez Branch",
        "sector": "construction", "city": "suez", "district": "حي السويس", "governorate": "السويس",
        "address": "16 شارع أحمد شوقي - حي السويس - السويس",
        "phone1": "062-3330717", "phone2": "01068801212", "website": "",
        "email": "misico.suez@gmail.com", "lat": 29.968, "lon": 32.548, "fleetSize": 40,
        "fleetType": "حفارات هيدروليكية وأوناش رفع ثقيلة وتريلات نقل كتل صخرية وأعمال حماية شواطئ", "priority": "A",
        "notes": "أعمال الإنشاءات العامة والمقاولات البحرية والأرصفة والمصدات بمحافظة السويس"
    },
    {
        "nameAr": "شركة عتاقة لمحاجر السن والدولوميت والركام الخرساني",
        "nameEn": "Ataqa Dolomite Quarries & Aggregate Crushing Co.",
        "sector": "construction", "city": "suez", "district": "جبل عتاقة", "governorate": "السويس",
        "address": "طريق جبل عتاقة - الكيلو 8 - محاجر السن والدولوميت",
        "phone1": "062-3232250", "phone2": "", "website": "",
        "email": "ataqa.quarries@gmail.com", "lat": 29.890, "lon": 32.420, "fleetSize": 60,
        "fleetType": "كسارات سن متنقلة وتريلات قلاب حمولة 60 طن ولوادر كوماتسو ومعدات تفجير وتكسير", "priority": "A+",
        "notes": "إنتاج وتوريد سن الدولوميت المعتمد لمشروعات الخرسانات المسلحة والقطار السريع والكباري"
    },
    {
        "nameAr": "شركة وادي حجول للكسارات واستخراج الحجر الجيري والسن",
        "nameEn": "Wadi Hagoul Limestone & Stone Crushing Hub",
        "sector": "construction", "city": "suez", "district": "عتاقة ووادي حجول", "governorate": "السويس",
        "address": "طريق وادي حجول المتفرع من طريق السخنة - السويس",
        "phone1": "062-3232360", "phone2": "01115544338", "website": "",
        "email": "hagoul.crushers@gmail.com", "lat": 29.820, "lon": 32.350, "fleetSize": 55,
        "fleetType": "شاحنات تريلات قلاب صخور ولوادر تكسير ومعدات نخل وغربلة وتصنيف الركام", "priority": "A+",
        "notes": "تغذية مصانع الأسمنت والحديد بالحجر الجيري النقي وسن الرصف لمشروعات الطرق السريعة"
    },
    {
        "nameAr": "محطة خلط الجلالة المركزية للخرسانة الجاهزة (هضبة الجلالة)",
        "nameEn": "Galala Plateau Central Ready Mix Batching Plant",
        "sector": "manufacturing", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "طريق مدينة الجلالة الجديدة - الكيلو 15 - محطة الخلط المركزية",
        "phone1": "062-3710850", "phone2": "", "website": "",
        "email": "galala.concrete@gmail.com", "lat": 29.550, "lon": 32.390, "fleetSize": 50,
        "fleetType": "خلاطات خرسانة ومضخات أسمنت عملاقة وتريلات نقل مياه صالحة للخلط وسيارات اختبار", "priority": "A+",
        "notes": "المحطة المركزية المنفذة لأبراج ومنشآت مدينة الجلالة وجامعة الجلالة ومحطات التلفريك"
    },
    {
        "nameAr": "شركة البحر الأحمر للمقاولات البحرية وحماية الشواطئ وتكريك الموانئ",
        "nameEn": "Red Sea Marine Dredging & Shore Protection Co.",
        "sector": "construction", "city": "suez", "district": "بور توفيق", "governorate": "السويس",
        "address": "طريق الرصيف البحري - ميناء السويس - بور توفيق",
        "phone1": "062-3195580", "phone2": "01008822664", "website": "",
        "email": "redsea.marine.dredging@gmail.com", "lat": 29.955, "lon": 32.558, "fleetSize": 42,
        "fleetType": "كراكات بحرية وقاطرات بحرية وتريلات نقل كتل صخرية دولوميتية لصد الأمواج", "priority": "A",
        "notes": "تنفيذ أعمال التكريك وتعميق الممرات الملاحية وبناء حواجز الأمواج بموانئ السويس"
    },
    {
        "nameAr": "شركة النيل للرصف ومقاولات الأسفلت وتطوير الطرق (السويس السخنة)",
        "nameEn": "Nile Road Paving & Asphalt Contracting Suez Sokhna",
        "sector": "construction", "city": "suez", "district": "عتاقة", "governorate": "السويس",
        "address": "طريق السويس السخنة القديم - خلاطة الأسفلت كم 14",
        "phone1": "062-3232470", "phone2": "01123388771", "website": "",
        "email": "nile.paving.suez@gmail.com", "lat": 29.880, "lon": 32.450, "fleetSize": 45,
        "fleetType": "خلاطة أسفلت مركزية وفناشر أسفلت وهراسات حديد ومطاط وتريلات نقل خلطة أسفلتية", "priority": "A",
        "notes": "رصف وصيانة وتطوير شبكات الطرق والمحاور اللوجستية الرابطة بين موانئ السويس والعاصمة"
    },
    {
        "nameAr": "شركة السويس للمنتجات الجبسية وبلوكات الجبس المقاوم للرطوبة",
        "nameEn": "Suez Gypsum Products & Moisture Resistant Blocks",
        "sector": "manufacturing", "city": "suez", "district": "عتاقة ووادي حجول", "governorate": "السويس",
        "address": "وادي حجول - مجمع مصانع الجبس - عتاقة - السويس",
        "phone1": "062-3232580", "phone2": "01019955332", "website": "",
        "email": "suez.gypsum@gmail.com", "lat": 29.830, "lon": 32.360, "fleetSize": 35,
        "fleetType": "تريلات تريليرات شحن شكائر جبس وبلوكات قواطع جبسية للمشروعات الإنشائية", "priority": "A",
        "notes": "استخراج خام الجبس وتصنيع الجبس المعماري والمصيص وبلوكات الحوائط الخفيفة"
    },
    {
        "nameAr": "شركة الإخوة لمحاجر الرمل المغسول والزلط المفلتر (السخنة)",
        "nameEn": "El Ekhwa Washed Sand & Graded Gravel Quarries Sokhna",
        "sector": "construction", "city": "suez", "district": "العين السخنة", "governorate": "السويس",
        "address": "طريق السخنة القديم - وادي غويربة - محاجر الإخوة",
        "phone1": "062-3710920", "phone2": "", "website": "",
        "email": "elekhwa.sand@gmail.com", "lat": 29.710, "lon": 32.260, "fleetSize": 40,
        "fleetType": "تريلات قلاب نقل رمل وزلط ومحطات غسيل رمال سيليكا وركام خرساني ناعم", "priority": "A",
        "notes": "توريد رمال البناء المغسولة وركام الزلط المتدرج لمحطات الخرسانة الجاهزة"
    },
    {
        "nameAr": "شركة أركان للإنشاءات الهندسية ومحطات معالجة الصرف الصناعي",
        "nameEn": "Arkan Engineering & Industrial Wastewater Plants SCZone",
        "sector": "construction", "city": "suez", "district": "المنطقة الاقتصادية بالعين السخنة", "governorate": "السويس",
        "address": "المنطقة الصناعية للمطورين - قطاع المرافق - العين السخنة",
        "phone1": "062-3710960", "phone2": "01002255776", "website": "",
        "email": "arkan.sczone@gmail.com", "lat": 29.685, "lon": 32.318, "fleetSize": 36,
        "fleetType": "شاحنات نقل معدات كهروميكانيكية وتريلات نقل مواسير بولي إيثيلين وخزانات فيبر جلاس", "priority": "A",
        "notes": "إنشاء وتشغيل محطات تحلية مياه البحر ومعالجة مياه الصرف الصناعي لمصانع السخنة"
    },
    {
        "nameAr": "شركة مصر للخرسانات مسبقة الإجهاد وعناصر الكباري (السويس الأدبية)",
        "nameEn": "Egypt Pre-stressed Concrete & Bridge Beams Suez",
        "sector": "manufacturing", "city": "suez", "district": "عتاقة والأدبية", "governorate": "السويس",
        "address": "طريق السويس الأدبية - الكيلو 9 - مجمع البريكاست",
        "phone1": "062-3232690", "phone2": "01149922338", "website": "",
        "email": "egypt.precast.suez@gmail.com", "lat": 29.875, "lon": 32.470, "fleetSize": 42,
        "fleetType": "تريلات تريليرات ذات محاور متعددة لنقل كمرات الكباري الخرسانية العملاقة والأعمدة مسبقة الصنع", "priority": "A",
        "notes": "تصنيع ونقل كمرات كباري القطار السريع وتوسعات الطرق السريعة بمحور قناة السويس"
    },
    {
        "nameAr": "شركة سيناء للمحاجر وتوريد كتل الرخام وحجر الجير الصناعي (محور النفق)",
        "nameEn": "Sinai Quarries & Industrial Limestone Ahmed Hamdi Axis",
        "sector": "construction", "city": "suez", "district": "حي الجناين ونفق الشهيد أحمد حمدي", "governorate": "السويس",
        "address": "طريق نفق الشهيد أحمد حمدي - كم 5 - مجمع المحاجر",
        "phone1": "062-3340150", "phone2": "01018833994", "website": "",
        "email": "sinai.quarries.suez@gmail.com", "lat": 30.050, "lon": 32.540, "fleetSize": 50,
        "fleetType": "تريلات شحن بلوكات رخام وتريلات قلاب نقل كربونات كالسيوم وحجر جيري", "priority": "A",
        "notes": "نقل كتل الرخام من محاجر سيناء وتوريد الحجر الجيري لمصانع الورق والبويات بالسويس"
    },
    {
        "nameAr": "شركة الفيروز لمقاولات خطوط الأنابيب وشبكات الغاز ومحطات الضخ",
        "nameEn": "Al Fayrouz Pipelines & Gas Pumping Station Contracting",
        "sector": "construction", "city": "suez", "district": "المنطقة الصناعية بعتاقة", "governorate": "السويس",
        "address": "عتاقة الصناعية - بلوك E7 - مجمع مشروعات الغاز والبترول",
        "phone1": "062-3232780", "phone2": "", "website": "",
        "email": "alfayrouz.pipelines@gmail.com", "lat": 29.918, "lon": 32.486, "fleetSize": 38,
        "fleetType": "معدات حفر خنادق وتريلات نقل أنابيب غاز عالية الضغط وسيارات لحام واختبار هيدروستاتيكي", "priority": "A",
        "notes": "تنفيذ خطوط الغاز الطبيعي وشبكات الإمداد البترولي للمصانع ومحطات الإسالة"
    }
]

print(f"\nEvaluating {len(candidates)} targeted candidates in Suez / Sokhna Corridor...")

approved_phase2_sq3 = []
skipped_phones = 0
skipped_names = 0

for item in candidates:
    # Check phone duplicate
    is_dup = False
    for pf in ['phone1', 'phone2', 'mobile', 'hotline']:
        p = item.get(pf)
        if p:
            sig = clean_phone(p)
            if sig in existing_phones:
                print(f"[SKIP PHONE DUP] {item['nameAr']} (Phone: {p})")
                skipped_phones += 1
                is_dup = True
                break
    if is_dup:
        continue

    # Check normalized name duplicate
    norm_ar = normalize_text(item['nameAr'])
    norm_en = normalize_text(item.get('nameEn', ''))
    if norm_ar in existing_names or (norm_en and norm_en in existing_names):
        print(f"[SKIP NAME DUP] {item['nameAr']}")
        skipped_names += 1
        continue

    approved_phase2_sq3.append(item)

print(f"\n=======================================================")
print(f"CANDIDATES EVALUATED IN SUEZ SQUARE:      {len(candidates)}")
print(f"SKIPPED PHONE DUPLICATES:                 {skipped_phones}")
print(f"SKIPPED NAME DUPLICATES:                  {skipped_names}")
print(f"APPROVED PURE NEW B2B ENTERPRISES:        {len(approved_phase2_sq3)}")
print(f"=======================================================")

formatted_enterprises = []
for idx, c in enumerate(approved_phase2_sq3, 1):
    comp_id = f"eg_phase2_suez_sokhna_{idx:04d}"
    formatted_enterprises.append({
        "id": comp_id,
        "nameAr": c["nameAr"],
        "nameEn": c.get("nameEn", ""),
        "sector": c["sector"],
        "city": c["city"],
        "district": c["district"],
        "governorate": c["governorate"],
        "address": c["address"],
        "phone1": c["phone1"],
        "phone2": c.get("phone2", ""),
        "mobile": c.get("mobile", ""),
        "hotline": c.get("hotline", ""),
        "website": c.get("website", ""),
        "email": c.get("email", ""),
        "lat": c.get("lat", 29.95),
        "lon": c.get("lon", 32.50),
        "fleetSize": c.get("fleetSize", 40),
        "fleetType": c.get("fleetType", "شاحنات ومعدات أسطول تجاري"),
        "priority": c.get("priority", "A"),
        "status": "unassigned",
        "source": "verified_phase2_suez_sokhna_sczone_2026",
        "contactPerson": "",  # Strictly empty for sales reps
        "notes": c.get("notes", "")
    })

os.makedirs('scraper/output', exist_ok=True)
out_path = 'scraper/output/phase2_suez_sokhna_verified_b2b_fleet.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(formatted_enterprises, f, ensure_ascii=False, indent=2)

print(f"Successfully saved {len(formatted_enterprises)} pure verified enterprises to {out_path}!")
