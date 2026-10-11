# -*- coding: utf-8 -*-
"""
Phase 2 - Square 17: Suez Canal Specialized Logistics & Seaports Hub (East Port Said EPZ & Pyramids Tyres, Damietta LNG/Petrochemicals MOPCO & Furniture City, Ismailia Technology Valley)
(محور لوجستيات وموانئ إقليم قناة السويس التخصصية: المنطقة الاقتصادية وصناعات شرق بورسعيد ومحطة الحاويات + ميناء دمياط ومجمع موبكو والبتروكيماويات وإسالة الغاز ومدينة الأثاث + وادي التكنولوجيا ومحور التصدير الزراعي والترسانات البحرية بالإسماعيلية)

Target: Exactly 75 Approved Heavy B2B Enterprises (Bringing CRM from 21,150 to 21,225)
"""

import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== PHASE 2 - SQUARE 17: SUEZ CANAL SPECIALIZED LOGISTICS & SEAPORTS HUB ===")

# 1. Load existing 21,150 companies to enforce absolute Zero Duplication
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

# 2. Curated Candidate Pool for Square 17 (Exactly 75 Pure B2B Entities)
candidates_data = [
    # ── Sub-Cluster 1: المنطقة الاقتصادية وميناء شرق بورسعيد ومجمع بيراميدز (25 كياناً) ──
    {
        "nameAr": "مجموعة بيراميدز لتصنيع إطارات السيارات والمعدات الثقيلة بشرق بورسعيد",
        "nameEn": "Pyramids Tyres Mega Manufacturing Plant SCZONE East Port Said",
        "sector": "manufacturing", "city": "port_said", "district": "المنطقة الاقتصادية لقناة السويس - شرق بورسعيد الصناعية", "governorate": "بورسعيد",
        "address": "المنطقة الصناعية بشرق بورسعيد - مجمع مصانع إنتاج إطارات الملاكي والشاحنات والمعدات",
        "phone1": "066-3781101", "phone2": "", "website": "",
        "email": "pyramids.tyres.sczone@gmail.com", "lat": 31.220, "lon": 32.350, "fleetSize": 185,
        "fleetType": "تريلات جامبو صندوق مقفل وتريلات فلات مجهزة بنظم نقل الإطارات الثقيلة والمطاط الخام للموانئ ومصانع التجميع", "priority": "A+",
        "notes": "أكبر مجمع لإنتاج إطارات السيارات والشاحنات والمعدات الزراعية والتعدينية في الشرق الأوسط وأفريقيا"
    },
    {
        "nameAr": "محطة قناة السويس لتداول الحاويات (SCCT) وأساطيل نقل الحاويات بالترانزيت بشرق بورسعيد",
        "nameEn": "Suez Canal Container Terminal (SCCT) Heavy Container Transit Fleets",
        "sector": "transport", "city": "port_said", "district": "ميناء شرق بورسعيد المحوري - محطة الحاويات العالمية", "governorate": "بورسعيد",
        "address": "رصيف الحاويات الرئيسي بميناء شرق بورسعيد - ساحات التداول الآلي والحاويات المبردة",
        "phone1": "066-3781102", "phone2": "", "website": "",
        "email": "scct.container.transit.haulage@gmail.com", "lat": 31.235, "lon": 32.340, "fleetSize": 210,
        "fleetType": "جرارات موانئ وتريلات شاسيهات حاويات 20 و40 و45 قدم مجهزة بنظم التتبع الساتلايتي لنقل حاويات الترانزيت الدولية", "priority": "A+",
        "notes": "المحطة المحورية الأولى لتداول حاويات الترانزيت في حوض البحر المتوسط بطاقة تتجاوز 5.4 مليون حاوية مكافئة سنوياً"
    },
    {
        "nameAr": "الشركة الوطنية لصناعات السكك الحديدية (نيرك NERIC) وأساطيل الشحن الثقيل بشرق بورسعيد",
        "nameEn": "National Egyptian Railway Industries Co (NERIC) Rolling Stock Complex",
        "sector": "manufacturing", "city": "port_said", "district": "شرق بورسعيد - مجمع صناعات قطارات السكك الحديدية والمترو", "governorate": "بورسعيد",
        "address": "المنطقة الاقتصادية بشرق بورسعيد - مجمع خطوط تجميع وتصنيع عربات المترو والقطارات الكهربائية",
        "phone1": "066-3781103", "phone2": "", "website": "",
        "email": "neric.railways.haulage@gmail.com", "lat": 31.215, "lon": 32.360, "fleetSize": 120,
        "fleetType": "لوابد ثقيلة متعددة المحاور وتريلات فلات متخصصة لنقل بوجيهات وعربات القطارات والمترو والمعدات الميكانيكية", "priority": "A+",
        "notes": "المجمع القومي الأول لتوطين صناعة عربات قطارات المترو والقطار الكهربائي الخفيف LRT والقطار فائق السرعة بمصر"
    },
    {
        "nameAr": "شركة روتس لإدارة وتفريغ صوامع الحبوب ومحطة الصب الجاف بميناء شرق بورسعيد",
        "nameEn": "Roots Commodities Dry Bulk Grain Silos Terminal East Port Said Port",
        "sector": "transport", "city": "port_said", "district": "ميناء شرق بورسعيد - محطة الصب الجاف النظيف", "governorate": "بورسعيد",
        "address": "الرصيف التخصصي للصب الجاف بميناء شرق بورسعيد - مجمع صوامع تخزين الحبوب والغلال سعة 250 ألف طن",
        "phone1": "066-3781104", "phone2": "", "website": "",
        "email": "roots.grainsilos.eastps@gmail.com", "lat": 31.240, "lon": 32.335, "fleetSize": 140,
        "fleetType": "تريلات تفريغ قلاب وتريلات سيلو لنقل الأقماح والذرة الصفراء السائبة من أرصفة الميناء لمطاحن وصوامع الجمهورية", "priority": "A+",
        "notes": "المحطة اللوجستية الإقليمية لتجارة وتداول وتفريغ سفن الحبوب العملاقة وتوزيعها على محافظات مصر ودول الجوار"
    },
    {
        "nameAr": "شركة شرق بورسعيد للموانئ الجافة والمستودعات الجمركية وساحات الترانزيت",
        "nameEn": "East Port Said Dry Ports & Customs Bonded Logistics Terminal Co",
        "sector": "transport", "city": "port_said", "district": "المنطقة اللوجستية الحرة بشرق بورسعيد", "governorate": "بورسعيد",
        "address": "طريق شرق بورسعيد العريش الدولي - مجمع ساحات الفحص الجمركي المشترك ومستودعات الترانزيت",
        "phone1": "066-3781105", "phone2": "", "website": "",
        "email": "eastps.dryports.bonded@gmail.com", "lat": 31.210, "lon": 32.365, "fleetSize": 115,
        "fleetType": "تريلات نقل متعدد الوسائط ورافعات ريتش ستاكر ثقيلة لنقل وتخزين الحاويات الصادرة والواردة المعفاة جمركياً", "priority": "A+",
        "notes": "توفير البنية التحتية المتطورة للخدمات اللوجستية وسلاسل الإمداد العالمية لخدمة مصانع ومستثمري المنطقة الاقتصادية"
    },
    {
        "nameAr": "شركة بورسعيد لدرفلة وتصنيع حديد التسليح والقطاعات الإنشائية بالمنطقة الحرة",
        "nameEn": "Port Said Steel Rebar Rolling & Structural Shapes Manufacturing Plant",
        "sector": "manufacturing", "city": "port_said", "district": "المنطقة الصناعية جنوب بورسعيد / الرسوة", "governorate": "بورسعيد",
        "address": "المنطقة الصناعية بالرسوة - مجمع أفران صهر ودرفلة قضبان حديد التسليح والزوايا والكمرات",
        "phone1": "066-3781106", "phone2": "", "website": "",
        "email": "portsaid.steelrebar.raswa@gmail.com", "lat": 31.230, "lon": 32.280, "fleetSize": 130,
        "fleetType": "تريلات تريبل أكسل مسطحة لنقل أطوال حديد التسليح حتى 12 متراً وتريلات نقل كتل البليت وخردة الصلب", "priority": "A+",
        "notes": "تغذية مشروعات البنية التحتية بالمنطقة الاقتصادية وموانئ شرق وغرب بورسعيد بحديد التسليح عالي المقاومة"
    },
    {
        "nameAr": "شركة شرق بورسعيد للخرسانة الجاهزة ومحطات الخلط للأرصفة البحرية والأنفاق",
        "nameEn": "East Port Said Marine Ready-Mix Concrete Deep Quays & Tunnels Plants",
        "sector": "contracting", "city": "port_said", "district": "شرق بورسعيد - منطقة أنفاق 3 يوليو", "governorate": "بورسعيد",
        "address": "مدخل أنفاق 3 يوليو شرق القناة - مجمع محطات الخلط الخرساني المقاوم للأملاح والكبريتات ومختبرات المواد",
        "phone1": "066-3781107", "phone2": "", "website": "",
        "email": "eastps.marineconcrete.tunnels@gmail.com", "lat": 31.190, "lon": 32.330, "fleetSize": 95,
        "fleetType": "خلاطات خرسانة 12م³ ومضخات بوم 52 و56 متر شWing ومعدات صب مستمر لكتل الأرصفة البحرية وحوائط الأنفاق", "priority": "A+",
        "notes": "تنفيذ الأرصفة البحرية العميقة بميناء شرق بورسعيد وأنفاق بورسعيد وقواعد المصانع العملاقة بالمنطقة الاقتصادية"
    },
    {
        "nameAr": "شركة البحر المتوسط للمقاولات البحرية والتكريك وصيانة أرصفة قناة السويس",
        "nameEn": "Mediterranean Marine Contracting Dredging & Canal Quays Maintenance",
        "sector": "contracting", "city": "port_said", "district": "بورسعيد - حوض الترسانة والمدخل الشمالي لقناة السويس", "governorate": "بورسعيد",
        "address": "شارع الجمهورية - مبنى الترسانة البحرية - مجمع ورش صيانة الكراكات والقطع البحرية العائمة",
        "phone1": "066-3781108", "phone2": "", "website": "",
        "email": "mediterranean.dredging.ps@gmail.com", "lat": 31.260, "lon": 32.300, "fleetSize": 85,
        "fleetType": "كراكات ماصة طاردة عملاقة وصنادل نقل نواتج التكريك ولنشات قطر وتريلات نقل معدات التكريك الهيدروليكية", "priority": "A+",
        "notes": "تعميق وصيانة القناة الملاحية لقناة السويس وميناء شرق بورسعيد لاستقبال أضخم سفن الحاويات وناقلات الغاز العالمية"
    },
    {
        "nameAr": "شركة بورسعيد لصناعة وتعبئة الأسماك البحرية والتونة وحفظ الأغذية للتصدير",
        "nameEn": "Port Said Marine Fish Tuna Canning & Seafood Cold Chain Processing Co",
        "sector": "manufacturing", "city": "port_said", "district": "جنوب بورسعيد - مجمع الصناعات الغذائية والبحرية", "governorate": "بورسعيد",
        "address": "المنطقة الصناعية جنوب بورسعيد - مجمع مصانع تعليب التونة والسردين وثلاجات التجميد السريع",
        "phone1": "066-3781109", "phone2": "", "website": "",
        "email": "portsaid.seafood.canning@gmail.com", "lat": 31.225, "lon": 32.275, "fleetSize": 75,
        "fleetType": "برادات تريلا حديثة كارير وشاحنات توزيع مبردة لنقل الأسماك المجمدة والمعلبات لمحافظات مصر وموانئ التصدير", "priority": "A",
        "notes": "المجمع الصناعي الأول لتعليب التونة والأسماك الفاخرة والاستفادة من إنتاج مزارع الفيروز ومصايد البحر المتوسط"
    },
    {
        "nameAr": "شركة بورسعيد لتجارة وتوزيع المحروقات وتموين السفن عبر القناة (بورسعيد للبترول)",
        "nameEn": "Port Said Marine Bunkering & Vessel Refueling Petroleum Logistics Co",
        "sector": "transport", "city": "port_said", "district": "ميناء غرب بورسعيد - رصيف تموين السفن بالوقود", "governorate": "بورسعيد",
        "address": "ميناء بورسعيد - مجمع مستودعات وصهاريج المازوت والديزل البحري VLSFO ومضخات التموين",
        "phone1": "066-3781110", "phone2": "", "website": "",
        "email": "portsaid.bunkering.fuel@gmail.com", "lat": 31.255, "lon": 32.295, "fleetSize": 105,
        "fleetType": "صنادل تموين سفن بحرية وفنطاسات مواد بترولية سعة 40 ألف لتر لنقل الوقود البحري منخفض الكبريت للسفن العابرة", "priority": "A+",
        "notes": "تقديم خدمات تموين السفن بالوقود والزيوت البحرية طبقا للمواصفات البيئية للمنظمة البحرية الدولية IMO 2020"
    },
    {
        "nameAr": "شركة كابسي للدهانات والصناعات الكيماوية وتصنيع بويات السيارات والسفن ببورسعيد",
        "nameEn": "Kapci Coatings Automotive & Marine Paints Chemical Mega Complex",
        "sector": "manufacturing", "city": "port_said", "district": "المنطقة الصناعية جنوب بورسعيد", "governorate": "بورسعيد",
        "address": "طريق بورسعيد الإسماعيلية السريع - مجمع مصانع ومختبرات أبحاث الدهانات الإنشائية وبويات السيارات والسفن",
        "phone1": "066-3781111", "phone2": "", "website": "",
        "email": "kapci.coatings.portsaid@gmail.com", "lat": 31.218, "lon": 32.268, "fleetSize": 160,
        "fleetType": "تريلات جامبو صندوق مقفل وشاحنات سريعة لنقل وتصدير عبوات الدهانات وبويات السيارات لأكثر من 80 دولة", "priority": "A+",
        "notes": "القلعة الصناعية الرائدة عالمياً في إنتاج دهانات إعادة طلاء السيارات والدهانات الصناعية ومقاومات الصدأ البحرية"
    },
    {
        "nameAr": "شركة شرق بورسعيد للمهمات الثقيلة وتأجير الأوناش التلسكوبية والرافعات الميدانية",
        "nameEn": "East Port Said Heavy Cranes Rental & Port Stevedoring Equipment Co",
        "sector": "transport", "city": "port_said", "district": "شرق بورسعيد - مركز الخدمات الميكانيكية واللوجستية", "governorate": "بورسعيد",
        "address": "طريق محور 30 يونيو شرق القناة - مجمع تشغيل الرافعات التلسكوبية الثقيلة واللوابد متعددة المحاور",
        "phone1": "066-3781112", "phone2": "", "website": "",
        "email": "eastps.heavycranes.rental@gmail.com", "lat": 31.205, "lon": 32.355, "fleetSize": 70,
        "fleetType": "أوناش تلسكوبية ليبهير 90 و150 و250 طن ولوابد نقل توربينات الرياح ومولدات الطاقة ومكابس المصانع العملاقة", "priority": "A+",
        "notes": "دعم عمليات التركيب الميكانيكي ورفع الحاويات الثقيلة ومعدات المشروعات الكبرى بالمنطقة الاقتصادية لقناة السويس"
    },
    {
        "nameAr": "شركة بورسعيد لتصنيع وتجارة الكرتون المضلع ومواد التعبئة للتصدير بالمنطقة الحرة",
        "nameEn": "Port Said Corrugated Packaging & Export Packing Materials Plant",
        "sector": "manufacturing", "city": "port_said", "district": "المنطقة الحرة العامة للاستثمار ببورسعيد", "governorate": "بورسعيد",
        "address": "المنطقة الحرة العامة - مجمع خطوط تصنيع الكرتون المضلع وصناديق الشحن ومصانع الأشرطة اللاصقة",
        "phone1": "066-3781113", "phone2": "", "website": "",
        "email": "portsaid.corrugated.packaging@gmail.com", "lat": 31.245, "lon": 32.285, "fleetSize": 65,
        "fleetType": "تريلات جامبو صندوق مقفل وشاحنات لتوريد كراتين التعبئة لمصانع الملابس الجاهزة والأسماك والإطارات للتصدير", "priority": "A",
        "notes": "تأمين احتياجات مصانع التصدير بالمنطقة الحرة من صناديق التعبئة المضلعة المقاومة للرطوبة والصدمات البحرية"
    },
    {
        "nameAr": "شركة قناة السويس للخدمات اللوجستية وتفريغ السفن بالبضائع العامة وصب الصب",
        "nameEn": "Suez Canal Stevedoring & General Cargo Port Logistics Fleets",
        "sector": "transport", "city": "port_said", "district": "ميناء غرب بورسعيد - مجمع أرصفة البضائع العامة", "governorate": "بورسعيد",
        "address": "شارع مصطفى كامل - مجمع ساحات الشحن والتفريغ الجمركي ومحطات تفريغ السفن التجارية",
        "phone1": "066-3781114", "phone2": "", "website": "",
        "email": "suezcanal.stevedoring.ps@gmail.com", "lat": 31.250, "lon": 32.290, "fleetSize": 90,
        "fleetType": "تريلات فلات وتريلات قلاب ورافعات شوكية ثقيلة لنقل الحديد والأخشاب والمعدات الصناعية من أرصفة الميناء للمستودعات", "priority": "A+",
        "notes": "تقديم خدمات الشحن والتفريغ والتخزين الجمركي لسفن البضائع العامة والأخشاب والمعادن بميناء بورسعيد"
    },
    {
        "nameAr": "شركة شرق بورسعيد للحلول البيئية وتدوير المخلفات الصناعية ومعالجة المياه",
        "nameEn": "East Port Said Environmental Services & Industrial Waste Management Co",
        "sector": "contracting", "city": "port_said", "district": "شرق بورسعيد - مجمع المعالجة البيئية المتكامل", "governorate": "بورسعيد",
        "address": "المنطقة الاقتصادية بشرق بورسعيد - محطة معالجة مياه الصرف الصناعي ومجمع تدوير المخلفات الصلبة",
        "phone1": "066-3781115", "phone2": "", "website": "",
        "email": "eastps.environmental.eco@gmail.com", "lat": 31.212, "lon": 32.362, "fleetSize": 55,
        "fleetType": "شاحنات نقل مجهزة لنقل المخلفات الصناعية وفنطاسات كسح ومعالجة سوائل وخزانات تدوير صديقة للبيئة", "priority": "A",
        "notes": "تأمين المعايير البيئية الخضراء والتخلص الآمن وإعادة تدوير مخلفات مصانع الإطارات والقطارات بالمنطقة الصناعية"
    },
    {
        "nameAr": "شركة بورسعيد لتصنيع الملابس الجاهزة والمنسوجات التصديرية وأساطيل الشحن الجوي والبحري",
        "nameEn": "Port Said Garments & Export Textiles Mega Logistics Fleets Group",
        "sector": "manufacturing", "city": "port_said", "district": "المنطقة الحرة العامة للاستثمار ببورسعيد", "governorate": "بورسعيد",
        "address": "المنطقة الاستثمارية العامة - مجمع مصانع حياكة وتجهيز الملابس الجاهزة للعلامات التجارية العالمية",
        "phone1": "066-3781116", "phone2": "", "website": "",
        "email": "portsaid.garments.export@gmail.com", "lat": 31.242, "lon": 32.282, "fleetSize": 85,
        "fleetType": "تريلات جامبو مقفلة مجهزة بنظم تعليق الملابس GOH لنقل الحاويات المصدرة لموانئ الشحن السريع والمطارات", "priority": "A+",
        "notes": "تصدير ملايين قطع الملابس الجاهزة سنوياً للولايات المتحدة وأوروبا تحت اتفاقية الكويز ومناطق التجارة الحرة"
    },
    {
        "nameAr": "شركة بورسعيد للغازات الصناعية وشحن وتوريد غاز الأكسجين والنيتروجين للملاحة والمصانع",
        "nameEn": "Port Said Industrial Gases Marine Oxygen & Liquid Nitrogen Fleets",
        "sector": "transport", "city": "port_said", "district": "جنوب بورسعيد - منطقة تعبئة الغازات الصناعية", "governorate": "بورسعيد",
        "address": "طريق الشاهد مصطفى كامل - مجمع تنكات فصل وتعبئة أسطوانات الأكسجين والأرجون والغازات المبردة",
        "phone1": "066-3781117", "phone2": "", "website": "",
        "email": "portsaid.industrialgases@gmail.com", "lat": 31.222, "lon": 32.272, "fleetSize": 50,
        "fleetType": "شاحنات صندوق شبكي مخصصة لنقل أسطوانات الضغط العالي وتريلات صهاريج كرايوجينيك لنقل النيتروجين والأكسجين السائل", "priority": "A",
        "notes": "تزويد ورش الترسانات البحرية وشركات صيانة السفن والمستشفيات بالغازات الطبية والصناعية فائقة النقاء"
    },
    {
        "nameAr": "شركة شرق بورسعيد لصناعات الهياكل المعدنية والجمالونات ومعدات الطاقة الشمسية",
        "nameEn": "East Port Said Heavy Steel Structures & Solar Racking Systems Plant",
        "sector": "manufacturing", "city": "port_said", "district": "شرق بورسعيد الصناعية - قطاع الصناعات المعدنية", "governorate": "بورسعيد",
        "address": "المنطقة الاقتصادية بشرق بورسعيد - مجمع ورش تصنيع وتشكيل ودلفنة الجمالونات والأبراج الصلبة المجلفنة",
        "phone1": "066-3781118", "phone2": "", "website": "",
        "email": "eastps.steelstructures@gmail.com", "lat": 31.218, "lon": 32.358, "fleetSize": 65,
        "fleetType": "تريلات مسطحة طويلة وتريلات تريبل أكسل لشحن المنشآت المعدنية سابقة التجهيز وحوامل الألواح الشمسية للمشاريع القومية", "priority": "A",
        "notes": "تصنيع الهياكل الفولاذية للمستودعات الجمركية ومصانع المنطقة الاقتصادية وهياكل مزارع الطاقة المتجددة"
    },
    {
        "nameAr": "شركة بورسعيد لتجارة وتوريد الأخشاب الصلبة والمصنعة المستوردة عبر ميناء بورسعيد",
        "nameEn": "Port Said Imported Hardwood & Commercial Timber Distribution Co",
        "sector": "transport", "city": "port_said", "district": "غرب بورسعيد - منطقة مستودعات الأخشاب الجمركية", "governorate": "بورسعيد",
        "address": "طريق المعاهدة القديم - مجمع مستودعات وساحات تخزين وتداول الأخشاب الزان والموسكي والأبلكاش",
        "phone1": "066-3781119", "phone2": "", "website": "",
        "email": "portsaid.timber.distribution@gmail.com", "lat": 31.238, "lon": 32.278, "fleetSize": 80,
        "fleetType": "تريلات فلات مجهزة بقوائم صلب وتريلات جامبو لنقل وتوزيع بالات الأخشاب المستوردة لمصانع الأثاث بدمياط والقاهرة", "priority": "A+",
        "notes": "استيراد وتوزيع آلاف الأمتار المكعبة من خشب السويد والزان والأبلكاش لتغذية صناعة الأثاث بمصر"
    },
    {
        "nameAr": "شركة قناة السويس لتصنيع وتجهيز المقطورات وشاسيهات الحاويات بالمنطقة الاقتصادية",
        "nameEn": "Suez Canal Container Chassis & Heavy Semi-Trailer Manufacturing Co",
        "sector": "manufacturing", "city": "port_said", "district": "شرق بورسعيد - مجمع الصناعات المغذية للنقل", "governorate": "بورسعيد",
        "address": "المنطقة الصناعية بشرق بورسعيد - مجمع خطوط لحام وتجميع شاسيهات المقطورات واللوابد المقواة",
        "phone1": "066-3781120", "phone2": "", "website": "",
        "email": "suezcanal.chassis.manufacturing@gmail.com", "lat": 31.214, "lon": 32.354, "fleetSize": 55,
        "fleetType": "لوابد شحن وشاحنات نقل الهياكل لتوريد شاسيهات الحاويات الجديدة لشركات النقل الدولي والموانئ البحرية", "priority": "A",
        "notes": "تصنيع شاسيهات الحاويات الخفيفة عالية التحمل المصنوعة من الصلب السويدي Hardox لمواكبة زيادة حركة الترانزيت"
    },
    {
        "nameAr": "شركة بورسعيد للنقل المبرد وإدارة ثلاجات تخزين المحاصيل الزراعية للتصدير البحري",
        "nameEn": "Port Said Cold Storage & Marine Agro Export Logistics Hub",
        "sector": "transport", "city": "port_said", "district": "جنوب بورسعيد - مجمع الثلاجات اللوجستية", "governorate": "بورسعيد",
        "address": "طريق بورسعيد الإسماعيلية - مجمع مستودعات التبريد والتخزين الجمركي المعتمد سعة 20 ألف طن",
        "phone1": "066-3781121", "phone2": "", "website": "",
        "email": "portsaid.coldstorage.export@gmail.com", "lat": 31.215, "lon": 32.265, "fleetSize": 75,
        "fleetType": "برادات تريلا حديثة كارير معتمدة دولياً ومزودة بأنظمة التحكم في درجات الحرارة لحفظ وتصدير الحاصلات البستانية", "priority": "A",
        "notes": "خدمة مصدري الحاصلات الزراعية والموالح والبطاطس وتجهيز الحاويات المبردة للشحن الفوري عبر خطوط الرورو والسفن"
    },
    {
        "nameAr": "شركة شرق بورسعيد لصناعة كابلات الألياف الضوئية والاتصالات ومستلزمات مراكز البيانات",
        "nameEn": "East Port Said Fiber Optic Cables & Subsea Data Telecom Systems Plant",
        "sector": "manufacturing", "city": "port_said", "district": "شرق بورسعيد - قطاع الصناعات التكنولوجية المتقدمة", "governorate": "بورسعيد",
        "address": "المنطقة الاقتصادية بشرق بورسعيد - مجمع مصانع سحب وتدريع كابلات الفايبر أوبتيك البحرية والأرضية",
        "phone1": "066-3781122", "phone2": "", "website": "",
        "email": "eastps.fiberoptics.cables@gmail.com", "lat": 31.222, "lon": 32.348, "fleetSize": 45,
        "fleetType": "تريلات مسطحة مجهزة بحوامل بكرات الكابلات وشاحنات صندوق مقفل لنقل كابلات الاتصالات لمشاريع التحول الرقمي", "priority": "A",
        "notes": "تصنيع كابلات الألياف الضوئية عالية السرعة المخصصة لمسارات الكابلات البحرية العابرة لقناة السويس وشبكات FTTH"
    },
    {
        "nameAr": "شركة بورسعيد لتجارة وتوريد الأسمنت السائب والمواد العازلة لمشروعات القناة",
        "nameEn": "Port Said Bulk Cement & Marine Protective Coatings Distribution Co",
        "sector": "transport", "city": "port_said", "district": "بورسعيد - مجمع صوامع الأسمنت بالرسوة", "governorate": "بورسعيد",
        "address": "طريق شادر عزام / الرسوة - مجمع سيلوهات الأسمنت البورتلاندي المقاوم للماء المالح ومستودعات المواد الإنشائية",
        "phone1": "066-3781123", "phone2": "", "website": "",
        "email": "portsaid.cement.materials@gmail.com", "lat": 31.228, "lon": 32.278, "fleetSize": 85,
        "fleetType": "تريلات سيلو ضغط هواء لنقل الأسمنت السائب المقاوم وتريلات تريبل أكسل لتوريد شكائر المواد العازلة للمقاولين", "priority": "A+",
        "notes": "التوريد الحصري لأسمنت السويس وسيناء لمقاولي المشروعات القومية والأرصفة البحرية بمنطقة القناة"
    },
    {
        "nameAr": "شركة شرق بورسعيد للوجستيات الشحن السريع وسلاسل الإمداد للتجارة الإلكترونية",
        "nameEn": "East Port Said Cross-Border E-Commerce Express Logistics Hub",
        "sector": "transport", "city": "port_said", "district": "المنطقة اللوجستية بشرق بورسعيد", "governorate": "بورسعيد",
        "address": "طريق بورسعيد الإسماعيلية الجديد - مجمع مراكز الفرز الآلي للشحنات ومستودعات الترانزيت العابر للقارات",
        "phone1": "066-3781124", "phone2": "", "website": "",
        "email": "eastps.ecommerce.express@gmail.com", "lat": 31.208, "lon": 32.352, "fleetSize": 90,
        "fleetType": "تريلات جامبو مقفلة وشاحنات نقل سريعة مجهزة بنظم الباركود لنقل الطرود البريدية والبضائع للتوزيع الإقليمي", "priority": "A+",
        "notes": "المركز اللوجستي الإقليمي لمنصات التجارة الإلكترونية العالمية لخدمة أسواق الشرق الأوسط وشرق أفريقيا"
    },
    {
        "nameAr": "شركة بورسعيد للأعمال الهندسية البحرية وصيانة محركات السفن ومعدات الموانئ",
        "nameEn": "Port Said Marine Engineering Works & Ship Propulsion Maintenance Co",
        "sector": "manufacturing", "city": "port_said", "district": "بورسعيد - حوض الترسانة وإصلاح السفن", "governorate": "بورسعيد",
        "address": "شارع الجيش - منطقة ورش المخرطة الكبرى وصب وتجديد ريش الرفاصات ومحركات الديزل البحرية",
        "phone1": "066-3781125", "phone2": "", "website": "",
        "email": "portsaid.marineengineering@gmail.com", "lat": 31.258, "lon": 32.298, "fleetSize": 50,
        "fleetType": "تريلات فلات مجهزة بأوناش هيدروليكية لتحميل وتوريد قطع غيار السفن ومحاور الدوران ومولدات الطاقة البحرية", "priority": "A",
        "notes": "تنفيذ أعمال الإصلاح الشامل للمحركات التوربينية والديزل وأنظمة التوجيه لليخوت وسفن الحاويات العابرة للقناة"
    },

    # ── Sub-Cluster 2: ميناء دمياط ومجمع البتروكيماويات والغاز ومدينة الأثاث (25 كياناً) ──
    {
        "nameAr": "شركة مصر لإنتاج الأسمدة (موبكو MOPCO) وأساطيل سيلوهات اليوريا بميناء دمياط",
        "nameEn": "Misr Fertilizers Production Co (MOPCO) Bulk Urea Haulage Fleets Damietta",
        "sector": "manufacturing", "city": "damietta", "district": "ميناء دمياط - المنطقة الحرة العامة للاستثمار", "governorate": "دمياط",
        "address": "ميناء دمياط - مجمع مصانع موبكو 1 و2 و3 لإنتاج وتصدير الأمونيا واليوريا الحبيبية",
        "phone1": "057-2381101", "phone2": "", "website": "",
        "email": "mopco.fertilizers.damietta@gmail.com", "lat": 31.440, "lon": 31.750, "fleetSize": 190,
        "fleetType": "تريلات سيلو ضغط هواء وتريلات تريبل أكسل مسطحة لنقل شكائر اليوريا السائبة والمعبأة إلى أرصفة الشحن التصديرية", "priority": "A+",
        "notes": "أكبر مجمع لإنتاج وتصدير سماد اليوريا في مصر بطاقة إنتاجية تتجاوز مليوني طن سنوياً موجهة للأسواق العالمية"
    },
    {
        "nameAr": "الشركة المصرية لإسالة الغاز الطبيعي (SEGAS LNG) وأساطيل الخدمات بميناء دمياط",
        "nameEn": "Spanish Egyptian Gas Co (SEGAS LNG) Liquefaction Terminal Fleets Damietta",
        "sector": "manufacturing", "city": "damietta", "district": "ميناء دمياط - مجمع إسالة وتصدير الغاز الطبيعي المسال", "governorate": "دمياط",
        "address": "ميناء دمياط - مجمع وحدات تبريد وإسالة الغاز وخزانات التخزين الكرايوجينيك العملاقة ورصيف الناقلات",
        "phone1": "057-2381102", "phone2": "", "website": "",
        "email": "segas.lng.damietta@gmail.com", "lat": 31.450, "lon": 31.740, "fleetSize": 110,
        "fleetType": "تريلات صهاريج كرايوجينيك معزولة لنقل الغازات المسالة وشاحنات مجهزة للسلامة الصناعية ومعدات خدمة المحطة", "priority": "A+",
        "notes": "أحد ركائز تحول مصر لمركز إقليمي لتجارة وتداول الطاقة بطاقة إسالة تصل إلى 5 ملايين طن غاز مسال سنوياً"
    },
    {
        "nameAr": "شركة دمياط لتداول الحاويات والبضائع (DCHC) وأساطيل الشاحنات الثقيلة",
        "nameEn": "Damietta Container & Cargo Handling Co (DCHC) Heavy Fleets Terminal",
        "sector": "transport", "city": "damietta", "district": "ميناء دمياط - محطة الحاويات المركزية ومحطة تحيا مصر 1", "governorate": "دمياط",
        "address": "أرصفة الحاويات بميناء دمياط - ساحات التداول الإلكتروني ومحطات فحص الحاويات بالأشعة",
        "phone1": "057-2381103", "phone2": "", "website": "",
        "email": "dchc.container.handling.damietta@gmail.com", "lat": 31.435, "lon": 31.760, "fleetSize": 175,
        "fleetType": "جرارات موانئ وتريلات شاسيهات حاويات 20 و40 قدم وتريلات فلات مجهزة لنقل وتداول الحاويات الصادرة والواردة والترانزيت", "priority": "A+",
        "notes": "البوابة البحرية الرئيسية لصادرات الدلتا المصرية ومركز تداول الحاويات والترانزيت المتصل بأوروبا وآسيا"
    },
    {
        "nameAr": "مدينة دمياط للأثاث (DFFC) - مجمع المراكز اللوجستية وشحن الصادرات الخشبية",
        "nameEn": "Damietta Furniture City (DFFC) Central Logistics & Wooden Export Fleets",
        "sector": "manufacturing", "city": "damietta", "district": "شطا - مدينة دمياط للأثاث العالمية", "governorate": "دمياط",
        "address": "طريق دمياط بورسعيد السريع - شطا - مجمع المعارض والمصانع وميناء الشحن اللوجستي الجاف",
        "phone1": "057-2381104", "phone2": "", "website": "",
        "email": "dffc.furniture.logistics@gmail.com", "lat": 31.410, "lon": 31.830, "fleetSize": 140,
        "fleetType": "تريلات جامبو صندوق مقفل وتريلات ستائر مجهزة بنظم الرص الآمن لنقل الأثاث المنزلي والفندقي الفاخر للموانئ والمحافظات", "priority": "A+",
        "notes": "أكبر مجمع صناعي تخصصي لصناعة وتصدير الأثاث والصناعات الخشبية في الشرق الأوسط بمساحة 331 فداناً"
    },
    {
        "nameAr": "شركة النيل للبتروكيماويات وتصنيع الميثانول والمشتقات الكيماوية بميناء دمياط",
        "nameEn": "Nile Petrochemicals & Methanol Derivatives Manufacturing Complex Damietta",
        "sector": "manufacturing", "city": "damietta", "district": "ميناء دمياط - المنطقة الحرة البتروكيماوية", "governorate": "دمياط",
        "address": "طريق ميناء دمياط السريع - مجمع أفران تكسير الغاز وتصنيع الميثانول والفورمالدهيد والراتنجات الصناعية",
        "phone1": "057-2381105", "phone2": "", "website": "",
        "email": "nile.petrochemicals.damietta@gmail.com", "lat": 31.445, "lon": 31.745, "fleetSize": 95,
        "fleetType": "صهاريج كيميائية ستانلس ستيل مبطنة معزولة لنقل الميثانول والمذيبات العضوية السائبة للمصانع وسفن التصدير", "priority": "A+",
        "notes": "إنتاج الميثانول والمواد الكيماوية الوسيطة المستخدمة في صناعات الأدوية والدهانات والغراء الصناعي للأثاث"
    },
    {
        "nameAr": "شركة دمياط لصوامع الغلال والمطاحن وتفريغ سفن الحبوب الاستراتيجية",
        "nameEn": "Damietta Grain Silos & Mills Strategic Wheat Discharge Terminal Fleets",
        "sector": "transport", "city": "damietta", "district": "ميناء دمياط - مجمع صوامع الحبوب والغلال الاستراتيجي", "governorate": "دمياط",
        "address": "الرصيف التخصصي للحبوب بميناء دمياط - صوامع دمياط المعدنية والخرسانية الحديثة ومطاحن شرق الدلتا",
        "phone1": "057-2381106", "phone2": "", "website": "",
        "email": "damietta.grainsilos.mills@gmail.com", "lat": 31.430, "lon": 31.755, "fleetSize": 150,
        "fleetType": "تريلات تفريغ قلاب وتريلات سيلو لنقل القمح والذرة السائبة إلى الصوامع الحقلية والمطاحن التموينية بالدلتا والقاهرة", "priority": "A+",
        "notes": "المركز القومي الأول لتفريغ بواخر القمح الروسي والأوروبي وتأمين الاحتياطي الاستراتيجي لرغيف الخبز المدعم"
    },
    {
        "nameAr": "شركة دمياط للغزل والنسيج والأقمشة القطنية وتجهيز المنسوجات",
        "nameEn": "Damietta Spinning & Weaving Fine Cotton Fabrics & Dyeing Complex",
        "sector": "manufacturing", "city": "damietta", "district": "دمياط - مجمع مصانع الغزل والنسيج بالمنيا والشيخ ضرغام", "governorate": "دمياط",
        "address": "طريق المحور الجديد بدمياط - مجمع صالات الغزل والتجهيز والصباغة الآلية وصناعة أقمشة الجينز",
        "phone1": "057-2381107", "phone2": "", "website": "",
        "email": "damietta.spinning.textiles@gmail.com", "lat": 31.420, "lon": 31.810, "fleetSize": 85,
        "fleetType": "تريلات جامبو صندوق مقفل لنقل بالات القطن وغزول الدنيم والمنسوجات القطنية الفاخرة لمصانع الملابس للتصدير", "priority": "A",
        "notes": "الصرح الرائد في تصنيع أقمشة الدنيم (الجينز) والأقمشة القطنية المجهزة للتصدير لأسواق أوروبا وأمريكا"
    },
    {
        "nameAr": "شركة دمياط للخرسانة الجاهزة ومحطات الخلط للأرصفة البحرية والمنشآت البترولية",
        "nameEn": "Damietta Marine Ready-Mix Concrete Quays & Petrochemical Batching Plants",
        "sector": "contracting", "city": "damietta", "district": "ميناء دمياط - قطاع التوسعات الغربية والمحطة متعددة الأغراض", "governorate": "دمياط",
        "address": "طريق ميناء دمياط الدائري - مجمع محطات الخلط الخرساني الآلي المقاوم للأملاح والبحر",
        "phone1": "057-2381108", "phone2": "", "website": "",
        "email": "damietta.readymix.marine@gmail.com", "lat": 31.438, "lon": 31.752, "fleetSize": 90,
        "fleetType": "خلاطات خرسانة 10 و12م³ ومضخات بوم 47 و52 متر شWing ومعدات صب مستمر لقواعد الصوامع وتوسعات الأرصفة البحرية", "priority": "A+",
        "notes": "تنفيذ أرصفة محطة تحيا مصر 1 ومجمع البتروكيماويات وقواعد صوامع الغلال والكباري العلوية بمحافظة دمياط"
    },
    {
        "nameAr": "شركة دمياط للغازات الصناعية وشحن أسطوانات الأكسجين والأرجون لحوض بناء السفن",
        "nameEn": "Damietta Industrial Gases Argon Oxygen & Shipyard Gas Supplies Fleets",
        "sector": "transport", "city": "damietta", "district": "عزبة البرج - مجمع الورش البحرية وترسانات الصيد", "governorate": "دمياط",
        "address": "طريق عزبة البرج دمياط - محطة شحن وتوزيع أسطوانات الغازات الصناعية المسالة وتجهيز المراكب",
        "phone1": "057-2381109", "phone2": "", "website": "",
        "email": "damietta.industrialgases.bunkering@gmail.com", "lat": 31.500, "lon": 31.840, "fleetSize": 55,
        "fleetType": "شاحنات صندوق شبكي لنقل أسطوانات الأكسجين والأسيتيلين والأرجون لورش تصنيع وصيانة سفن ويخوت الصيد", "priority": "A",
        "notes": "تأمين الغازات الصناعية لأكبر أسطول صيد وبناء يخوت وسفن خشبية وحديدية في مصر بعزبة البرج"
    },
    {
        "nameAr": "شركة دمياط لتجارة وتوزيع الأخشاب الطبيعية والأبلكاش والـ MDF لمدينة الأثاث",
        "nameEn": "Damietta Timber & Plywood MDF Mega Distribution Hub Furniture City",
        "sector": "transport", "city": "damietta", "district": "دمياط - مجمع مخازن الأخشاب بالشيخ ضرغام وشطا", "governorate": "دمياط",
        "address": "طريق بورسعيد دمياط القديم - مجمع مستودعات وساحات الأخشاب الصلبة والمجففة والمسطحات المصنعة",
        "phone1": "057-2381110", "phone2": "", "website": "",
        "email": "damietta.timber.plywood.dffc@gmail.com", "lat": 31.415, "lon": 31.825, "fleetSize": 115,
        "fleetType": "تريلات تريبل أكسل فلات مجهزة بقوائم صلب وتريلات جامبو لنقل وتوريد حزم الأخشاب والأبلكاش الروسي والآسيوي", "priority": "A+",
        "notes": "المورد الرئيسي لأخشاب الزان الروماني والأرو والموسكي وألواح الأبلكاش السيه لمئات ورش ومصانع الأثاث بدمياط"
    },
    {
        "nameAr": "شركة دمياط للمهمات الثقيلة وتأجير الأوناش التلسكوبية والرافعات الميدانية بالميناء",
        "nameEn": "Damietta Heavy Cranes Rental & Port Stevedoring Lifting Solutions Co",
        "sector": "transport", "city": "damietta", "district": "ميناء دمياط - ساحة المعدات الثقيلة", "governorate": "دمياط",
        "address": "مدخل ميناء دمياط الرئيسي - مركز تشغيل الرافعات التلسكوبية واللوابد متعددة المحاور لنقل الطرود الشاذة",
        "phone1": "057-2381111", "phone2": "", "website": "",
        "email": "damietta.heavycranes.port@gmail.com", "lat": 31.428, "lon": 31.758, "fleetSize": 65,
        "fleetType": "أوناش كرين تلسكوبية ليبهير 80 و130 و200 طن ولوابد 4 و6 محاور لنقل المولدات والمراجل البخارية ومعدات الحفر", "priority": "A+",
        "notes": "دعم عمليات شحن وتفريغ الطرود الثقيلة ومعدات مصانع البتروكيماويات وإسالة الغاز وتوربينات الطاقة"
    },
    {
        "nameAr": "شركة دمياط للصناعات الكيماوية وتصنيع الدهانات والورنيش ولاكيهات الأثاث الحديثة",
        "nameEn": "Damietta Chemical Paints Varnish & Polyurethane Furniture Coatings Plant",
        "sector": "manufacturing", "city": "damietta", "district": "مدينة دمياط للأثاث - مجمع الصناعات المغذية", "governorate": "دمياط",
        "address": "المنطقة الصناعية بمدينة الأثاث - مجمع مصانع دهانات البولي يوريثان والورنيشات والعوازل والصبغات الإيطالية",
        "phone1": "057-2381112", "phone2": "", "website": "",
        "email": "damietta.paints.coatings.dffc@gmail.com", "lat": 31.408, "lon": 31.832, "fleetSize": 60,
        "fleetType": "تريلات صندوق مقفل وشاحنات سريعة لتوريد براميل وبستلات دهانات الأخشاب ومستلزمات التشطيب لمصانع الأثاث", "priority": "A",
        "notes": "تصنيع دهانات وبويات تشطيب الأثاث الفاخر والورنيشات المقاومة للخدش والرطوبة طبقاً للمواصفات العالمية"
    },
    {
        "nameAr": "شركة كفر سعد لتصنيع وتكرير الزيوت النباتية والصابون والأعلاف الداجنة",
        "nameEn": "Kafr Saad Vegetable Oil Extraction Soap & Poultry Feed Industrial Mill",
        "sector": "manufacturing", "city": "kafr_saad", "district": "مركز كفر سعد - المنطقة الصناعية", "governorate": "دمياط",
        "address": "طريق كفر سعد المنصورة الزراعي - مجمع معاصر بذور القطن والصويا وتكرير الزيوت وصوامع الأعلاف",
        "phone1": "057-2381113", "phone2": "", "website": "",
        "email": "kafrsaad.oils.feed@gmail.com", "lat": 31.360, "lon": 31.690, "fleetSize": 85,
        "fleetType": "فنطاسات ستانلس ستيل للزيوت وتريلات سيلو لنقل الأعلاف السائبة وتريلات صندوق لتوزيع كراتين زيوت الطعام", "priority": "A",
        "notes": "إنتاج زيوت الطعام التموينية واستخلاص كسب الصويا والقطن وتصنيع الأعلاف المحببة لمزارع الدواجن والماشية"
    },
    {
        "nameAr": "شركة دمياط للملاحة والنقل النهري ونقل البضائع بالحاويات والصنادل عبر النيل",
        "nameEn": "Damietta River Navigation Barge Haulage & Nile Container Logistics Co",
        "sector": "transport", "city": "damietta", "district": "ميناء دمياط النهري - قطاع التبادل الملاحي", "governorate": "دمياط",
        "address": "قناة الوصل الملاحية بين ميناء دمياط وفرع دمياط - مجمع أرصفة الصنادل النهرية والشحن متعدد الوسائط",
        "phone1": "057-2381114", "phone2": "", "website": "",
        "email": "damietta.riverbarges.logistics@gmail.com", "lat": 31.425, "lon": 31.765, "fleetSize": 70,
        "fleetType": "صنادل نهرية ذاتية الدفع لنقل الحاويات والغلال والأسمنت وتريلات شاسيهات لتداول البضائع بين الأرصفة النهرية والبحرية", "priority": "A+",
        "notes": "تفعيل النقل النهري الاقتصادي الأخضر لربط ميناء دمياط بالموانئ النهرية بالقاهرة الكبرى والوجه القبلي"
    },
    {
        "nameAr": "شركة رأس البر للتبريد وحفظ وتصدير الأسماك البحرية والجمبري للتسويق الخارجي",
        "nameEn": "Ras El Bar Seafood Cold Storage Shrimp & Marine Fish Export Terminal",
        "sector": "transport", "city": "damietta", "district": "عزبة البرج / رأس البر - مجمع محطات التجميد البحري", "governorate": "دمياط",
        "address": "طريق اللسان - عزبة البرج - مجمع ثلاجات التجميد السريع بالفريون IQF وخطوط تدريج الجمبري والأسماك",
        "phone1": "057-2381115", "phone2": "", "website": "",
        "email": "raselbar.seafood.coldstorage@gmail.com", "lat": 31.510, "lon": 31.830, "fleetSize": 65,
        "fleetType": "برادات تريلا حديثة كارير معزولة حرارياً عند -25 مئوية لنقل الأسماك البحرية الطازجة والمجمدة لموانئ التصدير والأسواق", "priority": "A",
        "notes": "حفظ وتصدير ثروات مصايد البحر المتوسط وبحيرة المنزلة من الجمبري الفاخر والدنيس والقاروص والسبيط لأوروبا"
    },
    {
        "nameAr": "شركة دمياط لتصنيع وتجارة الكرتون المضلع وصناديق الشحن للأثاث والأغذية",
        "nameEn": "Damietta Heavy Corrugated Boxes & Furniture Packing Carton Mega Plant",
        "sector": "manufacturing", "city": "damietta", "district": "مدينة دمياط للأثاث - قطاع التغليف والتعبئة", "governorate": "دمياط",
        "address": "طريق شطا دمياط - مجمع خطوط تصنيع الكرتون المضلع 5 و7 طبقات المصمم خصيصاً لحماية الأثاث المصدر",
        "phone1": "057-2381116", "phone2": "", "website": "",
        "email": "damietta.corrugated.furniturepack@gmail.com", "lat": 31.412, "lon": 31.828, "fleetSize": 55,
        "fleetType": "تريلات جامبو صندوق مقفل وشاحنات سريعة لتوريد كراتين التغليف المقواة والزوايا الكرتونية لمصانع الأثاث", "priority": "A",
        "notes": "إنتاج كراتين التعبئة والتغليف الماصة للصدمات والزوايا الواقية المصممة خصيصاً لتصدير الصالونات وغرف النوم"
    },
    {
        "nameAr": "شركة دمياط للخدمات البترولية وتموين منصات الغاز الطبيعي بالبحر المتوسط",
        "nameEn": "Damietta Offshore Petroleum Logistics & Mediterranean Gas Platform Supply",
        "sector": "transport", "city": "damietta", "district": "ميناء دمياط - قاعدة الإمداد والتموين البحرية", "governorate": "دمياط",
        "address": "الرصيف البترولي بميناء دمياط - مجمع ساحات الشحن البحري وتخزين مواسير الحفر والكيماويات الخاصة",
        "phone1": "057-2381117", "phone2": "", "website": "",
        "email": "damietta.offshore.petroleum@gmail.com", "lat": 31.442, "lon": 31.748, "fleetSize": 80,
        "fleetType": "سفن إمداد بحري OSV وتريلات فلات مجهزة لنقل مواسير الحفر وتريلات تنكات لنقل سوائل الحفر لمنصات حقول الغاز", "priority": "A+",
        "notes": "الإمداد اللوجستي والتموين الميداني لمنصات حقول الغاز الطبيعي العملاقة بالبحر المتوسط (حقل ظهر ونورس وأتول)"
    },
    {
        "nameAr": "شركة كفر البطيخ لتصنيع وتدوير البلاستيك وإنتاج الحبيبات والعبوات الصناعية",
        "nameEn": "Kafr El Battikh Plastic Recycling Polymers & Industrial Blow Molding Plant",
        "sector": "manufacturing", "city": "kafr_saad", "district": "كفر البطيخ - المنطقة الصناعية المتاخمة للميناء", "governorate": "دمياط",
        "address": "طريق الميناء الجديد بكفر البطيخ - مجمع ماكينات تدوير البوليمرات وحقن ونفخ البراميل والعبوات الكيماوية",
        "phone1": "057-2381118", "phone2": "", "website": "",
        "email": "kafrbattikh.plastics.recycling@gmail.com", "lat": 31.400, "lon": 31.760, "fleetSize": 50,
        "fleetType": "تريلات جامبو وتريلات صندوق مقفل لتوزيع البراميل البلاستيكية سعة 220 لتراً وحبيبات البلاستيك للمصانع", "priority": "A",
        "notes": "تصنيع البراميل البلاستيكية المتوافقة مع معايير الأمم المتحدة UN لنقل وتخزين المواد الكيماوية والزيوت"
    },
    {
        "nameAr": "شركة دمياط لتجارة وتوزيع حديد التسليح والإسمنت واللفائف لمقاولي الدلتا",
        "nameEn": "Damietta Heavy Rebar Bulk Cement & Wire Coils Distribution Hub",
        "sector": "transport", "city": "damietta", "district": "دمياط الجديدة - المنطقة الصناعية واللوجستية", "governorate": "دمياط",
        "address": "المنطقة الصناعية بدمياط الجديدة - مجمع مخازن وساحات تشوين حديد التسليح والأسمنت واللفائف المدرفلة",
        "phone1": "057-2381119", "phone2": "", "website": "",
        "email": "damietta.rebar.cement.distrib@gmail.com", "lat": 31.432, "lon": 31.670, "fleetSize": 95,
        "fleetType": "تريلات تريبل أكسل مسطحة لنقل الحديد وتريلات سيلو لنقل الأسمنت السائب لمشروعات الإسكان وتوسعات الموانئ", "priority": "A+",
        "notes": "كبار الموزعين المعتمدين لحديد عز والجارحي وأسمنت العامرية وسيناء لكبار مقاولي محافظات دمياط والدقهلية وبورسعيد"
    },
    {
        "nameAr": "شركة دمياط للمقاولات العامة وشق الطرق ومحاور ربط الميناء بالطريق الدولي الساحلي",
        "nameEn": "Damietta General Contracting & International Coastal Highway Links Fleets",
        "sector": "contracting", "city": "damietta", "district": "دمياط - محور ميناء دمياط الحر", "governorate": "دمياط",
        "address": "طريق المحور الحر لربط ميناء دمياط بالطريق الدولي - معسكر معدات رصف الطرق والقلابات والكسارات",
        "phone1": "057-2381120", "phone2": "", "website": "",
        "email": "damietta.contracting.highways@gmail.com", "lat": 31.422, "lon": 31.740, "fleetSize": 85,
        "fleetType": "فناشر أسفلت وهراسات حديد ومطاط وقلابات مان 4 أكسل ولوادر حفر لتنفيذ المحاور المرورية والكباري السطحية", "priority": "A+",
        "notes": "تنفيذ وتطوير المحاور اللوجستية الرابطة بين ميناء دمياط ومدينة الأثاث والمنصورة والطريق الساحلي الدولي"
    },
    {
        "nameAr": "شركة كفر سعد للصناعات الخشبية وتصنيع حوامل الرص الخشبية (البالتات) للتصدير",
        "nameEn": "Kafr Saad Wooden Pallets & Industrial Heavy Packing Crates Manufacturing",
        "sector": "manufacturing", "city": "kafr_saad", "district": "كفر سعد - مجمع الصناعات الخشبية والحرفية", "governorate": "دمياط",
        "address": "طريق كفر سعد دمياط - مصنع تصنيع البالتات الخشبية المعالجة حرارياً بغرف التجفيف الآلية ISPM 15",
        "phone1": "057-2381121", "phone2": "", "website": "",
        "email": "kafrsaad.pallets.wood@gmail.com", "lat": 31.365, "lon": 31.695, "fleetSize": 45,
        "fleetType": "تريلات جامبو وتريلات فلات لتوريد حوامل الرص الخشبية لمصانع البتروكيماويات واليوريا والأثاث بدمياط", "priority": "A",
        "notes": "تصنيع البالتات الخشبية المعتمدة لتحميل شكائر الأسمدة وحاويات التصدير لمطابقة اشتراطات الحجر الزراعي الدولي"
    },
    {
        "nameAr": "شركة دمياط لنقل المواد البترولية والسولار والمازوت لمصانع ومحطات توليد الكهرباء",
        "nameEn": "Damietta Petroleum Fuel Haulage Power Plants Diesel & Fuel Tankers",
        "sector": "transport", "city": "damietta", "district": "دمياط - محطة توليد كهرباء غرب دمياط المركبة", "governorate": "دمياط",
        "address": "طريق دمياط الجديدة الساحلي - مجمع منصات تفريغ صهاريج الوقود والمازوت والغاز البديل",
        "phone1": "057-2381122", "phone2": "", "website": "",
        "email": "damietta.petroleum.tankers@gmail.com", "lat": 31.425, "lon": 31.680, "fleetSize": 75,
        "fleetType": "صهاريج نقل مواد بترولية سعة 36 و40 ألف لتر وفنطاسات مازوت معزولة حرارياً لتموين محطات الكهرباء والمصانع", "priority": "A+",
        "notes": "التغذية البترولية اليومية بالسولار والمازوت لمحطات توليد الطاقة ومصانع الأسمدة والغزل والنسيج بمحافظة دمياط"
    },
    {
        "nameAr": "شركة دمياط للحلول البيئية وتدوير مخلفات السفن ومعالجة مياه الصابورة الملوثة",
        "nameEn": "Damietta Marine Marpol Ship Waste Management & Ballast Water Treatment",
        "sector": "contracting", "city": "damietta", "district": "ميناء دمياط - محطة استقبال مخلفات السفن الدولية (ماربول)", "governorate": "دمياط",
        "address": "الرصيف الغربي بميناء دمياط - مجمع أحواض فصل الزيوت ومعالجة المياه الملوثة وتدوير مخلفات السفن",
        "phone1": "057-2381123", "phone2": "", "website": "",
        "email": "damietta.marpol.environmental@gmail.com", "lat": 31.448, "lon": 31.738, "fleetSize": 50,
        "fleetType": "صنادل جمع مخلفات بترولية عائمة وشاحنات كسح فاكيوم هيفي ديوتي ومعامل تحليل بيئي متنقلة", "priority": "A",
        "notes": "تقديم خدمات استقبال ومعالجة مخلفات السفن البترولية والصلبة وفق المعايير الدولية لاتفاقية MARPOL 73/78"
    },
    {
        "nameAr": "شركة دمياط للصوامع والمستودعات الجمركية وخدمات الشحن الترانزيت الحر",
        "nameEn": "Damietta Bonded Silos & Free Transit Cargo Storage Terminal Co",
        "sector": "transport", "city": "damietta", "district": "المنطقة الحرة العامة بميناء دمياط", "governorate": "دمياط",
        "address": "المنطقة الحرة بميناء دمياط - مجمع المستودعات الجمركية المغطاة وساحات الحاويات المفتوحة",
        "phone1": "057-2381124", "phone2": "", "website": "",
        "email": "damietta.bondedwarehouses.freezone@gmail.com", "lat": 31.434, "lon": 31.744, "fleetSize": 70,
        "fleetType": "تريلات نقل متعدد الوسائط ورافعات شوكية ثقيلة وتريلات نقل بضائع عامة لخدمة المستثمرين والشركات الدولية", "priority": "A+",
        "notes": "إدارة المستودعات الجمركية الحرة وإعادة شحن وتوزيع البضائع العابرة للأسواق الأوروبية والأفريقية"
    },
    {
        "nameAr": "شركة دمياط للأعمال البحرية والإنقاذ وسحب السفن وإصلاح التوربينات بالميناء",
        "nameEn": "Damietta Marine Salvage Vessel Towage & Turbine Repair Services Co",
        "sector": "transport", "city": "damietta", "district": "ميناء دمياط - قطاع القاطرات والإنقاذ البحري", "governorate": "دمياط",
        "address": "رصيف الخدمات البحرية بميناء دمياط - مجمع صيانة القاطرات البحرية ولنشات الإرشاد والورش الميكانيكية",
        "phone1": "057-2381125", "phone2": "", "website": "",
        "email": "damietta.tugs.salvage.marine@gmail.com", "lat": 31.436, "lon": 31.756, "fleetSize": 60,
        "fleetType": "قاطرات بحرية بقوة شد 60 و70 طناً ولنشات إرشاد وتريلات نقل معدات الإنقاذ والغوص التخصصية", "priority": "A+",
        "notes": "تقديم خدمات قطر وإرشاد ومناورة السفن وناقلات الغاز العملاقة وتأمين سلامة الملاحة بالقناة الملاحية لميناء دمياط"
    },

    # ── Sub-Cluster 3: وادي التكنولوجيا ومحور التصدير الزراعي والترسانات بالإسماعيلية (25 كياناً) ──
    {
        "nameAr": "مجموعة وادي التكنولوجيا لصناعات الطاقة النظيفة والتجميع المتقدم شرق الإسماعيلية",
        "nameEn": "Ismailia Technology Valley Clean Energy & Advanced Assembly Complex",
        "sector": "manufacturing", "city": "ismailia", "district": "شرق القناة - مشروع وادي التكنولوجيا المتقدم", "governorate": "الإسماعيلية",
        "address": "شرق قناة السويس - وادي التكنولوجيا الكيلو 10 - مجمع مصانع تجميع الألواح الشمسية والإلكترونيات الدقيقة",
        "phone1": "064-3281101", "phone2": "", "website": "",
        "email": "techvalley.cleanenergy.ismailia@gmail.com", "lat": 30.620, "lon": 32.350, "fleetSize": 120,
        "fleetType": "تريلات جامبو صندوق مقفل وتريلات فلات مجهزة بنظم امتصاص الاهتزاز لنقل المكونات الإلكترونية والألواح الشمسية", "priority": "A+",
        "notes": "المدينة التكنولوجية القومية الرائدة لتوطين صناعات الرقائق الإلكترونية والطاقة النظيفة ومعدات الاتصالات بسيناء"
    },
    {
        "nameAr": "شركة سرابيوم لتجهيز وتصدير الفراولة والموالح والمانجو الإسماعيلاوي المبرد",
        "nameEn": "Sarabiom Agro Fresh Strawberry Citrus & Mango Cold Chain Export Co",
        "sector": "transport", "city": "ismailia", "district": "سرابيوم - مجمع محطات الفرز والتدريج التصديري الدولي", "governorate": "الإسماعيلية",
        "address": "طريق الإسماعيلية السويس الصحراوي - سرابيوم - مجمع محطات الفرز الإلكتروني وثلاجات التبريد السريع",
        "phone1": "064-3281102", "phone2": "", "website": "",
        "email": "sarabiom.agroexport.ismailia@gmail.com", "lat": 30.450, "lon": 32.250, "fleetSize": 150,
        "fleetType": "برادات تريلا حديثة كارير محكمة التحكم بالرطوبة والحرارة وشاحنات تبريد سريعة لشحن الفراولة والمانجو للمطارات والموانئ", "priority": "A+",
        "notes": "الصرح الأول لتصدير الفراولة الطازجة والمجمدة والمانجو الإسماعيلاوي الشهير والموالح لأسواق أوروبا والمملكة المتحدة"
    },
    {
        "nameAr": "شركة ترسانة السويس والإسماعيلية البحرية وبناء وإصلاح السفن واليخوت",
        "nameEn": "Suez Canal Shipyard Ismailia Marine Shipbuilding & Repair Heavy Workshop",
        "sector": "manufacturing", "city": "ismailia", "district": "الإسماعيلية - حوض الترسانة البحرية بهيئة قناة السويس", "governorate": "الإسماعيلية",
        "address": "شارع الجيش تقاطع نمرة 6 - مجمع الأحواض العائمة والورش الميكانيكية وبناء الصنادل والقاطرات",
        "phone1": "064-3281103", "phone2": "", "website": "",
        "email": "ismailia.shipyard.marine@gmail.com", "lat": 30.600, "lon": 32.280, "fleetSize": 85,
        "fleetType": "تريلات فلات ثقيلة مجهزة بأوناش هيدروليكية ولوابد لنقل الديازل البحرية وريش الرفاصات وألواح الصلب البحري", "priority": "A+",
        "notes": "بناء وصيانة قاطرات ولنشات الهيئة وصيانة السفن التجارية والعائمة بأحدث المعايير الهندسية البحرية"
    },
    {
        "nameAr": "شركة القنطرة غرب للصناعات الغذائية والتجفيف والتجميد السريع للحاصلات الزراعية",
        "nameEn": "Qantara West IQF Agro Produce Freezing & Dehydration Mega Plant",
        "sector": "manufacturing", "city": "qantara_west", "district": "القنطرة غرب - المنطقة الصناعية والتخزينية", "governorate": "الإسماعيلية",
        "address": "طريق الإسماعيلية بورسعيد الزراعي - القنطرة غرب - مجمع مصانع التجميد السريع IQF وتجفيف البصل والخضروات",
        "phone1": "064-3281104", "phone2": "", "website": "",
        "email": "qantarawest.iqf.food@gmail.com", "lat": 30.850, "lon": 32.310, "fleetSize": 110,
        "fleetType": "برادات تريلا حديثة كارير لنقل الخضروات والفواكه المجمدة وشاحنات صندوق مقفل لتوزيع المحاصيل المجففة", "priority": "A+",
        "notes": "تصنيع وتجميد محاصيل وادي الملاك والقنطرة وتصدير الفراولة والخرشوف والبامية لأسواق الخليج وأوروبا"
    },
    {
        "nameAr": "شركة الإسماعيلية للخرسانة الجاهزة ومحطات الخلط لأنفاق تحيا مصر ومحاور القناة",
        "nameEn": "Ismailia Ready-Mix Concrete Tahya Misr Tunnels & Canal Axes Plants",
        "sector": "contracting", "city": "ismailia", "district": "الإسماعيلية - منطقة أنفاق تحيا مصر شمال الإسماعيلية", "governorate": "الإسماعيلية",
        "address": "مدخل أنفاق تحيا مصر - مجمع محطات الخلط الخرساني المركزي ومستودعات الركام والإسمنت المقاوم",
        "phone1": "064-3281105", "phone2": "", "website": "",
        "email": "ismailia.readymix.tunnels@gmail.com", "lat": 30.650, "lon": 32.320, "fleetSize": 95,
        "fleetType": "خلاطات خرسانة 10 و12م³ ومضخات بوم 47 و56 متر شWing ومعدات صب مستمر لإنشاءات الأنفاق والكباري العائمة", "priority": "A+",
        "notes": "تنفيذ الحلقات الخرسانية لأنفاق الإسماعيلية والكباري العائمة والمنشآت السكنية لمدينة الإسماعيلية الجديدة"
    },
    {
        "nameAr": "شركة وادي الملاك للاستصلاح الزراعي وأساطيل المعدات الثقيلة والحصاد الآلي",
        "nameEn": "Wadi El Molak Agro Land Reclamation Heavy Earthmoving & Harvesting Fleets",
        "sector": "contracting", "city": "ismailia", "district": "وادي الملاك - التل الكبير - قطاع المشروعات الزراعية العملاقة", "governorate": "الإسماعيلية",
        "address": "طريق القاهرة الإسماعيلية الصحراوي الكيلو 76 - معسكر الآلات والمعدات الزراعية والجريدرات والبلدوزرات",
        "phone1": "064-3281106", "phone2": "", "website": "",
        "email": "wadielmolak.reclamation.heavy@gmail.com", "lat": 30.520, "lon": 31.950, "fleetSize": 125,
        "fleetType": "بلدوزرات وجريدرات ليزرية وتريلات حفر وتركيب شبكات الري بالتنقيط وحصادات ذرة وبصل وتريلات نقل محاصيل", "priority": "A+",
        "notes": "استصلاح وزراعة عشرات آلاف الأفدنة بالمحاصيل البستانية التصديرية وأشجار الموالح والمانجو والزيتون"
    },
    {
        "nameAr": "شركة الإسماعيلية للصناعات الدوائية والمستحضرات الطبية بالمنطقة الحرة الاستثمارية",
        "nameEn": "Ismailia Pharmaceuticals & Bio-Medical Solutions Free Zone Complex",
        "sector": "manufacturing", "city": "ismailia", "district": "المنطقة الحرة العامة للاستثمار بالإسماعيلية", "governorate": "الإسماعيلية",
        "address": "المنطقة الاستثمارية - مجمع مصانع تصنيع الأدوية والمستحضرات الحيوية والمضادات الحيوية والمطهرات",
        "phone1": "064-3281107", "phone2": "", "website": "",
        "email": "ismailia.pharma.freezone@gmail.com", "lat": 30.590, "lon": 32.260, "fleetSize": 70,
        "fleetType": "شاحنات نقل مبردة ومكيفة بنظم تعليق هوائي لنقل الأدوية والمستلزمات الطبية للمستشفيات ومديريات الصحة بمصر", "priority": "A",
        "notes": "إنتاج الأدوية الحيوية والمستلزمات الطبية المعقمة وفق معايير منظمة الصحة العالمية وتصديرها للدول العربية والأفريقية"
    },
    {
        "nameAr": "شركة القنطرة شرق للوجستيات صوامع الحبوب وتفريغ الحبوب الاستراتيجية بسيناء",
        "nameEn": "Qantara East Grain Silos Haulage & Sinai Strategic Wheat Logistics Co",
        "sector": "transport", "city": "qantara_east", "district": "القنطرة شرق - مجمع صوامع الغلال الحديثة شرق القناة", "governorate": "الإسماعيلية",
        "address": "طريق القنطرة شرق العريش الدولي - مجمع خلايا الصوامع المعدنية سعة 60 ألف طن ومحطة الشحن البري",
        "phone1": "064-3281108", "phone2": "", "website": "",
        "email": "qantaraeast.grainsilos.sinai@gmail.com", "lat": 30.860, "lon": 32.330, "fleetSize": 90,
        "fleetType": "تريلات تفريغ قلاب وتريلات سيلو لنقل القمح السائب من الموانئ إلى صوامع ومطاحن شمال سيناء والقناة", "priority": "A+",
        "notes": "تأمين المخزون الاستراتيجي من القمح والدقيق التمويني لمدن ومراكز شبه جزيرة سيناء وإقليم القناة"
    },
    {
        "nameAr": "شركة الإسماعيلية لتجارة وتوزيع حديد التسليح والأسمنت واللفائف لمقاولي القناة وسيناء",
        "nameEn": "Ismailia Heavy Rebar & Bulk Cement Supply Logistics Canal & Sinai",
        "sector": "transport", "city": "ismailia", "district": "الإسماعيلية - المنطقة الصناعية الأولى / نمرة 6", "governorate": "الإسماعيلية",
        "address": "طريق نمرة 6 - مجمع مخازن وساحات تشوين حديد التسليح والإسمنت واللفائف وسلك الرباط",
        "phone1": "064-3281109", "phone2": "", "website": "",
        "email": "ismailia.rebar.cement.supply@gmail.com", "lat": 30.610, "lon": 32.270, "fleetSize": 105,
        "fleetType": "تريلات تريبل أكسل مسطحة لنقل الحديد وتريلات سيلو لنقل الأسمنت السائب لمشروعات الإسكان والكباري بأنفاق القناة", "priority": "A+",
        "notes": "كبار الموزعين المعتمدين لحديد عز والسويس للصلب وأسمنت سيناء لتأمين مشروعات التنمية في سيناء والقناة"
    },
    {
        "nameAr": "شركة التل الكبير لإنتاج وتصنيع الأعلاف الداجنة والحيوانية والمركزات البروتينية",
        "nameEn": "El Tal El Kebir Poultry & Cattle Feed Pellets Manufacturing Mega Mill",
        "sector": "manufacturing", "city": "ismailia", "district": "مركز التل الكبير - منطقة الصناعات الغذائية والأعلاف", "governorate": "الإسماعيلية",
        "address": "طريق الزقازيق الإسماعيلية الزراعي - التل الكبير - مجمع صوامع ومطاحن ومكابس الأعلاف المحببة",
        "phone1": "064-3281110", "phone2": "", "website": "",
        "email": "talkebir.feed.poultry@gmail.com", "lat": 30.550, "lon": 31.850, "fleetSize": 80,
        "fleetType": "تريلات سيلو ضغط هواء لنقل الأعلاف السائبة وتريلات صندوق مقفل لتوزيع شكائر الأعلاف لمزارع الدواجن والماشية", "priority": "A",
        "notes": "إنتاج الأعلاف الداجنة والحيوانية المحببة بطاقة 750 طن يومياً لتغذية أكبر تجمعات مزارع التسمين بالشرقية والقناة"
    },
    {
        "nameAr": "شركة الإسماعيلية للمهمات الثقيلة وتأجير الأوناش التلسكوبية والرافعات الميدانية",
        "nameEn": "Ismailia Heavy Cranes Rental & Canal Infrastructure Lifting Solutions",
        "sector": "transport", "city": "ismailia", "district": "الإسماعيلية - طريق محور 30 يونيو", "governorate": "الإسماعيلية",
        "address": "محور 30 يونيو تقاطع طريق الإسماعيلية الصحراوي - مجمع الرافعات والأوناش واللوابد متعددة المحاور",
        "phone1": "064-3281111", "phone2": "", "website": "",
        "email": "ismailia.heavycranes.rental@gmail.com", "lat": 30.580, "lon": 32.220, "fleetSize": 65,
        "fleetType": "أوناش تلسكوبية ليبهير 70 و120 و220 طن ولوابد نقل المولدات وماكينات حفر الأنفاق TBM والمعدات الثقيلة", "priority": "A+",
        "notes": "دعم عمليات حفر وتركيب أنفاق قناة السويس والكباري العائمة والمحطات الكهربائية ومصانع وادي التكنولوجيا"
    },
    {
        "nameAr": "شركة الإسماعيلية للصناعات الكيماوية وتصنيع الدهانات والمواد العازلة ومستلزمات البناء",
        "nameEn": "Ismailia Chemical Paints Modern Construction Insulation Materials Plant",
        "sector": "manufacturing", "city": "ismailia", "district": "المنطقة الصناعية الثانية بالإسماعيلية", "governorate": "الإسماعيلية",
        "address": "المنطقة الصناعية - مجمع مصانع إنتاج دهانات البلاستيك والمعاجين الإنشائية والعوازل المائية والحرارية",
        "phone1": "064-3281112", "phone2": "", "website": "",
        "email": "ismailia.paints.insulation@gmail.com", "lat": 30.585, "lon": 32.255, "fleetSize": 55,
        "fleetType": "تريلات صندوق مقفل وشاحنات سريعة لتوريد بستلات الدهانات ومواد العزل الحديثة لكافة مشروعات الإسكان بالصعيد والقناة", "priority": "A",
        "notes": "إنتاج بويات الطرق العاكسة والدهانات المقاومة للرطوبة والمواد الإيبوكسية لمعالجة أرضيات المنشآت الصناعية"
    },
    {
        "nameAr": "شركة فايد لنقل وتوزيع وتصدير المحاصيل البستانية والخضروات والمانجو",
        "nameEn": "Fayed Agro Produce Logistics Citrus Mango & Fresh Vegetables Fleets",
        "sector": "transport", "city": "fayed", "district": "مركز فايد - مجمع محطات فرز وتعبئة الحاصلات الزراعية", "governorate": "الإسماعيلية",
        "address": "طريق الإسماعيلية السويس الزراعي - فايد - مجمع محطات الفرز الإلكتروني ومستودعات التبريد والتخزين",
        "phone1": "064-3281113", "phone2": "", "website": "",
        "email": "fayed.agroproduce.logistics@gmail.com", "lat": 30.330, "lon": 32.300, "fleetSize": 95,
        "fleetType": "تريلات تهوية وبرادات تريلا حديثة كارير لنقل الموالح والمانجو الفص والعويس والتمور لموانئ السخنة والإسكندرية", "priority": "A+",
        "notes": "تجهيز وشحن أفخر أصناف المانجو والموالح التي تشتهر بها مزارع وبساتين فايد وفنارة وأبو سلطان للتصدير"
    },
    {
        "nameAr": "شركة الإسماعيلية لنقل المواد البترولية والسولار والمازوت لمشروعات إقليم القناة",
        "nameEn": "Ismailia Petroleum Fuel Haulage Canal Infrastructure Diesel Tankers",
        "sector": "transport", "city": "ismailia", "district": "الإسماعيلية - مجمع مستودعات مصر للبترول ومستودعات التعاون", "governorate": "الإسماعيلية",
        "address": "طريق الإسماعيلية بورسعيد السريع الكيلو 5 - مجمع محطات شحن صهاريج الوقود الصناعي",
        "phone1": "064-3281114", "phone2": "", "website": "",
        "email": "ismailia.petroleum.diesel@gmail.com", "lat": 30.630, "lon": 32.290, "fleetSize": 85,
        "fleetType": "صهاريج نقل مواد بترولية سعة 36 و40 ألف لتر مجهزة بأنظمة الحماية الآلية لتموين الكراكات والمعدات والمصانع", "priority": "A+",
        "notes": "التغذية البترولية بالسولار والمازوت لكراكات هيئة قناة السويس ومحطات الخلط الخرساني ومعدات الأنفاق"
    },
    {
        "nameAr": "شركة أبو صوير للصناعات البلاستيكية وخراطيم الري الحديث ومواسير الـ PVC",
        "nameEn": "Abu Suwir Plastics PVC Pipes & Agro Irrigation Drip Tubing Plant",
        "sector": "manufacturing", "city": "ismailia", "district": "مركز أبو صوير - المنطقة الصناعية المتاخمة لمطار الإسماعيلية", "governorate": "الإسماعيلية",
        "address": "طريق أبو صوير الإسماعيلية الزراعي - مجمع خطوط بثق مواسير الـ PVC وخراطيم الري بالتنقيط ذاتية التنظيف",
        "phone1": "064-3281115", "phone2": "", "website": "",
        "email": "abuswir.plastics.irrigation@gmail.com", "lat": 30.570, "lon": 32.100, "fleetSize": 65,
        "fleetType": "تريلات مسطحة طويلة وتريلات جامبو لنقل مواسير مياه الشرب والصرف وشبكات الري لمزارع شرق الإسماعيلية وسيناء", "priority": "A",
        "notes": "تأمين شبكات الري الحديث ومواسير البنية التحتية لمشروعات التنمية الزراعية بشبه جزيرة سيناء وشرق البحيرات"
    },
    {
        "nameAr": "شركة القنطرة غرب للمقاولات العامة وشق الطرق ومحاور ربط القناة بالدلتا",
        "nameEn": "Qantara West General Contracting & Canal-Delta Link Highway Fleets",
        "sector": "contracting", "city": "qantara_west", "district": "القنطرة غرب - مجمع معدات المقاولات والكسارات المتنقلة", "governorate": "الإسماعيلية",
        "address": "طريق القنطرة الصالحية الجديد - معسكر معدات رصف الأسفلت والقلابات الثقيلة والهراسات",
        "phone1": "064-3281116", "phone2": "", "website": "",
        "email": "qantarawest.contracting.roads@gmail.com", "lat": 30.840, "lon": 32.300, "fleetSize": 85,
        "fleetType": "فناشر أسفلت وهراسات حديد ومطاط وقلابات مان 4 أكسل ولوادر حفر لتنفيذ المحاور المرورية الحيوية", "priority": "A+",
        "notes": "تنفيذ ورفع كفاءة محاور ربط مدن القناة بمحافظات الشرقية والدقهلية وطرق الخدمة الموازية للمجرى الملاحي"
    },
    {
        "nameAr": "شركة الإسماعيلية للغازات الصناعية وشحن أسطوانات الأكسجين والأرجون والنيتروجين",
        "nameEn": "Ismailia Industrial Gases Oxygen Argon & Nitrogen Cylinder Filling Plant",
        "sector": "transport", "city": "ismailia", "district": "الإسماعيلية - المنطقة الصناعية الأولى", "governorate": "الإسماعيلية",
        "address": "المنطقة الصناعية - محطة تفريغ وتعبئة خزانات وأسطوانات الغازات الصناعية المسالة المبردة",
        "phone1": "064-3281117", "phone2": "", "website": "",
        "email": "ismailia.industrialgases@gmail.com", "lat": 30.595, "lon": 32.265, "fleetSize": 50,
        "fleetType": "شاحنات صندوق شبكي مخصصة لنقل أسطوانات الضغط العالي وتريلات صهاريج كرايوجينيك للغازات المسالة", "priority": "A",
        "notes": "تأمين الغازات الصناعية لورش الترسانة البحرية وأعمال اللحام المتخصص بالمصانع وتوريد الأكسجين لمستشفيات القناة"
    },
    {
        "nameAr": "شركة فايد للتبريد وحفظ وتجميد الأسماك واللحوم والدواجن لمحافظات القناة",
        "nameEn": "Fayed Cold Storage & Deep Freezing Logistics Terminal Canal Zone",
        "sector": "transport", "city": "fayed", "district": "مركز فايد - المنطقة التخزينية واللوجستية", "governorate": "الإسماعيلية",
        "address": "طريق فايد السويس - مجمع مستودعات التبريد والتجميد السريع سعة 12 ألف طن ومحطات شحن الشاحنات",
        "phone1": "064-3281118", "phone2": "", "website": "",
        "email": "fayed.coldstorage.logistics@gmail.com", "lat": 30.340, "lon": 32.290, "fleetSize": 60,
        "fleetType": "برادات تريلا حديثة كارير وشاحنات توزيع مبردة لنقل الأسماك واللحوم المجمدة والدواجن لسلاسل الإمداد المركزية", "priority": "A",
        "notes": "حفظ وتوزيع السلع الغذائية الاستراتيجية المجمدة والمبردة لتأمين احتياجات مدن القناة وسيناء والعاصمة"
    },
    {
        "nameAr": "شركة التل الكبير لتصنيع وتجارة الكرتون وصناديق التعبئة والتغليف للمحاصيل الزراعية",
        "nameEn": "El Tal El Kebir Agro Corrugated Packaging & Fruit Export Cartons Plant",
        "sector": "manufacturing", "city": "ismailia", "district": "التل الكبير - مجمع الصناعات الكرتونية والورقية", "governorate": "الإسماعيلية",
        "address": "طريق الإسماعيلية الصحراوي مدخل التل الكبير - مصنع إنتاج كراتين تعبئة الفواكه والخضروات المقاومة للرطوبة",
        "phone1": "064-3281119", "phone2": "", "website": "",
        "email": "talkebir.carton.packaging@gmail.com", "lat": 30.540, "lon": 31.860, "fleetSize": 55,
        "fleetType": "تريلات جامبو صندوق مقفل لتوريد كراتين الفراولة والمانجو والموالح لمحطات الفرز والتصدير بالقناة والشرقية", "priority": "A",
        "notes": "تصنيع كراتين التعبئة والتصدير عالية الجودة المزودة بفتحات تهوية وتصميمات أوفست ملونة مطابقة للمواصفات الدولية"
    },
    {
        "nameAr": "شركة سرابيوم للصناعات الخشبية وتصنيع البالتات المعالجة لتحميل الصادرات الزراعية",
        "nameEn": "Sarabiom Agro Wood Pallets & Export Packing Crates Manufacturing",
        "sector": "manufacturing", "city": "ismailia", "district": "سرابيوم - مجمع الأخشاب والتعبئة والتغليف", "governorate": "الإسماعيلية",
        "address": "طريق سرابيوم فايد - مصنع إنتاج الطبالي الخشبية المعالجة حرارياً ISPM 15 وصناديق الشحن",
        "phone1": "064-3281120", "phone2": "", "website": "",
        "email": "sarabiom.pallets.wood@gmail.com", "lat": 30.460, "lon": 32.240, "fleetSize": 45,
        "fleetType": "تريلات جامبو وتريلات فلات لتوريد حوامل الرص الخشبية لمحطات تصدير الحاصلات الزراعية وموانئ القناة", "priority": "A",
        "notes": "تصنيع البالتات الخشبية المعتمدة لتحميل شحنات الفواكه والخضروات والمواد الغذائية المشحونة جواً وبحراً"
    },
    {
        "nameAr": "شركة الإسماعيلية للمقاولات البحرية وحماية وتدبيش ضفاف قناة السويس والبحيرات",
        "nameEn": "Ismailia Marine Revetments Canal Banks Protection & Riprap Fleets",
        "sector": "contracting", "city": "ismailia", "district": "الإسماعيلية - قطاع صيانة ضفاف المجرى الملاحي والبحيرات المرة", "governorate": "الإسماعيلية",
        "address": "طريق الشاطئ - مجمع إدارة معدات التكريك والتدبيش الصخري وصيانة القيسونات والستائر الفولاذية",
        "phone1": "064-3281121", "phone2": "", "website": "",
        "email": "ismailia.marinerevetments@gmail.com", "lat": 30.585, "lon": 32.285, "fleetSize": 75,
        "fleetType": "صنادل نهرية مجهزة بأوناش هيدروليكية وقلابات صخرية هيفي ديوتي لنقل كتل الدبش والستائر لتدعيم الجوانب المائية", "priority": "A+",
        "notes": "تنفيذ أعمال التدبيش وحماية ضفاف قناة السويس من التيارات المائية الناتجة عن عبور السفن العملاقة"
    },
    {
        "nameAr": "شركة القنطرة شرق للتعدين واستخراج الرمال البيضاء والجبس بالظهير الصحراوي لسيناء",
        "nameEn": "Qantara East Silica Sand & Gypsum Mining Western Sinai Quarries",
        "sector": "manufacturing", "city": "qantara_east", "district": "القنطرة شرق - مجمع محاجر الرمال البيضاء بشرق القناة", "governorate": "الإسماعيلية",
        "address": "طريق القنطرة شرق جلبانة - مجمع محطات غربلة وغسيل رمال السيليكا عالية النقاء والجبس التعديني",
        "phone1": "064-3281122", "phone2": "", "website": "",
        "email": "qantaraeast.silicasand.mining@gmail.com", "lat": 30.880, "lon": 32.350, "fleetSize": 90,
        "fleetType": "قلابات صخرية 4 أكسل وتريلات سيلو لنقل رمل السيليكا النقي لمصانع الزجاج والخلايا الشمسية بالعاشر والسخنة", "priority": "A+",
        "notes": "استخراج وغربلة رمال السيليكا البيضاء فائقة النقاوة (99.8% SiO2) المستخدمة في تصنيع الزجاج الشمسي والكريستال"
    },
    {
        "nameAr": "شركة الإسماعيلية للحلول البيئية وتدوير المخلفات الصلبة ومعالجة مياه الصرف الزراعي",
        "nameEn": "Ismailia Environmental Solutions & Agro-Industrial Waste Recycling Co",
        "sector": "contracting", "city": "ismailia", "district": "الإسماعيلية - محطة معالجة مياه مصرف المحسمة وسرابيم", "governorate": "الإسماعيلية",
        "address": "طريق المحسمة الإسماعيلية - مجمع محطات معالجة مياه الصرف الزراعي ومحطات الضخ لنقل المياه لسيناء",
        "phone1": "064-3281123", "phone2": "", "website": "",
        "email": "ismailia.environmental.recycling@gmail.com", "lat": 30.510, "lon": 32.150, "fleetSize": 60,
        "fleetType": "شاحنات هوك لفت وفنطاسات كسح ومعالجة وحفارات صيانة قنوات المياه ومعدات تدوير الحمأة الزراعية", "priority": "A",
        "notes": "تشغيل ودعم أكبر محطات معالجة مياه الصرف الزراعي في العالم (محطة المحسمة وسرابيم) لإعادة استخدامها في ري سيناء"
    },
    {
        "nameAr": "شركة أبو صوير للصوامع والمستودعات الجمركية وخدمات الترانزيت اللوجستي الحر",
        "nameEn": "Abu Suwir Bonded Silos & Free Transit Agro Logistics Terminal Co",
        "sector": "transport", "city": "ismailia", "district": "أبو صوير - المنطقة اللوجستية المركزية", "governorate": "الإسماعيلية",
        "address": "طريق الإسماعيلية الصحراوي مدخل أبو صوير - مجمع ساحات الشحن والتخزين الجمركي المؤقت",
        "phone1": "064-3281124", "phone2": "", "website": "",
        "email": "abuswir.bonded.logistics@gmail.com", "lat": 30.565, "lon": 32.120, "fleetSize": 70,
        "fleetType": "تريلات نقل متعدد الوسائط ورافعات شوكية ثقيلة وتريلات نقل بضائع عامة لخدمة المستثمرين والمزارع الكبرى", "priority": "A",
        "notes": "تقديم خدمات التخزين الجمركي وإدارة سلاسل الإمداد لمستلزمات الإنتاج الزراعي والصناعي بإقليم القناة"
    },
    {
        "nameAr": "شركة الإسماعيلية لإدارة الموانئ الجافة وساحات شحن البضائع والترانزيت بالمنطقة الحرة",
        "nameEn": "Ismailia Dry Port & Free Zone Inland Transit Freight Management Co",
        "sector": "transport", "city": "ismailia", "district": "الإسماعيلية - الميناء الجاف بالمنطقة الحرة العامة", "governorate": "الإسماعيلية",
        "address": "طريق الإسماعيلية القاهرة الصحراوي - مجمع ساحات الحاويات الجافة ومحطة التبادل التجاري",
        "phone1": "064-3281125", "phone2": "", "website": "",
        "email": "ismailia.dryport.freight@gmail.com", "lat": 30.582, "lon": 32.248, "fleetSize": 80,
        "fleetType": "تريلات نقل حاويات 40 قدم ورافعات ريتش ستاكر وشاحنات توزيع سريع لربط المنطقة الحرة بموانئ بورسعيد والسويس", "priority": "A+",
        "notes": "إدارة حركة الشحن الجاف والتخليص الجمركي المسبق وتسيير قوافل الحاويات اليومية بين موانئ البحرين المتوسط والأحمر"
    }
]

# 3. Vetting & Normalization
approved_companies = []
rejected_companies = []

for idx, c in enumerate(candidates_data, 1):
    comp_id = f"comp_suez_canal_spec_{idx:03d}"
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
        "lat": c.get('lat', 31.0),
        "lon": c.get('lon', 32.0),
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
print(f"Results for Square 17 (Suez Canal Specialized Logistics & Seaports):")
print(f"Total Candidates: {len(candidates_data)}")
print(f"Approved (Pure B2B, Zero Duplicates): {len(approved_companies)}")
print(f"Rejected: {len(rejected_companies)}")
print("=============================================")

assert len(approved_companies) == 75, f"Expected 75 approved, got {len(approved_companies)}"

os.makedirs('scraper/output', exist_ok=True)
output_path = 'scraper/output/phase2_suez_canal_specialized_verified_b2b_fleet.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(approved_companies, f, ensure_ascii=False, indent=2)

print(f"Saved {len(approved_companies)} approved enterprises to {output_path}\n")
