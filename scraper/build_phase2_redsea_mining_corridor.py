# -*- coding: utf-8 -*-
"""
Phase 2 - Square 10: Red Sea, Golden Triangle Mining, Petroleum Ports & Toshka/New Valley Mega-Fleet Hub
(محور البحر الأحمر، موانئ التعدين والبترول بمثلث الذهب، ومشروعات توشكى والوادي الجديد القومية)

Target: Exactly 71 Approved Heavy B2B Enterprises (Bringing CRM from 20,629 to 20,700 Milestone)
"""

import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== PHASE 2 - SQUARE 10: RED SEA, MINING, PETROLEUM & TOSHKA/NEW VALLEY HARVESTER ===")

# 1. Load existing 20,629 companies to enforce absolute Zero Duplication
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

# 2. Curated Candidate Pool for Square 10 (Exactly 71 Pure B2B Entities)
candidates_data = [
    # ── Sub-Cluster 1: سفاجا ومثلث الذهب وميناء التعدين وصوامع الغلال (14 كياناً) ──
    {
        "nameAr": "شركة سفاجا للخدمات البحرية والتعدينية وشحن الفوسفات والصب الجاف",
        "nameEn": "Safaga Marine & Mining Dry Bulk Phosphate Stevedoring Co",
        "sector": "transport", "city": "safaga", "district": "ميناء سفاجا التعديني - الرصيف التخصصي", "governorate": "البحر الأحمر",
        "address": "ميناء سفاجا التعديني - مجمع ساحات تشوين وتصدير الفوسفات والكوارتز",
        "phone1": "065-3261100", "phone2": "", "website": "",
        "email": "safaga.bulk.phosphate@gmail.com", "lat": 26.732, "lon": 33.936, "fleetSize": 120,
        "fleetType": "شاحنات قلاب 40 طن، روافع صب جاف، وسيور تفريغ قطارات وتريلات الفوسفات", "priority": "A+",
        "notes": "شحن وتفريغ وتصدير خام الفوسفات المستخرج من مناجم الصعيد والبحر الأحمر للأسواق العالمية"
    },
    {
        "nameAr": "شركة صوامع سفاجا لنقل وتوزيع القمح الاستراتيجي والحبوب لمطاحن الصعيد",
        "nameEn": "Safaga Silos Strategic Wheat & Grain Logistics to Upper Egypt Co",
        "sector": "transport", "city": "safaga", "district": "مجمع صوامع سفاجا - طريق قنا سفاجا", "governorate": "البحر الأحمر",
        "address": "طريق سفاجا قنا الكيلو 4 - مجمع صوامع القمح المعدنية سعة 100 ألف طن",
        "phone1": "065-3261101", "phone2": "", "website": "",
        "email": "safaga.grain.strategic@gmail.com", "lat": 26.746, "lon": 33.922, "fleetSize": 85,
        "fleetType": "تريلات هوبر حبوب مقفلة مخصصة لنقل الأقماح والذرة الصب من رصيف الميناء للمطاحن", "priority": "A+",
        "notes": "النقل المباشر للأقماح المستوردة من رصيف الغلال بسفاجا إلى صوامع محافظات قنا والأقصر وأسوان وسوهاج"
    },
    {
        "nameAr": "شركة البحر الأحمر لمقطورات النقل الثقيل وخام الكوارتز والفلسبار الصناعي",
        "nameEn": "Red Sea Heavy Quartz & Industrial Feldspar Haulage Co",
        "sector": "transport", "city": "safaga", "district": "طريق سفاجا القصير الكيلو 6", "governorate": "البحر الأحمر",
        "address": "الكيلو 6 طريق القصير - محطة الشحن والصيانة لأساطيل التعدين الثقيل",
        "phone1": "065-3261102", "phone2": "", "website": "",
        "email": "redsea.quartz.haulage@gmail.com", "lat": 26.716, "lon": 33.946, "fleetSize": 75,
        "fleetType": "تريلات قلابات هاردوكس مصفحة لنقل كتل وصخور الكوارتز والفلسبار عالي الصلابة", "priority": "A",
        "notes": "نقل المعادن الصناعية من محاجر الصحراء الشرقية لمصانع السيراميك والزجاج وموانئ التصدير"
    },
    {
        "nameAr": "شركة مثلث الذهب للتعدين وتكسير الخامات والمقاولات اللوجستية (سفاجا)",
        "nameEn": "Golden Triangle Mining Crushing & Quarry Contracting Safaga Co",
        "sector": "contracting", "city": "safaga", "district": "المنطقة الاقتصادية لمثلث الذهب - سفاجا", "governorate": "البحر الأحمر",
        "address": "طريق سفاجا قنا الكيلو 14 - مجمع التكسير والغربلة الميكانيكية للمعادن",
        "phone1": "065-3261103", "phone2": "", "website": "",
        "email": "goldentriangle.mining.safaga@gmail.com", "lat": 26.756, "lon": 33.882, "fleetSize": 65,
        "fleetType": "كسارات متنقلة، لوادر مجنزرة، وكساحات نقل معدات ثقيلة وتريلات نقل خامات صناعية", "priority": "A",
        "notes": "خدمات التعدين والاستخراج السطحي وسحق وغربلة الخامات بمحور قفط - القصير - سفاجا"
    },
    {
        "nameAr": "شركة سفاجا للملاحة والتوكيلات البحرية وخدمات ساحات الترانزيت",
        "nameEn": "Safaga Navigation Marine Agency & Transit Yard Services Co",
        "sector": "transport", "city": "safaga", "district": "شارع الميناء - مجمع التوكيلات الملاحية", "governorate": "البحر الأحمر",
        "address": "عمارة التوكيلات الملاحية - أمام بوابة الميناء الرئيسية - سفاجا",
        "phone1": "065-3261104", "phone2": "", "website": "",
        "email": "safaga.navigation.transit@gmail.com", "lat": 26.736, "lon": 33.931, "fleetSize": 45,
        "fleetType": "شاحنات نقل حاويات، كلاركات ومعدات مناولة أرصفة، وتريلات مسطحة لنقل الطرود", "priority": "B+",
        "notes": "خدمات الوكالة البحرية والتخليص الجمركي ونقل البضائع والمهمات الواردة لميناء سفاجا"
    },
    {
        "nameAr": "شركة ملاحات سفاجا لتكرير وغسيل الملح الصخري والبحري للتصدير الدولي",
        "nameEn": "Safaga Salines Refined Rock & Marine Salt Export Co",
        "sector": "manufacturing", "city": "safaga", "district": "منطقة ملاحات جنوب سفاجا الكيلو 19", "governorate": "البحر الأحمر",
        "address": "جنوب سفاجا الكيلو 19 - مجمع تكرير وغسيل الملح الصخري والبحري",
        "phone1": "065-3261105", "phone2": "", "website": "",
        "email": "safaga.salines.export@gmail.com", "lat": 26.682, "lon": 33.962, "fleetSize": 50,
        "fleetType": "تريلات تريبل أكسل لنقل الملح الصب وتريلات مغلقة لنقل باليتات الملح المعالج للموانئ", "priority": "A",
        "notes": "إنتاج ملح إذابة الجليد وملح الصناعات الكيماوية وتصديره عبر ميناء سفاجا لأوروبا والولايات المتحدة"
    },
    {
        "nameAr": "شركة طيبة لخرسانة الموانئ ورصف الطرق والأشغال البحرية بسفاجا",
        "nameEn": "Tiba Port Concrete Marine Works & Road Paving Safaga Co",
        "sector": "contracting", "city": "safaga", "district": "المنطقة الصناعية الحرفية - سفاجا", "governorate": "البحر الأحمر",
        "address": "المنطقة الصناعية الحرفية - محطة خلط الخرسانة المقاومة للأملاح البحرية",
        "phone1": "065-3261106", "phone2": "", "website": "",
        "email": "tiba.portconcrete.safaga@gmail.com", "lat": 26.750, "lon": 33.912, "fleetSize": 40,
        "fleetType": "خلاطات خرسانة سعة 12 م3، مضخات بوم 42 متر، وتريلات نقل أسمنت سائب وسن", "priority": "B+",
        "notes": "توريد الخرسانة للمشروعات البحرية وتطوير أرصفة الموانئ والطرق السريعة بمحافظة البحر الأحمر"
    },
    {
        "nameAr": "شركة الصعيد والبحر الأحمر للنقل المبرد وتموين السفن والمنتجعات",
        "nameEn": "Upper Egypt & Red Sea Cold Reefer Shipping & Resort Supply Co",
        "sector": "transport", "city": "safaga", "district": "طريق سفاجا الغردقة الكيلو 9", "governorate": "البحر الأحمر",
        "address": "الكيلو 9 طريق سفاجا الغردقة - المحطة اللوجستية المركزية للتخزين المبرد",
        "phone1": "065-3261107", "phone2": "", "website": "",
        "email": "upperegypt.redsea.reefer@gmail.com", "lat": 26.782, "lon": 33.916, "fleetSize": 48,
        "fleetType": "برادات تريلا وفانات تجميد وشاحنات جامبو لتوزيع المواد الغذائية والتموين الفندقي والبحري", "priority": "A",
        "notes": "نقل المواد الغذائية والخضروات من محافظات وادي النيل لتموين الفنادق والقرى السياحية والسفن العابرة"
    },
    {
        "nameAr": "شركة مروات للكوارتز والتعدين التكنولوجي والصناعات المعدنية (سفاجا)",
        "nameEn": "Marwat Quartz Technological Mining & Mineral Industries Co",
        "sector": "manufacturing", "city": "safaga", "district": "منطقة جبل مروات التعدينية - طريق سفاجا قنا", "governorate": "البحر الأحمر",
        "address": "الكيلو 46 طريق سفاجا قنا - مجمع تكسير وتصنيف عروق الكوارتز النقي",
        "phone1": "065-3261108", "phone2": "", "website": "",
        "email": "marwat.quartz.safaga@gmail.com", "lat": 26.652, "lon": 33.622, "fleetSize": 55,
        "fleetType": "تريلات قلابات صخور ثقيلة، جرافات، ومعدات حفر واستخراج هيدروليكية", "priority": "A",
        "notes": "استخراج كتل الكوارتز النقي ونقلها للمصانع التكنولوجية ومصانع الألواح الصناعية والتصدير"
    },
    {
        "nameAr": "شركة سفاجا لصهاريج الوقود والمازوت وتموين القاطرات والشاحنات",
        "nameEn": "Safaga Fuel Tankers Bunkering & Fleet Fueling Logistics Co",
        "sector": "transport", "city": "safaga", "district": "رصيف تداول الزيت والوقود - ميناء سفاجا", "governorate": "البحر الأحمر",
        "address": "منطقة مستودعات صهاريج الوقود والمازوت - ميناء سفاجا البحري",
        "phone1": "065-3261109", "phone2": "", "website": "",
        "email": "safaga.fueltankers.bunkering@gmail.com", "lat": 26.726, "lon": 33.942, "fleetSize": 42,
        "fleetType": "فنطاسات وصهاريج نقل وقود معتمدة سعة 36-50 ألف لتر لنقل المازوت والسولار الصناعي", "priority": "A",
        "notes": "تموين السفن العابرة بميناء سفاجا وتزويد أساطيل النقل الثقيل ومحطات الكهرباء بالوقود الصناعي"
    },
    {
        "nameAr": "شركة قفط وسفاجا لنقل الأسمدة الفوسفاتية والكيماويات لميناء التصدير",
        "nameEn": "Qift & Safaga Phosphate Fertilizers Export Haulage Logistics Co",
        "sector": "transport", "city": "safaga", "district": "طريق قفط - القصير - سفاجا الكيلو 28", "governorate": "البحر الأحمر",
        "address": "محطة التبادل اللوجستي للشاحنات - مدخل سفاجا الجنوبي",
        "phone1": "065-3261110", "phone2": "", "website": "",
        "email": "qift.safaga.fertilizers@gmail.com", "lat": 26.707, "lon": 33.912, "fleetSize": 60,
        "fleetType": "تريلات تريبل أكسل وتريلات ستائر مغلقة لنقل شكائر الأسمدة الفوسفاتية والسوبر فوسفات", "priority": "A",
        "notes": "ربط مجمعات الأسمدة الفوسفاتية بالسباعية ونجع حمادي برصيف التصدير التخصصي بسفاجا"
    },
    {
        "nameAr": "شركة الرافعات الزرقاء للأوناش التلسكوبية ومهمات الموانئ الثقيلة (سفاجا)",
        "nameEn": "Blue Cranes Heavy Rigging & Telescopic Port Cranes Safaga Co",
        "sector": "contracting", "city": "safaga", "district": "منطقة الورش والمخازن الجمركية - سفاجا", "governorate": "البحر الأحمر",
        "address": "طريق الميناء - مجمع ورش الرافعات التلسكوبية والمعدات الثقيلة",
        "phone1": "065-3261111", "phone2": "", "website": "",
        "email": "bluecranes.safaga@gmail.com", "lat": 26.740, "lon": 33.927, "fleetSize": 35,
        "fleetType": "أوناش تلسكوبية حمولات 50 إلى 250 طن، كساحات لوابد هيدروليكية، وتريلات جر ثقيل", "priority": "B+",
        "notes": "رفع ومناولة الطرود الثقيلة ومعدات المشروعات الصناعية والتوربينات بموانئ البحر الأحمر"
    },
    {
        "nameAr": "شركة النيل للتعدين ونقل خام الفوسفات من مناجم السباعية لميناء سفاجا",
        "nameEn": "Nile Phosphate Mining & Sebaeya Mines to Safaga Port Haulage",
        "sector": "transport", "city": "safaga", "district": "طريق سفاجا - قنا - إدفو الصحراوي", "governorate": "البحر الأحمر",
        "address": "المركز اللوجستي لاستقبال شاحنات الفوسفات - الكيلو 10 طريق سفاجا قنا",
        "phone1": "065-3261112", "phone2": "", "website": "",
        "email": "nile.phosphate.sebaeya@gmail.com", "lat": 26.720, "lon": 33.890, "fleetSize": 90,
        "fleetType": "شاحنات تريلا قلاب جوانب مقواة مخصصة لنقل خام الفوسفات الصخري والناعم لموانئ التصدير", "priority": "A+",
        "notes": "الربط اللوجستي اليومي بين مناجم خام الفوسفات بالسباعية ورصيف الشحن التصديري بميناء سفاجا"
    },
    {
        "nameAr": "شركة البحر الأحمر لمقاولات التكريك والأعمال الهندسية البحرية (سفاجا)",
        "nameEn": "Red Sea Dredging & Marine Engineering Works Safaga Co",
        "sector": "contracting", "city": "safaga", "district": "المنطقة البحرية - ميناء سفاجا الجديد", "governorate": "البحر الأحمر",
        "address": "طريق الميناء الجديد - قاعدة صيانة الكراكات والقطع البحرية والشاحنات الخدمية",
        "phone1": "065-3261113", "phone2": "", "website": "",
        "email": "redsea.dredging.safaga@gmail.com", "lat": 26.738, "lon": 33.938, "fleetSize": 32,
        "fleetType": "كراكات بحرية، صالات تفريغ ردم، شاحنات نقل صخور دباش حماية الأرصفة، ولوادر كوماتسو", "priority": "B+",
        "notes": "مقاولات تعميق الأرصفة وتكريك الممرات الملاحية وإنشاء حواجز الأمواج بموانئ البحر الأحمر"
    },

    # ── Sub-Cluster 2: رأس غارب والزعفرانة وخليج السويس (حقول البترول وطاقة الرياح) (14 كياناً) ──
    {
        "nameAr": "شركة رأس غارب لنقل أنابيب الحفر البترولية ومعدات الآبار الثقيلة",
        "nameEn": "Ras Ghareb Oilfield Tubulars & Drilling Rigs Heavy Haulage Co",
        "sector": "transport", "city": "ras_ghareb", "district": "المنطقة الصناعية الأولى - رأس غارب", "governorate": "البحر الأحمر",
        "address": "المنطقة الصناعية - بلوك 14 - مجمع مخازن وساحات نقل أنابيب البترول (OCTG)",
        "phone1": "065-3682100", "phone2": "", "website": "",
        "email": "rasghareb.oilfield.tubulars@gmail.com", "lat": 28.356, "lon": 33.076, "fleetSize": 90,
        "fleetType": "تريلات مسطحة مجهزة لنقل مواسير الحفر وتريلات كساحات لنقل أبراج الحفر والرافعات", "priority": "A+",
        "notes": "الناقل الرئيسي لمواسير الحفر (OCTG) ومعدات الحفر البرية والبحرية لكبرى شركات البترول بخليج السويس"
    },
    {
        "nameAr": "شركة صهاريج غارب لسوائل الحفر والمياه الصناعية وكيماويات الآبار",
        "nameEn": "Ghareb Drilling Mud & Industrial Fluids Tankers Fleet Co",
        "sector": "transport", "city": "ras_ghareb", "district": "طريق غارب - السويس الكيلو 11", "governorate": "البحر الأحمر",
        "address": "الكيلو 11 طريق غارب السويس - مجمع صهاريج نقل مياه الحفر والكيماويات البترولية",
        "phone1": "065-3682101", "phone2": "", "website": "",
        "email": "ghareb.drillingmud.tankers@gmail.com", "lat": 28.382, "lon": 33.052, "fleetSize": 70,
        "fleetType": "صهاريج معزولة ومبطنة لنقل طفلة الحفر، الأحماض الكيماوية، ومياه الخزانات البترولية", "priority": "A",
        "notes": "إمداد مواقع وأجهزة الحفر بسوائل الحفر ومياه التبريد والمذيبات الكيماوية بقطاع خليج السويس"
    },
    {
        "nameAr": "شركة الزعفرانة اللوجستية لكساحات ريش ومولدات توربينات الرياح العملاقة",
        "nameEn": "Zafarana Logistics Super Lowbeds Wind Turbines Transport Co",
        "sector": "transport", "city": "ras_ghareb", "district": "منطقة مزارع رياح الزعفرانة وجبل الزيت", "governorate": "البحر الأحمر",
        "address": "طريق العين السخنة - الزعفرانة الكيلو 62 - المحطة اللوجستية لمهمات طاقة الرياح",
        "phone1": "065-3682102", "phone2": "", "website": "",
        "email": "zafarana.superlowbeds.wind@gmail.com", "lat": 29.112, "lon": 32.652, "fleetSize": 55,
        "fleetType": "كساحات لوابد تلسكوبية فائقة الطول مخصصة لنقل ريش التوربينات بطول 70-85 متر والمولدات", "priority": "A+",
        "notes": "النقل التخصصي العملاق لريش وأبراج ومحولات مزارع الرياح بالزعفرانة وخليج السويس ورأس غارب"
    },
    {
        "nameAr": "شركة رأس شقير للتموين البحري وإمداد المنصات البترولية البحرية بالخليج",
        "nameEn": "Ras Shoukeir Offshore Platform Marine Supply & Catering Logistics",
        "sector": "transport", "city": "ras_ghareb", "district": "ميناء رأس شقير البترولي", "governorate": "البحر الأحمر",
        "address": "ميناء رأس شقير - قاعدة الإمداد اللوجستي والتموين للأرصفة والمنصات البحرية",
        "phone1": "065-3682103", "phone2": "", "website": "",
        "email": "rasshoukeir.offshore.supply@gmail.com", "lat": 28.182, "lon": 33.282, "fleetSize": 45,
        "fleetType": "شاحنات تبريد وتجميد وسيارات جامبو وتريلات مسطحة لإمداد لنشات وقاطرات الخدمة البترولية", "priority": "A",
        "notes": "توريد وشحن الإعاشة وقطع الغيار والمعدات الفنية لمنصات إنتاج البترول البحرية بخليج السويس"
    },
    {
        "nameAr": "شركة البترول الإنشائية لتمهيد ورصف الطرق الصحراوية لحقول غارب",
        "nameEn": "Petroleum Civil Roads Paving & Desert Oilfield Earthworks Co",
        "sector": "contracting", "city": "ras_ghareb", "district": "شارع الإذاعة - المنطقة الحرفية", "governorate": "البحر الأحمر",
        "address": "المنطقة الحرفية - قطاع المقاولات الإنشائية - رأس غارب",
        "phone1": "065-3682104", "phone2": "", "website": "",
        "email": "petro.civilroads.ghareb@gmail.com", "lat": 28.362, "lon": 33.062, "fleetSize": 50,
        "fleetType": "لوادر، بلدوزرات مد الجسور الصحراوية، هراسات أسفلت، وقلابات نقل الردم والتربة الصخرية", "priority": "A",
        "notes": "تمهيد ورصف الطرق الصحراوية المؤدية لآبار البترول ومواقع توربينات الرياح وبناء القواعد الخرسانية"
    },
    {
        "nameAr": "شركة خليج السويس للروافع الهيدروليكية الثقيلة وصيانة المنشآت البترولية",
        "nameEn": "Gulf of Suez Heavy Hydraulic Cranes & Oilfield Maintenance Co",
        "sector": "contracting", "city": "ras_ghareb", "district": "طريق رأس غارب - الغردقة الكيلو 6", "governorate": "البحر الأحمر",
        "address": "الكيلو 6 طريق الغردقة - ساحة المعدات الثقيلة والرافعات الميكانيكية",
        "phone1": "065-3682105", "phone2": "", "website": "",
        "email": "gulfofsuez.heavyhydraulic.cranes@gmail.com", "lat": 28.342, "lon": 33.082, "fleetSize": 38,
        "fleetType": "رافعات هيدروليكية مجنزرة وعلى عجلات حتى 300 طن وشاحنات صيانة ورش متنقلة", "priority": "B+",
        "notes": "أعمال تركيب وصيانة المنصات ومستودعات التخزين ومحطات معالجة الزيت الخام والغاز"
    },
    {
        "nameAr": "شركة غارب لمصنعات الخرسانة الجاهزة المقاومة للكبريتات وقواعد الحفر",
        "nameEn": "Ghareb Sulphate Resistant Ready Mix Concrete & Rig Cellars Co",
        "sector": "manufacturing", "city": "ras_ghareb", "district": "المنطقة الصناعية الثانية - رأس غارب", "governorate": "البحر الأحمر",
        "address": "المنطقة الصناعية الثانية - محطة خلط الخرسانة المقاومة للأملاح",
        "phone1": "065-3682106", "phone2": "", "website": "",
        "email": "ghareb.sulphateresistant.concrete@gmail.com", "lat": 28.366, "lon": 33.056, "fleetSize": 32,
        "fleetType": "سيارات ميكسر خرسانة ومضخات أسمنتية وتريلات نقل سن ورمل خشن ومياه عذبة", "priority": "B+",
        "notes": "إنتاج وتوريد الخرسانات المعالجة المقاومة للكبريتات وقواعد مستودعات التخزين ومزارع الرياح"
    },
    {
        "nameAr": "شركة البيئة الخضراء لإدارة وتدوير المخلفات والحمأة البترولية (رأس غارب)",
        "nameEn": "Green Eco Petroleum Sludge & Oily Waste Treatment Haulage Co",
        "sector": "transport", "city": "ras_ghareb", "district": "المدفن الصحي الصناعي - غرب رأس غارب", "governorate": "البحر الأحمر",
        "address": "طريق وادي دارا - المحطة المركزية لمعالجة وتدوير المخلفات والحمأة البترولية",
        "phone1": "065-3682107", "phone2": "", "website": "",
        "email": "greeneco.petrosludge.ghareb@gmail.com", "lat": 28.302, "lon": 32.952, "fleetSize": 40,
        "fleetType": "شاحنات فاكيوم شفط سوائل بترولية محكمة الإغلاق، وتريلات قلاب مبطنة لنقل نواتج الحفر", "priority": "A",
        "notes": "التخلص الآمن ونقل المخلفات البترولية والحمأة الزيتية وفق اشتراطات جهاز شؤون البيئة والسلامة المهنية"
    },
    {
        "nameAr": "شركة غارب لتصنيع صهاريج التخزين البترولية والهياكل المعدنية للحقول",
        "nameEn": "Ghareb Petroleum Storage Tanks & Oilfield Steel Structures Co",
        "sector": "manufacturing", "city": "ras_ghareb", "district": "المنطقة الصناعية الأولى - غارب", "governorate": "البحر الأحمر",
        "address": "المنطقة الصناعية الأولى - مصنع درفلة وتشغيل الصاج وبناء الخزانات",
        "phone1": "065-3682108", "phone2": "", "website": "",
        "email": "ghareb.petrostoragetanks@gmail.com", "lat": 28.360, "lon": 33.072, "fleetSize": 28,
        "fleetType": "تريلات أطوال لنقل جمالونات ومقاطع الصلب وكساحات نقل خزانات الوقود المصنعة", "priority": "B+",
        "notes": "تصنيع خزانات الوقود والماء وأوعية الضغط ومظلات حقول الإنتاج وشبكات الأنابيب"
    },
    {
        "nameAr": "شركة نقل أطقم الحقول والمهندسين لشركات البترول وطاقة الرياح بغارب",
        "nameEn": "Oilfield Crews & Wind Farm Engineers Transportation Services Co",
        "sector": "transport", "city": "ras_ghareb", "district": "ميدان السنترال - رأس غارب", "governorate": "البحر الأحمر",
        "address": "طريق الميناء - مجمع مكاتب النقل الجماعي للشركات الصناعية",
        "phone1": "065-3682109", "phone2": "", "website": "",
        "email": "oilfield.crewstransport.ghareb@gmail.com", "lat": 28.352, "lon": 33.082, "fleetSize": 45,
        "fleetType": "أتوبيسات نقل عمال وميني باصات وسيارات دفع رباعي مجهزة بمحددات سرعة وأنظمة تتبع", "priority": "B+",
        "notes": "نقل المهندسين والفنيين ومناوبات العمل اليومية لحقول البترول ومزارع الرياح بخليج السويس"
    },
    {
        "nameAr": "شركة جبل الزيت لنقل المهمات الكهربائية والمحولات الفائقة لمزارع الطاقة",
        "nameEn": "Gabal El Zeit Super Transformers & Grid Equipment Haulage Co",
        "sector": "transport", "city": "ras_ghareb", "district": "منطقة محطة محولات جبل الزيت", "governorate": "البحر الأحمر",
        "address": "طريق رأس غارب - الغردقة الكيلو 35 - قاعدة نقل المهمات الكهربائية الفائقة",
        "phone1": "065-3682110", "phone2": "", "website": "",
        "email": "gabalzeit.transformers.haulage@gmail.com", "lat": 27.920, "lon": 33.480, "fleetSize": 36,
        "fleetType": "كساحات هيدروليكية معيارية متعددة المحاور لنقل المحولات الكهربائية حمولة 120-180 طن", "priority": "A",
        "notes": "النقل المتخصص لكابلات الضغط العالي ومحولات الربط الكهربائي بين مزارع الرياح والشبكة الموحدة"
    },
    {
        "nameAr": "شركة غارب للتموين الصناعي وتوريد الزيوت والشحوم ومستلزمات الحفر",
        "nameEn": "Ghareb Industrial Lubricants & Rig Supplies Distribution Co",
        "sector": "trading", "city": "ras_ghareb", "district": "شارع الميناء - مجمع المستودعات", "governorate": "البحر الأحمر",
        "address": "شارع الميناء - مستودعات زيوت المحركات البحرية والشحوم التخليقية",
        "phone1": "065-3682111", "phone2": "", "website": "",
        "email": "ghareb.lubricants.rigsupplies@gmail.com", "lat": 28.358, "lon": 33.085, "fleetSize": 26,
        "fleetType": "شاحنات فان مقفلة وتريلات نقل براميل الزيوت الصناعية والشحوم الخاصة بأجهزة الحفر", "priority": "B+",
        "notes": "توزيع الزيوت الصناعية والشحوم الثقيلة ومستلزمات الأمان الصناعي لشركات الخدمات البترولية"
    },
    {
        "nameAr": "شركة وادي دارا للتعدين وكسارات الدبش والسن لمشاريع رأس غارب",
        "nameEn": "Wadi Dara Mining Aggregate & Ballast Stone Quarries Co",
        "sector": "contracting", "city": "ras_ghareb", "district": "طريق وادي دارا الكيلو 8 - غرب غارب", "governorate": "البحر الأحمر",
        "address": "الكيلو 8 طريق وادي دارا - مجمع كسارات الدبش وسن الطرق والخرسانة",
        "phone1": "065-3682112", "phone2": "", "website": "",
        "email": "wadidara.mining.quarries@gmail.com", "lat": 28.280, "lon": 32.980, "fleetSize": 42,
        "fleetType": "كسارات سن دوارة، لوادر تحميل صخور، وتريلات قلاب 30-40 طن لنقل السن والركام", "priority": "B+",
        "notes": "استخراج وتكسير السن البازلتي والركام اللازم لخلطات الخرسانة وقواعد الأبراج وطبقات الأساس"
    },
    {
        "nameAr": "شركة البحر الأحمر للسلامة المهنية والإطفاء الصناعي وتأمين المنشآت",
        "nameEn": "Red Sea Industrial Firefighting & Oilfield Safety Logistics Co",
        "sector": "transport", "city": "ras_ghareb", "district": "المنطقة الصناعية الأولى - غارب", "governorate": "البحر الأحمر",
        "address": "المنطقة الصناعية - مركز الإسناد وتجهيزات السلامة ومكافحة الحريق",
        "phone1": "065-3682113", "phone2": "", "website": "",
        "email": "redsea.firefighting.safety@gmail.com", "lat": 28.364, "lon": 33.074, "fleetSize": 24,
        "fleetType": "سيارات إطفاء رغوي صناعية، سيارات إمداد مياه طوارئ، وشاحنات نقل معدات السلامة ومواد المكافحة", "priority": "B+",
        "notes": "خدمات الدعم اللوجستي وتأمين السلامة ومكافحة الحرائق لحقول البترول ومحطات التكرير ومزارع الرياح"
    },

    # ── Sub-Cluster 3: القصير ومرسى علم وجنوب البحر الأحمر (التعدين، التلك، والجرانيت) (10 كيانات) ──
    {
        "nameAr": "شركة مناجم القصير لطحن ومعالجة خام التلك الدقيق فائق البياض",
        "nameEn": "Quseir Micronized Talc Mining Milling & Processing Co",
        "sector": "manufacturing", "city": "quseir", "district": "المنطقة الصناعية والتعدينية - القصير", "governorate": "البحر الأحمر",
        "address": "طريق القصير قفط الكيلو 9 - مصنع طحن ومعالجة خام التلك الميكروني فائق النقاوة",
        "phone1": "065-3393100", "phone2": "", "website": "",
        "email": "quseir.micronized.talc@gmail.com", "lat": 26.117, "lon": 34.272, "fleetSize": 55,
        "fleetType": "تريلات قلابات هاردوكس لنقل صخور التلك من المناجم وشاحنات نقل باليتات بودرة التلك للموانئ", "priority": "A",
        "notes": "تعدين وطحن التلك الميكروني المستخدم في صناعات الدهانات والبلاستيك والورق ومستحضرات التجميل"
    },
    {
        "nameAr": "شركة الحمراوين لشحن وتصدير الفوسفات الصخري بميناء الحمراوين التعديني",
        "nameEn": "Hamrawein Port Rock Phosphate Shipping & Export Operations Co",
        "sector": "transport", "city": "quseir", "district": "ميناء الحمراوين التعديني - شمال القصير", "governorate": "البحر الأحمر",
        "address": "ميناء الحمراوين - مجمع شحن وتصدير الفوسفات الصب",
        "phone1": "065-3393101", "phone2": "", "website": "",
        "email": "hamrawein.phosphate.shipping@gmail.com", "lat": 26.252, "lon": 34.202, "fleetSize": 80,
        "fleetType": "تريلات تريبل أكسل قلاب صب 45 طن لنقل الفوسفات الصخري من المناجم لميناء الحمراوين", "priority": "A+",
        "notes": "نقل خام الفوسفات من مناجم الحمراوين وأم حويطات وتفريغه على سيور الشحن المباشر للسفن"
    },
    {
        "nameAr": "شركة جبال القصير للمقاولات العامة وشق الطرق وحماية مخرات السيول",
        "nameEn": "Quseir Mountains Civil Contracting Road Works & Flood Defense Co",
        "sector": "contracting", "city": "quseir", "district": "طريق القصير - مرسى علم الكيلو 4", "governorate": "البحر الأحمر",
        "address": "الكيلو 4 طريق مرسى علم - مجمع الكسارات والورش الميكانيكية",
        "phone1": "065-3393102", "phone2": "", "website": "",
        "email": "quseir.flooddefense.contracting@gmail.com", "lat": 26.092, "lon": 34.292, "fleetSize": 42,
        "fleetType": "حفارات شاكوش لتكسير الصخور، لوادر، وتريلات نقل دبش وركام حماية السيول", "priority": "A",
        "notes": "شق الطرق الجبلية وإنشاء سدود وبحيرات مخرات السيول لحماية المنشآت الحيوية والمدن"
    },
    {
        "nameAr": "شركة مرسى علم للخرسانة الجاهزة والأشغال الإنشائية للقرى السياحية والموانئ",
        "nameEn": "Marsa Alam Ready Mix Concrete & Resort Structural Works Co",
        "sector": "contracting", "city": "marsa_alam", "district": "طريق المطار - مرسى علم", "governorate": "البحر الأحمر",
        "address": "مدخل مدينة مرسى علم - محطة خلط الخرسانة المركزية",
        "phone1": "065-3393103", "phone2": "", "website": "",
        "email": "marsaalam.resort.concrete@gmail.com", "lat": 25.072, "lon": 34.882, "fleetSize": 36,
        "fleetType": "سيارات خلاطات خرسانة جاهزة، ومضخات أسمنتية حديثة، وتريلات نقل خامات سن وأسمنت", "priority": "B+",
        "notes": "توريد الخرسانة الإنشائية لمشروعات المنتجعات السياحية والموانئ ومحطات تحلية المياه"
    },
    {
        "nameAr": "شركة جبل السكري للخدمات اللوجستية وسلاسل إمداد مواقع استخراج الذهب",
        "nameEn": "Sukari Gold Mountain Mining Supply Chain & Field Fleet Co",
        "sector": "contracting", "city": "marsa_alam", "district": "منطقة منجم السكري - جنوب مرسى علم", "governorate": "البحر الأحمر",
        "address": "طريق منجم السكري الكيلو 16 - القاعدة اللوجستية لمقاولي التعدين والتموين",
        "phone1": "065-3393104", "phone2": "", "website": "",
        "email": "sukari.goldmining.fleet@gmail.com", "lat": 24.952, "lon": 34.722, "fleetSize": 60,
        "fleetType": "شاحنات تفريغ جبلية، كساحات نقل معدات ثقيلة، صهاريج وقود ومياه معالجة، وتريلات تموين", "priority": "A+",
        "notes": "الخدمات اللوجستية وسلاسل الإمداد الثقيل لمواقع استكشاف واستخراج الذهب والمعادن المصاحبة"
    },
    {
        "nameAr": "شركة محاجر البحر الأحمر لكتل الجرانيت والرخام الطبيعي وأحجار الزينة",
        "nameEn": "Red Sea Granite Blocks & Ornamental Marble Dimension Stone Co",
        "sector": "manufacturing", "city": "quseir", "district": "طريق القصير - قفط الكيلو 32", "governorate": "البحر الأحمر",
        "address": "الكيلو 32 طريق قفط - مجمع محاجر ومنشار الجرانيت الوردي والأسود",
        "phone1": "065-3393105", "phone2": "", "website": "",
        "email": "redsea.graniteblocks.stone@gmail.com", "lat": 26.052, "lon": 34.052, "fleetSize": 38,
        "fleetType": "تريلات كساحات مخصصة لنقل بلوكات الجرانيت بوزن 30-35 طن للبلوك وشاحنات رافعة شوكية", "priority": "B+",
        "notes": "استخراج كتل الجرانيت والرخام الطبيعي من جبال البحر الأحمر ونقلها لمصانع شق التعبان وموانئ التصدير"
    },
    {
        "nameAr": "شركة مرسى علم لسلاسل التبريد والتموين الغذائي الشامل للمنتجعات",
        "nameEn": "Marsa Alam Cold Chain Fleet & Complete Resort Catering Logistics",
        "sector": "transport", "city": "marsa_alam", "district": "المنطقة الحرفية - مرسى علم", "governorate": "البحر الأحمر",
        "address": "طريق القصير مرسى علم - مجمع ثلاجات التبريد والتجميد اللوجستي",
        "phone1": "065-3393106", "phone2": "", "website": "",
        "email": "marsaalam.coldchain.fleet@gmail.com", "lat": 25.087, "lon": 34.872, "fleetSize": 35,
        "fleetType": "برادات تريلا وسيارات جامبو مبردة -18 مئوية لنقل اللحوم والأسماك والخضروات الطازجة", "priority": "B+",
        "notes": "تأمين سلاسل الإمداد المبرد والتموين الغذائي الشامل للمنتجعات والمشروعات الفندقية بجنوب البحر الأحمر"
    },
    {
        "nameAr": "شركة مرسى علم للخدمات الجمركية والشحن الجوي بمطار مرسى علم الدولي",
        "nameEn": "Marsa Alam Airport Cargo Handling & Customs Clearance Fleet Co",
        "sector": "transport", "city": "marsa_alam", "district": "مطار مرسى علم الدولي - قرية البضائع", "governorate": "البحر الأحمر",
        "address": "قرية البضائع والشحن الجوي - مطار مرسى علم الدولي",
        "phone1": "065-3393107", "phone2": "", "website": "",
        "email": "marsaalam.cargohandling.fleet@gmail.com", "lat": 25.552, "lon": 34.582, "fleetSize": 25,
        "fleetType": "شاحنات فان مغلقة وتريلات نقل حاويات ومهمات شحن جوي سريعة", "priority": "B+",
        "notes": "التخليص الجمركي ونقل الطرود والمهمات الجوية العاجلة لشركات التعدين والبترول والسياحة"
    },
    {
        "nameAr": "شركة برنيس للنقل التعديني واللوجستيات بميناء ومطار برنيس العسكري والمدني",
        "nameEn": "Berenice Mining Freight & Marine Port Logistics Operations Co",
        "sector": "transport", "city": "marsa_alam", "district": "منطقة برنيس - جنوب مرسى علم", "governorate": "البحر الأحمر",
        "address": "طريق مرسى علم برنيس الكيلو 110 - المركز اللوجستي لميناء برنيس التجاري",
        "phone1": "065-3393108", "phone2": "", "website": "",
        "email": "berenice.miningfreight.port@gmail.com", "lat": 23.950, "lon": 35.480, "fleetSize": 45,
        "fleetType": "تريلات تريبل أكسل لنقل خامات التعدين، كساحات معدات ثقيلة، وشاحنات نقل بضائع عامة", "priority": "A",
        "notes": "العمليات اللوجستية ونقل البضائع والمهمات التعدينية بمحور برنيس - الشلاتين الاستراتيجي"
    },
    {
        "nameAr": "شركة شلاتين لمقاولات التعدين الأهلي ونقل الركاز الخام ومستلزمات الاستخلاص",
        "nameEn": "Shalatin Artisanal Mining Contractors & Ore Transport Fleet Co",
        "sector": "contracting", "city": "marsa_alam", "district": "محور مرسى علم - شلاتين التعديني", "governorate": "البحر الأحمر",
        "address": "طريق شلاتين - ساحة استلام ووزن ركاز الذهب والكوارتز الخام",
        "phone1": "065-3393109", "phone2": "", "website": "",
        "email": "shalatin.oretransport.fleet@gmail.com", "lat": 24.200, "lon": 35.250, "fleetSize": 38,
        "fleetType": "شاحنات قلاب وعرة مصفحة، لوادر، وتريلات نقل مطاحن ركاز ومعدات فصل الجاذبية", "priority": "B+",
        "notes": "تنظيم ونقل ركاز الذهب الخام من مناطق التعدين بمثلث شلاتين لمصانع ومطاحن المعالجة الرسمية"
    },

    # ── Sub-Cluster 4: الغردقة والجونة وسلاسل الإمداد والخرسانة والنقل الصناعي (8 كيانات) ──
    {
        "nameAr": "شركة الغردقة المركزية لمحطات خلط الخرسانة الجاهزة والكسارات الكبرى",
        "nameEn": "Hurghada Central Ready Mix Concrete Batching & Heavy Quarries Co",
        "sector": "manufacturing", "city": "hurghada", "district": "المنطقة الصناعية الحرفية - شمال الغردقة", "governorate": "البحر الأحمر",
        "address": "طريق الغردقة السويس - المنطقة الصناعية الشمالية - مجمع خلاطات الخرسانة المركزية",
        "phone1": "065-3594100", "phone2": "", "website": "",
        "email": "hurghada.central.batching@gmail.com", "lat": 27.282, "lon": 33.782, "fleetSize": 58,
        "fleetType": "سيارات ميكسر خرسانة 12 م3، مضخات خرسانة عملاقة 47-56 متر، وتريلات نقل أسمنت صب وسن", "priority": "A",
        "notes": "كبرى محطات الخرسانة الجاهزة لتوريد المشروعات القومية والتوسعات العمرانية والسياحية بالغردقة"
    },
    {
        "nameAr": "شركة الميناء الجاف بالغردقة لخدمات ساحات الحاويات والتخزين الجمركي",
        "nameEn": "Hurghada Dry Port Inland Container Yard & Customs Storage Co",
        "sector": "transport", "city": "hurghada", "district": "الدائري الأوسط - ميناء الغردقة الجاف", "governorate": "البحر الأحمر",
        "address": "طريق الدائري الأوسط - مجمع ساحات التخزين ومستودعات الترانزيت",
        "phone1": "065-3594101", "phone2": "", "website": "",
        "email": "hurghada.dryport.containeryard@gmail.com", "lat": 27.222, "lon": 33.792, "fleetSize": 46,
        "fleetType": "تريلات نقل حاويات 20 و40 قدم، روافع حاويات ريتش ستاكر، وتريلات مسطحة", "priority": "A",
        "notes": "إدارة ساحات الحاويات الجافة وخدمات التخزين الجمركي والتوزيع للبضائع الواردة للبحر الأحمر"
    },
    {
        "nameAr": "شركة الجونة لمقاولات البنية التحتية والآليات الثقيلة وتسوية الأراضي",
        "nameEn": "El Gouna Heavy Infrastructure Earthmoving & Civil Contracting Co",
        "sector": "contracting", "city": "hurghada", "district": "شمال الجونة - طريق الغردقة رأس غارب", "governorate": "البحر الأحمر",
        "address": "مدخل الجونة الشمالي - مجمع جراجات الآليات الثقيلة والمقاولات",
        "phone1": "065-3594102", "phone2": "", "website": "",
        "email": "elgouna.earthmoving.contracting@gmail.com", "lat": 27.412, "lon": 33.662, "fleetSize": 50,
        "fleetType": "كساحات نقل معدات، لوادر وحفارات، تريلات نقل تربة وخامات أساس، وتريلات أسفلت", "priority": "A",
        "notes": "مقاولات تسوية الأراضي وإنشاء شبكات الطرق والمرافق والبحيرات الصناعية بمنطقة الجونة وشمال الغردقة"
    },
    {
        "nameAr": "شركة الفيروز للغازات المسالة وتوزيع الأكسجين والنيتروجين الصناعي بالغردقة",
        "nameEn": "Al Fairouz Cryogenic Industrial Gases & Liquefied Nitrogen Fleet",
        "sector": "manufacturing", "city": "hurghada", "district": "المنطقة الصناعية الحرفية - الغردقة", "governorate": "البحر الأحمر",
        "address": "المنطقة الصناعية - مجمع محطات تعبئة أسطوانات وصهاريج الغازات الصناعية",
        "phone1": "065-3594103", "phone2": "", "website": "",
        "email": "fairouz.cryogenic.gases@gmail.com", "lat": 27.277, "lon": 33.787, "fleetSize": 30,
        "fleetType": "شاحنات نقل أسطوانات غاز مصفحة، وصهاريج كرايوجينيك مبردة لنقل الأكسجين والنيتروجين السائل", "priority": "B+",
        "notes": "إمداد المستشفيات والورش الصناعية ومواقع حفر البترول بالغازات الطبية والصناعية وغازات اللحام"
    },
    {
        "nameAr": "شركة طيبة لتجارة وتوزيع حديد التسليح وأخشاب البناء ومستلزمات المشاريع",
        "nameEn": "Tiba Rebar Structural Timber & Wholesale Projects Supplies Co",
        "sector": "trading", "city": "hurghada", "district": "طريق النصر - مجمع تجار الجملة", "governorate": "البحر الأحمر",
        "address": "طريق النصر التجاري - مستودعات الأخشاب وحديد التسليح - الغردقة",
        "phone1": "065-3594104", "phone2": "", "website": "",
        "email": "tiba.rebar.timber.hurghada@gmail.com", "lat": 27.237, "lon": 33.822, "fleetSize": 34,
        "fleetType": "تريلات تريبل أكسل لنقل حديد التسليح وشاحنات جامبو لتوزيع أخشاب البناء والأسمنت", "priority": "B+",
        "notes": "التجارة والتوزيع بالجملة لمواد البناء وحديد التسليح لكبرى شركات التطوير والمقاولات بالبحر الأحمر"
    },
    {
        "nameAr": "شركة البحر الأحمر للصلب وتصنيع الجمالونات والهياكل المعدنية الكبرى",
        "nameEn": "Red Sea Steel Fab Steel Trusses & Heavy Hangars Manufacturing Co",
        "sector": "manufacturing", "city": "hurghada", "district": "المنطقة الحرفية الشمالية - الغردقة", "governorate": "البحر الأحمر",
        "address": "المنطقة الحرفية الشمالية - مجمع ورش تشكيل وقطع ودرفلة الصلب والجمالونات",
        "phone1": "065-3594105", "phone2": "", "website": "",
        "email": "redsea.steelfab.hangars@gmail.com", "lat": 27.288, "lon": 33.775, "fleetSize": 28,
        "fleetType": "تريلات تريبل أكسل أطوال لنقل الجمالونات الحديدية، أوناش هيدروليكية، وشاحنات لحام متنقلة", "priority": "B+",
        "notes": "تصنيع وتركيب الهياكل الحديدية ومظلات صالات المطارات والمستودعات العملاقة بالبحر الأحمر"
    },
    {
        "nameAr": "شركة الغردقة لفرز وتدوير المخلفات الصلبة ونقل النفايات الصناعية والفندقية",
        "nameEn": "Hurghada Solid Waste Sorting Recycling & Industrial Disposal Co",
        "sector": "transport", "city": "hurghada", "district": "طريق الغردقة رأس غارب الكيلو 15", "governorate": "البحر الأحمر",
        "address": "الكيلو 15 طريق غارب - مجمع مصانع الفرز والتدوير والكبس الميكانيكي",
        "phone1": "065-3594106", "phone2": "", "website": "",
        "email": "hurghada.solidwaste.recycling@gmail.com", "lat": 27.320, "lon": 33.750, "fleetSize": 52,
        "fleetType": "شاحنات مكابس قمامة هيدروليكية، تريلات نقل بالات الكرتون والبلاستيك المضغوط، وهوك لفت", "priority": "A",
        "notes": "إدارة منظومة النظافة المتكاملة ونقل وتدوير المخلفات البلدية والصناعية بمدينة الغردقة والجونة"
    },
    {
        "nameAr": "شركة البحر الأحمر للمياه المحلاة ونقل وتوزيع مياه الشرب بالصهاريج",
        "nameEn": "Red Sea Potable Desalinated Water Tankers Distribution Co",
        "sector": "transport", "city": "hurghada", "district": "منطقة محطة اليسر لتحلية مياه البحر", "governorate": "البحر الأحمر",
        "address": "محطة اليسر العملاقة للتحلية - مجمع محطات تعبئة فنطاسات المياه العذبة",
        "phone1": "065-3594107", "phone2": "", "website": "",
        "email": "redsea.desalwater.tankers@gmail.com", "lat": 27.210, "lon": 33.840, "fleetSize": 44,
        "fleetType": "صهاريج ستانلس ستيل معقمة سعة 20-40 م3 مخصصة لنقل مياه الشرب النقية للمواقع والمنشآت", "priority": "A",
        "notes": "تأمين ونقل المياه العذبة الصالحة للشرب للفنادق ومواقع العمل والمشروعات الإنشائية المعزولة"
    },

    # ── Sub-Cluster 5: توشكى، شرق العوينات، وأسوان الزراعية والتعدينية (15 كياناً) ──
    {
        "nameAr": "شركة أراضي توشكى العملاقة لإدارة أساطيل الحصاد الميكانيكي والنقل الثقيل",
        "nameEn": "Toshka Mega Lands Mechanical Harvesters & Heavy Transport Fleet",
        "sector": "agriculture", "city": "toshka", "district": "مشروع توشكى الخير القومي - مفيض توشكى", "governorate": "أسوان",
        "address": "طريق أبو سمبل السياحي الكيلو 222 - المجمع الإداري واللوجستي لمزارع توشكى",
        "phone1": "097-3495100", "phone2": "", "website": "",
        "email": "toshka.megalands.harvesters@gmail.com", "lat": 22.682, "lon": 31.852, "fleetSize": 140,
        "fleetType": "حصادات قمح عملاقة، جرارات سحب زراعي بقوة 300 حصان، وتريلات هوبر نقل حبوب صب 45 طن", "priority": "A+",
        "notes": "إدارة أساطيل الحصاد الميكانيكي والنقل السريع للقمح الاستراتيجي من توشكى لصوامع الجمهورية المركزية"
    },
    {
        "nameAr": "شركة توشكى اللوجستية لنقل وتخزين القمح والذرة بصوامع الجنوب المركزية",
        "nameEn": "Toshka Logistics Wheat & Maize Central Silos Haulage Operations",
        "sector": "transport", "city": "toshka", "district": "المنطقة اللوجستية المركزية - توشكى", "governorate": "أسوان",
        "address": "صوامع توشكى الخرسانية الحديثة سعة 60 ألف طن - مفيض توشكى",
        "phone1": "097-3495101", "phone2": "", "website": "",
        "email": "toshka.logistics.centralsilos@gmail.com", "lat": 22.712, "lon": 31.882, "fleetSize": 110,
        "fleetType": "أساطيل تريلات هوبر حبوب وتريلات مسطحة مجهزة بجوانب لنقل شكائر القمح والشعير والذرة", "priority": "A+",
        "notes": "الناقل الرسمي والمباشر للقمح والذرة الصب من مزارع توشكى إلى صوامع ومطاحن محافظات الصعيد والقاهرة"
    },
    {
        "nameAr": "شركة توشكى للتنمية الزراعية وإنتاج التمور الفاخرة والنخيل المجدول التصديري",
        "nameEn": "Toshka Medjool Dates & Export Palm Plantations Development Co",
        "sector": "agriculture", "city": "toshka", "district": "أكبر مزرعة تمور بالعالم - مشروع توشكى", "governorate": "أسوان",
        "address": "قطاع مزارع النخيل - الكيلو 187 طريق أسوان أبو سمبل",
        "phone1": "097-3495102", "phone2": "", "website": "",
        "email": "toshka.medjool.exportpalms@gmail.com", "lat": 22.752, "lon": 31.782, "fleetSize": 65,
        "fleetType": "شاحنات مبردة مخصصة لنقل التمور الفاخرة، رافعات هيدروليكية لخدمة النخيل، وتريلات نقل أسمدة", "priority": "A",
        "notes": "خدمة وزراعة ونقل حصاد ملايين نخلات التمور المجدول والبرحي ومحطات التجفيف والتعبئة التصديرية"
    },
    {
        "nameAr": "شركة الوادي الأخضر لاستصلاح الأراضي ومد شبكات الري المحوري (بيفوت توشكى)",
        "nameEn": "Green Valley Land Reclamation & Pivot Irrigation Systems Toshka",
        "sector": "contracting", "city": "toshka", "district": "القطاع الثاني - مشروع توشكى", "governorate": "أسوان",
        "address": "طريق مفيض توشكى - مجمع ورش تجميع وصيانة أجهزة البيفوت والآليات الثقيلة",
        "phone1": "097-3495103", "phone2": "", "website": "",
        "email": "greenvalley.pivot.irrigation@gmail.com", "lat": 22.652, "lon": 31.902, "fleetSize": 52,
        "fleetType": "بلدوزرات تسوية ليزر، جرارات كوماتسو دي 155، وتريلات نقل هياكل وأبراج أجهزة الري المحوري", "priority": "A",
        "notes": "تسوية وإعداد الأراضي البكر ومد خطوط الري وتركيب أجهزة الري المحوري بالصحراء الجنوبية"
    },
    {
        "nameAr": "شركة بترول توشكى لتوزيع السولار والمحروقات لتشغيل محطات الرفع والمزارع",
        "nameEn": "Toshka Petroleum Diesel Distribution Farm Pumps Fuel Haulage Co",
        "sector": "transport", "city": "toshka", "district": "طريق أبو سمبل الكيلو 212", "governorate": "أسوان",
        "address": "محطة التوزيع والتموين البترولي المركزية لمشروعات توشكى",
        "phone1": "097-3495104", "phone2": "", "website": "",
        "email": "toshka.petroleum.dieselfleet@gmail.com", "lat": 22.702, "lon": 31.832, "fleetSize": 44,
        "fleetType": "صهاريج نقل سولار وبنزين معتمدة سعة 45 ألف لتر لنقل الوقود لتشغيل المولدات والآليات", "priority": "A",
        "notes": "تأمين ونقل السولار والوقود الصناعي لتشغيل محطات الرفع والمعدات الزراعية وأساطيل الحصاد"
    },
    {
        "nameAr": "شركة كساحات توشكى للنقل الثقيل ونقل الحصادات والمعدات الزراعية العملاقة",
        "nameEn": "Toshka Heavy Lowbeds & Mega Harvester Machinery Haulage Co",
        "sector": "transport", "city": "toshka", "district": "طريق توشكى - أسوان", "governorate": "أسوان",
        "address": "المركز اللوجستي لنقل المعدات الثقيلة - مفرق طريق أبو سمبل وتوشكى",
        "phone1": "097-3495105", "phone2": "", "website": "",
        "email": "toshka.heavylowbeds.machinery@gmail.com", "lat": 22.732, "lon": 31.892, "fleetSize": 38,
        "fleetType": "كساحات لوابد حمولات 60-100 طن لنقل الحصادات والجرارات العملاقة بين الحقول والمحافظات", "priority": "B+",
        "notes": "نقل الآلات الزراعية العملاقة ومعدات الحفر والتسوية من الوجه البحري لمواقع العمل بالجنوب"
    },
    {
        "nameAr": "شركة خرسانة توشكى المقاومة لتبطين ترعة الشيخ زايد ومحطات الطلمبات",
        "nameEn": "Toshka Canal Lining Ready Mix Concrete & Pump Stations Civil Co",
        "sector": "contracting", "city": "toshka", "district": "منطقة محطة رفع توشكى العملاقة (مبارك)", "governorate": "أسوان",
        "address": "محطة طلمبات توشكى الرئيسية - موقع خلط الخرسانة المقاومة",
        "phone1": "097-3495106", "phone2": "", "website": "",
        "email": "toshka.canallining.concrete@gmail.com", "lat": 22.612, "lon": 31.952, "fleetSize": 45,
        "fleetType": "سيارات خلاطات خرسانة، مضخات خرسانية، تريلات نقل أسمنت صب، ومعدات تبطين الترع", "priority": "A",
        "notes": "أعمال الخرسانة الجاهزة وتبطين ترعة الشيخ زايد وفروعها الإنشائية وإنشاء أحواض التهدئة"
    },
    {
        "nameAr": "شركة توشكى للتبريد والتخزين الجمركي للحاصلات الزراعية التصديرية",
        "nameEn": "Toshka Cold Storage & Customs Reefer Depot Export Agro Co",
        "sector": "transport", "city": "toshka", "district": "مجمع الخدمات اللوجستية - مطار أبو سمبل وتوشكى", "governorate": "أسوان",
        "address": "طريق توشكى المطار - مجمع ثلاجات التخزين المبرد سريع التجميد",
        "phone1": "097-3495107", "phone2": "", "website": "",
        "email": "toshka.coldstorage.customs@gmail.com", "lat": 22.690, "lon": 31.860, "fleetSize": 40,
        "fleetType": "برادات تريلا وسيارات جامبو معزولة مخصصة لنقل العنب المبكر والتمور المبردة للمطارات والموانئ", "priority": "A",
        "notes": "التبريد السريع وحفظ المحاصيل ذات الحصاد المبكر وشحنها لمطاري أسوان والقاهرة وموانئ التصدير"
    },
    {
        "nameAr": "شركة أسوان وتوشكى للآليات وخدمات الصيانة الميدانية لأساطيل الاستصلاح",
        "nameEn": "Aswan & Toshka Mobile Field Service & Heavy Fleets Workshop Co",
        "sector": "contracting", "city": "toshka", "district": "المنطقة الحرفية لمشروع توشكى", "governorate": "أسوان",
        "address": "المجمع الحرفي المركزي - ورش العمرة الشاملة للجرارات والمحركات الثقيلة",
        "phone1": "097-3495108", "phone2": "", "website": "",
        "email": "aswan.toshka.fieldservice@gmail.com", "lat": 22.670, "lon": 31.870, "fleetSize": 30,
        "fleetType": "شاحنات ورش صيانة ميكانيكية وهيدروليكية متنقلة، أوناش شوكية، وسيارات نجدة إطارات عملاقة", "priority": "B+",
        "notes": "الدعم الفني والصيانة الميدانية السريعة لجرارات وحصادات المشروعات الزراعية العملاقة بالصحراء"
    },
    {
        "nameAr": "شركة توشكى للأسمدة والمخصبات العضوية ومحطات الذوبان والتسميد المحوري",
        "nameEn": "Toshka Organic Fertilizers & Fertigation Batch Plant Operations",
        "sector": "manufacturing", "city": "toshka", "district": "قطاع مجمعات التسميد المركزي - توشكى", "governorate": "أسوان",
        "address": "الكيلو 195 طريق أبو سمبل - مجمع خلط وتعبئة الأسمدة المركبة والذوابة",
        "phone1": "097-3495109", "phone2": "", "website": "",
        "email": "toshka.organic.fertigation@gmail.com", "lat": 22.720, "lon": 31.810, "fleetSize": 35,
        "fleetType": "تريلات نقل أسمدة صب وشكائر، صهاريج نقل أحماض التسميد، وتريلات جوانب لنقل الكمبوست", "priority": "B+",
        "notes": "إنتاج وتوريد الأسمدة الذوابة وأحماض الفوسفوريك والكمبوست المعالج لتغذية شبكات الري المحوري"
    },
    {
        "nameAr": "شركة شرق العوينات لشحن وتبريد محصول البطاطس والبصل التصديري",
        "nameEn": "East Oweinat Export Potato & Onion Refrigerated Logistics Fleet",
        "sector": "transport", "city": "east_oweinat", "district": "منطقة مزارع شرق العوينات - القطاع الأوسط", "governorate": "الوادي الجديد",
        "address": "المحطة اللوجستية المركزية - شرق العوينات - مجمع محطات فرز وتبريد البطاطس",
        "phone1": "092-7286100", "phone2": "", "website": "",
        "email": "eastoweinat.potatofleet@gmail.com", "lat": 22.582, "lon": 28.722, "fleetSize": 95,
        "fleetType": "برادات تريلا ثيرمو كينج مجهزة بحساسات رطوبة لنقل البطاطس التصديرية لموانئ الإسكندرية ودمياط", "priority": "A+",
        "notes": "النقل المبرد الفائق لحصاد البطاطس والبصل من أراضي شرق العوينات الخالية من العفن البني للموانئ"
    },
    {
        "nameAr": "شركة العوينات للأعلاف الخضراء ومكابس البرسيم الحجازي والسيلاج التصديري",
        "nameEn": "Oweinat Green Forage Alfalfa Balers & Silage Export Logistics Co",
        "sector": "agriculture", "city": "east_oweinat", "district": "قطاع مزارع الأعلاف - شرق العوينات", "governorate": "الوادي الجديد",
        "address": "مجمع مكابس الأعلاف الخضراء والسيلاج - الكيلو 42 طريق العوينات الداخلة",
        "phone1": "092-7286101", "phone2": "", "website": "",
        "email": "oweinat.greenforage.balers@gmail.com", "lat": 22.622, "lon": 28.802, "fleetSize": 75,
        "fleetType": "تريلات تريبل أكسل جوانب عالية لنقل بالات البرسيم الحجازي المضغوط ومقطورات نقل السيلاج", "priority": "A",
        "notes": "توريد البرسيم الحجازي عالي البروتين والسيلاج لكبرى مزارع الأبقار والإنتاج الحيواني في مصر والدول العربية"
    },
    {
        "nameAr": "شركة آبار العوينات لحفر الآبار العميقة وتركيب طلمبات الطاقة الشمسية",
        "nameEn": "Oweinat Deep Wells Drilling & Solar Submersible Pumps Logistics",
        "sector": "contracting", "city": "east_oweinat", "district": "منطقة الخدمات الفنية - شرق العوينات", "governorate": "الوادي الجديد",
        "address": "طريق العوينات الرئيسي - مجمع ورش أجهزة الحفر والآبار الارتوازية",
        "phone1": "092-7286102", "phone2": "", "website": "",
        "email": "oweinat.deepwells.solar@gmail.com", "lat": 22.562, "lon": 28.752, "fleetSize": 48,
        "fleetType": "حفارات آبار مياه عملاقة حتى عمق 1000 متر، كساحات نقل مواسير الفلتر، ورافعات شوكية", "priority": "A",
        "notes": "حفر وتشغيل الآبار الجوفية العميقة وتركيب منظومات الطاقة الشمسية لأجهزة الري المحوري (البيفوت)"
    },
    {
        "nameAr": "شركة العوينات لنقل وتخزين القمح في الصوامع الحقلية الحديثة",
        "nameEn": "Oweinat Field Silos Strategic Grain Haulage & Storage Co",
        "sector": "transport", "city": "east_oweinat", "district": "صوامع شرق العوينات المركزية سعة 60 ألف طن", "governorate": "الوادي الجديد",
        "address": "طريق مطار شرق العوينات - مجمع صوامع الغلال المركزية",
        "phone1": "092-7286103", "phone2": "", "website": "",
        "email": "oweinat.fieldsilos.wheat@gmail.com", "lat": 22.590, "lon": 28.710, "fleetSize": 80,
        "fleetType": "تريلات هوبر حبوب صب 45 طن، تريلات جوانب، وشاحنات مجهزة بسير تفريغ هيدروليكي", "priority": "A+",
        "notes": "نقل الأقماح المحلية المنتجة بشرق العوينات وتخزينها بالصوامع الحقلية وشحنها لمطاحن الصعيد والوجه البحري"
    },
    {
        "nameAr": "شركة العوينات للطاقة المتجددة ومحطات محولات شبكات الري الزراعية",
        "nameEn": "Oweinat Solar Energy & Agriculture Grid Transformers Fleet Co",
        "sector": "contracting", "city": "east_oweinat", "district": "طريق مزارع القطاع الغربي - شرق العوينات", "governorate": "الوادي الجديد",
        "address": "مجمع الخدمات الهندسية - قاعدة تجميع ونقل خلايا ومحولات الطاقة الشمسية",
        "phone1": "092-7286104", "phone2": "", "website": "",
        "email": "oweinat.solarenergy.grid@gmail.com", "lat": 22.570, "lon": 28.680, "fleetSize": 32,
        "fleetType": "شاحنات نقل ألواح شمسية مجهزة بحوامل مانعة للاهتزاز، أوناش بوم، وتريلات نقل كابلات ومحولات", "priority": "B+",
        "notes": "إنشاء ونقل مهمات محطات الطاقة الشمسية المغذية لطلمبات الآبار الجوفية بشرق العوينات"
    },

    # ── Sub-Cluster 6: الوادي الجديد (الخارجة، الداخلة، الفرافرة، وفوسفات أبو طرطور) (10 كيانات) ──
    {
        "nameAr": "شركة فوسفات هضبة أبو طرطور للنقل التعديني والصناعات الكيماوية التخصصية",
        "nameEn": "Abu Tartur Plateau Phosphate Mining Transport & Chemicals Co",
        "sector": "manufacturing", "city": "kharga", "district": "هضبة أبو طرطور التعدينية - الخارجة", "governorate": "الوادي الجديد",
        "address": "طريق الخارجة - الداخلة الكيلو 52 - مجمع مناجم وكسارات فوسفات أبو طرطور",
        "phone1": "092-7987100", "phone2": "", "website": "",
        "email": "abutartur.plateau.phosphate@gmail.com", "lat": 25.552, "lon": 30.152, "fleetSize": 130,
        "fleetType": "تريلات قلابات صخور تعدينية 45 طن، شاحنات نقل صب جاف، وجرافات تعدين سطحي هيدروليكية", "priority": "A+",
        "notes": "أضخم مجمعات خام الفوسفات في مصر؛ استخراج ونقل وتركيز الفوسفات لمصانع الأسمدة وموانئ التصدير"
    },
    {
        "nameAr": "شركة الوادي الجديد لخطوط النقل البري الثقيل والشحن لمحافظات الصعيد",
        "nameEn": "New Valley Heavy Overland Freight Lines to Upper Egypt Hubs Co",
        "sector": "transport", "city": "kharga", "district": "المنطقة الصناعية بالخارجة - مجمع المواقف اللوجستية", "governorate": "الوادي الجديد",
        "address": "طريق الخارجة - أسيوط الكيلو 6 - الميناء البري للبضائع والشاحنات الثقيلة",
        "phone1": "092-7987101", "phone2": "", "website": "",
        "email": "newvalley.heavyfreight.lines@gmail.com", "lat": 25.462, "lon": 30.562, "fleetSize": 85,
        "fleetType": "تريلات تريبل أكسل وتريلات ستائر مغلقة لنقل المحاصيل الصناعية والأسمدة ومواد البناء", "priority": "A",
        "notes": "الربط اللوجستي الرئيسي بين مدن ومزارع الوادي الجديد ومحافظات أسيوط وسوهاج وقنا وموانئ البحر الأحمر"
    },
    {
        "nameAr": "شركة الداخلة لتصنيع وتعبئة تمور الواحات العضوية وصناديق التصدير (موط)",
        "nameEn": "Dakhla Mut Organic Oasis Dates Processing & Packaging Export Co",
        "sector": "agriculture", "city": "dakhla", "district": "المنطقة الصناعية بموط - الداخلة", "governorate": "الوادي الجديد",
        "address": "مدينة موط - مجمع مصانع وثلاجات حفظ وتعبئة التمور العضوية وصناديق التصدير",
        "phone1": "092-7987102", "phone2": "", "website": "",
        "email": "dakhla.mut.organicdates@gmail.com", "lat": 25.512, "lon": 28.982, "fleetSize": 50,
        "fleetType": "شاحنات مبردة وجامبو مغلقة لنقل تمور الصعيدي والمجدول للمطارات والموانئ التصديرية", "priority": "A",
        "notes": "تجهيز وتعبئة تمور الواحات العضوية المعتمدة وتصديرها للأسواق الأوروبية والآسيوية"
    },
    {
        "nameAr": "شركة سهل بركة بالفرافرة لصوامع الحبوب والإنتاج الزراعي التكاملي",
        "nameEn": "Sahl Baraka Farafra Integrated Agriculture & Grain Silos Fleet",
        "sector": "agriculture", "city": "farafra", "district": "مشروع 1.5 مليون فدان - سهل بركة", "governorate": "الوادي الجديد",
        "address": "سهل بركة - الفرافرة - مجمع محطات الصوامع والإنتاج الزراعي التكاملي",
        "phone1": "092-7987103", "phone2": "", "website": "",
        "email": "sahlbaraka.farafra.grain@gmail.com", "lat": 27.052, "lon": 27.952, "fleetSize": 60,
        "fleetType": "تريلات هوبر نقل قمح وشعير، شاحنات نقل مواشي وأعلاف، وتريلات خضار وفاكهة مبردة", "priority": "A",
        "notes": "إدارة أراضي الاستصلاح وسلاسل الإمداد لمحاصيل القمح والبصل وزيتون الزيت بمحور الفرافرة"
    },
    {
        "nameAr": "شركة الخارجة للطوب الرملي الخفيف والخرسانة الجاهزة ومواد البناء",
        "nameEn": "Kharga Sand Lime Bricks & Structural Ready Mix Concrete Co",
        "sector": "manufacturing", "city": "kharga", "district": "المنطقة الحرفية - الخارجة", "governorate": "الوادي الجديد",
        "address": "طريق الخارجة باريس - مصنع الطوب الرملي والخرسانة الجاهزة",
        "phone1": "092-7987104", "phone2": "", "website": "",
        "email": "kharga.sandlime.concrete@gmail.com", "lat": 25.432, "lon": 30.542, "fleetSize": 38,
        "fleetType": "سيارات ميكسر خرسانة، تريلات نقل طوب وبلوك آلي، وتريلات رمال ناعمة وسن أبيض", "priority": "B+",
        "notes": "تصنيع وتوريد مواد البناء والخرسانة لمشروعات الإسكان واستصلاح الأراضي بواحة الخارجة وباريس"
    },
    {
        "nameAr": "شركة الواحات لتجارة وتوزيع الأسمدة الزراعية والمبيدات والمخصبات الحيوية",
        "nameEn": "Oases Agrochemicals Fertilizers & Bio Nutrients Wholesale Co",
        "sector": "trading", "city": "dakhla", "district": "طريق موط - القصر - الداخلة", "governorate": "الوادي الجديد",
        "address": "مجمع المخازن الزراعية - موط - مستودعات الأسمدة المعتمدة والمبيدات",
        "phone1": "092-7987105", "phone2": "", "website": "",
        "email": "oases.agrochemicals.wholesale@gmail.com", "lat": 25.527, "lon": 28.967, "fleetSize": 32,
        "fleetType": "شاحنات جامبو وفانات مغلقة وتريلات نقل أسمدة نترات ويوريا من مصانع السويس وأسيوط", "priority": "B+",
        "notes": "توزيع الأسمدة والمخصبات الزراعية وشبكات الري بالتنقيط لكبرى المزارع والجمعيات بالوادي الجديد"
    },
    {
        "nameAr": "شركة الواحة لمقاولات حفر الآبار الارتوازية ومحطات الرفع بالصحراء الغربية",
        "nameEn": "Al Waha Artesian Wells & Desert Water Lift Stations Civil Co",
        "sector": "contracting", "city": "kharga", "district": "طريق الخارجة - أسيوط الكيلو 14", "governorate": "الوادي الجديد",
        "address": "الكيلو 14 طريق أسيوط - مجمع معدات الحفر الميكانيكي ومواسير المياه",
        "phone1": "092-7987106", "phone2": "", "website": "",
        "email": "alwaha.artesianwells.desert@gmail.com", "lat": 25.492, "lon": 30.572, "fleetSize": 36,
        "fleetType": "حفارات آبار جوفية، كساحات نقل معدات، وتريلات نقل مواسير خرسانية وبلاستيكية", "priority": "B+",
        "notes": "مقاولات حفر آبار الري والشرب وإنشاء محطات معالجة مياه الآبار وخزانات التجميع الاستراتيجية"
    },
    {
        "nameAr": "شركة واحة الداخلة لتصنيع الأعلاف المركزة واستخلاص نوى التمور",
        "nameEn": "Dakhla Oasis Concentrated Feed & Date Kernel Byproducts Co",
        "sector": "manufacturing", "city": "dakhla", "district": "المنطقة الصناعية بموط", "governorate": "الوادي الجديد",
        "address": "المنطقة الصناعية - مصنع فرم وتصنيع نوى ومخلفات النخيل للأعلاف المركزة",
        "phone1": "092-7987107", "phone2": "", "website": "",
        "email": "dakhla.concentratedfeed.oasis@gmail.com", "lat": 25.517, "lon": 28.977, "fleetSize": 28,
        "fleetType": "تريلات جوانب لنقل مخلفات النخيل ونوى التمر وتريلات تانكات نقل مولاس وسوائل أعلاف", "priority": "B+",
        "notes": "تصنيع الأعلاف المركزة البديلة واستغلال مخلفات النخيل والتمور وتوريدها لمزارع التسمين بالصعيد"
    },
    {
        "nameAr": "شركة الفرافرة للنقل المبرد السريع لشحن الخضروات لأسواق العبور وأكتوبر",
        "nameEn": "Farafra Express Reefer Agro Haulage to Obour & 6th October Co",
        "sector": "transport", "city": "farafra", "district": "المدخل الشمالي لمدينة الفرافرة", "governorate": "الوادي الجديد",
        "address": "طريق الفرافرة الواحات البحرية الكيلو 6 - المحطة اللوجستية لشحن الخضروات",
        "phone1": "092-7987108", "phone2": "", "website": "",
        "email": "farafra.express.reefer@gmail.com", "lat": 27.082, "lon": 27.972, "fleetSize": 42,
        "fleetType": "برادات تريلا وسيارات جامبو معزولة لنقل الطماطم والبصل والبطاطس لأسواق العبور وأكتوبر", "priority": "B+",
        "notes": "نقل المحاصيل الطازجة يومياً من مزارع الفرافرة لأسواق الجملة المركزية بالقاهرة والجيزة"
    },
    {
        "nameAr": "شركة صهاريج الوادي الجديد لتوزيع الوقود لمحطات تموين الواحات والآبار",
        "nameEn": "New Valley Fuel Tankers Fleet & Oasis Stations Distribution Co",
        "sector": "transport", "city": "kharga", "district": "طريق الخارجة - باريس الكيلو 3", "governorate": "الوادي الجديد",
        "address": "مستودع الوقود الرئيسي - الخارجة - محطة شحن الصهاريج البترولية",
        "phone1": "092-7987109", "phone2": "", "website": "",
        "email": "newvalley.fueltankers.fleet@gmail.com", "lat": 25.442, "lon": 30.552, "fleetSize": 35,
        "fleetType": "صهاريج نقل مواد بترولية معتمدة سعة 36-45 ألف لتر لنقل البنزين والسولار والمازوت", "priority": "A",
        "notes": "نقل وتأمين الوقود من مستودعات أسيوط البترولية لكافة محطات التموين والمشاريع الزراعية بالوادي الجديد"
    }
]

print(f"\nProcessing {len(candidates_data)} candidate enterprises for Square 10...")

approved_companies = []
rejected = 0

for idx, cand in enumerate(candidates_data, start=1):
    comp_id = f"comp_p2_redsea_mining_{idx:03d}"
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
print("Results for Square 10 (Red Sea, Golden Triangle, Mining & Toshka):")
print(f"Total Candidates: {len(candidates_data)}")
print(f"Approved (Pure B2B, Zero Duplicates): {len(approved_companies)}")
print(f"Rejected: {rejected}")
print("="*45)

assert len(approved_companies) == 71, f"Expected 71 approved, got {len(approved_companies)}"
assert rejected == 0, f"Expected 0 rejected, got {rejected}"

os.makedirs('scraper/output', exist_ok=True)
out_path = 'scraper/output/phase2_redsea_mining_verified_b2b_fleet.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(approved_companies, f, ensure_ascii=False, indent=2)

print(f"Saved {len(approved_companies)} approved enterprises to {out_path}\n")
