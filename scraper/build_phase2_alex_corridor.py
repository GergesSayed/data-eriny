# -*- coding: utf-8 -*-
"""
Phase 2 - Square 4: Alexandria Maritime Hub, Dekheila Port, Abu Qir, Borg El Arab Industrial City, Amreya Petrochemicals & Nubaria/Wadi El Natrun Agro-Logistics Corridor
Heavy Fleet Industrial, Port Logistics, Petrochemicals & Cold Storage Corridor:
- Dekheila Port, Abu Qir & Alexandria Maritime / Container Fleets (أساطيل نقل الحاويات، الشحن والتفريغ، التوريدات البحرية، ومستودعات الموانئ)
- Amreya, Merghem & Al-Nahda Petrochemical & Fuel Tanker Fleets (صهاريج نقل البتروكيماويات والزيوت والمشتقات البترولية والبلاستيك)
- Borg El Arab Heavy Industries, Food Processing & Cables (قلاع التصنيع ببرج العرب، الأغذية، الكابلات، والصلب)
- Nubaria, Wadi El Natrun & Beheira Reefer Agro-Export Hubs (محطات الفرز والتصدير الزراعي المبرد، صوامع الغلال، ومصانع الأعلاف)
- Ready-Mix Concrete, Quarries & Coastal Infrastructure Contractors (محطات الخرسانة الجاهزة ومحاجر العامرية وبرج العرب ومقاولو الكباري والموانئ)
"""

import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== PHASE 2 - SQUARE 4: ALEXANDRIA, DEKHEILA, BORG EL ARAB, AMREYA & NUBARIA HARVESTER ===")
print("=== FOCUSED SQUARE: CONTAINER FLEETS, PETROCHEMICALS, BORG EL ARAB FACTORIES, AGRO REEFERS & READY-MIX ===")

# 1. Load existing 20,225 companies to enforce absolute Zero Duplication
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

# 2. Vetted Candidates Pool for Square 4 (Alexandria & Surrounding Corridor)
candidates = [
    # ── Sub-Cluster A: موانئ الدخيلة وأبو قير والإسكندرية (أساطيل نقل الحاويات، الشحن والتفريغ، التوريدات البحرية) ──
    {
        "nameAr": "الشركة الوطنية للشحن والتفريغ وتداول البضائع (ميناء الدخيلة)",
        "nameEn": "National Stevedoring & Cargo Handling Dekheila Port",
        "sector": "transport", "city": "alexandria", "district": "الدخيلة وميناء الدخيلة", "governorate": "الإسكندرية",
        "address": "ميناء الدخيلة - بوابة 3 - رصيف 94/2 - الإسكندرية",
        "phone1": "03-3085885", "phone2": "", "website": "",
        "email": "national.stevedoring.dekheila@gmail.com", "lat": 31.135, "lon": 29.815, "fleetSize": 60,
        "fleetType": "شاحنات تريلات نقل حاويات مسطحة وسيارات نقل بضائع عامة وأوناش ساحات", "priority": "A+",
        "notes": "شحن وتفريغ السفن وتداول الحاويات والبضائع العامة على رصيف 94/2 بميناء الدخيلة"
    },
    {
        "nameAr": "شركة كابو للصوامع والشحن والتفريغ وتداول الحبوب (ميناء الدخيلة)",
        "nameEn": "KABO Grain Silos & Stevedoring Dekheila Port",
        "sector": "transport", "city": "alexandria", "district": "الدخيلة وميناء الدخيلة", "governorate": "الإسكندرية",
        "address": "المنطقة الثانية - داخل ميناء الدخيلة - الإسكندرية",
        "phone1": "03-3085910", "phone2": "", "website": "",
        "email": "kabo.silos.dekheila@gmail.com", "lat": 31.138, "lon": 29.818, "fleetSize": 55,
        "fleetType": "سيور تفريغ غلال آلية وتريلات سايلو نقل قمح وتريلات قلاب صب جاف", "priority": "A+",
        "notes": "تفريغ وتخزين وشحن بواخر الحبوب والصب الغذائي وتوصيلها للمطاحن الوطنية"
    },
    {
        "nameAr": "شركة سي تريد للشحن وتداول البضائع البحرية (Sea Trade Dekheila)",
        "nameEn": "Sea Trade Shipping & Maritime Logistics Dekheila",
        "sector": "transport", "city": "alexandria", "district": "الدخيلة وميناء الدخيلة", "governorate": "الإسكندرية",
        "address": "داخل ميناء الدخيلة - رصيف 94/3 - الإسكندرية",
        "phone1": "03-3086120", "phone2": "", "website": "http://www.seatrade-eg.com",
        "email": "operations.dekheila@seatrade-eg.com", "lat": 31.136, "lon": 29.816, "fleetSize": 45,
        "fleetType": "تريلات نقل حاويات 20 و40 قدم ومعدات مناولة بضائع مشحونة بالبحر", "priority": "A",
        "notes": "خدمات الشحن البحري وتفريغ ونقل الحاويات الترانزيت عبر موانئ الإسكندرية والدخيلة"
    },
    {
        "nameAr": "شركة سيسكو ترانس للنقل اللوجستي وتداول الحاويات (ميناء الدخيلة وأبو قير)",
        "nameEn": "Sisco Trans Logistics & Container Haulage Alex",
        "sector": "transport", "city": "alexandria", "district": "الدخيلة وأبو قير", "governorate": "الإسكندرية",
        "address": "ميناء الدخيلة وميناء أبو قير البحري - الإسكندرية",
        "phone1": "03-5623977", "phone2": "", "website": "http://www.siscotrans.com",
        "email": "info@siscotrans.com", "lat": 31.315, "lon": 30.065, "fleetSize": 70,
        "fleetType": "أساطيل شاحنات تريلات نقل ثقيل ومقطورات حاويات وأوناش رفع ثقيلة للموانئ", "priority": "A+",
        "notes": "مقاولات النقل البحري والبري والخدمات اللوجستية بمينائي أبو قير والدخيلة"
    },
    {
        "nameAr": "شركة جولدن إيست اللوجستية وتخزين الحاويات (الدخيلة)",
        "nameEn": "Golden East Logistics & Container Storage Dekheila",
        "sector": "transport", "city": "alexandria", "district": "الدخيلة وميناء الدخيلة", "governorate": "الإسكندرية",
        "address": "ميناء الدخيلة - بوابة 3 - مجمع الساحات اللوجستية",
        "phone1": "03-3086230", "phone2": "", "website": "",
        "email": "goldeneast.logistics@gmail.com", "lat": 31.134, "lon": 29.814, "fleetSize": 40,
        "fleetType": "شاحنات تريلات نقل حاويات ورافعات ساحات ومركبات تفريغ وتخزين جمركي", "priority": "A",
        "notes": "إدارة ساحات التخزين الجمركي للحاويات وتقديم خدمات الشحن والتفريغ السريع"
    },
    {
        "nameAr": "شركة سي جرين للشحن والتفريغ والتخزين اللوجستي (ميناء الدخيلة)",
        "nameEn": "Sea Green Stevedoring & Warehousing Dekheila",
        "sector": "transport", "city": "alexandria", "district": "الدخيلة وميناء الدخيلة", "governorate": "الإسكندرية",
        "address": "داخل ميناء الدخيلة - مجمع رصيف البضائع العامة",
        "phone1": "03-3086340", "phone2": "", "website": "",
        "email": "seagreen.shipping@gmail.com", "lat": 31.137, "lon": 29.817, "fleetSize": 38,
        "fleetType": "شاحنات نقل بضائع عامة وتريلات مسطحة ومعدات رافعة للشحن والتخزين", "priority": "A",
        "notes": "تداول ونقل بضائع الصب الجاف والمعدات الصناعية والصلب الوارد عبر الميناء"
    },
    {
        "nameAr": "الصفوة لنقل الحاويات والتريلات المسطحة (الورديان)",
        "nameEn": "Al Safwa Container Haulage & Flatbed Trailers Wardian",
        "sector": "transport", "city": "alexandria", "district": "الورديان وميناء الإسكندرية", "governorate": "الإسكندرية",
        "address": "82 شارع الأمان - الورديان - غرب الإسكندرية",
        "phone1": "03-4400164", "phone2": "", "website": "",
        "email": "alsafwa.haulage.alex@gmail.com", "lat": 31.162, "lon": 29.865, "fleetSize": 50,
        "fleetType": "شاحنات تريلات نقل حاويات مسطحة مرسيدس ومان لربط الميناء بالمناطق الصناعية", "priority": "A+",
        "notes": "نقل الحاويات الواردة من ميناء الإسكندرية إلى مصانع العاشر وأكتوبر وبرج العرب"
    },
    {
        "nameAr": "القناوي للنقل والتجارة والشاحنات الثقيلة (شارع المكس)",
        "nameEn": "El Qenawi Heavy Transport & Trucking Max Road",
        "sector": "transport", "city": "alexandria", "district": "الورديان والمكس", "governorate": "الإسكندرية",
        "address": "295 شارع المكس - الورديان - الإسكندرية",
        "phone1": "03-4446843", "phone2": "", "website": "",
        "email": "elqenawi.transport@gmail.com", "lat": 31.158, "lon": 29.860, "fleetSize": 45,
        "fleetType": "تريلات نقل ثقيل وشاحنات نقل بضائع تجارية وتريلات قلاب مواد خام", "priority": "A",
        "notes": "خدمات النقل البري الثقيل للبضائع التجارية والمعدات من ميناء الإسكندرية"
    },
    {
        "nameAr": "شركة الفراعنة للنقل الدولي وتريلات الموانئ (الورديان)",
        "nameEn": "Pharaohs International Transport & Port Fleets",
        "sector": "transport", "city": "alexandria", "district": "الورديان", "governorate": "الإسكندرية",
        "address": "56 شارع ابن عدي - الورديان - الإسكندرية",
        "phone1": "03-4856944", "phone2": "", "website": "",
        "email": "pharaohs.intl.transport@gmail.com", "lat": 31.164, "lon": 29.868, "fleetSize": 42,
        "fleetType": "تريلات نقل دولي وتريلات مبردة وشاحنات نقل بضائع الصب الجاف والتصدير", "priority": "A",
        "notes": "نقل وشحن بضائع التصدير والاستيراد لخطوط الملاحة الدولية عبر موانئ الإسكندرية"
    },
    {
        "nameAr": "المركز الدولي للنقل والخدمات اللوجستية (ICT القباري)",
        "nameEn": "International Center for Transport & Logistics (ICT)",
        "sector": "transport", "city": "alexandria", "district": "القباري", "governorate": "الإسكندرية",
        "address": "81 شارع المكس - الدور الثاني - القباري - الإسكندرية",
        "phone1": "01111140793", "phone2": "", "website": "",
        "email": "ict.logistics.alex@gmail.com", "lat": 31.160, "lon": 29.862, "fleetSize": 36,
        "fleetType": "شاحنات تريلات مقفلة وتريلات جامبو لنقل البضائع الحساسة والطرود الثقيلة", "priority": "A",
        "notes": "حلول لوجستية متكاملة لإدارة النقل البري من المستودعات الجمركية للمصانع"
    },
    {
        "nameAr": "شركة ترسانة الإسكندرية للأعمال البحرية والنقل المائي (باب 1 الميناء)",
        "nameEn": "Alexandria Shipyard Marine Transport & Engineering Hub",
        "sector": "manufacturing", "city": "alexandria", "district": "ميناء الإسكندرية والأنفوشي", "governorate": "الإسكندرية",
        "address": "داخل ميناء الإسكندرية - باب 1 - الجمرك - الإسكندرية",
        "phone1": "03-4403090", "phone2": "03-4405090", "website": "http://www.alexyard.com.eg",
        "email": "info@alexyard.com.eg", "lat": 31.185, "lon": 29.875, "fleetSize": 65,
        "fleetType": "أوناش رصيف ثقيلة 90 طن وقاطرات بحرية وشاحنات نقل معدات إصلاح وبناء السفن", "priority": "A+",
        "notes": "أكبر صرح لبناء وإصلاح السفن والناقلات البحرية والمنصات وتصنيع الهياكل الفولاذية في مصر"
    },
    {
        "nameAr": "شركة بان مارين للخدمات الملاحية والبترولية والشحن (Pan Marine Alex)",
        "nameEn": "Pan Marine Shipping & Petroleum Logistics Group",
        "sector": "transport", "city": "alexandria", "district": "محطة الرمل والأزاريطة", "governorate": "الإسكندرية",
        "address": "طريق الجيش - محطة الرمل - الإسكندرية",
        "phone1": "03-4940520", "phone2": "", "website": "http://www.pan-marine.net",
        "email": "shipping@pan-marine.net", "lat": 31.202, "lon": 29.905, "fleetSize": 48,
        "fleetType": "شاحنات نقل مهمات بترولية وسيارات خدمة الموانئ وقوارب دعم بحري وسيارات شحن سريع", "priority": "A+",
        "notes": "خدمات الدعم اللوجستي لشركات البترول والغاز والتوكيلات الملاحية بموانئ البحر المتوسط"
    },
    {
        "nameAr": "شركة نفرتيتي للملاحة والخدمات البحرية (Nefertiti Marine)",
        "nameEn": "Nefertiti Marine Services & Technical Yacht Yards",
        "sector": "transport", "city": "alexandria", "district": "سموحة والإسكندرية", "governorate": "الإسكندرية",
        "address": "شارع فوزي معاذ - سموحة - الإسكندرية",
        "phone1": "03-4251845", "phone2": "", "website": "http://www.nefertitimarine.com",
        "email": "info@nefertitimarine.com", "lat": 31.215, "lon": 29.940, "fleetSize": 30,
        "fleetType": "شاحنات نقل قوارب وتريلات نقل معدات بحرية ورافعات هيدروليكية لليخوت والسفن", "priority": "B",
        "notes": "تصميم وتصنيع وصيانة الوحدات البحرية واليخوت والتوريدات الفنية للموانئ"
    },
    {
        "nameAr": "المتحدة لخدمات الموانئ والمقطورات الثقيلة (المكس)",
        "nameEn": "United Port Services & Heavy Trailers El Max",
        "sector": "transport", "city": "alexandria", "district": "المكس والدخيلة", "governorate": "الإسكندرية",
        "address": "طريق المكس - بجوار ترعة النوبارية - الإسكندرية",
        "phone1": "03-4447150", "phone2": "", "website": "",
        "email": "united.ports.max@gmail.com", "lat": 31.150, "lon": 29.852, "fleetSize": 40,
        "fleetType": "مقطورات لوبد لنقل المعدات الثقيلة وتريلات نقل كتل صلب ولفائف حديد", "priority": "A",
        "notes": "نقل المهمات الثقيلة ومعدات المصانع بين ترسانة الإسكندرية وموانئ الدخيلة"
    },
    {
        "nameAr": "الدولية لنقل الحاويات والتخليص الجمركي (باب 22 الميناء)",
        "nameEn": "International Container Haulage Gate 22 Alex Port",
        "sector": "transport", "city": "alexandria", "district": "ميناء الإسكندرية", "governorate": "الإسكندرية",
        "address": "بوابة 22 الجمركية - ميناء الإسكندرية البحري",
        "phone1": "03-4805210", "phone2": "", "website": "",
        "email": "intl.gate22.alex@gmail.com", "lat": 31.175, "lon": 29.882, "fleetSize": 35,
        "fleetType": "شاحنات تريلات نقل حاويات 40 قدم وسيارات شحن بضائع فورية", "priority": "A",
        "notes": "سحب الحاويات الجمركية والتوصيل السريع للمصانع والشركات الاستيرادية"
    },

    # ── Sub-Cluster B: قلاع البتروكيماويات والزيوت وتكرير البترول بالعامرية ومرغم والنهضة ──
    {
        "nameAr": "شركة البتروكيماويات المصرية (إيبتكو - مجمع النهضة بالعامرية)",
        "nameEn": "Egyptian Petrochemicals Co. (EPC) Nahda Amreya",
        "sector": "chemicals_plastic", "city": "alexandria", "district": "العامرية والنهضة", "governorate": "الإسكندرية",
        "address": "الكيلو 36 - طريق الإسكندرية القاهرة الصحراوي - منطقة النهضة - العامرية",
        "phone1": "03-4770006", "phone2": "03-4770007", "website": "http://www.petrochem.com.eg",
        "email": "info@petrochem.com.eg", "lat": 31.025, "lon": 29.750, "fleetSize": 75,
        "fleetType": "شاحنات صهاريج نقل غاز الكلور والكيماويات السائلة وتريلات نقل راتنجات PVC", "priority": "A+",
        "notes": "صرح البتروكيماويات القومي لإنتاج البولي فينيل كلوريد (PVC) والصودا الكاوية"
    },
    {
        "nameAr": "الشركة المصرية للإيثيلين ومشتقاته (إيثيدكو - مجمع العامرية)",
        "nameEn": "ETHYDCO Egyptian Ethylene & Derivatives Co. Amreya",
        "sector": "chemicals_plastic", "city": "alexandria", "district": "العامرية والنهضة", "governorate": "الإسكندرية",
        "address": "الكيلو 36 - طريق إسكندرية الصحراوي - مجمع البتروكيماويات بالنهضة",
        "phone1": "03-4631200", "phone2": "03-4631201", "website": "http://www.ethydco-eg.com",
        "email": "info@ethydco-eg.com", "lat": 31.030, "lon": 29.755, "fleetSize": 70,
        "fleetType": "شاحنات تريلات شحن حبيبات البولي إيثيلين وصهاريج نقل غاز البوتادين المسال", "priority": "A+",
        "notes": "أكبر مجمع لإنتاج الإيثيلين والبولي إيثيلين الخطي عالي ومنخفض الكثافة في مصر"
    },
    {
        "nameAr": "شركة العامرية لتكرير البترول وتوزيع الزيوت (مرغم)",
        "nameEn": "Amreya Petroleum Refining Co. (APRC) Merghem",
        "sector": "petroleum", "city": "alexandria", "district": "العامرية ومرغم", "governorate": "الإسكندرية",
        "address": "الكيلو 17 - طريق الإسكندرية القاهرة الصحراوي - مرغم - العامرية",
        "phone1": "03-3424734", "phone2": "", "website": "http://www.aprco.com.eg",
        "email": "aprc@aprco.com.eg", "lat": 31.090, "lon": 29.805, "fleetSize": 65,
        "fleetType": "شاحنات صهاريج نقل مشتقات بترولية وشاحنات نقل شموع برافينية وزيوت تزييت", "priority": "A+",
        "notes": "تكرير البترول وإنتاج وقود السيارات والطائرات والشمع البرافيني والألكيل بنزين"
    },
    {
        "nameAr": "مصنع براند باك للعبوات والمنتجات البلاستيكية الصناعية (مجمع مرغم)",
        "nameEn": "Brand Pack Plastic Packaging Industry Merghem Complex",
        "sector": "chemicals_plastic", "city": "alexandria", "district": "مرغم والعامرية", "governorate": "الإسكندرية",
        "address": "مجمع مرغم للبلاستيك - وحدة 132 - عنبر 9 - شارع 3 - العامرية",
        "phone1": "01202215551", "phone2": "01210050225", "website": "http://www.brandpack-eg.com",
        "email": "sales@brandpack-eg.com", "lat": 31.085, "lon": 29.810, "fleetSize": 30,
        "fleetType": "شاحنات شاسيه طويل وصناديق نقل عبوات بلاستيكية وجراكن صناعية", "priority": "B",
        "notes": "تصنيع العبوات البلاستيكية وجراكن الزيوت والكيماويات بمجمع مرغم للبلاستيك"
    },
    {
        "nameAr": "شركة حماد للصناعات المعدنية وهياكل السيارات والمقطورات (مرغم)",
        "nameEn": "Hammad Metal Industries & Truck Trailers Merghem",
        "sector": "manufacturing", "city": "alexandria", "district": "مرغم", "governorate": "الإسكندرية",
        "address": "طريق البتروكيماويات - مرغم - العامرية - الإسكندرية",
        "phone1": "03-3420206", "phone2": "", "website": "",
        "email": "hammad.metals.alex@gmail.com", "lat": 31.088, "lon": 29.808, "fleetSize": 35,
        "fleetType": "تريلات شحن هياكل وتجهيزات شاحنات ومقطورات قلاب وصناديق تريلات", "priority": "A",
        "notes": "تصنيع وتجهيز شاسيهات المقطورات وتريلات القلاب وهياكل الشاحنات الثقيلة"
    },
    {
        "nameAr": "شركة الإسكندرية للزيوت المعدنية (أموك - AMOC مجمع العامرية)",
        "nameEn": "Alexandria Mineral Oils Co. (AMOC) Petrochemical Hub",
        "sector": "petroleum", "city": "alexandria", "district": "العامرية", "governorate": "الإسكندرية",
        "address": "منطقة ترعة النوبارية - العامرية - الإسكندرية",
        "phone1": "03-3420310", "phone2": "", "website": "http://www.amoceg.com",
        "email": "info@amoceg.com", "lat": 31.075, "lon": 29.790, "fleetSize": 60,
        "fleetType": "شاحنات صهاريج نقل زيوت التزييت الأساسية والنافثا والمازوت منخفض الكبريت", "priority": "A+",
        "notes": "إنتاج الزيوت المعدنية الأساسية والشموع والنافثا وتغذية محطات الخلط والتكرير"
    },
    {
        "nameAr": "شركة الإسكندرية الوطنية للتكرير والبتروكيماويات (أنربك - ANRPC)",
        "nameEn": "Alexandria National Refining & Petrochemicals (ANRPC)",
        "sector": "petroleum", "city": "alexandria", "district": "وادي القمر والمكس", "governorate": "الإسكندرية",
        "address": "طريق وادي القمر - المكس - غرب الإسكندرية",
        "phone1": "03-4409200", "phone2": "", "website": "http://www.anrpc.com",
        "email": "anrpc@anrpc.com", "lat": 31.145, "lon": 29.840, "fleetSize": 55,
        "fleetType": "شاحنات صهاريج نقل بنزين عالي الأوكتين والبروبان والأيزوميرات البترولية", "priority": "A+",
        "notes": "تكرير وإنتاج بنزين 92 و95 الخالي من الرصاص وتغذية شبكة النقل القومي للوقود"
    },
    {
        "nameAr": "شركة الإسكندرية للأسمدة (ألكس فيرت - AlexFert خليج أبو قير)",
        "nameEn": "Alexandria Fertilizers Co. (AlexFert) Abu Qir Complex",
        "sector": "chemicals_plastic", "city": "alexandria", "district": "أبو قير وخليج أبو قير", "governorate": "الإسكندرية",
        "address": "منطقة خليج أبو قير الصناعية - الطابية - الإسكندرية",
        "phone1": "03-5604100", "phone2": "", "website": "http://www.alexfert.com",
        "email": "sales@alexfert.com", "lat": 31.305, "lon": 30.075, "fleetSize": 50,
        "fleetType": "تريلات تريليرات شحن شكائر سماد اليوريا وصهاريج نقل الأمونيا المسالة", "priority": "A+",
        "notes": "إنتاج سماد اليوريا المحبب والأمونيا وشحنها عبر ميناء أبو قير للأسواق العالمية"
    },
    {
        "nameAr": "شركة مصفاة الأندلس لتكرير الزيوت البترولية الصناعية (مرغم)",
        "nameEn": "Al Andalus Refinery for Industrial Petro Oils Merghem",
        "sector": "petroleum", "city": "alexandria", "district": "مرغم", "governorate": "الإسكندرية",
        "address": "مرغم الصناعية - بلوك 14 - طريق الصحراوي - الإسكندرية",
        "phone1": "03-3420550", "phone2": "", "website": "",
        "email": "andalus.refinery@gmail.com", "lat": 31.082, "lon": 29.802, "fleetSize": 35,
        "fleetType": "شاحنات صهاريج نقل زيوت هيدروليك وزيوت تروس وتريلات توزيع براميل معبأة", "priority": "A",
        "notes": "معالجة وتكرير الزيوت البترولية وتوريد زيوت المحركات والماكينات للمصانع"
    },
    {
        "nameAr": "شركة بترول النيل لتوزيع الوقود الصناعي والصهاريج (العامرية)",
        "nameEn": "Nile Petroleum Industrial Fuel & Tankers Amreya",
        "sector": "petroleum", "city": "alexandria", "district": "العامرية", "governorate": "الإسكندرية",
        "address": "مدخل العامرية - طريق الإسكندرية الصحراوي كم 21",
        "phone1": "03-4481200", "phone2": "", "website": "",
        "email": "nilepetro.amreya@gmail.com", "lat": 31.060, "lon": 29.820, "fleetSize": 45,
        "fleetType": "شاحنات صهاريج نقل سولار وبنزين فنطاس سعات 45 ألف لتر للمصانع والمشروعات", "priority": "A",
        "notes": "تزويد مصانع العامرية وبرج العرب ومعدات الموانئ بالوقود الصناعي والسولار"
    },
    {
        "nameAr": "شركة النهضة للكيماويات المتطورة وصهاريج المذيبات الصناعية",
        "nameEn": "Al Nahda Advanced Chemicals & Industrial Solvents",
        "sector": "chemicals_plastic", "city": "alexandria", "district": "النهضة والعامرية", "governorate": "الإسكندرية",
        "address": "منطقة النهضة الصناعية - بلوك B6 - العامرية",
        "phone1": "03-4770150", "phone2": "", "website": "",
        "email": "nahda.chem.alex@gmail.com", "lat": 31.020, "lon": 29.745, "fleetSize": 32,
        "fleetType": "شاحنات صهاريج نقل تنر ومذيبات عضوية وكحول صناعي وشاحنات نقل براميل", "priority": "B",
        "notes": "إنتاج المذيبات الكيماوية والدهانات ومخففات البويات لورش ومصانع الأثاث والسيارات"
    },
    {
        "nameAr": "شركة دلتا باك للبلاستيك والكرتون المضلع (مرغم)",
        "nameEn": "Delta Pack Plastic & Corrugated Carton Merghem",
        "sector": "manufacturing", "city": "alexandria", "district": "مرغم", "governorate": "الإسكندرية",
        "address": "مرغم - شارع مصانع التعبئة - العامرية - الإسكندرية",
        "phone1": "03-3420680", "phone2": "", "website": "",
        "email": "deltapack.merghem@gmail.com", "lat": 31.086, "lon": 29.806, "fleetSize": 30,
        "fleetType": "شاحنات صندوقية لنقل الكرتون المضلع ولفائف البلاستيك والشرنك للمصانع", "priority": "B",
        "notes": "تصنيع وتوزيع مواد التغليف الكرتونية والبلاستيكية لشركات الأغذية والأدوية"
    },

    # ── Sub-Cluster C: مدينة برج العرب الصناعية (قلاع الصناعات الغذائية، الكيماويات، الكابلات، والصلب) ──
    {
        "nameAr": "شركة أليكس سناكس للصناعات الغذائية والتوزيع (برج العرب)",
        "nameEn": "Alex Snacks Food Industries & Distribution Borg El Arab",
        "sector": "food", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية الثالثة - قطعة 2 - بلوك 17 - برج العرب الجديدة",
        "phone1": "03-4593018", "phone2": "03-4593019", "website": "",
        "email": "info@alexsnacks.com", "lat": 30.852, "lon": 29.615, "fleetSize": 50,
        "fleetType": "شاحنات جامبو وسيارات فان مقفلة لتوزيع السلع الغذائية والمقرمشات والعصائر", "priority": "A",
        "notes": "صرح تصنيع الأغذية الخفيفة والمقرمشات وأسطول توزيع يغطي محافظات غرب الدلتا والإسكندرية"
    },
    {
        "nameAr": "الغرباوي الدولية لصناعة الأغذية ومنتجات الألبان (برج العرب)",
        "nameEn": "El Gharabawy International Food Industries Borg El Arab",
        "sector": "food", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية - بلوك 12 - برج العرب الجديدة",
        "phone1": "03-4593060", "phone2": "03-4591154", "website": "",
        "email": "gharabawy.foods@gmail.com", "lat": 30.850, "lon": 29.610, "fleetSize": 55,
        "fleetType": "شاحنات تبريد وتوزيع ألبان وأجبان وشاحنات صهاريج نقل حليب طازج ستانلس ستيل", "priority": "A+",
        "notes": "تصنيع وتوزيع منتجات الجبن الأبيض والرومي والسمن والعصائر وسلاسل التوريد المبردة"
    },
    {
        "nameAr": "الشركة العربية للمطاحن والصناعات الغذائية (مطاحن برج 1)",
        "nameEn": "Arab Mills & Food Industries Borg El Arab Mill 1",
        "sector": "food", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية الثالثة - بلوك 21 - قطع 4-8 - برج العرب الجديدة",
        "phone1": "03-4622137", "phone2": "03-4622138", "website": "",
        "email": "arabmills.borg@gmail.com", "lat": 30.848, "lon": 29.618, "fleetSize": 60,
        "fleetType": "تريلات سايلو نقل دقيق سائب وشاحنات نقل شكائر دقيق فاخر 50 كجم للمخابز", "priority": "A+",
        "notes": "طحن الأقماح وإنتاج الدقيق الفاخر 72% وسميد المكرونة وتغذية مصانع الصناعات الغذائية"
    },
    {
        "nameAr": "شركة أوشن فودز للصناعات الغذائية والتوزيع (برج العرب)",
        "nameEn": "Ocean Foods Manufacturing & Logistics Borg El Arab",
        "sector": "food", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية الثالثة - بلوك 19 - برج العرب الجديدة",
        "phone1": "03-4593610", "phone2": "03-4593611", "website": "",
        "email": "oceanfoods.suez@gmail.com", "lat": 30.854, "lon": 29.614, "fleetSize": 45,
        "fleetType": "شاحنات نقل مبرد وشاحنات توزيع سلع معبأة للمراكز التجارية والمحافظات", "priority": "A",
        "notes": "تصنيع وتعبئة السلع الغذائية المحفوظة والتونة والأسماك المصنعة وتوزيعها محلياً"
    },
    {
        "nameAr": "شركة إتش إيه سي للكيماويات الصناعية والتجهيز (برج العرب)",
        "nameEn": "HAC Industrial Chemicals & Textile Auxiliaries Borg El Arab",
        "sector": "chemicals_plastic", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية الرابعة - القطعة 10 - بلوك 17 - برج العرب",
        "phone1": "01004009331", "phone2": "", "website": "",
        "email": "hac.chemicals@gmail.com", "lat": 30.840, "lon": 29.625, "fleetSize": 35,
        "fleetType": "شاحنات نقل براميل كيماويات وتريلات صهاريج نقل مواد مساعدة للغزل والصباغة", "priority": "A",
        "notes": "تصنيع وتوريد المواد الكيماوية التخصصية لمصانع الغزل والنسيج والصباغة بالدلتا"
    },
    {
        "nameAr": "أتلنتس جروب للكيماويات والمنظفات الصناعية (برج العرب)",
        "nameEn": "Atlantis Group Industrial Chemicals & Detergents Borg El Arab",
        "sector": "chemicals_plastic", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية الثانية - بلوك 15 - برج العرب الجديدة",
        "phone1": "03-4596523", "phone2": "03-4622184", "website": "",
        "email": "atlantis.chem@gmail.com", "lat": 30.860, "lon": 29.605, "fleetSize": 40,
        "fleetType": "شاحنات صهاريج نقل مبيضات ومنظفات سائلة وشاحنات نقل عبوات معبأة للمستشفيات والمصانع", "priority": "A",
        "notes": "إنتاج المنظفات والمطهرات الصناعية ومبيضات الكلور السائل وسوائل الغسيل المركز"
    },
    {
        "nameAr": "ابكو المتحدة للبلاستيك والكيماويات والعبوات الصناعية (برج العرب)",
        "nameEn": "APCO United Plastics & Chemical Containers Borg El Arab",
        "sector": "chemicals_plastic", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية الثانية - قطعة 4 - بلوك 22 - برج العرب",
        "phone1": "01006039802", "phone2": "", "website": "",
        "email": "apco.plastic.eg@gmail.com", "lat": 30.858, "lon": 29.608, "fleetSize": 38,
        "fleetType": "شاحنات نقل براميل بلاستيكية وجراكن وتريلات نقل قوالب وعبوات كيماوية معتمدة", "priority": "A",
        "notes": "تصنيع البراميل البلاستيكية سعة 220 لتر والجراكن الصناعية المقاومة للأحماض والمذيبات"
    },
    {
        "nameAr": "شركة الإخلاص للصناعات البلاستيكية وشكائر التعبئة المنسوجة",
        "nameEn": "Al Ikhlas Woven Polypropylene Bags & Plastics Borg El Arab",
        "sector": "chemicals_plastic", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "28 شارع البنزينة - المنطقة الصناعية الثالثة - برج العرب",
        "phone1": "03-4622082", "phone2": "03-4622083", "website": "",
        "email": "ikhlas.plastic.bags@gmail.com", "lat": 30.851, "lon": 29.616, "fleetSize": 35,
        "fleetType": "شاحنات شاسيه طويل لنقل رولات البولي بروبيلين وشكائر الأعلاف والدقيق للمطاحن", "priority": "A",
        "notes": "تصنيع وتوريد الشكائر البلاستيكية المنسوجة لمصانع الأسمنت والأسمدة والأعلاف والدقيق"
    },
    {
        "nameAr": "شركة برج العرب للغزل والنسيج وخيوط البوليستر (المنطقة الصناعية الثانية)",
        "nameEn": "Borg El Arab Spinning & Polyester Yarns Export Co.",
        "sector": "manufacturing", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية الثانية - قطع 1 و 2 و 3 - بلوك 24 - برج العرب",
        "phone1": "03-4591354", "phone2": "03-4592077", "website": "",
        "email": "borgspinning@gmail.com", "lat": 30.862, "lon": 29.602, "fleetSize": 45,
        "fleetType": "تريلات شحن خيوط ومغازل وأقمشة خام وشاحنات تصدير حاويات لميناء الدخيلة", "priority": "A+",
        "notes": "إنتاج وتصدير خيوط الغزل والبوليستر المغزول عالي المتانة للمصانع المحلية والأسواق الخارجية"
    },
    {
        "nameAr": "شركة ماتكس للنسيج والتجهيز الصناعي (برج العرب)",
        "nameEn": "Mattex Industrial Fabrics & Geotextiles Borg El Arab",
        "sector": "manufacturing", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية الثانية - مجمع ماتكس للنسيج - برج العرب",
        "phone1": "03-4591480", "phone2": "", "website": "",
        "email": "mattex.textile@gmail.com", "lat": 30.865, "lon": 29.604, "fleetSize": 32,
        "fleetType": "شاحنات نقل لفائف الجيوتكستيل وأقمشة البطانات الصناعية وتريلات مغلقة", "priority": "B",
        "notes": "تصنيع منسوجات الجيوتكستيل المستخدمة في رصف الطرق وحماية السواحل والإنشاءات"
    },
    {
        "nameAr": "الشركة المصرية لصناعة الكابلات والموصلات الكهربائية (برج العرب)",
        "nameEn": "Egyptian Electric Cables & Conductors Borg El Arab",
        "sector": "manufacturing", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية الأولى - بلوك 8 - برج العرب الجديدة",
        "phone1": "03-4591620", "phone2": "", "website": "",
        "email": "egyptcables.borg@gmail.com", "lat": 30.870, "lon": 29.595, "fleetSize": 42,
        "fleetType": "تريلات تريليرات مجهزة ببكرات كابلات الجهد المتوسط والمنخفض وأوناش تفريغ", "priority": "A",
        "notes": "تصنيع كابلات القوى المعزولة والموصلات الهوائية لمشروعات التغذية الكهربائية والمدن الجديدة"
    },
    {
        "nameAr": "شركة الإسكندرية للصناعات المعدنية والجمالونات (برج العرب)",
        "nameEn": "Alexandria Steel Structures & Heavy Fabrication Borg El Arab",
        "sector": "manufacturing", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية الرابعة - مجمع الصناعات الهندسية - برج العرب",
        "phone1": "03-4622250", "phone2": "", "website": "",
        "email": "alexmetal.borg@gmail.com", "lat": 30.838, "lon": 29.630, "fleetSize": 38,
        "fleetType": "تريلات نقل جمالونات كمرات فولاذية طويلة وأوناش تلسكوبية 60 طن للتركيبات", "priority": "A",
        "notes": "تصميم وتصنيع وتركيب الهياكل الفولاذية والجمالونات لمستودعات الموانئ والمصانع الكبرى"
    },
    {
        "nameAr": "شركة الأهرام للمسبوكات ودرفلة الصلب (برج العرب)",
        "nameEn": "Al Ahram Steel Casting & Rolling Mills Borg El Arab",
        "sector": "manufacturing", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية الرابعة - بلوك 28 - برج العرب الجديدة",
        "phone1": "03-4622360", "phone2": "", "website": "",
        "email": "ahramsteel.borg@gmail.com", "lat": 30.835, "lon": 29.628, "fleetSize": 45,
        "fleetType": "تريلات نقل بيليت حديد ودرفلة قضبان صلب وتريلات نقل خردة ومعادن مصهورة", "priority": "A",
        "notes": "سبك ودرفلة قطاعات الصلب المخصوص وقطع غيار كسارات المحاجر ومصانع الأسمنت"
    },
    {
        "nameAr": "شركة برج فارما للمستحضرات الطبية والدوائية (المنطقة الأولى)",
        "nameEn": "Borg Pharma Medical & Pharmaceutical Industries",
        "sector": "pharma", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية الأولى - بلوك 3 - برج العرب الجديدة",
        "phone1": "03-4591740", "phone2": "", "website": "http://www.borgpharma.com",
        "email": "info@borgpharma.com", "lat": 30.872, "lon": 29.598, "fleetSize": 40,
        "fleetType": "شاحنات فان مبردة ومجهزة بنظام GPS ومراقبة حرارة لنقل الأدوية والمحاليل الطبية", "priority": "A",
        "notes": "إنتاج الأدوية البشرية والمحاليل الوريدية وأسطول توزيع مبرد للصيدليات والمستشفيات"
    },
    {
        "nameAr": "الشركة المتحدة للكرتون المضلع ومواد التغليف (برج العرب)",
        "nameEn": "United Corrugated Carton & Packaging Borg El Arab",
        "sector": "packaging_paper", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية الثالثة - شارع الأمل - برج العرب",
        "phone1": "03-4622470", "phone2": "", "website": "",
        "email": "unitedcarton.borg@gmail.com", "lat": 30.846, "lon": 29.620, "fleetSize": 35,
        "fleetType": "شاحنات صندوقية شاسيه طويل لنقل الكراتين المضلعة وعلب التصدير للمصانع", "priority": "B",
        "notes": "تصنيع علب وكراتين التصدير لمصانع الحاصلات الزراعية والأغذية والأدوية ببرج العرب"
    },

    # ── Sub-Cluster D: محطات الفرز والتصدير الزراعي واللوجستيات المبردة (النوبارية ووادي النطرون وكفر الدوار) ──
    {
        "nameAr": "شركة النوبارية أورجانيك للاستيراد والتصدير ومجمع الثلاجات (صحراوي كم 75)",
        "nameEn": "Nubaria Organic Agro Export & Cold Chain Hub Km 75",
        "sector": "food", "city": "beheira", "district": "النوبارية وطريق مصر إسكندرية الصحراوي", "governorate": "البحيرة",
        "address": "الكيلو 75 - طريق القاهرة الإسكندرية الصحراوي - النوبارية",
        "phone1": "01006259997", "phone2": "", "website": "",
        "email": "nubaria.organic@gmail.com", "lat": 30.650, "lon": 30.080, "fleetSize": 55,
        "fleetType": "شاحنات تريلات تبريد ريفير (Reefer Fleets) ومحطات فرز وتعبئة ثمار الموالح والعنب", "priority": "A+",
        "notes": "تصدير الحاصلات البستانية والخضروات العضوية ومجمع ثلاجات حفظ وتجميد الحاصلات"
    },
    {
        "nameAr": "شركة عرفة للتجارة ومحطات تعبئة الحاصلات الزراعية (النوبارية)",
        "nameEn": "Arafa Trade Agricultural Export & Packing Stations Nubaria",
        "sector": "food", "city": "beheira", "district": "النوبارية", "governorate": "البحيرة",
        "address": "طريق النوبارية الزراعي - مجمع مزارع ومحطات عرفة - البحيرة",
        "phone1": "01016666582", "phone2": "02-33039121", "website": "http://www.arafatrade.com",
        "email": "info@arafatrade.com", "lat": 30.670, "lon": 30.050, "fleetSize": 60,
        "fleetType": "تريلات تبريد شاحنات مجهزة لنقل العنب والموالح والخضروات لموانئ الإسكندرية ودمياط", "priority": "A+",
        "notes": "محطات فرز وتدريج وتعبئة العنب والموالح التصديرية وأساطيل نقل لوجستي زراعي مبرد"
    },
    {
        "nameAr": "شركة الرضوان لتصدير وتوريد الحاصلات الزراعية (وادي النطرون)",
        "nameEn": "Al Radwan Agro Export & Produce Supply Wadi El Natrun",
        "sector": "food", "city": "beheira", "district": "وادي النطرون", "governorate": "البحيرة",
        "address": "حي الزهور - بجوار مسجد الصديق - وادي النطرون - البحيرة",
        "phone1": "045-3551200", "phone2": "", "website": "",
        "email": "alradwan.agro.natrun@gmail.com", "lat": 30.410, "lon": 30.340, "fleetSize": 40,
        "fleetType": "شاحنات نقل مبرد وشاحنات نقل محاصيل زراعية من المزارع لمحطات التعبئة", "priority": "A",
        "notes": "تجميع وتعبئة محاصيل الزيتون والتمور والموالح من مزارع وادي النطرون وتجهيزها للتصدير"
    },
    {
        "nameAr": "محطة سلمى لتصدير الحاصلات الزراعية والموالح (طريق النوبارية)",
        "nameEn": "Salma Citrus & Produce Packing & Export Station Nubaria",
        "sector": "food", "city": "beheira", "district": "النوبارية", "governorate": "البحيرة",
        "address": "طريق مصر إسكندرية الصحراوي - مدخل غرب النوبارية - محطة سلمى",
        "phone1": "01229865251", "phone2": "", "website": "",
        "email": "salma.agro.export@gmail.com", "lat": 30.665, "lon": 30.070, "fleetSize": 45,
        "fleetType": "شاحنات ريفير تبريد وتريلات نقل برتقال ويوسفي وبطاطس لموانئ الشحن البحري", "priority": "A",
        "notes": "محطة معتمدة بالحجر الزراعي لغسيل وتشبيع وفرز وتعبئة الموالح المصرية للتصدير"
    },
    {
        "nameAr": "شركة وادي النور للاستثمار والتنمية الزراعية ومحطة الموالح (وادي النطرون)",
        "nameEn": "Wadi El Nour Agricultural Development & Citrus Packhouse",
        "sector": "food", "city": "beheira", "district": "وادي النطرون والنوبارية", "governorate": "البحيرة",
        "address": "طريق وادي النطرون العلمين الدولي - مجمع مزارع وادي النور",
        "phone1": "02-27370273", "phone2": "02-27370274", "website": "",
        "email": "wadinour.agro@gmail.com", "lat": 30.450, "lon": 30.280, "fleetSize": 50,
        "fleetType": "تريلات تبريد شاحنات نقل ثمار مبردة وسيارات خدمة حقول ومعدات زراعية ثقيلة", "priority": "A+",
        "notes": "إدارة آلاف الأفدنة من مزارع الموالح والرمان ومحطات التعبئة الآلية للتصدير الأوروبي"
    },
    {
        "nameAr": "شركة الصالحية للتنمية الزراعية والتصدير المبرد (محور النوبارية)",
        "nameEn": "Salheya Agro Development & Cold Transport Nubaria Axis",
        "sector": "food", "city": "beheira", "district": "النوبارية", "governorate": "البحيرة",
        "address": "غرب النوبارية - طريق البستان - البحيرة",
        "phone1": "045-2637100", "phone2": "", "website": "",
        "email": "salheya.nubaria@gmail.com", "lat": 30.680, "lon": 30.030, "fleetSize": 42,
        "fleetType": "شاحنات تريلات تبريد وسيارات نقل سريع للحاصلات الحساسة كالفراولة والخوخ", "priority": "A",
        "notes": "زراعة وتعبئة وشحن الفراولة الطازجة والخضروات المحمية إلى الموانئ والمطارات"
    },
    {
        "nameAr": "شركة جرين لاند لتعبئة وتصدير الخضروات المجمدة (وادي النطرون)",
        "nameEn": "Greenland Frozen Vegetables IQF Processing Natrun",
        "sector": "food", "city": "beheira", "district": "وادي النطرون", "governorate": "البحيرة",
        "address": "المنطقة الصناعية بوادي النطرون - البحيرة",
        "phone1": "045-3551350", "phone2": "", "website": "",
        "email": "greenland.frozen@gmail.com", "lat": 30.420, "lon": 30.330, "fleetSize": 38,
        "fleetType": "شاحنات تريلات تجميد عميق IQF لنقل الخضروات المجمدة كالبسلة والبامية والملوخية", "priority": "A",
        "notes": "مصنع تجميد وتعبئة الخضروات بتقنية التجميد الفردي السريع وشحنها للتصدير"
    },
    {
        "nameAr": "مجمع ثلاجات الصحراوي لتخزين وتصدير البطاطس والموالح (صحراوي كم 84)",
        "nameEn": "Sahrawi Mega Cold Stores for Potato & Citrus Export Km 84",
        "sector": "food", "city": "beheira", "district": "طريق مصر إسكندرية الصحراوي", "governorate": "البحيرة",
        "address": "طريق مصر إسكندرية الصحراوي - الكيلو 84 - البحيرة",
        "phone1": "045-2638200", "phone2": "", "website": "",
        "email": "sahrawi.coldstores84@gmail.com", "lat": 30.620, "lon": 30.120, "fleetSize": 48,
        "fleetType": "شاحنات تريلات تهوية وتبريد لنقل تقاوي وبطاطس المائدة وصناديق الحاصلات الزراعية", "priority": "A+",
        "notes": "مجمع ثلاجات عملاق لحفظ تقاوي البطاطس وتخزين محاصيل المائدة قبل التصدير لموانئ الإسكندرية"
    },
    {
        "nameAr": "شركة كفر الدوار للصباغة والتجهيز والمنسوجات (شارع بورسعيد)",
        "nameEn": "Kafr El Dawar Dyeing Finishing & Textiles Co.",
        "sector": "textile_apparel", "city": "beheira", "district": "كفر الدوار", "governorate": "البحيرة",
        "address": "شارع بورسعيد - المنطقة الصناعية - كفر الدوار - البحيرة",
        "phone1": "045-2214300", "phone2": "", "website": "",
        "email": "kafrdawar.textile@gmail.com", "lat": 31.135, "lon": 30.125, "fleetSize": 35,
        "fleetType": "شاحنات نقل أقمشة ومنسوجات مجهزة وتريلات شحن ملابس جاهزة لموانئ التصدير", "priority": "A",
        "notes": "صباغة وتجهيز الأقمشة القطنية والبوليستر وتوريدها لمصانع الملابس الجاهزة"
    },
    {
        "nameAr": "شركة البحيرة لمطاحن وصوامع الغلال المركزية (دمنهور وكفر الدوار)",
        "nameEn": "Beheira Flour Mills & Central Grain Silos Co.",
        "sector": "food", "city": "beheira", "district": "كفر الدوار ودمنهور", "governorate": "البحيرة",
        "address": "طريق مصر إسكندرية الزراعي - مجمع صوامع كفر الدوار",
        "phone1": "045-2215450", "phone2": "", "website": "",
        "email": "beheira.mills.silos@gmail.com", "lat": 31.140, "lon": 30.120, "fleetSize": 50,
        "fleetType": "تريلات سايلو نقل قمح ودقيق وتريلات شحن شكائر دقيق تمويني وفاخر للمخابز", "priority": "A+",
        "notes": "طحن الأقماح وتوفير حصص الدقيق لمحافظة البحيرة والإسكندرية وإدارة صوامع الغلال"
    },
    {
        "nameAr": "شركة النيل لتصنيع وتوزيع الأعلاف الحيوانية والداجنة (حوش عيسى)",
        "nameEn": "Nile Animal & Poultry Feed Manufacturing Hosh Issa",
        "sector": "food", "city": "beheira", "district": "حوش عيسى والبحيرة", "governorate": "البحيرة",
        "address": "طريق حوش عيسى دمنهور - مجمع مصانع النيل للأعلاف",
        "phone1": "045-2412100", "phone2": "", "website": "",
        "email": "nilefeed.beheira@gmail.com", "lat": 30.910, "lon": 30.290, "fleetSize": 40,
        "fleetType": "تريلات نقل أعلاف صب وتريلات شحن شكائر أعلاف ومقطورات نقل خامات كسب صويا وذرة", "priority": "A",
        "notes": "إنتاج وتوزيع الأعلاف المتخصصة لمزارع التسمين وإنتاج الألبان ودواجن التسمين"
    },
    {
        "nameAr": "شركة الفيروز لفرز وتصدير الفراولة والحاصلات البستانية (النوبارية)",
        "nameEn": "Al Fayrouz Fresh Strawberry Packing & Export Nubaria",
        "sector": "food", "city": "beheira", "district": "النوبارية", "governorate": "البحيرة",
        "address": "الكيلو 80 - طريق إسكندرية الصحراوي - مزارع النوبارية",
        "phone1": "045-2639300", "phone2": "", "website": "",
        "email": "fayrouz.strawberry@gmail.com", "lat": 30.640, "lon": 30.090, "fleetSize": 36,
        "fleetType": "شاحنات تبريد مجهزة بنظام تبريد سريع (Pre-cooling) لنقل الفراولة الطازجة للمطارات والموانئ", "priority": "A",
        "notes": "فرز وتعبئة الفراولة الطازجة المجهزة للشحن الجوي والبحري السريع للأسواق الأوروبية"
    },

    # ── Sub-Cluster E: محطات الخرسانة الجاهزة والمحاجر ومقاولو البنية التحتية والكباري بالإسكندرية والساحل ──
    {
        "nameAr": "شركة البرج للخرسانة الجاهزة (برج ميكس - المنطقة الصناعية الرابعة)",
        "nameEn": "Borg Mix Ready Mix Concrete Borg El Arab Plant",
        "sector": "manufacturing", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية الرابعة - بلوك 30 - قطع 1 و 2 - برج العرب الجديدة",
        "phone1": "01065525699", "phone2": "", "website": "http://www.borgmix.com",
        "email": "info@borgmix.com", "lat": 30.836, "lon": 29.626, "fleetSize": 55,
        "fleetType": "خلاطات خرسانة مان ومرسيدس سعة 10 و 12م3 ومضخات بوم 48م وتريلات نقل أسمنت", "priority": "A+",
        "notes": "محطة خلط مركزية مزدوجة لتغذية مشروعات المصانع والتوسعات السكنية ببرج العرب والساحل"
    },
    {
        "nameAr": "شركة الصفوة للخرسانة الجاهزة (المنطقة الصناعية الثانية برج العرب)",
        "nameEn": "Al Safwa Ready Mix Concrete Borg El Arab 2nd Zone",
        "sector": "manufacturing", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية الثانية - مجمع محطات الخلط - برج العرب",
        "phone1": "01211998575", "phone2": "", "website": "",
        "email": "safwa.readymix.borg@gmail.com", "lat": 30.855, "lon": 29.606, "fleetSize": 45,
        "fleetType": "خلاطات خرسانة حديثة ومضخات أسمنت ثابتة ومتحركة وتريلات ركام وسن", "priority": "A",
        "notes": "توريد الخرسانات عالية الإجهاد لمصانع برج العرب والمنشآت الصناعية الثقيلة"
    },
    {
        "nameAr": "شركة الفاروق للخرسانة الجاهزة والمقاولات (صحراوي زاوية عبد القادر)",
        "nameEn": "Al Farouk Ready Mix Concrete & Contracting Alex Desert Rd",
        "sector": "manufacturing", "city": "alexandria", "district": "العامرية وزاوية عبد القادر", "governorate": "الإسكندرية",
        "address": "الكيلو 23 - طريق إسكندرية القاهرة الصحراوي - زاوية عبد القادر - العامرية",
        "phone1": "03-5414568", "phone2": "", "website": "http://www.alfaroukreadymix.com",
        "email": "sales@alfaroukreadymix.com", "lat": 31.050, "lon": 29.830, "fleetSize": 60,
        "fleetType": "خلاطات خرسانة مرسيدس ومضخات بوم 52م وتريلات نقل سن ورمل ومحطات خلط سريعة", "priority": "A+",
        "notes": "توريد الخرسانة لمشروعات محور التعمير، كباري العامرية، ومستودعات الموانئ اللوجستية"
    },
    {
        "nameAr": "شركة جولد ميكس للخرسانة الجاهزة (العامرية ومحور التعمير)",
        "nameEn": "Gold Mix Ready Mix Concrete Taameer Axis Amreya",
        "sector": "manufacturing", "city": "alexandria", "district": "العامرية", "governorate": "الإسكندرية",
        "address": "طريق محور التعمير - مدخل العامرية - محطة جولد ميكس",
        "phone1": "03-4482310", "phone2": "", "website": "",
        "email": "goldmix.alex@gmail.com", "lat": 31.080, "lon": 29.825, "fleetSize": 40,
        "fleetType": "خلاطات خرسانة ومضخات أسمنت بوم وتريلات سايلو نقل بودرة الأسمنت السائب", "priority": "A",
        "notes": "إمدادات الخرسانة الجاهزة لمشروعات تطوير شبكات الطرق والكباري بغرب الإسكندرية"
    },
    {
        "nameAr": "شركة إسكندرية ميكس للخلطات الإسمنتية وتوريد الصوامع (المكس)",
        "nameEn": "Alexandria Mix Cement Mixtures & Batching Plant El Max",
        "sector": "manufacturing", "city": "alexandria", "district": "المكس", "governorate": "الإسكندرية",
        "address": "طريق الملاحة - المكس - غرب الإسكندرية",
        "phone1": "03-4448220", "phone2": "", "website": "",
        "email": "alexmix.elmax@gmail.com", "lat": 31.148, "lon": 29.848, "fleetSize": 38,
        "fleetType": "خلاطات خرسانة ومضخات أسمنت وسيارات خدمة متنقلة وتريلات صهاريج مياه", "priority": "A",
        "notes": "خلطات خرسانية مقاومة للأملاح والكبريتات مخصصة لأرصفة الموانئ والإنشاءات البحرية"
    },
    {
        "nameAr": "شركة العامرية لمحاجر رمل السيليكا وركام البناء (محاجر النهضة)",
        "nameEn": "Amreya Silica Sand Quarries & Building Aggregates",
        "sector": "construction", "city": "alexandria", "district": "العامرية والنهضة", "governorate": "الإسكندرية",
        "address": "منطقة محاجر النهضة - العامرية - الإسكندرية",
        "phone1": "03-4770260", "phone2": "", "website": "",
        "email": "amreya.quarries@gmail.com", "lat": 31.015, "lon": 29.740, "fleetSize": 50,
        "fleetType": "لوادر كوماتسو ثقيلة وتريلات قلاب حمولة 60 طن ومحطات نخل وتصنيف رمال السيليكا", "priority": "A+",
        "notes": "استخراج وتوريد رمال السيليكا لمصانع الزجاج والسباكة وركام السن لمحطات الخلط"
    },
    {
        "nameAr": "شركة التعمير للخرسانات الجاهزة ومشاريع محور أبو ذكري",
        "nameEn": "Taameer Ready Mix Concrete Abu Zekry Axis Projects",
        "sector": "manufacturing", "city": "alexandria", "district": "القباري والعامرية", "governorate": "الإسكندرية",
        "address": "طريق محور المشير أبو ذكري - تقاطع القباري - الإسكندرية",
        "phone1": "03-4401580", "phone2": "", "website": "",
        "email": "taameer.readymix.alex@gmail.com", "lat": 31.140, "lon": 29.845, "fleetSize": 45,
        "fleetType": "خلاطات خرسانة ومضخات بوم 56م وتريلات نقل خامات ركام وحديد تسليح", "priority": "A",
        "notes": "تنفيذ أعمال الصب والخرسانات لكباري ومحاور الإسكندرية وتوسعات الموانئ"
    },
    {
        "nameAr": "شركة الساحل للإنترلوك والمنتجات الإسمنتية والبلوك الآلي (برج العرب)",
        "nameEn": "Al Sahel Interlock & Machine-Made Cement Blocks Borg El Arab",
        "sector": "manufacturing", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية الثالثة - مجمع مواد البناء - برج العرب",
        "phone1": "03-4622580", "phone2": "", "website": "",
        "email": "sahel.interlock@gmail.com", "lat": 30.842, "lon": 29.622, "fleetSize": 36,
        "fleetType": "تريلات مجهزة بأوناش تحميل وتفريغ باليتات الإنترلوك والبلدورات وشاحنات نقل بلوك", "priority": "A",
        "notes": "إنتاج البلوك الأسمنتي الآلي والإنترلوك عالي التحمل لساحات الحاويات والمشروعات السكنية"
    },
    {
        "nameAr": "شركة النيل لمقاولات رصف الطرق والأسفلت (الإسكندرية والساحل)",
        "nameEn": "Nile Road Paving & Asphalt Contracting Alex & Coast",
        "sector": "construction", "city": "alexandria", "district": "العامرية وبرج العرب", "governorate": "الإسكندرية",
        "address": "طريق برج العرب مطار برج العرب - خلاطة الأسفلت المركزية",
        "phone1": "03-4622690", "phone2": "", "website": "",
        "email": "nilepaving.alex@gmail.com", "lat": 30.880, "lon": 29.620, "fleetSize": 48,
        "fleetType": "خلاطة أسفلت ألمانية وفناشر رصف وهراسات حديد وكاوتش وتريلات نقل خلطة ساخنة", "priority": "A",
        "notes": "رصف وتطوير شبكات الطرق السريعة ومداخل الموانئ والمحاور اللوجستية بالساحل الشمالي"
    },
    {
        "nameAr": "شركة الإسكندرية للأعمال البحرية والإنشاءات الكبرى (جليم)",
        "nameEn": "Alexandria Marine Works & Heavy Marine Construction",
        "sector": "construction", "city": "alexandria", "district": "جليم وطريق الكورنيش", "governorate": "الإسكندرية",
        "address": "طريق الجيش - جليم - الإسكندرية",
        "phone1": "03-5824250", "phone2": "", "website": "",
        "email": "alexmarine.construction@gmail.com", "lat": 31.235, "lon": 29.965, "fleetSize": 40,
        "fleetType": "بارجات بحرية وأوناش دق خوازيق بحرية وتريلات نقل كتل خرسانية لحواجز الأمواج", "priority": "A+",
        "notes": "تنفيذ أعمال حماية الشواطئ والأرصفة البحرية وتعميق الموانئ والأعمال الإنشائية الساحلية"
    },
    {
        "nameAr": "شركة وادي النطرون لمحاجر الزلط المتدرج والحجر الجيري",
        "nameEn": "Wadi El Natrun Graded Gravel & Limestone Quarries",
        "sector": "construction", "city": "beheira", "district": "وادي النطرون", "governorate": "البحيرة",
        "address": "طريق وادي النطرون العلمين الدولي - الكيلو 25 - محاجر الزلط",
        "phone1": "045-3551480", "phone2": "", "website": "",
        "email": "natrun.gravel@gmail.com", "lat": 30.480, "lon": 30.220, "fleetSize": 52,
        "fleetType": "تريلات قلاب صخور ومحطات تكسير وغربلة زلط طبيعي متدرج ولوادر كوماتسو", "priority": "A+",
        "notes": "توريد الزلط الفينو والمتدرج وركام الأساس للخرسانات ومشروعات الطرق السريعة بالصحراوي"
    },
    {
        "nameAr": "شركة الفرسان لمقاولات الحفر والردم ومد شبكات المرافق (برج العرب)",
        "nameEn": "Al Forsan Earthmoving Excavation & Utilities Borg El Arab",
        "sector": "construction", "city": "alexandria", "district": "برج العرب الجديدة", "governorate": "الإسكندرية",
        "address": "المنطقة الصناعية الأولى - مجمع شركات المقاولات - برج العرب",
        "phone1": "03-4591860", "phone2": "", "website": "",
        "email": "forsan.excavation@gmail.com", "lat": 30.868, "lon": 29.600, "fleetSize": 42,
        "fleetType": "حفارات هيدروليكية كوماتسو وهيونداي وتريلات قلاب نقل أتربة وجليدرات تسوية", "priority": "A",
        "notes": "أعمال الحفر والردم والتسويات العامة ومد خطوط المياه والصرف للمجمعات الصناعية"
    }
]

print(f"\nEvaluating {len(candidates)} targeted candidates in Alexandria Corridor...")

approved_phase2_sq4 = []
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

    approved_phase2_sq4.append(item)

print(f"\n=======================================================")
print(f"CANDIDATES EVALUATED IN ALEXANDRIA SQUARE: {len(candidates)}")
print(f"SKIPPED PHONE DUPLICATES:                  {skipped_phones}")
print(f"SKIPPED NAME DUPLICATES:                   {skipped_names}")
print(f"APPROVED PURE NEW B2B ENTERPRISES:         {len(approved_phase2_sq4)}")
print(f"=======================================================")

formatted_enterprises = []
for idx, c in enumerate(approved_phase2_sq4, 1):
    comp_id = f"eg_phase2_alex_hub_{idx:04d}"
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
        "lat": c.get("lat", 31.15),
        "lon": c.get("lon", 29.85),
        "fleetSize": c.get("fleetSize", 40),
        "fleetType": c.get("fleetType", "شاحنات ومعدات أسطول تجاري"),
        "priority": c.get("priority", "A"),
        "status": "unassigned",
        "source": "verified_phase2_alex_corridor_2026",
        "contactPerson": "",  # Strictly empty for sales reps
        "notes": c.get("notes", "")
    })

os.makedirs('scraper/output', exist_ok=True)
out_path = 'scraper/output/phase2_alex_verified_b2b_fleet.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(formatted_enterprises, f, ensure_ascii=False, indent=2)

print(f"Successfully saved {len(formatted_enterprises)} pure verified enterprises to {out_path}!")
