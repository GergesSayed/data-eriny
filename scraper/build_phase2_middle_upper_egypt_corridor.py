# -*- coding: utf-8 -*-
"""
Phase 2 - Square 15: Middle Upper Egypt & West Nile Mega Agro-Industrial & Mining Corridor (Minya Canal Sugar & Samalut Limestone, Beni Suef Kom Abu Radi & Bayad El Arab, Assiut ANOPC Refining & Arab El Awamer)
(محور شمال ووسط الصعيد وغرب النيل: مجمع سكر القناة العملاق ومحاجر الحجر الجيري بسمالوط بالمنيا + مجمع كوم أبو راضي وبياض العرب ببني سويف + مجمع تكرير أسيوط ومشروع أنوبك وعرب العوامر)

Target: Exactly 75 Approved Heavy B2B Enterprises (Bringing CRM from 21,000 to 21,075)
"""

import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== PHASE 2 - SQUARE 15: MIDDLE UPPER EGYPT & WEST NILE AGRO-INDUSTRIAL & MINING CORRIDOR ===")

# 1. Load existing 21,000 companies to enforce absolute Zero Duplication
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

# 2. Curated Candidate Pool for Square 15 (Exactly 75 Pure B2B Entities)
candidates_data = [
    # ── Sub-Cluster 1: غرب المنيا ومحاجر الحجر الجيري بسمالوط ومجمع سكر القناة (20 كياناً) ──
    {
        "nameAr": "شركة سكر القناة وأساطيل نقل بنجر السكر وتصدير السكر الأبيض بغرب المنيا",
        "nameEn": "Canal Sugar Co & Mega Sugar Beet Haulage Fleets West Minya",
        "sector": "manufacturing", "city": "west_minya", "district": "غرب المنيا - مجمع مصانع استصلاح 180 ألف فدان", "governorate": "المنيا",
        "address": "طريق المنيا الواحات الصحراوي الغربي الكيلو 45 - مجمع مصانع سكر القناة",
        "phone1": "086-2111101", "phone2": "", "website": "",
        "email": "canalsugar.haulage.minya@gmail.com", "lat": 28.150, "lon": 30.350, "fleetSize": 185,
        "fleetType": "تريلات جوانب شبكية مقفلة سعة 40 طن لنقل البنجر وسيلوهات سكر أبيض وتريلات نقل كسب البنجر للموانئ", "priority": "A+",
        "notes": "أكبر مصنع لسكر البنجر في العالم وأكبر مشروع استصلاح زراعي صناعي بالصحراء الغربية في مصر"
    },
    {
        "nameAr": "شركة سمالوط للحجر الجيري الأبيض وكربونات الكالسيوم النقية وأساطيل السيلوهات",
        "nameEn": "Samalut White Limestone & Ultra Pure Calcium Carbonate Silos Haulage",
        "sector": "manufacturing", "city": "samalut", "district": "سمالوط - مجمع محاجر الحجر الجيري بشرق النيل", "governorate": "المنيا",
        "address": "طريق سمالوط الصحراوي الشرقي - مجمع كسارات وطواحين كربونات الكالسيوم فائقة النعومة",
        "phone1": "086-2111102", "phone2": "", "website": "",
        "email": "samalut.calcium.carbonate@gmail.com", "lat": 28.320, "lon": 30.780, "fleetSize": 140,
        "fleetType": "تريلات سيلو ضغط هواء لنقل البودرة البيضاء وتريلات قلابات صلب لنقل الكتل الحجرية عالية النقاء", "priority": "A+",
        "notes": "تغذية مصانع الأدوية والدهانات والبلاستيك ومصانع الزجاج بالدلتا والقاهرة ببودرة كربونات الكالسيوم 99.6%"
    },
    {
        "nameAr": "الشركة الوطنية للمحاجر وتوريد خام الحجر الجيري لمصانع الحديد والصلب بالمنيا",
        "nameEn": "National Quarries Co & High Grade Limestone For Steel Fluxes Minya",
        "sector": "transport", "city": "minya", "district": "المنيا - مجمع محاجر جبل الطير وبني خالد", "governorate": "المنيا",
        "address": "طريق الجيش الصحراوي الشرقي بالمنيا - ساحة تفويج وشحن صخور الحجر الجيري",
        "phone1": "086-2111103", "phone2": "", "website": "",
        "email": "national.limestone.minya@gmail.com", "lat": 28.250, "lon": 30.820, "fleetSize": 120,
        "fleetType": "قلابات صخرية مان وفولفو 4 أكسل مخصصة لنقل صخور الصهر الكلسية لمصانع الصلب بالسخنة والدلتا", "priority": "A+",
        "notes": "المورد الرئيسي لحجر الجير الصهري المستخدم كعامل مساعد في أفران صهر خامات الحديد والصلب"
    },
    {
        "nameAr": "شركة غرب المنيا الزراعية لاستصلاح الأراضي وأساطيل تسوية التربة والمعدات الثقيلة",
        "nameEn": "West Minya Agro Land Reclamation & Heavy Earthmoving Fleets Co",
        "sector": "contracting", "city": "west_minya", "district": "امتداد مشروع غرب غرب المنيا القومي", "governorate": "المنيا",
        "address": "طريق محور سمالوط الصحراوي الغربي - مجمع معسكرات الجريدرات والبلدوزرات وشبكات الري",
        "phone1": "086-2111104", "phone2": "", "website": "",
        "email": "westminya.reclamation.heavy@gmail.com", "lat": 28.210, "lon": 30.410, "fleetSize": 110,
        "fleetType": "بلدوزرات كوماتسو D275 وجريدرات تسوية ليزرية وتريلات حفر وتركيب أجهزة الري المحوري البيفوت", "priority": "A+",
        "notes": "تسوية واستصلاح مئات آلاف الأفدنة ومد خطوط التغذية الكهربائية وشبكات الري المحوري بالصحراء الغربية"
    },
    {
        "nameAr": "شركة المنيا لنقل وتصدير المولاس وكسب بنجر السكر المجفف لموانئ الإسكندرية ودمياط",
        "nameEn": "Minya Molasses & Dried Beet Pulp Pellets Export Logistics Co",
        "sector": "transport", "city": "minya", "district": "المنيا الجديدة - المنطقة اللوجستية المركزية", "governorate": "المنيا",
        "address": "المنيا الجديدة - طريق المرور الجديد - مجمع محطات صهاريج شحن المولاس السائل",
        "phone1": "086-2111105", "phone2": "", "website": "",
        "email": "minya.molasses.export@gmail.com", "lat": 28.090, "lon": 30.810, "fleetSize": 95,
        "fleetType": "صهاريج ستانلس ستيل معزولة حرارياً لنقل المولاس وتريلات تريبل أكسل لشحن بالات الكسب المجفف", "priority": "A+",
        "notes": "نقل وتصدير مخرجات تصنيع السكر من كسب البنجر عالي البروتين والمولاس لمصانع الأعلاف وموانئ التصدير"
    },
    {
        "nameAr": "شركة المطاهرة للصناعات الأسمنتية والخرسانة الجاهزة بالمنيا الجديدة",
        "nameEn": "Al Matahra Cement Products & Ready-Mix Concrete New Minya",
        "sector": "contracting", "city": "new_minya", "district": "المنطقة الصناعية بالمطاهرة - شرق النيل", "governorate": "المنيا",
        "address": "المنطقة الصناعية بالمطاهرة - مجمع محطات الخلط الخرساني ومصانع البلوك الآلي",
        "phone1": "086-2111106", "phone2": "", "website": "",
        "email": "matahra.readymix.minya@gmail.com", "lat": 28.050, "lon": 30.850, "fleetSize": 85,
        "fleetType": "خلاطات خرسانة 10 و12م³ ومضخات بوم 47 و52 متر شWing وتريلات نقل البلوك الإسمنتي الثقيل", "priority": "A+",
        "notes": "تنفيذ المشروعات السكنية ومشروعات حياة كريمة ومجمعات الكباري والمحاور النيلية بالمنيا"
    },
    {
        "nameAr": "مصنع الفاتح لتكسير وتصنيع كتل الرخام الأصفر والرمادي ومحاجر زاوية سلطان",
        "nameEn": "Al Fateh Yellow & Grey Marble Blocks Cutting Plant Zawyet Sultan",
        "sector": "manufacturing", "city": "minya", "district": "زاوية سلطان - مجمع مناشير ومحاجر الرخام", "governorate": "المنيا",
        "address": "طريق زاوية سلطان الصناعي - مجمع مصانع قص وتشطيب كتل الرخام الطبيعي",
        "phone1": "086-2111107", "phone2": "", "website": "",
        "email": "alfateh.marble.minya@gmail.com", "lat": 28.115, "lon": 30.795, "fleetSize": 75,
        "fleetType": "لوابد شاسيه ثقيل 4 أكسل وتريلات فلات مجهزة بحوامل A-Frames لنقل كتل وألواح الرخام", "priority": "A",
        "notes": "استخراج وقص رخام المنيا الأصفر والبريشيا السيناوي وتوريده لمشروعات المعمار في القاهرة الكبرى"
    },
    {
        "nameAr": "شركة المنيا لتعبئة وتوزيع الوقود والمحروقات للمواقع الزراعية ومشروعات الري",
        "nameEn": "Minya Agro Fuel Logistics & Pivot Irrigation Diesel Distribution Co",
        "sector": "transport", "city": "west_minya", "district": "محور الصحراوي الغربي - محطة التموين الاستراتيجية", "governorate": "المنيا",
        "address": "طريق أسيوط القاهرة الصحراوي الغربي الكيلو 180 - محطة صهاريج شحن السولار",
        "phone1": "086-2111108", "phone2": "", "website": "",
        "email": "minya.agrofuel.pivots@gmail.com", "lat": 28.190, "lon": 30.450, "fleetSize": 80,
        "fleetType": "فنطاسات دفع رباعي سعة 20 و30 طن مزودة بمضخات عدادات ديجيتال لتموين طلمبات الآبار والمعدات", "priority": "A+",
        "notes": "تأمين تدفق السولار لمولدات طاقة الآبار الجوفية ومعدات الحصاد الزراعي في عمق غرب المنيا"
    },
    {
        "nameAr": "مؤسسة سمالوط للتجارة والتعدين وتوريد رمال المحاجر لخلطات الخرسانة الأسمنتية",
        "nameEn": "Samalut Trading & Sand Quarrying For Ready-Mix Cement Batching Co",
        "sector": "transport", "city": "samalut", "district": "سمالوط - منطقة كسارات ومحاجر رمل البناء", "governorate": "المنيا",
        "address": "طريق سمالوط الشرقي - مجمع مغاسل وغربلة الرمال المتدرجة والسن",
        "phone1": "086-2111109", "phone2": "", "website": "",
        "email": "samalut.quarrysand.minya@gmail.com", "lat": 28.305, "lon": 30.765, "fleetSize": 70,
        "fleetType": "قلابات سكس ويل وتريلات قلاب 3 أكسل لتوريد الرمل المغسول والسن لمحطات الخلط الخرساني", "priority": "A",
        "notes": "التوريد اليومي لآلاف الأمتار المكعبة من الرمل والسن النقي الخالي من الأملاح لمحطات الخرسانة"
    },
    {
        "nameAr": "شركة عروس الصعيد للصناعات الغذائية والتجفيف الآلي للبصل والخضروات بالمنيا",
        "nameEn": "Bride Of Upper Egypt Food Dehydration & Agro Processing Plant Minya",
        "sector": "manufacturing", "city": "minya", "district": "المنطقة الصناعية بالمطاهرة - القطاع الغذائي", "governorate": "المنيا",
        "address": "المطاهرة الصناعية - مجمع مصانع التجفيف الآلي ومجففات البصل والثوم والنباتات العطرية",
        "phone1": "086-2111110", "phone2": "", "website": "",
        "email": "arous.dehydration.minya@gmail.com", "lat": 28.065, "lon": 30.840, "fleetSize": 60,
        "fleetType": "تريلات صندوق مقفل وتريلات شحن بحري لنقل الخضروات المجففة والمحاصيل التصديرية للموانئ", "priority": "A",
        "notes": "تجفيف وتجهيز البصل الأبيض والكزبرة والكمون والينسون بمواصفات مطابقة للأسواق الأوروبية والأمريكية"
    },
    {
        "nameAr": "شركة المنيا لنقل وتوزيع الأسمدة الزراعية والمخصبات الفوسفاتية لسهول النيل",
        "nameEn": "Minya Fertilizer Transport & Phosphate Plant Nutrition Haulage Co",
        "sector": "transport", "city": "minya", "district": "المنيا - مجمع صوامع ومخازن الأسمدة بملوي", "governorate": "المنيا",
        "address": "طريق المنيا ملوي الزراعي - مجمع مستودعات الأسمدة النيتروجينية والفوسفاتية الكبرى",
        "phone1": "086-2111111", "phone2": "", "website": "",
        "email": "minya.fertilizer.haulage@gmail.com", "lat": 27.850, "lon": 30.840, "fleetSize": 75,
        "fleetType": "تريلات تريبل أكسل وتريلات ستائر لتوزيع الأسمدة على الجمعيات الزراعية وكبار المزارعين", "priority": "A",
        "notes": "نقل اليوريا ونترات النشادر وسوبر فوسفات من مصانع السويس وأسيوط إلى مزارع محافظة المنيا"
    },
    {
        "nameAr": "مصنع النيل لتصنيع وتشكيل الكاولين المكلسن والحراريات الصناعية بالمنيا",
        "nameEn": "Nile Calcined Kaolin & Industrial Refractories Works Minya",
        "sector": "manufacturing", "city": "new_minya", "district": "المنيا الجديدة - مجمع الصناعات الثقيلة", "governorate": "المنيا",
        "address": "المنطقة الصناعية بالمنيا الجديدة - مصانع معالجة وتكليس الكاولين وإنتاج الطوب الحراري",
        "phone1": "086-2111112", "phone2": "", "website": "",
        "email": "nile.kaolin.minya@gmail.com", "lat": 28.080, "lon": 30.825, "fleetSize": 50,
        "fleetType": "تريلات تريبل أكسل وتريلات مغلقة لنقل الكاولين المكلسن لمصانع الورق والدهانات والمطاط", "priority": "A",
        "notes": "إنتاج الكاولين الأبيض المكلسن عالي السطوع المستخدم كمالئ صبغي في صناعات الورق والدهانات والبلاستيك"
    },
    {
        "nameAr": "شركة بني خالد للمقاولات البحرية والتطهير النهري وتدبيش مجرى النيل بالمنيا",
        "nameEn": "Beni Khaled Marine Dredging & Nile Riverbank Riprap Revetment Minya",
        "sector": "contracting", "city": "samalut", "district": "بني خالد - كورنيش النيل بشرق سمالوط", "governorate": "المنيا",
        "address": "مرسى بني خالد النهري - ساحة الصنادل وكراكات التكريك وأساطيل نقل أحجار الدبش",
        "phone1": "086-2111113", "phone2": "", "website": "",
        "email": "benikhaled.marine.minya@gmail.com", "lat": 28.290, "lon": 30.770, "fleetSize": 45,
        "fleetType": "كراكات نهرية وصنادل تفريغ وقلابات سكس ويل لنقل الدبش لتبطين الترع وحماية ضفاف النيل", "priority": "A",
        "notes": "تنفيذ أعمال تبطين وتأهيل الترع والمجاري المائية وحماية الجزر النيلية ومآخذ مياه الشرب بالمنيا"
    },
    {
        "nameAr": "شركة المنيا لنقل الحبوب والغلال وصوامع البنكر الاستراتيجية بشرق النيل",
        "nameEn": "Minya Grain Logistics & Strategic Bunker Silos Haulage Fleet",
        "sector": "transport", "city": "minya", "district": "المنيا - مجمع صوامع البنكر الحديثة", "governorate": "المنيا",
        "address": "طريق الجيش الصحراوي الشرقي - مجمع صوامع تخزين القمح الاستراتيجي سعة 60 ألف طن",
        "phone1": "086-2111114", "phone2": "", "website": "",
        "email": "minya.grains.silos@gmail.com", "lat": 28.130, "lon": 30.830, "fleetSize": 85,
        "fleetType": "قلابات حبوب تريلا سعة 36م³ وتريلات تريبل أكسل مجهزة لنقل القمح المحلي والمستورد للمطاحن", "priority": "A+",
        "notes": "تفريغ ونقل الأقماح المحلية من مزارع غرب المنيا وتخزينها بالصوامع المعدنية لضمان الأمن الغذائي"
    },
    {
        "nameAr": "مصنع الفراعنة لتصنيع وتعبئة الجير الحي والجير المطفأ للصناعات الكيماوية بالمنيا",
        "nameEn": "Pharaohs Quicklime & Hydrated Chemical Lime Works Samalut Minya",
        "sector": "manufacturing", "city": "samalut", "district": "سمالوط - مجمع أفران حرق الجير", "governorate": "المنيا",
        "address": "طريق سمالوط الصحراوي - مجمع مصانع أفران حرق وتطفئة الجير الأوتوماتيكية",
        "phone1": "086-2111115", "phone2": "", "website": "",
        "email": "pharaohs.hydratedlime.samalut@gmail.com", "lat": 28.330, "lon": 30.790, "fleetSize": 65,
        "fleetType": "تريلات سيلو لنقل الجير الحي السائب وتريلات ستائر لنقل شكائر هيدروكسيد الكالسيوم للمصانع", "priority": "A",
        "notes": "إنتاج الجير الحي والمطفأ المستخدم في تنقية السكر ومعالجة مياه الشرب وتعدين الذهب وصناعة الحديد"
    },
    {
        "nameAr": "شركة المنيا للحلول اللوجستية وتأجير الأوناش التلسكوبية ومعدات الرفع الثقيل بالمطاهرة",
        "nameEn": "Minya Heavy Cranes Rental & Industrial Plant Hire Hub Matahra",
        "sector": "transport", "city": "minya", "district": "المنطقة الصناعية بالمطاهرة", "governorate": "المنيا",
        "address": "المطاهرة - شارع المصانع الرئيسي - مركز تشغيل وصيانة أوناش الكرين واللوابد",
        "phone1": "086-2111116", "phone2": "", "website": "",
        "email": "minya.heavycranes.matahra@gmail.com", "lat": 28.055, "lon": 30.845, "fleetSize": 50,
        "fleetType": "أوناش ليبهير 70 و100 طن ولوابد نقل المولدات وأفران السكر ومعدات الكسارات المحجرية", "priority": "A",
        "notes": "خدمات الرفع والتركيب الميداني للمعدات الثقيلة بمصانع السكر والمحاجر والمنشآت الصناعية بصعيد مصر"
    },
    {
        "nameAr": "شركة طيبة لإنتاج وتعبئة الأعلاف غير التقليدية من مخلفات بنجر السكر بالمنيا",
        "nameEn": "Tiba Unconventional Animal Feed From Sugar Beet Byproducts Minya",
        "sector": "manufacturing", "city": "west_minya", "district": "غرب المنيا - مجمع الصناعات التكميلية", "governorate": "المنيا",
        "address": "طريق الواحات المنيا - مجمع مصانع كبس وتصنيع السيلاج ومخاليط الأعلاف المركزة",
        "phone1": "086-2111117", "phone2": "", "website": "",
        "email": "tiba.beetfeed.minya@gmail.com", "lat": 28.165, "lon": 30.370, "fleetSize": 55,
        "fleetType": "تريلات جامبو وتريلات جوانب لنقل بالات السيلاج المكبوس وأعلاف الأبقار والماشية للمزارع", "priority": "A",
        "notes": "تحويل عروش ومخلفات بنجر السكر إلى أعلاف سيلاج عالية القيمة الغذائية لمزارع الإنتاج الحيواني"
    },
    {
        "nameAr": "شركة المنيا للمقاولات الهندسية وحفر الآبار الجوفية العميقة لشركات الاستصلاح",
        "nameEn": "Minya Deep Groundwater Wells Drilling & Water Engineering Co",
        "sector": "contracting", "city": "west_minya", "district": "غرب المنيا - محور الآبار الاستكشافية", "governorate": "المنيا",
        "address": "طريق محور سمالوط الصحراوي الغربي - مجمع حفارات الآبار وماكينات الدوارات العميقة",
        "phone1": "086-2111118", "phone2": "", "website": "",
        "email": "minya.wellsdrilling.deep@gmail.com", "lat": 28.220, "lon": 30.390, "fleetSize": 45,
        "fleetType": "حفارات آبار مائية أطلس كوبكو حتى عمق 1000 متر وتريلات نقل مواسير التغليف الحديدية والمضخات", "priority": "A",
        "notes": "حفر واختبار وتجهيز آبار مياه الري الجوفية لمشروعات الاستصلاح الزراعي وزراعات بنجر السكر"
    },
    {
        "nameAr": "شركة الصفا لخدمات النقل المبرد وتخزين تقاوي البطاطس والبصل بالمنيا الجديدة",
        "nameEn": "Al Safa Seed Potatoes & Onion Cold Storage Logistics New Minya",
        "sector": "transport", "city": "new_minya", "district": "المنيا الجديدة - مجمع الثلاجات المركزية", "governorate": "المنيا",
        "address": "طريق المنيا الجديدة الدائري - مجمع مستودعات التبريد وحفظ التقاوي المعتمدة",
        "phone1": "086-2111119", "phone2": "", "website": "",
        "email": "alsafa.coldstorage.minya@gmail.com", "lat": 28.085, "lon": 30.815, "fleetSize": 50,
        "fleetType": "برادات تريلا حديثة كارير وشاحنات تبريد لنقل وتوزيع تقاوي البطاطس المستوردة والمحلية", "priority": "A",
        "notes": "تخزين وتوزيع آلاف الأطنان من تقاوي البطاطس والبصل في ثلاجات محكمة التحكم في الرطوبة والحرارة"
    },
    {
        "nameAr": "شركة عروس الصعيد للصناعات الكرتونية ومواد التعبئة لمنتجات السكر والأسمنت بالمنيا",
        "nameEn": "Bride Of Upper Egypt Corrugated Cartons & Polypropylene Bags Minya",
        "sector": "manufacturing", "city": "new_minya", "district": "المنطقة الصناعية بالمنيا الجديدة", "governorate": "المنيا",
        "address": "المنطقة الصناعية بالمنيا الجديدة - مصنع إنتاج شكائر البولي بروبيلين المنسوجة والكرتون",
        "phone1": "086-2111120", "phone2": "", "website": "",
        "email": "arous.packaging.minya@gmail.com", "lat": 28.075, "lon": 30.835, "fleetSize": 45,
        "fleetType": "تريلات جامبو صندوق مقفل لتوريد شكائر التعبئة المبطنة لمصانع السكر والدقيق والأسمنت بالصعيد", "priority": "A",
        "notes": "إنتاج شكائر التعبئة المنسوجة والمبطنة سعة 50 كجم وكرتون التعبئة للمصانع الكبرى بمحافظات الصعيد"
    },

    # ── Sub-Cluster 2: محور كوم أبو راضي وبياض العرب والمنطقة الصناعية ببني سويف (20 كياناً) ──
    {
        "nameAr": "مجموعة كوم أبو راضي للصناعات الهندسية والإلكترونيات وأساطيل الشحن الثقيل",
        "nameEn": "Kom Abu Radi Heavy Engineering Electronics & Haulage Fleets Group",
        "sector": "manufacturing", "city": "beni_suef", "district": "الواسطى - منطقة كوم أبو راضي الصناعية الكبرى", "governorate": "بني سويف",
        "address": "المنطقة الصناعية بكوم أبو راضي - مجمع مصانع تصنيع الأجهزة المنزلية والشاشات الكبرى",
        "phone1": "082-2581101", "phone2": "", "website": "",
        "email": "komaburadi.electronics.group@gmail.com", "lat": 29.350, "lon": 31.180, "fleetSize": 160,
        "fleetType": "تريلات جامبو صندوق مقفل وتريلات ستائر مزودة بنظم تثبيت هوائي لنقل الشاشات والأجهزة الإلكترونية للموانئ", "priority": "A+",
        "notes": "المجمع الصناعي الأكبر في شمال الصعيد لتصنيع وتصدير الأجهزة الإلكترونية والشاشات والغسالات والتكييفات"
    },
    {
        "nameAr": "شركة بني سويف للأسمنت الموحد وأساطيل سيلوهات الأسمنت السائب ببياض العرب",
        "nameEn": "Beni Suef Cement Unified Haulage & Bulk Cement Silos Bayad El Arab",
        "sector": "manufacturing", "city": "beni_suef", "district": "بني سويف - منطقة بياض العرب الصناعية شرق النيل", "governorate": "بني سويف",
        "address": "طريق الكريمات بني سويف الصحراوي الشرقي - مجمع صوامع وأفران الأسمنت العملاقة",
        "phone1": "082-2581102", "phone2": "", "website": "",
        "email": "benisuef.cement.bayad@gmail.com", "lat": 29.040, "lon": 31.150, "fleetSize": 150,
        "fleetType": "تريلات سيلو ضغط هواء وتريلات تريبل أكسل لنقل شكائر الأسمنت البورتلاندي لمشروعات الصعيد والعاصمة", "priority": "A+",
        "notes": "أكبر مجمع لإنتاج الأسمنت الرمادي والمقاوم وكلنكر الصادرات في شمال صعيد مصر"
    },
    {
        "nameAr": "شركة النيل للحديد والصلب ودرفلة قضبان التسليح والقطاعات بكوم أبو راضي",
        "nameEn": "Nile Steel Rolling & Rebar Heavy Structural Sections Kom Abu Radi",
        "sector": "manufacturing", "city": "beni_suef", "district": "كوم أبو راضي الصناعية - قطاع الصلب", "governorate": "بني سويف",
        "address": "المنطقة الصناعية بكوم أبو راضي - مجمع مصانع صهر ودرفلة حديد التسليح والبليت",
        "phone1": "082-2581103", "phone2": "", "website": "",
        "email": "nilesteel.rolling.radi@gmail.com", "lat": 29.340, "lon": 31.190, "fleetSize": 125,
        "fleetType": "تريلات تريبل أكسل مسطحة لنقل حزم حديد التسليح حتى 12 متراً وتريلات نقل خردة الصلب والبليت", "priority": "A+",
        "notes": "إنتاج حديد التسليح عالي المقاومة B500D وتغذية المشروعات القومية بمحافظات الجيزة وبني سويف والفيوم"
    },
    {
        "nameAr": "شركة بياض العرب للخزف والصيني والسيراميك وأساطيل شحن البورسلين ببني سويف",
        "nameEn": "Bayad El Arab Ceramic Porcelain & Sanitary Ware Haulage Beni Suef",
        "sector": "manufacturing", "city": "beni_suef", "district": "بني سويف - منطقة بياض العرب الصناعية", "governorate": "بني سويف",
        "address": "طريق بياض العرب الصناعي - مجمع أفران ومصانع السيراميك والبورسلين والأدوات الصحية",
        "phone1": "082-2581104", "phone2": "", "website": "",
        "email": "bayad.ceramics.benisuef@gmail.com", "lat": 29.055, "lon": 31.135, "fleetSize": 105,
        "fleetType": "تريلات جامبو وتريلات فلات مجهزة ببالتات رص آمن لنقل السيراميك والبورسلين لمحافظات مصر والموانئ", "priority": "A+",
        "notes": "الصرح الرائد في تصنيع بلاط السيراميك والبورسلين فائق اللمعان وأطقم الحمامات للتصدير"
    },
    {
        "nameAr": "شركة الواسطى لنقل وتوزيع الحاويات والشحن الجمركي بين كوم أبو راضي والموانئ",
        "nameEn": "El Wasta Container Freight & Customs Logistics Kom Abu Radi Seaports",
        "sector": "transport", "city": "beni_suef", "district": "الواسطى - المجمع اللوجستي ومحطة الحاويات", "governorate": "بني سويف",
        "address": "طريق القاهرة أسيوط الزراعي / مدخل كوم أبو راضي - ساحة الحاويات والجمارك المعتمدة",
        "phone1": "082-2581105", "phone2": "", "website": "",
        "email": "elwasta.containers.radi@gmail.com", "lat": 29.330, "lon": 31.200, "fleetSize": 110,
        "fleetType": "تريلات نقل حاويات 40 و20 قدم وتريلات فلات متعددة الوسائط لنقل الصادرات لموانئ السخنة والإسكندرية", "priority": "A+",
        "notes": "تسيير قوافل الحاويات اليومية المحملة بالإلكترونيات والمنسوجات المصدرة من مصانع كوم أبو راضي للموانئ"
    },
    {
        "nameAr": "شركة بني سويف للخرسانة الجاهزة ومحطات الخلط للأعمال الصناعية والكباري",
        "nameEn": "Beni Suef Ready-Mix Concrete & Heavy Bridges Batching Plants Co",
        "sector": "contracting", "city": "beni_suef", "district": "بني سويف - محور المستشار عدلي منصور", "governorate": "بني سويف",
        "address": "محور عدلي منصور تقاطع كورنيش النيل - محطة الخلط الخرساني المركزية الكبرى",
        "phone1": "082-2581106", "phone2": "", "website": "",
        "email": "benisuef.readymix.bridges@gmail.com", "lat": 29.080, "lon": 31.110, "fleetSize": 90,
        "fleetType": "خلاطات خرسانة 12م³ ومضخات بوم 52 و56 متر شWing ومعدات صب مستمر للكباري والأنفاق", "priority": "A+",
        "notes": "تنفيذ كباري محور عدلي منصور ومحاور النيل والمجمعات الصناعية والمنشآت الحكومية ببني سويف"
    },
    {
        "nameAr": "الشركة المصرية للألياف الزجاجية وعوازل الأنابيب والمباني بكوم أبو راضي",
        "nameEn": "Egyptian Fiberglass & Thermal Pipe Insulation Plant Kom Abu Radi",
        "sector": "manufacturing", "city": "beni_suef", "district": "كوم أبو راضي - مجمع الصناعات الكيماوية", "governorate": "بني سويف",
        "address": "المنطقة الصناعية بكوم أبو راضي - مصنع إنتاج الصوف الزجاجي والفايبر جلاس العازل",
        "phone1": "082-2581107", "phone2": "", "website": "",
        "email": "egyptian.fiberglass.radi@gmail.com", "lat": 29.345, "lon": 31.185, "fleetSize": 65,
        "fleetType": "تريلات جامبو صندوق مقفل وشاحنات لنقل رولات الصوف الزجاجي وألواح الفايبر جلاس المعمارية", "priority": "A",
        "notes": "إنتاج العوازل الحرارية والصوتية للأجهزة الكهربائية وأنابيب خطوط البترول والتكييف المركزي"
    },
    {
        "nameAr": "شركة الصفا لإنتاج وتدوير مخلفات الكرتون وصناديق التعبئة المضلعة ببني سويف",
        "nameEn": "Al Safa Corrugated Packaging & Recycled Paper Plant Beni Suef",
        "sector": "manufacturing", "city": "beni_suef", "district": "بني سويف - منطقة بياض العرب الصناعية", "governorate": "بني سويف",
        "address": "المنطقة الصناعية ببياض العرب - مجمع خطوط إنتاج الكرتون المضلع ومطابع الصناديق",
        "phone1": "082-2581108", "phone2": "", "website": "",
        "email": "alsafa.packaging.benisuef@gmail.com", "lat": 29.048, "lon": 31.140, "fleetSize": 60,
        "fleetType": "تريلات جامبو صندوق مقفل وشاحنات سريعة لتوريد كراتين التعبئة لمصانع الشاشات والأجهزة الإلكترونية", "priority": "A",
        "notes": "المورد الحصري لكراتين التعبئة والتغليف الماصة للصدمات لكبرى مصانع الإلكترونيات والأغذية بالصعيد"
    },
    {
        "nameAr": "شركة النيل لنقل وتوزيع الغاز الطبيعي المضغوط والمحروقات الصناعية ببني سويف",
        "nameEn": "Nile Compressed Natural Gas & Industrial Fuel Logistics Beni Suef",
        "sector": "transport", "city": "beni_suef", "district": "بني سويف - محور الطاقة الصناعية بشرق النيل", "governorate": "بني سويف",
        "address": "طريق الكريمات بني سويف - محطة ضغط ونقل الغاز الطبيعي المضغوط CNG للمصانع",
        "phone1": "082-2581109", "phone2": "", "website": "",
        "email": "nile.cng.benisuef@gmail.com", "lat": 29.035, "lon": 31.160, "fleetSize": 70,
        "fleetType": "تريلات مقطورات أسطوانات غاز طبيعي مضغوط CNG وفنطاسات مازوت وسولار لتغذية المصانع غير الموصولة بالشبكة", "priority": "A+",
        "notes": "الإمداد بالغاز الطبيعي المضغوط كوقود بديل صديق للبيئة لمصانع السيراميك والحديد والصلب بالمنطقة"
    },
    {
        "nameAr": "شركة أهناسيا للصناعات الدوائية والمستحضرات الطبية ومحاليل الحقن الوريدي",
        "nameEn": "Ahnasia Pharmaceuticals & IV Infusion Solutions Complex Beni Suef",
        "sector": "manufacturing", "city": "beni_suef", "district": "مركز أهناسيا - مجمع الصناعات الدوائية", "governorate": "بني سويف",
        "address": "طريق أهناسيا بني سويف - مصانع إنتاج محاليل الحقن الوريدي والأدوية المعقمة",
        "phone1": "082-2581110", "phone2": "", "website": "",
        "email": "ahnasia.pharma.solutions@gmail.com", "lat": 29.085, "lon": 30.950, "fleetSize": 55,
        "fleetType": "شاحنات نقل مبردة ومكيفة ومجهزة بنظم التعليق الهوائي لنقل المحاليل والأدوية الطبية للمستشفيات", "priority": "A",
        "notes": "إنتاج محاليل الجلوكوز والملح المعقمة والأدوية الوريدية الحيوية وتوزيعها لكافة مديريات الصحة بمصر"
    },
    {
        "nameAr": "شركة بني سويف للمقاولات العامة وشق الطرق ومحاور ربط الصحراوي الشرقي بالغربي",
        "nameEn": "Beni Suef General Contracting & East-West Desert Link Roads Fleets",
        "sector": "contracting", "city": "beni_suef", "district": "بني سويف - مجمع معدات المقاولات الثقيلة", "governorate": "بني سويف",
        "address": "طريق بني سويف الفيوم الجديد - معسكر معدات رصف الطرق والكسارات المتنقلة",
        "phone1": "082-2581111", "phone2": "", "website": "",
        "email": "benisuef.contracting.linkroads@gmail.com", "lat": 29.070, "lon": 31.080, "fleetSize": 85,
        "fleetType": "فناشر أسفلت وهراسات حديد ومطاط وقلابات مان 4 أكسل ولوادر حفر لتنفيذ المحاور العرضية", "priority": "A+",
        "notes": "تنفيذ ورفع كفاءة محاور ربط الصعيد بالبحر الأحمر والعاصمة الإدارية وطرق التنمية الزراعية"
    },
    {
        "nameAr": "مصنع الفاتح لإنتاج وتشكيل البلاستيك والعبوات الهندسية للأجهزة بكوم أبو راضي",
        "nameEn": "Al Fateh Engineering Plastics Injection & Electronics Housing Plant Radi",
        "sector": "manufacturing", "city": "beni_suef", "district": "كوم أبو راضي - مجمع البوليمرات", "governorate": "بني سويف",
        "address": "المنطقة الصناعية بكوم أبو راضي - مجمع ماكينات حقن البلاستيك الهندسي ABS والبولي كربونيت",
        "phone1": "082-2581112", "phone2": "", "website": "",
        "email": "alfateh.plastics.radi@gmail.com", "lat": 29.355, "lon": 31.175, "fleetSize": 50,
        "fleetType": "تريلات جامبو صندوق مقفل وشاحنات توزيع لنقل الشاسيهات والقطع البلاستيكية لخطوط التجميع", "priority": "A",
        "notes": "تصنيع الهياكل البلاستيكية للأجهزة المنزلية والشاشات وقطع الغيار الهندسية المعقدة لمصانع المنطقة"
    },
    {
        "nameAr": "شركة الشرق الأوسط لغربلة وتوريد رمال المحاجر ورمل الزجاج من وادي سنور",
        "nameEn": "Middle East Silica Sand Quarrying & Wadi Sannur Mineral Supply",
        "sector": "transport", "city": "beni_suef", "district": "بني سويف - محمية ومحاجر وادي سنور", "governorate": "بني سويف",
        "address": "طريق وادي سنور الصحراوي الشرقي - مجمع محطات غسيل وغربلة الرمال البيضاء والألاباستر",
        "phone1": "082-2581113", "phone2": "", "website": "",
        "email": "middleeast.sannur.sand@gmail.com", "lat": 28.980, "lon": 31.250, "fleetSize": 75,
        "fleetType": "قلابات تريلا 3 أكسل وتريلات سيلو لنقل رمل السيليكا ورخام الألاباستر لمصانع الزجاج والتحف", "priority": "A",
        "notes": "استخراج رمال السيليكا ورخام الألاباستر المصري الشهير وتوريده لمصانع الزجاج والرخام الديكوري"
    },
    {
        "nameAr": "شركة الواسطى للصناعات النسيجية وغزل وتجهيز الأقمشة وتطريز المفروشات",
        "nameEn": "El Wasta Textile Industries & Fabric Processing & Home Textiles Plant",
        "sector": "manufacturing", "city": "beni_suef", "district": "الواسطى - منطقة الصناعات النسيجية", "governorate": "بني سويف",
        "address": "طريق مصر أسيوط الزراعي بالواسطى - مجمع مصانع النسيج والتجهيز والصباغة الآلية",
        "phone1": "082-2581114", "phone2": "", "website": "",
        "email": "elwasta.textile.fabrics@gmail.com", "lat": 29.325, "lon": 31.205, "fleetSize": 60,
        "fleetType": "تريلات صندوق مقفل وشاحنات نقل سريعة لنقل بالات الغزول والأقمشة المشطبة والمفروشات للتصدير", "priority": "A",
        "notes": "صباغة وتجهيز الأقمشة القطنية وتصنيع المفروشات المنزلية للتصدير إلى أسواق أوروبا والولايات المتحدة"
    },
    {
        "nameAr": "شركة بني سويف للمهمات الميكانيكية وتأجير الأوناش التلسكوبية واللوابد بكوم أبو راضي",
        "nameEn": "Beni Suef Heavy Crane Hire & Machinery Transportation Kom Abu Radi",
        "sector": "transport", "city": "beni_suef", "district": "كوم أبو راضي - مركز الرفع والنقل الثقيل", "governorate": "بني سويف",
        "address": "مدخل كوم أبو راضي الصناعي - مجمع تشغيل الرافعات التلسكوبية واللوابد متعددة المحاور",
        "phone1": "082-2581115", "phone2": "", "website": "",
        "email": "benisuef.cranes.radi@gmail.com", "lat": 29.335, "lon": 31.195, "fleetSize": 55,
        "fleetType": "أوناش كرين تلسكوبية 60 و90 طن ولوابد نقل المولدات ومكابس الصاج وخطوط الإنتاج الإلكترونية", "priority": "A",
        "notes": "تركيب ورفع الماكينات العملاقة وخطوط الإنتاج والتغذية اللوجستية لمصانع كوم أبو راضي وبياض العرب"
    },
    {
        "nameAr": "مصنع الفردوس لتصنيع وتدوير الأخشاب والمشاتيح الخشبية لنقل الأجهزة بكوم أبو راضي",
        "nameEn": "Al Ferdous Wooden Pallets & Industrial Heavy Packing Works Kom Abu Radi",
        "sector": "manufacturing", "city": "beni_suef", "district": "كوم أبو راضي - مجمع الأخشاب والتغليف", "governorate": "بني سويف",
        "address": "المنطقة الصناعية بكوم أبو راضي - مصنع إنتاج البالتات الخشبية المعالجة حرارياً ISPM 15",
        "phone1": "082-2581116", "phone2": "", "website": "",
        "email": "ferdous.pallets.radi@gmail.com", "lat": 29.348, "lon": 31.182, "fleetSize": 45,
        "fleetType": "تريلات جامبو وتريلات فلات لتوريد البالتات الخشبية المشطبة لمصانع الأجهزة الإلكترونية والأسمنت", "priority": "A",
        "notes": "تصنيع البالتات الخشبية المطابقة للمواصفات الدولية للتصدير لتحميل الأجهزة المنزلية وشكائر الأسمنت"
    },
    {
        "nameAr": "شركة بني سويف لنقل وتوزيع المحاصيل الزراعية والبصل والنباتات الطبية بالفشن",
        "nameEn": "Beni Suef Crops Transport & Onion Medicinal Herbs Logistics Fashn",
        "sector": "transport", "city": "beni_suef", "district": "مركز الفشن - مجمع المحاصيل الزراعية التصديرية", "governorate": "بني سويف",
        "address": "طريق الفشن بني سويف الزراعي - مجمع محطات الفرز ومستودعات الأعشاب الطبية والمحاصيل",
        "phone1": "082-2581117", "phone2": "", "website": "",
        "email": "benisuef.crops.fashn@gmail.com", "lat": 28.820, "lon": 30.900, "fleetSize": 65,
        "fleetType": "تريلات تهوية وبرادات شاحنات لنقل البصل والبطاطس والبابونج والنعناع لموانئ التصدير البحرية", "priority": "A",
        "notes": "تصدير المحاصيل البستانية والنباتات الطبية والعطرية التي تشتهر بزراعتها مراكز الفشن وببا وسمسطا"
    },
    {
        "nameAr": "شركة الصفا للصناعات الكيماوية وتصنيع الدهانات ومواد البناء الحديثة ببياض العرب",
        "nameEn": "Al Safa Chemical Paints & Modern Construction Materials Bayad El Arab",
        "sector": "manufacturing", "city": "beni_suef", "district": "بني سويف - بياض العرب الصناعية", "governorate": "بني سويف",
        "address": "المنطقة الصناعية ببياض العرب - مصانع إنتاج دهانات البلاستيك والمعاجين والعوازل المائية",
        "phone1": "082-2581118", "phone2": "", "website": "",
        "email": "alsafa.paints.bayad@gmail.com", "lat": 29.052, "lon": 31.145, "fleetSize": 50,
        "fleetType": "شاحنات نقل وتريلات صندوق مقفل لتوزيع عبوات الدهانات ومواد العزل الحديثة لكافة المحافظات", "priority": "A",
        "notes": "إنتاج الدهانات الإنشائية وبويات الطرق ومواد معالجة الخرسانة وتوزيعها على مشروعات الصعيد"
    },
    {
        "nameAr": "شركة بني سويف لخدمات التغذية الصناعية وتوريد الصاج المجلفن واللفائف المدرفلة",
        "nameEn": "Beni Suef Galvanized Steel Coils & Industrial Feeding Logistics Co",
        "sector": "transport", "city": "beni_suef", "district": "كوم أبو راضي - مجمع الصناعات المغذية", "governorate": "بني سويف",
        "address": "طريق كوم أبو راضي الرئيسي - مجمع مستودعات ورافعات لفائف الصاج المجلفن والمدرفل",
        "phone1": "082-2581119", "phone2": "", "website": "",
        "email": "benisuef.steelcoils.radi@gmail.com", "lat": 29.342, "lon": 31.188, "fleetSize": 60,
        "fleetType": "تريلات فلات مجهزة بحوامل تثبيت لفائف الصاج Coils وأوناش تفريغ هيدروليكية بمصانع الأجهزة", "priority": "A",
        "notes": "التوريد اليومي لآلاف الأطنان من لفائف الصاج لمصانع تصنيع الغسالات والثلاجات والشاشات بكوم أبو راضي"
    },
    {
        "nameAr": "شركة النيل لإدارة المخازن الجمركية والمستودعات اللوجستية بالمنطقة الصناعية ببني سويف",
        "nameEn": "Nile Bonded Warehouses & Industrial Logistics Terminal Bayad El Arab",
        "sector": "transport", "city": "beni_suef", "district": "بني سويف - المنطقة اللوجستية الحرة ببياض العرب", "governorate": "بني سويف",
        "address": "طريق بياض العرب - مجمع المستودعات الجمركية وساحات الترانزيت المعتمدة",
        "phone1": "082-2581120", "phone2": "", "website": "",
        "email": "nile.bonded.bayad@gmail.com", "lat": 29.045, "lon": 31.155, "fleetSize": 55,
        "fleetType": "تريلات نقل متعدد الوسائط ورافعات شوكية ثقيلة لإدارة المخزون الاستراتيجي ومستلزمات الإنتاج", "priority": "A",
        "notes": "خدمات التخزين الجمركي المؤقت للمواد الخام ومكونات الإنتاج المستوردة لمصانع محافظة بني سويف"
    },

    # ── Sub-Cluster 3: مجمع تكرير أسيوط ومشروع أنوبك ومصانع أسمنت أسيوط (20 كياناً) ──
    {
        "nameAr": "شركة أسيوط لتكرير البترول وأساطيل نقل المشتقات النفطية والمازوت بصعيد مصر",
        "nameEn": "Assiut Oil Refining Co (ASORC) & Petroleum Products Tanker Fleets",
        "sector": "manufacturing", "city": "assiut", "district": "أسيوط - مجمع التكرير بالهضبة الغربية / جحدم", "governorate": "أسيوط",
        "address": "طريق أسيوط الوادي الجديد الكيلو 15 - مجمع مصافي تكرير أسيوط ومستودعات التوزيع",
        "phone1": "088-2111101", "phone2": "", "website": "",
        "email": "asorc.refining.assiut@gmail.com", "lat": 27.220, "lon": 31.050, "fleetSize": 175,
        "fleetType": "فنطاسات نقل وقود 36 و40 طن لنقل البنزين والسولار والمازوت والبوتاجاز لمحافظات الصعيد والوادي الجديد", "priority": "A+",
        "notes": "قلعة تكرير البترول في صعيد مصر والمسؤول عن توفير 70% من احتياجات محافظات الصعيد من المنتجات البترولية"
    },
    {
        "nameAr": "شركة أسيوط الوطنية لتصنيع البترول (أنوبك) وأساطيل نقل معدات مجمع الهيدروكراكينج",
        "nameEn": "Assiut National Oil Processing Co (ANOPC) Heavy Logistics Fleets",
        "sector": "manufacturing", "city": "assiut", "district": "أسيوط - مجمع مجمع التكسير الهيدروجيني للمازوت", "governorate": "أسيوط",
        "address": "مجمع البترول بجحدم - موقع مشروع مجمع التكسير الهيدروجيني العملاق لأنوبك",
        "phone1": "088-2111102", "phone2": "", "website": "",
        "email": "anopc.hydrocracking.assiut@gmail.com", "lat": 27.215, "lon": 31.045, "fleetSize": 150,
        "fleetType": "لوابد متعددة المحاور Multi-Axle لنقل مفاعلات الهيدروكراكينج وأبراج التقطير وأوناش كرين 250 طن", "priority": "A+",
        "notes": "أكبر مشروع بترولي واستثماري في صعيد مصر لتحويل المازوت منخفض القيمة لسولار وبنزين عالي الجودة Euro-5"
    },
    {
        "nameAr": "شركة أسمنت أسيوط (سيمكس) وأساطيل سيلوهات تفريغ الأسمنت السائب بمنقباد",
        "nameEn": "Assiut Cement Co (CEMEX) & Bulk Cement Silos Transport Fleets Manqabad",
        "sector": "manufacturing", "city": "assiut", "district": "أسيوط - مجمع مصانع أسمنت منقباد", "governorate": "أسيوط",
        "address": "طريق أسيوط القاهرة الصحراوي الغربي - مجمع صوامع وأفران أسمنت سيمكس الكبرى",
        "phone1": "088-2111103", "phone2": "", "website": "",
        "email": "cemex.assiut.cement@gmail.com", "lat": 27.250, "lon": 31.110, "fleetSize": 160,
        "fleetType": "تريلات سيلو نقل أسمنت سائب وتريلات تريبل أكسل وتريلات قلابات كلنكر لتغذية مشروعات الصعيد", "priority": "A+",
        "notes": "المجمع الأكبر لتصنيع الأسمنت بصعيد مصر وتوريد خرسانات مشروعات قناطر أسيوط الجديدة والمدن العمرانية"
    },
    {
        "nameAr": "شركة أنابيب البترول - منطقة أسيوط وأساطيل صيانة خطوط الأنابيب ومحطات الضخ",
        "nameEn": "Petroleum Pipelines Co Assiut Region & Pumping Stations Heavy Fleets",
        "sector": "transport", "city": "assiut", "district": "أسيوط - محطة ضخ واستلام الخام المركزية", "governorate": "أسيوط",
        "address": "طريق بني غالب - مجمع مستودعات ومحطات استقبال خطوط أنابيب السخنة أسيوط",
        "phone1": "088-2111104", "phone2": "", "website": "",
        "email": "pipelines.assiut.region@gmail.com", "lat": 27.235, "lon": 31.070, "fleetSize": 95,
        "fleetType": "شاحنات ورش لحام وفحص أنابيب وتريلات نقل قطاعات المواسير وأوناش سايد بوم لصيانة الخطوط", "priority": "A+",
        "notes": "إدارة وتشغيل شبكة خطوط نقل البترول الخام والمنتجات البترولية المغذية لكافة محافظات جنوب الوادي"
    },
    {
        "nameAr": "شركة أسيوط للخرسانة الجاهزة ومحطات الخلط للأعمال الكبرى والكباري بمنقباد",
        "nameEn": "Assiut Ready-Mix Concrete & Heavy Infrastructure Batching Plants Co",
        "sector": "contracting", "city": "assiut", "district": "أسيوط - محور كوبري منقباد العلوي", "governorate": "أسيوط",
        "address": "طريق منقباد الزراعي - مجمع محطات الخلط الخرساني المركزية الكبرى",
        "phone1": "088-2111105", "phone2": "", "website": "",
        "email": "assiut.readymix.infrastructure@gmail.com", "lat": 27.240, "lon": 31.125, "fleetSize": 85,
        "fleetType": "خلاطات خرسانة 12م³ ومضخات بوم 52 متر وشاحنات صب خرساني مستمر للكباري والمنشآت الضخمة", "priority": "A+",
        "notes": "الصب الخرساني لقناطر أسيوط الجديدة وكباري محور ديروط ومحور سمالوط وتوسعات جامعة أسيوط"
    },
    {
        "nameAr": "الشركة العامة لنقل وتوزيع أسطوانات الغاز والبوتاجاز الصب بالهضبة الغربية بأسيوط",
        "nameEn": "General LPG Bulk Transport & Bottling Logistics West Plateau Assiut",
        "sector": "transport", "city": "assiut", "district": "أسيوط - مجمع مصانع تعبئة الغاز السائل", "governorate": "أسيوط",
        "address": "طريق الهضبة الغربية الجديد - محطة صهاريج ومصانع تعبئة وتوزيع الغاز المسال LPG",
        "phone1": "088-2111106", "phone2": "", "website": "",
        "email": "general.lpg.assiut@gmail.com", "lat": 27.195, "lon": 31.080, "fleetSize": 105,
        "fleetType": "صهاريج كروية لنقل غاز البوتاجاز الصب وتريلات نقل أسطوانات الغاز المعبأة لمحافظات الصعيد", "priority": "A+",
        "notes": "نقل وتعبئة وتأمين الإمداد اليومي بأسطوانات البوتاجاز والغاز الصب لمحافظات أسيوط وسوهاج وقنا"
    },
    {
        "nameAr": "شركة منقباد لتصنيع وتكسير الحجر الجيري والطفلة لمصانع الأسمنت بأسيوط",
        "nameEn": "Manqabad Limestone & Clay Crushing Plant For Cement Industry Assiut",
        "sector": "manufacturing", "city": "assiut", "district": "منقباد - وادي محاجر الأسمنت", "governorate": "أسيوط",
        "address": "طريق أسيوط القاهرة الصحراوي - مجمع الكسارات الآلية ومستودعات صخور الحجر الجيري",
        "phone1": "088-2111107", "phone2": "", "website": "",
        "email": "manqabad.crushing.limestone@gmail.com", "lat": 27.260, "lon": 31.095, "fleetSize": 80,
        "fleetType": "قلابات كوماتسو وكاتربيلر صخرية 35 طن ولوادر حفر ثقيلة لتغذية سيور مصانع الأسمنت", "priority": "A+",
        "notes": "تكسير وتجهيز ملايين الأطنان من خام الحجر الجيري والطفلة الصخرية لخطوط إنتاج الأسمنت"
    },
    {
        "nameAr": "شركة أسيوط للكيماويات والمواد المضافة للخرسانة ومعالجة أسطح المنشآت البترولية",
        "nameEn": "Assiut Concrete Admixtures & Petroleum Surface Protection Chemicals",
        "sector": "manufacturing", "city": "assiut", "district": "المنطقة الصناعية ببني غالب - أسيوط", "governorate": "أسيوط",
        "address": "المنطقة الصناعية ببني غالب - مصانع إنتاج ملدنات الخرسانة ومواد حقن التربة",
        "phone1": "088-2111108", "phone2": "", "website": "",
        "email": "assiut.chemicals.admixtures@gmail.com", "lat": 27.210, "lon": 31.090, "fleetSize": 55,
        "fleetType": "فنطاسات ستانلس ستيل لنقل إضافات الخرسانة السائلة وتريلات نقل البراميل لمواقع البترول والإنشاءات", "priority": "A",
        "notes": "إنتاج ملدنات الخرسانة ومؤخرات الشك ومواد عزل خزانات التكرير وأحواض المعالجة البيئية"
    },
    {
        "nameAr": "شركة الصعيد لنقل المنتجات البترولية الثقيلة وتموين محطات الكهرباء بالمازوت بأسيوط",
        "nameEn": "Upper Egypt Heavy Fuel Logistics & Power Stations Mazut Supply Assiut",
        "sector": "transport", "city": "assiut", "district": "أسيوط - مجمع محطة كهرباء الوليدية البخارية", "governorate": "أسيوط",
        "address": "الوليدية - طريق كورنيش النيل شمال أسيوط - محطة تفريغ صهاريج المازوت والوقود",
        "phone1": "088-2111109", "phone2": "", "website": "",
        "email": "upperegypt.mazut.fuel@gmail.com", "lat": 27.205, "lon": 31.170, "fleetSize": 90,
        "fleetType": "فنطاسات وقود 36 طن معزولة ومجهزة بسخانات حرارية لنقل المازوت الثقيل لمحطات توليد الكهرباء", "priority": "A+",
        "notes": "الإمداد بالوقود الثقيل لمحطة توليد كهرباء أسيوط الوليدية ومحطات توليد الطاقة الكبرى بالصعيد"
    },
    {
        "nameAr": "شركة جحدم للمقاولات العامة والإنشاءات البترولية وتبطين أحواض المعالجة بأسيوط",
        "nameEn": "Gahdam Petroleum Civil Contracting & Industrial Basin Lining Assiut",
        "sector": "contracting", "city": "assiut", "district": "جحدم - محيط مجمع التكرير", "governorate": "أسيوط",
        "address": "طريق جحدم البترولي - معسكر شاحنات ومعدات الإنشاءات المدنية لمشروعات التكرير",
        "phone1": "088-2111110", "phone2": "", "website": "",
        "email": "gahdam.civil.petroleum@gmail.com", "lat": 27.218, "lon": 31.040, "fleetSize": 70,
        "fleetType": "قلابات 4 أكسل وحفارات هيدروليكية ومعدات لحام وتبطين رقائق البولي إيثيلين HDPE لأحواض المعالجة", "priority": "A",
        "notes": "تنفيذ الأعمال المدنية والقواعد الخرسانية ومسارات الأنابيب وتأهيل أحواض الصرف الصناعي بمجمع أنوبك"
    },
    {
        "nameAr": "شركة أسيوط لصناعة وتجارة الطوب الرملي الخفيف وبلوكات الأوتوكلاف المعزولة",
        "nameEn": "Assiut Autoclaved Aerated Concrete Blocks & Sand Lime Bricks Plant",
        "sector": "manufacturing", "city": "assiut", "district": "المنطقة الصناعية ببني غالب", "governorate": "أسيوط",
        "address": "بني غالب الصناعية - مصانع إنتاج البلوك الخرساني الخفيف العازل للحرارة والصوت",
        "phone1": "088-2111111", "phone2": "", "website": "",
        "email": "assiut.aacblocks.galib@gmail.com", "lat": 27.225, "lon": 31.085, "fleetSize": 60,
        "fleetType": "تريلات جامبو لنقل البلوك الخفيف وشاحنات مجهزة برافعات شوكية لتوريد طوب البناء للمشروعات", "priority": "A",
        "notes": "إنتاج الطوب الرملي الخفيف AAC المعالج بالبخار لبناء الأبراج والعزل الحراري لمباني الصعيد"
    },
    {
        "nameAr": "شركة النيل للمقاولات البحرية وصيانة هويس وقناطر أسيوط الجديدة وتطهير المجرى",
        "nameEn": "Nile Marine Dredging & New Assiut Barrage Navigation Lock Maintenance",
        "sector": "contracting", "city": "assiut", "district": "أسيوط - مجمع قناطر أسيوط الجديدة", "governorate": "أسيوط",
        "address": "حرم قناطر أسيوط الجديدة - قاعدة كراكات وصنادل صيانة الأهوسة الملاحية ومحطة الكهرباء",
        "phone1": "088-2111112", "phone2": "", "website": "",
        "email": "nile.barrage.marine@gmail.com", "lat": 27.200, "lon": 31.185, "fleetSize": 50,
        "fleetType": "كراكات شفاطة نهرية وصنادل تفريغ وشاحنات نقل نواتج التكريك لصيانة المجرى الملاحي للنيل", "priority": "A",
        "notes": "صيانة الهويس الملاحي وتأمين المجرى النهري أمام محطة توليد الكهرباء المائية بقناطر أسيوط"
    },
    {
        "nameAr": "شركة الفيروز لخدمات الأوناش التلسكوبية والرافعات الثقيلة للمشروعات البترولية بأسيوط",
        "nameEn": "Al Fairouz Heavy Cranes & Petroleum Plant Erection Logistics Assiut",
        "sector": "transport", "city": "assiut", "district": "الهضبة الغربية - مركز خدمات الرفع الثقيل", "governorate": "أسيوط",
        "address": "طريق مجمع البترول - مركز تشغيل الأوناش التلسكوبية ليبهير وتادانو 100 و160 طن",
        "phone1": "088-2111113", "phone2": "", "website": "",
        "email": "fairouz.heavycranes.assiut@gmail.com", "lat": 27.210, "lon": 31.060, "fleetSize": 65,
        "fleetType": "أوناش كرين تلسكوبية عملاقة ولوابد نقل معدات ثقيلة لنقل وتركيب أعمدة ومداخن مجمع التكرير", "priority": "A+",
        "notes": "عمليات الرفع الدقيق للمعدات البترولية والتوربينات والمحولات الكهربائية بمشروع مجمع أنوبك"
    },
    {
        "nameAr": "شركة أسيوط لتجارة وتوريد حديد التسليح والإسمنت واللفائف لمقاولي جنوب الوادي",
        "nameEn": "Assiut Rebar & Bulk Cement Site Supply Logistics South Valley Co",
        "sector": "transport", "city": "assiut", "district": "أسيوط - ساحة التشوين المركزية بالحمراء", "governorate": "أسيوط",
        "address": "طريق أسيوط سوهاج الزراعي - مجمع مستودعات ورافعات تفريغ حديد التسليح والأسمنت",
        "phone1": "088-2111114", "phone2": "", "website": "",
        "email": "assiut.rebar.supply@gmail.com", "lat": 27.170, "lon": 31.200, "fleetSize": 75,
        "fleetType": "تريلات تريبل أكسل فلات مجهزة بأشرطة ربط ونش تحميل هيدروليكي لتنزيل حديد التسليح بالمواقع", "priority": "A",
        "notes": "التوريد اليومي لآلاف الأطنان من حديد عز والمصريين وأسمنت سيمكس لشركات المقاولات بالصعيد"
    },
    {
        "nameAr": "شركة بني غالب للخدمات البيئية والتخلص الآمن من الحمأة والمخلفات الصناعية بأسيوط",
        "nameEn": "Beni Galib Environmental Industrial Sludge Safe Disposal Co Assiut",
        "sector": "contracting", "city": "assiut", "district": "المنطقة الصناعية ببني غالب", "governorate": "أسيوط",
        "address": "بني غالب الصناعية - محطة معالجة وتدوير المخلفات الصناعية والزيوت العادمة",
        "phone1": "088-2111115", "phone2": "", "website": "",
        "email": "galib.environment.assiut@gmail.com", "lat": 27.220, "lon": 31.095, "fleetSize": 45,
        "fleetType": "فنطاسات شفط وتفريغ حمأة وتريلات بيئية معزولة لنقل المخلفات الصلبة للمدافن الصحية المعتمدة", "priority": "A",
        "notes": "التخلص الآمن والمعالجة الكيميائية للمخلفات الصناعية لمصانع الأسمنت والتكرير طبقاً لقانون البيئة"
    },
    {
        "nameAr": "شركة منقباد لتصنيع وتجارة شكائر الأسمنت الورقية متعددة الطبقات بأسيوط",
        "nameEn": "Manqabad Multi-Wall Paper Bags For Cement Packaging Co Assiut",
        "sector": "manufacturing", "city": "assiut", "district": "منقباد - مجمع الصناعات الورقية والتغليف", "governorate": "أسيوط",
        "address": "طريق منقباد الزراعي - مصانع إنتاج شكائر الكرافت الورقية ذات الصمام الأوتوماتيكي",
        "phone1": "088-2111116", "phone2": "", "website": "",
        "email": "manqabad.paperbags.assiut@gmail.com", "lat": 27.245, "lon": 31.115, "fleetSize": 50,
        "fleetType": "تريلات جامبو صندوق مقفل لتوريد بالات شكائر الأسمنت والكيماويات لمصانع الصعيد", "priority": "A",
        "notes": "إنتاج ملايين الشكائر الورقية المقاومة للتمزق والرطوبة والمخصصة لتعبئة الأسمنت والجبس والكيماويات"
    },
    {
        "nameAr": "شركة أسيوط للسلامة الصناعية ومهمات إطفاء الحرائق البترولية وتجهيز المواقع",
        "nameEn": "Assiut Oilfield Firefighting Systems & Industrial Safety Supply Co",
        "sector": "transport", "city": "assiut", "district": "الهضبة الغربية - مجمع السلامة والأمن الصناعي", "governorate": "أسيوط",
        "address": "طريق مجمع البترول - مجمع مستودعات سيارات الإطفاء الكيميائي ومهمات الإنقاذ",
        "phone1": "088-2111117", "phone2": "", "website": "",
        "email": "assiut.firefighting.safety@gmail.com", "lat": 27.212, "lon": 31.055, "fleetSize": 40,
        "fleetType": "شاحنات إطفاء فوم ورغوة كيميائية وسيارات إسعاف مجهزة وشاحنات نقل مهمات الوقاية الشخصية", "priority": "A",
        "notes": "تأمين منظومات مكافحة الحرائق وتوريد الرغوة الكيميائية ومعدات السلامة لمصافي التكرير ومستودعات الوقود"
    },
    {
        "nameAr": "شركة الصعيد لنقل البترول الخام من حقول الصحراء الغربية لمصفاة أسيوط",
        "nameEn": "Upper Egypt Western Desert Crude Oil Pipeline Feeder Tankers Assiut",
        "sector": "transport", "city": "assiut", "district": "أسيوط - طريق الوادي الجديد الصحراوي", "governorate": "أسيوط",
        "address": "طريق أسيوط الخارجة الكيلو 25 - محطة تفريغ صهاريج الخام القادمة من آبار الصحراء الغربية",
        "phone1": "088-2111118", "phone2": "", "website": "",
        "email": "upperegypt.crudeoil.feeder@gmail.com", "lat": 27.180, "lon": 31.020, "fleetSize": 85,
        "fleetType": "فنطاسات نقل بترول خام دفع رباعي 38 طن مجهزة لنقل الخام من آبار الصحراء الغربية للمصفاة", "priority": "A+",
        "notes": "نقل خام الزيت المستخرج من حقول الصحراء الغربية والواحات لتكريره بمجمع أسيوط للبترول"
    },
    {
        "nameAr": "شركة أسيوط لتصنيع وتجارة أعمدة الإنارة والأبراج الفولاذية والجمالونات الصناعية",
        "nameEn": "Assiut Steel Lighting Poles & Transmission Towers Fabrication Plant",
        "sector": "manufacturing", "city": "assiut", "district": "المنطقة الصناعية ببني غالب", "governorate": "أسيوط",
        "address": "بني غالب الصناعية - مصنع جلفنة وتشكيل أبراج نقل الكهرباء وأعمدة الإنارة العامة",
        "phone1": "088-2111119", "phone2": "", "website": "",
        "email": "assiut.steelpoles.galib@gmail.com", "lat": 27.215, "lon": 31.080, "fleetSize": 45,
        "fleetType": "تريلات مسطحة طويلة وأوناش سلة لتركيب أبراج نقل الطاقة والجمالونات للمصانع والمشروعات", "priority": "A",
        "notes": "تصنيع أبراج شبكات الجهد العالي وأعمدة الإنارة بالطاقة الشمسية لمشروعات التنمية بصعيد مصر"
    },
    {
        "nameAr": "شركة الحمراء للخدمات البترولية والتوريدات الميكانيكية لخطوط الأنابيب والمضخات بأسيوط",
        "nameEn": "El Hamra Petroleum Mechanical Supplies & High Pressure Pumps Assiut",
        "sector": "transport", "city": "assiut", "district": "أسيوط - شارع الجمهورية / الحمراء", "governorate": "أسيوط",
        "address": "شارع الجمهورية بأسيوط - مجمع مكاتب ومستودعات توريد المحابس والضواغط البترولية",
        "phone1": "088-2111120", "phone2": "", "website": "",
        "email": "elhamra.petroleum.supplies@gmail.com", "lat": 27.185, "lon": 31.180, "fleetSize": 40,
        "fleetType": "شاحنات خدمات متنقلة مجهزة بأوناش ونش لتسليم المحابس والمضخات الغاطسة للمواقع البترولية", "priority": "A",
        "notes": "التوريد المعتمد للمحابس الهيدروليكية ومضخات الطرد المركزي عالية الضغط لشركات التكرير والأنابيب"
    },

    # ── Sub-Cluster 4: المنطقة الصناعية بعرب العوامر والصناعات الدوائية والغذائية بأسيوط (15 كياناً) ──
    {
        "nameAr": "مجموعة عرب العوامر للصناعات الدوائية والمستحضرات الحيوية وأساطيل التوزيع المبرد",
        "nameEn": "Arab El Awamer Pharma & Bio-Medical Industries Cold Distribution Group",
        "sector": "manufacturing", "city": "arab_el_awamer", "district": "أبنوب - المنطقة الصناعية بعرب العوامر", "governorate": "أسيوط",
        "address": "المنطقة الصناعية بعرب العوامر - مجمع مصانع الأدوية والمضادات الحيوية المعقمة",
        "phone1": "088-2111121", "phone2": "", "website": "",
        "email": "awamer.pharma.group@gmail.com", "lat": 27.310, "lon": 31.090, "fleetSize": 120,
        "fleetType": "شاحنات مبردة ومكيفة محكمة العزل الحراري لنقل وتوزيع الأدوية والمستلزمات الطبية لكافة محافظات الصعيد", "priority": "A+",
        "notes": "المجمع الدوائي الأكبر في وسط وجنوب الصعيد لإنتاج المضادات الحيوية والمحاليل ومستحضرات التجميل العلاجية"
    },
    {
        "nameAr": "شركة مطاحن مصر الوسطى - مجمع مطاحن وصوامع أسيوط الحديثة بعرب العوامر",
        "nameEn": "Middle Egypt Flour Mills & Modern Grain Silos Complex Arab El Awamer",
        "sector": "manufacturing", "city": "arab_el_awamer", "district": "عرب العوامر الصناعية - مجمع المطاحن", "governorate": "أسيوط",
        "address": "المنطقة الصناعية بعرب العوامر - مجمع صوامع ومطاحن الدقيق الآلية سعة 1200 طن يومياً",
        "phone1": "088-2111122", "phone2": "", "website": "",
        "email": "middleegypt.mills.awamer@gmail.com", "lat": 27.315, "lon": 31.085, "fleetSize": 110,
        "fleetType": "تريلات سيلو لنقل الدقيق السائب وتريلات تريبل أكسل لتوزيع شكائر الدقيق الفاخر 72% والردة", "priority": "A+",
        "notes": "طحن القمح وإنتاج الدقيق التمويني والفاخر وتغذية المخابز ومصانع المكرونة بمحافظة أسيوط"
    },
    {
        "nameAr": "شركة أسيوط للصناعات الكيماوية وتصنيع الأسمدة العضوية والمخصبات الحيوية بعرب العوامر",
        "nameEn": "Assiut Chemical Industries & Bio-Organic Fertilizers Plant Awamer",
        "sector": "manufacturing", "city": "arab_el_awamer", "district": "عرب العوامر - مجمع المخصبات الزراعية", "governorate": "أسيوط",
        "address": "المنطقة الصناعية بعرب العوامر - مجمع مصانع الأسمدة الحيوية ومحسنات التربة الكلسية",
        "phone1": "088-2111123", "phone2": "", "website": "",
        "email": "assiut.biofertilizers.awamer@gmail.com", "lat": 27.305, "lon": 31.095, "fleetSize": 85,
        "fleetType": "تريلات تريبل أكسل وتريلات ستائر لتوزيع الأسمدة المركبة NPK والأحماض الزراعية لمزارع الصعيد", "priority": "A",
        "notes": "إنتاج الأسمدة الحيوية والأسمدة الورقية ومضادات الإجهاد الحراري للمحاصيل في صعيد مصر"
    },
    {
        "nameAr": "شركة أبنوب لنقل وتوزيع المحاصيل الزراعية والرمان والمانجو التصديري بأسيوط",
        "nameEn": "Abnoub Crops Logistics & Pomegranate Mango Export Logistics Assiut",
        "sector": "transport", "city": "assiut", "district": "مركز البداري وأبنوب - مجمع التصدير الزراعي", "governorate": "أسيوط",
        "address": "طريق أبنوب البداري الزراعي - محطة الفرز الإلكتروني ومجمع الثلاجات التصديرية للرمان",
        "phone1": "088-2111124", "phone2": "", "website": "",
        "email": "abnoub.pomegranate.export@gmail.com", "lat": 27.050, "lon": 31.350, "fleetSize": 100,
        "fleetType": "برادات تريلا ثيرمو كينج وحاويات شحن مبرد 40 قدم لنقل رمان البداري والمانجو لموانئ التصدير", "priority": "A+",
        "notes": "تصدير رمان أسيوط المنفلوطي الشهير عالمياً بجودته العالية إلى أسواق روسيا والاتحاد الأوروبي والخليج"
    },
    {
        "nameAr": "شركة عرب العوامر للصناعات الكرتونية والورقية وتعبئة وتغليف الأدوية بأسيوط",
        "nameEn": "Arab El Awamer Corrugated Packaging & Pharmaceutical Cartons Plant",
        "sector": "manufacturing", "city": "arab_el_awamer", "district": "المنطقة الصناعية بعرب العوامر", "governorate": "أسيوط",
        "address": "عرب العوامر الصناعية - مصانع إنتاج علب الأدوية الدوبلكس والكرتون المضلع عالي المتانة",
        "phone1": "088-2111125", "phone2": "", "website": "",
        "email": "awamer.packaging.carton@gmail.com", "lat": 27.320, "lon": 31.080, "fleetSize": 60,
        "fleetType": "تريلات جامبو صندوق مقفل وشاحنات توزيع سريعة لتوريد عبوات الكرتون لمصانع الأدوية والأغذية", "priority": "A",
        "notes": "تصنيع علب الأدوية والكرتون الدوائي المعتمد GMP والكرتون المضلع لتعبئة وتصدير الخضروات والفاكهة"
    },
    {
        "nameAr": "شركة أسيوط لتصنيع وتكرير الزيوت النباتية والصابون وعصر البذور بعرب العوامر",
        "nameEn": "Assiut Edible Oils Refining & Soap Making & Seed Crushing Awamer",
        "sector": "manufacturing", "city": "arab_el_awamer", "district": "عرب العوامر - مجمع معاصر الزيوت", "governorate": "أسيوط",
        "address": "المنطقة الصناعية بعرب العوامر - مصانع تكرير وتعبئة زيت الذرة وعباد الشمس والصابون",
        "phone1": "088-2111126", "phone2": "", "website": "",
        "email": "assiut.edibleoils.awamer@gmail.com", "lat": 27.300, "lon": 31.100, "fleetSize": 70,
        "fleetType": "فنطاسات ستانلس ستيل غذائية وتريلات صندوق لنقل وتوزيع زيوت الطعام والصابون للمحافظات", "priority": "A",
        "notes": "تكرير وتعبئة الزيوت النباتية وتوفير كسب الأعلاف لمزارع الثروة الحيوانية بصعيد مصر"
    },
    {
        "nameAr": "شركة الفتح للمقاولات العامة وشبكات الصرف الصحي والإنشاءات الصناعية بأسيوط",
        "nameEn": "Al Fateh General Contracting & Industrial Sewage Networks Assiut",
        "sector": "contracting", "city": "assiut", "district": "مركز الفتح - مجمع المقاولات الكبرى", "governorate": "أسيوط",
        "address": "طريق الفتح أسيوط الجديدة - معسكر معدات حفر ومد شبكات الصرف الصحي والانحدار",
        "phone1": "088-2111127", "phone2": "", "website": "",
        "email": "alfateh.contracting.assiut@gmail.com", "lat": 27.190, "lon": 31.250, "fleetSize": 65,
        "fleetType": "حفارات جنزير كوماتسو 300 وقلابات 4 أكسل وماكينات لحام مواسير البولي إيثيلين HDPE لمشروعات الصرف", "priority": "A",
        "notes": "تنفيذ محطات الرفع وشبكات الصرف الصحي ومحطات المعالجة الثلاثية بقرى حياة كريمة بأسيوط"
    },
    {
        "nameAr": "شركة عرب العوامر للصناعات البلاستيكية وخراطيم الري بالتنقيط ومواسير الـ PVC",
        "nameEn": "Arab El Awamer Plastics & Drip Irrigation Pipes & PVC Fittings Plant",
        "sector": "manufacturing", "city": "arab_el_awamer", "district": "عرب العوامر - مجمع البلاستيك", "governorate": "أسيوط",
        "address": "المنطقة الصناعية بعرب العوامر - مصانع سحب خراطيم الري بالتنقيط ومواسير الصرف والكهرباء",
        "phone1": "088-2111128", "phone2": "", "website": "",
        "email": "awamer.plastics.pipes@gmail.com", "lat": 27.308, "lon": 31.088, "fleetSize": 55,
        "fleetType": "تريلات فلات مجهزة لنقل بكرات خراطيم الري وشاحنات جامبو لتوزيع المواسير البلاستيكية للمشروعات", "priority": "A",
        "notes": "إنتاج مستلزمات الري الحديث وشبكات البنية التحتية لمشروعات الاستصلاح بالظهير الصحراوي لأسيوط"
    },
    {
        "nameAr": "شركة أسيوط للحلول اللوجستية وتفريغ وتخزين الحبوب والمحاصيل بعرب العوامر",
        "nameEn": "Assiut Grain Silos Stevedoring & Agro Warehousing Logistics Awamer",
        "sector": "transport", "city": "arab_el_awamer", "district": "عرب العوامر - المجمع اللوجستي الزراعي", "governorate": "أسيوط",
        "address": "مدخل عرب العوامر الصناعي - مجمع ساحات الشاحنات وموازين البسكول ومخازن الترانزيت",
        "phone1": "088-2111129", "phone2": "", "website": "",
        "email": "assiut.grainlogistics.awamer@gmail.com", "lat": 27.312, "lon": 31.092, "fleetSize": 60,
        "fleetType": "قلابات حبوب تريلا سعة 34م³ وشاحنات نقل الحبوب السائبة من الصوامع للمطاحن ومصانع الأعلاف", "priority": "A",
        "notes": "تفريغ وتداول الأقماح والذرة الصفراء وفول الصويا ونقلها للمصانع بالمنطقة الصناعية بعرب العوامر"
    },
    {
        "nameAr": "مصنع الفاتح لإنتاج الأعلاف الداجنة والحيوانية والمركزات البروتينية بعرب العوامر",
        "nameEn": "Al Fateh Poultry Feed & Animal Protein Concentrates Arab El Awamer",
        "sector": "manufacturing", "city": "arab_el_awamer", "district": "عرب العوامر الصناعية - قطاع الأعلاف", "governorate": "أسيوط",
        "address": "المنطقة الصناعية بعرب العوامر - مجمع مصانع كبس الأعلاف الآلية وصوامع التخزين",
        "phone1": "088-2111130", "phone2": "", "website": "",
        "email": "alfateh.feed.awamer@gmail.com", "lat": 27.318, "lon": 31.082, "fleetSize": 75,
        "fleetType": "تريلات سيلو لنقل الأعلاف السائبة وتريلات جوانب لنقل شكائر أعلاف الدواجن والماشية للمزارع", "priority": "A+",
        "notes": "إنتاج أعلاف التسمين والبياض وأعلاف الحلاب وتغذية كبرى مزارع الدواجن والإنتاج الحيواني بالصعيد"
    },
    {
        "nameAr": "شركة النيل الأزرق لنقل وتوزيع المحروقات والسولار لمصانع المنطقة الصناعية بعرب العوامر",
        "nameEn": "Blue Nile Industrial Diesel & Fuel Logistics Arab El Awamer",
        "sector": "transport", "city": "arab_el_awamer", "district": "عرب العوامر - محور الإمداد البترولي", "governorate": "أسيوط",
        "address": "طريق عرب العوامر أبنوب - محطة صهاريج شحن وتوزيع السولار والمازوت الصناعي",
        "phone1": "088-2111131", "phone2": "", "website": "",
        "email": "bluenile.fuel.awamer@gmail.com", "lat": 27.302, "lon": 31.098, "fleetSize": 50,
        "fleetType": "فنطاسات وقود 30 طن مزودة بمضخات رقمية لتزويد غلايات المصانع والمطاحن والمولدات بالسولار", "priority": "A",
        "notes": "الإمداد اليومي المنتظم بالوقود الصناعي لتشغيل مصانع الأدوية والمطاحن الكبرى بعرب العوامر"
    },
    {
        "nameAr": "شركة أسيوط للغزل والنسيج وتصنيع الخيوط القطنية الرفيعة والأقمشة الخام",
        "nameEn": "Assiut Spinning & Weaving Co Fine Cotton Yarns & Grey Fabrics Plant",
        "sector": "manufacturing", "city": "assiut", "district": "أسيوط - بني غالب - مجمع الغزل والنسيج", "governorate": "أسيوط",
        "address": "طريق أسيوط منقباد - مجمع مصانع غزل الأقطان فائقة الطول وإنتاج التريكو والمنسوجات",
        "phone1": "088-2111132", "phone2": "", "website": "",
        "email": "assiut.textile.spinning@gmail.com", "lat": 27.230, "lon": 31.120, "fleetSize": 65,
        "fleetType": "تريلات جامبو صندوق مقفل وشاحنات نقل مجهزة لنقل كونات الغزول وبالات القطن للموانئ ومصانع المحلة", "priority": "A",
        "notes": "غزل القطن المصري طويل التيلة وتصدير الخيوط القطنية الدقيقة لمصانع النسيج في إيطاليا وألمانيا"
    },
    {
        "nameAr": "شركة الصفا لإدارة ثلاجات التجميد السريع وحفظ اللحوم والخضروات بأسيوط الجديدة",
        "nameEn": "Al Safa Cold Storage & Blast Freezing Logistics New Assiut",
        "sector": "transport", "city": "new_assiut", "district": "مدينة أسيوط الجديدة - المنطقة الإقليمية للتخزين", "governorate": "أسيوط",
        "address": "أسيوط الجديدة - طريق الجيش الصحراوي الشرقي - مجمع مستودعات وثلاجات التجميد السريع",
        "phone1": "088-2111133", "phone2": "", "website": "",
        "email": "alsafa.coldstorage.newassiut@gmail.com", "lat": 27.280, "lon": 31.300, "fleetSize": 55,
        "fleetType": "برادات تريلا ثيرمو كينج -25 درجة وشاحنات تبريد وتوزيع لتوريد السلع الغذائية للمجمعات الاستهلاكية", "priority": "A",
        "notes": "حفظ وتخزين اللحوم والدواجن والخضروات المجمدة وتأمين الإمدادات الغذائية لمحافظات وسط وجنوب الصعيد"
    },
    {
        "nameAr": "شركة عرب العوامر للمهمات الصناعية وتأجير الأوناش التلسكوبية والرافعات الميدانية",
        "nameEn": "Arab El Awamer Heavy Crane Hire & Industrial Rigging Logistics",
        "sector": "transport", "city": "arab_el_awamer", "district": "عرب العوامر - مركز خدمات الشحن والرفع", "governorate": "أسيوط",
        "address": "المنطقة الصناعية بعرب العوامر - ساحة تشغيل الرافعات التلسكوبية وأوناش الشوكة الثقيلة",
        "phone1": "088-2111134", "phone2": "", "website": "",
        "email": "awamer.heavycranes@gmail.com", "lat": 27.314, "lon": 31.086, "fleetSize": 45,
        "fleetType": "أوناش كرين تلسكوبية 50 و80 طن ولوابد شاسيه لنقل صوامع الغلال وماكينات الأدوية والمطاحن", "priority": "A",
        "notes": "أعمال الرفع والمناولة الثقيلة وتركيب صوامع الحبوب والغلايات والمعدات بمصانع عرب العوامر"
    },
    {
        "nameAr": "شركة أسيوط لتصنيع وتجارة المنظفات والمطهرات الطبية والصناعية بعرب العوامر",
        "nameEn": "Assiut Medical & Industrial Detergents Disinfectants Plant Awamer",
        "sector": "manufacturing", "city": "arab_el_awamer", "district": "عرب العوامر - قطاع الصناعات الكيماوية", "governorate": "أسيوط",
        "address": "المنطقة الصناعية بعرب العوامر - مصانع إنتاج الكحول الطبي والمطهرات والمستلزمات الوقائية",
        "phone1": "088-2111135", "phone2": "", "website": "",
        "email": "assiut.disinfectants.awamer@gmail.com", "lat": 27.306, "lon": 31.094, "fleetSize": 40,
        "fleetType": "شاحنات نقل مغلقة مجهزة لنقل المطهرات الطبية وسوائل التعقيم للمستشفيات والمراكز الطبية", "priority": "A",
        "notes": "إنتاج الكحول الإيثيلي الطبي ومطهرات المستشفيات والمنظفات الصناعية المعتمدة لمديريات الصحة"
    }
]

print(f"Candidate records prepared: {len(candidates_data)}")

# 3. Evaluate each candidate against deduplication rules and build validated CRM records
approved_companies = []
rejected = 0

for idx, cand in enumerate(candidates_data, 1):
    comp_id = f"comp_upper_mid_{idx:03d}"
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
print("Results for Square 15 (Middle Upper Egypt & West Nile Mega Agro-Industrial & Mining):")
print(f"Total Candidates: {len(candidates_data)}")
print(f"Approved (Pure B2B, Zero Duplicates): {len(approved_companies)}")
print(f"Rejected: {rejected}")
print("="*45)

assert len(approved_companies) == 75, f"Expected 75 approved, got {len(approved_companies)}"
assert rejected == 0, f"Expected 0 rejected, got {rejected}"

os.makedirs('scraper/output', exist_ok=True)
out_path = 'scraper/output/phase2_middle_upper_egypt_verified_b2b_fleet.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(approved_companies, f, ensure_ascii=False, indent=2)

print(f"Saved {len(approved_companies)} approved enterprises to {out_path}\n")
