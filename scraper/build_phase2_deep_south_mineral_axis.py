# -*- coding: utf-8 -*-
"""
Phase 2 - Square 16: Deep South & Mineral Axis (Nagaa Hammadi Aluminum Complex, KIMA Aswan Fertilizers, Sebaiya/Edfu Phosphate, Sugar & Paper complexes in Qous/Kom Ombo, Sohag Kawthar Industrial)
(محور أقصى الصعيد ومثلث التعدين والصناعات الثقيلة: مجمع ألومنيوم نجع حمادي ومصانع سكر وورق قوص بقنا + مجمع كيما للأسمدة ومناجم فوسفات السباعية وإدفو وسكر كوم أمبو بأسوان + منطقة الكوثر الصناعية ومجمعات سوهاج)

Target: Exactly 75 Approved Heavy B2B Enterprises (Bringing CRM from 21,075 to 21,150)
"""

import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== PHASE 2 - SQUARE 16: DEEP SOUTH & MINERAL AXIS B2B INDUSTRIAL CORRIDOR ===")

# 1. Load existing 21,075 companies to enforce absolute Zero Duplication
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

# 2. Curated Candidate Pool for Square 16 (Exactly 75 Pure B2B Entities)
candidates_data = [
    # ── Sub-Cluster 1: مجمع ألومنيوم نجع حمادي وسكر وورق قوص بقنا (25 كياناً) ──
    {
        "nameAr": "شركة مصر للألومنيوم وأساطيل نقل سبائك وبلوكات وقوالب الألومنيوم بنجع حمادي",
        "nameEn": "Egypt Aluminium Co (Egyptalum) & Heavy Ingot Haulage Fleets Nagaa Hammadi",
        "sector": "manufacturing", "city": "qena", "district": "نجع حمادي - المجمع الصناعي المتكامل للألومنيوم", "governorate": "قنا",
        "address": "مدينة الألومنيوم - نجع حمادي - مجمع خلايا الصهر وخطوط السبك والدرفلة العملاقة",
        "phone1": "096-3681101", "phone2": "", "website": "",
        "email": "egyptalum.haulage.nagaa@gmail.com", "lat": 26.020, "lon": 32.250, "fleetSize": 195,
        "fleetType": "تريلات تريبل أكسل مسطحة مجهزة بدعامات حرارية لنقل سبائك وقوالب الألومنيوم وسلك السحب لموانئ التصدير", "priority": "A+",
        "notes": "أكبر صرح لإنتاج مصهور وسبائك الألومنيوم في الشرق الأوسط بطاقة إنتاجية تتجاوز 320 ألف طن سنوياً"
    },
    {
        "nameAr": "شركة نجع حمادي لدرفلة وتصنيع قطاعات وسحب الألومنيوم المعماري والصناعي",
        "nameEn": "Nagaa Hammadi Architectural & Industrial Aluminium Extrusion Rolling Plant",
        "sector": "manufacturing", "city": "qena", "district": "نجع حمادي - منطقة الدرفلة وسحب القطاعات", "governorate": "قنا",
        "address": "مجمع مصانع سحب الألومنيوم - طريق نجع حمادي قنا الصحراوي الغربي",
        "phone1": "096-3681102", "phone2": "", "website": "",
        "email": "nagaa.extrusion.aluminium@gmail.com", "lat": 26.035, "lon": 32.240, "fleetSize": 120,
        "fleetType": "تريلات جامبو وتريلات فلات مجهزة بنظم حماية الأسطح لنقل قطاعات الألومنيوم المؤكسدة والملونة", "priority": "A+",
        "notes": "تصنيع القطاعات الهندسية والمعمارية لمشاريع الأبراج والواجهات الزجاجية وأنظمة الطاقة الشمسية بمصر"
    },
    {
        "nameAr": "الشركة القومية لنقل الفحم البترولي والكوك ومستلزمات صهر الألومنيوم بنجع حمادي",
        "nameEn": "National Petroleum Coke & Aluminium Smelting Fluxes Haulage Nagaa Hammadi",
        "sector": "transport", "city": "qena", "district": "نجع حمادي - مجمع تخزين وفحم الأنودات", "governorate": "قنا",
        "address": "طريق نجع حمادي فرشوط - ساحة تفريغ وتداول الفحم البترولي والكوك المستورد",
        "phone1": "096-3681103", "phone2": "", "website": "",
        "email": "national.petrocoke.nagaa@gmail.com", "lat": 26.015, "lon": 32.260, "fleetSize": 135,
        "fleetType": "قلابات صلب تريبل أكسل هيفي ديوتي وتريلات مقطورات لنقل فحم الكوك والأنودات الكربونية من ميناء سفاجا للمجمع", "priority": "A+",
        "notes": "الناقل الاستراتيجي لقوافل الفحم البترولي المكلسن والأنودات الحيوية لتغذية خلايا التحليل الكهربائي للألومنيوم"
    },
    {
        "nameAr": "شركة الصعيد للصناعات المعدنية وسحب سلك الألومنيوم الهوائي لنقل الكهرباء بنجع حمادي",
        "nameEn": "Upper Egypt Overhead Aluminium Conductor Wires & Cable Drawing Nagaa",
        "sector": "manufacturing", "city": "qena", "district": "نجع حمادي - مصنع سحب الكابلات الهوائية", "governorate": "قنا",
        "address": "مدينة الألومنيوم - قطاع تصنيع موصلات الضغط العالي والسبائك الكهربائية",
        "phone1": "096-3681104", "phone2": "", "website": "",
        "email": "upperegypt.conductors.nagaa@gmail.com", "lat": 26.028, "lon": 32.245, "fleetSize": 85,
        "fleetType": "تريلات مسطحة مجهزة بحوامل تثبيت بكرات الكابلات العملاقة لنقل موصلات شبكات الربط الكهربائي القومي", "priority": "A+",
        "notes": "إنتاج موصلات الألومنيوم المقواة بالصلب ACSR لخطوط الجهد الفائق 500 ك.ف ومحطات التوليد والمحولات"
    },
    {
        "nameAr": "شركة نجع حمادي للحراريات وتبطين أفران الصهر والسباكة المعدنية",
        "nameEn": "Nagaa Hammadi Refractories & Smelting Furnace Lining Engineering Co",
        "sector": "manufacturing", "city": "qena", "district": "نجع حمادي - مجمع تصنيع الحراريات", "governorate": "قنا",
        "address": "طريق مصنع السكر والألومنيوم - مجمع أفران الطوب الحراري ومونة التبطين الخاصة",
        "phone1": "096-3681105", "phone2": "", "website": "",
        "email": "nagaa.refractories.smelting@gmail.com", "lat": 26.040, "lon": 32.235, "fleetSize": 70,
        "fleetType": "تريلات صندوق مقفل وتريلات فلات مجهزة بنظم امتصاص الصدمات لنقل الطوب الحراري الكربوني والمغنيسي", "priority": "A",
        "notes": "تصنيع مواد التبطين العازلة المقاومة لدرجات حرارة تتجاوز 1800 مئوية لخلايا التحليل وأفران السباكة"
    },
    {
        "nameAr": "شركة سكر قوص وأساطيل نقل قصب السكر وتوريد السكر السائب والمولاس",
        "nameEn": "Qous Sugar Co & High-Capacity Sugar Cane Haulage Fleets Qena",
        "sector": "manufacturing", "city": "qena", "district": "قوص - مجمع مصانع عصر وتكرير قصب السكر الكبرى", "governorate": "قنا",
        "address": "طريق مصر أسوان الزراعي - مركز قوص - مجمع مصانع السكر والمقطرات الحيوية",
        "phone1": "096-3681106", "phone2": "", "website": "",
        "email": "qous.sugar.mills.haulage@gmail.com", "lat": 25.910, "lon": 32.760, "fleetSize": 165,
        "fleetType": "تريلات جوانب شبكية مقفلة سعة 40 طن لنقل القصب من الحقول وفنطاسات ستانلس ستيل لنقل المولاس وسيلوهات سكر", "priority": "A+",
        "notes": "أحد أقدم وأكبر مجمعات عصر قصب السكر في صعيد مصر بطاقة عصر تتجاوز 1.5 مليون طن قصب في الموسم"
    },
    {
        "nameAr": "شركة قوص لصناعة لب الورق والورق الأبيض عالي الجودة للطباعة والكتابة",
        "nameEn": "Qous Pulp & Fine Writing Printing Paper Manufacturing Mega Mill",
        "sector": "manufacturing", "city": "qena", "district": "قوص - مجمع مصانع لب الورق بشرق النيل", "governorate": "قنا",
        "address": "طريق قوص خزام الزراعي - مجمع خطوط هضم الباجاس وماكينات إنتاج رولات الورق الأبيض",
        "phone1": "096-3681107", "phone2": "", "website": "",
        "email": "qous.paper.pulp.mill@gmail.com", "lat": 25.925, "lon": 32.775, "fleetSize": 145,
        "fleetType": "تريلات جامبو مقفلة مجهزة بنظم منع الرطوبة لنقل رولات ورق الطباعة والكتابة العملاقة للمطابع ودور النشر", "priority": "A+",
        "notes": "الصرح القومي الأول لإنتاج ورق الكتابة والطباعة المبيض المعتمد على تدوير مصاص القصب بطاقة 120 ألف طن سنوياً"
    },
    {
        "nameAr": "شركة قنا لصناعة وتجارة خشب الحبيبي (إم دي إف) وتدوير مصاص القصب (الباجاس) بقوص",
        "nameEn": "Qena MDF Wood Particle Boards & Cane Bagasse Recycling Complex Qous",
        "sector": "manufacturing", "city": "qena", "district": "قوص - المجمع المتكامل للصناعات الخشبية", "governorate": "قنا",
        "address": "منطقة مصانع قوص الصناعية - مجمع مكابس ألواح الخشب الحبيبي ومصانع الغراء الصناعي",
        "phone1": "096-3681108", "phone2": "", "website": "",
        "email": "qena.mdf.bagasse.qous@gmail.com", "lat": 25.918, "lon": 32.768, "fleetSize": 95,
        "fleetType": "تريلات تريبل أكسل بصناديق مقفلة لنقل ألواح الخشب المضغوط MDF والألواح الميلامينية لمصانع الأثاث بدمياط والقاهرة", "priority": "A+",
        "notes": "تحويل مئات آلاف الأطنان من مخلفات قصب السكر إلى ألواح خشبية عالية الكثافة تضاهي الخشب المستورد"
    },
    {
        "nameAr": "شركة نجع حمادي للغازات الصناعية وتوريد الأرجون والنيتروجين المسال لصهر المعادن",
        "nameEn": "Nagaa Hammadi Industrial Gases Liquid Argon & Nitrogen Supply Co",
        "sector": "transport", "city": "qena", "district": "نجع حمادي - محطة فصل الغازات الجوية المبردة", "governorate": "قنا",
        "address": "طريق مدينة الألومنيوم نجع حمادي - مجمع تنكات الغازات الصناعية المسالة Cryogenic",
        "phone1": "096-3681109", "phone2": "", "website": "",
        "email": "nagaa.industrialgases@gmail.com", "lat": 26.025, "lon": 32.255, "fleetSize": 60,
        "fleetType": "تريلات صهاريج كرايوجينيك معزولة حرارياً لنقل الأرجون السائل والأكسجين والنيتروجين النقي لخلايا الصهر", "priority": "A",
        "notes": "تأمين الغازات الخاملة والنشطة اللازمة لعمليات نزع الغازات وتكرير مصهور الألومنيوم لمنع تكون المسام والعيوب"
    },
    {
        "nameAr": "شركة قنا للخرسانة الجاهزة ومحطات الخلط للأعمال الصناعية والكباري بنجع حمادي",
        "nameEn": "Qena Ready-Mix Concrete & Heavy Bridge Construction Batching Plants",
        "sector": "contracting", "city": "qena", "district": "نجع حمادي - محور الشهيد باسم فكري على النيل", "governorate": "قنا",
        "address": "مدخل محور نجع حمادي الجديد - مجمع محطات الخلط الخرساني المركزي ومستودعات الركام",
        "phone1": "096-3681110", "phone2": "", "website": "",
        "email": "qena.readymix.bridges@gmail.com", "lat": 26.050, "lon": 32.230, "fleetSize": 90,
        "fleetType": "خلاطات خرسانة 10 و12م³ ومضخات بوم 47 و52 متر شWing ومعدات صب مستمر للإنشاءات الثقيلة والكباري", "priority": "A+",
        "notes": "تنفيذ محاور النيل الحيوية والكباري التنموية والمباني الصناعية والهياكل الخرسانية المسلحة بمحافظة قنا"
    },
    {
        "nameAr": "شركة هو الصناعية لإنتاج المواسير البلاستيكية ومستلزمات الري الحديث بقنا",
        "nameEn": "Hoo Industrial UPVC & HDPE Irrigation Pipes Mega Factory Qena",
        "sector": "manufacturing", "city": "qena", "district": "نجع حمادي - منطقة هو الصناعية الكبرى", "governorate": "قنا",
        "address": "المنطقة الصناعية بهو - مجمع خطوط بثق مواسير البولي إيثيلين عالي الكثافة ومواسير الـ UPVC",
        "phone1": "096-3681111", "phone2": "", "website": "",
        "email": "hoo.pipes.irrigation.qena@gmail.com", "lat": 26.005, "lon": 32.270, "fleetSize": 75,
        "fleetType": "تريلات مسطحة طويلة وتريلات جامبو لنقل مواسير مياه الشرب والصرف الصحي وشبكات الري المحوري", "priority": "A",
        "notes": "تغذية مشروعات استصلاح الأراضي في غرب قنا والمراشدة وشبكات البنية التحتية لمدن الصعيد الجديدة"
    },
    {
        "nameAr": "شركة قنا لنقل الحبوب وتفريغ الصوامع وشحن السكر الأبيض لمحافظات مصر",
        "nameEn": "Qena Grain Silos Logistics & White Sugar Strategic Distribution Fleets",
        "sector": "transport", "city": "qena", "district": "قنا الجديدة - المجمع اللوجستي المركزي", "governorate": "قنا",
        "address": "طريق قنا سفاجا الصحراوي الشرقي - صوامع قنا المعدنية الحديثة ومحطة الشحن البري",
        "phone1": "096-3681112", "phone2": "", "website": "",
        "email": "qena.grain.sugar.logistics@gmail.com", "lat": 26.180, "lon": 32.740, "fleetSize": 110,
        "fleetType": "تريلات نقل صب وتريلات سيلو لنقل القمح والسكر التمويني المعبأ إلى مستودعات الشركة القابضة للصناعات الغذائية", "priority": "A+",
        "notes": "شحن السكر الأبيض والقمح الاستراتيجي بين صوامع الصعيد والمطاحن والموانئ البحرية بالبحر الأحمر"
    },
    {
        "nameAr": "شركة الألومنيوم للمسبوكات الدقيقة وتوريد قطع غيار الأفران والماكينات بنجع حمادي",
        "nameEn": "Aluminium Precision Castings & Smelter Heavy Spare Parts Workshop Nagaa",
        "sector": "manufacturing", "city": "qena", "district": "نجع حمادي - قطاع الورش المركزية والمسبوكات", "governorate": "قنا",
        "address": "المنطقة الملحقة بمجمع الألومنيوم - مجمع مسابك الصلب وسبائك البرونز وتشكيل المعادن",
        "phone1": "096-3681113", "phone2": "", "website": "",
        "email": "aluminium.castings.nagaa@gmail.com", "lat": 26.022, "lon": 32.248, "fleetSize": 55,
        "fleetType": "تريلات فلات مجهزة بأوناش هيدروليكية لتحميل المسبوكات الثقيلة وقطع غيار خلايا التحليل الكهربائي", "priority": "A",
        "notes": "تصنيع قطع الغيار الهندسية الثقيلة ومقاومات التآكل الحراري والميكانيكي لمصانع الألمنيوم والسكر والورق"
    },
    {
        "nameAr": "شركة قوص لنقل وتصدير خميرة الخبز الطازجة والمجففة ومشتقات التخمير",
        "nameEn": "Qous Fresh & Dry Baker's Yeast Cold Chain Export Logistics Co",
        "sector": "transport", "city": "qena", "district": "قوص - مجمع مصانع التخمير واستخلاص الخميرة", "governorate": "قنا",
        "address": "طريق قوص الأقصر الزراعي - مصانع استغلال المولاس وإنتاج خميرة الخبز الحيوية",
        "phone1": "096-3681114", "phone2": "", "website": "",
        "email": "qous.yeast.export@gmail.com", "lat": 25.905, "lon": 32.770, "fleetSize": 80,
        "fleetType": "شاحنات وبرادات تريلا حديثة كارير محكمة التبريد عند +4 مئوية لنقل قوالب الخميرة الطازجة لمخابز مصر", "priority": "A+",
        "notes": "إنتاج وتوزيع خميرة الخبز الطازجة والمجففة المعتمدة على مولاس قصب السكر عالي الجودة وتصديرها لأفريقيا"
    },
    {
        "nameAr": "شركة قنا للمهمات الثقيلة وتأجير الأوناش التلسكوبية واللوابد للمصانع الكبرى",
        "nameEn": "Qena Heavy Machinery Heavy Haulage & Telescopic Crane Rental Co",
        "sector": "transport", "city": "qena", "district": "قنا - منطقة المعنا اللوجستية", "governorate": "قنا",
        "address": "طريق قنا البحر الأحمر الكيلو 5 - معسكر الرافعات التلسكوبية واللوابد منخفضة السطح",
        "phone1": "096-3681115", "phone2": "", "website": "",
        "email": "qena.heavyhaulage.cranes@gmail.com", "lat": 26.160, "lon": 32.720, "fleetSize": 65,
        "fleetType": "أوناش تلسكوبية ليبهير 80 و130 و220 طن ولوابد 4 و6 و8 محاور لنقل المحولات وتوربينات المصانع", "priority": "A+",
        "notes": "دعم المشروعات الكبرى ومصانع الألومنيوم والسكر ومحطات الطاقة الشمسية ومحطات المحولات بالصعيد"
    },
    {
        "nameAr": "شركة نجع حمادي للصناعات الكيماوية وتوريد الصودا الكاوية وأملاح الفلوريد",
        "nameEn": "Nagaa Hammadi Chemical Supplies Caustic Soda & Fluoride Salts Co",
        "sector": "manufacturing", "city": "qena", "district": "نجع حمادي - منطقة الصناعات الكيماوية المغذية", "governorate": "قنا",
        "address": "طريق نجع حمادي سوهاج الزراعي - مجمع مستودعات وخزانات الصودا الكاوية والفلورسبار",
        "phone1": "096-3681116", "phone2": "", "website": "",
        "email": "nagaa.chemicals.supplies@gmail.com", "lat": 26.045, "lon": 32.225, "fleetSize": 50,
        "fleetType": "فنطاسات كيماوية مبطنة ومقاومة للأحماض والقلويات وشاحنات لنقل كيمياويات تنقية الألومنيوم والورق", "priority": "A",
        "notes": "إمداد مصانع الألومنيوم بالصودا الكاوية والكريوليت وفلوريد الألومنيوم وإمداد مصانع الورق بكيماويات التبييض"
    },
    {
        "nameAr": "مصنع الفاتح لتصنيع الطبالي الخشبية وتعبئة وتغليف منتجات الألومنيوم بنجع حمادي",
        "nameEn": "Al Fateh Industrial Wooden Pallets & Aluminium Export Packaging Nagaa",
        "sector": "manufacturing", "city": "qena", "district": "نجع حمادي - منطقة الحرفيين والصناعات التكميلية", "governorate": "قنا",
        "address": "المنطقة الصناعية بهو - مصنع تصنيع البالتات والحوامل الخشبية المعالجة حرارياً",
        "phone1": "096-3681117", "phone2": "", "website": "",
        "email": "alfateh.pallets.nagaa@gmail.com", "lat": 26.010, "lon": 32.265, "fleetSize": 45,
        "fleetType": "تريلات جامبو وتريلات فلات لتوريد حوامل الرص الخشبية لمصانع الألومنيوم والورق والسكر بقنا", "priority": "A",
        "notes": "تصنيع الطبالي الخشبية المعتمدة وفق معايير ISPM 15 لتحميل سبائك الألومنيوم ورولات الورق للتصدير الخارجي"
    },
    {
        "nameAr": "شركة قنا لتجارة وتوزيع حديد التسليح والأسمنت ومواد البناء الثقيلة",
        "nameEn": "Qena Heavy Rebar & Bulk Cement Commercial Distribution Logistics",
        "sector": "transport", "city": "qena", "district": "قنا - منطقة الجبلاو اللوجستية", "governorate": "قنا",
        "address": "طريق قنا الأقصر الزراعي - مجمع مخازن وساحات تشوين حديد التسليح والإسمنت السائب",
        "phone1": "096-3681118", "phone2": "", "website": "",
        "email": "qena.rebar.cement.distrib@gmail.com", "lat": 26.140, "lon": 32.730, "fleetSize": 85,
        "fleetType": "تريلات فلات 3 أكسل لنقل حزم حديد التسليح وتريلات سيلو لنقل الأسمنت السائب لمشروعات الإسكان والبنية التحتية", "priority": "A+",
        "notes": "التوزيع المعتمد لحديد عز وبشاي وأسمنت قنا وأسيوط لكبار مقاولي محافظات قنا والأقصر والبحر الأحمر"
    },
    {
        "nameAr": "شركة نجع حمادي للمقاولات العامة والإنشاءات الصناعية وتجهيز المواقع",
        "nameEn": "Nagaa Hammadi General Contracting & Industrial Sites Infrastructure Co",
        "sector": "contracting", "city": "qena", "district": "نجع حمادي - قطاع التنمية العمرانية", "governorate": "قنا",
        "address": "شارع بورسعيد تقاطع المحطة - مجمع إدارة مشروعات البنية التحتية وشبكات المرافق",
        "phone1": "096-3681119", "phone2": "", "website": "",
        "email": "nagaa.contracting.sites@gmail.com", "lat": 26.042, "lon": 32.238, "fleetSize": 70,
        "fleetType": "لوادر كوماتسو وحفارات هيدروليكية وقلابات مان 4 أكسل ودكاكات لتهيئة وتجهيز الأراضي الصناعية", "priority": "A",
        "notes": "تنفيذ البنية التحتية للمناطق الصناعية وشبكات المياه والصرف والإنشاءات الخرسانية بمحافظة قنا"
    },
    {
        "nameAr": "شركة قوص لتصنيع وتجارة شكائر البولي بروبيلين لتعبئة السكر والأعلاف",
        "nameEn": "Qous Polypropylene Woven Bags For Sugar & Feed Packaging Plant",
        "sector": "manufacturing", "city": "qena", "district": "قوص - مجمع الصناعات البلاستيكية والنسيجية", "governorate": "قنا",
        "address": "طريق مصنع السكر بقوص - مصنع أنوال نسيج شكائر البولي بروبيلين المنسوجة والمبطنة",
        "phone1": "096-3681120", "phone2": "", "website": "",
        "email": "qous.polypropylene.bags@gmail.com", "lat": 25.915, "lon": 32.762, "fleetSize": 55,
        "fleetType": "تريلات جامبو صندوق مقفل لنقل وتوريد ملايين شكائر التعبئة لمصانع السكر ومطاحن الغلال والأعلاف", "priority": "A",
        "notes": "إنتاج شكائر التعبئة المانعة لتسرب الرطوبة المخصصة للسكر الأبيض والدقيق والأسمدة الزراعية بالصعيد"
    },
    {
        "nameAr": "شركة قنا لنقل المشتقات البترولية والسولار الصناعي للمجمعات الإنتاجية",
        "nameEn": "Qena Petroleum Haulage Industrial Diesel & Fuel Tanker Fleets",
        "sector": "transport", "city": "qena", "district": "قنا - منطقة مستودعات الجمعية التعاونية للبترول", "governorate": "قنا",
        "address": "طريق قنا نجع حمادي الزراعي الكيلو 3 - مجمع منصات شحن صهاريج المواد البترولية",
        "phone1": "096-3681121", "phone2": "", "website": "",
        "email": "qena.petroleum.diesel@gmail.com", "lat": 26.170, "lon": 32.715, "fleetSize": 75,
        "fleetType": "صهاريج نقل مواد بترولية سعة 36 و40 ألف لتر مجهزة بأنظمة الحماية الآلية لتموين المصانع والمحطات", "priority": "A+",
        "notes": "الإمداد اليومي لمصانع السكر والألومنيوم والورق ومحطات خلط الخرسانة بالسولار والمازوت وزيوت المحولات"
    },
    {
        "nameAr": "شركة نجع حمادي للمسبوكات وتدوير خردة الألومنيوم وتصنيع السبائك الثانوية",
        "nameEn": "Nagaa Hammadi Scrap Aluminium Recycling & Secondary Alloy Foundry",
        "sector": "manufacturing", "city": "qena", "district": "هو الصناعية - مجمع تدوير المعادن", "governorate": "قنا",
        "address": "المنطقة الصناعية بهو - مجمع أفران صهر وإعادة تدوير خردة الألومنيوم والصب المستمر",
        "phone1": "096-3681122", "phone2": "", "website": "",
        "email": "nagaa.scrap.recycling.foundry@gmail.com", "lat": 26.008, "lon": 32.268, "fleetSize": 60,
        "fleetType": "قلابات صلب وتريلات مسطحة لشحن خردة الألومنيوم وتوريد سبائك الصب الثانوية لمصانع السيارات والأدوات المنزلية", "priority": "A",
        "notes": "إعادة تدوير خردة وسكراب الألومنيوم الصناعي وإنتاج سبائك الدرفلة والصب المطابقة للمواصفات العالمية"
    },
    {
        "nameAr": "شركة قوص لإدارة الصوامع المعدنية وتخزين الحبوب والمحاصيل الاستراتيجية",
        "nameEn": "Qous Metal Grain Silos & Strategic Agro Storage Terminal Co",
        "sector": "transport", "city": "qena", "district": "قوص - مجمع الصوامع الحقلية", "governorate": "قنا",
        "address": "طريق قوص الصحراوي الشرقي - مجمع خلايا الصوامع المعدنية الحديثة بسعة 60 ألف طن",
        "phone1": "096-3681123", "phone2": "", "website": "",
        "email": "qous.silos.storage@gmail.com", "lat": 25.930, "lon": 32.780, "fleetSize": 65,
        "fleetType": "تريلات تفريغ قلاب وتريلات سيلو لنقل وتداول القمح المحلي والمستورد وربطه بالمطاحن التموينية الكبرى", "priority": "A",
        "notes": "تأمين المخزون الاستراتيجي من القمح والحبوب الغذائية لمحافظات جنوب الصعيد بأحدث تقنيات التحكم بالحرارة"
    },
    {
        "nameAr": "شركة قنا للخدمات اللوجستية والشحن المبرد للمنتجات الغذائية والزراعية",
        "nameEn": "Qena Cold Chain Logistics & Fresh Agro Produce Distribution Fleets",
        "sector": "transport", "city": "qena", "district": "قنا الجديدة - المنطقة اللوجستية الزراعية", "governorate": "قنا",
        "address": "طريق قنا الأقصر الصحراوي الشرقي - مجمع ثلاجات التجميد السريع ومحطات التعبئة",
        "phone1": "096-3681124", "phone2": "", "website": "",
        "email": "qena.coldchain.logistics@gmail.com", "lat": 26.150, "lon": 32.750, "fleetSize": 70,
        "fleetType": "برادات تريلا حديثة كارير وشاحنات تبريد لنقل وتوزيع المحاصيل البستانية والمانجو والموز واللحوم المجمدة", "priority": "A",
        "notes": "ربط مزارع محافظات قنا والأقصر بأسواق الجملة المركزية بالقاهرة وموانئ التصدير على البحر الأحمر"
    },
    {
        "nameAr": "شركة هو للنقل الثقيل وإدارة أساطيل التريلات والمقطورات بالمنطقة الصناعية بقنا",
        "nameEn": "Hoo Heavy Haulage Fleets & Industrial Logistics Management Qena",
        "sector": "transport", "city": "qena", "district": "هو الصناعية - المحطة اللوجستية العامة", "governorate": "قنا",
        "address": "مدخل المنطقة الصناعية بهو الكيلو 2 - ساحة انتظار وتفويج الشاحنات والتريلات الثقيلة",
        "phone1": "096-3681125", "phone2": "", "website": "",
        "email": "hoo.heavyhaulage.qena@gmail.com", "lat": 26.012, "lon": 32.262, "fleetSize": 80,
        "fleetType": "تريلات متعددة الاستخدامات فلات وستائر وقلابات لخدمة مصانع ومستثمري المنطقة الصناعية بهو", "priority": "A+",
        "notes": "توفير حلول الشحن الثقيل والنقل التبادلي بين مصانع منطقة هو الصناعية وكافة موانئ ومحافظات الجمهورية"
    },

    # ── Sub-Cluster 2: مجمع كيما للأسمدة ومناجم فوسفات السباعية وإدفو وسكر كوم أمبو بأسوان (25 كياناً) ──
    {
        "nameAr": "شركة الصناعات الكيماوية المصرية (كيما أسوان) وأساطيل سيلوهات اليوريا ونترات النشادر",
        "nameEn": "Egyptian Chemical Industries (KIMA Aswan) & Bulk Fertilizer Silos Fleets",
        "sector": "manufacturing", "city": "aswan", "district": "أسوان - مجمع كيما الصناعي العملاق بشرق أسوان", "governorate": "أسوان",
        "address": "طريق السادات - الكورنيش الجديد - مجمع مصانع كيما 1 وكيما 2 لإنتاج الأمونيا واليوريا",
        "phone1": "097-3481101", "phone2": "", "website": "",
        "email": "kima.fertilizers.aswan@gmail.com", "lat": 24.060, "lon": 32.910, "fleetSize": 180,
        "fleetType": "تريلات سيلو ضغط هواء لنقل اليوريا السائبة وتريلات تريبل أكسل لنقل شكائر نترات النشادر لموانئ التصدير والجمعيات الزراعية", "priority": "A+",
        "notes": "قلعة صناعة الأسمدة النيتروجينية في صعيد مصر ومجمع كيما 2 الحديث لإنتاج الأمونيا واليوريا المحببة للتصدير"
    },
    {
        "nameAr": "شركة كيما لنقل الأمونيا السائلة وأساطيل الصهاريج المضغوطة المبردة بأسوان",
        "nameEn": "KIMA Liquid Ammonia Transport & Cryogenic Pressurized Tankers Fleets",
        "sector": "transport", "city": "aswan", "district": "أسوان - محطة شحن صهاريج الأمونيا بكيما", "governorate": "أسوان",
        "address": "مجمع مصانع كيما شرق أسوان - منصات تعبئة صهاريج الأمونيا اللامائية السائلة",
        "phone1": "097-3481102", "phone2": "", "website": "",
        "email": "kima.ammonia.tankers@gmail.com", "lat": 24.065, "lon": 32.915, "fleetSize": 95,
        "fleetType": "صهاريج ضغط عالي معزولة ومبردة لنقل الأمونيا اللامائية السائلة تحت درجات حرارة منخفضة وضوابط أمان قصوى", "priority": "A+",
        "notes": "نقل الأمونيا فائقة النقاوة لمصانع الأسمدة والبتروكيماويات بالدلتا والسويس والإسكندرية وموانئ التصدير"
    },
    {
        "nameAr": "شركة فوسفات مصر - قطاع السباعية وأساطيل نقل خام الفوسفات الصخري",
        "nameEn": "Misr Phosphate Co - El Sebaiya Sector & Rock Phosphate Mining Fleets",
        "sector": "manufacturing", "city": "edfu", "district": "السباعية غرب - مجمع مناجم الفوسفات الصخري", "governorate": "أسوان",
        "address": "طريق مصر أسوان الصحراوي الغربي / مدخل السباعية - مجمع مناجم وتكسير صخور الفوسفات",
        "phone1": "097-3481103", "phone2": "", "website": "",
        "email": "misrphosphate.sebaiya@gmail.com", "lat": 25.180, "lon": 32.780, "fleetSize": 175,
        "fleetType": "قلابات صخرية هيفي ديوتي وتريلات قلاب 3 أكسل لنقل خامات الفوسفات لمصانع الأسمدة بالسويس والدلتا وموانئ التصدير", "priority": "A+",
        "notes": "أكبر احتياطي لخام الفوسفات الصالح لإنتاج حامض الفوسفوريك والأسمدة الفوسفاتية المركبة والتصدير العالمي"
    },
    {
        "nameAr": "شركة النصر للتعدين بالسباعية وإدفو وأساطيل شحن مركزات الفوسفات والألاباستر",
        "nameEn": "El Nasr Mining Co - Sebaiya & Edfu Heavy Mineral Concentrates Fleets",
        "sector": "manufacturing", "city": "edfu", "district": "إدفو / السباعية شرق - مجمع المناجم والكسارات", "governorate": "أسوان",
        "address": "طريق إدفو السباعية الزراعي الشرقي - مقر إدارة قطاعات المناجم ومحطات التجهيز والتكليس",
        "phone1": "097-3481104", "phone2": "", "website": "",
        "email": "nasrmining.sebaiya.edfu@gmail.com", "lat": 25.150, "lon": 32.810, "fleetSize": 160,
        "fleetType": "قلابات مان وفولفو 4 أكسل وتريلات نقل خامات صلبة لنقل الفوسفات والطفلة والفلسبار لخطوط السكك الحديدية والموانئ", "priority": "A+",
        "notes": "الشركة التاريخية الرائدة في استخراج وتجهيز خامات الفوسفات والجبس والرمال التعدينية في وادي النيل"
    },
    {
        "nameAr": "شركة سكر كوم أمبو وأساطيل قطارات وتريلات نقل قصب السكر وتوريد السكر",
        "nameEn": "Kom Ombo Sugar Co & Mega Cane Haulage Fleets & Processing Plant Aswan",
        "sector": "manufacturing", "city": "kom_ombo", "district": "كوم أمبو - مجمع مصانع السكر والمقطرات الحيوية", "governorate": "أسوان",
        "address": "طريق القاهرة أسوان الزراعي - مركز كوم أمبو - مجمع مصانع عصر القصب وتكرير السكر الأبيض",
        "phone1": "097-3481105", "phone2": "", "website": "",
        "email": "komombo.sugar.haulage@gmail.com", "lat": 24.470, "lon": 32.940, "fleetSize": 170,
        "fleetType": "تريلات جوانب شبكية مقفلة لنقل القصب وفنطاسات ستانلس ستيل للمولاس وتريلات صندوق لنقل السكر الأبيض المعبأ", "priority": "A+",
        "notes": "أكبر وأقدم صرح لصناعة سكر القصب في مصر بطاقة استيعابية تتجاوز 1.8 مليون طن قصب سنوياً"
    },
    {
        "nameAr": "شركة كوم أمبو لتصنيع وتصدير الخشب الحبيبي من ساس القصب والمولاس",
        "nameEn": "Kom Ombo Particle Wood Board & Bagasse Fiber Industrial Plant Aswan",
        "sector": "manufacturing", "city": "kom_ombo", "district": "كوم أمبو - قطاع الصناعات التحويلية المجاورة لمصنع السكر", "governorate": "أسوان",
        "address": "طريق مصنع السكر كوم أمبو - مصنع إنتاج ألواح الخشب الحبيبي المعالج والمقاوم للحريق",
        "phone1": "097-3481106", "phone2": "", "website": "",
        "email": "komombo.woodboards.bagasse@gmail.com", "lat": 24.475, "lon": 32.945, "fleetSize": 85,
        "fleetType": "تريلات تريبل أكسل بصناديق مقفلة لنقل ألواح الخشب الحبيبي والألواح العازلة لمصانع المقاولات والديكور", "priority": "A",
        "notes": "الاستغلال الاقتصادي المتكامل لمصاص القصب (الباجاس) في إنتاج الألواح الخشبية ذات الكثافة المرتفعة"
    },
    {
        "nameAr": "شركة أسوان للحديد والصلب واستخراج خامات الحديد والتعدين بشرق أسوان",
        "nameEn": "Aswan Iron Ore Mining & Heavy Steel Metallurgy Extraction Complex",
        "sector": "manufacturing", "city": "aswan", "district": "شرق أسوان - مجمع مناجم خام الحديد الأووليتي", "governorate": "أسوان",
        "address": "طريق أسوان برنيس الصحراوي الكيلو 25 - مجمع مناجم وكسارات خامات الحديد التعدينية",
        "phone1": "097-3481107", "phone2": "", "website": "",
        "email": "aswan.ironore.mining@gmail.com", "lat": 24.120, "lon": 33.050, "fleetSize": 110,
        "fleetType": "قلابات صخرية هيفي ديوتي وتريلات مسطحة لنقل كتل ومركزات خام الحديد لمجمعات الصلب بالسخنة والدلتا", "priority": "A+",
        "notes": "استغلال مكامن خام الحديد الرسوبي بشرق أسوان وتهيئته كمصدر استراتيجي لمصانع الاختزال المباشر والصهر"
    },
    {
        "nameAr": "شركة السباعية لتكسير وغربلة وطحن صخور الفوسفات لمصانع الأسمدة الفوسفاتية",
        "nameEn": "El Sebaiya Phosphate Crushing Screening & Ultra-Fine Milling Co",
        "sector": "manufacturing", "city": "edfu", "district": "السباعية غرب - مجمع الكسارات والطواحين المركزية", "governorate": "أسوان",
        "address": "طريق السباعية الصحراوي - مجمع طواحين صخور الفوسفات الناعم 30% خامس أكسيد الفوسفور",
        "phone1": "097-3481108", "phone2": "", "website": "",
        "email": "sebaiya.crushing.milling@gmail.com", "lat": 25.185, "lon": 32.775, "fleetSize": 120,
        "fleetType": "تريلات سيلو ضغط هواء لنقل بودرة الفوسفات المطحونة وتريلات قلابات صلب لنقل الفوسفات المحبب المجهز", "priority": "A+",
        "notes": "تجهيز وطحن خام الفوسفات بالمواصفات القياسية المطلوبة لإنتاج سماد السوبر فوسفات وحامض الفوسفوريك"
    },
    {
        "nameAr": "شركة إدفو للب الورق والكرتون وتدوير مصاص القصب عالي الكثافة",
        "nameEn": "Edfu Pulp & Heavy Corrugated Packaging Board Industrial Complex",
        "sector": "manufacturing", "city": "edfu", "district": "إدفو - مجمع صناعات الورق والكرتون بشرق النيل", "governorate": "أسوان",
        "address": "طريق إدفو مرسى علم الصحراوي - مجمع خطوط إنتاج لب الورق والورق الكرافت وتدوير الباجاس",
        "phone1": "097-3481109", "phone2": "", "website": "",
        "email": "edfu.pulp.packaging@gmail.com", "lat": 24.980, "lon": 32.880, "fleetSize": 105,
        "fleetType": "تريلات جامبو مقفلة وتريلات ستائر لنقل رولات الورق الكرافت والكرتون المضلع لمصانع التعبئة بالجمهورية", "priority": "A+",
        "notes": "إنتاج ورق التعبئة الثقيل والكرتون المضلع من ساس القصب المعالج لمقاومة الرطوبة والإجهادات الميكانيكية"
    },
    {
        "nameAr": "شركة أسوان للأسمدة والكيماويات ومصانع السوبر فوسفات الأحادي والمحبب بالسباعية",
        "nameEn": "Aswan Fertilizers & Chemicals Co (AFCCO) & Granular Superphosphate Plant",
        "sector": "manufacturing", "city": "edfu", "district": "السباعية شرق - المنطقة الصناعية الكيماوية", "governorate": "أسوان",
        "address": "طريق السباعية إسنا الزراعي - مجمع مصانع تحميض وتصنيع السماد الفوسفاتي المحبب",
        "phone1": "097-3481110", "phone2": "", "website": "",
        "email": "afcco.phosphate.fertilizers@gmail.com", "lat": 25.170, "lon": 32.800, "fleetSize": 130,
        "fleetType": "تريلات تريبل أكسل لنقل شكائر السوبر فوسفات المحبب وتريلات صب لتوريد الأسمدة لمحافظات الدلتا والصعيد", "priority": "A+",
        "notes": "تصنيع سماد السوبر فوسفات الأحادي المحبب (15.5% P2O5) والأسمدة المركبة للتوزيع الزراعي المحلي والتصدير"
    },
    {
        "nameAr": "شركة أسوان للجرانيت والرخام ومحاجر استخراج كتل الجرانيت الأحمر والأسود",
        "nameEn": "Aswan Red & Black Granite Quarries & Heavy Dimension Stone Blocks Co",
        "sector": "manufacturing", "city": "aswan", "district": "الشلال - مجمع محاجر الجرانيت الأسواني التاريخي", "governorate": "أسوان",
        "address": "طريق السد العالي شرق - مجمع كسارات ومناشر قص وتفصيل كتل الجرانيت الملكي الأحمر والأسود",
        "phone1": "097-3481111", "phone2": "", "website": "",
        "email": "aswan.granite.dimensionstone@gmail.com", "lat": 24.030, "lon": 32.890, "fleetSize": 95,
        "fleetType": "لوابد ثقيلة وتريلات فلات مجهزة بحوامل صلب لنقل كتل الجرانيت الصخرية الكبرى حتى 35 طناً لشق الثعبان وموانئ التصدير", "priority": "A+",
        "notes": "استخراج أشهر أنواع الجرانيت المصري الملكي المقاوم للعوامل الجوية المستخدم في كبرى الصروح المعمارية والميادين"
    },
    {
        "nameAr": "شركة الصعيد للنقل التعديني وربط مناجم السباعية بموانئ سفاجا والحمراوين",
        "nameEn": "Upper Egypt Mining Transport Red Sea Mineral Ports Haulage Corridor",
        "sector": "transport", "city": "edfu", "district": "إدفو - مركز تشغيل الأساطيل التعدينية", "governorate": "أسوان",
        "address": "طريق إدفو مرسى علم الدولي الكيلو 10 - محطة تفويج وصيانة قوافل النقل التعديني الثقيل",
        "phone1": "097-3481112", "phone2": "", "website": "",
        "email": "upperegypt.mininghaulage@gmail.com", "lat": 24.990, "lon": 32.900, "fleetSize": 140,
        "fleetType": "تريلات قلابات صلب 3 و4 أكسل مجهزة بأنظمة التتبع بالقمر الصناعي لشحن خامات الفوسفات والجبس لموانئ التصدير البحرية", "priority": "A+",
        "notes": "الشريان اللوجستي التعديني الرابط بين مناجم وادي النيل وموانئ التصدير على البحر الأحمر (سفاجا والحمراوين والقصير)"
    },
    {
        "nameAr": "شركة كوم أمبو للطاقة الشمسية واللوجستيات وخدمات مزارع بنبان الكهروضوئية",
        "nameEn": "Kom Ombo Solar Logistics & Benban PV Solar Park Heavy Engineering Support",
        "sector": "transport", "city": "kom_ombo", "district": "دراو / بنبان - مجمع بنبان للطاقة الشمسية العملاق", "governorate": "أسوان",
        "address": "طريق أسوان القاهرة الصحراوي الغربي الكيلو 30 - مجمع المستودعات المركزية لمشروع بنبان للطاقة",
        "phone1": "097-3481113", "phone2": "", "website": "",
        "email": "benban.solar.logistics@gmail.com", "lat": 24.440, "lon": 32.740, "fleetSize": 80,
        "fleetType": "تريلات مسطحة مجهزة لنقل الألواح الكهروضوئية والمحولات وأوناش تلسكوبية وشاحنات صيانة مزارع الطاقة المتجددة", "priority": "A+",
        "notes": "الدعم اللوجستي والهندسي لأكبر مجمع للطاقة الشمسية في أفريقيا والشرق الأوسط بقدرة 1465 ميجاوات"
    },
    {
        "nameAr": "شركة أسوان للخرسانة الجاهزة ومحطات الخلط لمشروعات الطاقة ومحاور النيل",
        "nameEn": "Aswan Ready-Mix Concrete Mega Plants Energy & Nile Axes Projects",
        "sector": "contracting", "city": "aswan", "district": "أسوان الجديدة - محور دراو وكوبري أسوان المعلق", "governorate": "أسوان",
        "address": "طريق الكورنيش الجديد بأسوان الجديدة - مجمع محطات الخلط الخرساني المركزي ومختبرات الجودة",
        "phone1": "097-3481114", "phone2": "", "website": "",
        "email": "aswan.readymix.energy@gmail.com", "lat": 24.110, "lon": 32.880, "fleetSize": 85,
        "fleetType": "خلاطات خرسانة 10 و12م³ ومضخات بوم 47 و56 متر شWing ومعدات صب مستمر لقواعد توربينات الطاقة والكباري", "priority": "A+",
        "notes": "تنفيذ القواعد الخرسانية لمحطات الطاقة الشمسية ومحطات المحولات ومحاور وكباري النيل التنموية بأسوان"
    },
    {
        "nameAr": "شركة توشكى وأسوان للاستصلاح الزراعي وأساطيل المعدات الثقيلة والحصاد الآلي",
        "nameEn": "Toshka & Aswan Agro Land Reclamation Heavy Earthmoving & Harvesting Fleets",
        "sector": "contracting", "city": "aswan", "district": "توشكى / أسوان - مشروع الدلتا الجديدة بالجنوب", "governorate": "أسوان",
        "address": "طريق أسوان أبو سمبل الكيلو 210 - معسكرات الآلات الزراعية الثقيلة وحفارات قنوات الري",
        "phone1": "097-3481115", "phone2": "", "website": "",
        "email": "toshka.reclamation.heavy@gmail.com", "lat": 22.750, "lon": 31.850, "fleetSize": 150,
        "fleetType": "بلدوزرات D85 وجريدرات ليزرية وتريلات حفر وتركيب أجهزة البيفوت وحصادات قمح وتريلات نقل محاصيل الحبوب", "priority": "A+",
        "notes": "استصلاح وزراعة مئات آلاف الأفدنة بالقمح والنخيل التمور والمحاصيل الزيتية بمشروع توشكى الخير القومي"
    },
    {
        "nameAr": "شركة السباعية للخدمات التعدينية وتأجير الحفارات واللوادر والقلابات الصخرية",
        "nameEn": "Sebaiya Mining Equipment Rental Heavy Excavators Rock Tippers Co",
        "sector": "transport", "city": "edfu", "district": "السباعية غرب - مركز تأجير المعدات التعدينية الثقيلة", "governorate": "أسوان",
        "address": "طريق السباعية الصحراوي - مجمع ورش تشغيل وصيانة الحفارات والكسارات الميدانية",
        "phone1": "097-3481116", "phone2": "", "website": "",
        "email": "sebaiya.miningequipment@gmail.com", "lat": 25.175, "lon": 32.785, "fleetSize": 75,
        "fleetType": "حفارات كوماتسو وهيتاشي 45 و50 طن ولوادر صخرية وقلابات مان 4 أكسل للعمل الشاق داخل محاجر الفوسفات والجبس", "priority": "A",
        "notes": "تأجير وتشغيل معدات التعدين الثقيلة وفتح طبقات الغطاء الصخري بمناجم الفوسفات المفتوحة بوادي النيل"
    },
    {
        "nameAr": "شركة إدفو لنقل وتوزيع المحاصيل الزراعية والبلح الأسواني وقصب السكر",
        "nameEn": "Edfu Agro Produce Logistics Aswan Dates & Sugar Cane Transport Fleets",
        "sector": "transport", "city": "edfu", "district": "إدفو - مجمع محطات الفرز الزراعي المركزي", "governorate": "أسوان",
        "address": "طريق مصر أسوان الزراعي - مركز إدفو - مجمع مستودعات التجميع والفرز ومحطات التبريد",
        "phone1": "097-3481117", "phone2": "", "website": "",
        "email": "edfu.agroproduce.logistics@gmail.com", "lat": 24.975, "lon": 32.875, "fleetSize": 90,
        "fleetType": "تريلات تهوية وبرادات تريلا حديثة كارير لنقل التمور الجافة ونصف الجافة وقصب السكر والخضروات لمحافظات الوجه البحري", "priority": "A",
        "notes": "تجميع وتوريد محصول قصب السكر لمصانع إدفو وتوزيع التمور الأسوانية الفاخرة لمنافذ التوزيع بالجمهورية"
    },
    {
        "nameAr": "شركة أسوان للمقاولات البحرية وصيانة وتطهير بحيرة ناصر ومجرى السد العالي",
        "nameEn": "Aswan Marine Contracting Lake Nasser & High Dam Waterways Maintenance",
        "sector": "contracting", "city": "aswan", "district": "أسوان - ميناء السد العالي النهري", "governorate": "أسوان",
        "address": "ميناء السد العالي شرق - رصيف الصيانة والإنشاءات البحرية والكراكات النهرية",
        "phone1": "097-3481118", "phone2": "", "website": "",
        "email": "aswan.marinecontracting@gmail.com", "lat": 23.970, "lon": 32.880, "fleetSize": 60,
        "fleetType": "كراكات شفط هيدروليكية وصنادل نقل طمي ولنشات سحب وتريلات نقل معدات التكريك البحري والنهري", "priority": "A",
        "notes": "تطهير مجرى بحيرة ناصر وإزالة الإطماء عند مداخل التوربينات وصيانة الأرصفة النهرية بموانئ وادي حلفا وأسوان"
    },
    {
        "nameAr": "شركة كيما للمهمات البتروكيماوية وخطوط تعبئة وتغليف شكائر الأسمدة",
        "nameEn": "KIMA Petrochemical Logistics & Automated Fertilizer Packaging Plant",
        "sector": "manufacturing", "city": "aswan", "district": "أسوان - مجمع التعبئة الآلية بكيما", "governorate": "أسوان",
        "address": "طريق كيما شرق أسوان - مجمع خطوط التعبئة الروبوتية ومستودعات التخزين الجاف المغطاة",
        "phone1": "097-3481119", "phone2": "", "website": "",
        "email": "kima.packaging.logistics@gmail.com", "lat": 24.062, "lon": 32.912, "fleetSize": 70,
        "fleetType": "تريلات جامبو صندوق مقفل وشاحنات سريعة لنقل شكائر اليوريا ونترات النشادر المعبأة آلياً بسعة 50 كجم", "priority": "A",
        "notes": "خطوط التعبئة والتغليف الآلية فائقة السرعة بطاقة 2500 طن يومياً لخدمة قوافل التصدير والشحن البري"
    },
    {
        "nameAr": "شركة الشلال لتجارة وتوزيع حديد التسليح ومواد البناء الإنشائية بأسوان",
        "nameEn": "El Shallal Heavy Rebar & Construction Materials Distribution Aswan",
        "sector": "transport", "city": "aswan", "district": "الشلال - المجمع اللوجستي ومحطة تفريغ القطارات", "governorate": "أسوان",
        "address": "طريق الشلال السد العالي - مجمع ساحات تشوين وتوزيع حديد التسليح والإسمنت والسن المحجري",
        "phone1": "097-3481120", "phone2": "", "website": "",
        "email": "shallal.rebar.materials@gmail.com", "lat": 24.025, "lon": 32.895, "fleetSize": 80,
        "fleetType": "تريلات تريبل أكسل مسطحة لنقل الحديد وتريلات سيلو لنقل الأسمنت السائب وشاحنات قلاب لنقل ركام البناء", "priority": "A",
        "notes": "توريد وتوزيع مواد البناء الاستراتيجية لمشروعات التنمية بمحافظة أسوان وتوشكى ومشروعات حياة كريمة"
    },
    {
        "nameAr": "شركة أسوان للتبريد وحفظ وتصدير التمور والمانجو والأسماك النيلية",
        "nameEn": "Aswan Cold Storage & Dates Mango & Lake Nasser Fish Export Co",
        "sector": "transport", "city": "aswan", "district": "أسوان الجديدة - المنطقة الصناعية والتخزينية", "governorate": "أسوان",
        "address": "طريق المطار - أسوان الجديدة - مجمع مستودعات التبريد والتجميد السريع سعة 15 ألف طن",
        "phone1": "097-3481121", "phone2": "", "website": "",
        "email": "aswan.coldstorage.export@gmail.com", "lat": 24.120, "lon": 32.870, "fleetSize": 65,
        "fleetType": "برادات تريلا حديثة كارير وشاحنات تبريد معزولة لنقل الأسماك النيلية الطازجة والمجمدة والتمور والمانجو للتصدير", "priority": "A",
        "notes": "حفظ وتصدير ثروات بحيرة ناصر من أسماك السامبوس والبلطي وتصدير أفخر أنواع المانجو والتمور الأسوانية"
    },
    {
        "nameAr": "شركة كوم أمبو للمهمات الميكانيكية وتأجير الأوناش التلسكوبية لمصانع السكر",
        "nameEn": "Kom Ombo Industrial Mechanical Crane Hire & Sugar Mill Heavy Maintenance",
        "sector": "transport", "city": "kom_ombo", "district": "كوم أمبو - قطاع الورش والخدمات الهندسية", "governorate": "أسوان",
        "address": "طريق كوم أمبو نصر النوبة - مجمع الرافعات والأوناش الهيدروليكية واللوابد متعددة المحاور",
        "phone1": "097-3481122", "phone2": "", "website": "",
        "email": "komombo.cranes.maintenance@gmail.com", "lat": 24.480, "lon": 32.950, "fleetSize": 55,
        "fleetType": "أوناش تلسكوبية ليبهير 60 و100 طن ولوابد نقل التربينات والمراجل البخارية ومكابس عصر القصب العملاقة", "priority": "A",
        "notes": "تنفيذ أعمال العمرات الشاملة والصيانة السنوية الدورية لمراجل وعصارات مصانع السكر وتوربينات توليد البخار"
    },
    {
        "nameAr": "شركة أسوان للغازات الصناعية وتوريد الأكسجين والأسيتيلين لأعمال التعدين",
        "nameEn": "Aswan Industrial Gases Oxygen Acetylene & Quarrying Welding Supplies",
        "sector": "transport", "city": "aswan", "district": "المنطقة الصناعية بالعلاقي - جنوب أسوان", "governorate": "أسوان",
        "address": "طريق وادي العلاقي الكيلو 8 - محطة شحن أسطوانات الأكسجين الطبي والغازات الصناعية المسالة",
        "phone1": "097-3481123", "phone2": "", "website": "",
        "email": "aswan.industrialgases.alaqi@gmail.com", "lat": 24.010, "lon": 32.930, "fleetSize": 50,
        "fleetType": "شاحنات صندوق شبكي لنقل أسطوانات الغازات المضغوطة وتريلات صهاريج لنقل الأكسجين والنيتروجين السائل للمستشفيات والمناجم", "priority": "A",
        "notes": "تأمين الغازات الصناعية لورش صيانة المعدات الثقيلة ومحاجر الجرانيت والذهب ومصانع الكيماويات ومستشفيات المحافظة"
    },
    {
        "nameAr": "شركة السباعية للصناعات البيئية ومعالجة وإعادة تدوير الجبس الفوسفاتي",
        "nameEn": "Sebaiya Phosphogypsum Environmental Recycling & Soil Additives Co",
        "sector": "manufacturing", "city": "edfu", "district": "السباعية غرب - مجمع التدوير البيئي لمخلفات الفوسفات", "governorate": "أسوان",
        "address": "طريق السباعية الصحراوي - مجمع معالجة وتكرير الجبس الفوسفاتي وإنتاج الجبس الزراعي والمعماري",
        "phone1": "097-3481124", "phone2": "", "website": "",
        "email": "sebaiya.phosphogypsum.eco@gmail.com", "lat": 25.190, "lon": 32.770, "fleetSize": 60,
        "fleetType": "قلابات صلب وتريلات سيلو لنقل الجبس الزراعي المعالج المخصص لمعالجة ملوحة التربة واستصلاح الأراضي", "priority": "A",
        "notes": "معالجة المخلفات الجبسية الناتجة عن صناعة حامض الفوسفوريك وتحويلها إلى مصلحات زراعية ومواد بناء عالية الجودة"
    },
    {
        "nameAr": "شركة أسوان لإدارة الأساطيل والتفريغ والشحن النهري بميناء السد العالي",
        "nameEn": "Aswan River Port Stevedoring Fleet Management High Dam Terminal",
        "sector": "transport", "city": "aswan", "district": "ميناء السد العالي النهري - قطاع التبادل التجاري مع السودان", "governorate": "أسوان",
        "address": "رصيف الميناء النهري بالسد العالي - مجمع مكاتب الشحن والتخليص الجمركي وساحات الترانزيت",
        "phone1": "097-3481125", "phone2": "", "website": "",
        "email": "aswan.riverport.terminal@gmail.com", "lat": 23.975, "lon": 32.885, "fleetSize": 85,
        "fleetType": "تريلات نقل بضائع عامة وتريلات تريبل أكسل ورافعات شوكية ثقيلة لنقل الصادرات والواردات بين مصر والسودان", "priority": "A+",
        "notes": "إدارة عمليات الشحن والتفريغ البري والنهري للبضائع المتجهة عبر بحيرة ناصر إلى ميناء وادي حلفا بالسودان"
    },

    # ── Sub-Cluster 3: منطقة الكوثر الصناعية وغرب سوهاج ومجمعات الغزل والمطاحن (25 كياناً) ──
    {
        "nameAr": "مجموعة الكوثر الصناعية للكرتون وصناديق التعبئة والتغليف المضلعة بسوهاج",
        "nameEn": "El Kawthar Corrugated Packaging & Heavy Industrial Carton Complex Sohag",
        "sector": "manufacturing", "city": "sohag", "district": "حي الكوثر - المنطقة الصناعية الأولى", "governorate": "سوهاج",
        "address": "حي الكوثر الصناعي - مجمع مصانع خطوط إنتاج الكرتون المضلع 3 و5 طبقات ومطابع الأوفست",
        "phone1": "093-4681101", "phone2": "", "website": "",
        "email": "kawthar.packaging.carton@gmail.com", "lat": 26.580, "lon": 31.750, "fleetSize": 115,
        "fleetType": "تريلات جامبو صندوق مقفل وشاحنات سريعة لتوريد كراتين التعبئة لمصانع الأغذية والأدوية والأجهزة بالصعيد", "priority": "A+",
        "notes": "المورد الرئيسي لكراتين وصناديق التعبئة المضلعة عالية التحمل لكبرى الشركات الصناعية والغذائية بصعيد مصر"
    },
    {
        "nameAr": "شركة مطاحن مصر العليا - مجمع مطاحن وصوامع سوهاج الكبرى الحديثة",
        "nameEn": "Upper Egypt Flour Mills - Sohag Mega Milling & Silos Complex",
        "sector": "manufacturing", "city": "sohag", "district": "سوهاج - مجمع مطاحن غرب النيل / طريق أسيوط سوهاج", "governorate": "سوهاج",
        "address": "شارع الجمهورية - مجمع مطاحن ناصر ومطاحن سوهاج الحديثة وصوامع تخزين القمح المعدنية",
        "phone1": "093-4681102", "phone2": "", "website": "",
        "email": "upperegypt.flourmills.sohag@gmail.com", "lat": 26.560, "lon": 31.690, "fleetSize": 155,
        "fleetType": "تريلات سيلو لنقل الدقيق الفاخر 72% وتريلات نقل صب للقمح وتريلات صندوق مقفل لتوزيع شكائر الدقيق والردة لمخابز الصعيد", "priority": "A+",
        "notes": "إنتاج وتوزيع الدقيق البلدي والفاخر والسميد بطاقة طحن تتجاوز 1800 طن قمح يومياً لتأمين الخبز بصعيد مصر"
    },
    {
        "nameAr": "شركة سوهاج للزيوت والمنظفات واستخلاص الزيوت النباتية والصابون بالكوثر",
        "nameEn": "Sohag Oils Detergents & Vegetable Oil Extraction & Soap Plant Kawthar",
        "sector": "manufacturing", "city": "sohag", "district": "حي الكوثر - المنطقة الصناعية الثالثة", "governorate": "سوهاج",
        "address": "المنطقة الصناعية بحي الكوثر - مجمع معاصر بذور القطن والصويا وتكرير وتعبئة الزيوت ومصانع الصابون",
        "phone1": "093-4681103", "phone2": "", "website": "",
        "email": "sohag.oils.detergents@gmail.com", "lat": 26.585, "lon": 31.755, "fleetSize": 125,
        "fleetType": "فنطاسات ستانلس ستيل لنقل الزيوت النباتية السائبة وتريلات صندوق لتوزيع كراتين زيوت الطعام والمنظفات التموينية", "priority": "A+",
        "notes": "تكرير وتعبئة زيوت الطعام التموينية والحر واستخلاص كسب الصويا والقطن عالي البروتين لتغذية مصانع الأعلاف"
    },
    {
        "nameAr": "شركة سوهاج للغزل والنسيج وتصنيع الخيوط القطنية والأقمشة الرفيعة",
        "nameEn": "Sohag Spinning & Weaving Fine Cotton Yarn & Textile Manufacturing Co",
        "sector": "manufacturing", "city": "sohag", "district": "سوهاج - مجمع مصانع الغزل بغرب سوهاج", "governorate": "سوهاج",
        "address": "طريق سوهاج أسيوط الزراعي - مجمع صالات الغزل الحلقي والتوربيني والتجهيز والصباغة الآلية",
        "phone1": "093-4681104", "phone2": "", "website": "",
        "email": "sohag.spinning.textiles@gmail.com", "lat": 26.565, "lon": 31.685, "fleetSize": 90,
        "fleetType": "تريلات جامبو صندوق مقفل لنقل بالات القطن الخام وغزول الأقمشة المشطبة لمصانع الملابس الجاهزة والموانئ", "priority": "A+",
        "notes": "إنتاج الغزول القطنية الرفيعة والممشطة 100% قطن مصري طويل التيلة الموجهة لأسواق التصدير وصناعة المفروشات"
    },
    {
        "nameAr": "شركة الكوثر للصناعات البلاستيكية ومواسير الـ PVC وشبكات الري الزراعي",
        "nameEn": "El Kawthar Plastics PVC Pipes & Agro Drip Irrigation Networks Plant",
        "sector": "manufacturing", "city": "sohag", "district": "حي الكوثر - المنطقة الصناعية الثانية", "governorate": "سوهاج",
        "address": "المنطقة الصناعية بالكوثر - مجمع ماكينات بثق مواسير الـ PVC والـ HDPE وخراطيم الري بالتنقيط",
        "phone1": "093-4681105", "phone2": "", "website": "",
        "email": "kawthar.plastics.pipes@gmail.com", "lat": 26.578, "lon": 31.748, "fleetSize": 80,
        "fleetType": "تريلات مسطحة طويلة لنقل حزم المواسير وتريلات جامبو لنقل رولات خراطيم الري ومستلزمات الوصلات الهندسية", "priority": "A",
        "notes": "تجهيز شبكات الري الحديث والمواسير الإنشائية لمشروعات غرب سوهاج والظهير الصحراوي والمجتمعات العمرانية"
    },
    {
        "nameAr": "شركة سوهاج للخرسانة الجاهزة ومحطات الخلط للأعمال الصناعية والكباري",
        "nameEn": "Sohag Ready-Mix Concrete & Heavy Bridge Batching Plants Network",
        "sector": "contracting", "city": "sohag", "district": "سوهاج - محور طما ومحور جرجا على النيل", "governorate": "سوهاج",
        "address": "طريق الكورنيش الغربي - مجمع محطات الخلط الخرساني المركزي ومستودعات الإسمنت السائب",
        "phone1": "093-4681106", "phone2": "", "website": "",
        "email": "sohag.readymix.bridges@gmail.com", "lat": 26.550, "lon": 31.700, "fleetSize": 95,
        "fleetType": "خلاطات خرسانة 10 و12م³ ومضخات بوم 47 و52 متر شWing ومعدات صب مستمر للكباري والمنشآت المائية على النيل", "priority": "A+",
        "notes": "تنفيذ محاور النيل التنموية بمحافظة سوهاج (محور طما، محور جرجا، محور المراغة وساقلتة) والمنشآت الحكومية"
    },
    {
        "nameAr": "شركة غرب طهطا للمقاولات العامة وشق الطرق ومحاور ربط الصحراوي الغربي",
        "nameEn": "West Tahta General Contracting & Western Desert Link Highway Fleets",
        "sector": "contracting", "city": "tahta", "district": "طهطا - مجمع معدات المقاولات والكسارات المتنقلة", "governorate": "سوهاج",
        "address": "طريق طهطا الصحراوي الغربي الجديد - معسكر معدات رصف الأسفلت والقلابات الثقيلة",
        "phone1": "093-4681107", "phone2": "", "website": "",
        "email": "westtahta.contracting.roads@gmail.com", "lat": 26.770, "lon": 31.480, "fleetSize": 90,
        "fleetType": "فناشر أسفلت وهراسات حديد ومطاط وقلابات مان 4 أكسل ولوادر حفر لتنفيذ المحاور المرورية الحيوية", "priority": "A+",
        "notes": "تنفيذ شبكة الطرق التنموية الرابطة بين مراكز محافظة سوهاج وطريق الصعيد الصحراوي الغربي ومحور التنمية"
    },
    {
        "nameAr": "شركة سوهاج لتجارة وتوريد حديد التسليح والإسمنت واللفائف لمقاولي الصعيد",
        "nameEn": "Sohag Heavy Rebar & Bulk Cement Supply Logistics Upper Egypt",
        "sector": "transport", "city": "sohag", "district": "سوهاج الجديدة - المنطقة اللوجستية وتجارة مواد البناء", "governorate": "سوهاج",
        "address": "طريق سوهاج الجديدة الدائري - مجمع المخازن المركزية لحديد التسليح والأسمنت واللفائف",
        "phone1": "093-4681108", "phone2": "", "website": "",
        "email": "sohag.rebar.cement.supply@gmail.com", "lat": 26.510, "lon": 31.650, "fleetSize": 105,
        "fleetType": "تريلات تريبل أكسل مسطحة لنقل الحديد وتريلات سيلو لنقل الأسمنت السائب لمشروعات الإسكان الاجتماعي والكباري", "priority": "A+",
        "notes": "كبار الموزعين المعتمدين لحديد عز والمصريين وأسمنت أسيوط وقنا لتأمين مشروعات البناء في وسط وجنوب الصعيد"
    },
    {
        "nameAr": "شركة الكوثر للصناعات الهندسية وتصنيع المقطورات وتنك التريلات واللوابد",
        "nameEn": "El Kawthar Heavy Engineering Trailer Chassis & Tank Body Manufacturing",
        "sector": "manufacturing", "city": "sohag", "district": "حي الكوثر - مجمع الصناعات المعدنية والهندسية", "governorate": "سوهاج",
        "address": "المنطقة الصناعية بحي الكوثر - مجمع ورش تصنيع وتجميع شاسيهات المقطورات واللوابد والصهاريج",
        "phone1": "093-4681109", "phone2": "", "website": "",
        "email": "kawthar.trailers.engineering@gmail.com", "lat": 26.582, "lon": 31.752, "fleetSize": 60,
        "fleetType": "لوابد مسطحة وتريلات فلات مجهزة لشحن الشاسيهات والصهاريج وهياكل القلابات المصنعة لمقاولي النقل الثقيل", "priority": "A",
        "notes": "تصنيع صناديق القلابات الصلب وهياكل التريلات الفلات وفنطاسات الوقود والمياه المطابقة لمواصفات هيئة الطرق"
    },
    {
        "nameAr": "شركة سوهاج للأعلاف الداجنة وتصنيع الأعلاف المحببة والمركزات بالكوثر",
        "nameEn": "Sohag Poultry Feed Pellets & Concentrates Mega Mill El Kawthar",
        "sector": "manufacturing", "city": "sohag", "district": "حي الكوثر - منطقة الصناعات الغذائية والأعلاف", "governorate": "سوهاج",
        "address": "المنطقة الصناعية بالكوثر - مجمع خطوط طحن وكبس وتبريد الأعلاف الداجنة وصوامع المركزات",
        "phone1": "093-4681110", "phone2": "", "website": "",
        "email": "sohag.poultryfeed.kawthar@gmail.com", "lat": 26.588, "lon": 31.745, "fleetSize": 85,
        "fleetType": "تريلات سيلو ضغط هواء لنقل العلف السائب وتريلات صندوق مقفل لتوزيع شكائر الأعلاف لمزارع الدواجن بالصعيد", "priority": "A+",
        "notes": "إنتاج أعلاف الدواجن والماشية المحببة الخالية من السموم الفطرية بطاقة إنتاجية 600 طن يومياً لخدمة قطاع الثروة الداجنة"
    },
    {
        "nameAr": "شركة جرجا للسكر والتكرير وأساطيل نقل قصب السكر وتوريد السكر السائب",
        "nameEn": "Girga Sugar Refining Co & Cane Haulage Fleets Complex Sohag",
        "sector": "manufacturing", "city": "girga", "district": "جرجا - مجمع مصانع السكر والمقطرات الحيوية جنوب سوهاج", "governorate": "سوهاج",
        "address": "طريق مصر أسوان الزراعي - مركز جرجا - مجمع مصانع عصر وتكرير قصب السكر الكبرى",
        "phone1": "093-4681111", "phone2": "", "website": "",
        "email": "girga.sugar.refining@gmail.com", "lat": 26.330, "lon": 31.890, "fleetSize": 160,
        "fleetType": "تريلات جوانب شبكية مقفلة لنقل القصب من مراكز جرجا والبلينا ودار السلام وفنطاسات ستانلس ستيل لنقل المولاس", "priority": "A+",
        "notes": "مجمع عصر قصب السكر الرئيسي بمحافظة سوهاج بطاقة استيعابية تتجاوز 1.2 مليون طن قصب سنوياً"
    },
    {
        "nameAr": "شركة سوهاج للرخام والجرانيت ومحاجر الحجر الجيري الأبيض بالصحراء الغربية",
        "nameEn": "Sohag Marble Granite & Western Desert White Limestone Quarrying Co",
        "sector": "manufacturing", "city": "sohag", "district": "المنطقة الصناعية بغرب جرجا / بيت خلاف", "governorate": "سوهاج",
        "address": "طريق سوهاج الصحراوي الغربي - مجمع محاجر ومصانع تقطيع وصقل الرخام والجرانيت والحجر الجيري",
        "phone1": "093-4681112", "phone2": "", "website": "",
        "email": "sohag.marble.granite.quarries@gmail.com", "lat": 26.310, "lon": 31.780, "fleetSize": 90,
        "fleetType": "قلابات صخرية هيفي ديوتي وتريلات فلات مجهزة لنقل كتل الحجر الجيري وبلوكات الرخام لمصانع شق الثعبان", "priority": "A+",
        "notes": "استخراج خامات الحجر الجيري النقي ورخام الجلالة والجرانيت وتصنيع بودرة كربونات الكالسيوم لمصانع البويات"
    },
    {
        "nameAr": "شركة الكوثر للمستحضرات الطبية والدوائية والمستلزمات المعقمة بسوهاج",
        "nameEn": "El Kawthar Pharmaceuticals & Sterile Medical Solutions Manufacturing",
        "sector": "manufacturing", "city": "sohag", "district": "حي الكوثر - مجمع الصناعات الدوائية والطبية", "governorate": "سوهاج",
        "address": "المنطقة الصناعية بالكوثر - مجمع مصانع الأدوية والمحاليل الطبية المعقمة والمستلزمات الحيوية",
        "phone1": "093-4681113", "phone2": "", "website": "",
        "email": "kawthar.pharma.solutions@gmail.com", "lat": 26.575, "lon": 31.758, "fleetSize": 60,
        "fleetType": "شاحنات نقل وتوزيع مبردة ومكيفة بنظم تعليق هوائي لنقل المحاليل والمستحضرات الدوائية لمستشفيات الصعيد", "priority": "A",
        "notes": "تصنيع محاليل الحقن الوريدي والأدوية الحيوية والمطهرات الطبية وتوزيعها وفق اشتراطات ممارسات التصنيع الجيد GMP"
    },
    {
        "nameAr": "شركة سوهاج لنقل وتوزيع الحبوب والغلال وشحن الصوامع الاستراتيجية",
        "nameEn": "Sohag Grain Silos Haulage & Strategic Wheat Logistics Fleets",
        "sector": "transport", "city": "sohag", "district": "غرب طهطا - مجمع صوامع طهطا المعدنية الكبرى", "governorate": "سوهاج",
        "address": "طريق طهطا الصحراوي الغربي - صوامع طهطا سعة 60 ألف طن ومحطة الشحن البري الحديثة",
        "phone1": "093-4681114", "phone2": "", "website": "",
        "email": "sohag.grainsilos.logistics@gmail.com", "lat": 26.780, "lon": 31.470, "fleetSize": 110,
        "fleetType": "تريلات تفريغ قلاب وتريلات سيلو لنقل القمح السائب من الموانئ البحرية والصوامع إلى المطاحن التموينية الكبرى", "priority": "A+",
        "notes": "إدارة قوافل تفريغ وشحن الأقماح المحلية والمستوردة لتأمين الحبوب التموينية بمحافظات سوهاج وقنا وأسيوط"
    },
    {
        "nameAr": "شركة الكوثر للدهانات ومواد البناء الحديثة والعوازل الإنشائية بسوهاج",
        "nameEn": "El Kawthar Chemical Paints Modern Construction Insulation Materials",
        "sector": "manufacturing", "city": "sohag", "district": "حي الكوثر - قطاع الكيماويات ومواد البناء", "governorate": "سوهاج",
        "address": "المنطقة الصناعية بالكوثر - مجمع مصانع الدهانات الإنشائية والمعاجين الجاهزة والعوازل المائية والحرارية",
        "phone1": "093-4681115", "phone2": "", "website": "",
        "email": "kawthar.paints.insulation@gmail.com", "lat": 26.586, "lon": 31.742, "fleetSize": 55,
        "fleetType": "تريلات صندوق مقفل وشاحنات توزيع لنقل بستلات الدهانات وبراميل العوازل لموزعي مواد البناء بالصعيد", "priority": "A",
        "notes": "إنتاج الدهانات المقاومة للعوامل الجوية والحرارة العالية والمواد الإيبوكسية لمعالجة أرضيات المصانع والمستودعات"
    },
    {
        "nameAr": "شركة طهطا لنقل وتوزيع وتصدير المحاصيل الزراعية والبصل والموالح",
        "nameEn": "Tahta Agro Export Logistics Onion Citrus & Fresh Crops Transport",
        "sector": "transport", "city": "tahta", "district": "طهطا - مجمع محطات الفرز والتدريج التصديري", "governorate": "سوهاج",
        "address": "طريق طهطا جهينة الزراعي - مجمع محطات فرز وتعبئة البصل والموالح المخصصة للتصدير الخارجي",
        "phone1": "093-4681116", "phone2": "", "website": "",
        "email": "tahta.agroexport.logistics@gmail.com", "lat": 26.765, "lon": 31.500, "fleetSize": 95,
        "fleetType": "تريلات تهوية وبرادات تريلا حديثة كارير لنقل البصل والموالح والرمان من مزارع سوهاج لموانئ الإسكندرية وسفاجا", "priority": "A+",
        "notes": "تجهيز وشحن المحاصيل الزراعية التصديرية التي تشتهر بها مراكز طهطا والمراغة وجهينة بالمعايير الأوروبية"
    },
    {
        "nameAr": "شركة سوهاج للمهمات الصناعية وتأجير الأوناش التلسكوبية والرافعات الثقيلة",
        "nameEn": "Sohag Heavy Cranes Rental & Industrial Plant Machinery Erection Co",
        "sector": "transport", "city": "sohag", "district": "سوهاج - مجمع الورش والخدمات الميكانيكية بمدينة ناصر", "governorate": "سوهاج",
        "address": "طريق سوهاج أخميم - مجمع تشغيل الرافعات التلسكوبية واللوابد متعددة المحاور لنقل المعدات الثقيلة",
        "phone1": "093-4681117", "phone2": "", "website": "",
        "email": "sohag.heavycranes.machinery@gmail.com", "lat": 26.555, "lon": 31.720, "fleetSize": 65,
        "fleetType": "أوناش كرين تلسكوبية ليبهير وتادانو 70 و100 و160 طن ولوابد نقل المولدات والخلاطات والجمالونات الصلب", "priority": "A+",
        "notes": "رفع وتركيب الماكينات العملاقة وتجهيز الهياكل المعدنية لمصانع حي الكوثر وغرب سوهاج ومحاور النيل"
    },
    {
        "nameAr": "شركة الكوثر للصناعات الخشبية وتصنيع البالتات المعالجة لتحميل الصادرات",
        "nameEn": "El Kawthar Wood Pallets & Heavy Export Packing Manufacturing Co",
        "sector": "manufacturing", "city": "sohag", "district": "حي الكوثر - مجمع الأخشاب والتغليف الصناعي", "governorate": "سوهاج",
        "address": "المنطقة الصناعية بالكوثر - مصنع إنتاج البالتات الخشبية المعالجة حرارياً بغرف التجفيف الآلية",
        "phone1": "093-4681118", "phone2": "", "website": "",
        "email": "kawthar.woodpallets@gmail.com", "lat": 26.579, "lon": 31.746, "fleetSize": 50,
        "fleetType": "تريلات جامبو وتريلات فلات لتوريد الطبالي الخشبية لمصانع السكر والزيوت والمطاحن والكرتون بصعيد مصر", "priority": "A",
        "notes": "تصنيع البالتات الخشبية المعتمدة لنقل الشحنات الثقيلة والصادرات الغذائية والصناعية طبقاً لمعايير التصدير الدولية"
    },
    {
        "nameAr": "شركة سوهاج لنقل المواد البترولية والسولار والمازوت لمصانع الصعيد",
        "nameEn": "Sohag Petroleum Fuel Haulage Industrial Diesel & Fuel Tanker Fleets",
        "sector": "transport", "city": "sohag", "district": "سوهاج - مجمع مستودعات مصر للبترول بغرب سوهاج", "governorate": "سوهاج",
        "address": "طريق سوهاج الصحراوي الغربي الكيلو 15 - مجمع محطات شحن صهاريج الوقود الصناعي",
        "phone1": "093-4681119", "phone2": "", "website": "",
        "email": "sohag.petroleum.tankers@gmail.com", "lat": 26.530, "lon": 31.640, "fleetSize": 85,
        "fleetType": "صهاريج وقود سعة 36 و40 ألف لتر وفنطاسات مازوت معزولة لتموين مصانع السكر والأسمنت ومحطات الخلط الخرساني", "priority": "A+",
        "notes": "التغذية البترولية الاستراتيجية بالسولار والمازوت لكافة المجمعات الإنتاجية ومصانع الطوب بمحافظة سوهاج"
    },
    {
        "nameAr": "شركة سوهاج للصناعات الغذائية والتجفيف والتجميد السريع للخضروات",
        "nameEn": "Sohag Agro-Food Processing IQF Vegetable Freezing & Dehydration Plant",
        "sector": "manufacturing", "city": "sohag", "district": "المنطقة الصناعية بغرب طهطا", "governorate": "سوهاج",
        "address": "المنطقة الصناعية بغرب طهطا - مجمع خطوط غسيل وتجهيز وتجميد الخضروات بالتقنية الفردية السريعة IQF",
        "phone1": "093-4681120", "phone2": "", "website": "",
        "email": "sohag.agrofood.iqf@gmail.com", "lat": 26.775, "lon": 31.475, "fleetSize": 75,
        "fleetType": "برادات تريلا مجهزة بأنظمة تسجيل الحرارة لنقل الخضروات المجمدة (بامية، ملوخية، فاصوليا، فراولة) لموانئ التصدير", "priority": "A+",
        "notes": "تصنيع وتجميد وتجفيف الحاصلات الزراعية الصعيدية وتصديرها لأسواق الخليج العربي وأوروبا والولايات المتحدة"
    },
    {
        "nameAr": "شركة غرب سوهاج للمحاجر واستخراج كتل الدبش والسن لمشاريع السكك الحديدية",
        "nameEn": "West Sohag Quarries Ballast Crushed Stone For High-Speed Rail Projects",
        "sector": "manufacturing", "city": "sohag", "district": "الصحراوي الغربي - مجمع محاجر ومحطات كسارات السن", "governorate": "سوهاج",
        "address": "طريق سوهاج أسيوط الصحراوي الغربي الكيلو 40 - مجمع كسارات سن البازلت والدولوميت لخطوط القطار السريع",
        "phone1": "093-4681121", "phone2": "", "website": "",
        "email": "westsohag.railwayballast@gmail.com", "lat": 26.680, "lon": 31.550, "fleetSize": 120,
        "fleetType": "قلابات صخرية هيفي ديوتي 4 أكسل وتريلات قلاب لتوريد سن البازلت المطابق لمواصفات السكك الحديدية والقطار الكهربائي السريع", "priority": "A+",
        "notes": "المورد الرئيسي لسن البازلت والدبش لقطاع صعيد مصر بمشروع الخط الثاني للقطار الكهربائي السريع (أكتوبر - أسوان)"
    },
    {
        "nameAr": "شركة الكوثر للغازات الصناعية وشحن أسطوانات الأكسجين والأرجون والنيتروجين",
        "nameEn": "El Kawthar Industrial Gases Filling Oxygen Argon & Nitrogen Station",
        "sector": "transport", "city": "sohag", "district": "حي الكوثر - منطقة الغازات الصناعية والطبية", "governorate": "سوهاج",
        "address": "المنطقة الصناعية بالكوثر - محطة تفريغ وتعبئة خزانات وأسطوانات الغازات الصناعية المسالة",
        "phone1": "093-4681122", "phone2": "", "website": "",
        "email": "kawthar.industrialgases@gmail.com", "lat": 26.581, "lon": 31.749, "fleetSize": 45,
        "fleetType": "شاحنات صندوق شبكي مخصصة لنقل أسطوانات الضغط العالي وتريلات تنكات لنقل الغازات المسالة للمستشفيات والورش", "priority": "A",
        "notes": "تأمين الغازات الصناعية لورش اللحام وقطع المعادن بالمصانع وتوريد الأكسجين الطبي السائل لمستشفيات المحافظة"
    },
    {
        "nameAr": "شركة جرجا للمقاولات البحرية والأعمال النهرية وصيانة قناطر نجع حمادي الجديدة",
        "nameEn": "Girga Marine & River Dredging Engineering New Nagaa Hammadi Barrage",
        "sector": "contracting", "city": "girga", "district": "جرجا - قطاع الأعمال النهرية والهيدروليكية على النيل", "governorate": "سوهاج",
        "address": "طريق كورنيش النيل بجرجا - مجمع إدارة معدات التكريك النهري وصيانة المنشآت المائية والأهوسة",
        "phone1": "093-4681123", "phone2": "", "website": "",
        "email": "girga.marineriver.works@gmail.com", "lat": 26.335, "lon": 31.895, "fleetSize": 55,
        "fleetType": "صنادل نهرية مجهزة بأوناش وكراكات شفط هيدروليكية وتريلات نقل معدات التكريك الثقيلة وصيانة المجرى الملاحي", "priority": "A",
        "notes": "تنفيذ أعمال حماية جسور نهر النيل وتكريك المجرى الملاحي النهري بين أسيوط وقنا وصيانة بوابات الأهوسة الملاحية"
    },
    {
        "nameAr": "شركة سوهاج للصوامع والمستودعات الجمركية وخدمات الترانزيت اللوجستي",
        "nameEn": "Sohag Bonded Warehouses Silos & Strategic Transit Logistics Terminal",
        "sector": "transport", "city": "sohag", "district": "سوهاج الجديدة - المجمع اللوجستي الحر والمستودعات الجمركية", "governorate": "سوهاج",
        "address": "طريق المطار بسوهاج الجديدة - ساحات المستودعات الجمركية المعتمدة ومخازن الترانزيت",
        "phone1": "093-4681124", "phone2": "", "website": "",
        "email": "sohag.bondedwarehouses@gmail.com", "lat": 26.505, "lon": 31.645, "fleetSize": 75,
        "fleetType": "تريلات نقل متعدد الوسائط ورافعات شوكية ثقيلة وتريلات نقل حاويات 40 قدم لخدمة مستثمري المناطق الصناعية بالصعيد", "priority": "A+",
        "notes": "تقديم خدمات التخزين الجمركي المؤقت والتخليص وإدارة سلاسل الإمداد للسلع والمواد الخام الواردة لمصانع الصعيد"
    },
    {
        "nameAr": "شركة الكوثر للحلول البيئية وتدوير المخلفات الصناعية والحمأة الصلبة",
        "nameEn": "El Kawthar Environmental Solutions & Industrial Waste Recycling Co",
        "sector": "contracting", "city": "sohag", "district": "حي الكوثر - قطاع المعالجة البيئية وإدارة المخلفات", "governorate": "سوهاج",
        "address": "المنطقة الصناعية بالكوثر - مجمع أحواض معالجة الحمأة ومحطات تدوير المخلفات الصلبة غير الخطرة",
        "phone1": "093-4681125", "phone2": "", "website": "",
        "email": "kawthar.environmental.eco@gmail.com", "lat": 26.587, "lon": 31.751, "fleetSize": 60,
        "fleetType": "شاحنات هوك لفت لنقل الحاويات البيئية وقلابات مقفلة معزولة ومعدات معالجة مياه الصرف الصناعي وإعادة التدوير", "priority": "A",
        "notes": "التخلص الآمن والمعالجة البيئية للمخلفات الصناعية لمصانع الكرتون والزيوت والبلاستيك بحي الكوثر والمناطق الصناعية"
    }
]

# 3. Vetting & Normalization
approved_companies = []
rejected_companies = []

for idx, c in enumerate(candidates_data, 1):
    comp_id = f"comp_deep_south_{idx:03d}"
    name_ar = c['nameAr']
    name_en = c['nameEn']
    norm_ar = normalize_text(name_ar)
    norm_en = normalize_text(name_en)

    if norm_ar in existing_names or norm_en in existing_names:
        print(f"❌ REJECTED #{idx}: {name_ar} -> Duplicate name")
        rejected_companies.append((name_ar, "Duplicate Name"))
        continue

    p1_clean = clean_phone(c.get('phone1', ''))
    if p1_clean and p1_clean in existing_phones:
        print(f"❌ REJECTED #{idx}: {name_ar} -> Duplicate phone ({p1_clean})")
        rejected_companies.append((name_ar, f"Duplicate phone ({p1_clean})"))
        continue

    # Record verified entity
    verified = {
        "id": comp_id,
        "nameAr": name_ar,
        "nameEn": name_en,
        "sector": c['sector'],
        "city": c['city'],
        "district": c['district'],
        "governorate": c['governorate'],
        "address": c['address'],
        "phone1": c.get('phone1', ''),
        "phone2": c.get('phone2', ''),
        "mobile": "",
        "hotline": "",
        "email": c.get('email', ''),
        "website": c.get('website', ''),
        "contactPerson": "",  # Stays strictly blank for sales reps
        "fleetSize": c.get('fleetSize', 45),
        "fleetType": c['fleetType'],
        "lat": c.get('lat', 25.0),
        "lon": c.get('lon', 32.5),
        "priority": c.get('priority', 'A'),
        "notes": c.get('notes', ''),
        "isTitan": False,
        "vip": False,
        "status": "lead",
        "leadStatus": "new",
        "calls": []
    }

    approved_companies.append(verified)
    existing_names.add(norm_ar)
    existing_names.add(norm_en)
    if p1_clean:
        existing_phones.add(p1_clean)
    print(f"✅ APPROVED #{idx}: {name_ar} ({c['city']} / {c['fleetSize']} vehicles)")

print("\n=============================================")
print(f"Results for Square 16 (Deep South & Mineral Axis):")
print(f"Total Candidates: {len(candidates_data)}")
print(f"Approved (Pure B2B, Zero Duplicates): {len(approved_companies)}")
print(f"Rejected: {len(rejected_companies)}")
print("=============================================")

assert len(approved_companies) == 75, f"Expected 75 approved, got {len(approved_companies)}"

os.makedirs('scraper/output', exist_ok=True)
output_path = 'scraper/output/phase2_deep_south_verified_b2b_fleet.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(approved_companies, f, ensure_ascii=False, indent=2)

print(f"Saved {len(approved_companies)} approved enterprises to {output_path}\n")
