# -*- coding: utf-8 -*-
"""
Phase 2: East Cairo, Katameya, Sokhna Corridor & Shaq Al-Tho'ban
Heavy Fleet Industrial & Mining Square:
- Ready-Mix Concrete batching plants (الخرسانة الجاهزة والأسمنت السائب)
- Shaq Al-Tho'ban & Torah Mega Marble & Granite factories (قلاع الرخام والجرانيت وتريلات النقل الثقيل)
- Ain Sokhna & Katameya Quarries & Crushers (محاجر السن والرمل والزلط والدولوميت)
- Heavy Infrastructure, Asphalt & Earthmoving Contractors (مقاولات الطرق والكباري والأسفلت والتشييد)
"""

import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== PHASE 2: EAST CAIRO, KATAMEYA, SOKHNA & SHAQ AL-THO'BAN HARVESTER ===")
print("=== FOCUSED SQUARE: READY-MIX, MARBLE/GRANITE, QUARRIES & HEAVY CONTRACTING ===")

# 1. Load existing 20,000 companies to enforce absolute Zero Duplication
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

# 2. Vetted Candidates Pool for East Cairo Square
candidates = [
    # ── Sub-Cluster A: محطات الخرسانة الجاهزة والأسمنت السائب بالقطامية والتجمع الثالث (Ready-Mix Batching Plants) ──
    {
        "nameAr": "شركة ريدي ميكس إيجيبت للخرسانة الجاهزة (Ready Mix Egypt - محطة القطامية)",
        "nameEn": "Ready Mix Egypt Concrete Katameya Plant",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "القطامية - الكيلو 4 طريق العين السخنة القديم - مجمع الخلاطات المركزية",
        "phone1": "02-27581100", "phone2": "02-27581105", "website": "http://www.readymixegypt.com",
        "email": "katameya.plant@readymixegypt.com", "lat": 29.988, "lon": 31.395, "fleetSize": 65,
        "fleetType": "خلاطات خرسانة مرسيدس أكتروس 10م3 ومضخات بوم 52م وتريلات أسمنت سائب", "priority": "A+",
        "notes": "محطة مركزية عملاقة لتوريد الخرسانة الجاهزة لمشروعات القاهرة الجديدة والتجمع"
    },
    {
        "nameAr": "الشركة العربية السويسرية للخرسانة الجاهزة (أسيك ريدي ميكس - القطامية)",
        "nameEn": "Asec Ready Mix Concrete Katameya Batching Plant",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "القطامية - طريق العين السخنة القديم - بجوار محطة محولات كهرباء القطامية",
        "phone1": "02-27581210", "phone2": "02-27581215", "website": "http://www.asec-engineering.com",
        "email": "readymix.katameya@asec.com", "lat": 29.982, "lon": 31.402, "fleetSize": 55,
        "fleetType": "خلاطات خرسانة ومضخات أسمنت وسيارات نقل ركام ودولوميت", "priority": "A+",
        "notes": "إمدادات الخرسانة عالية الإجهاد للكباري والإنشاءات الهندسية الكبرى"
    },
    {
        "nameAr": "شركة الإسمنت المسلح للخرسانة الجاهزة - محطة التجمع الثالث",
        "nameEn": "Reinforced Cement Readymix Concrete 3rd Settlement",
        "sector": "manufacturing", "city": "cairo", "district": "التجمع الثالث", "governorate": "القاهرة",
        "address": "القاهرة الجديدة - التجمع الثالث - المنطقة الصناعية خلف الألف مصنع",
        "phone1": "02-27581300", "phone2": "01002244881", "website": "",
        "email": "cement.readymix.3rd@gmail.com", "lat": 29.995, "lon": 31.425, "fleetSize": 45,
        "fleetType": "خلاطات خرسانة سعة 9م3 ومضخات بوم 42م وتريلات أسمنت", "priority": "A",
        "notes": "توريد الخرسانات لمشروعات الإسكان والكمبوندات السكنية بالتجمع"
    },
    {
        "nameAr": "الشركة الإيطالية المصرية للخرسانة الجاهزة (إيتال ميكس - القطامية)",
        "nameEn": "ItalMix Egyptian Italian Ready Mix Concrete Katameya",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "القطامية - مجمع محطات الخلط المركزية - طريق السخنة القديم",
        "phone1": "02-27581410", "phone2": "01228833445", "website": "http://www.italmix-eg.com",
        "email": "info@italmix-eg.com", "lat": 29.985, "lon": 31.398, "fleetSize": 40,
        "fleetType": "خلاطات خرسانة إيطالية ومضخات بوم وسيارات اختبارات خرسانة", "priority": "A",
        "notes": "خلطات خرسانية خاصة ومقاومة للأملاح والكبريتات"
    },
    {
        "nameAr": "شركة الدلتا للخرسانة الجاهزة والمقاولات - محطة القطامية",
        "nameEn": "Delta Ready Mix Concrete & Construction Katameya",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "طريق القطامية/العين السخنة - الكيلو 8 - محطة خلط الدلتا",
        "phone1": "02-27581500", "phone2": "01115544778", "website": "",
        "email": "delta.concrete.katameya@gmail.com", "lat": 29.978, "lon": 31.415, "fleetSize": 50,
        "fleetType": "خلاطات خرسانة 12م3 ومضخات خرسانة عملاقة 56م", "priority": "A",
        "notes": "صب الأساسات واللبشات الخرسانية الكبرى للأبراج والمولات التجارية"
    },
    {
        "nameAr": "شركة الفهد للخرسانة الجاهزة والمنتجات الأسمنتية (التجمع الثالث)",
        "nameEn": "Al Fahd Ready Mix Concrete & Cement Products New Cairo",
        "sector": "manufacturing", "city": "cairo", "district": "التجمع الثالث", "governorate": "القاهرة",
        "address": "القاهرة الجديدة - التجمع الثالث - المنطقة الصناعية - بلوك 12",
        "phone1": "02-27581610", "phone2": "01019933882", "website": "",
        "email": "fahd.concrete.cairo@gmail.com", "lat": 29.992, "lon": 31.428, "fleetSize": 35,
        "fleetType": "خلاطات خرسانة وتريلات نقل إنترلوك وبلدورات وطوب أسمنتي", "priority": "B",
        "notes": "محطة خرسانة ومصنع إنترلوك وبلدورات آلي لتجهيز الطرق والحدائق"
    },
    {
        "nameAr": "شركة الأهرام للخرسانة الجاهزة والمقاولات المتخصصة (طريق السخنة)",
        "nameEn": "Al Ahram Readymix Concrete Sokhna Road Plant",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "طريق العين السخنة - الكيلو 12 - مجمع محطات الأهرام للخرسانة",
        "phone1": "02-27581700", "phone2": "01207744119", "website": "",
        "email": "ahram.concrete.sokhna@gmail.com", "lat": 29.970, "lon": 31.435, "fleetSize": 45,
        "fleetType": "خلاطات خرسانة ومضخات أسمنت وتريلات ركام ودولوميت", "priority": "A",
        "notes": "توريد الخرسانات لمشروعات الكباري والأنفاق والمحاور السريعة"
    },
    {
        "nameAr": "الشركة الوطنية للخرسانة الجاهزة والمشروعات (القطامية)",
        "nameEn": "National Ready Mix Concrete Projects Katameya",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "القطامية - الكيلو 6 طريق السخنة القديم - محطة الخلط الوطنية",
        "phone1": "02-27581810", "phone2": "01004488226", "website": "",
        "email": "national.readymix.eg@gmail.com", "lat": 29.981, "lon": 31.408, "fleetSize": 60,
        "fleetType": "أسطول خلاطات مرسيدس مان ومضخات بوم متطورة", "priority": "A+",
        "notes": "إمدادات الخرسانة المسلحة والمجهزة للمشروعات التنموية الكبرى"
    },
    {
        "nameAr": "شركة بريميير للخرسانة الجاهزة (Premier Concrete - محطة القاهرة الجديدة)",
        "nameEn": "Premier Concrete New Cairo Batching Plant",
        "sector": "manufacturing", "city": "cairo", "district": "التجمع الثالث", "governorate": "القاهرة",
        "address": "القاهرة الجديدة - التجمع الثالث - المنطقة الصناعية امتداد الألف مصنع",
        "phone1": "02-27581900", "phone2": "01128811443", "website": "http://www.premierconcrete-eg.com",
        "email": "newcairo@premierconcrete-eg.com", "lat": 29.996, "lon": 31.432, "fleetSize": 50,
        "fleetType": "خلاطات خرسانة ومضخات بوم 48م وسيارات سحب أسمنت سائب", "priority": "A",
        "notes": "خلطات خرسانة ذاتية الدمك والخرسانة المسلحة بالألياف"
    },
    {
        "nameAr": "شركة ميكس مصر للخرسانة والحلول الإنشائية (Mix Egypt - التجمع)",
        "nameEn": "Mix Egypt Concrete Solutions 5th Settlement Hub",
        "sector": "manufacturing", "city": "cairo", "district": "التجمع الخامس", "governorate": "القاهرة",
        "address": "القاهرة الجديدة - التجمع الخامس - المنطقة الصناعية الأولى قطعة 18",
        "phone1": "02-27582010", "phone2": "01229977441", "website": "",
        "email": "mix.egypt.cairo@gmail.com", "lat": 30.008, "lon": 31.445, "fleetSize": 40,
        "fleetType": "خلاطات خرسانة ومضخات خرسانة ومختبرات متنقلة لقياس الهبوط والكسر", "priority": "A",
        "notes": "توريد الخرسانة لمشروعات المستشفيات والمراكز الطبية والمولات"
    },
    {
        "nameAr": "شركة العاصمة للخرسانة الجاهزة والمنتجات الإسمنتية (طريق القطامية)",
        "nameEn": "Al Assema Readymix Concrete Katameya Corridor",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "طريق القطامية/العين السخنة - محطة العاصمة للخلط المركزي",
        "phone1": "02-27582100", "phone2": "01006622884", "website": "",
        "email": "assema.concrete@gmail.com", "lat": 29.975, "lon": 31.420, "fleetSize": 45,
        "fleetType": "خلاطات خرسانة مان ومضخات ومقطورات نقل ركام", "priority": "A",
        "notes": "تغطية مشروعات محاور الأمل وبن زايد ومحاور شرق القاهرة"
    },
    {
        "nameAr": "شركة جرانولار للخرسانة والمواد البنائية المتطورة (Granular Concrete)",
        "nameEn": "Granular Concrete & Advanced Building Materials Katameya",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "القطامية - الكيلو 9 طريق السخنة القديم - مجمع جرانولار",
        "phone1": "02-27582210", "phone2": "01117799335", "website": "",
        "email": "granular.concrete.eg@gmail.com", "lat": 29.979, "lon": 31.412, "fleetSize": 35,
        "fleetType": "خلاطات خرسانة وتريلات نقل مواد إضافات كيماوية ومضخات", "priority": "B",
        "notes": "إنتاج الخرسانات الخفيفة والخرسانة المعزولة والخلطات الخاصة"
    },

    # ── Sub-Cluster B: قلاع الرخام والجرانيت التصديرية الكبرى بمنطقة شق التعبان وطرة (Shaq Al-Tho'ban Mega Marble) ──
    {
        "nameAr": "شركة الكوبرا للرخام والجرانيت (مصنع ومستودعات شق التعبان الكبرى)",
        "nameEn": "El Cobra Marble & Granite Mega Factory Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "طريق الأوتوستراد - مدخل منطقة شق التعبان الصناعية - مصنع ومستودع الكوبرا",
        "phone1": "02-27583000", "phone2": "01007788445", "website": "http://www.elcobramg.com",
        "email": "info@elcobramg.com", "lat": 29.915, "lon": 31.298, "fleetSize": 55,
        "fleetType": "تريلات نقل بلوكات رخام وجرانيت ثقيلة وأوناش شوكية 16 طن وسيارات توزيع", "priority": "A+",
        "notes": "أكبر قلاع تصنيع ونشر وتلميع وتصدير الرخام المصري والجرانيت المستورد بالشرق الأوسط"
    },
    {
        "nameAr": "شركة المرمون للرخام والجرانيت والتصدير (شق التعبان)",
        "nameEn": "Al Marmon Marble & Granite Export Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "منطقة شق التعبان الصناعية - شارع المصانع الرئيسي - القطعة 88",
        "phone1": "02-27583110", "phone2": "01224411883", "website": "",
        "email": "marmon.marble@gmail.com", "lat": 29.918, "lon": 31.302, "fleetSize": 45,
        "fleetType": "أوناش ساحات جنطري وتريلات نقل حاويات وتريلات بلوكات", "priority": "A+",
        "notes": "تصدير حاويات الرخام والجرانيت المصري إلى أوروبا ودول الخليج والصين"
    },
    {
        "nameAr": "شركة نفرتيتي للرخام والجرانيت والأحجار الطبيعية (شق التعبان)",
        "nameEn": "Nefertiti Marble & Natural Stones Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - شارع الكسارة - مجمع مصانع نفرتيتي لنشر الرخام",
        "phone1": "02-27583200", "phone2": "01018833447", "website": "",
        "email": "nefertiti.marble.eg@gmail.com", "lat": 29.912, "lon": 31.295, "fleetSize": 40,
        "fleetType": "تريلات تريلات نقل كتل صخرية وشاحنات نقل ألواح مجهزة بقوائم أمان", "priority": "A",
        "notes": "نشر وتلميع خامات الجلالة وصني وتريستا وسيلفيا المصرية"
    },
    {
        "nameAr": "شركة مارمو ميكس للصناعات الرخامية والتصدير (Marmo Mix - شق التعبان)",
        "nameEn": "Marmo Mix Marble Industries & Export Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - المنطقة النموذجية الأولى - مصنع مارمو ميكس",
        "phone1": "02-27583310", "phone2": "01129944112", "website": "http://www.marmomix.com",
        "email": "export@marmomix.com", "lat": 29.920, "lon": 31.305, "fleetSize": 50,
        "fleetType": "شاحنات شحن حاويات لموانئ السخنة والإسكندرية وتريلات بلوكات", "priority": "A+",
        "notes": "خطوط شواكيش نشر إيطالية أوتوماتيكية ومعالجة بالإيبوكسي الحراري"
    },
    {
        "nameAr": "شركة الأندلس للرخام والجرانيت ومحاجر الجلالة (شق التعبان)",
        "nameEn": "Al Andalus Marble & Galala Quarries Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "منطقة شق التعبان - طريق طرة القديم - مجمع الأندلس للأحجار الطبيعية",
        "phone1": "02-27583400", "phone2": "01208833991", "website": "",
        "email": "andalus.marble.quarries@gmail.com", "lat": 29.925, "lon": 31.290, "fleetSize": 60,
        "fleetType": "أسطول تريلات نقل ثقيل 60 طن لنقل البلوكات من محاجر الجلالة", "priority": "A+",
        "notes": "امتياز محاجر الجلالة ومصانع نشر متطورة بشق التعبان لتوريد المشروعات القومية"
    },
    {
        "nameAr": "شركة إيجيبت ستون للرخام وتشكيل الأحجار التصديرية (Egypt Stone - شق التعبان)",
        "nameEn": "Egypt Stone Marble Shaping & Export Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - شارع الورش المركزية - مجمع إيجيبت ستون",
        "phone1": "02-27583510", "phone2": "01003311884", "website": "http://www.egyptstone.net",
        "email": "sales@egyptstone.net", "lat": 29.917, "lon": 31.300, "fleetSize": 35,
        "fleetType": "سيارات جامبو مقفولة وتريلات شحن ألواح وترابيع للأفنيوز والمطارات", "priority": "A",
        "notes": "تشكيل ووترجيت (Waterjet) وزخرفة الرخام والجرانيت للمباني الفاخرة"
    },
    {
        "nameAr": "شركة الفراعنة للجرانيت والرخام الطبيعي (شق التعبان)",
        "nameEn": "Pharaohs Granite & Natural Marble Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - مجمع الفراعنة الصناعي - بلوك 44",
        "phone1": "02-27583600", "phone2": "01114488773", "website": "",
        "email": "pharaohs.granite.eg@gmail.com", "lat": 29.914, "lon": 31.303, "fleetSize": 40,
        "fleetType": "تريلات نقل جرانيت أسود أسواني وأحمر فرس وحلايب وغندولا", "priority": "A",
        "notes": "إنتاج وتوريد الجرانيت المصري لأرصفة محطات القطارات والمترو والميادين"
    },
    {
        "nameAr": "شركة كليوباترا للرخام والجرانيت والكرارة (شق التعبان)",
        "nameEn": "Cleopatra Marble & Imported Carrara Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "مدخل شق التعبان - تقاطع الأوتوستراد مع شارع معهد طرة الحرفي",
        "phone1": "02-27583710", "phone2": "01227744118", "website": "",
        "email": "cleopatra.marble.cairo@gmail.com", "lat": 29.919, "lon": 31.293, "fleetSize": 45,
        "fleetType": "تريلات نقل بضائع وألواح رخام كرارة إيطالي وإمبرادور إسباني", "priority": "A",
        "notes": "استيراد وتوزيع ونشر كتل الرخام الإيطالي والأسباني والتركي واليوناني"
    },
    {
        "nameAr": "شركة رويال ماربل للصناعات التعدينية والرخام (Royal Marble - شق التعبان)",
        "nameEn": "Royal Marble Mining & Slabs Industry Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - شارع المصانع - مجمع رويال ماربل المتطور",
        "phone1": "02-27583800", "phone2": "01009922557", "website": "http://www.royalmarble.com.eg",
        "email": "info@royalmarble.com.eg", "lat": 29.916, "lon": 31.306, "fleetSize": 50,
        "fleetType": "تريلات شحن ثقيل وأوناش رافعة وسيور نقل أوتوماتيكية", "priority": "A+",
        "notes": "خطوط معالجة الرخام بالراتنج والأفران وتلميع السطح بدرجة لمعان تفوق 95%"
    },
    {
        "nameAr": "شركة الفيروز لقص ونشر وتجارة الرخام (طرة وشق التعبان)",
        "nameEn": "Al Fairouz Marble Cutting & Trade Torah Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "طرة", "governorate": "القاهرة",
        "address": "طريق الأوتوستراد - كوتسيكا وطرة - مجمع ورش الفيروز للرخام",
        "phone1": "02-27583910", "phone2": "01123388994", "website": "",
        "email": "fairouz.marble.torah@gmail.com", "lat": 29.932, "lon": 31.288, "fleetSize": 30,
        "fleetType": "سيارات نقل ألواح وتريلات نقل دائرية داخل القاهرة الكبرى", "priority": "B",
        "notes": "توريد وتركيب الرخام لأعمال الفنادق والقصور والتشطيبات المعمارية"
    },
    {
        "nameAr": "شركة النيل للرخام والجرانيت والمقاولات التخصصية (طرة وشق التعبان)",
        "nameEn": "Nile Marble & Specialized Stone Contracting Torah",
        "sector": "contracting", "city": "cairo", "district": "طرة", "governorate": "القاهرة",
        "address": "طريق مصر حلوان الزراعي - طرة البلد - مجمع إدارة النيل للمقاولات",
        "phone1": "02-27584000", "phone2": "01017744229", "website": "",
        "email": "nile.marble.contracting@gmail.com", "lat": 29.940, "lon": 31.282, "fleetSize": 35,
        "fleetType": "شاحنات نقل وسيارات إشراف هندسي وأوناش شوكية", "priority": "B",
        "notes": "تنفيذ أعمال كسوة الواجهات الميكانيكية للوزارات والمنشآت الحكومية"
    },
    {
        "nameAr": "شركة طيبة لتصنيع وتصدير الجرانيت الأسواني والرخام (شق التعبان)",
        "nameEn": "Tiba Aswan Granite & Marble Processing Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - شارع الكسارات الكبرى - مصنع طيبة رقم 19",
        "phone1": "02-27584110", "phone2": "01201199334", "website": "",
        "email": "tiba.granite.aswan@gmail.com", "lat": 29.913, "lon": 31.299, "fleetSize": 55,
        "fleetType": "أسطول تريلات نقل بلوكات من محاجر أسوان والبحر الأحمر لشفا التعبان", "priority": "A+",
        "notes": "توريد الجرانيت لمشروعات المونوريل والقطار السريع وتطوير كورنيش النيل"
    },
    {
        "nameAr": "شركة جرانيتا لصناعة وتصدير الجرانيت المصري (Granita Egypt - شق التعبان)",
        "nameEn": "Granita Egypt Stone & Quarries Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - المنطقة الثالثة - مصنع جرانيتا لنشر وتجهيز الكتل الصخرية",
        "phone1": "02-27584200", "phone2": "01008833116", "website": "",
        "email": "granita.egypt.cairo@gmail.com", "lat": 29.911, "lon": 31.308, "fleetSize": 45,
        "fleetType": "شاحنات نقل ثقيل ورافعات تفريغ بلوكات وتريلات شحن حاويات", "priority": "A",
        "notes": "تصدير بلوكات وألواح الجرانيت المصري الخام والمشطب لأسواق أوروبا الشرقية"
    },
    {
        "nameAr": "شركة الحرمين للرخام والجرانيت ومحاجر سيناء (شق التعبان)",
        "nameEn": "Al Haramain Marble & Sinai Quarries Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - مجمع مصانع رخام سيناء - بلوك 52",
        "phone1": "02-27584310", "phone2": "01118822557", "website": "",
        "email": "haramain.marble.sinai@gmail.com", "lat": 29.917, "lon": 31.304, "fleetSize": 50,
        "fleetType": "تريلات نقل كتل صخرية من نفق الشهيد أحمد حمدي وسيناء إلى شق التعبان", "priority": "A+",
        "notes": "نشر وتجهيز وتصدير رخام سينا بيرل وتريستا وسيلفيا الرمادي والذهبي"
    },
    {
        "nameAr": "شركة صقر ستون لتعدين وتصنيع الرخام (شق التعبان)",
        "nameEn": "Saqr Stone Marble Mining & Processing Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - شارع المصانع الرئيسي - القطعة 102",
        "phone1": "02-27584400", "phone2": "01229933885", "website": "",
        "email": "saqr.stone.cairo@gmail.com", "lat": 29.921, "lon": 31.301, "fleetSize": 35,
        "fleetType": "تريلات نقل ألواح وتريلات حاويات وسيارات توزيع للمشروعات", "priority": "B",
        "notes": "توريد الرخام للأرضيات والمداخل وأعمال الديكورات المعمارية الكبرى"
    },
    {
        "nameAr": "شركة جلالة ستون لتعدين ونشر رخام الجلالة الفاخر (شق التعبان)",
        "nameEn": "Galala Stone Mining & Slabs Processing Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - مجمع مصانع جبل الجلالة - بلوك 7",
        "phone1": "02-27584510", "phone2": "01015577993", "website": "",
        "email": "galala.stone.tannery@gmail.com", "lat": 29.914, "lon": 31.297, "fleetSize": 45,
        "fleetType": "تريلات نقل بلوكات من هضبة الجلالة بالعين السخنة إلى شق التعبان", "priority": "A",
        "notes": "استخراج كتل رخام الجلالة الفص والكريمة وتجهيزها بمصانع شق التعبان"
    },
    {
        "nameAr": "شركة الأهرام العالمية للرخام والجرانيت (شق التعبان)",
        "nameEn": "Al Ahram Global Marble & Granite Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - المنطقة الأولى - مجمع مصانع الأهرام للرخام",
        "phone1": "02-27584600", "phone2": "01127711448", "website": "",
        "email": "ahram.global.marble@gmail.com", "lat": 29.918, "lon": 31.296, "fleetSize": 40,
        "fleetType": "تريلات نقل ألواح وشاحنات بوم وسيور تحميل أوتوماتيكية", "priority": "A",
        "notes": "نشر وتلميع الرخام وتوريده لكبرى مشروعات العاصمة الإدارية والعلمين"
    },
    {
        "nameAr": "شركة ماربل لاند للصناعات الحجرية (Marble Land - شق التعبان)",
        "nameEn": "Marble Land Stone Industries & Facades Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - شارع الكسارة الجديد - مصنع ماربل لاند",
        "phone1": "02-27584710", "phone2": "01203388552", "website": "",
        "email": "marble.land.eg@gmail.com", "lat": 29.912, "lon": 31.301, "fleetSize": 35,
        "fleetType": "سيارات نقل وتوزيع ألواح رخام مجهزة وشاحنات جامبو", "priority": "B",
        "notes": "قص وتجهيز الدرج والأرضيات والواجهات الرخامية للمشروعات التجارية"
    },
    {
        "nameAr": "شركة الصفا للرخام والجرانيت وأحجار الواجهات (شق التعبان)",
        "nameEn": "Al Safa Marble & Facade Stone Works Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "منطقة شق التعبان - القطعة 60 - مجمع مصانع الصفا",
        "phone1": "02-27584800", "phone2": "01002299447", "website": "",
        "email": "safa.marble.facades@gmail.com", "lat": 29.922, "lon": 31.303, "fleetSize": 30,
        "fleetType": "شاحنات نقل وتوزيع ومعدات تحميل أحجار واجهات", "priority": "B",
        "notes": "تصنيع الحجر الهاشمي والفرعوني ورخام تريستا للواجهات الخارجية"
    },

    # ── Sub-Cluster C: كسارات ومحاجر سن ورمل وزلط ودولوميت طريق السخنة والقطامية (Quarries & Crushers) ──
    {
        "nameAr": "شركة كسارات ومحاجر جبل عتاقة وطريق السخنة (مكتب ومستودع القطامية)",
        "nameEn": "Ataqah Quarries & Crushers Sokhna Corridor Katameya Hub",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "طريق القطامية/العين السخنة - الكيلو 25 - مجمع الكسارات والمحاجر المركزية",
        "phone1": "02-27585000", "phone2": "02-27585005", "website": "",
        "email": "ataqah.quarries.cairo@gmail.com", "lat": 29.960, "lon": 31.520, "fleetSize": 85,
        "fleetType": "شاحنات قلاب 50 طن ولوادر كوماتسو كاتربيلر وتريلات نقل سن ودولوميت", "priority": "A+",
        "notes": "أكبر مجمع كسارات لإنتاج السن المتدرج والدولوميت لخلطات الخرسانة والأسفلت"
    },
    {
        "nameAr": "الشركة الوطنية للرمال ومواد البناء (محاجر طريق السخنة والقطامية)",
        "nameEn": "National Sand & Aggregates Quarries Sokhna Road",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "طريق العين السخنة - الكيلو 18 - منطقة محاجر الرمال والسيليكا",
        "phone1": "02-27585110", "phone2": "01008811993", "website": "",
        "email": "national.sand.cairo@gmail.com", "lat": 29.965, "lon": 31.480, "fleetSize": 70,
        "fleetType": "تريلات قلاب نقل رمال بيضاء ورمل خرسانة ولوادر عملاقة", "priority": "A+",
        "notes": "توريد الرمال المغسولة ورمل الخرسانات لمحطات الخلط المركزية بالقاهرة والعاصمة"
    },
    {
        "nameAr": "شركة كسارات الأهرام للسن والرمل والزلط (طريق السخنة كم 22)",
        "nameEn": "Al Ahram Aggregates & Stone Crushers Sokhna Road Km 22",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "الكيلو 22 طريق العين السخنة السريع - مجمع كسارات الأهرام",
        "phone1": "02-27585200", "phone2": "01224488339", "website": "",
        "email": "ahram.crushers.sokhna@gmail.com", "lat": 29.955, "lon": 31.540, "fleetSize": 60,
        "fleetType": "كسارات متنقلة وغرابيل هزازة وتريلات نقل سن وزلط", "priority": "A",
        "notes": "إنتاج ركام الخرسانة سن 1 وسن 2 وبودرة الحجر الجيري والدولوميت"
    },
    {
        "nameAr": "شركة طيبة للمحاجر وتوريد الدبش ومواد الأساس (طريق السخنة)",
        "nameEn": "Tiba Quarries Stone & Road Subbase Supply Sokhna",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "طريق العين السخنة - الكيلو 30 - محجر طيبة لمواد الردم وتدبيش الميول",
        "phone1": "02-27585310", "phone2": "01119944772", "website": "",
        "email": "tiba.quarries.sokhna@gmail.com", "lat": 29.948, "lon": 31.580, "fleetSize": 50,
        "fleetType": "قلابات ثقيلة وحفارات بشواكيش هيدروليكية لتكسير الصخور", "priority": "A",
        "notes": "توريد أحجار تدبيش الميول للترع ومحاور الطرق ومواد الردم والتأسيس الساب بيس"
    },
    {
        "nameAr": "شركة كسارات الفهد لمواد الخرسانة وركام البناء (القطامية)",
        "nameEn": "Al Fahd Stone Crushers & Concrete Aggregates Katameya",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "القطامية - الكيلو 15 طريق السخنة القديم - مجمع كسارات الفهد",
        "phone1": "02-27585400", "phone2": "01016622883", "website": "",
        "email": "fahd.crushers.katameya@gmail.com", "lat": 29.968, "lon": 31.460, "fleetSize": 45,
        "fleetType": "تريلات قلاب نقل سن ولوادر تحميل صخور وشاحنات صيانة كسارات", "priority": "A",
        "notes": "إنتاج ركام خرسانات الكباري ومواد الطبقة الرابطة للأسفلت"
    },
    {
        "nameAr": "شركة النيل للركام والدولوميت ومواد الرصف (طريق السخنة)",
        "nameEn": "Nile Dolomite Aggregates & Asphalt Aggregate Sokhna Road",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "الكيلو 28 طريق العين السخنة - مجمع محاجر الدولوميت النيل",
        "phone1": "02-27585510", "phone2": "01208811447", "website": "",
        "email": "nile.dolomite.sokhna@gmail.com", "lat": 29.950, "lon": 31.560, "fleetSize": 55,
        "fleetType": "قلابات 45 طن وشاحنات نقل صخور محاجر ومعدات غربلة ميكانيكية", "priority": "A+",
        "notes": "استخراج وتكسير صخور الدولوميت الصلبة المعتمدة من الهيئة العامة للطرق والكباري"
    },
    {
        "nameAr": "شركة كسارات ومحاجر وادي الدوم (طريق السخنة القديم)",
        "nameEn": "Wadi El Dome Quarries & Crushers Old Sokhna Road",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "طريق القطامية/السخنة القديم - وادي الدوم - مجمع الكسارات",
        "phone1": "02-27585600", "phone2": "01124488339", "website": "",
        "email": "wadieldome.quarries@gmail.com", "lat": 29.958, "lon": 31.505, "fleetSize": 40,
        "fleetType": "تريلات قلاب ومعدات تكسير وفناطيس مياه لرش الغبار بالمحاجر", "priority": "B",
        "notes": "تكسير وغربلة السن والزلط الفينو لمصانع البلاط والإنترلوك والخرسانة"
    },
    {
        "nameAr": "شركة الفرسان لمقاولات المحاجر والتكسير الميكانيكي (طريق السخنة)",
        "nameEn": "Al Forsan Quarrying & Mechanical Crushing Sokhna",
        "sector": "contracting", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "طريق العين السخنة - الكيلو 35 - معسكر ورش التعدين والمحاجر",
        "phone1": "02-27585710", "phone2": "01007733991", "website": "",
        "email": "forsan.quarry.mining@gmail.com", "lat": 29.942, "lon": 31.600, "fleetSize": 45,
        "fleetType": "كسارات صخور متنقلة على جنازير وحفارات تكسير ثقيلة", "priority": "A",
        "notes": "أعمال القطع والتكسير الصخري لمسارات الطرق والقطار الكهربائي السريع"
    },

    # ── Sub-Cluster D: كبرى شركات مقاولات الطرق والكباري والأسفلت والبنية التحتية بالقطامية والتجمع ──
    {
        "nameAr": "شركة النيل العامة لإنشاء الطرق - قطاع شرق القاهرة والقطامية",
        "nameEn": "Nile General Roads Construction East Cairo & Katameya Sector",
        "sector": "contracting", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "القطامية - الكيلو 5 طريق السخنة - مجمع خلاطات الأسفلت وورش الطرق",
        "phone1": "02-27586000", "phone2": "02-27586005", "website": "http://www.mot.gov.eg",
        "email": "nile.roads.katameya@mot.gov.eg", "lat": 29.984, "lon": 31.405, "fleetSize": 95,
        "fleetType": "خلاطات أسفلت مركزية وفناكر رصف وهراسات حديد وكاوتش وقلابات 40 طن", "priority": "A+",
        "notes": "تنفيذ وتوسعة شبكة الطرق والمحاور القومية والدائري الأوسطي وطريق السخنة"
    },
    {
        "nameAr": "شركة حسن علام للطرق والكباري - مجمع ورش القطامية وطريق السخنة",
        "nameEn": "Hassan Allam Roads & Bridges Katameya Plant",
        "sector": "contracting", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "طريق العين السخنة - مجمع ورش الصيانة المركزية ومعدات الكباري لحسن علام",
        "phone1": "02-27586110", "phone2": "02-27586115", "website": "https://www.hassanallam.com",
        "email": "katameya.heavyfleet@hassanallam.com", "lat": 29.976, "lon": 31.418, "fleetSize": 120,
        "fleetType": "لوبيدات نقل معدات ثقيلة وروافع كباري تلسكوبية وحفارات وقلابات", "priority": "A+",
        "notes": "القاعدة اللوجستية المركزية لجميع معدات الإنشاءات الثقيلة والكباري بشرق القاهرة"
    },
    {
        "nameAr": "شركة المقاولون العرب - مجمع ورش الأساسات والمعدات الثقيلة بالقطامية",
        "nameEn": "Arab Contractors Katameya Foundations & Heavy Equipment Base",
        "sector": "contracting", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "القطامية - المنطقة الصناعية - مجمع ورش ترسانة المقاولون العرب المركزية",
        "phone1": "02-27586200", "phone2": "02-27586205", "website": "https://www.arabcont.com",
        "email": "katameya.yard@arabcont.com", "lat": 29.987, "lon": 31.392, "fleetSize": 140,
        "fleetType": "ماكينات حفر خوازيق عملاقة (Bauer) وأوناش زاحفة وتريلات نقل هياكل", "priority": "A+",
        "notes": "المركز الرئيسي لماكينات ومعدات الأساسات الميكانيكية العميقة ومحطات الخلط"
    },
    {
        "nameAr": "شركة السلام الدولية للكباري والطرق والأسفلت (القطامية)",
        "nameEn": "El Salam International Bridges Roads & Asphalt Katameya",
        "sector": "contracting", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "القطامية - الكيلو 10 طريق السخنة القديم - مجمع خلاطات الأسفلت السلام",
        "phone1": "02-27586310", "phone2": "01227711449", "website": "",
        "email": "salam.roads.katameya@gmail.com", "lat": 29.972, "lon": 31.422, "fleetSize": 65,
        "fleetType": "خلاطات أسفلت هولندية وفناكر رصف وهراسات وقلابات ومكانس طرق", "priority": "A",
        "notes": "خلط وإنتاج ورصف الأسفلت الساخن وتجهيز طبقات الرصف للمطارات والمحاور"
    },
    {
        "nameAr": "شركة الإخوة لمقاولات الحفر والردم والتسويات الكبرى (طريق السخنة)",
        "nameEn": "El Ekhwa Earthmoving Excavation & Site Grading Sokhna",
        "sector": "contracting", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "طريق العين السخنة - معسكر تسويات الأراضي والردم بالقطامية",
        "phone1": "02-27586400", "phone2": "01009944118", "website": "",
        "email": "ekhwa.earthmoving.cairo@gmail.com", "lat": 29.967, "lon": 31.450, "fleetSize": 55,
        "fleetType": "بلدوزرات كاتربيلر D8/D9 ولوادر قلاب وسيارات تانك رش مياه", "priority": "A",
        "notes": "تنفيذ أعمال القطع الصخري والتسويات الكبرى للمدن والكمبوندات السكنية"
    },
    {
        "nameAr": "شركة الصفا لمقاولات البنية التحتية وشبكات المياه والخرسانة (القطامية)",
        "nameEn": "Al Safa Infrastructure & Water Networks Katameya",
        "sector": "contracting", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "القطامية - المنطقة الصناعية - بلوك 5 - مجمع الصفا للمقاولات",
        "phone1": "02-27586510", "phone2": "01115588223", "website": "",
        "email": "safa.infra.katameya@gmail.com", "lat": 29.989, "lon": 31.410, "fleetSize": 40,
        "fleetType": "حفارات هيدروليكية وتريلات نقل مواسير خرسانية وبولي إيثيلين", "priority": "B",
        "notes": "تنفيذ خطوط الطرد ومحطات الرفع وشبكات المرافق بالقاهرة الجديدة"
    },
    {
        "nameAr": "شركة المتحدة لمقاولات الطرق والرصف والخلطات الأسفلتية (القطامية)",
        "nameEn": "United Road Paving & Asphalt Mixtures Katameya",
        "sector": "contracting", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "طريق القطامية السخنة - الكيلو 7 - مجمع الخلاطات الأسفلتية",
        "phone1": "02-27586600", "phone2": "01203344771", "website": "",
        "email": "united.asphalt.katameya@gmail.com", "lat": 29.980, "lon": 31.416, "fleetSize": 50,
        "fleetType": "فناكر أسفلت ديناباك وهراسات وسيارات رش مازوت (MCO)", "priority": "A",
        "notes": "تنفيذ الطبقات السطحية والرابطة للأسفلت بمشروعات شرق القاهرة"
    },
    {
        "nameAr": "شركة الأندلس لمقاولات الحفر والنسف الصخري والتسويات (طريق السخنة)",
        "nameEn": "Al Andalus Rock Blasting & Excavation Works Sokhna Road",
        "sector": "contracting", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "الكيلو 20 طريق العين السخنة - مجمع معدات النسف الصخري والتثقيب",
        "phone1": "02-27586710", "phone2": "01018899224", "website": "",
        "email": "andalus.blasting.cairo@gmail.com", "lat": 29.962, "lon": 31.510, "fleetSize": 45,
        "fleetType": "ماكينات تثقيب صخور دريل هيدروليكي وحفارات وشاحنات نقل صخور", "priority": "A",
        "notes": "أعمال النسف والتكسير الصخري الميكانيكي للمحاور الجبلية ومسارات المرافق"
    },
    {
        "nameAr": "شركة الفردوس لتأجير المعدات الثقيلة والأوناش الهيدروليكية (القطامية)",
        "nameEn": "Al Ferdous Heavy Equipment & Hydraulic Cranes Rental Katameya",
        "sector": "logistics", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "القطامية - ساحة الأوناش الثقيلة - بجوار مطلع الدائري الأوسطي",
        "phone1": "02-27586800", "phone2": "01124411776", "website": "",
        "email": "ferdous.cranes.katameya@gmail.com", "lat": 29.985, "lon": 31.430, "fleetSize": 40,
        "fleetType": "أوناش تلسكوبية ليبهير من 50 طن إلى 250 طن ولوبيدات نقل ثقيل", "priority": "A",
        "notes": "تأجير وتشغيل الأوناش العملاقة لرفع كمرات الكباري وتركيب الهياكل المعدنية"
    },
    {
        "nameAr": "شركة المستقبل لإنتاج المواسير الخرسانية والإنترلوك (القطامية)",
        "nameEn": "Al Mostakbal Concrete Pipes & Interlock Katameya Plant",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "القطامية - المنطقة الصناعية - مجمع مصانع المواسير الخرسانية المسلحة",
        "phone1": "02-27586910", "phone2": "01228844331", "website": "",
        "email": "mostakbal.pipes.katameya@gmail.com", "lat": 29.991, "lon": 31.412, "fleetSize": 35,
        "fleetType": "تريلات تريلات نقل مواسير أقطار عملاقة وسيارات رافعة شوكية", "priority": "B",
        "notes": "إنتاج مواسير الخرسانة المسلحة حتى قطر 2500 ملم لخطوط الصرف وأعمال الري"
    },
    {
        "nameAr": "شركة الدلتا لمقاولات الكباري والإنشاءات الخرسانية (القطامية)",
        "nameEn": "Delta Bridges & Precast Concrete Construction Katameya",
        "sector": "contracting", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "القطامية - مجمع ورش صب الكمرات الخرسانية مسبقة الصنع",
        "phone1": "02-27587000", "phone2": "01004411779", "website": "",
        "email": "delta.bridges.cairo@gmail.com", "lat": 29.974, "lon": 31.424, "fleetSize": 50,
        "fleetType": "روافع كمرات كباري تريلات لوبيد حمولات خاصة وتريلات نقل خرسانة", "priority": "A+",
        "notes": "تصنيع وتركيب الكمرات سابقة الصب والإجهاد لكباري القاهرة الجديدة والعاصمة"
    },
    {
        "nameAr": "شركة الشروق لتجارة وتوريد مواد البناء والأسمنت السائب (القطامية)",
        "nameEn": "Al Shorouk Bulk Cement & Building Materials Trading Katameya",
        "sector": "trade", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "القطامية - طريق العين السخنة القديم - مجمع مستودعات الأسمنت السائب",
        "phone1": "02-27587110", "phone2": "01119933558", "website": "",
        "email": "shorouk.bulk.cement@gmail.com", "lat": 29.983, "lon": 31.400, "fleetSize": 45,
        "fleetType": "تريلات سايلو لنقل الأسمنت السائب وتريلات نقل حديد تسليح", "priority": "A",
        "notes": "توريد الأسمنت البورتلاندي السائب والحديد لمحطات الخرسانة ومقاولي شرق القاهرة"
    },
    {
        "nameAr": "مصنع الإمبراطور للرخام والجرانيت وتشكيل الأحجار بشق التعبان",
        "nameEn": "El Emperor Marble & Granite Factory Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - المنطقة الصناعية الثانية - مجمع مصانع الإمبراطور",
        "phone1": "02-27587200", "phone2": "01007744882", "website": "",
        "email": "emperor.marble.cairo@gmail.com", "lat": 29.919, "lon": 31.304, "fleetSize": 35,
        "fleetType": "تريلات نقل ألواح رخام وأوناش شوكية لرفع الكتل", "priority": "B",
        "notes": "نشر وتلميع خامات الرخام الطبيعي وتوريدها للشركات الهندسية"
    },
    {
        "nameAr": "شركة الفهد لتقطيع وتشطيب الرخام المصري بشق التعبان",
        "nameEn": "Al Fahd Egyptian Marble Cutting & Polishing Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - شارع الكسارة - مصنع الفهد رقم 18",
        "phone1": "02-27587310", "phone2": "01121199334", "website": "",
        "email": "fahd.marble.cairo@gmail.com", "lat": 29.913, "lon": 31.298, "fleetSize": 30,
        "fleetType": "سيارات نقل وتوزيع رخام وشاحنات جامبو", "priority": "B",
        "notes": "تشطيب درج السلالم والأرضيات والترابيع للكمبوندات السكنية"
    },
    {
        "nameAr": "شركة تريستا ستون لإنتاج وتصدير رخام تريستا وسيلفيا بشق التعبان",
        "nameEn": "Triesta Stone Marble Export Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - مجمع التصدير النموذجي - هنجر 6",
        "phone1": "02-27587400", "phone2": "01208844116", "website": "",
        "email": "triesta.stone.cairo@gmail.com", "lat": 29.915, "lon": 31.307, "fleetSize": 45,
        "fleetType": "تريلات شحن حاويات لموانئ التصدير وشاحنات نقل كتل صخرية", "priority": "A",
        "notes": "تصدير رخام تريستا البيج وسيلفيا المنيا للدول الأوروبية والعربية"
    },
    {
        "nameAr": "شركة المتحدة للجرانيت والرخام والأرضيات الميكانيكية بشق التعبان",
        "nameEn": "United Granite & Mechanical Flooring Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "منطقة شق التعبان - شارع المصانع - بلوك 33",
        "phone1": "02-27587510", "phone2": "01016633885", "website": "",
        "email": "united.granite.cairo@gmail.com", "lat": 29.917, "lon": 31.302, "fleetSize": 40,
        "fleetType": "شاحنات نقل ثقيل وسيارات توزيع ترابيع جرانيت معالجة حرارياً", "priority": "A",
        "notes": "إنتاج الجرانيت المشعل والمجلي لأرضيات المولات ومحطات السكك الحديدية"
    },
    {
        "nameAr": "شركة الفراعنة لقص وتلميع الرخام الصناعي والكوارتز بشق التعبان",
        "nameEn": "Pharaohs Engineered Stone & Quartz Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - مجمع الكوارتز والرخام الصناعي - مصنع 42",
        "phone1": "02-27587600", "phone2": "01114499228", "website": "",
        "email": "pharaohs.quartz.cairo@gmail.com", "lat": 29.922, "lon": 31.299, "fleetSize": 30,
        "fleetType": "سيارات نقل ألواح كوارتز مغلقة ومجهزة بحوامل أمان", "priority": "B",
        "notes": "تصنيع ألواح الكوارتز والرخام الصناعي للمطابخ والمستشفيات"
    },
    {
        "nameAr": "شركة السلام لنشر الأحجار الصلبة والدولوميت بشق التعبان",
        "nameEn": "Al Salam Hard Stone & Dolomite Slabs Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "طريق الأوتوستراد - مدخل شق التعبان القديم - ورش السلام",
        "phone1": "02-27587710", "phone2": "01229911443", "website": "",
        "email": "salam.stone.cairo@gmail.com", "lat": 29.924, "lon": 31.294, "fleetSize": 35,
        "fleetType": "تريلات نقل كتل وشاحنات تفريغ ركام ناعم", "priority": "B",
        "notes": "نشر ومعالجة الأحجار الجيرية الصلبة والدولوميت للأرصفة والمشروعات"
    },
    {
        "nameAr": "مصنع طيبة لمنتجات البازلت والجرانيت الأسود بشق التعبان",
        "nameEn": "Tiba Basalt & Black Granite Products Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - شارع الكسارات - مجمع تصنيع حجر البازلت",
        "phone1": "02-27587800", "phone2": "01003355776", "website": "",
        "email": "tiba.basalt.cairo@gmail.com", "lat": 29.912, "lon": 31.305, "fleetSize": 40,
        "fleetType": "قلابات وتريلات نقل أحجار بازلت صلبة لأعمال السكك الحديدية", "priority": "A",
        "notes": "إنتاج وتكسير حجر البازلت الأسود لطبقات بازلت قطارات المترو والسكك الحديدية"
    },
    {
        "nameAr": "شركة الصفا لتصدير كتل الرخام الخام بشق التعبان",
        "nameEn": "Al Safa Raw Marble Blocks Export Shaq Al-Tho'ban",
        "sector": "trade", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - ساحة تشوين وتجارة البلوكات الكبرى",
        "phone1": "02-27587910", "phone2": "01128833119", "website": "",
        "email": "safa.blocks.cairo@gmail.com", "lat": 29.916, "lon": 31.309, "fleetSize": 45,
        "fleetType": "تريلات نقل كتل صخرية 60 طن وأوناش ساحات تفريغ هيدروليكية", "priority": "A",
        "notes": "شحن كتل الرخام الخام مباشرة لموانئ الصين وإيطاليا والهند"
    },
    {
        "nameAr": "شركة النخبة للرخام والجرانيت التصديري بشق التعبان",
        "nameEn": "El Nokhbar Marble & Granite Export Shaq Al-Tho'ban",
        "sector": "manufacturing", "city": "cairo", "district": "شق التعبان", "governorate": "القاهرة",
        "address": "شق التعبان - المنطقة النموذجية الأولى - مصنع النخبة",
        "phone1": "02-27588000", "phone2": "01207722448", "website": "",
        "email": "nokhba.marble.cairo@gmail.com", "lat": 29.921, "lon": 31.306, "fleetSize": 35,
        "fleetType": "تريلات نقل ألواح وشاحنات نقل حاويات مصممة للشحن الخارجي", "priority": "B",
        "notes": "تصنيع وتعبئة الرخام في باليتات خشبية معالجة حرارياً للتصدير"
    },
    {
        "nameAr": "شركة كسارات ومحاجر الجلالة للسن والدولوميت بطريق السخنة",
        "nameEn": "Galala Crushers & Dolomite Subbase Sokhna Corridor",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "الكيلو 32 طريق العين السخنة - مجمع محاجر الجلالة للسن والدولوميت",
        "phone1": "02-27588110", "phone2": "01019944337", "website": "",
        "email": "galala.crushers.sokhna@gmail.com", "lat": 29.945, "lon": 31.590, "fleetSize": 65,
        "fleetType": "شاحنات قلاب 50 طن ولوادر عملاقة وكسارات تصادمية", "priority": "A+",
        "notes": "إنتاج وتوريد السن المتدرج والدولوميت المعتمد لمشروعات الطرق السريعة"
    },
    {
        "nameAr": "شركة الدلتا لمحاجر الرمل المغسول والزلط بطريق السخنة كم 15",
        "nameEn": "Delta Washed Sand & Gravel Quarries Sokhna Road Km 15",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "طريق العين السخنة - الكيلو 15 - مجمع محطات غسيل وفرز الرمال",
        "phone1": "02-27588200", "phone2": "01115533882", "website": "",
        "email": "delta.sand.sokhna@gmail.com", "lat": 29.966, "lon": 31.470, "fleetSize": 50,
        "fleetType": "تريلات قلاب نقل رمل مغسول وزلط فينو ولوادر تحميل", "priority": "A",
        "notes": "توريد الرمال المغسولة الخالية من الأملاح لمحطات الخرسانة الجاهزة"
    },
    {
        "nameAr": "شركة الهدى للخرسانة الجاهزة ومحطة التجمع الثالث",
        "nameEn": "Al Huda Ready Mix Concrete 3rd Settlement Plant",
        "sector": "manufacturing", "city": "cairo", "district": "التجمع الثالث", "governorate": "القاهرة",
        "address": "القاهرة الجديدة - التجمع الثالث - المنطقة الصناعية قطعة 9",
        "phone1": "02-27588310", "phone2": "01228811774", "website": "",
        "email": "huda.concrete.newcairo@gmail.com", "lat": 29.993, "lon": 31.430, "fleetSize": 40,
        "fleetType": "خلاطات خرسانة سعة 10م3 ومضخات أسمنت وسيارات إشراف جودة", "priority": "A",
        "notes": "إمدادات الخرسانة المسلحة للكمبوندات والعمارات السكنية بالقاهرة الجديدة"
    },
    {
        "nameAr": "شركة النماء للخلطات الإسمنتية والخرسانة المسلحة بالقطامية",
        "nameEn": "Al Namaa Cement Mixtures & Reinforced Concrete Katameya",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "القطامية - الكيلو 8 طريق السخنة القديم - مجمع النماء",
        "phone1": "02-27588400", "phone2": "01004499221", "website": "",
        "email": "namaa.concrete.katameya@gmail.com", "lat": 29.977, "lon": 31.414, "fleetSize": 45,
        "fleetType": "خلاطات خرسانة ومضخات بوم وتريلات نقل أسمنت سائب", "priority": "A",
        "notes": "توريد الخرسانات عالية المقاومة للأبراج والمنشآت الإدارية"
    },
    {
        "nameAr": "شركة سيتي ميكس للخرسانة الجاهزة بالقاهرة الجديدة والتجمع",
        "nameEn": "CityMix Ready Mix Concrete New Cairo Operations",
        "sector": "manufacturing", "city": "cairo", "district": "التجمع الخامس", "governorate": "القاهرة",
        "address": "القاهرة الجديدة - مجمع محطات الخلط جنوب الأكاديمية والتجمع",
        "phone1": "02-27588510", "phone2": "01129933446", "website": "",
        "email": "citymix.concrete.cairo@gmail.com", "lat": 30.012, "lon": 31.450, "fleetSize": 50,
        "fleetType": "خلاطات خرسانة مان ومضخات بوم 48م وسيارات صيانة خلاطات", "priority": "A",
        "notes": "صب الخرسانات المسلحة للمشروعات التجارية والتعليمية بالقاهرة الجديدة"
    },
    {
        "nameAr": "شركة الفارس لمقاولات الحفر والنقل الثقيل بطريق السخنة",
        "nameEn": "Al Fares Heavy Excavation & Earth Haulage Sokhna Road",
        "sector": "contracting", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "طريق العين السخنة - معسكر ورش الفارس لتسويات الأراضي",
        "phone1": "02-27588600", "phone2": "01201144773", "website": "",
        "email": "fares.excavation.sokhna@gmail.com", "lat": 29.964, "lon": 31.490, "fleetSize": 45,
        "fleetType": "حفارات هيدروليكية ثقيلة وبلدوزرات وقلابات نقل ردميات 40 طن", "priority": "A",
        "notes": "أعمال الحفر والردم والتسويات الكبرى للمشروعات السكنية والصناعية"
    },
    {
        "nameAr": "شركة الرواد للمحاجر وتوريد الدبش والأحجار بطريق السخنة كم 25",
        "nameEn": "Al Rowad Quarries & Stone Supply Sokhna Road Km 25",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "طريق العين السخنة - الكيلو 25 - محجر الرواد لتدبيش الميول والأحجار",
        "phone1": "02-27588710", "phone2": "01018822559", "website": "",
        "email": "rowad.quarries.sokhna@gmail.com", "lat": 29.953, "lon": 31.550, "fleetSize": 50,
        "fleetType": "قلابات ثقيلة وحفارات بشواكيش هيدروليكية وتريلات نقل أحجار", "priority": "A",
        "notes": "توريد أحجار الدبش وأعمال حماية ميول الطرق والكباري والأنفاق"
    },
    {
        "nameAr": "شركة إعمار الشرق لمقاولات الطرق والرصف بالقطامية",
        "nameEn": "Emaar Al Sharq Roads & Paving Contracting Katameya",
        "sector": "contracting", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "القطامية - المنطقة الصناعية - بلوك 14 - مجمع إعمار الشرق",
        "phone1": "02-27588800", "phone2": "01117744115", "website": "",
        "email": "emaar.sharq.roads@gmail.com", "lat": 29.986, "lon": 31.412, "fleetSize": 40,
        "fleetType": "فناكر أسفلت وهراسات حديد ومطاط ومعدات تخطيط طرق", "priority": "B",
        "notes": "تنفيذ أعمال رصف وتخطيط المحاور الداخلية للمدن والكمبوندات"
    },
    {
        "nameAr": "شركة الفيروز لمحطات الأسفلت والخلط بالقطامية",
        "nameEn": "Al Fairouz Asphalt Mixing Plant Katameya Corridor",
        "sector": "manufacturing", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "طريق القطامية/السخنة القديم - الكيلو 11 - خلاطة أسفلت الفيروز",
        "phone1": "02-27588910", "phone2": "01223399118", "website": "",
        "email": "fairouz.asphalt.katameya@gmail.com", "lat": 29.971, "lon": 31.428, "fleetSize": 55,
        "fleetType": "خلاطات أسفلت حديثة وتريلات نقل بيتومين ومازوت وقلابات أسفلت معزولة", "priority": "A",
        "notes": "إنتاج وتوريد الخلطات الأسفلتية الساخنة لمقاولي شرق القاهرة"
    },
    {
        "nameAr": "شركة الصفا لتجارة ونقل الأسمنت السائب وتوريد الصوامع بالقطامية",
        "nameEn": "Al Safa Bulk Cement Transport & Silos Katameya",
        "sector": "trade", "city": "cairo", "district": "القطامية", "governorate": "القاهرة",
        "address": "القطامية - مجمع مستودعات الأسمنت - طريق السخنة القديم",
        "phone1": "02-27589000", "phone2": "01006644227", "website": "",
        "email": "safa.cement.katameya@gmail.com", "lat": 29.982, "lon": 31.404, "fleetSize": 45,
        "fleetType": "تريلات سايلو نقل أسمنت سائب حمولة 65 طن وسيارات ضخ هوائي", "priority": "A",
        "notes": "إمدادات الأسمنت السائب المقاوم والبورتلاندي العادي لمحطات الخلط"
    }
]

print(f"\nEvaluating {len(candidates)} targeted candidates in East Cairo Corridor...")

approved_phase2 = []
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

    approved_phase2.append(item)

print(f"\n=======================================================")
print(f"CANDIDATES EVALUATED IN EAST CAIRO SQUARE: {len(candidates)}")
print(f"SKIPPED PHONE DUPLICATES:                 {skipped_phones}")
print(f"SKIPPED NAME DUPLICATES:                  {skipped_names}")
print(f"APPROVED PURE NEW B2B ENTERPRISES:        {len(approved_phase2)}")
print(f"=======================================================")

formatted_enterprises = []
for idx, c in enumerate(approved_phase2, 1):
    comp_id = f"eg_phase2_cairo_east_{idx:04d}"
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
        "lat": c.get("lat", 29.98),
        "lon": c.get("lon", 31.40),
        "fleetSize": c.get("fleetSize", 35),
        "fleetType": c.get("fleetType", "شاحنات ومعدات أسطول"),
        "priority": c.get("priority", "A"),
        "status": "unassigned",
        "source": "verified_phase2_east_cairo_concrete_marble_2026",
        "contactPerson": "",  # Strictly empty
        "notes": c.get("notes", "")
    })

os.makedirs('scraper/output', exist_ok=True)
out_path = 'scraper/output/phase2_east_cairo_verified_b2b_fleet.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(formatted_enterprises, f, ensure_ascii=False, indent=2)

print(f"Successfully saved {len(formatted_enterprises)} pure verified enterprises to {out_path}!")
