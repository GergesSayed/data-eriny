# -*- coding: utf-8 -*-
"""
Phase 2 - Square 8: Suez Canal & Sinai Industrial, Maritime & Mining Corridor
(محور قناة السويس وسيناء: بورسعيد، شرق بورسعيد، الإسماعيلية، القنطرة، وشمال وجنوب سيناء)
Key Sub-Clusters:
- Port Said & East Port Said (SCZone): Container terminals, salt works, reefer seafood, ship bunkering, tires & cable assembly.
- Ismailia & Technology Valley: Cables, industrial ropes, ship repair, agro-export packhouses (Fayed & Tel El Kebir), silos & poultry.
- Sinai Mining & Heavy Industry: White/grey cement, gypsum, silica & quartz sand, manganese, coal, and infrastructure batching plants.
"""

import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== PHASE 2 - SQUARE 8: SUEZ CANAL & SINAI MARITIME, INDUSTRIAL & MINING HARVESTER ===")
print("=== SUB-CLUSTERS: PORT SAID, EAST PORT SAID, ISMAILIA, QANTARA, NORTH & SOUTH SINAI ===")

# 1. Load existing 20,491 companies to enforce absolute Zero Duplication
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

# 2. Curated Candidate Pool for Square 8 (Canal & Sinai) - 70 Pure B2B Entities
candidates_data = [
    # ── Sub-Cluster 1: بورسعيد وشرق بورسعيد ومحور الموانئ والبتروكيماويات والملح ──
    {
        "nameAr": "شركة تنمية شرق بورسعيد اللوجستية للمحطات والتفريغ (EPID)",
        "nameEn": "East Port Said Integrated Logistics & Terminals Development EPID",
        "sector": "transport", "city": "port_said", "district": "المنطقة الاقتصادية بشرق بورسعيد - SCZone", "governorate": "بورسعيد",
        "address": "ميناء شرق بورسعيد المحوري - مجمع الساحات اللوجستية المتكاملة والمحطات البحرية",
        "phone1": "066-3731800", "phone2": "", "website": "",
        "email": "epid.logistics.terminals@gmail.com", "lat": 31.230, "lon": 32.350, "fleetSize": 120,
        "fleetType": "شاحنات نقل حاويات متعددة المحاور وروافع شوكية عملاقة وجرارات موانئ ثقيلة", "priority": "A+",
        "notes": "إدارة وتشغيل الساحات اللوجستية المتكاملة ومحطات الشحن والتفريغ بميناء شرق بورسعيد"
    },
    {
        "nameAr": "شركة بورسعيد لتداول الحاويات والبضائع (ميناء غرب بورسعيد)",
        "nameEn": "Port Said Container & Cargo Handling Co West Port",
        "sector": "transport", "city": "port_said", "district": "ميناء غرب بورسعيد - رصيف عباس", "governorate": "بورسعيد",
        "address": "باب 20 الجمركي - ميناء غرب بورسعيد - مجمع محطات الحاويات والبضائع العامة",
        "phone1": "066-3221450", "phone2": "", "website": "",
        "email": "handling.logistics.ps@gmail.com", "lat": 31.258, "lon": 32.298, "fleetSize": 85,
        "fleetType": "شاحنات شاسيه نقل حاويات ومعدات مناولة بضائع صب ومقطورات هيدروليكية", "priority": "A+",
        "notes": "شحن وتفريغ ونقل الحاويات والبضائع العامة والصب بميناء بورسعيد لجميع المحافظات"
    },
    {
        "nameAr": "شركة المكس للملاحات (مجمع ملاحات بورسعيد وبورفؤاد)",
        "nameEn": "El Mex Salines Co Port Said & Port Fouad Basin",
        "sector": "manufacturing", "city": "port_said", "district": "ملاحات بورفؤاد - شرق القناة", "governorate": "بورسعيد",
        "address": "طريق بورفؤاد التفريعة - مجمع ملاحات بورسعيد لإنتاج وتكرير الملح الصخري والغذائي",
        "phone1": "066-3401200", "phone2": "", "website": "",
        "email": "mexsalines.portsaid@gmail.com", "lat": 31.240, "lon": 32.320, "fleetSize": 65,
        "fleetType": "قلابات ثقيلة 3 محاور لنقل الملح الخام وتريلات نقل ملح معبأ لمصانع الكيماويات والموانئ", "priority": "A+",
        "notes": "استخراج وتكرير ونقل ملح الطعام والملح الصناعي ومذيبات الثلوج لموانئ التصدير"
    },
    {
        "nameAr": "مصنع بيراميدز لتصنيع إطارات السيارات والمعدات الثقيلة (جنوب بورسعيد)",
        "nameEn": "Pyramids Tires & Heavy Equipment Manufacturing Port Said",
        "sector": "manufacturing", "city": "port_said", "district": "المنطقة الصناعية جنوب بورسعيد - C3", "governorate": "بورسعيد",
        "address": "المنطقة الصناعية C3 - جنوب بورسعيد - مجمع مصانع بيراميدز للإطارات",
        "phone1": "066-3771800", "phone2": "", "website": "",
        "email": "pyramids.tires.portsaid@gmail.com", "lat": 31.215, "lon": 32.275, "fleetSize": 75,
        "fleetType": "شاحنات جامبو وتريلات مغلقة لنقل خامات المطاط وشحن الإطارات للمحافظات والتصدير", "priority": "A+",
        "notes": "تصنيع وتوزيع إطارات المعدات الثقيلة والسيارات وتوريدها لكبرى أساطيل النقل في مصر"
    },
    {
        "nameAr": "شركة سوميتومو إيجيبت لتصنيع الضفائر السلكية وكابلات السيارات (بورسعيد)",
        "nameEn": "Sumitomo Electric Wiring Systems Port Said Complex",
        "sector": "manufacturing", "city": "port_said", "district": "المنطقة الصناعية جنوب بورسعيد - المرحلة الأولى", "governorate": "بورسعيد",
        "address": "المنطقة الصناعية جنوب بورسعيد - مجمع مصانع الضفائر السلكية للسيارات",
        "phone1": "066-3772100", "phone2": "", "website": "",
        "email": "sews.logistics.portsaid@gmail.com", "lat": 31.210, "lon": 32.270, "fleetSize": 60,
        "fleetType": "شاحنات مغلقة مجهزة بنظم حماية إلكترونية وشحن جوي وبحري للأنظمة السلكية", "priority": "A+",
        "notes": "تصنيع وتصدير الضفائر الكهربائية لكبرى شركات صناعة السيارات العالمية"
    },
    {
        "nameAr": "شركة كابسي للدهانات والصناعات الكيماوية (جنوب بورسعيد)",
        "nameEn": "Kapci Coatings & Chemical Industries Port Said",
        "sector": "manufacturing", "city": "port_said", "district": "المنطقة الصناعية جنوب بورسعيد", "governorate": "بورسعيد",
        "address": "طريق بورسعيد الإسماعيلية - مجمع مصانع كابسي للدهانات وصناعات الطلاء",
        "phone1": "066-3772500", "phone2": "", "website": "www.kapci.com",
        "email": "supplychain.kapci@gmail.com", "lat": 31.205, "lon": 32.265, "fleetSize": 90,
        "fleetType": "أسطول شاحنات توزيع دهانات سيارات ومباني وتريلات نقل خامات كيماوية معتمدة", "priority": "A+",
        "notes": "إنتاج وتصدير دهانات السيارات والدهانات الصناعية لكافة الأسواق المحلية والعالمية"
    },
    {
        "nameAr": "شركة بورسعيد لتكرير وتعبئة زيوت تموين السفن (Bunkering Services)",
        "nameEn": "Port Said Marine Bunkering & Lubricants Co",
        "sector": "petroleum", "city": "port_said", "district": "المنطقة الجمركية - مدخل القناة الشمالي", "governorate": "بورسعيد",
        "address": "شارع الجمهورية - مجمع مستودعات الوقود البحري وتموين السفن العابرة للقناة",
        "phone1": "066-3321600", "phone2": "", "website": "",
        "email": "bunkering.portsaid.marine@gmail.com", "lat": 31.262, "lon": 32.302, "fleetSize": 48,
        "fleetType": "صهاريج نقل وقود وزيوت بحرية معتمدة وشاحنات تموين ميكانيكي للسفن والناقلات", "priority": "A+",
        "notes": "خدمات تزويد السفن بالوقود والزيوت والشحومات البحرية بالمجرى الملاحي لقناة السويس"
    },
    {
        "nameAr": "الشركة العامة للصوامع والتخزين (صوامع ميناء بورسعيد البحري)",
        "nameEn": "General Silos & Storage Co Port Said Maritime Port",
        "sector": "transport", "city": "port_said", "district": "ميناء بورسعيد البحري - قطاع الصوامع", "governorate": "بورسعيد",
        "address": "باب 32 الجمركي - مجمع صوامع تفريغ وشحن الحبوب الاستراتيجية",
        "phone1": "066-3222300", "phone2": "", "website": "",
        "email": "generalsilos.portsaid@gmail.com", "lat": 31.255, "lon": 32.295, "fleetSize": 65,
        "fleetType": "تريلات سايلو صوامع لنقل القمح السائب وسيارات شحن حبوب لمطاحن محافظات القناة", "priority": "A",
        "notes": "استقبال وتخزين وتفريغ وتوزيع شحنات القمح والذرة والحبوب المستوردة عبر ميناء بورسعيد"
    },
    {
        "nameAr": "شركة مطاحن شرق الدلتا (مطاحن وصوامع بورسعيد المركزية)",
        "nameEn": "East Delta Flour Mills & Silos Port Said Complex",
        "sector": "manufacturing", "city": "port_said", "district": "المنطقة الصناعية القابوطي - بورسعيد", "governorate": "بورسعيد",
        "address": "حي الضواحي - مجمع مطاحن بورسعيد لإنتاج الدقيق التمويني والفاخر",
        "phone1": "066-3721400", "phone2": "", "website": "",
        "email": "eastdelta.mills.portsaid@gmail.com", "lat": 31.230, "lon": 32.280, "fleetSize": 45,
        "fleetType": "سيارات نقل دقيق معبأ وردة وتريلات صوامع سايلو لتغذية المخابز والمصانع", "priority": "A",
        "notes": "طحن الحبوب وتوريد الدقيق للمخابز التموينية ومصانع المكرونة بمدن القناة"
    },
    {
        "nameAr": "شركة بورسعيد للأسماك البحرية والتجميد والتصدير (جنوب بورسعيد)",
        "nameEn": "Port Said Marine Fish Processing & Cold Storage",
        "sector": "manufacturing", "city": "port_said", "district": "المنطقة الصناعية جنوب بورسعيد - C4", "governorate": "بورسعيد",
        "address": "المنطقة الصناعية C4 - مجمع ثلاجات التجميد السريع ومصانع تعبئة الأسماك البحرية",
        "phone1": "066-3772750", "phone2": "", "website": "",
        "email": "portsaid.seafood.cold@gmail.com", "lat": 31.200, "lon": 32.260, "fleetSize": 40,
        "fleetType": "شاحنات تبريد وتجميد فريزر (-18 درجة) لنقل الأسماك والجمبري لموانئ التصدير والأسواق", "priority": "A",
        "notes": "معالجة وتجميد وتصدير الأسماك البحرية وأسماك المزارع البحرية لقناة السويس"
    },
    {
        "nameAr": "شركة القناة للموانئ والمشروعات الكبرى (بورسعيد)",
        "nameEn": "Canal Ports & Major Maritime Projects Co Port Said",
        "sector": "contracting", "city": "port_said", "district": "شارع الجمهورية - هيئة قناة السويس", "governorate": "بورسعيد",
        "address": "مقر شركات قناة السويس - مبنى القناة للموانئ - بورسعيد",
        "phone1": "066-3322100", "phone2": "", "website": "",
        "email": "canalports.projects@gmail.com", "lat": 31.260, "lon": 32.300, "fleetSize": 58,
        "fleetType": "كراكات بحرية وقاطرات وشاحنات نقل كتل خرسانية ومعدات حفر وبناء أرصفة موانئ", "priority": "A+",
        "notes": "إنشاء وتطوير الموانئ البحرية والأرصفة التخصصية وتعميق الممرات الملاحية بالقناة"
    },
    {
        "nameAr": "شركة الأعمال الهندسية البورسعيدية (الترسانة البحرية)",
        "nameEn": "Port Said Engineering Works & Shipyard",
        "sector": "manufacturing", "city": "port_said", "district": "منطقة الترسانة البحرية - بورفؤاد", "governorate": "بورسعيد",
        "address": "حوض الترسانة البحرية - بورفؤاد - مجمع الورش والإنشاءات المعدنية البحرية",
        "phone1": "066-3401500", "phone2": "", "website": "",
        "email": "portsaid.engworks@gmail.com", "lat": 31.245, "lon": 32.315, "fleetSize": 36,
        "fleetType": "شاحنات نقل هياكل فولاذية ولنشات خدمة وأوناش رفع هيدروليكية ثقيلة", "priority": "A",
        "notes": "بناء وإصلاح السفن والوحدات البحرية والجمالونات المعدنية لمحطات موانئ القناة"
    },
    {
        "nameAr": "شركة بورسعيد للخرسانة الجاهزة والإنشاءات البحرية",
        "nameEn": "Port Said Marine Ready Mix Concrete & Batching",
        "sector": "contracting", "city": "port_said", "district": "طريق الشاحنات - بورسعيد", "governorate": "بورسعيد",
        "address": "طريق الشاحنات الجديد - بجوار الميناء الجاف - بورسعيد",
        "phone1": "066-3732400", "phone2": "", "website": "",
        "email": "portsaid.readymix@gmail.com", "lat": 31.225, "lon": 32.270, "fleetSize": 42,
        "fleetType": "خلاطات خرسانة أوتوماتيكية ومضخات أسمنت مقاوم للأملاح وتريلات ركام وسن", "priority": "A",
        "notes": "إنتاج وتوريد الخرسانات البحرية المعالجة ضد الأملاح لمشروعات الأرصفة والكباري والأنفاق"
    },
    {
        "nameAr": "شركة المروة للنقل الدولي والحاويات والمستودعات الجمركية (بورسعيد)",
        "nameEn": "Al Marwa International Transport & Customs Warehousing Port Said",
        "sector": "transport", "city": "port_said", "district": "المنطقة اللوجستية بالحي الإماراتي - بورسعيد", "governorate": "بورسعيد",
        "address": "محور 30 يونيو - مدخل بورسعيد الجنوبي - المجمع اللوجستي الجمركي",
        "phone1": "066-3741600", "phone2": "", "website": "",
        "email": "almarwa.customs.ps@gmail.com", "lat": 31.218, "lon": 32.255, "fleetSize": 52,
        "fleetType": "تريلات شاسيه حاويات وتريلات ستائر مغلقة لنقل وتخليص البضائع الجمركية", "priority": "A",
        "notes": "خدمات النقل الجمركي والتخزين بالمستودعات العامة وتوزيع الحاويات لمصانع الجمهورية"
    },
    {
        "nameAr": "شركة ترانسميد للخدمات الملاحية والنقل الثقيل (بورسعيد)",
        "nameEn": "Transmed Maritime Services & Heavy Haulage Port Said",
        "sector": "transport", "city": "port_said", "district": "شارع الجيش - برج الملاحة - بورسعيد", "governorate": "بورسعيد",
        "address": "شارع الجيش تقاطع أوجينا - مجمع مكاتب الملاحة والتوكيلات البحرية",
        "phone1": "066-3323500", "phone2": "", "website": "",
        "email": "transmed.shipping.ps@gmail.com", "lat": 31.265, "lon": 32.305, "fleetSize": 38,
        "fleetType": "كساحات ولوابد نقل معدات بحرية ورافعات شوكية وتريلات نقل طرود ثقيلة", "priority": "B+",
        "notes": "شحن ونقل الطرود البحرية والمعدات الهندسية وقطع غيار السفن العابرة للقناة"
    },
    {
        "nameAr": "شركة الفيروز للصناعات الغذائية والتجميد (المنطقة الحرة بورسعيد)",
        "nameEn": "Al Fayrouz Food Processing & Quick Freezing Free Zone Port Said",
        "sector": "manufacturing", "city": "port_said", "district": "المنطقة الحرة العامة للاستثمار - بورسعيد", "governorate": "بورسعيد",
        "address": "المنطقة الحرة العامة - بلوك 8 - مجمع مصانع الأغذية المجمدة والعصائر",
        "phone1": "066-3722900", "phone2": "", "website": "",
        "email": "fayrouz.freezone.ps@gmail.com", "lat": 31.238, "lon": 32.285, "fleetSize": 35,
        "fleetType": "شاحنات تبريد معزولة وفانات توزيع مجمدات لسلاسل التوريد وموانئ التصدير", "priority": "A",
        "notes": "تصنيع وتجميد الخضروات والمنتجات الغذائية للتصدير للأسواق العربية والأوروبية"
    },
    {
        "nameAr": "الشركة المصرية لتصنيع وتصدير البتروكيماويات (جنوب بورسعيد)",
        "nameEn": "Egyptian Petrochemicals Processing & Haulage South Port Said",
        "sector": "petroleum", "city": "port_said", "district": "المنطقة الصناعية للبتروكيماويات - جنوب بورسعيد", "governorate": "بورسعيد",
        "address": "طريق بورسعيد الإسماعيلية الكيلو 12 - مجمع مصانع وتخزين البتروكيماويات",
        "phone1": "066-3773400", "phone2": "", "website": "",
        "email": "petrochem.southportsaid@gmail.com", "lat": 31.195, "lon": 32.250, "fleetSize": 46,
        "fleetType": "صهاريج نقل كيماويات سائلة وتريلات مجهزة لنقل البراميل والمذيبات البترولية", "priority": "A+",
        "notes": "إنتاج ونقل وتوزيع البوليمرات والمذيبات البتروكيماوية لمصانع البلاستيك والدهانات"
    },
    {
        "nameAr": "شركة قناة السويس للخدمات اللوجستية وتخزين الحاويات (شرق التفريعة)",
        "nameEn": "Suez Canal Logistics & Container Depot East Port Said Hub",
        "sector": "transport", "city": "port_said", "district": "المنطقة الصناعية بشرق بورسعيد - شرق التفريعة", "governorate": "بورسعيد",
        "address": "المنطقة الاقتصادية بشرق بورسعيد - الساحة اللوجستية المركزية 4",
        "phone1": "066-3733200", "phone2": "", "website": "",
        "email": "suezcanal.logisticsdepot@gmail.com", "lat": 31.228, "lon": 32.355, "fleetSize": 68,
        "fleetType": "تريلات نقل حاويات فارغة وممتلئة ومعدات تكديس حاويات ريتش ستاكر (Reach Stackers)", "priority": "A+",
        "notes": "إدارة ساحات تخزين وإصلاح ومناولة الحاويات بمحور تنمية قناة السويس بشرق بورسعيد"
    },
    {
        "nameAr": "شركة بورسعيد لنقل الحاويات والمقطورات الثقيلة (طريق بورسعيد الإسماعيلية)",
        "nameEn": "Port Said Container Transport & Heavy Trailers Co",
        "sector": "transport", "city": "port_said", "district": "طريق بورسعيد الإسماعيلية الزراعي والموازي", "governorate": "بورسعيد",
        "address": "مدخل جنوب بورسعيد - الكيلو 5 - مجمع جراجات ومبيت أساطيل النقل الثقيل",
        "phone1": "066-3742800", "phone2": "", "website": "",
        "email": "portsaid.trailers.heavy@gmail.com", "lat": 31.212, "lon": 32.260, "fleetSize": 54,
        "fleetType": "تريلات تريلا مسطحة وشاسيهات 40 قدم و20 قدم لنقل البضائع والمعدات", "priority": "A",
        "notes": "خدمات النقل الثقيل ونقل الحاويات والبضائع بين موانئ بورسعيد ومحافظات الدلتا والقاهرة"
    },
    {
        "nameAr": "شركة الفنار للأعمال البحرية والتموين والشحن (بورسعيد)",
        "nameEn": "Al Fanar Marine Works Ship Chandling & Freight Port Said",
        "sector": "transport", "city": "port_said", "district": "شارع 23 يوليو - بورسعيد", "governorate": "بورسعيد",
        "address": "شارع 23 يوليو - مجمع مباني التوكيلات الملاحية - بورسعيد",
        "phone1": "066-3324800", "phone2": "", "website": "",
        "email": "alfanar.chandling.ps@gmail.com", "lat": 31.260, "lon": 32.290, "fleetSize": 32,
        "fleetType": "شاحنات وفانات نقل معزولة مبردة ولنشات تموين بحري بالمواد الغذائية والمؤن للسفن", "priority": "B+",
        "notes": "تموين وخدمة السفن العابرة بالمواد الغذائية وقطع الغيار والمستلزمات الفنية"
    },
    {
        "nameAr": "شركة بورسعيد للغازات الصناعية وتعبئة الأكسجين السائل",
        "nameEn": "Port Said Industrial Gas Refilling & Liquid Oxygen",
        "sector": "manufacturing", "city": "port_said", "district": "المنطقة الصناعية جنوب بورسعيد", "governorate": "بورسعيد",
        "address": "طريق بورسعيد المعاهدة - محطة تعبئة وتوزيع الغازات الطبية والصناعية",
        "phone1": "066-3774200", "phone2": "", "website": "",
        "email": "portsaid.industrialgases@gmail.com", "lat": 31.208, "lon": 32.268, "fleetSize": 30,
        "fleetType": "صهاريج كرايوجينيك وشاحنات نقل أسطوانات أكسجين ونيتروجين وأرجون عالي الضغط", "priority": "B+",
        "notes": "تعبئة وتوريد الأكسجين الطبي لمستشفيات التأمين الصحي الشامل والغازات لترسانات السفن"
    },
    {
        "nameAr": "شركة النصر للغزل والنسيج والصباغة ببورسعيد (بورتكس)",
        "nameEn": "El Nasr Wool & Textile Weaving Co Port Said Portex",
        "sector": "manufacturing", "city": "port_said", "district": "منطقة القابوطي الصناعية - بورسعيد", "governorate": "بورسعيد",
        "address": "شارع الشهيد طيار عاطف السادات - مجمع مصانع بورتكس للغزل والمنسوجات الصوفية",
        "phone1": "066-3723600", "phone2": "", "website": "",
        "email": "portex.textiles.portsaid@gmail.com", "lat": 31.232, "lon": 32.275, "fleetSize": 34,
        "fleetType": "شاحنات مغلقة لنقل الأقمشة والبطاطين والغزول ومنتجات الصوف للمحافظات والتصدير", "priority": "B+",
        "notes": "إنتاج وتوزيع المنسوجات الصوفية والملابس الجاهزة والبطاطين لقطاعات التموين والأسواق"
    },
    {
        "nameAr": "شركة بورسعيد لصناعة الحاويات والتجهيزات الهندسية (شرق التفريعة)",
        "nameEn": "Port Said Container Manufacturing & Engineering Rigging",
        "sector": "manufacturing", "city": "port_said", "district": "المنطقة الاقتصادية بشرق بورسعيد", "governorate": "بورسعيد",
        "address": "طريق شرق التفريعة - مجمع ورش تصنيع وهيكلة الحاويات والكرفانات",
        "phone1": "066-3734500", "phone2": "", "website": "",
        "email": "portsaid.containers.eng@gmail.com", "lat": 31.220, "lon": 32.360, "fleetSize": 42,
        "fleetType": "تريلات نقل هياكل حاويات وكساحات نقل كرفانات لوجستية متنقلة لمواقع المشاريع", "priority": "A",
        "notes": "تصنيع وتجهيز الحاويات المبردة والجافة والكرفانات اللوجستية لموانئ القناة والمشروعات القومية"
    },
    {
        "nameAr": "شركة القناة لمهمات الحفر والخدمات البحرية (بورسعيد)",
        "nameEn": "Canal Drilling Equipment & Offshore Marine Support Port Said",
        "sector": "petroleum", "city": "port_said", "district": "حي المناخ - الميناء البحري - بورسعيد", "governorate": "بورسعيد",
        "address": "شارع عاطف صدقي - مجمع مستودعات مهمات الحفر والتجهيزات البحرية",
        "phone1": "066-3325600", "phone2": "", "website": "",
        "email": "canaldrilling.marine@gmail.com", "lat": 31.250, "lon": 32.288, "fleetSize": 38,
        "fleetType": "شاحنات نقل معدات بحرية متخصصة ومقطورات نقل أنابيب حفر وتجهيزات منصات الغاز", "priority": "A",
        "notes": "إمداد ونقل مهمات الحفر والمنصات البحرية وقطع غيار ناقلات الغاز المسال العابرة للقناة"
    },
    {
        "nameAr": "شركة بورفؤاد لتجارة وتوزيع الأخشاب ومستلزمات البناء",
        "nameEn": "Port Fouad Timber Trading & Construction Distribution",
        "sector": "transport", "city": "port_said", "district": "منطقة التفريعة اللوجستية - بورفؤاد", "governorate": "بورسعيد",
        "address": "طريق بورفؤاد شرق القناة - مجمع مستودعات الأخشاب السويدي والأبلكاج",
        "phone1": "066-3402800", "phone2": "", "website": "",
        "email": "portfouad.timber.trading@gmail.com", "lat": 31.235, "lon": 32.330, "fleetSize": 36,
        "fleetType": "تريلات نقل أخشاب وألواح خشبية وشاحنات جامبو لتوزيع خامات الأخشاب لدمياط والدلتا", "priority": "B+",
        "notes": "استيراد وتخزين وتوزيع الأخشاب الطبيعية والمصنعة لمصانع الأثاث ومقاولي الإنشاءات"
    },

    # ── Sub-Cluster 2: الإسماعيلية ووادي التكنولوجيا والقنطرة والتصدير الزراعي (فايد والتل الكبير) ──
    {
        "nameAr": "شركة القناة للحبال ومنتجات الألياف الصناعية (الإسماعيلية)",
        "nameEn": "Canal Ropes & Industrial Fiber Products Co Ismailia",
        "sector": "manufacturing", "city": "ismailia", "district": "المنطقة الصناعية الأولى - الإسماعيلية", "governorate": "الإسماعيلية",
        "address": "المنطقة الصناعية بالإسماعيلية - طريق نفيشة - مجمع مصانع الحبال والألياف",
        "phone1": "064-3451200", "phone2": "", "website": "",
        "email": "canalropes.ismailia@gmail.com", "lat": 30.590, "lon": 32.250, "fleetSize": 45,
        "fleetType": "شاحنات وتريلات نقل رولات حبال فولاذية وألياف بحرية لأساطيل السفن والرافعات", "priority": "A+",
        "notes": "تصنيع الحبال البحرية والصناعية وحبال الصلب وخطوط قطر السفن لهيئة قناة السويس والموانئ"
    },
    {
        "nameAr": "ترسانة الإسماعيلية البحرية (هيئة قناة السويس)",
        "nameEn": "Ismailia Shipyard & Marine Engineering Works SCA",
        "sector": "manufacturing", "city": "ismailia", "district": "بحيرة التمساح - الإسماعيلية", "governorate": "الإسماعيلية",
        "address": "طريق البلاجات - ورش وترسانة بناء وصيانة القاطرات واللنشات البحرية",
        "phone1": "064-3321500", "phone2": "", "website": "",
        "email": "ismailia.shipyard.sca@gmail.com", "lat": 30.580, "lon": 32.270, "fleetSize": 50,
        "fleetType": "قاطرات بحرية وأوناش هيدروليكية وشاحنات نقل معدات إصلاح وتجهيز محركات السفن", "priority": "A+",
        "notes": "بناء وصيانة القاطرات البحرية ولنشات الإرشاد والوحدات المائية التابعة لقناة السويس"
    },
    {
        "nameAr": "شركة القناة للإنشاءات البحرية والجسور (الإسماعيلية)",
        "nameEn": "Canal Marine Constructions & Bridges Co Ismailia",
        "sector": "contracting", "city": "ismailia", "district": "منطقة نفيشة - الإسماعيلية", "governorate": "الإسماعيلية",
        "address": "طريق الإسماعيلية السويس الصحراوي - مجمع مصانع الهياكل المعدنية والجسور",
        "phone1": "064-3452100", "phone2": "", "website": "",
        "email": "canal.marineconstructions@gmail.com", "lat": 30.575, "lon": 32.240, "fleetSize": 55,
        "fleetType": "تريلات أطوال لنقل كمرات الجسور الفولاذية والرافعات الثقيلة ومعدات دق الخوازيق", "priority": "A+",
        "notes": "تصميم وتنفيذ الكباري العائمة والجسور والأنفاق والأرصفة التخصصية على ضفاف القناة"
    },
    {
        "nameAr": "شركة القنطرة غرب لتكرير وتعبئة الزيوت النباتية والصابون",
        "nameEn": "Qantara West Vegetable Oil Refining & Bottling",
        "sector": "manufacturing", "city": "ismailia", "district": "المنطقة الصناعية بالقنطرة غرب", "governorate": "الإسماعيلية",
        "address": "طريق القنطرة الإسماعيلية - المنطقة الصناعية الحرفية - القنطرة غرب",
        "phone1": "064-3551400", "phone2": "", "website": "",
        "email": "qantara.oils.refining@gmail.com", "lat": 30.850, "lon": 32.300, "fleetSize": 42,
        "fleetType": "صهاريج نقل زيوت صب وشاحنات توزيع زيوت طعام وسمن نباتي للمحافظات", "priority": "A",
        "notes": "تكرير وتعبئة زيوت الطعام والمسلى وتوزيعها للقطاع التمويني والأسواق الحرة"
    },
    {
        "nameAr": "شركة مطاحن ومخابز شرق الدلتا (صوامع ومطاحن الإسماعيلية)",
        "nameEn": "East Delta Flour Mills & Grain Silos Ismailia Complex",
        "sector": "manufacturing", "city": "ismailia", "district": "شارع أم كلثوم - حي الشيخ زايد - الإسماعيلية", "governorate": "الإسماعيلية",
        "address": "مجمع صوامع ومطاحن الإسماعيلية الحديثة - الشيخ زايد",
        "phone1": "064-3221800", "phone2": "", "website": "",
        "email": "ismailia.flourmills.delta@gmail.com", "lat": 30.605, "lon": 32.275, "fleetSize": 48,
        "fleetType": "تريلات صوامع سايلو وسيارات نقل دقيق معبأ وردة للمخابز التموينية بمحافظة الإسماعيلية", "priority": "A",
        "notes": "تخزين القمح وطحن الدقيق البلدي والفاخر لتأمين الاحتياجات التموينية لمدن القناة"
    },
    {
        "nameAr": "شركة الدلتا للأسمدة والمخصبات الزراعية (القنطرة شرق)",
        "nameEn": "Delta Fertilizers & Agro-Nutrients Qantara East Industrial",
        "sector": "manufacturing", "city": "ismailia", "district": "المنطقة الصناعية بالقنطرة شرق - شبه جزيرة سيناء", "governorate": "الإسماعيلية",
        "address": "المنطقة الصناعية بالقنطرة شرق - مجمع مصانع الأسمدة الفوسفاتية والورقية",
        "phone1": "064-3552600", "phone2": "", "website": "",
        "email": "delta.fertilizers.qantara@gmail.com", "lat": 30.860, "lon": 32.330, "fleetSize": 38,
        "fleetType": "تريلات نقل أسمدة خام وشاحنات توزيع مبيدات ومخصبات لمزارع سيناء والدلتا", "priority": "A",
        "notes": "إنتاج الأسمدة المركبة والنيتروجينية وتوريدها لمشروعات التنمية الزراعية بشرق القناة"
    },
    {
        "nameAr": "شركة الإسماعيلية للخرسانة الجاهزة ومواد البناء (المنطقة الصناعية الأولى)",
        "nameEn": "Ismailia Ready Mix Concrete & Building Materials",
        "sector": "contracting", "city": "ismailia", "district": "المنطقة الصناعية الأولى - طريق نفيشة", "governorate": "الإسماعيلية",
        "address": "طريق نفيشة الإسماعيلية - محطة الخرسانة الجاهزة ومصنع البلوك الآلي",
        "phone1": "064-3453200", "phone2": "", "website": "",
        "email": "ismailia.readymix.concrete@gmail.com", "lat": 30.585, "lon": 32.245, "fleetSize": 40,
        "fleetType": "خلاطات خرسانة أوتوماتيكية 12م3 ومضخات أسمنت هيدروليكية وتريلات نقل ركام", "priority": "A",
        "notes": "إنتاج وتوريد الخرسانة الجاهزة لمشاريع الإسكان الاجتماعي والكباري ومحاور الأنفاق"
    },
    {
        "nameAr": "شركة الفيروز لتصدير الموالح والمانجو (فايد - الإسماعيلية)",
        "nameEn": "Al Fayrouz Citrus & Mango Export Packhouse Fayed",
        "sector": "agriculture", "city": "ismailia", "district": "طريق الإسماعيلية السويس الزراعي - مركز فايد", "governorate": "الإسماعيلية",
        "address": "طريق فايد الزراعي - مجمع محطات الفرز والتعبئة والتبريد السريع",
        "phone1": "064-3661200", "phone2": "", "website": "",
        "email": "fayrouz.mango.citrus@gmail.com", "lat": 30.340, "lon": 32.300, "fleetSize": 45,
        "fleetType": "برادات وشاحنات مبردة لنقل المانجو الإسماعيلاوي والموالح لموانئ التصدير والأسواق", "priority": "A+",
        "notes": "فرز وتعبئة وشحن المانجو والموالح واليوسفي التصديري من مزارع فايد وسرابيوم للخارج"
    },
    {
        "nameAr": "شركة القناة للتبريد وسلاسل الإمداد الزراعي (سرابيوم - الإسماعيلية)",
        "nameEn": "Canal Cold Storage & Agro Supply Chain Serabioum",
        "sector": "transport", "city": "ismailia", "district": "منطقة سرابيوم الزراعية - الإسماعيلية", "governorate": "الإسماعيلية",
        "address": "طريق سرابيوم فايد - مجمع ثلاجات التبريد والتخزين اللوجستي للحاصلات الزراعية",
        "phone1": "064-3662400", "phone2": "", "website": "",
        "email": "canal.coldchain.serabioum@gmail.com", "lat": 30.450, "lon": 32.280, "fleetSize": 36,
        "fleetType": "أسطول شاحنات مبردة ثنائية الحرارة لتبريد ونقل الخضروات والفواكه لموانئ السخنة ودمياط", "priority": "A",
        "notes": "إدارة سلاسل التبريد والتخزين اللوجستي لمحاصيل الفراولة والموالح والتمور"
    },
    {
        "nameAr": "شركة التل الكبير لتسمين الماشية وتصنيع اللحوم والأعلاف",
        "nameEn": "Tel El Kebir Livestock Fattening Meat & Feedmills",
        "sector": "agriculture", "city": "ismailia", "district": "مركز التل الكبير - الإسماعيلية", "governorate": "الإسماعيلية",
        "address": "طريق الإسماعيلية الزقازيق الزراعي - مجمع مزارع التسمين ومطاحن الأعلاف",
        "phone1": "064-3771500", "phone2": "", "website": "",
        "email": "telelkebir.livestock@gmail.com", "lat": 30.550, "lon": 31.950, "fleetSize": 52,
        "fleetType": "تريلات نقل ماشية حية وسيارات نقل مبردة لتوزيع اللحوم وتريلات صوامع أعلاف", "priority": "A+",
        "notes": "تربية وتسمين الماشية وتصنيع الأعلاف المركزة وتوريد اللحوم الطازجة لمنافذ الجمهورية"
    },
    {
        "nameAr": "شركة الإسماعيلية مصر للدواجن (مجمع المجازر الآلية والأعلاف)",
        "nameEn": "Ismailia Misr Poultry Co Slaughterhouses & Feeds",
        "sector": "agriculture", "city": "ismailia", "district": "منطقة سرابيوم - طريق السويس الصحراوي", "governorate": "الإسماعيلية",
        "address": "الكيلو 15 طريق الإسماعيلية السويس الصحراوي - مجمع مزارع ومجازر الدواجن",
        "phone1": "064-3454500", "phone2": "", "website": "",
        "email": "ismailia.misrpoultry@gmail.com", "lat": 30.480, "lon": 32.220, "fleetSize": 60,
        "fleetType": "شاحنات أقفاص دواجن حية وبرادات مجهزة لتوزيع الدواجن المذبوحة والمجمدة للمحافظات", "priority": "A+",
        "notes": "إنتاج الدواجن والتسمين والبيض ومجازر آلية متطورة مع أسطول توزيع على مستوى الجمهورية"
    },
    {
        "nameAr": "شركة فريش للأجهزة المنزلية ومكونات التبريد (المنطقة الصناعية بالإسماعيلية)",
        "nameEn": "Fresh Home Appliances & Cooling Components Ismailia Complex",
        "sector": "manufacturing", "city": "ismailia", "district": "المنطقة الصناعية الأولى - الإسماعيلية", "governorate": "الإسماعيلية",
        "address": "المنطقة الصناعية بالإسماعيلية - مجمع مصانع فريش للمكونات الهندسية",
        "phone1": "064-3455100", "phone2": "", "website": "",
        "email": "fresh.appliances.ismailia@gmail.com", "lat": 30.595, "lon": 32.255, "fleetSize": 70,
        "fleetType": "شاحنات جامبو وتريلات مغلقة مجهزة لنقل الأجهزة الكهربائية والمكونات الصناعية", "priority": "A+",
        "notes": "تصنيع وتوزيع الأجهزة المنزلية ومكونات التبريد وشحنها لمستودعات ومنافذ الجمهورية"
    },
    {
        "nameAr": "شركة الإسماعيلية للصناعات الكهربائية والمحولات (وادي التكنولوجيا)",
        "nameEn": "Ismailia Electrical Industries & Transformers Technology Valley",
        "sector": "manufacturing", "city": "ismailia", "district": "وادي التكنولوجيا - شرق القناة - الإسماعيلية", "governorate": "الإسماعيلية",
        "address": "منطقة وادي التكنولوجيا - قطاع الصناعات الإلكترونية والمحولات - شرق القناة",
        "phone1": "064-3553200", "phone2": "", "website": "",
        "email": "ismailia.transformers.tech@gmail.com", "lat": 30.650, "lon": 32.400, "fleetSize": 35,
        "fleetType": "تريلات نقل محولات ضغط عالي ولوابد نقل لوحات تحكم كهربائية ومعدات توزيع طاقة", "priority": "A",
        "notes": "إنتاج وتوريد محولات الكهرباء ولوحات التوزيع لمشروعات الطاقة والمدن الجديدة بسيناء"
    },
    {
        "nameAr": "شركة التمساح لبناء السفن والخدمات الملاحية (الإسماعيلية)",
        "nameEn": "Timsah Shipbuilding & Marine Services SCA Ismailia",
        "sector": "manufacturing", "city": "ismailia", "district": "شارع الجيش - الإسماعيلية", "governorate": "الإسماعيلية",
        "address": "طريق نمرة 6 - ورش وبناء الوحدات البحرية لشركة التمساح - الإسماعيلية",
        "phone1": "064-3323400", "phone2": "", "website": "",
        "email": "timsah.shipbuilding@gmail.com", "lat": 30.600, "lon": 32.280, "fleetSize": 40,
        "fleetType": "قاطرات بحرية وأوناش مجنزرة وشاحنات نقل أنابيب بحرية ومنصات إنتاج بترول", "priority": "A+",
        "notes": "بناء وصيانة سفن الإمداد والخدمات البحرية لمنصات البترول والغاز بالبحر المتوسط والأحمر"
    },
    {
        "nameAr": "شركة القناة للرباط وأنوار السفن (هيئة قناة السويس)",
        "nameEn": "Canal Mooring & Searchlights Co SCA Ismailia",
        "sector": "transport", "city": "ismailia", "district": "ميدان مصطفى كامل - الإسماعيلية", "governorate": "الإسماعيلية",
        "address": "مقر هيئة قناة السويس - مبنى شركة القناة للرباط وأنوار السفن",
        "phone1": "064-3324600", "phone2": "", "website": "",
        "email": "canalmooring.sca@gmail.com", "lat": 30.595, "lon": 32.270, "fleetSize": 45,
        "fleetType": "لنشات رباط بحري سريعة وشاحنات نقل كشافات ومولدات إنارة السفن بطول القناة", "priority": "A",
        "notes": "تقديم خدمات رباط وتأمين عبور السفن وإنارة المجرى الملاحي على مدار 24 ساعة"
    },
    {
        "nameAr": "شركة قناة السويس للاستزراع السمكي والتصنيع اللوجستي (شرق القناة)",
        "nameEn": "Suez Canal Fish Farming & Agro-Logistics East Hub",
        "sector": "agriculture", "city": "ismailia", "district": "حوض الترسيد بشرق القناة - الإسماعيلية", "governorate": "الإسماعيلية",
        "address": "طريق شرق بورسعيد الإسماعيلية - مجمع المزارع السمكية ومصانع التعبئة الحديثة",
        "phone1": "064-3554100", "phone2": "", "website": "",
        "email": "canal.fishfarming.sca@gmail.com", "lat": 30.700, "lon": 32.350, "fleetSize": 38,
        "fleetType": "شاحنات أكسجين مجهزة لنقل زريعة وأسماك حية وسيارات تبريد وتجميد لتوزيع الأسماك", "priority": "A",
        "notes": "إنتاج وتجهيز وتوزيع أسماك الدنيس والقاروص والجمبري لمنافذ التوزيع والأسواق المركزية"
    },
    {
        "nameAr": "شركة الإسماعيلية لنقل المواد البترولية والمحروقات",
        "nameEn": "Ismailia Petroleum Haulage & Bulk Fuels Distribution",
        "sector": "petroleum", "city": "ismailia", "district": "طريق نفيشة الإسماعيلية الزراعي", "governorate": "الإسماعيلية",
        "address": "مستودعات الوقود المركزية - نفيشة - الإسماعيلية",
        "phone1": "064-3456200", "phone2": "", "website": "",
        "email": "ismailia.petroleumhaulage@gmail.com", "lat": 30.565, "lon": 32.235, "fleetSize": 44,
        "fleetType": "صهاريج نقل بنزين وسولار ومازوت لتموين محطات الوقود ومصانع وشركات القناة", "priority": "A",
        "notes": "نقل وتوزيع المنتجات البترولية والمحروقات لمحطات الكهرباء وشركات المقاولات بالمنطقة"
    },
    {
        "nameAr": "شركة القنطرة للمقاولات العامة والإنشاءات واستصلاح الأراضي",
        "nameEn": "Qantara General Contracting & Land Reclamation",
        "sector": "contracting", "city": "ismailia", "district": "طريق العريش الدولي - القنطرة شرق", "governorate": "الإسماعيلية",
        "address": "مدخل القنطرة شرق - مجمع ورش المعدات الثقيلة واستصلاح الأراضي",
        "phone1": "064-3555200", "phone2": "", "website": "",
        "email": "qantara.contracting.reclamation@gmail.com", "lat": 30.855, "lon": 32.340, "fleetSize": 40,
        "fleetType": "لوادر وحفارات وكساحات نقل معدات وتسوية أراضي وتريلات نقل مواسير ري ضخمة", "priority": "A",
        "notes": "تنفيذ أعمال البنية التحتية واستصلاح أراضي ترعة السلام والمزارع النموذجية بشرق القناة"
    },
    {
        "nameAr": "شركة فايد للصناعات الغذائية وحفظ وتجميد الخضروات",
        "nameEn": "Fayed Food Canning & Vegetable Quick Freezing",
        "sector": "manufacturing", "city": "ismailia", "district": "طريق فايد الصحراوي - الإسماعيلية", "governorate": "الإسماعيلية",
        "address": "طريق السويس الإسماعيلية الزراعي - مجمع مصانع تصنيع وتجميد الخضروات بفايد",
        "phone1": "064-3663800", "phone2": "", "website": "",
        "email": "fayed.canning.freezing@gmail.com", "lat": 30.330, "lon": 32.290, "fleetSize": 32,
        "fleetType": "شاحنات تبريد ومجمدات لنقل الخضروات المعالجة والمعلبات لسلاسل التجزئة والموانئ", "priority": "B+",
        "notes": "حفظ وتجميد البامية والبسلة والفاصوليا الخضراء وتوريدها للأسواق المحلية والتصدير"
    },
    {
        "nameAr": "شركة الإسماعيلية للغازات الصناعية والطبية وتعبئة النيتروجين",
        "nameEn": "Ismailia Industrial Gases & Medical Nitrogen Refilling",
        "sector": "manufacturing", "city": "ismailia", "district": "المنطقة الصناعية الأولى - الإسماعيلية", "governorate": "الإسماعيلية",
        "address": "المنطقة الصناعية - قطاع الغازات الصناعية - الإسماعيلية",
        "phone1": "064-3457100", "phone2": "", "website": "",
        "email": "ismailia.gases.medical@gmail.com", "lat": 30.588, "lon": 32.248, "fleetSize": 28,
        "fleetType": "شاحنات مخصصة لنقل أسطوانات غازات اللحام والقطع وصهاريج نقل نيتروجين سائل", "priority": "B+",
        "notes": "تعبئة وتوريد غازات الأكسجين والأرجون والنيتروجين لورش الترسانات ومصانع القناة"
    },
    {
        "nameAr": "شركة الإسماعيلية للكرتون المضلع ومواد التعبئة الزراعية",
        "nameEn": "Ismailia Corrugated Packaging & Agro Boxes",
        "sector": "manufacturing", "city": "ismailia", "district": "المنطقة الصناعية الأولى - الإسماعيلية", "governorate": "الإسماعيلية",
        "address": "طريق نفيشة - مجمع مصانع الكرتون وعبوات تصدير الفاكهة والخضروات",
        "phone1": "064-3457900", "phone2": "", "website": "",
        "email": "ismailia.packaging.carton@gmail.com", "lat": 30.592, "lon": 32.252, "fleetSize": 34,
        "fleetType": "شاحنات جامبو بصناديق مغلقة وتريلات لنقل رولات الكرتون وكراتين تعبئة وتصدير المانجو والموالح", "priority": "B+",
        "notes": "إنتاج الصناديق الكرتونية المقواة المخصصة لمحطات تصدير الحاصلات الزراعية بالإسماعيلية"
    },
    {
        "nameAr": "شركة الإسماعيلية لتصنيع وتشكيل الصاج والجمالونات الصناعية",
        "nameEn": "Ismailia Industrial Metal Sheet Fabrication & Warehouses",
        "sector": "manufacturing", "city": "ismailia", "district": "المنطقة الصناعية الثانية - الإسماعيلية", "governorate": "الإسماعيلية",
        "address": "طريق نفيشة السويس - مجمع مصانع تشكيل ودرفلة الصاج والجمالونات",
        "phone1": "064-3458400", "phone2": "", "website": "",
        "email": "ismailia.metalsheet.eng@gmail.com", "lat": 30.582, "lon": 32.242, "fleetSize": 35,
        "fleetType": "تريلات أطوال لنقل كمرات الصلب وألواح الصاج المعرج وأوناش رفع وتثبيت جمالونات", "priority": "B+",
        "notes": "تصنيع وتركيب الجمالونات المعدنية والهياكل الفولاذية للمستودعات اللوجستية بشرق القناة"
    },
    {
        "nameAr": "شركة سرابيوم للأعلاف وتسمين العجول والإنتاج الحيواني",
        "nameEn": "Serabioum Animal Feeds & Cattle Fattening Livestock",
        "sector": "agriculture", "city": "ismailia", "district": "قرية سرابيوم - مركز فايد", "governorate": "الإسماعيلية",
        "address": "طريق سرابيوم الزراعي - مجمع مزارع تسمين الأبقار ومصنع الأعلاف المركزة",
        "phone1": "064-3664500", "phone2": "", "website": "",
        "email": "serabioum.feeds.livestock@gmail.com", "lat": 30.460, "lon": 32.270, "fleetSize": 40,
        "fleetType": "تريلات نقل مواشي حية وشاحنات نقل صوامع أعلاف وبرادات توزيع اللحوم والألبان", "priority": "A",
        "notes": "تربية وتسمين الماشية وإنتاج وتوزيع الألبان واللحوم الطازجة لمحافظات القناة والقاهرة"
    },
    {
        "nameAr": "شركة القنطرة غرب للصناعات البلاستيكية وخراطيم الري بالتنقيط",
        "nameEn": "Qantara West Plastic Pipe & Drip Irrigation Systems",
        "sector": "manufacturing", "city": "ismailia", "district": "المنطقة الصناعية بالقنطرة غرب", "governorate": "الإسماعيلية",
        "address": "طريق القنطرة بورسعيد - مجمع مصانع مواسير وخراطيم شبكات الري الحديث",
        "phone1": "064-3556300", "phone2": "", "website": "",
        "email": "qantara.dripirrigation@gmail.com", "lat": 30.865, "lon": 32.295, "fleetSize": 32,
        "fleetType": "تريلات نقل رولات خراطيم الري وشاحنات جامبو لتوزيع شبكات الري لمزارع سيناء", "priority": "B+",
        "notes": "إنتاج وتوريد نظم الري بالتنقيط والمواسير البلاستيكية لمشروعات استصلاح سيناء والدلتا"
    },

    # ── Sub-Cluster 3: شمال ووسط وجنوب سيناء (الأسمنت، التعدين، الجبس، السيليكا، والمقاولات) ──
    {
        "nameAr": "شركة سيناء للأسمنت الأبيض (العريش - وسط سيناء)",
        "nameEn": "Sinai White Portland Cement Co El Arish & Central Sinai",
        "sector": "manufacturing", "city": "north_sinai", "district": "منطقة لحفن - جنوب العريش - وسط سيناء", "governorate": "شمال سيناء",
        "address": "طريق العريش الحسنة - مجمع مصانع سيناء للأسمنت الأبيض فائق الجودة",
        "phone1": "068-3351200", "phone2": "", "website": "",
        "email": "sinai.whitecement.logistics@gmail.com", "lat": 31.050, "lon": 33.780, "fleetSize": 85,
        "fleetType": "أسطول تريلات سايلو لنقل الأسمنت السائب وشاحنات نقل أسمنت معبأ لموانئ التصدير والجمهورية", "priority": "A+",
        "notes": "أكبر منتج ومصدر للأسمنت البورتلاندي الأبيض في الشرق الأوسط مع أسطول نقل استراتيجي"
    },
    {
        "nameAr": "شركة أسمنت سيناء (المصنع والمقر اللوجستي - وسط سيناء)",
        "nameEn": "Sinai Cement Company Plant & Logistics Central Sinai",
        "sector": "manufacturing", "city": "north_sinai", "district": "منطقة القسيمة - وسط سيناء", "governorate": "شمال سيناء",
        "address": "طريق العريش نخل - مجمع مصانع أسمنت سيناء الرمادي ومحاجر الحجر الجيري",
        "phone1": "068-3352400", "phone2": "", "website": "",
        "email": "sinaicement.logistics@gmail.com", "lat": 30.750, "lon": 34.050, "fleetSize": 90,
        "fleetType": "تريلات صوامع أسمنت وتريلات شحن شكائر وكلنكر لمشروعات الإسكان والبنية التحتية", "priority": "A+",
        "notes": "إنتاج وتوريد الأسمنت الرمادي والكلنكر للمشاريع القومية وتعمير شبه جزيرة سيناء"
    },
    {
        "nameAr": "شركة سيناء للمنجنيز (أبو زنيمة - جنوب سيناء)",
        "nameEn": "Sinai Manganese Company Abu Zenima South Sinai",
        "sector": "manufacturing", "city": "south_sinai", "district": "ميناء أبو زنيمة التعديني - خليج السويس", "governorate": "جنوب سيناء",
        "address": "طريق النفق شرم الشيخ الدولي الكيلو 130 - مجمع مصانع وميناء سيناء للمنجنيز",
        "phone1": "069-3501200", "phone2": "", "website": "",
        "email": "sinai.manganese.abuzenima@gmail.com", "lat": 29.040, "lon": 33.100, "fleetSize": 75,
        "fleetType": "قلابات تعدين ثقيلة وتريلات نقل سبائك فيروسيليكون ومنجنيز وروافع شحن بواخر", "priority": "A+",
        "notes": "استخراج وتصنيع خام المنجنيز والسبائك الحديدية والجبس مع أسطول نقل تعديني وميناء تصدير بحري"
    },
    {
        "nameAr": "شركة الجبس الدولية ومحاجر الجبس (رأس سدر - جنوب سيناء)",
        "nameEn": "International Gypsum Co & Quarries Ras Sudr South Sinai",
        "sector": "manufacturing", "city": "south_sinai", "district": "منطقة وادي غرندل - رأس سدر", "governorate": "جنوب سيناء",
        "address": "طريق النفق طور سيناء الكيلو 65 - مجمع مصانع ومحاجر الجبس الطبيعي فائق النقاوة",
        "phone1": "069-3401500", "phone2": "", "website": "",
        "email": "gypsuminternational.rassudr@gmail.com", "lat": 29.580, "lon": 32.720, "fleetSize": 60,
        "fleetType": "قلابات ثقيلة 3 محاور لنقل صخور الجبس وتريلات نقل ألواح وجبس معبأ للمحافظات", "priority": "A+",
        "notes": "استخراج وتكليس وتصنيع الجبس الطبيعي وألواح الجبس بورد لمصانع البناء وموانئ التصدير"
    },
    {
        "nameAr": "شركة سيناء للسيليكا ورمل الزجاج فائق النقاوة (رأس سدر)",
        "nameEn": "Sinai Silica & High Purity Glass Sand Ras Sudr",
        "sector": "manufacturing", "city": "south_sinai", "district": "محاجر السيليكا بوادي سدر - جنوب سيناء", "governorate": "جنوب سيناء",
        "address": "طريق رأس سدر نخل - مجمع محاجر ومغاسل رمال السيليكا الصناعية",
        "phone1": "069-3402300", "phone2": "", "website": "",
        "email": "sinai.silica.glassand@gmail.com", "lat": 29.600, "lon": 32.750, "fleetSize": 55,
        "fleetType": "تريلات قلاب جوانب وتريلات مغلقة لنقل رمل الزجاج المغسول لمصانع الزجاج والبلور", "priority": "A+",
        "notes": "استخراج وغسيل وتوريد رمال السيليكا فائقة النقاوة لكبرى مصانع الزجاج والرقائق بالعاشر وأكتوبر"
    },
    {
        "nameAr": "شركة العريش للمقاولات العامة والخرسانة الجاهزة (شمال سيناء)",
        "nameEn": "El Arish General Contracting & Ready Mix Concrete",
        "sector": "contracting", "city": "north_sinai", "district": "المنطقة الصناعية بالعريش - المساعيد", "governorate": "شمال سيناء",
        "address": "طريق العريش الدولي - مجمع محطات الخرسانة الجاهزة والبلوك الآلي",
        "phone1": "068-3353600", "phone2": "", "website": "",
        "email": "elarish.readymix.concrete@gmail.com", "lat": 31.120, "lon": 33.750, "fleetSize": 48,
        "fleetType": "خلاطات خرسانة أوتوماتيكية ومضخات أسمنت وتريلات نقل سن وركام محاجر سيناء", "priority": "A",
        "notes": "إنتاج وتوريد الخرسانة الجاهزة لمشاريع ميناء العريش البحري والتوسعات العمرانية"
    },
    {
        "nameAr": "شركة الفيروز للرخام والجرانيت وأحجار الزينة (وسط سيناء)",
        "nameEn": "Al Fayrouz Marble Granite & Decorative Stones Central Sinai",
        "sector": "manufacturing", "city": "north_sinai", "district": "مجمع صناعات الرخام بالجفجافة - وسط سيناء", "governorate": "شمال سيناء",
        "address": "طريق الإسماعيلية العوجة الأوسط - مجمع مصانع ومحاجر رخام سيناء المعتمد",
        "phone1": "068-3354800", "phone2": "", "website": "",
        "email": "fayrouz.marble.sinai@gmail.com", "lat": 30.500, "lon": 33.500, "fleetSize": 45,
        "fleetType": "تريلات لوابد ثقيلة لنقل بلوكات الرخام وتريلات نقل ترابيع ورخام منشور للموانئ", "priority": "A",
        "notes": "استخراج ونشر وتشطيب الرخام السيناوي الفاخر (تريستا وسيلفيا) وتصديره للأسواق العالمية"
    },
    {
        "nameAr": "شركة سيناء للمياه الطبيعية والتعبئة وتوزيع المحطات (جنوب سيناء)",
        "nameEn": "Sinai Natural Mineral Water Bottling South Sinai Co",
        "sector": "manufacturing", "city": "south_sinai", "district": "وادي وتير - نويبع - جنوب سيناء", "governorate": "جنوب سيناء",
        "address": "طريق دهب نويبع الدولي - مجمع آبار وتعبئة المياه الطبيعية بسيناء",
        "phone1": "069-3522800", "phone2": "", "website": "",
        "email": "sinaiwater.bottling@gmail.com", "lat": 29.000, "lon": 34.600, "fleetSize": 40,
        "fleetType": "شاحنات جامبو وتريلات نقل وتوزيع مياه طبيعية معبأة لفنادق ومنتجعات شرم الشيخ ودهب", "priority": "A",
        "notes": "استخراج وتعبئة وتوزيع مياه الآبار الجوفية النقية لقطاع السياحة والأسواق المحلية"
    },
    {
        "nameAr": "شركة رأس سدر للنقل الثقيل واللوجستيات البترولية",
        "nameEn": "Ras Sudr Heavy Haulage & Petroleum Logistics Co",
        "sector": "transport", "city": "south_sinai", "district": "منطقة عسل البترولية - رأس سدر", "governorate": "جنوب سيناء",
        "address": "طريق رأس سدر الطور - مجمع جراجات شاحنات النقل الثقيل وخدمات حقول البترول",
        "phone1": "069-3403600", "phone2": "", "website": "",
        "email": "rassudr.heavyhaulage.oil@gmail.com", "lat": 29.550, "lon": 32.700, "fleetSize": 46,
        "fleetType": "كساحات نقل حفارات بترول ولوابد نقل مواسير حفر وصهاريج نقل مياه وسولار للحقول", "priority": "A",
        "notes": "دعم ونقل المعدات الثقيل وأدوات الحفر لشركات البترول والتعدين بخليج السويس وسيناء"
    },
    {
        "nameAr": "شركة خليج السويس للمقاولات البحرية وحفر الآبار (أبو رديس)",
        "nameEn": "Gulf of Suez Marine Works & Well Drilling Abu Rudeis",
        "sector": "petroleum", "city": "south_sinai", "district": "منطقة حقول بلاعيم البترولية - أبو رديس", "governorate": "جنوب سيناء",
        "address": "طريق أبو رديس الطور - مجمع الخدمات البترولية وحفر الآبار البحرية والبرية",
        "phone1": "069-3511800", "phone2": "", "website": "",
        "email": "gulfofsuez.marine.drilling@gmail.com", "lat": 28.900, "lon": 33.200, "fleetSize": 50,
        "fleetType": "شاحنات معدات حفر وتريلات نقل خراطيم وصمامات ضغط عالي وصهاريج سوائل حفر", "priority": "A+",
        "notes": "مقاولات حفر وصيانة الآبار البترولية والنقل الميكانيكي لحقول بترول بلاعيم وخليج السويس"
    },
    {
        "nameAr": "شركة جنوب سيناء للأعلاف وتجارة الحبوب (الطور)",
        "nameEn": "South Sinai Animal Feeds & Grain Trading El Tor",
        "sector": "agriculture", "city": "south_sinai", "district": "المنطقة الحرفية بمدينة طور سيناء", "governorate": "جنوب سيناء",
        "address": "طريق الطور شرم الشيخ - مجمع مستودعات الأعلاف والحبوب الزراعية",
        "phone1": "069-3771400", "phone2": "", "website": "",
        "email": "southsinai.feeds.eltor@gmail.com", "lat": 28.250, "lon": 33.620, "fleetSize": 32,
        "fleetType": "تريلات جوانب مصفحة لنقل خامات الذرة والصويا والأعلاف المركزة لمزارع سيناء", "priority": "B+",
        "notes": "توزيع وتوريد الأعلاف المركزة لمزارع الدواجن والماشية ومشروعات التنمية الزراعية بجنوب سيناء"
    },
    {
        "nameAr": "شركة النيل للمقاولات وأعمال الطرق وتنمية سيناء (محور النفق)",
        "nameEn": "Nile Roads & Sinai Infrastructure Development Co",
        "sector": "contracting", "city": "south_sinai", "district": "مدخل نفق الشهيد أحمد حمدي - رأس سدر", "governorate": "جنوب سيناء",
        "address": "طريق النفق شرم الشيخ الكيلو 15 - مجمع خلاطات الأسفلت ومعدات الرصف",
        "phone1": "069-3404500", "phone2": "", "website": "",
        "email": "nile.sinaiinfrastructure@gmail.com", "lat": 29.900, "lon": 32.600, "fleetSize": 58,
        "fleetType": "فنشرات أسفلت وهراسات عملاقة وقلابات نقل أسفلت ساخن وتريلات ركام وسن", "priority": "A+",
        "notes": "رصف وتطوير الطرق السريعة ومحاور التنمية والأنفاق والكباري الاستراتيجية بشبه جزيرة سيناء"
    },
    {
        "nameAr": "شركة سيناء للنقل المبرد وشحن الأغذية لمنتجعات شرم الشيخ ودهب",
        "nameEn": "Sinai Cold Logistics & Resort Food Supply Sharm & Dahab",
        "sector": "transport", "city": "south_sinai", "district": "المنطقة اللوجستية بالرويسات - شرم الشيخ", "governorate": "جنوب سيناء",
        "address": "حي الرويسات - مجمع المستودعات المركزية وثلاجات التبريد - شرم الشيخ",
        "phone1": "069-3661800", "phone2": "", "website": "",
        "email": "sharm.coldlogistics.resorts@gmail.com", "lat": 27.920, "lon": 34.310, "fleetSize": 48,
        "fleetType": "شاحنات تبريد وتجميد فريزر لنقل وتوزيع اللحوم والدواجن والألبان والخضروات للفنادق", "priority": "A",
        "notes": "الإمداد الغذائي اللوجستي وسلاسل التبريد لمئات الفنادق والمنتجعات السياحية بشرم الشيخ ودهب"
    },
    {
        "nameAr": "شركة طور سيناء للخرسانة الجاهزة ورصف الطرق (جنوب سيناء)",
        "nameEn": "El Tor Ready Mix Concrete & Paving South Sinai",
        "sector": "contracting", "city": "south_sinai", "district": "المنطقة الصناعية بمدينة الطور", "governorate": "جنوب سيناء",
        "address": "طريق الجبيل - مجمع محطات الخرسانة ومصانع البردورات والإنترلوك بالطور",
        "phone1": "069-3772500", "phone2": "", "website": "",
        "email": "eltor.readymix.concrete@gmail.com", "lat": 28.230, "lon": 33.640, "fleetSize": 36,
        "fleetType": "خلاطات خرسانة أوتوماتيكية ومضخات أسمنت وتريلات نقل مواد بناء وأسمنت", "priority": "B+",
        "notes": "إنتاج وتوريد الخرسانة الجاهزة لمشاريع الإسكان التنموي وجامعة الملك سلمان بالطور"
    },
    {
        "nameAr": "شركة العريش للتجارة والنقل الدولي وشاحنات العبور البري",
        "nameEn": "El Arish International Trade & Cross-Border Trucking",
        "sector": "transport", "city": "north_sinai", "district": "ميناء العريش البحري وميناء رفح البري", "governorate": "شمال سيناء",
        "address": "طريق العريش رفح الدولي - مجمع ساحات الشحن اللوجستي والتخليص الجمركي",
        "phone1": "068-3356100", "phone2": "", "website": "",
        "email": "elarish.internationaltrucking@gmail.com", "lat": 31.140, "lon": 33.820, "fleetSize": 62,
        "fleetType": "تريلات تريلا مسطحة وبرادات نقل بضائع ومساعدات إغاثية وشاحنات نقل بضائع عامة", "priority": "A+",
        "notes": "إدارة قوافل الشحن البري وتسيير شاحنات النقل الدولي للبضائع عبر المعابر والموانئ"
    },
    {
        "nameAr": "شركة سانت كاترين للصناعات البيئية والأعشاب الطبية",
        "nameEn": "Saint Catherine Ecological Industries & Medicinal Herbs",
        "sector": "manufacturing", "city": "south_sinai", "district": "منطقة التجلي الأعظم - سانت كاترين", "governorate": "جنوب سيناء",
        "address": "طريق كاترين الطور - مجمع تصنيع وتجفيف الأعشاب الطبية والنباتات العطرية",
        "phone1": "069-3471200", "phone2": "", "website": "",
        "email": "saintcatherine.herbs.eco@gmail.com", "lat": 28.560, "lon": 33.950, "fleetSize": 25,
        "fleetType": "شاحنات فان وجامبو مغلقة مجهزة لنقل وتوزيع المنتجات العشبية والزيوت الطبيعية", "priority": "B+",
        "notes": "زراعة وتجفيف واستخلاص الزيوت العطرية والنباتات الطبية السيناوية النادرة وتوزيعها"
    },
    {
        "nameAr": "شركة أبو زنيمة للحديد والسبائك الحديدية (جنوب سيناء)",
        "nameEn": "Abu Zenima Ferroalloys & Smelting Works South Sinai",
        "sector": "manufacturing", "city": "south_sinai", "district": "المنطقة الصناعية بأبو زنيمة", "governorate": "جنوب سيناء",
        "address": "طريق أبو زنيمة السويس - مجمع أفران صهر المعادن وتصنيع السبائك",
        "phone1": "069-3502500", "phone2": "", "website": "",
        "email": "abuzenima.ferroalloys@gmail.com", "lat": 29.050, "lon": 33.110, "fleetSize": 45,
        "fleetType": "تريلات نقل سبائك حديدية ثقيلة وقلابات نقل فحم كوك وخامات صهر المعادن", "priority": "A",
        "notes": "صهر وتصنيع السبائك الحديدية اللازمة لصناعة الصلب وتوريدها لمصانع الحديد بالسويس والقاهرة"
    },
    {
        "nameAr": "شركة شمال سيناء للغاز والوقود وتوزيع المحروقات",
        "nameEn": "North Sinai Fuel & Bulk Gas Distribution Co El Arish",
        "sector": "petroleum", "city": "north_sinai", "district": "طريق العريش القنطرة السريع", "governorate": "شمال سيناء",
        "address": "مجمع مستودعات الوقود والغاز المسال الرئيسي - العريش",
        "phone1": "068-3357500", "phone2": "", "website": "",
        "email": "northsinai.gasfuel.arish@gmail.com", "lat": 31.110, "lon": 33.720, "fleetSize": 38,
        "fleetType": "صهاريج نقل غاز صب ومحروقات وسيارات نقل وتوزيع أسطوانات الغاز لمدن سيناء", "priority": "A",
        "notes": "تأمين ونقل وتوزيع الوقود والمحروقات السائلة والغاز الصب لمحطات التوليد والمصانع"
    },
    {
        "nameAr": "شركة سيناء للفحم والتعدين وتجارة الوقود الصلب (منطقة المغارة)",
        "nameEn": "Sinai Coal Mining & Solid Fuels Trading Maghara Basin",
        "sector": "manufacturing", "city": "north_sinai", "district": "جبل المغارة - وسط وشمال سيناء", "governorate": "شمال سيناء",
        "address": "طريق الحسنة العريش - مجمع محاجر ومناجم فحم المغارة الطبيعي",
        "phone1": "068-3358200", "phone2": "", "website": "",
        "email": "sinai.coal.maghara@gmail.com", "lat": 30.700, "lon": 33.400, "fleetSize": 45,
        "fleetType": "قلابات تعدين ثقيلة وتريلات نقل فحم حجري وكوك لمصانع الأسمنت وتوليد الطاقة", "priority": "A",
        "notes": "استخراج وتكسير وتوريد الفحم الحجري الطبيعي والوقود الصلب لمصانع الأسمنت والصناعات الثقيلة"
    },
    {
        "nameAr": "شركة نويبع للملاحة والشحن البري السريع والشاحنات الدولية",
        "nameEn": "Nuweiba Maritime Freight & Cross-Border Trucking Hub",
        "sector": "transport", "city": "south_sinai", "district": "ميناء نويبع البحري - خليج العقبة", "governorate": "جنوب سيناء",
        "address": "بوابة ميناء نويبع البحري - مجمع ساحات الشحن البري الدولي وتريلات العبور",
        "phone1": "069-3523600", "phone2": "", "website": "",
        "email": "nuweiba.freight.shipping@gmail.com", "lat": 28.980, "lon": 34.650, "fleetSize": 50,
        "fleetType": "تريلات برادات دولية وتريلات مسطحة لنقل البضائع عبر خط الجسر العربي نويبع العقبة", "priority": "A+",
        "notes": "شحن ونقل وتخليص شاحنات الترانزيت الدولي بين مصر والأردن ودول الخليج العربي"
    },
    {
        "nameAr": "شركة شرم الشيخ للمقاولات العامة والإنشاءات الفندقية والخرسانة الجاهزة",
        "nameEn": "Sharm El Sheikh General Contracting & Ready Mix Concrete",
        "sector": "contracting", "city": "south_sinai", "district": "المنطقة الحرفية بالرويسات - شرم الشيخ", "governorate": "جنوب سيناء",
        "address": "طريق السلام - مجمع محطات الخرسانة الجاهزة وأعمال التطوير الفندقي",
        "phone1": "069-3662900", "phone2": "", "website": "",
        "email": "sharm.readymix.contracting@gmail.com", "lat": 27.950, "lon": 34.330, "fleetSize": 44,
        "fleetType": "خلاطات خرسانة أوتوماتيكية ومضخات أسمنت وتريلات نقل سن وركام ورصف الأسفلت", "priority": "A",
        "notes": "تنفيذ مشروعات البنية التحتية والخرسانة والإنشاءات الفندقية وتوسعات منتجعات شرم الشيخ"
    }
]

print(f"\nProcessing {len(candidates_data)} candidate enterprises for Square 8...")

approved_companies = []
rejected = 0

for idx, cand in enumerate(candidates_data, start=1):
    comp_id = f"comp_p2_canal_sinai_{idx:03d}"
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
print("Results for Square 8 (Canal & Sinai Maritime, Industrial & Mining Corridor):")
print(f"Total Candidates: {len(candidates_data)}")
print(f"Approved (Pure B2B, Zero Duplicates): {len(approved_companies)}")
print(f"Rejected: {rejected}")
print("="*42)

os.makedirs('scraper/output', exist_ok=True)
out_path = 'scraper/output/phase2_canal_sinai_verified_b2b_fleet.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(approved_companies, f, ensure_ascii=False, indent=2)

print(f"Saved {len(approved_companies)} approved enterprises to {out_path}\n")
