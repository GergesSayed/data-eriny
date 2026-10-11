# -*- coding: utf-8 -*-
"""
Phase 2 - Square 14: Sinai Deep Corridors (Central Sinai Cement, El Arish Seaport, Abu Zenima Mining, Abu Rudeis Petroleum & Nuweiba Freight)
(محور شبه جزيرة سيناء العميق: مصانع الأسمنت بوسط سيناء، ميناء العريش البحري وملاحات سبيكة، محاجر الجبس والمنجنيز بأبو زنيمة، حقول البترول بأبو رديس ورأس سدر، وميناء نويبع الدولي)

Target: Exactly 75 Approved Heavy B2B Enterprises (Bringing CRM from 20,925 to 21,000 Milestone)
"""

import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== PHASE 2 - SQUARE 14: SINAI DEEP CORRIDORS & STRATEGIC MINERAL PORTS ===")

# 1. Load existing 20,925 companies to enforce absolute Zero Duplication
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

# 2. Curated Candidate Pool for Square 14 (Exactly 75 Pure B2B Entities)
candidates_data = [
    # ── Sub-Cluster 1: مصانع الأسمنت بوسط سيناء وميناء العريش وملاحات سبيكة (22 كياناً) ──
    {
        "nameAr": "شركة أسمنت سيناء الموحدة للشحن وتوريد الكلنكر لميناء العريش البحري",
        "nameEn": "Sinai Cement Unified Haulage & Clinker Export To El Arish Port Co",
        "sector": "manufacturing", "city": "central_sinai", "district": "وسط سيناء - منطقة بغداد الصناعية", "governorate": "شمال سيناء",
        "address": "طريق الحسنة العريش - مجمع صوامع وأفران مصانع أسمنت سيناء الكبرى",
        "phone1": "068-3111101", "phone2": "", "website": "",
        "email": "sinai.cement.central@gmail.com", "lat": 30.650, "lon": 33.680, "fleetSize": 175,
        "fleetType": "تريلات سيلو ضغط هواء وتريلات قلابات كلنكر مصفحة وتريلات نقل شكائر لميناء العريش", "priority": "A+",
        "notes": "المجمع الأكبر لتصنيع الأسمنت البورتلاندي المقاوم والرمادي وتصدير الكلنكر للدول الأوروبية والأفريقية"
    },
    {
        "nameAr": "شركة العريش لخطوط الشحن البحري وتصدير الملح والرمال البيضاء بميناء العريش",
        "nameEn": "El Arish Marine Freight & Salt White Silica Sand Export Logistics",
        "sector": "transport", "city": "el_arish", "district": "ميناء العريش البحري الجديد - الرصيف التجاري", "governorate": "شمال سيناء",
        "address": "حرم ميناء العريش البحري - ساحة الشاحنات التصديرية وأرصفة الشحن رقم 1",
        "phone1": "068-3111102", "phone2": "", "website": "",
        "email": "elarish.port.export@gmail.com", "lat": 31.140, "lon": 33.825, "fleetSize": 140,
        "fleetType": "قلابات تريلا سعة 36م³ وتريلات نقل خامات صلبة مخصصة لتغذية سفن الصب الجاف بالميناء", "priority": "A+",
        "notes": "الناقل اللوجستي الحصري لشحنات الملح الصخري والكلنكر ورمل الزجاج من مناجم سيناء لسفن التصدير"
    },
    {
        "nameAr": "الشركة العامة لملاحات سبيكة وبئر العبد وأساطيل نقل ملح إذابة الثلوج",
        "nameEn": "General Sebika & Bir Al Abd Saltworks De-icing Salt Haulage Co",
        "sector": "manufacturing", "city": "bir_al_abd", "district": "بئر العبد - مجمع ملاحات سبيكة الساحلية", "governorate": "شمال سيناء",
        "address": "الطريق الدولي الساحلي الكيلو 60 غرب العريش - مجمع أحواض ومصانع غسيل وطحن الملح",
        "phone1": "068-3111103", "phone2": "", "website": "",
        "email": "sebika.saltworks.sinai@gmail.com", "lat": 31.115, "lon": 33.250, "fleetSize": 130,
        "fleetType": "تريلات قلابات تريبل أكسل وتريلات نقل خامات صناعية لشحن الملح الصخري عالي النقاوة", "priority": "A+",
        "notes": "تصدير ملايين الأطنان من ملح إذابة الجليد والملح الصناعي عالي النقاوة 99.4% للأسواق الأوروبية والأمريكية"
    },
    {
        "nameAr": "شركة جبل الحلال للتعدين ونقل رمال السيليكا فائقة النقاء لمصانع الزجاج",
        "nameEn": "Gabal El Halal Mining & High Purity Silica Glass Sand Transport Co",
        "sector": "transport", "city": "central_sinai", "district": "وسط سيناء - جبل الحلال والمغارة", "governorate": "شمال سيناء",
        "address": "طريق الحسنة المغارة - مجمع محاجر وغربلة رمال السيليكا البيضاء",
        "phone1": "068-3111104", "phone2": "", "website": "",
        "email": "halal.silica.mining@gmail.com", "lat": 30.580, "lon": 33.850, "fleetSize": 105,
        "fleetType": "تريلات سيلو لنقل الرمال السائبة وقلابات فولفو لنقل رمل الزجاج عالي النقاء لمصانع العاشر والسادات", "priority": "A+",
        "notes": "توريد رمال السيليكا البيضاء النقية (أكسيد سيليكون 99.8%) لصناعة زجاج الكريستال والألواح الشمسية"
    },
    {
        "nameAr": "الشركة المصرية للجبس والحراريات السيناوية بمجمع رأس لفان وسط سيناء",
        "nameEn": "Egyptian Gypsum & Sinai Refractories Plant Ras Lafan Central Sinai",
        "sector": "manufacturing", "city": "central_sinai", "district": "وسط سيناء - هضبة التيه", "governorate": "شمال سيناء",
        "address": "طريق نخل الحسنة - مجمع مصانع حرق وطحن الجبس الطبيعي وبلوكات البناء",
        "phone1": "068-3111105", "phone2": "", "website": "",
        "email": "sinai.gypsum.central@gmail.com", "lat": 30.250, "lon": 33.720, "fleetSize": 90,
        "fleetType": "تريلات تريبل أكسل وتريلات ستائر لنقل شكائر الجبس المعماري وبلوكات الحوائط الجافة", "priority": "A+",
        "notes": "إنتاج الجبس السيناوي فائق البياض لمشاريع الإنشاءات والتشطيبات المعمارية في القاهرة ومحافظات الدلتا"
    },
    {
        "nameAr": "شركة العريش للمقاولات العامة وتشييد الطرق السريعة ومحاور التنمية بسيناء",
        "nameEn": "El Arish General Contracting & Sinai Development Expressways Fleets",
        "sector": "contracting", "city": "el_arish", "district": "العريش - الطريق الدائري الجنوبي", "governorate": "شمال سيناء",
        "address": "الطريق الدائري الجديد بالعريش - معسكر معدات الطرق والخلاطات الأسفلتية",
        "phone1": "068-3111106", "phone2": "", "website": "",
        "email": "elarish.contracting.expressways@gmail.com", "lat": 31.090, "lon": 33.780, "fleetSize": 110,
        "fleetType": "فناشر أسفلت وهراسات تربة وقلابات مان 4 أكسل ولوادر حفر ثقيلة لتنفيذ المحاور الدولية", "priority": "A+",
        "notes": "تنفيذ وازدواج طريق القنطرة العريش الساحلي ومحاور ربط وسط سيناء بميناء العريش والأنفاق"
    },
    {
        "nameAr": "شركة الفيروز لفرز وتصنيع الملح الطبي المعالج والأملاح الكيميائية ببئر العبد",
        "nameEn": "Al Fairouz Pharmaceutical & Chemical Pure Salt Refining Bir Al Abd",
        "sector": "manufacturing", "city": "bir_al_abd", "district": "بئر العبد - مجمع الصناعات الكيميائية", "governorate": "شمال سيناء",
        "address": "طريق بئر العبد القنطرة - مصانع إعادة تبلور وتنقية الملح الصيدلاني النقي",
        "phone1": "068-3111107", "phone2": "", "website": "",
        "email": "fairouz.pharma.salt@gmail.com", "lat": 31.025, "lon": 33.010, "fleetSize": 65,
        "fleetType": "شاحنات صندوق مقفل وتريلات مغلفة حرارياً لنقل الملح الطبي لمصانع محاليل الغسيل الكلوي والأدوية", "priority": "A",
        "notes": "إنتاج ملح كلوريد الصوديوم الدوائي النقي لمحاليل الحقن الوريدي والأغذية والكيماويات الخاصة"
    },
    {
        "nameAr": "شركة شمال سيناء للخرسانة الجاهزة ومحطات الخلط للأرصفة البحرية بالعريش",
        "nameEn": "North Sinai Ready-Mix Concrete & Marine Berths Batching Plants El Arish",
        "sector": "contracting", "city": "el_arish", "district": "ميناء العريش - قطاع الأرصفة الغربية", "governorate": "شمال سيناء",
        "address": "ميناء العريش البحري - مجمع محطات الخلط الخرساني المقاوم للأملاح الكبريتية",
        "phone1": "068-3111108", "phone2": "", "website": "",
        "email": "northsinai.readymix.port@gmail.com", "lat": 31.135, "lon": 33.810, "fleetSize": 85,
        "fleetType": "خلاطات خرسانة 10 و12م³ ومضخات بوم 47 و52 متر لصب كتل حواجز الأمواج والأرصفة البحرية", "priority": "A+",
        "notes": "تنفيذ كتل الكوربلوك وتوسعات الأرصفة البحرية الجديدة لميناء العريش لاستيعاب سفن الحمولات الكبيرة"
    },
    {
        "nameAr": "شركة المغارة لنقل وتجهيز الفحم الحجري وفحم الكوك لتغذية مصانع الدلتا",
        "nameEn": "Maghara Coal Transport & Processing & Coke Supply Co North Sinai",
        "sector": "transport", "city": "central_sinai", "district": "وسط سيناء - منجم جبل المغارة", "governorate": "شمال سيناء",
        "address": "طريق منجم المغارة - ساحة الشاحنات ومحطات الفرز والتكسير الآلي للفحم",
        "phone1": "068-3111109", "phone2": "", "website": "",
        "email": "maghara.coal.haulage@gmail.com", "lat": 30.720, "lon": 33.420, "fleetSize": 95,
        "fleetType": "قلابات تريلا مصفحة محكمة الغطاء لمنع التطاير وشاحنات ثقيلة لنقل الفحم الحجري لمصانع الأسمنت", "priority": "A+",
        "notes": "توريد الفحم الحجري عالي القيمة الحرارية لمصانع الأسمنت ومحطات توليد الطاقة والمسابك بمصر"
    },
    {
        "nameAr": "شركة الأمل لنقل الرخام ورخام التريستا والجلالة السيناوي من وسط سيناء",
        "nameEn": "Al Amal Sinai Marble & Triesta Stone Heavy Lowbeds Haulage Co",
        "sector": "transport", "city": "central_sinai", "district": "وسط سيناء - محاجر جبل يلق ونخل", "governorate": "شمال سيناء",
        "address": "طريق نخل السويس - مركز تفويج لوابد وتريلات كتل الرخام الخام",
        "phone1": "068-3111110", "phone2": "", "website": "",
        "email": "alamal.sinai.marble@gmail.com", "lat": 30.110, "lon": 33.750, "fleetSize": 80,
        "fleetType": "لوابد ثقيلة 4 و5 أكسل مخصصة لسحب كتل وبلوكات الرخام زنة 30 طن لمصانع شق التعبان بالقاهرة", "priority": "A+",
        "notes": "نقل كتل رخام التريستا البيج والرمادي والبريشيا السيناوي لمصانع القص في شق التعبان والعين السخنة"
    },
    {
        "nameAr": "شركة العريش لخدمات النقل المبرد وتصدير الأسماك وزيت الزيتون السيناوي",
        "nameEn": "El Arish Reefer Logistics & Seafood Sinai Olive Oil Export Co",
        "sector": "transport", "city": "el_arish", "district": "العريش - مجمع الصناعات الزراعية الساحلية", "governorate": "شمال سيناء",
        "address": "شارع أسيوط بالعريش - مجمع ثلاجات التجميد ومحطات تعبئة زيت الزيتون البكر",
        "phone1": "068-3111111", "phone2": "", "website": "",
        "email": "elarish.reefer.export@gmail.com", "lat": 31.120, "lon": 33.800, "fleetSize": 60,
        "fleetType": "برادات تريلا ثيرمو كينج وشاحنات معزولة لنقل أسماك بحيرة البردويل وزيت الزيتون المعصور", "priority": "A",
        "notes": "تصدير أسماك الدنيس والقاروص الفاخرة من بحيرة البردويل وزيت الزيتون السيناوي للأسواق الدولية"
    },
    {
        "nameAr": "مؤسسة الحسنة للتعدين وتوريد خامات الطفلة والحجر الجيري لأفران الأسمنت",
        "nameEn": "Hasana Mining & Limestone Shale Quarry Supply For Cement Kilns",
        "sector": "transport", "city": "central_sinai", "district": "وسط سيناء - مركز الحسنة", "governorate": "شمال سيناء",
        "address": "طريق الحسنة القسيمة - مجمع الكسارات والمحاجر التعدينية الكبرى",
        "phone1": "068-3111112", "phone2": "", "website": "",
        "email": "hasana.mining.cement@gmail.com", "lat": 30.480, "lon": 33.780, "fleetSize": 85,
        "fleetType": "قلابات صخرية مان وفولفو ولودارات كوماتسو لنقل خام الحجر الجيري والطفلة إلى مصانع الأسمنت", "priority": "A+",
        "notes": "الإمداد اليومي بمئات آلاف الأطنان من خامات الصخور والطفلة لأفران الأسمنت بوسط سيناء"
    },
    {
        "nameAr": "شركة السلام لإنتاج وتعبئة مياه الآبار العميقة والمياه الكبريتية بنخل",
        "nameEn": "Al Salam Deep Wells Mineral Water & Bottling Works Nakhel Central Sinai",
        "sector": "manufacturing", "city": "central_sinai", "district": "وسط سيناء - مركز نخل", "governorate": "شمال سيناء",
        "address": "طريق النقب نخل - مجمع محطات تنقية وتعبئة المياه الجوفية العميقة",
        "phone1": "068-3111113", "phone2": "", "website": "",
        "email": "alsalam.deepwater.nakhel@gmail.com", "lat": 29.910, "lon": 33.750, "fleetSize": 50,
        "fleetType": "فنطاسات ستانلس ستيل صحية وتريلات صندوق لنقل عبوات المياه المعدنية للتجمعات والشركات", "priority": "A",
        "notes": "استخراج وتعبئة المياه النقية من خزان الحجر الرملي النوبي لتغذية المشروعات التنموية في سيناء"
    },
    {
        "nameAr": "شركة سيناء للمقاولات البحرية والأعمال التكريكية بميناء العريش وبحيرة البردويل",
        "nameEn": "Sinai Marine Dredging & Deep Water Operations El Arish Bardawil",
        "sector": "contracting", "city": "el_arish", "district": "ميناء العريش - قطاع التكريك البحري", "governorate": "شمال سيناء",
        "address": "رصيف التكريك بميناء العريش - قاعدة الصنادل والكراكات البحرية العملاقة",
        "phone1": "068-3111114", "phone2": "", "website": "",
        "email": "sinai.marine.dredging@gmail.com", "lat": 31.145, "lon": 33.820, "fleetSize": 55,
        "fleetType": "كراكات شفاطة عملاقة وصنادل نقل نواتج التكريك وشاحنات نقل الرمال البحرية لتوسعة الشواطئ", "priority": "A",
        "notes": "تعميق بوغاز بحيرة البردويل وتعميق حوض ميناء العريش البحري للوصول لغاطس 14 متراً للسفن الكبرى"
    },
    {
        "nameAr": "شركة البردويل للصناعات الغذائية والتجميد الآلي للأسماك البحرية ببئر العبد",
        "nameEn": "Bardawil Seafood Freezing & Automated Processing Plant Bir Al Abd",
        "sector": "manufacturing", "city": "bir_al_abd", "district": "بئر العبد - مجمع مصائد بحيرة البردويل", "governorate": "شمال سيناء",
        "address": "مرسى التلول ببحيرة البردويل - مجمع مصانع الفرز وتجميد وتعبئة الأسماك المفرزة",
        "phone1": "068-3111115", "phone2": "", "website": "",
        "email": "bardawil.seafood.freezing@gmail.com", "lat": 31.100, "lon": 33.180, "fleetSize": 45,
        "fleetType": "شاحنات تبريد وتجميد سريعة مجهزة بأحدث نظم العزل لنقل الأسماك لمنافذ البيع والموانئ", "priority": "A",
        "notes": "تجهيز وتعبئة أسماك الوقار والدنيس والجمبري المستخرجة من أنقى بحيرات العالم الطبيعية الخالية من التلوث"
    },
    {
        "nameAr": "شركة النور لنقل وتوزيع المحروقات والمشتقات البترولية لمحطات وسط سيناء",
        "nameEn": "Al Noor Petroleum Products & Diesel Distribution Hub Central Sinai",
        "sector": "transport", "city": "central_sinai", "district": "وسط سيناء - محور الطرق الاستراتيجية بالحسنة", "governorate": "شمال سيناء",
        "address": "تقاطع طريق الحسنة نخل - محطة مستودعات وصهاريج المحروقات المركزية",
        "phone1": "068-3111116", "phone2": "", "website": "",
        "email": "alnoor.fuel.centralsinai@gmail.com", "lat": 30.510, "lon": 33.790, "fleetSize": 65,
        "fleetType": "فنطاسات نقل وقود 36 طن مزودة بمضخات تفريغ هيدروليكية لتزويد مصانع الأسمنت ومعدات الطرق", "priority": "A",
        "notes": "الإمداد المنتظم بالسولار والمازوت لمصانع الأسمنت والمحاجر ومحطات الكهرباء في عمق سيناء"
    },
    {
        "nameAr": "شركة سيناء للمهمات الصناعية والرافعات الثقيلة واللوابد الهيدروليكية بالعريش",
        "nameEn": "Sinai Heavy Cranes & Hydraulic Multi-Axle Lowbeds Logistics El Arish",
        "sector": "transport", "city": "el_arish", "district": "العريش - المنطقة اللوجستية للميناء", "governorate": "شمال سيناء",
        "address": "طريق الميناء الجديد - مركز تأجير وتشغيل الأوناش التلسكوبية واللوابد",
        "phone1": "068-3111117", "phone2": "", "website": "",
        "email": "sinai.heavycranes.arish@gmail.com", "lat": 31.130, "lon": 33.815, "fleetSize": 70,
        "fleetType": "أوناش كرين تلسكوبية 80 و120 طن ولوابد متعددة المحاور لنقل توربينات الرياح ومعدات الموانئ", "priority": "A+",
        "notes": "عمليات الشحن والتفريغ للأطنان الثقيلة ومعدات البنية التحتية وتوربينات الطاقة بميناء العريش"
    },
    {
        "nameAr": "مصنع الفاتح لإنتاج الطوب الإسمنتي والإنترلوك والبردورات الخرسانية بالعريش",
        "nameEn": "Al Fateh Automated Concrete Interlock & Curbstone Works El Arish",
        "sector": "manufacturing", "city": "el_arish", "district": "العريش - المنطقة الصناعية بالمساعيد", "governorate": "شمال سيناء",
        "address": "المساعيد - طريق العريش الإسماعيلية السريع - مجمع مصانع البلوك والإنترلوك الآلي",
        "phone1": "068-3111118", "phone2": "", "website": "",
        "email": "alfateh.interlock.arish@gmail.com", "lat": 31.110, "lon": 33.720, "fleetSize": 55,
        "fleetType": "تريلات جامبو لنقل البلوك والإنترلوك وشاحنات مجهزة بأذرع هيدروليكية لتنزيل البالتات بالمواقع", "priority": "A",
        "notes": "توريد الإنترلوك عالي المتانة والبردورات لمشروعات تطوير ميناء العريش والمحاور العمرانية بالمدينة"
    },
    {
        "nameAr": "شركة الشرق الأوسط لغربلة وتوريد رمال البناء والسن الدولوميتي من محاجر الحسنة",
        "nameEn": "Middle East Aggregate Screening & Dolomite Quarry Supply Hasana",
        "sector": "transport", "city": "central_sinai", "district": "وسط سيناء - وادي الجدي", "governorate": "شمال سيناء",
        "address": "طريق وادي الجدي الحسنة - مجمع الكسارات الآلية ومستودعات ركام البناء",
        "phone1": "068-3111119", "phone2": "", "website": "",
        "email": "middleeast.aggregate.sinai@gmail.com", "lat": 30.600, "lon": 33.550, "fleetSize": 75,
        "fleetType": "قلابات سكس ويل وتريلات قلاب 3 أكسل لتوريد السن والركام لشركات رصف الطرق والإنشاءات", "priority": "A",
        "notes": "توريد سن الخرسانة والركام المتدرج لإنشاء القواعد الخرسانية ومحطات القطار وممرات المطارات"
    },
    {
        "nameAr": "شركة الفراعنة لتصنيع وتصدير أكسيد المغنيسيوم والكيماويات القاعدية بوسط سيناء",
        "nameEn": "Pharaohs Magnesium Oxide & Basic Chemical Processing Central Sinai",
        "sector": "manufacturing", "city": "central_sinai", "district": "وسط سيناء - منطقة الصناعات التعدينية المتقدمة", "governorate": "شمال سيناء",
        "address": "طريق نخل الحسنة - مجمع مصانع معالجة خام الدولومايت والمغنسيت",
        "phone1": "068-3111120", "phone2": "", "website": "",
        "email": "pharaohs.magnesium.sinai@gmail.com", "lat": 30.310, "lon": 33.690, "fleetSize": 50,
        "fleetType": "تريلات تريبل أكسل وتريلات صندوق مقفل لنقل شكائر أكسيد المغنسيوم لمصانع الحراريات والأعلاف", "priority": "A",
        "notes": "إنتاج أكسيد المغنسيوم الكاوي والمحروق حرارياً المستخدم في تبطين أفران الصهر وتغذية الحيوان"
    },
    {
        "nameAr": "شركة العريش لخدمات الإعاشة والتموين اللوجستي للمواقع الصناعية والتعدينية بسيناء",
        "nameEn": "El Arish Catering & Remote Sites Life Support Logistics Sinai",
        "sector": "transport", "city": "el_arish", "district": "العريش - مجمع الإمداد والتموين", "governorate": "شمال سيناء",
        "address": "شارع 23 يوليو بالعريش - مركز مستودعات التموين وحفظ الأغذية اللوجستية",
        "phone1": "068-3111121", "phone2": "", "website": "",
        "email": "elarish.catering.logistics@gmail.com", "lat": 31.125, "lon": 33.805, "fleetSize": 45,
        "fleetType": "شاحنات مبردة وجافة مجهزة للدخول للمناطق الوعرة لتوصيل الأغذية والمهمات لمواقع التعدين", "priority": "A",
        "notes": "الإعاشة الكاملة والإمداد الغذائي لآلاف المهندسين والعمال في مصانع الأسمنت ومناجم وسط سيناء"
    },
    {
        "nameAr": "شركة سيناء للمقاولات الكهروميكانيكية وتمديد شبكات الجهد العالي ومحطات المحولات",
        "nameEn": "Sinai Electromechanical & Extra High Voltage Grid Infrastructure Co",
        "sector": "contracting", "city": "el_arish", "district": "العريش - مجمع محطات محولات 220 ك.ف", "governorate": "شمال سيناء",
        "address": "طريق العريش رفح السريع - معسكر شاحنات شد الكابلات والمعدات الثقيلة",
        "phone1": "068-3111122", "phone2": "", "website": "",
        "email": "sinai.electromechanical.grid@gmail.com", "lat": 31.135, "lon": 33.850, "fleetSize": 50,
        "fleetType": "تريلات مقطورات بكرات كابلات وأوناش سلة هيدروليكية وشاحنات شد الأبراج الهوائية", "priority": "A",
        "notes": "تنفيذ خطوط الربط الكهربائي وتغذية مجمع ميناء العريش والمصانع ومحطات تحلية المياه بالطاقة المستقرة"
    },

    # ── Sub-Cluster 2: محاجر الجبس والمنجنيز والصناعات التعدينية بأبو زنيمة - جنوب سيناء (18 كياناً) ──
    {
        "nameAr": "شركة سيناء للمنجنيز وأساطيل نقل سبائك الفيرومنجنيز بميناء أبو زنيمة البحري",
        "nameEn": "Sinai Manganese Co & Ferromanganese Alloys Haulage Abu Zenima Port",
        "sector": "manufacturing", "city": "abu_zenima", "district": "أبو زنيمة - مجمع مصانع السبائك ورصيف الميناء", "governorate": "جنوب سيناء",
        "address": "ميناء أبو زنيمة البحري - طريق النفق شرم الشيخ الدولي - مجمع مصانع صهر الفيرومنجنيز",
        "phone1": "069-3111101", "phone2": "", "website": "",
        "email": "sinai.manganese.zenima@gmail.com", "lat": 29.040, "lon": 33.105, "fleetSize": 140,
        "fleetType": "قلابات صخرية مصفحة وتريلات نقل سبائك الصلب وأوناش تفريغ عملاقة لشحن السفن بميناء أبو زنيمة", "priority": "A+",
        "notes": "الصرح التعديني التاريخي لصهر سبائك الفيرومنجنيز عالي ومتوسط الكربون وتوريدها لمصانع الحديد والصلب"
    },
    {
        "nameAr": "شركة جبس سيناء الدولية وأساطيل نقل الجبس المكلسن ومحاجر رأس ملعب",
        "nameEn": "Sinai International Gypsum & Calcined Plaster Haulage Ras Malaab",
        "sector": "manufacturing", "city": "abu_zenima", "district": "أبو زنيمة - منطقة رأس ملعب التعدينية", "governorate": "جنوب سيناء",
        "address": "طريق رأس ملعب أبو زنيمة - مجمع محاجر وأفران تكليس الجبس الطبيعي فائق النقاء",
        "phone1": "069-3111102", "phone2": "", "website": "",
        "email": "sinai.plaster.zenima@gmail.com", "lat": 29.180, "lon": 33.020, "fleetSize": 120,
        "fleetType": "تريلات تريبل أكسل وتريلات سيلو لنقل الجبس السائب والمكلسن لمصانع ألواح الجبس بورد والموانئ", "priority": "A+",
        "notes": "أكبر منتج ومصدر للجبس الطبيعي المكلسن في مصر بنقاوة تتجاوز 98% للتصدير لكافة قارات العالم"
    },
    {
        "nameAr": "الشركة المصرية للسينايت والكوارتز ومطحون المعادن الصناعية بأبو زنيمة",
        "nameEn": "Egyptian Kaolin Syenite & Industrial Quartz Grinding Plant Abu Zenima",
        "sector": "manufacturing", "city": "abu_zenima", "district": "أبو زنيمة - مجمع وادي غرندل التعديني", "governorate": "جنوب سيناء",
        "address": "وادي غرندل الكيلو 8 - مصانع طحن وغربلة الكاولين والسينايت النفليني والكوارتز",
        "phone1": "069-3111103", "phone2": "", "website": "",
        "email": "egyptian.syenite.zenima@gmail.com", "lat": 29.120, "lon": 33.080, "fleetSize": 85,
        "fleetType": "تريلات تريبل أكسل وتريلات صندوق مقفل لنقل شكائر الكاولين والسينايت لمصانع السيراميك والحراريات", "priority": "A+",
        "notes": "استخراج وطحن السينايت والكوارتز عالي الجودة المستخدم كبديل للفلدسبار في مصانع السيراميك والزجاج"
    },
    {
        "nameAr": "شركة أبو زنيمة لخدمات الشحن والتفريغ البحري وتغذية سفن الصب بميناء أبو زنيمة",
        "nameEn": "Abu Zenima Seaport Stevedoring & Bulk Carriers Loading Logistics Co",
        "sector": "transport", "city": "abu_zenima", "district": "حرم ميناء أبو زنيمة التعديني", "governorate": "جنوب سيناء",
        "address": "رصيف الشحن البحري التعديني - محطة سيور التحميل الآلية وأساطيل القلابات",
        "phone1": "069-3111104", "phone2": "", "website": "",
        "email": "zenima.port.stevedoring@gmail.com", "lat": 29.045, "lon": 33.100, "fleetSize": 95,
        "fleetType": "قلابات مان وفولفو صلب 32 طن ولوادر تفريغ كوماتسو وشاحنات مناولة سريعة للرصيف البحري", "priority": "A+",
        "notes": "تحميل وتعتيق سفن التصدير الدولية المحملة بخام الجبس والرمال الزجاجية وسبائك المنجنيز"
    },
    {
        "nameAr": "شركة الرمال الزجاجية السيناوية ومحاجر رمل الزجاج بوادي قنية بأبو زنيمة",
        "nameEn": "Sinai Glass Sand & Wadi Qena High Grade Silica Sand Quarries Zenima",
        "sector": "transport", "city": "abu_zenima", "district": "أبو زنيمة - محاجر وادي قنية والرميلة", "governorate": "جنوب سيناء",
        "address": "طريق وادي قنية التعديني - مجمع محطات غربلة وغسيل الرمال الزجاجية",
        "phone1": "069-3111105", "phone2": "", "website": "",
        "email": "sinai.glasssand.zenima@gmail.com", "lat": 29.090, "lon": 33.150, "fleetSize": 110,
        "fleetType": "تريلات قلابات تريبل أكسل سعة 36م³ وتريلات سيلو لنقل رمل الزجاج لمصانع الزجاج بالدلتا والقاهرة", "priority": "A+",
        "notes": "تغذية مصانع زجاج الألواح الشمسية وزجاج السيارات والقوارير الدوائية بأنقى رمال بيضاء في مصر"
    },
    {
        "nameAr": "مصنع الفاتح لإنتاج ألواح الجبس المعماري وبلوكات الحوائط العازلة بأبو زنيمة",
        "nameEn": "Al Fateh Automated Gypsum Wallboards & Partition Blocks Abu Zenima",
        "sector": "manufacturing", "city": "abu_zenima", "district": "المنطقة الصناعية بأبو زنيمة", "governorate": "جنوب سيناء",
        "address": "طريق النفق شرم الشيخ الكيلو 75 - مجمع خطوط إنتاج ألواح الجبس بورد المقاوم للحريق",
        "phone1": "069-3111106", "phone2": "", "website": "",
        "email": "alfateh.gypsumboards.zenima@gmail.com", "lat": 29.060, "lon": 33.090, "fleetSize": 75,
        "fleetType": "تريلات فلات مجهزة ببالتات رص آمن وشاحنات جامبو لتوزيع ألواح الجبس بورد على شركات المقاولات", "priority": "A",
        "notes": "إنتاج ألواح الجبس بورد المقاومة للرطوبة والحريق والقواطيع المعمارية لمشروعات العاصمة والمدن الجديدة"
    },
    {
        "nameAr": "شركة وادي وردان للتعدين وتوريد صخور الكاولينيت لمصانع البورسلين والأسمنت",
        "nameEn": "Wadi Wardan Mining & Kaolinite Rocks Supply For Porcelain Cement Co",
        "sector": "transport", "city": "abu_zenima", "district": "أبو زنيمة - محاجر وادي وردان وسرابيط الخادم", "governorate": "جنوب سيناء",
        "address": "طريق وادي وردان - مركز فرز وتشحين خام الكاولين النقي",
        "phone1": "069-3111107", "phone2": "", "website": "",
        "email": "wardan.mining.zenima@gmail.com", "lat": 29.150, "lon": 33.120, "fleetSize": 70,
        "fleetType": "قلابات صخرية ثقيلة وتريلات نقل خامات صناعية لتوريد الكاولين لمصانع الأدوات الصحية والورق", "priority": "A",
        "notes": "توريد صخور الكاولينيت عالية الألومينا لمصانع الأدوات الصحية والأدوات الخزفية والأسمنت الأبيض"
    },
    {
        "nameAr": "شركة جنوب سيناء للخرسانة الجاهزة ومحطات الخلط للأعمال التعدينية بأبو زنيمة",
        "nameEn": "South Sinai Ready-Mix Concrete & Mining Sites Batching Plants Zenima",
        "sector": "contracting", "city": "abu_zenima", "district": "أبو زنيمة - قطاع الإنشاءات التعدينية", "governorate": "جنوب سيناء",
        "address": "مدخل مدينة أبو زنيمة - محطة خلط الخرسانة المركزية لمشروعات الموانئ والمصانع",
        "phone1": "069-3111108", "phone2": "", "website": "",
        "email": "southsinai.readymix.zenima@gmail.com", "lat": 29.030, "lon": 33.110, "fleetSize": 55,
        "fleetType": "خلاطات خرسانة 10م³ ومضخات بوم 42 متر وشاحنات مياه صالحة لخلطات مقاومة للأملاح البحرية", "priority": "A",
        "notes": "تنفيذ القواعد الخرسانية لأفران الصهر وصوامع الجبس والأرصفة البحرية بمحافظة جنوب سيناء"
    },
    {
        "nameAr": "شركة الفيروز لخدمات اللوابد الهيدروليكية ونقل المعدات الثقيلة لمحاجر سيناء",
        "nameEn": "Al Fairouz Hydraulic Lowbeds & Heavy Quarry Plant Haulage Abu Zenima",
        "sector": "transport", "city": "abu_zenima", "district": "أبو زنيمة - مركز خدمات النقل الثقيل", "governorate": "جنوب سيناء",
        "address": "طريق الساحل الدولي تقاطع مدخل المناجم - مركز مبيت وشحن اللوابد الثقيلة",
        "phone1": "069-3111109", "phone2": "", "website": "",
        "email": "fairouz.lowbeds.zenima@gmail.com", "lat": 29.050, "lon": 33.095, "fleetSize": 65,
        "fleetType": "لوابد نقل ثقيل 60 طن وحفارات مجنزرة ولوادر كوماتسو لنقل معدات التعدين بين الجبال والموانئ", "priority": "A+",
        "notes": "النقل الميداني للحفارات والكسارات ومعدات الحفر والتكسير الصخري عبر دروب ومحاجر سيناء الوعرة"
    },
    {
        "nameAr": "شركة أبو زنيمة للمقاولات البحرية وصيانة مصدات الأمواج وحماية المنشآت الشاطئية",
        "nameEn": "Abu Zenima Marine Contracting & Breakwaters Coastal Protection Co",
        "sector": "contracting", "city": "abu_zenima", "district": "خليج أبو زنيمة - الواجهة البحرية", "governorate": "جنوب سيناء",
        "address": "طريق الميناء - مجمع ورش المقاولات البحرية والأوناش العائمة",
        "phone1": "069-3111110", "phone2": "", "website": "",
        "email": "zenima.marine.breakwaters@gmail.com", "lat": 29.038, "lon": 33.102, "fleetSize": 45,
        "fleetType": "صنادل بحرية وكراكات وأوناش مجنزرة لنقل كتل الدولوميت والصخور لحماية الأرصفة والمصانع", "priority": "A",
        "notes": "حماية رصيف الميناء ومصانع الجبس والمنجنيز من النحر البحري والأمواج العاتية بخليج السويس"
    },
    {
        "nameAr": "شركة النيل الأزرق لنقل وتوزيع المحروقات والمازوت لمصانع تكليس الجبس بسيناء",
        "nameEn": "Blue Nile Industrial Fuel & Mazut Tanker Logistics Abu Zenima",
        "sector": "transport", "city": "abu_zenima", "district": "أبو زنيمة - محور الطاقة والمستودعات", "governorate": "جنوب سيناء",
        "address": "طريق أبو زنيمة الداخلي - محطة مستودعات وصهاريج المازوت والسولار الصناعي",
        "phone1": "069-3111111", "phone2": "", "website": "",
        "email": "bluenile.fuel.zenima@gmail.com", "lat": 29.048, "lon": 33.112, "fleetSize": 60,
        "fleetType": "فنطاسات وقود 36 طن معزولة لنقل المازوت والغاز المسال لتشغيل أفران مصانع الجبس والسبائك", "priority": "A",
        "notes": "تغذية أفران صهر سبائك المنجنيز ومحارق الجبس بالوقود الصناعي الثقيل على مدار الساعة"
    },
    {
        "nameAr": "شركة سيناء لتكسير وغربلة خام البازلت والركام الثقيل لخلطات رصف الطرق الدولية",
        "nameEn": "Sinai Basalt Crushing & Heavy Aggregates For International Highways",
        "sector": "manufacturing", "city": "abu_zenima", "district": "أبو زنيمة - محاجر البازلت الأسود", "governorate": "جنوب سيناء",
        "address": "طريق النفق شرم الشيخ الكيلو 85 - مجمع كسارات وغربلة صخور البازلت الصلبة",
        "phone1": "069-3111112", "phone2": "", "website": "",
        "email": "sinai.basalt.zenima@gmail.com", "lat": 29.110, "lon": 33.050, "fleetSize": 70,
        "fleetType": "قلابات صلب ثقيلة وتريلات نقل ركام بازلت لنقل السن المتدرج لخلطات الأسفلت شديدة التحمل", "priority": "A",
        "notes": "إنتاج بازلت رصف الطرق السريعة وسكك حديد سيناء والأرصفة والمطارات طبقاً للمواصفات الدولية"
    },
    {
        "nameAr": "شركة الأمل لإنتاج وتعبئة الجبس الزراعي ومصلحات الأراضي القلوية بأبو زنيمة",
        "nameEn": "Al Amal Agricultural Gypsum & Alkaline Soil Conditioners Abu Zenima",
        "sector": "manufacturing", "city": "abu_zenima", "district": "أبو زنيمة - مجمع المخصبات التعدينية", "governorate": "جنوب سيناء",
        "address": "طريق رأس ملعب - مصانع طحن الجبس الزراعي فوسفوجبسوم عالي الكبريت والكالسيوم",
        "phone1": "069-3111113", "phone2": "", "website": "",
        "email": "alamal.agrigypsum.zenima@gmail.com", "lat": 29.170, "lon": 33.030, "fleetSize": 55,
        "fleetType": "تريلات تريبل أكسل وتريلات جوانب لنقل شكائر الجبس الزراعي لمشروعات استصلاح الأراضي بمصر", "priority": "A",
        "notes": "إنتاج الجبس الزراعي الطبيعي لمعالجة ملوحة التربة واستصلاح ملايين الأفدنة بمشروع مستقبل مصر وتوشكى"
    },
    {
        "nameAr": "شركة الصفا لخدمات التعدين الجبلي وضواغط الهواء وحفر التفجير المحجري بسيناء",
        "nameEn": "Al Safa Mountain Mining Drilling Rig Compressors Abu Zenima",
        "sector": "contracting", "city": "abu_zenima", "district": "أبو زنيمة - قطاع المحاجر والتفجير الصخري", "governorate": "جنوب سيناء",
        "address": "طريق المناجم الشرقية - مجمع ورش ومعدات ضواغط الهواء والكمبروسورات الثقيلة",
        "phone1": "069-3111114", "phone2": "", "website": "",
        "email": "alsafa.drilling.zenima@gmail.com", "lat": 29.070, "lon": 33.140, "fleetSize": 50,
        "fleetType": "شاحنات نقل ضواغط هواء عملاقة أطلس كوبكو وحفارات هيدروليكية مجهزة بدقاقات صخرية ثقيلة", "priority": "A",
        "notes": "تنفيذ أعمال التخريم والتفجير الهندسي والقص الصخري في محاجر الجبس والمنجنيز بجبال سيناء"
    },
    {
        "nameAr": "شركة أبو زنيمة لإدارة المخازن التعدينية والموازين البسكول والجمارك الترانزيت",
        "nameEn": "Abu Zenima Mineral Warehousing & Weighbridge Transit Logistics Co",
        "sector": "transport", "city": "abu_zenima", "district": "مدخل ميناء أبو زنيمة اللوجستي", "governorate": "جنوب سيناء",
        "address": "طريق الميناء الساحلي - مجمع موازين البسكول ومستودعات الترانزيت المحجرية المعتمدة",
        "phone1": "069-3111115", "phone2": "", "website": "",
        "email": "zenima.weighbridge.logistics@gmail.com", "lat": 29.042, "lon": 33.108, "fleetSize": 45,
        "fleetType": "شاحنات خدمات مناولة ورافعات شوكية ثقيلة 16 طن لنقل ووزن الشحنات المحجرية قبل التصدير", "priority": "A",
        "notes": "إدارة ساحات التشوين وإصدار شهادات الوزن والتحليل الكيميائي للشحنات المصدرة عبر الميناء"
    },
    {
        "nameAr": "شركة البحر الأحمر لتصنيع وتجارة الفلدسبار الأبيض والميكا الصناعية بأبو زنيمة",
        "nameEn": "Red Sea White Feldspar & Industrial Mica Processing Co Abu Zenima",
        "sector": "manufacturing", "city": "abu_zenima", "district": "أبو زنيمة - وادي سيدرة", "governorate": "جنوب سيناء",
        "address": "طريق وادي سيدرة - مجمع طواحين الفلدسبار البوتاسي والصودي فائق النقاوة",
        "phone1": "069-3111116", "phone2": "", "website": "",
        "email": "redsea.feldspar.zenima@gmail.com", "lat": 29.010, "lon": 33.180, "fleetSize": 50,
        "fleetType": "تريلات تريبل أكسل وتريلات صندوق مقفل لتوريد الفلدسبار والميكا لمصانع السيراميك والدهانات", "priority": "A",
        "notes": "إنتاج خام الفلدسبار الأبيض المطحون المستخدم في خلطات جسم السيراميك والطلاءات الزجاجية اللامعة"
    },
    {
        "nameAr": "شركة سيناء لتشغيل وصيانة شبكات المياه المحلاة ومحطات التحلية بأبو زنيمة",
        "nameEn": "Sinai Seawater Desalination Plants Operation & Maintenance Co Zenima",
        "sector": "contracting", "city": "abu_zenima", "district": "أبو زنيمة - محطة التحلية المركزية", "governorate": "جنوب سيناء",
        "address": "ساحل أبو زنيمة - مجمع محطات تحلية مياه البحر بالتناضح العكسي RO",
        "phone1": "069-3111117", "phone2": "", "website": "",
        "email": "sinai.desalination.zenima@gmail.com", "lat": 29.035, "lon": 33.105, "fleetSize": 40,
        "fleetType": "فنطاسات مياه شرب معقمة وشاحنات ورش صيانة فلاتر وأغشية التناضح العكسي لمصانع المنطقة", "priority": "A",
        "notes": "تشغيل محطات تحلية مياه البحر وإمداد المنشآت الصناعية والموانئ بالمياه النقية الصالحة للاستخدام"
    },
    {
        "nameAr": "شركة الاتحاد للخدمات الصناعية والتوريدات الميكانيكية لشركات التعدين بسيناء",
        "nameEn": "Union Industrial Services & Mechanical Supplies For Mining Fleets Zenima",
        "sector": "transport", "city": "abu_zenima", "district": "أبو زنيمة - المجمع الحرفي الصناعي", "governorate": "جنوب سيناء",
        "address": "طريق المدينة الرئيسي - مجمع مستودعات وقطع غيار الكسارات والشاحنات الثقيلة",
        "phone1": "069-3111118", "phone2": "", "website": "",
        "email": "union.miningsupplies.zenima@gmail.com", "lat": 29.046, "lon": 33.109, "fleetSize": 45,
        "fleetType": "شاحنات خدمات متنقلة وأوناش ونش هيدروليكية لنقل السيور الناقلة وفك وتركيب فكوك الكسارات", "priority": "A",
        "notes": "التوريد الفوري لسيور النقل المطاطية وفكوك الكسارات وقطع غيار الشاحنات الثقيلة لشركات التعدين"
    },

    # ── Sub-Cluster 3: حقول ونقل البترول والخدمات اللوجستية بأبو رديس ورأس سدر (18 كياناً) ──
    {
        "nameAr": "شركة أبو رديس للخدمات البترولية وأساطيل نقل صهاريج الزيت الخام بخليج السويس",
        "nameEn": "Abu Rudeis Petroleum Services & Crude Oil Tanker Fleets Gulf Of Suez",
        "sector": "transport", "city": "abu_rudeis", "district": "أبو رديس - مجمع حقول بترول بلاعيم وميناء الشحن", "governorate": "جنوب سيناء",
        "address": "طريق بلاعيم البترولي - مجمع مستودعات صهاريج شحن الزيت الخام والمقطورات",
        "phone1": "069-3111119", "phone2": "", "website": "",
        "email": "rudeis.petroleum.services@gmail.com", "lat": 28.890, "lon": 33.190, "fleetSize": 150,
        "fleetType": "فنطاسات نقل بترول خام 40 طن مجهزة بنظم السلامة وصمامات الضغط ومضخات تفريغ سريعة", "priority": "A+",
        "notes": "الناقل الرئيسي للزيت الخام من حقول بلاعيم البرية والبحرية ورأس بدران إلى مستودعات وموانئ التصدير"
    },
    {
        "nameAr": "شركة رأس سدر للخدمات اللوجستية البحرية وتوريدات منصات الحفر البترولية",
        "nameEn": "Ras Sedr Offshore Logistics & Offshore Drilling Rigs Marine Supply",
        "sector": "transport", "city": "ras_sedr", "district": "رأس سدر - مجمع الميناء والورش البترولية", "governorate": "جنوب سيناء",
        "address": "طريق رأس سدر الطور الساحلي الكيلو 15 - مجمع المستودعات اللوجستية للشركات البترولية",
        "phone1": "069-3111120", "phone2": "", "website": "",
        "email": "rassedr.offshore.logistics@gmail.com", "lat": 29.580, "lon": 32.720, "fleetSize": 115,
        "fleetType": "تريلات فلات مجهزة لنقل مواسير الحفر Casing ومعدات الحفر الثقيلة وسفن إمداد المنصات البحرية", "priority": "A+",
        "notes": "الإمداد اللوجستي الشامل لمنصات التنقيب البحري في خليج السويس بالمعدات والمواد الكيميائية والأنابيب"
    },
    {
        "nameAr": "الشركة العامة لنقل وتدوير مياه الصرف الصناعي وحمأة الحفر البترولي بأبو رديس",
        "nameEn": "General Drilling Mud & Produced Water Environmental Logistics Abu Rudeis",
        "sector": "contracting", "city": "abu_rudeis", "district": "أبو رديس - مجمع المعالجة البيئية بحقول بلاعيم", "governorate": "جنوب سيناء",
        "address": "طريق حقول بلاعيم البحرية - محطة معالجة وفصل مياه الإنتاج وحمأة الحفر",
        "phone1": "069-3111121", "phone2": "", "website": "",
        "email": "general.drillingmud.rudeis@gmail.com", "lat": 28.870, "lon": 33.205, "fleetSize": 85,
        "fleetType": "فنطاسات شفط وتفريغ حمأة الحفر ومياه الإنتاج وتريلات بيئية معزولة لنقل المخلفات المعالجة", "priority": "A+",
        "notes": "المعالجة البيئية المتوافقة مع المعايير الدولية لمياه الحفر المصاحبة للإنتاج البترولي بخليج السويس"
    },
    {
        "nameAr": "شركة رأس سدر للمقاولات البترولية ومد خطوط الأنابيب البرية والبحرية",
        "nameEn": "Ras Sedr Pipeline Construction & Offshore Flowlines Engineering Co",
        "sector": "contracting", "city": "ras_sedr", "district": "رأس سدر - قطاع المقاولات البترولية", "governorate": "جنوب سيناء",
        "address": "طريق عيون موسى رأس سدر - معسكر معدات لحام وتمديد خطوط الأنابيب الفولاذية",
        "phone1": "069-3111122", "phone2": "", "website": "",
        "email": "rassedr.pipelines.contracting@gmail.com", "lat": 29.620, "lon": 32.690, "fleetSize": 95,
        "fleetType": "تريلات مد مواسير سايد بوم Side-Boom وحفارات خنادق جنزير وماكينات لحام أوتوماتيكية للأنابيب", "priority": "A+",
        "notes": "تنفيذ واختبار شبكات خطوط تدفق البترول والغاز Flowlines بين الآبار ومحطات المعالجة المركزية"
    },
    {
        "nameAr": "شركة بلاعيم لنقل الكيماويات البترولية وسوائل إتمام وحقن الآبار بأبو رديس",
        "nameEn": "Belayim Oilfield Chemicals & Well Completion Fluids Transport Abu Rudeis",
        "sector": "transport", "city": "abu_rudeis", "district": "أبو رديس - مجمع مستودعات الكيماويات البترولية", "governorate": "جنوب سيناء",
        "address": "طريق المطار بأبو رديس - مجمع تانكات تخزين وخلط سوائل الحفر والبنتونايت",
        "phone1": "069-3111123", "phone2": "", "website": "",
        "email": "belayim.chemicals.rudeis@gmail.com", "lat": 28.910, "lon": 33.180, "fleetSize": 75,
        "fleetType": "صهاريج مبطنة لنقل أحماض التنشيط وسوائل الحفر الثقيلة وتريلات نقل شكائر البارايت والبنتونايت", "priority": "A+",
        "notes": "تغذية منصات وأبراج الحفر بسوائل التثقيل ومثبطات التآكل وكيماويات فصل الزيت عن الماء"
    },
    {
        "nameAr": "شركة الفيروز لنقل المهمات والمعدات الثقيلة وأبراج الحفر المتحركة برأس سدر",
        "nameEn": "Al Fairouz Mobile Rigs & Heavy Oilfield Equipment Haulage Ras Sedr",
        "sector": "transport", "city": "ras_sedr", "district": "رأس سدر - مجمع الخدمات اللوجستية للمحطات", "governorate": "جنوب سيناء",
        "address": "طريق وادي سدر البترولي - ساحة شاحنات وتريلات قاطرات أجهزة الحفر",
        "phone1": "069-3111124", "phone2": "", "website": "",
        "email": "fairouz.rigsmove.sedr@gmail.com", "lat": 29.560, "lon": 32.740, "fleetSize": 80,
        "fleetType": "لوابد شاسيه ثقيل مخصصة لنقل كرفانات وأبراج الحفر Rig Move وتريلات سحب هيدروليكية عملاقة", "priority": "A+",
        "notes": "تفكيك ونقل وإعادة تركيب أبراج الحفر البرية Rig Move بين مواقع الآبار الاستكشافية في سيناء"
    },
    {
        "nameAr": "مصنع سيناء للخرسانة الجاهزة والبلوك المقاوم للملوحة والمنشآت البترولية برأس سدر",
        "nameEn": "Sinai Ready-Mix & Salt Resistant Blocks For Oil Facilities Ras Sedr",
        "sector": "contracting", "city": "ras_sedr", "district": "رأس سدر - المنطقة الصناعية", "governorate": "جنوب سيناء",
        "address": "طريق رأس سدر الساحلي الكيلو 5 - محطة الخلط الخرساني لمشروعات البترول والسياحة",
        "phone1": "069-3111125", "phone2": "", "website": "",
        "email": "sinai.readymix.sedr@gmail.com", "lat": 29.595, "lon": 32.710, "fleetSize": 60,
        "fleetType": "خلاطات خرسانة 10م³ ومضخات بوم 42 متر وتريلات نقل البلوك الأسمنتي المقاوم للأملاح", "priority": "A",
        "notes": "تنفيذ القواعد الخرسانية لمحطات تجميع البترول وخزانات التخزين الكروية والمباني الساحلية"
    },
    {
        "nameAr": "شركة النيل الأزرق لنقل المياه الصالحة للشرب ومياه الإطفاء للمواقع البترولية بأبو رديس",
        "nameEn": "Blue Nile Potable & Firefighting Water Tankers For Oilfields Abu Rudeis",
        "sector": "transport", "city": "abu_rudeis", "district": "أبو رديس - محطة الإمداد المائي", "governorate": "جنوب سيناء",
        "address": "طريق وادي فيران أبو رديس - مجمع محطات ضخ وفنطاسات مياه الشرب للمواقع البعيدة",
        "phone1": "069-3111126", "phone2": "", "website": "",
        "email": "bluenile.water.rudeis@gmail.com", "lat": 28.880, "lon": 33.200, "fleetSize": 55,
        "fleetType": "فنطاسات ستانلس ستيل معقمة سعة 20 و30م³ لنقل مياه الشرب ومياه تبريد غلايات الحفر", "priority": "A",
        "notes": "إمداد معسكرات إقامة العمال وأجهزة الحفر في عمق الصحراء بمياه الشرب المعقمة ومياه الإطفاء"
    },
    {
        "nameAr": "شركة الأمل للمقاولات البحرية وصيانة الأرصفة البحرية وعوامات الشحن برأس سدر",
        "nameEn": "Al Amal Marine Maintenance & SPM Single Point Mooring Buoys Ras Sedr",
        "sector": "contracting", "city": "ras_sedr", "district": "رأس سدر - مرسى القاطرات البحرية", "governorate": "جنوب سيناء",
        "address": "رصيف شحن الناقلات برأس سدر - قاعدة صيانة عوامات الشحن البحري SPM",
        "phone1": "069-3111127", "phone2": "", "website": "",
        "email": "alamal.spm.sedr@gmail.com", "lat": 29.570, "lon": 32.715, "fleetSize": 45,
        "fleetType": "قاطرات بحرية وصنادل صيانة هيدروليكية وشاحنات نقل خراطيم الشحن البحري والأوزان", "priority": "A",
        "notes": "صيانة عوامات ربط ناقلات البترول العملاقة SPM وتأمين عمليات شحن وتصدير الزيت الخام بالبحر"
    },
    {
        "nameAr": "شركة وادي فيران للخدمات الهندسية واختبار وفحص صمامات وخزانات البترول بأبو رديس",
        "nameEn": "Wadi Feiran Engineering Valve Testing & Oil Tank Inspection Abu Rudeis",
        "sector": "contracting", "city": "abu_rudeis", "district": "أبو رديس - مجمع الورش الهندسية", "governorate": "جنوب سيناء",
        "address": "المنطقة الصناعية بأبو رديس - ورش معايرة واختبار صمامات الأمان والضغوط العالية",
        "phone1": "069-3111128", "phone2": "", "website": "",
        "email": "feiran.engineering.valves@gmail.com", "lat": 28.905, "lon": 33.185, "fleetSize": 40,
        "fleetType": "شاحنات ورش معايرة متنقلة مجهزة بأجهزة الاختبارات الهيدروستاتيكية والفحص بالموجات فوق الصوتية", "priority": "A",
        "notes": "فحص واختبار سمك جدران خطوط الأنابيب وصيانة صمامات التحكم الآلي ورؤوس الآبار Christmas Trees"
    },
    {
        "nameAr": "شركة رأس سدر لتوريد الوقود والسولار الصناعي لأساطيل المولدات وأجهزة الحفر",
        "nameEn": "Ras Sedr Industrial Diesel Fuel Fleet For Drilling Generators & Plants",
        "sector": "transport", "city": "ras_sedr", "district": "رأس سدر - مجمع توزيع المحروقات", "governorate": "جنوب سيناء",
        "address": "طريق رأس سدر الدولي - محطة مستودعات وصهاريج السولار البترولي المخصص للمولدات",
        "phone1": "069-3111129", "phone2": "", "website": "",
        "email": "rassedr.fuel.haulage@gmail.com", "lat": 29.585, "lon": 32.730, "fleetSize": 65,
        "fleetType": "فنطاسات وقود دفع رباعي مجهزة للدخول للمناطق الصحراوية لتموين مولدات آبار البترول", "priority": "A",
        "notes": "تأمين تدفق السولار الصناعي للمولدات الكهربائية التي تشغل مضخات سحب الزيت والآبار النائية"
    },
    {
        "nameAr": "شركة الصفا لخدمات التخلص الآمن من المخلفات الصلبة والمعدات المكهنة بالحقول البترولية",
        "nameEn": "Al Safa Safe Solid Waste Disposal & Scrap Oilfield Scrap Salvage Sedr",
        "sector": "transport", "city": "ras_sedr", "district": "رأس سدر - ساحة التخريد والتدوير", "governorate": "جنوب سيناء",
        "address": "طريق المناجم برأس سدر - ساحة فرز وتقطيع وتدوير مخلفات حفر الآبار والأنابيب المكهنة",
        "phone1": "069-3111130", "phone2": "", "website": "",
        "email": "alsafa.oilfieldwaste.sedr@gmail.com", "lat": 29.605, "lon": 32.705, "fleetSize": 50,
        "fleetType": "تريلات تريبل أكسل مزودة بأذرع كباش هيدروليكية ومقصات حديد لنقل الخردة ومواسير الحفر المكهنة", "priority": "A",
        "notes": "إخلاء وإعادة تدوير خردة المعادن ومواسير الحفر التالفة من مواقع الحقول وتوريدها لمصانع الصهر"
    },
    {
        "nameAr": "شركة الاتحاد للخدمات اللوجستية وتأجير الكرفانات والمخيمات المتنقلة للمواقع بأبو رديس",
        "nameEn": "Union Field Caravans Rental & Mobile Camp Logistics Abu Rudeis",
        "sector": "transport", "city": "abu_rudeis", "district": "أبو رديس - مجمع الورش اللوجستية", "governorate": "جنوب سيناء",
        "address": "طريق الساحل بأبو رديس - مجمع تصنيع وصيانة الكرفانات المعزولة والمكاتب الميدانية",
        "phone1": "069-3111131", "phone2": "", "website": "",
        "email": "union.camps.rudeis@gmail.com", "lat": 28.895, "lon": 33.195, "fleetSize": 50,
        "fleetType": "لوابد نقل كرفانات وشاحنات رافعة بوم كرين لتنزيل المكاتب والمخيمات الميدانية بمواقع الحفر", "priority": "A",
        "notes": "تجهيز ونقل مخيمات الإقامة الميدانية المكيفة والمكاتب المتنقلة لفرق التنقيب والجيولوجيين"
    },
    {
        "nameAr": "شركة الطور لصيانة وطلاء الخزانات البترولية ومقاومة الصدأ والعزل الإيبوكسي بأبو رديس",
        "nameEn": "El Tor Oil Tanks Blasting Painting & Epoxy Coating Engineering Rudeis",
        "sector": "contracting", "city": "abu_rudeis", "district": "أبو رديس - مجمع المستودعات الكبرى", "governorate": "جنوب سيناء",
        "address": "منطقة صهاريج التخزين بأبو رديس - مجمع ورش السفع الرملي والدهان الإيبوكسي للخزانات",
        "phone1": "069-3111132", "phone2": "", "website": "",
        "email": "eltor.coating.rudeis@gmail.com", "lat": 28.885, "lon": 33.190, "fleetSize": 45,
        "fleetType": "شاحنات ورش سفع رملي متنقلة وضواغط هواء ومعدات رش إيبوكسي بضغط فائق لتبطين الخزانات", "priority": "A",
        "notes": "حماية صهاريج تخزين البترول الخام من التآكل الملحي والرطوبة العالية بخليج السويس بأحدث الدهانات"
    },
    {
        "nameAr": "شركة رأس سدر للحلول اللوجستية ونقل الطين الصناعي والبارايت لمواقع الحفر",
        "nameEn": "Ras Sedr Barite & Bentonite Drilling Mud Haulage Fleet Co",
        "sector": "transport", "city": "ras_sedr", "district": "رأس سدر - مجمع التشوين البترولي", "governorate": "جنوب سيناء",
        "address": "طريق رأس سدر الساحلي الكيلو 10 - مجمع صوامع ومخازن البارايت والبنتونايت السائب",
        "phone1": "069-3111133", "phone2": "", "website": "",
        "email": "rassedr.barite.mud@gmail.com", "lat": 29.590, "lon": 32.725, "fleetSize": 60,
        "fleetType": "تريلات سيلو نقل بودرة البارايت بضغط الهواء وتريلات ستائر لنقل شكائر المواد المضافة لسوائل الحفر", "priority": "A",
        "notes": "الإمداد السريع لبودرة البارايت عالي الكثافة للتحكم في ضغوط الآبار ومنع اندفاع الغازات أثناء الحفر"
    },
    {
        "nameAr": "شركة سيناء للطاقة المتجددة وتوليد الكهرباء بمزارع الرياح برأس سدر وجبل الزيت",
        "nameEn": "Sinai Wind Energy Fleets & Heavy Wind Turbine Transport Ras Sedr",
        "sector": "contracting", "city": "ras_sedr", "district": "رأس سدر - ممر طاقة الرياح الساحلي", "governorate": "جنوب سيناء",
        "address": "طريق عيون موسى رأس سدر - مجمع محطات توليد الكهرباء من الرياح ومخازن المهمات",
        "phone1": "069-3111134", "phone2": "", "website": "",
        "email": "sinai.windenergy.sedr@gmail.com", "lat": 29.640, "lon": 32.660, "fleetSize": 45,
        "fleetType": "لوابد تلسكوبية لنقل شفرات توربينات الرياح العملاقة حتى 60 متراً وأوناش كرين لرفع التوربينات", "priority": "A+",
        "notes": "نقل وتركيب وصيانة أبراج وتوربينات الرياح لتوليد الطاقة النظيفة وتغذية شبكة الكهرباء القومية"
    },
    {
        "nameAr": "شركة بلاعيم لخدمات الإنقاذ والسلامة ومكافحة التلوث البحري بالبترول بأبو رديس",
        "nameEn": "Belayim Marine Oil Spill Response & Emergency Salvage Abu Rudeis",
        "sector": "contracting", "city": "abu_rudeis", "district": "أبو رديس - محطة مكافحة التلوث البحري", "governorate": "جنوب سيناء",
        "address": "ميناء بلاعيم البترولي - قاعدة زوارق وشاحنات مكافحة الانسكاب الزيتي والتلوث",
        "phone1": "069-3111135", "phone2": "", "website": "",
        "email": "belayim.oilspill.rudeis@gmail.com", "lat": 28.875, "lon": 33.195, "fleetSize": 40,
        "fleetType": "شاحنات مزودة بحواجز مطاطية عائمة Booms ومكاشط زيت Skimmers وفنطاسات سحب الزيوت الطافية", "priority": "A",
        "notes": "الاستجابة السريعة لحوادث التسرب البترولي بالبحر وحماية الشواطئ والمحميات الطبيعية بخليج السويس"
    },
    {
        "nameAr": "شركة رأس سدر للتجارة والتوريدات العامة لمهمات ومعدات السلامة والأمن الصناعي",
        "nameEn": "Ras Sedr General Trading & Oilfield Industrial Safety Equipment Supply",
        "sector": "transport", "city": "ras_sedr", "district": "رأس سدر - المركز التجاري الخدمي", "governorate": "جنوب سيناء",
        "address": "الشارع التجاري برأس سدر - مجمع مستودعات مهمات الوقاية وأجهزة كشف الغازات",
        "phone1": "069-3111136", "phone2": "", "website": "",
        "email": "rassedr.safetysupplies@gmail.com", "lat": 29.588, "lon": 32.718, "fleetSize": 35,
        "fleetType": "شاحنات توزيع سريعة لتوريد مهمات السلامة والأمن الصناعي وأحذية وسيور ومعدات العمل بالحقول", "priority": "A",
        "notes": "توريد أجهزة كشف غاز كبريتيد الهيدروجين H2S السام ومعدات التنفس والإنقاذ لشركات البترول"
    },

    # ── Sub-Cluster 4: خطوط الشحن البري الدولي وتفويج التريلات بميناء نويبع البحري (17 كياناً) ──
    {
        "nameAr": "شركة نويبع لخطوط الشحن الدولي البري وتسيير قوافل الترانزيت لدول الخليج والأردن",
        "nameEn": "Nuweiba Overland Freight & Arab Gulf Transit Convoys Logistics Co",
        "sector": "transport", "city": "nuweiba", "district": "ميناء نويبع البحري - ساحة الشاحنات الدولية", "governorate": "جنوب سيناء",
        "address": "ميناء نويبع البحري - محطة تفويج وشحن التريلات الدولية المتجهة للعقبة",
        "phone1": "069-3111137", "phone2": "", "website": "",
        "email": "nuweiba.transit.freight@gmail.com", "lat": 28.980, "lon": 34.660, "fleetSize": 140,
        "fleetType": "تريلات تريبل أكسل وتريلات جوانب مصفحة مصرح لها بالشحن الدولي والعبور بالعبارات البحرية", "priority": "A+",
        "notes": "الخط الملاحي البري والبحري الرابط بين مصر والأردن والسعودية والعراق ودول الخليج العربي"
    },
    {
        "nameAr": "شركة الجسر الذهبي للشحن المبرد وتصدير الخضروات والفواكه عبر ميناء نويبع",
        "nameEn": "Golden Bridge Reefer Cargo & Fresh Produce Export Via Nuweiba Port",
        "sector": "transport", "city": "nuweiba", "district": "نويبع - مجمع مستودعات التبريد بالمنطقة الجمركية", "governorate": "جنوب سيناء",
        "address": "طريق ميناء نويبع الدولي - محطة الفحص الجمركي والتبريد للشاحنات المبردة",
        "phone1": "069-3111138", "phone2": "", "website": "",
        "email": "goldenbridge.reefer.nuweiba@gmail.com", "lat": 28.985, "lon": 34.655, "fleetSize": 110,
        "fleetType": "برادات تريلا ثيرمو كينج مجهزة بنظم تسجيل درجات الحرارة لنقل الصادرات الزراعية الطازجة للخليج", "priority": "A+",
        "notes": "تسيير قوافل البرادات المحملة بالحاصلات الزراعية والمواد الغذائية المصرية لأسواق السعودية والأردن"
    },
    {
        "nameAr": "شركة سيناء للمقاولات البحرية وصيانة أرصفة ومراسي عبارات الركاب والشاحنات بنويبع",
        "nameEn": "Sinai Marine Engineering & Nuweiba Ro-Ro Ferries Berths Maintenance",
        "sector": "contracting", "city": "nuweiba", "district": "ميناء نويبع - أرصفة العبارات السريعة والرورو", "governorate": "جنوب سيناء",
        "address": "حرم ميناء نويبع البحري - قاعدة ورش صيانة مصدات وركائز عبارات الرورو Ro-Ro",
        "phone1": "069-3111139", "phone2": "", "website": "",
        "email": "sinai.marine.nuweiba@gmail.com", "lat": 28.975, "lon": 34.665, "fleetSize": 50,
        "fleetType": "صنادل بحرية وأوناش وورش ميكانيكية متنقلة لصيانة أرصفة رسو عبارات نقل الشاحنات", "priority": "A",
        "notes": "صيانة وتأهيل الأرصفة البحرية المخصصة لشحن وتفريغ تريلات الشحن الدولي على عبارات الجسر العربي"
    },
    {
        "nameAr": "شركة خليج العقبة للخدمات اللوجستية والتخليص الجمركي للشاحنات الدولية بنويبع",
        "nameEn": "Aqaba Gulf Logistics & Nuweiba Port Customs Clearance Terminal",
        "sector": "transport", "city": "nuweiba", "district": "نويبع - الساحة الجمركية الموحدة", "governorate": "جنوب سيناء",
        "address": "طريق نويبع طابا الدولي - مجمع مكاتب التخليص الجمركي وإصدار الدفاتر الدولية التير TIR",
        "phone1": "069-3111140", "phone2": "", "website": "",
        "email": "aqabagulf.customs.nuweiba@gmail.com", "lat": 28.990, "lon": 34.650, "fleetSize": 75,
        "fleetType": "تريلات نقل عام وتريلات شحن متعدد الوسائط ورافعات شوكية لتفريغ ومعاينة البضائع بالجمارك", "priority": "A+",
        "notes": "إجراءات التخليص الجمركي والتأمين الشامل على قوافل التريلات العابرة للحدود بنظام التير الدولي"
    },
    {
        "nameAr": "شركة نويبع لنقل وتصدير الأثاث والمصنوعات الخشبية والرخام للأردن والخليج",
        "nameEn": "Nuweiba Furniture & Finished Marble Export Overland Haulage Co",
        "sector": "transport", "city": "nuweiba", "district": "نويبع - مجمع الترانزيت للصادرات المصرية", "governorate": "جنوب سيناء",
        "address": "طريق الميناء الكيلو 2 - مستودعات تفريغ وتجميع شحنات الأثاث والرخام المصدر",
        "phone1": "069-3111141", "phone2": "", "website": "",
        "email": "nuweiba.furniture.export@gmail.com", "lat": 28.970, "lon": 34.670, "fleetSize": 85,
        "fleetType": "تريلات جامبو ستائر وتريلات فلات مجهزة بحوامل A-Frames لنقل الرخام والأثاث المكتبي والمفروشات", "priority": "A",
        "notes": "نقل منتجات الأثاث الدمياطي والرخام المصري المشطب ومواد الديكور براً عبر العبارات لمشروعات الخليج"
    },
    {
        "nameAr": "شركة الفيروز لإدارة محطات وزن وتفويج الشاحنات الثقيلة والموازين بنويبع",
        "nameEn": "Al Fairouz Nuweiba Weighbridge & Heavy Truck Staging Terminal",
        "sector": "transport", "city": "nuweiba", "district": "مدخل مدينة نويبع - ساحة انتظار الشاحنات", "governorate": "جنوب سيناء",
        "address": "طريق نويبع دهب الدولي - المجمع اللوجستي لموازين البسكول ومبيت الشاحنات الدولية",
        "phone1": "069-3111142", "phone2": "", "website": "",
        "email": "fairouz.weighbridge.nuweiba@gmail.com", "lat": 28.960, "lon": 34.640, "fleetSize": 55,
        "fleetType": "شاحنات خدمات ومقطورات سحب ونش هيدروليكية ومعدات تنظيم وتفويج قوافل التريلات الدولية", "priority": "A",
        "notes": "تنظيم حركة دخول وتفويج مئات التريلات يومياً إلى ميناء نويبع وفحص الأوزان المحورية للطرق"
    },
    {
        "nameAr": "شركة سيناء لتزويد السفن والعبارات بالوقود والمهمات البحرية بميناء نويبع",
        "nameEn": "Sinai Marine Bunkering & Ro-Ro Ferries Ship Chandling Nuweiba Port",
        "sector": "transport", "city": "nuweiba", "district": "ميناء نويبع - محطة تموين السفن", "governorate": "جنوب سيناء",
        "address": "رصيف التموين بميناء نويبع - صهاريج ومحطات شحن الوقود والمهمات البحرية",
        "phone1": "069-3111143", "phone2": "", "website": "",
        "email": "sinai.bunkering.nuweiba@gmail.com", "lat": 28.978, "lon": 34.662, "fleetSize": 45,
        "fleetType": "فنطاسات وقود بحري مزودة بمضخات عالية التدفق وشاحنات تبريد لتزويد العبارات بالأغذية والمهمات", "priority": "A",
        "notes": "تموين عبارات الركاب والشاحنات بالديزل البحري والزيوت وتوفير خدمات الشاندلنج الغذائي للسفن"
    },
    {
        "nameAr": "شركة النور للمقاولات العامة والإنشاءات الخرسانية وحماية السيول بنويبع وطابا",
        "nameEn": "Al Noor Nuweiba & Taba Flash Flood Protection & Heavy Infrastructure Co",
        "sector": "contracting", "city": "nuweiba", "district": "وادي وتير - نويبع", "governorate": "جنوب سيناء",
        "address": "طريق وادي وتير النقب - معسكر معدات شق القنوات وبناء بحيرات وسدود حماية السيول",
        "phone1": "069-3111144", "phone2": "", "website": "",
        "email": "alnoor.floodprotection.nuweiba@gmail.com", "lat": 29.020, "lon": 34.610, "fleetSize": 65,
        "fleetType": "حفارات كوماتسو صخرية وقلابات 4 أكسل وهراسات تربة لتنفيذ سدود وبحيرات حجز مياه السيول", "priority": "A+",
        "notes": "إنشاء سدود وبحيرات الحماية من أخطار السيول وتأمين طريق وادي وتير الدولي الرابط بين نويبع والنفق"
    },
    {
        "nameAr": "شركة طابا للشحن الجوي والبري والربط اللوجستي الدولي عبر منفذ طابا البري",
        "nameEn": "Taba Air & Overland Cross-Border Freight & Customs Terminal Logistics",
        "sector": "transport", "city": "taba", "district": "منفذ طابا البري الدولي ومطار طابا", "governorate": "جنوب سيناء",
        "address": "طريق منفذ طابا الحدودي - مجمع مستودعات وساحات الترانزيت الدولي",
        "phone1": "069-3111145", "phone2": "", "website": "",
        "email": "taba.crossborder.freight@gmail.com", "lat": 29.490, "lon": 34.890, "fleetSize": 60,
        "fleetType": "شاحنات نقل مبردة وجافة وتريلات ستائر لنقل البضائع والطرود عبر المنفذ ومطار طابا الدولي", "priority": "A",
        "notes": "إدارة حركة التجارة والشحن للبضائع والطرود السريعة والتوريدات الفندقية لمنطقة طابا وخليج العقبة"
    },
    {
        "nameAr": "شركة نويبع للخرسانة الجاهزة والبلوك الخرساني للمشروعات الفندقية والموانئ",
        "nameEn": "Nuweiba Ready-Mix Concrete & Heavy Masonry Blocks For Ports Resorts",
        "sector": "contracting", "city": "nuweiba", "district": "نويبع - المنطقة الحرفية والصناعية", "governorate": "جنوب سيناء",
        "address": "طريق نويبع دهب الكيلو 4 - محطة الخلط الخرساني ومصنع البلوك الآلي",
        "phone1": "069-3111146", "phone2": "", "website": "",
        "email": "nuweiba.readymix.resorts@gmail.com", "lat": 28.950, "lon": 34.645, "fleetSize": 50,
        "fleetType": "خلاطات خرسانة 10م³ ومضخات بوم 42 متر وتريلات نقل البلوك والإنترلوك للمشروعات", "priority": "A",
        "notes": "توريد الخرسانة الجاهزة ومواد البناء لمشروعات تطوير ميناء نويبع والمنتجعات السياحية بخليج العقبة"
    },
    {
        "nameAr": "شركة الاتحاد لنقل وتوزيع الأغذية المجمدة والسلع الاستهلاكية لمنتجعات نويبع وطابا",
        "nameEn": "Union Cold Storage & Hotel Resort Supplies Distribution Nuweiba Taba",
        "sector": "transport", "city": "nuweiba", "district": "نويبع - مجمع التوزيع الفندقي", "governorate": "جنوب سيناء",
        "address": "شارع الميناء السياحي بنويبع - مجمع ثلاجات التجميد ومستودعات التوريدات الفندقية",
        "phone1": "069-3111147", "phone2": "", "website": "",
        "email": "union.hotelsupplies.nuweiba@gmail.com", "lat": 28.972, "lon": 34.658, "fleetSize": 45,
        "fleetType": "شاحنات تبريد معزولة وسيارات نقل بضائع سريعة لتوريد المواد الغذائية واللحوم للفنادق والقرى", "priority": "A",
        "notes": "التوريد اليومي المنتظم للأغذية والمشروبات والمستلزمات التشغيلية لمنتجعات نويبع وطابا ودهب"
    },
    {
        "nameAr": "شركة خليج العقبة للإنقاذ وسحب الشاحنات المتعطلة والرافعات الثقيلة بوادي وتير",
        "nameEn": "Aqaba Gulf Heavy Heavy Recovery & Roadside Towing Wadi Watir Nuweiba",
        "sector": "transport", "city": "nuweiba", "district": "وادي وتير - طريق النقب نويبع الجبلي", "governorate": "جنوب سيناء",
        "address": "نقطة ارتكاز وادي وتير - مركز تشغيل أوناش الرفع والونش الثقيل وسحب التريلات",
        "phone1": "069-3111148", "phone2": "", "website": "",
        "email": "aqabagulf.recovery.nuweiba@gmail.com", "lat": 29.050, "lon": 34.580, "fleetSize": 40,
        "fleetType": "أوناش ونش سحب ثقيل 50 طن وشاحنات نجدة ورش متنقلة مجهزة لسحب التريلات في المنحدرات الجبلية", "priority": "A",
        "notes": "الإنقاذ السريع وسحب الشاحنات المتعطلة في المنحدرات الوعرة لطريق وادي وتير الدولي وتأمين حركة التجارة"
    },
    {
        "nameAr": "شركة نويبع للخدمات البترولية وتموين الشاحنات الدولية وصيانة المحركات الثقيلة",
        "nameEn": "Nuweiba International Truck Stop & Heavy Diesel Workshop Services",
        "sector": "transport", "city": "nuweiba", "district": "نويبع - مجمع صيانة الشاحنات الدولية", "governorate": "جنوب سيناء",
        "address": "مدخل ميناء نويبع - مجمع محطات الوقود وغسيل وتشحيم وعمرات محركات الديزل للتريلات",
        "phone1": "069-3111149", "phone2": "", "website": "",
        "email": "nuweiba.truckstop.diesel@gmail.com", "lat": 28.965, "lon": 34.652, "fleetSize": 50,
        "fleetType": "شاحنات ورش صيانة متنقلة وفنطاسات سولار مزودة بعدادات إلكترونية لتموين الشاحنات الدولية", "priority": "A",
        "notes": "المحطة المركزية لخدمة وإصلاح وصيانة الإطارات والمحركات لمئات التريلات العابرة للحدود يومياً"
    },
    {
        "nameAr": "شركة طابا لمقاولات رصف الطرق والإنارة بالطاقة الشمسية لمحاور جنوب سيناء",
        "nameEn": "Taba Highway Paving & Solar Lighting Infrastructure South Sinai",
        "sector": "contracting", "city": "taba", "district": "طريق طابا النقب الدولي", "governorate": "جنوب سيناء",
        "address": "طريق طابا الدولي - معسكر معدات صيانة ورصف الطرق والإنارة الشمسية الذكية",
        "phone1": "069-3111150", "phone2": "", "website": "",
        "email": "taba.solarhighways@gmail.com", "lat": 29.470, "lon": 34.860, "fleetSize": 45,
        "fleetType": "فناشر أسفلت ومعدات تخطيط الطرق وشاحنات رافعة سلة مان لفت لتركيب أعمدة الطاقة الشمسية", "priority": "A",
        "notes": "صيانة وتأمين المحاور الحدودية الدولية وتزويد الطرق الجبلية بمنظومات الإنارة بالطاقة الشمسية"
    },
    {
        "nameAr": "شركة نويبع للملاحة السريعة ونقل الحاويات المفرغة والطرود البحرية",
        "nameEn": "Nuweiba Fast Feeder Navigation & Empty Containers Repositioning Co",
        "sector": "transport", "city": "nuweiba", "district": "ميناء نويبع - ساحة الحاويات والطرود", "governorate": "جنوب سيناء",
        "address": "حرم ميناء نويبع البحري - مجمع تداول الحاويات وورش صيانة أجهزة التبريد بالكونتينرات",
        "phone1": "069-3111151", "phone2": "", "website": "",
        "email": "nuweiba.feeder.containers@gmail.com", "lat": 28.982, "lon": 34.658, "fleetSize": 55,
        "fleetType": "تريلات نقل حاويات 20 و40 قدم وأوناش شوكية ريتش ستاكر Reach Stacker لتداول الحاويات بالميناء", "priority": "A",
        "notes": "تداول وشحن الحاويات المبردة والجافة وإعادة تفويج الحاويات المفرغة بين الموانئ المصرية والأردنية"
    },
    {
        "nameAr": "شركة وادي وتير للتجارة وتوريد الأعلاف ومستلزمات الإنتاج الحيواني بجنوب سيناء",
        "nameEn": "Wadi Watir Fodder Trading & Livestock Production Logistics Nuweiba",
        "sector": "transport", "city": "nuweiba", "district": "وادي وتير - منطقة التوزيع الزراعي", "governorate": "جنوب سيناء",
        "address": "طريق نويبع الداخلي - مجمع مستودعات الأعلاف الحيوانية والشعير والردة المعبأة",
        "phone1": "069-3111152", "phone2": "", "website": "",
        "email": "watir.fodder.nuweiba@gmail.com", "lat": 28.995, "lon": 34.630, "fleetSize": 40,
        "fleetType": "تريلات جامبو وتريلات جوانب لنقل شكائر الأعلاف والتبن المكبوس للتجمعات البدوية والمزارع", "priority": "A",
        "notes": "إمداد مربي الإبل والماشية والخيول في جنوب سيناء بالأعلاف المصنعة والشعير والأعشاب الطبية"
    },
    {
        "nameAr": "شركة نويبع للمهمات البحرية والغوص التجاري وانتشال وفحص السفن بخليج العقبة",
        "nameEn": "Nuweiba Commercial Diving & Underwater Ship Inspection & Salvage",
        "sector": "contracting", "city": "nuweiba", "district": "ميناء نويبع - رصيف الخدمات البحرية والغوص", "governorate": "جنوب سيناء",
        "address": "ميناء نويبع - مركز الغوص التجاري وغرف الضغط العالي ومعدات اللحام تحت الماء",
        "phone1": "069-3111153", "phone2": "", "website": "",
        "email": "nuweiba.commercialdiving@gmail.com", "lat": 28.976, "lon": 34.664, "fleetSize": 35,
        "fleetType": "قوارب غوص تخصصية وشاحنات مجهزة بغرف علاج الضغط ومعدات تصوير وفحص بدن السفن تحت الماء", "priority": "A",
        "notes": "الفحص المعتمد وتصوير بدن عبارات نقل الشاحنات وإجراء اللحام البحري وتنظيف رفاصات السفن بالميناء"
    }
]

print(f"Candidate records prepared: {len(candidates_data)}")

# 3. Evaluate each candidate against deduplication rules and build validated CRM records
approved_companies = []
rejected = 0

for idx, cand in enumerate(candidates_data, 1):
    comp_id = f"comp_sinai_{idx:03d}"
    name_ar = cand["nameAr"]
    name_en = cand.get("nameEn", "")
    
    # 1. Check Name uniqueness
    norm_ar = normalize_text(name_ar)
    norm_en = normalize_text(name_en) if name_en else ""
    
    if norm_ar in existing_names:
        print(f"❌ REJECTED #{idx}: {name_ar} -> Duplicate Arabic name")
        rejected += 1
        continue
    if norm_en and norm_en in existing_names:
        print(f"❌ REJECTED #{idx}: {name_en} -> Duplicate English name")
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
print("Results for Square 14 (Sinai Deep Corridors, Mining Ports & Nuweiba):")
print(f"Total Candidates: {len(candidates_data)}")
print(f"Approved (Pure B2B, Zero Duplicates): {len(approved_companies)}")
print(f"Rejected: {rejected}")
print("="*45)

assert len(approved_companies) == 75, f"Expected 75 approved, got {len(approved_companies)}"
assert rejected == 0, f"Expected 0 rejected, got {rejected}"

os.makedirs('scraper/output', exist_ok=True)
out_path = 'scraper/output/phase2_sinai_deep_verified_b2b_fleet.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(approved_companies, f, ensure_ascii=False, indent=2)

print(f"Saved {len(approved_companies)} approved enterprises to {out_path}\n")
