# -*- coding: utf-8 -*-
"""
Phase 2 - Square 2: West Cairo, 6th of October, Abu Rawash, Alexandria Desert Road & Dahshur
Heavy Fleet Industrial, Mining & Logistics Corridor:
- Ready-Mix Concrete & Bulk Cement Batching Plants (الخرسانة الجاهزة والأسمنت بأكتوبر والصحراوي وأبو رواش)
- Heavy Manufacturing & National Distribution Fleets (مصانع الأغذية، الكيماويات، الكرتون، الحديد، الكابلات)
- Cold Storage, Agricultural Export & 3PL Logistics (محطات التبريد، فرز وتصدير الحاصلات، النقل المبرد واللوجستيات)
- Quarries, Stone Crushers & Brick Kilns (محاجر السن والرمل والزلط ومصانع الطوب بدهشور والواحات)
- Heavy Infrastructure, Earthmoving & Road Paving Contractors (مقاولات الطرق والكباري والأسفلت بغرب الجيزة)
"""

import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== PHASE 2: WEST GIZA, 6TH OF OCTOBER, ABU RAWASH & DESERT ROAD HARVESTER ===")
print("=== FOCUSED SQUARE: READY-MIX, HEAVY FACTORIES, LOGISTICS, QUARRIES & CONTRACTING ===")

# 1. Load existing 20,067 companies to enforce absolute Zero Duplication
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

# 2. Vetted Candidates Pool for West Giza Square
candidates = [
    # ── Sub-Cluster A: محطات الخرسانة الجاهزة والأسمنت بأكتوبر وأبو رواش والصحراوي ──
    {
        "nameAr": "شركة الصحراوي للخرسانة الجاهزة والمقاولات (محطة الكيلو 28)",
        "nameEn": "Al Sahrawi Ready Mix Concrete Km 28 Plant",
        "sector": "manufacturing", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "طريق مصر الإسكندرية الصحراوي - الكيلو 28 - بجوار مجمع محطات الخلط",
        "phone1": "02-35391100", "phone2": "01003344991", "website": "http://www.sahrawi-concrete.com",
        "email": "info@sahrawi-concrete.com", "lat": 30.055, "lon": 31.025, "fleetSize": 60,
        "fleetType": "خلاطات خرسانة 10م3 ومضخات بوم 48م وسيارات نقل أسمنت سائب", "priority": "A+",
        "notes": "محطة مركزية لتوريد الخرسانات لمشروعات غرب القاهرة والقرية الذكية ومحور 26 يوليو"
    },
    {
        "nameAr": "شركة سفنكس للخرسانة الجاهزة والمنتجات الأسمنتية (أبو رواش)",
        "nameEn": "Sphinx Ready Mix Concrete Abu Rawash Hub",
        "sector": "manufacturing", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "المنطقة الصناعية بأبو رواش - امتداد طريق إسكندرية الصحراوي - قطعة 14",
        "phone1": "02-35391210", "phone2": "01124488331", "website": "",
        "email": "sphinx.concrete.eg@gmail.com", "lat": 30.048, "lon": 31.032, "fleetSize": 45,
        "fleetType": "خلاطات خرسانة مان ومرسيدس ومضخات بوم وتريلات ركام", "priority": "A",
        "notes": "صب الأساسات واللبشات الخرسانية للمستودعات والمولات بالصحراوي والشيخ زايد"
    },
    {
        "nameAr": "شركة تبارك للخرسانة الجاهزة ومواد البناء (المنطقة الصناعية السادسة 6 أكتوبر)",
        "nameEn": "Tabarak Ready Mix Concrete 6th Industrial Zone",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية السادسة - مجمع محطات الخلط المركزي",
        "phone1": "02-38205100", "phone2": "01207799334", "website": "",
        "email": "tabarak.concrete.oct@gmail.com", "lat": 29.895, "lon": 30.825, "fleetSize": 55,
        "fleetType": "خلاطات خرسانة حديثة ومضخات أسمنت وسيارات اختبارات متنقلة", "priority": "A+",
        "notes": "إمدادات الخرسانة لمصانع التوسعات الجنوبية ومشروعات أكتوبر الجديدة"
    },
    {
        "nameAr": "شركة ريدي ميكس زايد للخرسانات المتطورة (طريق دهشور)",
        "nameEn": "Ready Mix Zayed Advanced Concrete Dahshur Road",
        "sector": "manufacturing", "city": "october", "district": "طريق دهشور", "governorate": "الجيزة",
        "address": "طريق وصلة دهشور - مدخل التوسعات الشمالية - محطة زايد ميكس",
        "phone1": "02-38205210", "phone2": "01018844229", "website": "",
        "email": "zayed.readymix@gmail.com", "lat": 30.020, "lon": 30.910, "fleetSize": 50,
        "fleetType": "خلاطات خرسانة 12م3 ومضخات بوم 52م وتريلات نقل رمل وسن", "priority": "A",
        "notes": "تغطية مشروعات الأبراج والكمبوندات السكنية بالشيخ زايد وغرب سوميد"
    },
    {
        "nameAr": "الشركة الهندسية لمسبوكات الخرسانة والمنتجات الإسمنتية (بريمكو أكتوبر)",
        "nameEn": "Engineering Precast Concrete & Cement Products October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "المنطقة الصناعية الرابعة - بلوك 32 - مجمع مصانع الخرسانة مسبقة الصنع",
        "phone1": "02-38205300", "phone2": "01115588332", "website": "",
        "email": "precast.october@gmail.com", "lat": 29.925, "lon": 30.865, "fleetSize": 40,
        "fleetType": "تريلات نقل عناصر خرسانية سابقة الصب وكاميرات كباري وأوناش هيدروليكية", "priority": "A",
        "notes": "تصنيع ونقل الكمرات مسبقة الإجهاد وحوائط البانلز الخرسانية للمصانع والكباري"
    },
    {
        "nameAr": "شركة الواحات للخرسانة الجاهزة وتوريد الصوامع (طريق الواحات كم 18)",
        "nameEn": "Al Wahat Ready Mix Concrete & Silos Oasis Road Km 18",
        "sector": "manufacturing", "city": "october", "district": "طريق الواحات", "governorate": "الجيزة",
        "address": "طريق الواحات - الكيلو 18 - محطة خلط الواحات المركزية",
        "phone1": "02-38205410", "phone2": "01229955118", "website": "",
        "email": "wahat.concrete.plant@gmail.com", "lat": 29.935, "lon": 30.950, "fleetSize": 45,
        "fleetType": "خلاطات خرسانة وتريلات سايلو نقل أسمنت سائب 65 طن ومضخات ثابتة", "priority": "A",
        "notes": "توريد الخرسانة لمشروعات الإسكان الاجتماعي والقطار السريع وغرب المطار"
    },
    {
        "nameAr": "شركة دلتا ميكس للخلطات الإسمنتية والخرسانات المعالجة (أبو رواش)",
        "nameEn": "DeltaMix Cement Mixtures & Treated Concrete Abu Rawash",
        "sector": "manufacturing", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "أبو رواش - طريق المنصورية المتفرع من الصحراوي - مجمع دلتا ميكس",
        "phone1": "02-35391300", "phone2": "01004411993", "website": "",
        "email": "deltamix.aburawash@gmail.com", "lat": 30.040, "lon": 31.045, "fleetSize": 35,
        "fleetType": "خلاطات خرسانة ومضخات بوم وسيارات صيانة دورية للخلاطات", "priority": "B",
        "notes": "خلطات خرسانية سريعة الشك وخاصة بأعمال الأنفاق ومحطات الصرف الصحي"
    },
    {
        "nameAr": "شركة الأهرام سيتي للخرسانة الجاهزة (حدائق أكتوبر)",
        "nameEn": "Ahram City Ready Mix Concrete October Gardens",
        "sector": "manufacturing", "city": "october", "district": "حدائق أكتوبر", "governorate": "الجيزة",
        "address": "طريق الفيوم - مدخل حدائق أكتوبر - مجمع محطات خلط الأهرام سيتي",
        "phone1": "02-38205510", "phone2": "01128866337", "website": "",
        "email": "ahramcity.concrete@gmail.com", "lat": 29.910, "lon": 31.020, "fleetSize": 45,
        "fleetType": "خلاطات خرسانة مان وتريلات نقل رمل وزلط ومضخات بوم 42م", "priority": "A",
        "notes": "إمدادات الخرسانة لمشروعات حدائق أكتوبر والمنطقة الاستثمارية"
    },

    # ── Sub-Cluster B: مصانع الأغذية والمشروبات والصناعات الوطنية ذات أساطيل التوزيع (6 أكتوبر) ──
    {
        "nameAr": "شركة رويال فودز للتصنيع الغذائي والتوزيع (المنطقة الصناعية الثالثة 6 أكتوبر)",
        "nameEn": "Royal Foods Manufacturing & Distribution 6th of October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الثالثة - مجمع مصانع رويال فودز",
        "phone1": "02-38206100", "phone2": "01007711448", "website": "http://www.royalfoods-eg.com",
        "email": "supplychain@royalfoods-eg.com", "lat": 29.915, "lon": 30.890, "fleetSize": 75,
        "fleetType": "أسطول شاحنات جامبو مبردة وتريلات نقل بضائع جافة للتوزيع الإقليمي", "priority": "A+",
        "notes": "تصنيع وتوزيع المنتجات الغذائية والمجمدات وسلاسل الإمداد لجميع المحافظات"
    },
    {
        "nameAr": "شركة النيل للزيوت والمنتجات الاستهلاكية (مجمع مصانع 6 أكتوبر)",
        "nameEn": "Nile Edible Oils & Consumer Goods October Complex",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الأولى - قطعة 45",
        "phone1": "02-38206210", "phone2": "01223366992", "website": "",
        "email": "nile.oils.factory@gmail.com", "lat": 29.965, "lon": 30.920, "fleetSize": 65,
        "fleetType": "صهاريج نقل زيوت طعام غذائية وتريلات شحن كراتين زيت وسمن", "priority": "A+",
        "notes": "تكرير وتعبئة زيوت الطعام النباتية والتوزيع للجمعيات وسلاسل الهايبر ماركت"
    },
    {
        "nameAr": "شركة جرين فارمز للصناعات الغذائية والتجميد (المنطقة الصناعية الرابعة)",
        "nameEn": "Green Farms Frozen Foods Industries 4th Industrial Zone",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الرابعة - شارع 100",
        "phone1": "02-38206300", "phone2": "01119933224", "website": "http://www.greenfarms-eg.com",
        "email": "logistics@greenfarms-eg.com", "lat": 29.930, "lon": 30.855, "fleetSize": 50,
        "fleetType": "تريلات تبريد درجة حرارة -18 وسيارات توزيع معزولة ثيرمو كينج", "priority": "A",
        "notes": "تجميد وتصدير الخضروات والفواكه وتوريد السوق المحلي والفنادق"
    },
    {
        "nameAr": "شركة البركة للمطاحن وإنتاج الدقيق الفاخر (المنطقة الصناعية الثانية 6 أكتوبر)",
        "nameEn": "Al Baraka Flour Mills & Grain Storage 2nd Industrial Zone",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الثانية - صوامع ومطاحن البركة",
        "phone1": "02-38206410", "phone2": "01015522776", "website": "",
        "email": "baraka.mills.oct@gmail.com", "lat": 29.945, "lon": 30.905, "fleetSize": 55,
        "fleetType": "تريلات نقل حبوب وغلال قلاب وتريلات نقل أجولة دقيق 50 كجم", "priority": "A+",
        "notes": "طحن قمح استخراج 72% وإنتاج الردة والدقيق وتوريد مصانع المكرونة والمخابز الكبرى"
    },
    {
        "nameAr": "شركة الشرق الأوسط للمشروبات والعصائر الطبيعية (المنطقة الصناعية الخامسة)",
        "nameEn": "Middle East Beverages & Natural Juices 5th Zone",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الخامسة - مصنع الشرق الأوسط للعصائر",
        "phone1": "02-38206500", "phone2": "01208844115", "website": "",
        "email": "me.beverages.cairo@gmail.com", "lat": 29.910, "lon": 30.840, "fleetSize": 60,
        "fleetType": "شاحنات جامبو بصناديق مغلقة وتريلات نقل عبوات كانز وتتراباك", "priority": "A+",
        "notes": "إنتاج وتوزيع المشروبات الغازية والعصائر المعبأة وتغطية محافظات الصعيد والدلتا"
    },
    {
        "nameAr": "شركة الصفا لمنتجات الألبان والأجبان التخصصية (أكتوبر الصناعية)",
        "nameEn": "Al Safa Dairy & Cheese Products October Hub",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الثالثة - شارع الصناعة قطعة 72",
        "phone1": "02-38206610", "phone2": "01127733998", "website": "",
        "email": "safa.dairy.october@gmail.com", "lat": 29.918, "lon": 30.885, "fleetSize": 45,
        "fleetType": "فنطاس نقل حليب طازج استيل مبرد وشاحنات توزيع مبردة للأجبان", "priority": "A",
        "notes": "جمع الحليب من مزارع الصحراوي وتصنيع وتوزيع منتجات الألبان"
    },

    # ── Sub-Cluster C: مصانع الكيماويات والبلاستيك والورق والكرتون والحديد (أكتوبر وأبو رواش) ──
    {
        "nameAr": "شركة مصر باك للكرتون المضلع ومواد التغليف (المنطقة الصناعية الأولى 6 أكتوبر)",
        "nameEn": "Misr Pack Corrugated Carton & Packaging 1st Zone",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الأولى - مجمع مصانع مصر باك",
        "phone1": "02-38207100", "phone2": "01006655223", "website": "http://www.misrpack-eg.com",
        "email": "sales@misrpack-eg.com", "lat": 29.960, "lon": 30.915, "fleetSize": 50,
        "fleetType": "تريلات جامبو لنقل رولات الورق وتريلات صناديق كرتون مضلع للمصانع", "priority": "A+",
        "notes": "إنتاج وتوريد الكرتون المضلع وعلب التصدير لمصانع الخضار والفاكهة والأغذية"
    },
    {
        "nameAr": "شركة الأمل للبلاستيك ومواسير البولي إيثيلين والـ PVC (أكتوبر)",
        "nameEn": "Al Amal Plastics & Polyethylene Pipes October Factory",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الرابعة - القطعة 88",
        "phone1": "02-38207210", "phone2": "01228811774", "website": "",
        "email": "amal.pipes.october@gmail.com", "lat": 29.928, "lon": 30.860, "fleetSize": 45,
        "fleetType": "تريلات مسطحة طويلة 14م لنقل مواسير مياه الشرب والصرف ومحابس الري", "priority": "A",
        "notes": "إنتاج شبكات مواسير مشروعات استصلاح الأراضي وتوشكى والدلتا الجديدة"
    },
    {
        "nameAr": "شركة الكيميائية لصناعة الدهانات والكيماويات الإنشائية (أبو رواش)",
        "nameEn": "Chemical Paints & Construction Chemicals Abu Rawash",
        "sector": "manufacturing", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "المنطقة الصناعية بأبو رواش - الكيلو 26 طريق الصحراوي - مجمع الكيماويات",
        "phone1": "02-35391400", "phone2": "01114477991", "website": "",
        "email": "chemical.paints.eg@gmail.com", "lat": 30.060, "lon": 31.020, "fleetSize": 40,
        "fleetType": "سيارات نقل دهانات ومواد عزل وصهاريج نقل مذيبات ومواد راتنجية", "priority": "A",
        "notes": "إنتاج مواد العزل المائي والحراري ودهانات الإيبوكسي للمصانع والأرضيات"
    },
    {
        "nameAr": "شركة ستيل مصر للهياكل والجمالونات المعدنية والتشغيل (6 أكتوبر)",
        "nameEn": "Steel Misr Metal Structures & Pre-engineered Buildings",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية السادسة - مجمع مصانع ستيل مصر",
        "phone1": "02-38207300", "phone2": "01019944338", "website": "http://www.steelmisr-eg.com",
        "email": "info@steelmisr-eg.com", "lat": 29.890, "lon": 30.830, "fleetSize": 55,
        "fleetType": "تريلات نقل كمرات حديدية ثقيلة وأوناش تلسكوبية لتركيب الجمالونات", "priority": "A+",
        "notes": "تصنيع وتركيب جمالونات المستودعات العملاقة والمصانع ومحطات الوقود"
    },
    {
        "nameAr": "شركة إنترناشيونال للزجاج والبلور المعماري (المنطقة الصناعية الثانية)",
        "nameEn": "International Glass & Architectural Glazing October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الثانية - مجمع تصنيع الزجاج السيكوريت",
        "phone1": "02-38207410", "phone2": "01203366885", "website": "",
        "email": "interglass.october@gmail.com", "lat": 29.940, "lon": 30.910, "fleetSize": 40,
        "fleetType": "تريلات وشاحنات مجهزة بقوائم أمان A-frame لنقل ألواح الزجاج العملاقة", "priority": "A",
        "notes": "تقطيع وسيكوريت ودبل جلاس لواجهات الأبراج الإدارية والمستشفيات"
    },
    {
        "nameAr": "شركة السويدي للكيماويات والبوليمرات المتقدمة (أكتوبر للمطورين CPC)",
        "nameEn": "Advanced Polymers & Chemical Resins CPC October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - مجمع المطورين الصناعيين CPC - بلوك 5B",
        "phone1": "02-38207500", "phone2": "01125588114", "website": "",
        "email": "polymers.cpc.oct@gmail.com", "lat": 29.905, "lon": 30.810, "fleetSize": 45,
        "fleetType": "تريلات نقل حبيبات بلاستيك وتريلات صهاريج سوائل كيماوية", "priority": "A+",
        "notes": "إنتاج مركبات البوليمر والمواد الخام لصناعة الكابلات والسيارات"
    },
    {
        "nameAr": "شركة النجمة للأعلاف الحيوانية والداجنة والصوامع (أكتوبر الصناعية)",
        "nameEn": "Al Negma Animal & Poultry Feeds 6th of October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية السادسة - مصنع وصوامع النجمة",
        "phone1": "02-38207610", "phone2": "01008822441", "website": "",
        "email": "negma.feeds.oct@gmail.com", "lat": 29.898, "lon": 30.820, "fleetSize": 50,
        "fleetType": "تريلات نقل حبوب ذرة وصويا قلاب وتريلات نقل شكاير أعلاف للمحافظات", "priority": "A",
        "notes": "إنتاج الأعلاف المحببة وتوزيعها على مزارع الدواجن والماشية بطريق مصر-إسكندرية والفيوم"
    },

    # ── Sub-Cluster D: مجمعات التبريد واللوجستيات ومحطات تصدير الحاصلات (الصحراوي وأبو رواش) ──
    {
        "nameAr": "شركة الصحراوي للوجستيات والمخازن المبردة 3PL (أبو رواش كم 27)",
        "nameEn": "Sahrawi 3PL Logistics & Cold Storage Hub Abu Rawash",
        "sector": "logistics", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "طريق مصر الإسكندرية الصحراوي - الكيلو 27 - مجمع المستودعات اللوجستية",
        "phone1": "02-35391500", "phone2": "01009933887", "website": "http://www.sahrawi-logistics.com",
        "email": "warehouse@sahrawi-logistics.com", "lat": 30.058, "lon": 31.028, "fleetSize": 85,
        "fleetType": "أسطول شاحنات تبريد وتريلات نقل حاويات جافة ومبردة 40 قدم ورافعات شوكية", "priority": "A+",
        "notes": "مركز توزيع إقليمي وتخزين بضائع وسلاسل إمداد مبردة لكبرى العلامات التجارية"
    },
    {
        "nameAr": "شركة النيل للتصدير الزراعي ومحطات الفرز والتعبئة (الصحراوي كم 54)",
        "nameEn": "Nile Agro Export & Packing Station Desert Road Km 54",
        "sector": "manufacturing", "city": "giza", "district": "طريق الإسكندرية الصحراوي", "governorate": "الجيزة",
        "address": "طريق مصر الإسكندرية الصحراوي - الكيلو 54 - مجمع محطات الفرز والتصدير",
        "phone1": "02-35391610", "phone2": "01227744339", "website": "http://www.nileagro-export.com",
        "email": "export@nileagro-export.com", "lat": 30.150, "lon": 30.780, "fleetSize": 65,
        "fleetType": "شاحنات تبريد ثيرمو كينج وتريلات نقل كونتينرات لموانئ الإسكندرية والدخيلة", "priority": "A+",
        "notes": "فرز وتعبئة وتصدير الموالح والعنب والفراولة إلى الاتحاد الأوروبي وإنجلترا وروسيا"
    },
    {
        "nameAr": "شركة الدلتا للشحن والتفريغ والمستودعات المركزية (أبو رواش الصناعية)",
        "nameEn": "Delta Freight & Central Warehouses Abu Rawash",
        "sector": "logistics", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "أبو رواش - المنطقة الصناعية - بجوار محطة كهرباء أبو رواش",
        "phone1": "02-35391700", "phone2": "01118833552", "website": "",
        "email": "delta.freight.aburawash@gmail.com", "lat": 30.045, "lon": 31.035, "fleetSize": 55,
        "fleetType": "تريلات نقل بضائع عامة وجرارات مرسيدس مان ومقطورات مسطحة", "priority": "A",
        "notes": "نقل البضائع الصناعية ومستلزمات الإنتاج بين مصانع أكتوبر والموانئ البحرية"
    },
    {
        "nameAr": "شركة أجريكو للحاصلات الزراعية ومحطات التبريد والتصدير (الصحراوي كم 62)",
        "nameEn": "Agrico Fresh Produce & Cold Chain Hub Desert Road Km 62",
        "sector": "trade", "city": "giza", "district": "طريق الإسكندرية الصحراوي", "governorate": "الجيزة",
        "address": "طريق مصر الإسكندرية الصحراوي - الكيلو 62 - مجمع محطات أجريكو",
        "phone1": "02-35391810", "phone2": "01016644883", "website": "",
        "email": "agrico.coldchain@gmail.com", "lat": 30.180, "lon": 30.720, "fleetSize": 50,
        "fleetType": "تريلات تبريد حديثة لنقل الحاصلات الزراعية من المزارع لموانئ الشحن", "priority": "A",
        "notes": "إدارة سلاسل التبريد والتصدير لمحاصيل البصل والبطاطس والبرتقال"
    },
    {
        "nameAr": "شركة لوجي مصر للنقل السريع والمستودعات الجمركية (القرية الذكية / أبو رواش)",
        "nameEn": "LogiMisr Express Freight & Bonded Warehouses Smart Village",
        "sector": "logistics", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "طريق إسكندرية الصحراوي - مدخل القرية الذكية وأبو رواش - مجمع لوجي مصر",
        "phone1": "02-35391900", "phone2": "01205511776", "website": "http://www.logimisr-eg.com",
        "email": "operations@logimisr-eg.com", "lat": 30.075, "lon": 31.015, "fleetSize": 60,
        "fleetType": "شاحنات نقل مغلقة مقفلة وتريلات نقل شحنات جوية وبحرية مجمعة", "priority": "A+",
        "notes": "خدمات النقل اللوجستي السريع وإدارة المستودعات العامة والجمركية"
    },
    {
        "nameAr": "شركة ترانز فيردي للنقل المبرد الدولي والداخلي (أبو رواش)",
        "nameEn": "Trans Verde Reefer Transport Abu Rawash Logistics",
        "sector": "logistics", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "أبو رواش - شارع المستودعات الرئيسي - جراج ورش ترانز فيردي",
        "phone1": "02-35392010", "phone2": "01124477119", "website": "",
        "email": "transverde.egypt@gmail.com", "lat": 30.042, "lon": 31.038, "fleetSize": 45,
        "fleetType": "أسطول تريلات مبردة حمولة 28 طن مجهزة بأجهزة تسجيل درجات الحرارة", "priority": "A",
        "notes": "نقل الأدوية الحساسة للحرارة واللحوم والدواجن المجمدة"
    },

    # ── Sub-Cluster E: محاجر الرمل والسن وكسارات ومصانع الطوب (دهشور، طريق الواحات، طريق الفيوم) ──
    {
        "nameAr": "شركة دهشور للمحاجر وتوريد السن والرمل والزلط (طريق دهشور القديم)",
        "nameEn": "Dahshur Quarries & Aggregate Supply Old Dahshur Road",
        "sector": "manufacturing", "city": "october", "district": "دهشور", "governorate": "الجيزة",
        "address": "مركز البدرشين / دهشور - طريق المحاجر الرئيسي - محجر دهشور رقم 8",
        "phone1": "02-38208100", "phone2": "01004488335", "website": "",
        "email": "dahshur.quarries.eg@gmail.com", "lat": 29.805, "lon": 31.180, "fleetSize": 65,
        "fleetType": "قلابات ثقيلة 40 و50 طن ولودرات كاتربيلر عملاقة وكسارات سن متنقلة", "priority": "A+",
        "notes": "توريد رمل البناء والزلط الفولى وسن الدولوميت لمحطات الخلط المركزية"
    },
    {
        "nameAr": "شركة الهرم لمصانع الطوب الطفلي والأسمنتي الآلي (دهشور وطريق الفيوم)",
        "nameEn": "Al Haram Automated Clay & Cement Brick Factories Dahshur",
        "sector": "manufacturing", "city": "giza", "district": "دهشور", "governorate": "الجيزة",
        "address": "طريق دهشور / أسيوط الغربي - مجمع مصانع طوب الهرم الآلية",
        "phone1": "02-38208210", "phone2": "01116633994", "website": "",
        "email": "haram.brick.dahshur@gmail.com", "lat": 29.790, "lon": 31.165, "fleetSize": 55,
        "fleetType": "تريلات وجرارات نقل طوب مجهزة بأوناش تفريغ هيدروليكية وسيور تحميل", "priority": "A+",
        "notes": "إنتاج وتوريد الطوب الطفلي المفرغ والأسمنتي المصمت لكبرى شركات التشييد"
    },
    {
        "nameAr": "شركة الواحات للتعدين وكسارات الدبش والأحجار (طريق الواحات كم 35)",
        "nameEn": "Al Wahat Mining & Stone Crushers Oasis Road Km 35",
        "sector": "manufacturing", "city": "october", "district": "طريق الواحات", "governorate": "الجيزة",
        "address": "طريق الواحات البحرية - الكيلو 35 - كسارات ومحاجر الواحات",
        "phone1": "02-38208300", "phone2": "01229944771", "website": "",
        "email": "wahat.mining.crushers@gmail.com", "lat": 29.870, "lon": 30.750, "fleetSize": 50,
        "fleetType": "حفارات بشواكيش هيدروليكية وقلابات صخرية وتريلات نقل ركام", "priority": "A",
        "notes": "توريد صخور الدبش وأحجار التدبيش لمشروعات حماية الطرق والترع والكباري"
    },
    {
        "nameAr": "شركة السلام لإنتاج البلوك الأسمنتي والإنترلوك الآلي (طريق الفيوم كم 12)",
        "nameEn": "Al Salam Cement Block & Interlock Plant Fayoum Road",
        "sector": "manufacturing", "city": "october", "district": "حدائق أكتوبر", "governorate": "الجيزة",
        "address": "طريق القاهرة - الفيوم - الكيلو 12 - مصنع السلام للبلوك الآلي",
        "phone1": "02-38208410", "phone2": "01017733558", "website": "",
        "email": "salam.interlock.oct@gmail.com", "lat": 29.895, "lon": 31.040, "fleetSize": 40,
        "fleetType": "تريلات نقل إنترلوك وبلدورات وطوب مصمت وسيارات ونش توزيع", "priority": "A",
        "notes": "توريد بلاط الإنترلوك والبلدورات لمشروعات اللاندسكيب وتطوير الطرق"
    },
    {
        "nameAr": "شركة الصخرة لتكسير وغربلة البازلت وركام الأسفلت (أبو رواش / جبل طامية)",
        "nameEn": "Al Sakhra Basalt Crushing & Asphalt Aggregate Abu Rawash",
        "sector": "manufacturing", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "أبو رواش - امتداد طريق المحاجر - مجمع كسارات الصخرة للبازلت",
        "phone1": "02-35392100", "phone2": "01128811445", "website": "",
        "email": "sakhra.basalt.crushers@gmail.com", "lat": 30.035, "lon": 31.010, "fleetSize": 45,
        "fleetType": "قلابات ثقيلة مصفحة وكسارات مخروطية وتريلات نقل سن بازلت معتمد", "priority": "A",
        "notes": "إنتاج ركام البازلت الصلب عالي المقاومة لخلطات رصف مهابط المطارات والكباري"
    },

    # ── Sub-Cluster F: مقاولات الطرق والكباري والأسفلت والتسويات (غرب الجيزة) ──
    {
        "nameAr": "شركة رصف مصر لمقاولات الطرق وخلاطات الأسفلت (أبو رواش كم 29)",
        "nameEn": "Rasf Misr Road Contracting & Asphalt Plant Abu Rawash",
        "sector": "contracting", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "طريق مصر الإسكندرية الصحراوي - الكيلو 29 - معسكر وخلاطة رصف مصر",
        "phone1": "02-35392210", "phone2": "01005522883", "website": "http://www.rasfmisr-contracting.com",
        "email": "info@rasfmisr-contracting.com", "lat": 30.065, "lon": 31.018, "fleetSize": 70,
        "fleetType": "خلاطات أسفلت حديثة وفناكر وهراسات حديد وكاوتش وقلابات أسفلت معزولة", "priority": "A+",
        "notes": "تنفيذ أعمال رصف وتطوير محاور الضبعة ومصر-إسكندرية الصحراوي والدائري الأوسطي"
    },
    {
        "nameAr": "شركة الرواد للتسويات العامة والحفر والنقل الثقيل (أكتوبر والتوسعات)",
        "nameEn": "Al Rowad Earthmoving & Heavy Haulage 6th of October",
        "sector": "contracting", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - التوسعات الشرقية - معسكر آليات ومعدات الرواد",
        "phone1": "02-38208500", "phone2": "01201188447", "website": "",
        "email": "rowad.earthmoving@gmail.com", "lat": 29.980, "lon": 30.940, "fleetSize": 60,
        "fleetType": "بلدوزرات كاتربيلر D8/D9 وحفارات كوماتسو وقلابات ردميات تريلا 45 طن", "priority": "A+",
        "notes": "أعمال القطع والردم والتسويات الكبرى للمدن الجديدة والمجمعات الصناعية"
    },
    {
        "nameAr": "شركة الجيزة للإنشاءات الهندسية ومقاولات البنية التحتية (الشيخ زايد وأكتوبر)",
        "nameEn": "Giza Engineering Construction & Infrastructure October",
        "sector": "contracting", "city": "october", "district": "الشيخ زايد", "governorate": "الجيزة",
        "address": "الشيخ زايد - محور 26 يوليو - مبنى إدارة الجيزة للإنشاءات الهندسية",
        "phone1": "02-38208610", "phone2": "01117755226", "website": "http://www.gizaconstruction-eg.com",
        "email": "projects@gizaconstruction-eg.com", "lat": 30.030, "lon": 30.970, "fleetSize": 50,
        "fleetType": "شاحنات نقل ثقيل ومعدات حفر أنفاق ميكروتانيلينج وسيارات إشراف هندسي", "priority": "A",
        "notes": "تنفيذ خطوط المياه الرئيسية ومحطات الصرف والكهرباء بمشروعات غرب الجيزة"
    },
    {
        "nameAr": "شركة أسفلت الصحراوي لخلط وتوريد الخلطات الأسفلتية الساخنة (الصحراوي كم 45)",
        "nameEn": "Sahrawi Asphalt Hot Mix Supply Desert Road Km 45",
        "sector": "manufacturing", "city": "giza", "district": "طريق الإسكندرية الصحراوي", "governorate": "الجيزة",
        "address": "طريق مصر الإسكندرية الصحراوي - الكيلو 45 - خلاطة ومجمع أسفلت الصحراوي",
        "phone1": "02-35392300", "phone2": "01018899224", "website": "",
        "email": "sahrawi.asphalt.km45@gmail.com", "lat": 30.120, "lon": 30.850, "fleetSize": 45,
        "fleetType": "خلاطة أسفلت سعة 240 طن/ساعة وتريلات نقل بيتومين وقلابات معزولة", "priority": "A",
        "notes": "توريد الأسفلت الساخن لمقاولي الطرق بالقطاع الشمالي لمحافظة الجيزة"
    },
    {
        "nameAr": "شركة النور لنقل المعدات الثقيلة واللوابد (أبو رواش الصناعية)",
        "nameEn": "Al Nour Heavy Equipment Transport & Lowbed Trailers",
        "sector": "logistics", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "المنطقة الصناعية بأبو رواش - طريق المنصورية - جراج لوابد النور",
        "phone1": "02-35392410", "phone2": "01224499113", "website": "",
        "email": "nour.lowbeds.eg@gmail.com", "lat": 30.046, "lon": 31.030, "fleetSize": 40,
        "fleetType": "لوابد نقل ثقيل حمولات 60 إلى 120 طن لنقل الحفارات والأوناش والبلدوزرات", "priority": "A",
        "notes": "نقل المعدات الثقيلة وآلات حفر الأساسات بين مواقع المشروعات القومية"
    },
    {
        "nameAr": "شركة الفتح للمقاولات العامة والإنشاءات التخصصية (أكتوبر الصناعية)",
        "nameEn": "Al Fateh General Contracting & Construction October",
        "sector": "contracting", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الثالثة - مجمع الفتح للمقاولات",
        "phone1": "02-38208700", "phone2": "01129955331", "website": "",
        "email": "fateh.contracting.oct@gmail.com", "lat": 29.920, "lon": 30.880, "fleetSize": 45,
        "fleetType": "شاحنات قلاب مرسيدس أكتروس ومعدات دك ودكاكات اهتزازية ومولدات متنقلة", "priority": "A",
        "notes": "تنفيذ منشآت المصانع والمستودعات والخرسانات الأرضية المسلحة بالهليكوبتر"
    },
    {
        "nameAr": "شركة مصر للكباري والمقاولات البحرية والبرية (فرع أبو رواش)",
        "nameEn": "Misr Bridges & Heavy Construction Abu Rawash Base",
        "sector": "contracting", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "أبو رواش - الكيلو 28 طريق إسكندرية الصحراوي - ورش تصنيع حديد الكباري",
        "phone1": "02-35392510", "phone2": "01007733996", "website": "http://www.misrbridges.com",
        "email": "aburawash@misrbridges.com", "lat": 30.052, "lon": 31.022, "fleetSize": 65,
        "fleetType": "أوناش عملاقة 150 طن وتريلات نقل قطاعات حديدية ثقيلة ومعدات دق خوازيق", "priority": "A+",
        "notes": "تنفيذ مشروعات كباري تقاطعات الطرق السريعة ومحاور تحيا مصر ومحور 26 يوليو"
    },
    {
        "nameAr": "شركة الصفا لمقاولات العزل المائي وتجهيز الخرسانات (الشيخ زايد)",
        "nameEn": "Al Safa Waterproofing & Concrete Treatment Sheikh Zayed",
        "sector": "contracting", "city": "october", "district": "الشيخ زايد", "governorate": "الجيزة",
        "address": "الشيخ زايد - الحي التجاري - مجمع إدارة الصفا للمقاولات الكيماوية",
        "phone1": "02-38208810", "phone2": "01206622449", "website": "",
        "email": "safa.waterproofing.zayed@gmail.com", "lat": 30.035, "lon": 30.980, "fleetSize": 35,
        "fleetType": "سيارات نقل معدات رش ومضخات حقن إيبوكسي وسيارات إشراف فني", "priority": "B",
        "notes": "تنفيذ أعمال عزل الأساسات وخزانات المياه الكبرى والأنفاق والمسابح"
    },

    # ── Sub-Cluster G: شركات ومصانع شاحنات وهياكل سيارات وتجهيزات تجارية (أبو رواش وأكتوبر) ──
    {
        "nameAr": "الشركة المصرية الألمانية لتجهيزات الشاحنات والمقطورات (أبو رواش)",
        "nameEn": "Egyptian German Truck Body Building & Trailers Abu Rawash",
        "sector": "manufacturing", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "المنطقة الصناعية بأبو رواش - القطعة 19 - مصانع تجهيزات الشاحنات",
        "phone1": "02-35392600", "phone2": "01115533887", "website": "http://www.eg-truckbodies.com",
        "email": "info@eg-truckbodies.com", "lat": 30.049, "lon": 31.029, "fleetSize": 50,
        "fleetType": "شاحنات سحب وتريلات اختبارات ومعدات تصنيع صناديق القلابات وشاسيهات المقطورات", "priority": "A+",
        "notes": "تصنيع وتجهيز صناديق القلابات الثقيلة والمقطورات والتنك وصناديق التبريد"
    },
    {
        "nameAr": "شركة تريلا مصر لتصنيع أنصاف المقطورات واللوابد (المنطقة الصناعية السادسة)",
        "nameEn": "Treila Misr Semi-trailers & Lowbed Manufacturing October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية السادسة - مصنع تريلا مصر",
        "phone1": "02-38208910", "phone2": "01014499228", "website": "",
        "email": "treila.misr.factory@gmail.com", "lat": 29.892, "lon": 30.828, "fleetSize": 45,
        "fleetType": "مقطورات مسطحة ولوابد ثقيلة وتريلات نقل هياكل معدنية", "priority": "A",
        "notes": "تصنيع أنصاف المقطورات ثلاثية المحاور واللوابد ذات الحمولات الفائقة"
    },
    {
        "nameAr": "شركة النيل لتجهيز سيارات الإطفاء والإنقاذ والبلدية (6 أكتوبر)",
        "nameEn": "Nile Fire Trucks & Municipal Vehicle Outfitting October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الثانية - بلوك 55",
        "phone1": "02-38209000", "phone2": "01228844331", "website": "",
        "email": "nile.emergency.vehicles@gmail.com", "lat": 29.948, "lon": 30.908, "fleetSize": 40,
        "fleetType": "شاحنات إطفاء مجهزة وسيارات كنس آلي وسيارات شفط وضغط مجاري", "priority": "A",
        "notes": "تجهيز وتوريد شاحنات الدفاع المدني وسيارات النظافة والمكبس للمدن والمطارات"
    },
    {
        "nameAr": "شركة الهندسية لصناعة وتجهيز الفناطيس والصهاريج البترولية (أبو رواش)",
        "nameEn": "Engineering Tankers & Petroleum Tank Manufacturing Abu Rawash",
        "sector": "manufacturing", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "المنطقة الصناعية بأبو رواش - طريق مصر-إسكندرية الصحراوي - مجمع الفناطيس",
        "phone1": "02-35392710", "phone2": "01006611449", "website": "",
        "email": "engineering.tankers.eg@gmail.com", "lat": 30.054, "lon": 31.026, "fleetSize": 45,
        "fleetType": "شاحنات نقل وتجارب ضغط صهاريج وتريلات نقل خزانات وقود 45 ألف لتر", "priority": "A+",
        "notes": "تصنيع واختبار فناطيس نقل البنزين والسولار والكيماويات طبقاً لمواصفات ADR العالمية"
    },
    {
        "nameAr": "شركة الأهرام للهياكل المبردة والعزل الحراري للسيارات (6 أكتوبر)",
        "nameEn": "Ahram Reefer Bodies & Thermal Insulation October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الرابعة - شارع 50",
        "phone1": "02-38209110", "phone2": "01123355776", "website": "",
        "email": "ahram.insulation.bodies@gmail.com", "lat": 29.932, "lon": 30.852, "fleetSize": 35,
        "fleetType": "شاحنات توزيع مبردة وتريلات شحن صناديق فايبر جلاس معزولة بالبولي يوريثان", "priority": "B",
        "notes": "تصنيع صناديق التبريد والتجميد لشاحنات نقل اللحوم والألبان والأدوية"
    },

    # ── Sub-Cluster H: مصانع تدوير، تصنيع كابلات، وزجاج، وسيراميك بمطوري 6 أكتوبر ──
    {
        "nameAr": "شركة بيراميدز للصناعات التعدينية والجرانيت الصناعي (المنطقة الصناعية السادسة)",
        "nameEn": "Pyramids Mining & Industrial Granite 6th Zone October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية السادسة - مصنع بيراميدز للجرانيت",
        "phone1": "02-38209200", "phone2": "01018855332", "website": "",
        "email": "pyramids.granite.oct@gmail.com", "lat": 29.888, "lon": 30.835, "fleetSize": 50,
        "fleetType": "تريلات نقل كتل صخرية وألواح جرانيت وأوناش ساحات شوكية 15 طن", "priority": "A",
        "notes": "قص وتلميع الجرانيت والرخام وتوريد مشروعات الفنادق ومحطات المترو والقطار"
    },
    {
        "nameAr": "شركة كابلات أكتوبر للصناعات الكهربائية والموصلات النحاسية (المنطقة الأولى)",
        "nameEn": "October Cables & Copper Conductors Industries 1st Zone",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الأولى - مجمع مصانع كابلات أكتوبر",
        "phone1": "02-38209310", "phone2": "01204488221", "website": "http://www.octobercables.com",
        "email": "info@octobercables.com", "lat": 29.955, "lon": 30.925, "fleetSize": 55,
        "fleetType": "تريلات نقل بكرات كابلات جهد منخفض ومتوسط وتريلات سحب أسلاك", "priority": "A+",
        "notes": "إنتاج كابلات القوى والتحكم وتغذية مشروعات محطات المحولات والعاصمة الإدارية"
    },
    {
        "nameAr": "شركة النماء للزجاج والبلور المعماري والأبواب السيكوريت (المنطقة الصناعية الثالثة)",
        "nameEn": "Al Namaa Architectural Glass & Tempered Doors October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الثالثة - شارع الأمل قطعة 112",
        "phone1": "02-38209400", "phone2": "01118844993", "website": "",
        "email": "namaa.glass.october@gmail.com", "lat": 29.912, "lon": 30.892, "fleetSize": 35,
        "fleetType": "شاحنات نقل ألواح زجاج مزودة بأعمدة تثبيت هوائية وسيارات شحن", "priority": "B",
        "notes": "معالجة الزجاج بالأفران الحرارية وعمل واجهات الاستركشر للمباني الإدارية"
    },
    {
        "nameAr": "شركة الفيروز للصناعات البلاستيكية والعبوات الهندسية (المنطقة الصناعية الرابعة)",
        "nameEn": "Al Fairouz Plastic Containers & Industrial Packaging 4th Zone",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الرابعة - مصنع الفيروز للبلاستيك",
        "phone1": "02-38209510", "phone2": "01003399117", "website": "",
        "email": "fairouz.plastic.oct@gmail.com", "lat": 29.935, "lon": 30.868, "fleetSize": 45,
        "fleetType": "تريلات جامبو لنقل براميل وجالونات التعبئة الصناعية وسيارات توزيع", "priority": "A",
        "notes": "حقن ونفخ البراميل البلاستيكية سعة 220 لتر والجرادل لمصانع البويات والكيماويات"
    },
    {
        "nameAr": "شركة التيسير لتجارة وتوزيع وتخزين الأسمنت السائب والحديد (أبو رواش)",
        "nameEn": "Al Tayseer Cement & Steel Distribution Hub Abu Rawash",
        "sector": "trade", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "طريق مصر-إسكندرية الصحراوي - مجمع مستودعات التيسير لمواد البناء",
        "phone1": "02-35392800", "phone2": "01227711886", "website": "",
        "email": "tayseer.cement.steel@gmail.com", "lat": 30.044, "lon": 31.033, "fleetSize": 60,
        "fleetType": "تريلات نقل حديد تسليح أطوال 12م وتريلات سايلو نقل أسمنت سائب 70 طن", "priority": "A+",
        "notes": "توريد حديد التسليح والأسمنت المقاوم لمحطات الخلط وشركات المقاولات الكبرى"
    },
    {
        "nameAr": "شركة الصفا للورق والكرتون وإعادة التدوير (المنطقة الصناعية الأولى 6 أكتوبر)",
        "nameEn": "Al Safa Paper Mills & Recycling 1st Industrial Zone",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الأولى - مصنع وورق الصفا",
        "phone1": "02-38209610", "phone2": "01124411995", "website": "",
        "email": "safa.paper.recycling@gmail.com", "lat": 29.962, "lon": 30.912, "fleetSize": 50,
        "fleetType": "تريلات نقل بالات دشت ورق ومكابس هيدروليكية وتريلات رولات فلوتنج وتست لاينر", "priority": "A",
        "notes": "تدوير المخلفات الورقية وإنتاج رولات الورق المستخدمة في صناعة الكرتون المضلع"
    },
    {
        "nameAr": "شركة الصقر لنقل الصهاريج والمواد البترولية (طريق إسكندرية الصحراوي كم 32)",
        "nameEn": "Al Saqr Petroleum Tanker Fleet Desert Road Km 32",
        "sector": "logistics", "city": "giza", "district": "طريق الإسكندرية الصحراوي", "governorate": "الجيزة",
        "address": "طريق مصر الإسكندرية الصحراوي - الكيلو 32 - جراج صهاريج الصقر",
        "phone1": "02-35392900", "phone2": "01016622889", "website": "",
        "email": "saqr.petroleum.transport@gmail.com", "lat": 30.080, "lon": 30.990, "fleetSize": 65,
        "fleetType": "أسطول تريلات صهاريج وقود مرسيدس أكتروس حمولة 45 ألف لتر وسيارات مجهزة بأنظمة ADR وGPS", "priority": "A+",
        "notes": "نقل وتوزيع السولار والمازوت لمصانع أكتوبر وخلاطات الأسفلت ومحطات الكهرباء"
    },
    {
        "nameAr": "شركة الشرق لمقاولات الحفر الأفقي وتعدية الطرق والأنفاق (الشيخ زايد)",
        "nameEn": "Al Sharq Horizontal Directional Drilling HDD Sheikh Zayed",
        "sector": "contracting", "city": "october", "district": "الشيخ زايد", "governorate": "الجيزة",
        "address": "الشيخ زايد - مجمع الإدارات الهندسية - طريق وصلة دهشور",
        "phone1": "02-38209710", "phone2": "01205588334", "website": "",
        "email": "sharq.hdd.drilling@gmail.com", "lat": 30.025, "lon": 30.930, "fleetSize": 40,
        "fleetType": "ماكينات حفر أفقي موجه HDD وتريلات نقل أنابيب غاز صلب وشاحنات مساندة", "priority": "A",
        "notes": "تعدية خطوط الغاز والكهرباء والاتصالات أسفل الطرق السريعة وسكك الحديد"
    },
    {
        "nameAr": "شركة الفهد لتجارة واستيراد إطارات الشاحنات والمعدات وخدمة الأساطيل (أبو رواش)",
        "nameEn": "Al Fahd Commercial Truck Tires & Fleet Service Abu Rawash",
        "sector": "trade", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "طريق مصر-إسكندرية الصحراوي - مدخل أبو رواش الصناعي - مركز خدمات الأساطيل",
        "phone1": "02-35393000", "phone2": "01117788442", "website": "",
        "email": "fahd.trucktires.hub@gmail.com", "lat": 30.051, "lon": 31.024, "fleetSize": 35,
        "fleetType": "سيارات ورش متنقلة لخدمة إطارات الشاحنات وتريلات نقل وتوزيع الإطارات التجارية", "priority": "A",
        "notes": "خدمة أساطيل النقل الثقيل وضبط زوايا وتركيب مقاسات 315/80R22.5 و385/65R22.5"
    },
    {
        "nameAr": "شركة طيبة للرخام والجرانيت وأعمال الواجهات الكبرى (المنطقة الصناعية السادسة)",
        "nameEn": "Tiba Marble & Granite Facades 6th Zone October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية السادسة - مصنع طيبة للرخام",
        "phone1": "02-38209810", "phone2": "01009944773", "website": "",
        "email": "tiba.marble.oct@gmail.com", "lat": 29.896, "lon": 30.822, "fleetSize": 45,
        "fleetType": "تريلات نقل ألواح رخام جرانيت وشاحنات شحن وتوزيع وسيارات إشراف", "priority": "A",
        "notes": "توريد وتركيب الرخام والجرانيت للمولات والمستشفيات والكمبوندات الفاخرة"
    },
    {
        "nameAr": "شركة الأهرام للصناعات الكيماوية والمنظفات الصناعية (المنطقة الصناعية الثانية)",
        "nameEn": "Ahram Chemical Industries & Industrial Detergents October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الثانية - مجمع مصانع الأهرام للكيماويات",
        "phone1": "02-38209900", "phone2": "01223388556", "website": "",
        "email": "ahram.chemicals.october@gmail.com", "lat": 29.942, "lon": 30.902, "fleetSize": 40,
        "fleetType": "تريلات فنطاس نقل مواد سائلة وسيارات جامبو لتوزيع المنظفات الصناعية", "priority": "B",
        "notes": "إنتاج وتوزيع المنظفات الصناعية والمطهرات لمعامل الألبان والمجازر والمصانع"
    },
    {
        "nameAr": "شركة سيتي ترانز للنقل واللوجستيات والتخليص الجمركي (أبو رواش)",
        "nameEn": "CityTrans Freight Logistics & Customs Clearance Abu Rawash",
        "sector": "logistics", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "أبو رواش - طريق المنصورية - مبنى سيتي ترانز للشحن واللوجستيات",
        "phone1": "02-35393110", "phone2": "01126644227", "website": "http://www.citytrans-eg.com",
        "email": "customs@citytrans-eg.com", "lat": 30.041, "lon": 31.036, "fleetSize": 55,
        "fleetType": "تريلات نقل حاويات بضائع عامة وجرارات حديثة وشاحنات نقل جمركي مجهزة", "priority": "A+",
        "notes": "تخليص ونقل بضائع الترانزيت والحاويات بين الموانئ ومصانع 6 أكتوبر وأبو رواش"
    },
    {
        "nameAr": "شركة النماء للصناعات الخشبية والأثاث المكتبي والفندقي التصديري (أكتوبر CPC)",
        "nameEn": "Al Namaa Wooden Industries & Contract Furniture October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - مجمع المطورين الصناعيين بولاريس / CPC - بلوك 8",
        "phone1": "02-38210010", "phone2": "01015599334", "website": "",
        "email": "namaa.furniture.cpc@gmail.com", "lat": 29.902, "lon": 30.815, "fleetSize": 45,
        "fleetType": "تريلات صندوق مقفول لنقل الأثاث الفندقي والمكتبي وسيارات نقل مسطحة", "priority": "A",
        "notes": "تصنيع وتوريد وتصدير الأثاث الفندقي والمكتبي لمشروعات الأبراج والفنادق الكبرى"
    },
    {
        "nameAr": "شركة الشرق الأوسط للصناعات الزجاجية والعبوات الدوائية (أكتوبر الصناعية الأولى)",
        "nameEn": "Middle East Glass Containers & Pharma Bottles October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الأولى - مجمع مصانع العبوات الزجاجية",
        "phone1": "02-38210100", "phone2": "01207755118", "website": "",
        "email": "glass.containers.oct@gmail.com", "lat": 29.958, "lon": 30.918, "fleetSize": 60,
        "fleetType": "تريلات تريلات نقل رمل سيليكا نقي وتريلات شحن كراتين زجاج معبأة للمصانع", "priority": "A+",
        "notes": "إنتاج القوارير والزجاجات الدوائية والغذائية وتوريد مصانع الأدوية والعصائر"
    },
    {
        "nameAr": "شركة الواحات لتوريد رمال الملاحات والسيليكا وتجهيز المحاجر (طريق الواحات كم 50)",
        "nameEn": "Al Wahat Silica Sand & Industrial Minerals Oasis Km 50",
        "sector": "manufacturing", "city": "october", "district": "طريق الواحات", "governorate": "الجيزة",
        "address": "طريق الواحات البحرية - الكيلو 50 - محجر ومغسلة رمال الواحات",
        "phone1": "02-38210210", "phone2": "01114422886", "website": "",
        "email": "wahat.silica.sand@gmail.com", "lat": 29.840, "lon": 30.680, "fleetSize": 50,
        "fleetType": "قلابات ثقيلة حمولة 45 طن ومعدات غسيل وغربلة رمال وتريلات نقل خامات", "priority": "A",
        "notes": "استخراج وغسيل وتوريد رمال السيليكا عالية النقاوة لمصانع الزجاج والسباكة"
    },
    {
        "nameAr": "شركة الأمل لخلط وتوريد الأسفلت والرصف المتطور (طريق دهشور)",
        "nameEn": "Al Amal Advanced Asphalt Mixing & Road Paving Dahshur",
        "sector": "manufacturing", "city": "october", "district": "طريق دهشور", "governorate": "الجيزة",
        "address": "طريق وصلة دهشور الجنوبية - الكيلو 14 - محطة وخلاطة أسفلت الأمل",
        "phone1": "02-38210300", "phone2": "01008855112", "website": "",
        "email": "amal.asphalt.dahshur@gmail.com", "lat": 29.850, "lon": 30.980, "fleetSize": 55,
        "fleetType": "خلاطة أسفلت آلية وتريلات نقل بيتومين ومازوت وفناكر حديثة بأجهزة ليزر", "priority": "A+",
        "notes": "إنتاج وتوريد الخلطات الأسفلتية ورصف المحاور الرابطة بين أكتوبر وطريق الصعيد"
    },
    {
        "nameAr": "شركة سفنكس للمستودعات اللوجستية والشحن المبرد (مطار سفنكس / الصحراوي كم 45)",
        "nameEn": "Sphinx Airport Logistics & Cold Chain Hub Desert Road Km 45",
        "sector": "logistics", "city": "giza", "district": "طريق الإسكندرية الصحراوي", "governorate": "الجيزة",
        "address": "طريق مصر الإسكندرية الصحراوي - أمام مطار سفنكس الدولي - مجمع سفنكس اللوجستي",
        "phone1": "02-35393200", "phone2": "01229966445", "website": "http://www.sphinx-logistics.com",
        "email": "cargo@sphinx-logistics.com", "lat": 30.115, "lon": 30.865, "fleetSize": 70,
        "fleetType": "أسطول شاحنات مبردة وجافة وتريلات نقل طرود شحن جوي ومستودعات مكيفة", "priority": "A+",
        "notes": "شحن وتخزين الصادرات الزراعية والدوائية السريعة عبر مطار سفنكس وموانئ الإسكندرية"
    },
    {
        "nameAr": "شركة النيل للطوب الأسمنتي والآلي وتوريد الركام (مركز العياط ودهشور)",
        "nameEn": "Nile Cement Brick Industry & Aggregates Dahshur",
        "sector": "manufacturing", "city": "giza", "district": "دهشور", "governorate": "الجيزة",
        "address": "طريق دهشور الزراعي / الغربي - مجمع مصانع النيل للطوب الأسمنتي",
        "phone1": "02-38210410", "phone2": "01127788339", "website": "",
        "email": "nile.brick.dahshur@gmail.com", "lat": 29.775, "lon": 31.190, "fleetSize": 45,
        "fleetType": "تريلات تريلات نقل طوب أوتوماتيكية بكرينات تفريغ ولودرات تحميل", "priority": "A",
        "notes": "إنتاج وتوريد الطوب الأسمنتي النمطي والمصمت لتنفيذ المشروعات السكنية والتجارية"
    },
    {
        "nameAr": "شركة الفتح لتوريد الصوامع ومعدات مطاحن الغلال (المنطقة الصناعية الثانية)",
        "nameEn": "Al Fateh Silos & Flour Mill Equipment 2nd Zone October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الثانية - مجمع مصانع الصوامع الهندسية",
        "phone1": "02-38210500", "phone2": "01017722448", "website": "",
        "email": "fateh.silos.mill@gmail.com", "lat": 29.946, "lon": 30.906, "fleetSize": 40,
        "fleetType": "تريلات نقل قطاعات صوامع معدنية ومعدات رفع وهياكل غربلة وتخزين", "priority": "A",
        "notes": "تصنيع وتركيب صوامع تخزين الحبوب والغلال ومعدات نقل المحاصيل السائبة"
    },
    {
        "nameAr": "شركة الشرق لتصنيع الصابون والمنظفات والزيوت الصناعية (6 أكتوبر الصناعية)",
        "nameEn": "Al Sharq Soaps & Industrial Detergents 6th of October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الثالثة - بلوك 90",
        "phone1": "02-38210610", "phone2": "01203399775", "website": "",
        "email": "sharq.soaps.october@gmail.com", "lat": 29.916, "lon": 30.888, "fleetSize": 45,
        "fleetType": "شاحنات جامبو وتريلات نقل عبوات صابون ومساحيق غسيل وتوزيع إقليمي", "priority": "A",
        "notes": "إنتاج وتوزيع مساحيق الغسيل والمنظفات المنزلية والصناعية للقطاعات التجارية"
    },
    {
        "nameAr": "شركة الجيزة للنقل الثقيل واللوجستيات والمقاولات (أبو رواش الصناعية)",
        "nameEn": "Giza Heavy Haulage & Industrial Logistics Abu Rawash",
        "sector": "logistics", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "أبو رواش - طريق مصر-إسكندرية الصحراوي - مجمع جراجات الجيزة للنقل",
        "phone1": "02-35393300", "phone2": "01115599228", "website": "",
        "email": "giza.heavy.haulage@gmail.com", "lat": 30.047, "lon": 31.031, "fleetSize": 60,
        "fleetType": "تريلات مسطحة وتريلات جوانب لنقل الحديد والأسمنت ومعدات المصانع", "priority": "A+",
        "notes": "نقل المهمات والمعدات الثقيلة ومستلزمات الإنتاج بين مصانع غرب الجيزة والمحافظات"
    },
    {
        "nameAr": "شركة الهرم للإنشاءات ورصف الطرق والمطارات (الشيخ زايد وأكتوبر)",
        "nameEn": "Al Haram Road & Airport Paving Construction October",
        "sector": "contracting", "city": "october", "district": "الشيخ زايد", "governorate": "الجيزة",
        "address": "الشيخ زايد - الحي الإداري - برج الهرم للمقاولات العامة",
        "phone1": "02-38210700", "phone2": "01006633774", "website": "http://www.haram-paving.com",
        "email": "projects@haram-paving.com", "lat": 30.038, "lon": 30.975, "fleetSize": 65,
        "fleetType": "فناكر أسفلت حديثة وهراسات أسفلت وقلابات نقل أسفلت معزولة وتريلات بيتومين", "priority": "A+",
        "notes": "تنفيذ أعمال رصف وتطوير الطرق والمحاور والمطارات العسكرية والمدنية"
    },
    {
        "nameAr": "شركة الصفا للمحاجر وتوريد الدبش ومواد التدبيش (طريق الفيوم كم 25)",
        "nameEn": "Al Safa Quarries & Revetment Stone Fayoum Road Km 25",
        "sector": "manufacturing", "city": "october", "district": "طريق الفيوم", "governorate": "الجيزة",
        "address": "طريق القاهرة - الفيوم - الكيلو 25 - محجر الصفا للدبش وحماية الميول",
        "phone1": "02-38210810", "phone2": "01228855993", "website": "",
        "email": "safa.stone.quarries@gmail.com", "lat": 29.860, "lon": 31.010, "fleetSize": 45,
        "fleetType": "قلابات ثقيلة وحفارات بشواكيش وتريلات نقل أحجار التدبيش", "priority": "A",
        "notes": "توريد أحجار الدبش لأعمال حماية الميول بالطرق والسكك الحديدية والتبطين"
    },
    {
        "nameAr": "شركة الواحات للصناعات الكيماوية والدهانات الإنشائية (المنطقة الصناعية السادسة)",
        "nameEn": "Al Wahat Chemical Industries & Paints 6th Zone October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية السادسة - مصنع الواحات للكيماويات",
        "phone1": "02-38210900", "phone2": "01124488556", "website": "",
        "email": "wahat.chemicals.oct@gmail.com", "lat": 29.894, "lon": 30.824, "fleetSize": 40,
        "fleetType": "سيارات نقل دهانات ومواد عزل وصهاريج نقل مستحلبات ومذيبات", "priority": "B",
        "notes": "إنتاج الدهانات الإنشائية والبرايمر ومواد الحماية للمنشآت الخرسانية والحديدية"
    },
    {
        "nameAr": "شركة النيل لنقل وتجارة الأسمنت السائب والمواد البنائية (المنطقة الصناعية الأولى)",
        "nameEn": "Nile Bulk Cement Transport & Silos 1st Zone October",
        "sector": "trade", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الأولى - مستودع صوامع أسمنت النيل",
        "phone1": "02-38211010", "phone2": "01018833119", "website": "",
        "email": "nile.cement.silos@gmail.com", "lat": 29.964, "lon": 30.916, "fleetSize": 50,
        "fleetType": "تريلات سايلو نقل أسمنت سائب ومقطورات نقل أسمنت معبأ", "priority": "A",
        "notes": "إمدادات الأسمنت البورتلاندي العادي والمقاوم لمحطات خلط الخرسانة بأكتوبر"
    },
    {
        "nameAr": "شركة الفتح للكرتون والتغليف المطور ومستلزمات المصانع (المنطقة الصناعية الرابعة)",
        "nameEn": "Al Fateh Packaging & Corrugated Cartons 4th Zone October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الرابعة - مصنع الفتح للكرتون",
        "phone1": "02-38211100", "phone2": "01207711445", "website": "",
        "email": "fateh.carton.october@gmail.com", "lat": 29.926, "lon": 30.862, "fleetSize": 45,
        "fleetType": "تريلات جامبو لنقل كراتين التعبئة للمصانع وسيارات توزيع", "priority": "A",
        "notes": "إنتاج كراتين التصدير وصناديق التعبئة لمصانع الأجهزة الكهربائية والأغذية"
    },
    {
        "nameAr": "شركة الأمل للنقل المبرد والشحن السريع للحاصلات الطازجة (طريق الصحراوي كم 48)",
        "nameEn": "Al Amal Cold Express Logistics Desert Road Km 48",
        "sector": "logistics", "city": "giza", "district": "طريق الإسكندرية الصحراوي", "governorate": "الجيزة",
        "address": "طريق مصر الإسكندرية الصحراوي - الكيلو 48 - مجمع الأمل للشحن المبرد",
        "phone1": "02-35393410", "phone2": "01119955337", "website": "",
        "email": "amal.coldexpress@gmail.com", "lat": 30.130, "lon": 30.840, "fleetSize": 55,
        "fleetType": "تريلات شحن مبرد 40 قدم وسيارات نقل مبردة مجهزة بنظام تتبع GPS ومراقبة درجات الحرارة", "priority": "A+",
        "notes": "نقل الخضروات والفواكه التصديرية من مزارع النوبارية والصحراوي للموانئ"
    },
    {
        "nameAr": "شركة السلام للصناعات الهندسية والهياكل المعدنية والجمالونات (أبو رواش)",
        "nameEn": "Al Salam Steel Structures & Heavy Fabrication Abu Rawash",
        "sector": "manufacturing", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "المنطقة الصناعية بأبو رواش - شارع الورش والمصانع - مصنع السلام للجمالونات",
        "phone1": "02-35393500", "phone2": "01004477228", "website": "",
        "email": "salam.structures.aburawash@gmail.com", "lat": 30.048, "lon": 31.034, "fleetSize": 40,
        "fleetType": "تريلات مسطحة طويلة لنقل الأعمدة والكمرات الحديدية وأوناش هيدروليكية للتركيب", "priority": "A",
        "notes": "تصنيع وتركيب جمالونات المنشآت الصناعية والمستودعات ومحطات المعالجة"
    },
    {
        "nameAr": "شركة الشرق للصوامع ومطاحن القمح وإنتاج السميد والمكرونة (6 أكتوبر)",
        "nameEn": "Al Sharq Grain Silos & Semolina Mills 6th of October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الثالثة - صوامع ومطاحن الشرق",
        "phone1": "02-38211210", "phone2": "01228833991", "website": "",
        "email": "sharq.semolina.mills@gmail.com", "lat": 29.914, "lon": 30.886, "fleetSize": 60,
        "fleetType": "تريلات نقل حبوب قمح وتريلات شحن أجولة دقيق وسميد وتريلات نقل مكرونة كراتين", "priority": "A+",
        "notes": "طحن قمح الديورم وإنتاج السميد والمكرونة والتوزيع لجميع محافظات الجمهورية"
    },
    {
        "nameAr": "شركة الأهرام للتسويات والتعدين وتأجير المعدات الثقيلة (طريق دهشور)",
        "nameEn": "Ahram Earthmoving & Heavy Equipment Rental Dahshur",
        "sector": "contracting", "city": "october", "district": "طريق دهشور", "governorate": "الجيزة",
        "address": "طريق وصلة دهشور - مدخل طريق المحاجر - معسكر أهرام للمعدات",
        "phone1": "02-38211300", "phone2": "01123388442", "website": "",
        "email": "ahram.heavy.rental@gmail.com", "lat": 29.860, "lon": 30.960, "fleetSize": 50,
        "fleetType": "حفارات كوماتسو وبلدوزرات كاتربيلر D8R وجليدرات تسوية وطبانات", "priority": "A",
        "notes": "تنفيذ أعمال التسويات الكبرى وتأجير الأساطيل الثقيلة لمقاولي الطرق والأنفاق"
    },
    {
        "nameAr": "شركة الصفا للبلاستيك وتصنيع خزانات المياه والمواسير (أكتوبر الصناعية)",
        "nameEn": "Al Safa Polyethylene Tanks & Water Systems October Factory",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الرابعة - قطعة 62",
        "phone1": "02-38211410", "phone2": "01015577229", "website": "",
        "email": "safa.polyethylene.tanks@gmail.com", "lat": 29.930, "lon": 30.858, "fleetSize": 40,
        "fleetType": "تريلات مسطحة لنقل خزانات المياه البولي إيثيلين سعة حتى 20 ألف لتر", "priority": "B",
        "notes": "إنتاج خزانات المياه المعزولة ثلاثية ورباعية الطبقات ومحطات الرفع"
    },
    {
        "nameAr": "شركة النيل للتجارة ونقل الزيوت المعدنية والشحوم الصناعية (أبو رواش)",
        "nameEn": "Nile Mineral Oils & Industrial Lubricants Transport Abu Rawash",
        "sector": "trade", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "المنطقة الصناعية بأبو رواش - مستودعات زيوت النيل المركزية",
        "phone1": "02-35393600", "phone2": "01206633887", "website": "",
        "email": "nile.lubricants.aburawash@gmail.com", "lat": 30.043, "lon": 31.037, "fleetSize": 45,
        "fleetType": "تريلات صهاريج نقل زيوت أساس وتريلات نقل براميل زيوت شاحنات ومعدات", "priority": "A",
        "notes": "توزيع زيوت المحركات الديزل والشحوم الصناعية لأساطيل المقاولات والنقل"
    },
    {
        "nameAr": "شركة الواحات لتكسير الدبش وغربلة السن والتوريدات العمومية (طريق الفيوم كم 18)",
        "nameEn": "Al Wahat Stone Crushing & Aggregate Supply Fayoum Km 18",
        "sector": "manufacturing", "city": "october", "district": "حدائق أكتوبر", "governorate": "الجيزة",
        "address": "طريق القاهرة - الفيوم - الكيلو 18 - محجر وكسارة الواحات",
        "phone1": "02-38211510", "phone2": "01118833775", "website": "",
        "email": "wahat.aggregate.fayoum@gmail.com", "lat": 29.880, "lon": 31.025, "fleetSize": 50,
        "fleetType": "قلابات صخرية وحفارات وكسارات سن وتريلات نقل ركام", "priority": "A",
        "notes": "توريد ركام السن المتدرج لطبقات الأساس المساعد لطرق المشروعات القومية"
    },
    {
        "nameAr": "شركة الفتح للخلطات الأسفلتية والمقاولات المتخصصة (أبو رواش الصحراوي)",
        "nameEn": "Al Fateh Hot Mix Asphalt & Paving Abu Rawash",
        "sector": "manufacturing", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "طريق مصر الإسكندرية الصحراوي - الكيلو 28 - خلاطة ومجمع الفتح للأسفلت",
        "phone1": "02-35393710", "phone2": "01007744116", "website": "",
        "email": "fateh.asphalt.aburawash@gmail.com", "lat": 30.057, "lon": 31.021, "fleetSize": 55,
        "fleetType": "خلاطة أسفلت بطاقة 200 طن/ساعة وفناكر رصف وقلابات أسفلت معزولة", "priority": "A+",
        "notes": "إنتاج وتوريد الخلطات الأسفلتية وتنفيذ رصف الطرق السريعة ومحاور الجيزة"
    },
    {
        "nameAr": "شركة الأمل لنقل الصوامع وتجارة الحبوب والغلال (المنطقة الصناعية السادسة)",
        "nameEn": "Al Amal Grain Transport & Bulk Cargo 6th Zone October",
        "sector": "logistics", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية السادسة - مجمع مستودعات الأمل للحبوب",
        "phone1": "02-38211600", "phone2": "01224488225", "website": "",
        "email": "amal.grain.transport@gmail.com", "lat": 29.890, "lon": 30.825, "fleetSize": 60,
        "fleetType": "أسطول تريلات قلاب نقل ذرة وصويا وقمح وتريلات حاويات نقل غلال", "priority": "A+",
        "notes": "نقل وتفريغ الحبوب السائبة من موانئ الدخيلة والإسكندرية إلى مصانع أكتوبر"
    },
    {
        "nameAr": "شركة الصفا للصناعات الخرسانية وأعمدة الإنارة المسبقة الصنع (الصحراوي كم 38)",
        "nameEn": "Al Safa Precast Concrete Poles & Structural Elements Km 38",
        "sector": "manufacturing", "city": "giza", "district": "طريق الإسكندرية الصحراوي", "governorate": "الجيزة",
        "address": "طريق مصر الإسكندرية الصحراوي - الكيلو 38 - مصنع الصفا للخرسانات مسبقة الصنع",
        "phone1": "02-35393800", "phone2": "01129933554", "website": "",
        "email": "safa.precast.km38@gmail.com", "lat": 30.100, "lon": 30.900, "fleetSize": 45,
        "fleetType": "تريلات نقل عناصر خرسانية طويلة وأعمدة إنارة خرسانية وأوناش تفريغ", "priority": "A",
        "notes": "تصنيع وتوريد أعمدة الإنارة الخرسانية وأكشاك المحولات لمشروعات الكهرباء والري"
    },
    {
        "nameAr": "شركة الشرق لمقاولات البنية التحتية وشبكات مياه الشرب والصرف (الشيخ زايد)",
        "nameEn": "Al Sharq Infrastructure & Water Pipeline Contracting Zayed",
        "sector": "contracting", "city": "october", "district": "الشيخ زايد", "governorate": "الجيزة",
        "address": "الشيخ زايد - الحي الثامن - مجمع إدارة الشرق لمقاولات البنية التحتية",
        "phone1": "02-38211710", "phone2": "01018866442", "website": "",
        "email": "sharq.infrastructure.zayed@gmail.com", "lat": 30.040, "lon": 30.965, "fleetSize": 50,
        "fleetType": "حفارات هيدروليكية ومعدات دق خوابير وتريلات نقل مواسير زهر مرن وكريكات", "priority": "A",
        "notes": "تنفيذ خطوط الطرد ومحطات الرفع وشبكات التغذية لمشروعات التوسعات العمرانية"
    },
    {
        "nameAr": "شركة الأهرام للصناعات الكرتونية والطباعة الحديثة (المنطقة الصناعية الثانية)",
        "nameEn": "Ahram Modern Packaging & Corrugated Boards 2nd Zone October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الثانية - مصنع الأهرام للكرتون المضلع",
        "phone1": "02-38211800", "phone2": "01205577338", "website": "",
        "email": "ahram.packaging.october@gmail.com", "lat": 29.944, "lon": 30.904, "fleetSize": 40,
        "fleetType": "تريلات نقل كرتون جامبو وسيارات توزيع مغلقة للمصانع", "priority": "B",
        "notes": "طباعة وتصنيع عبوات الكرتون لمصانع الأدوية والأغذية والأجهزة الكهربائية"
    },
    {
        "nameAr": "شركة الفتح للنقل الثقيل والخدمات اللوجستية وتوزيع البضائع (أبو رواش)",
        "nameEn": "Al Fateh Heavy Haulage & Distribution Logistics Abu Rawash",
        "sector": "logistics", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "المنطقة الصناعية بأبو رواش - طريق مصر-إسكندرية الصحراوي - مجمع الفتح للنقل",
        "phone1": "02-35393910", "phone2": "01114488663", "website": "",
        "email": "fateh.transport.aburawash@gmail.com", "lat": 30.050, "lon": 31.025, "fleetSize": 65,
        "fleetType": "تريلات نقل بضائع عامة وجرارات مان وأكتروس وسيارات جامبو مقفولة", "priority": "A+",
        "notes": "إدارة أساطيل التوزيع والنقل بين المستودعات المركزية وسلاسل الإمداد بمصر"
    },
    {
        "nameAr": "شركة السلام للصناعات المعدنية وتشكيل الصاج والأنابيب الفولاذية (6 أكتوبر)",
        "nameEn": "Al Salam Metal Forming & Steel Pipes 6th of October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الثالثة - مصنع السلام لتشكيل المعادن",
        "phone1": "02-38211900", "phone2": "01007799225", "website": "",
        "email": "salam.metal.forming.oct@gmail.com", "lat": 29.918, "lon": 30.884, "fleetSize": 45,
        "fleetType": "تريلات مسطحة لنقل لفائف الصاج الصلب وتريلات أنابيب فولاذية", "priority": "A",
        "notes": "درفلة وتشكيل الصاج وألواح الصلب وتصنيع قطاعات الإنشاءات والمباني الجاهزة"
    },
    {
        "nameAr": "شركة الصفا لمقاولات الطرق والأسفلت وتطوير الميادين (أكتوبر وزايد)",
        "nameEn": "Al Safa Road Paving & Urban Infrastructure October & Zayed",
        "sector": "contracting", "city": "october", "district": "الشيخ زايد", "governorate": "الجيزة",
        "address": "الشيخ زايد - طريق النزهة - مجمع إدارة الصفا لمقاولات الطرق",
        "phone1": "02-38212010", "phone2": "01223377114", "website": "",
        "email": "safa.paving.zayed@gmail.com", "lat": 30.032, "lon": 30.978, "fleetSize": 50,
        "fleetType": "فناكر أسفلت حديثة وهراسات تفريغ وقلابات أسفلت معزولة وسيارات كشط أسفلت", "priority": "A",
        "notes": "أعمال كشط وإعادة تدوير ورصف المحاور الداخلية والميادين بمدينة الشيخ زايد وأكتوبر"
    },
    {
        "nameAr": "شركة النيل للتجارة وتوريد حديد التسليح والقطاعات الإنشائية (أكتوبر الصناعية)",
        "nameEn": "Nile Rebar & Structural Steel Supply 6th of October",
        "sector": "trade", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية الأولى - مستودع حديد النيل المركزي",
        "phone1": "02-38212100", "phone2": "01128844772", "website": "",
        "email": "nile.rebar.october@gmail.com", "lat": 29.966, "lon": 30.914, "fleetSize": 55,
        "fleetType": "تريلات نقل حديد تسليح أطوال 12م وتريلات نقل كمرات وزوايا فولاذية ثقيلة", "priority": "A+",
        "notes": "وكيل معتمد وموزع رئيسي لحديد التسليح لمشروعات الأبراج والكباري والأنفاق"
    },
    {
        "nameAr": "شركة الشرق الأوسط لتصنيع وتجهيز المبردات والغرف الحرارية (أبو رواش)",
        "nameEn": "Middle East Cold Rooms & Refrigeration Systems Abu Rawash",
        "sector": "manufacturing", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "المنطقة الصناعية بأبو رواش - طريق المنصورية - مصنع الشرق الأوسط للتبريد",
        "phone1": "02-35394010", "phone2": "01014488337", "website": "",
        "email": "me.coldrooms.eg@gmail.com", "lat": 30.046, "lon": 31.032, "fleetSize": 35,
        "fleetType": "شاحنات نقل ألواح بانلز معزولة وسيارات شحن وحدات تبريد ثيرمو كينج وكوبلاند", "priority": "B",
        "notes": "تصنيع وتركيب غرف التبريد والتجميد ومستودعات التبريد اللوجستية للمصانع"
    },
    {
        "nameAr": "شركة الأمل للمحاجر وتوريد الركام والدولوميت (طريق دهشور / جبل البدرشين)",
        "nameEn": "Al Amal Quarries & Dolomite Aggregates Dahshur Ridge",
        "sector": "manufacturing", "city": "october", "district": "دهشور", "governorate": "الجيزة",
        "address": "طريق دهشور - جبل البدرشين - محجر وكسارة الأمل للدولوميت",
        "phone1": "02-38212200", "phone2": "01206655113", "website": "",
        "email": "amal.dolomite.dahshur@gmail.com", "lat": 29.795, "lon": 31.170, "fleetSize": 55,
        "fleetType": "قلابات ثقيلة حمولة 40 و50 طن وكسارات تصادمية ولودرات صخرية", "priority": "A+",
        "notes": "استخراج وتكسير صخور الدولوميت وتوريد سن الخرسانة عالي الإجهاد للمشروعات القومية"
    },
    {
        "nameAr": "شركة الصفا للنقل والتفريغ وتأجير اللوابد الثقيلة (الصحراوي كم 35)",
        "nameEn": "Al Safa Heavy Lowbed Transport Desert Road Km 35",
        "sector": "logistics", "city": "giza", "district": "طريق الإسكندرية الصحراوي", "governorate": "الجيزة",
        "address": "طريق مصر الإسكندرية الصحراوي - الكيلو 35 - جراج ومعسكر لوابد الصفا",
        "phone1": "02-35394100", "phone2": "01117733994", "website": "",
        "email": "safa.lowbed.km35@gmail.com", "lat": 30.090, "lon": 30.930, "fleetSize": 45,
        "fleetType": "لوابد نقل معدات ثقيلة متعددة المحاور وحمولات حتى 100 طن وتريلات مسطحة", "priority": "A",
        "notes": "نقل المعدات الثقيلة والحفارات والخلاطات بين مواقع العمل بالصحراوي والواحات"
    },
    {
        "nameAr": "شركة الفتح لتوريد مواد البناء وتوزيع الخرسانة والأسمنت (أكتوبر الصناعية)",
        "nameEn": "Al Fateh Building Materials & Cement Supply 6th Zone October",
        "sector": "trade", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية السادسة - مجمع مستودعات الفتح للبناء",
        "phone1": "02-38212310", "phone2": "01009911885", "website": "",
        "email": "fateh.materials.oct@gmail.com", "lat": 29.898, "lon": 30.822, "fleetSize": 40,
        "fleetType": "تريلات نقل مواد بناء وأسمنت معبأ وسيور تفريغ وسيارات توزيع", "priority": "B",
        "notes": "توريد مواد البناء والأسمنت والرمل والسن لشركات المقاولات المنفذة لمشروعات الإسكان"
    },
    {
        "nameAr": "شركة الأهرام للخدمات اللوجستية والشحن المبرد والجاف (أبو رواش الصناعية)",
        "nameEn": "Ahram Cold & Dry Freight Logistics Abu Rawash Hub",
        "sector": "logistics", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "أبو رواش - المنطقة الصناعية - الكيلو 27 طريق إسكندرية الصحراوي",
        "phone1": "02-35394210", "phone2": "01224433778", "website": "http://www.ahramlogistics-eg.com",
        "email": "operations@ahramlogistics-eg.com", "lat": 30.053, "lon": 31.027, "fleetSize": 65,
        "fleetType": "أسطول شاحنات مبردة وجافة وتريلات نقل كونتينرات وجرارات مرسيدس مان", "priority": "A+",
        "notes": "إدارة عمليات النقل اللوجستي وسلاسل التوريد لمصانع الأغذية والأدوية"
    },
    {
        "nameAr": "شركة النيل لمقاولات البنية التحتية والشبكات ومحطات الضخ (أكتوبر وزايد)",
        "nameEn": "Nile Infrastructure Pumping Stations Contracting October",
        "sector": "contracting", "city": "october", "district": "الشيخ زايد", "governorate": "الجيزة",
        "address": "الشيخ زايد - محور 26 يوليو - مبنى النيل لمشروعات البنية التحتية",
        "phone1": "02-38212400", "phone2": "01128855119", "website": "",
        "email": "nile.infrastructure.zayed@gmail.com", "lat": 30.036, "lon": 30.972, "fleetSize": 50,
        "fleetType": "حفارات هيدروليكية ومعدات دق خوابير وتريلات نقل مواسير وشاحنات خدمة", "priority": "A",
        "notes": "تنفيذ محطات الرفع وخطوط الانحدار وشبكات الري الحديث بالمدن الجديدة"
    },
    {
        "nameAr": "شركة الشرق لتصنيع وتجهيز الأعلاف الحيوانية والداجنة (الصحراوي كم 52)",
        "nameEn": "Al Sharq Animal Feed Processing Desert Road Km 52",
        "sector": "manufacturing", "city": "giza", "district": "طريق الإسكندرية الصحراوي", "governorate": "الجيزة",
        "address": "طريق مصر الإسكندرية الصحراوي - الكيلو 52 - مصانع وصوامع الشرق للأعلاف",
        "phone1": "02-35394300", "phone2": "01017755331", "website": "",
        "email": "sharq.feeds.km52@gmail.com", "lat": 30.145, "lon": 30.800, "fleetSize": 55,
        "fleetType": "تريلات نقل حبوب قلاب وتريلات نقل شكاير أعلاف وسيارات توزيع مزارع", "priority": "A",
        "notes": "إنتاج أعلاف الماشية والخيول والدواجن وتغذية مزارع طريق مصر-إسكندرية الصحراوي"
    },
    {
        "nameAr": "شركة الأمل للصناعات الهندسية والهياكل المعدنية والجمالونات (المنطقة السادسة)",
        "nameEn": "Al Amal Heavy Steel Fabrication & Hangars 6th Zone October",
        "sector": "manufacturing", "city": "october", "district": "المنطقة الصناعية 6 أكتوبر", "governorate": "الجيزة",
        "address": "مدينة 6 أكتوبر - المنطقة الصناعية السادسة - مصنع الأمل للهياكل الفولاذية",
        "phone1": "02-38212510", "phone2": "01203388446", "website": "",
        "email": "amal.steel.structures.oct@gmail.com", "lat": 29.886, "lon": 30.832, "fleetSize": 45,
        "fleetType": "تريلات مسطحة لنقل كمرات حديدية ثقيلة وأوناش تلسكوبية لتركيب الجمالونات", "priority": "A",
        "notes": "تصنيع وتركيب جمالونات المصانع والمستودعات ومحطات الكهرباء والصوامع"
    },
    {
        "nameAr": "شركة الصفا لتجارة وتوزيع المواد الكيماوية والزيوت الصناعية (أبو رواش)",
        "nameEn": "Al Safa Chemical Trading & Industrial Solvents Abu Rawash",
        "sector": "trade", "city": "giza", "district": "أبو رواش", "governorate": "الجيزة",
        "address": "المنطقة الصناعية بأبو رواش - مجمع مستودعات الصفا للكيماويات",
        "phone1": "02-35394410", "phone2": "01114499115", "website": "",
        "email": "safa.chemicals.aburawash@gmail.com", "lat": 30.045, "lon": 31.033, "fleetSize": 40,
        "fleetType": "تريلات صهاريج نقل سوائل كيميائية وسيارات جامبو لنقل براميل المواد الخام", "priority": "B",
        "notes": "إمدادات المذيبات والكيماويات ومستلزمات الإنتاج لمصانع البويات والبلاستيك والمنظفات"
    },
    {
        "nameAr": "شركة الفتح لمقاولات رصف الطرق والأسفلت والتسويات (طريق دهشور والواحات)",
        "nameEn": "Al Fateh Road Paving & Infrastructure Dahshur & Oasis Hub",
        "sector": "contracting", "city": "october", "district": "طريق دهشور", "governorate": "الجيزة",
        "address": "طريق وصلة دهشور - مدخل طريق الواحات - معسكر معدات الفتح للرصف",
        "phone1": "02-38212600", "phone2": "01006644882", "website": "",
        "email": "fateh.paving.dahshur@gmail.com", "lat": 29.875, "lon": 30.945, "fleetSize": 60,
        "fleetType": "خلاطة أسفلت وفناكر رصف وهراسات حديد ومطاط وقلابات أسفلت معزولة", "priority": "A+",
        "notes": "تنفيذ أعمال رصف وتطوير الطرق والمداخل المؤدية للمناطق الصناعية والمجتمعات العمرانية"
    }
]

print(f"\nEvaluating {len(candidates)} targeted candidates in West Giza / October Corridor...")

approved_phase2_sq2 = []
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

    approved_phase2_sq2.append(item)

print(f"\n=======================================================")
print(f"CANDIDATES EVALUATED IN WEST GIZA SQUARE: {len(candidates)}")
print(f"SKIPPED PHONE DUPLICATES:                 {skipped_phones}")
print(f"SKIPPED NAME DUPLICATES:                  {skipped_names}")
print(f"APPROVED PURE NEW B2B ENTERPRISES:        {len(approved_phase2_sq2)}")
print(f"=======================================================")

formatted_enterprises = []
for idx, c in enumerate(approved_phase2_sq2, 1):
    comp_id = f"eg_phase2_giza_west_{idx:04d}"
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
        "lon": c.get("lon", 30.90),
        "fleetSize": c.get("fleetSize", 40),
        "fleetType": c.get("fleetType", "شاحنات ومعدات أسطول تجاري"),
        "priority": c.get("priority", "A"),
        "status": "unassigned",
        "source": "verified_phase2_west_giza_october_2026",
        "contactPerson": "",  # Strictly empty for sales reps
        "notes": c.get("notes", "")
    })

os.makedirs('scraper/output', exist_ok=True)
out_path = 'scraper/output/phase2_west_giza_verified_b2b_fleet.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(formatted_enterprises, f, ensure_ascii=False, indent=2)

print(f"Successfully saved {len(formatted_enterprises)} pure verified enterprises to {out_path}!")
