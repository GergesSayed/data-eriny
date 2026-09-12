import sys
import os
import re
import json
import subprocess
import overturemaps
import pandas as pd

# Reconfigure stdout for pristine UTF-8 Arabic printing
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

print("==================================================================")
print("=== SPATIAL MICRO-GRID HARVESTER: 6TH OF OCTOBER & ABU RAWASH ===")
print("==================================================================")

# 1. Geographic Bounding Boxes with stac=True
# We query two targeted industrial zones to ensure 100% census coverage:
TARGET_AREAS = [
    {
        "id": "OCTOBER_INDUSTRIAL",
        "name": "المنطقة الصناعية بمدينة 6 أكتوبر والمطورين وبولاريس",
        "bbox": (30.70, 29.82, 30.98, 30.02)
    },
    {
        "id": "ABU_RAWASH_INDUSTRIAL",
        "name": "المنطقة الصناعية بأبو رواش ومحور مصر-إسكندرية الصحراوي",
        "bbox": (30.98, 30.00, 31.12, 30.12)
    }
]

# Micro-zones mapping based on GPS coordinates
def classify_micro_zone(lon, lat):
    if not lon or not lat:
        return "المنطقة الصناعية بمدينة 6 أكتوبر"
    
    # Abu Rawash: lat >= 30.00 and lon >= 30.98
    if lat >= 30.00 and lon >= 30.98:
        if lat >= 30.05:
            return "المنطقة الصناعية بأبو رواش (القطاع الشمالي وطريق إسكندرية)"
        return "المنطقة الصناعية بأبو رواش (القطاع الجنوبي والقرية الذكية)"
    
    # 6th of October Industrial Zones
    if lon < 30.82:
        return "منطقة المطورين الصناعيين (بولاريس / بيراميدز / CPC)"
    elif lon < 30.88:
        if lat < 29.90:
            return "المنطقة الصناعية السادسة (6 أكتوبر)"
        elif lat < 29.93:
            return "المنطقة الصناعية الخامسة (6 أكتوبر)"
        else:
            return "المنطقة الصناعية الرابعة (6 أكتوبر)"
    else:
        if lat < 29.90:
            return "المنطقة الصناعية الثالثة (6 أكتوبر)"
        elif lat < 29.94:
            return "المنطقة الصناعية الثانية (6 أكتوبر)"
        else:
            return "المنطقة الصناعية الأولى (6 أكتوبر)"

# Negative words to filter out consumer/retail/civic entities
AR_EXCLUDE_WORDS = [
    'مطعم', 'كافيه', 'كوفي', 'مقهى', 'سوبر ماركت', 'ماركت', 'بقالة', 'صيدلية',
    'مستشفى', 'عيادة', 'مركز طبي', 'مسجد', 'جامع', 'كنيسة', 'مدرسة', 'حضانة',
    'سنترال', 'بريد', 'صالون', 'حلاق', 'كوافير', 'محكمة', 'قسم شرطة', 'مخبز',
    'فطائر', 'مغسلة', 'دراي كلين', 'جيم', 'نادي صحي', 'شاورما', 'مشويات', 'فول وفلافل'
]

EXCLUDE_CATEGORIES = [
    'restaurant', 'cafe', 'coffee_shop', 'bakery', 'fast_food', 'grocery_or_supermarket',
    'convenience_store', 'clothing_store', 'beauty_salon', 'hairdresser', 'school',
    'kindergarten', 'mosque', 'place_of_worship', 'pharmacy', 'hospital', 'clinic', 
    'dentist', 'apartment', 'housing_complex', 'hotel', 'atm', 'park', 'laundry',
    'doctor', 'lawyer', 'bank'
]

# Strict B2B / Industrial Keywords
INDUSTRIAL_KEYWORDS = [
    'factory', 'manufactur', 'industrial', 'warehouse', 'logistics', 'transport',
    'chemical', 'plastic', 'steel', 'metal', 'textile', 'food', 'beverage',
    'concrete', 'cement', 'building_materials', 'quarry', 'pharmaceutical',
    'distribution', 'depot', 'packaging', 'engineering', 'machinery', 'automotive',
    'commercial_industrial', 'business_manufacturing_and_supply', 'construction',
    'freight', 'cargo', 'storage', 'wholesaler', 'contractor', 'commercial_truck',
    'ready_mix', 'pipes', 'refinery'
]

AR_INDUSTRIAL_WORDS = [
    'مصنع', 'شركة', 'مجموعة', 'صناعات', 'للصناعة', 'بلاستيك', 'حديد', 'صلب', 
    'غزل', 'نسيج', 'كرتون', 'أغذية', 'رخام', 'جرانيت', 'كيماويات', 'مستودع', 
    'مخازن', 'نقل', 'شحن', 'خرسانة', 'أسمنت', 'مقاولات', 'تجهيز', 'معدات',
    'أدوية', 'كابلات', 'الومنيوم', 'سيراميك', 'زجاج', 'أعلاف', 'مطاحن',
    'طباعة', 'تغليف', 'لوجستيك', 'ميكانيكا', 'هندسة', 'صناعي', 'تشغيل معادن',
    'خطوط انتاج', 'دهانات', 'زيوت', 'بترول', 'محطة خرسانة', 'مواسير'
]

raw_records = []
total_scanned_overall = 0

for target in TARGET_AREAS:
    print(f"\n--- Scanning Area: {target['name']} ---")
    print(f"BBox: {target['bbox']} with stac=True...")
    reader = overturemaps.record_batch_reader("place", bbox=target['bbox'], stac=True)
    
    scanned_area = 0
    area_matches = 0

    for batch in reader:
        pydict = batch.to_pydict()
        batch_size = len(pydict['id'])
        scanned_area += batch_size
        total_scanned_overall += batch_size

        for i in range(batch_size):
            name_obj = pydict['names'][i] if pydict['names'] else None
            primary_name = name_obj.get('primary', '') if name_obj else ''
            common_names = name_obj.get('common', {}) if name_obj else {}
            name_ar = common_names.get('ar', '') if isinstance(common_names, dict) else ''
            name_en = common_names.get('en', '') if isinstance(common_names, dict) else ''
            
            display_name = name_ar or primary_name or name_en
            if not display_name or len(display_name.strip()) < 2:
                continue

            # Check negative arabic keywords
            if any(bad in display_name for bad in AR_EXCLUDE_WORDS):
                continue

            # Check categories
            cat_obj = pydict['categories'][i] if pydict['categories'] else None
            primary_cat = cat_obj.get('primary', '') if cat_obj else ''
            alt_cats = cat_obj.get('alternate', []) if cat_obj else []
            all_cat_str = (primary_cat + ' ' + ' '.join(alt_cats if isinstance(alt_cats, list) else [])).lower()

            # Filter out non-B2B
            if any(exc in all_cat_str for exc in EXCLUDE_CATEGORIES):
                continue

            # Check industrial B2B criteria
            is_industrial = any(kw in all_cat_str for kw in INDUSTRIAL_KEYWORDS)
            has_ar_indicator = any(w in display_name for w in AR_INDUSTRIAL_WORDS)

            if not (is_industrial or has_ar_indicator or 'business' in all_cat_str or 'industrial' in all_cat_str):
                continue

            # Coordinates
            bbox_item = pydict['bbox'][i] if pydict['bbox'] else {}
            lon, lat = None, None
            if bbox_item:
                xmin = bbox_item.get('xmin') or bbox_item.get('minx')
                xmax = bbox_item.get('xmax') or bbox_item.get('maxx')
                ymin = bbox_item.get('ymin') or bbox_item.get('miny')
                ymax = bbox_item.get('ymax') or bbox_item.get('maxy')
                if xmin is not None and xmax is not None:
                    lon = (xmin + xmax) / 2
                if ymin is not None and ymax is not None:
                    lat = (ymin + ymax) / 2

            # Phones
            phones_list = pydict['phones'][i] if pydict['phones'] else []
            phone = phones_list[0] if (phones_list and len(phones_list) > 0) else ''

            # Websites
            websites_list = pydict['websites'][i] if pydict['websites'] else []
            website = websites_list[0] if (websites_list and len(websites_list) > 0) else ''

            # Addresses
            addr_list = pydict['addresses'][i] if pydict['addresses'] else []
            address_str = ''
            if addr_list and len(addr_list) > 0:
                first_addr = addr_list[0]
                if isinstance(first_addr, dict):
                    address_str = first_addr.get('freeform', '') or first_addr.get('locality', '')

            maps_url = f"https://www.google.com/maps?q={round(lat, 6)},{round(lon, 6)}" if (lat and lon) else ""
            micro_zone = classify_micro_zone(lon, lat)

            # Arabic Sector Classification
            sector_ar = "تصنيع وإنتاج هندسي عام ومعدات"
            if any(x in all_cat_str for x in ['food', 'beverage', 'snack', 'grain']) or any(w in display_name for w in ['أغذية', 'عصير', 'ألبان', 'مطاحن', 'حلواني', 'شيبس', 'بسكويت']):
                sector_ar = "صناعات غذائية ومشروبات ومطاحن"
            elif any(x in all_cat_str for x in ['plastic', 'rubber']) or any(w in display_name for w in ['بلاستيك', 'مطاط', 'مواسير']):
                sector_ar = "صناعات بلاستيكية ومطاطية ومواسير"
            elif any(x in all_cat_str for x in ['chemical', 'petroleum', 'paint', 'oil', 'lubricant']) or any(w in display_name for w in ['كيماويات', 'دهانات', 'بترول', 'زيوت']):
                sector_ar = "كيماويات وبتروكيماويات ودهانات وزيوت"
            elif any(x in all_cat_str for x in ['textile', 'clothing', 'apparel', 'fabric']) or any(w in display_name for w in ['غزل', 'نسيج', 'ملابس', 'أقمشة']):
                sector_ar = "غزل ونسيج وملابس جاهزة"
            elif any(x in all_cat_str for x in ['steel', 'metal', 'iron', 'aluminum']) or any(w in display_name for w in ['حديد', 'صلب', 'معادن', 'الومنيوم', 'صاج']):
                sector_ar = "حديد وصلب وألومنيوم وتشكيل معادن"
            elif any(x in all_cat_str for x in ['concrete', 'cement', 'quarry', 'stone', 'marble', 'ceramic', 'glass']) or any(w in display_name for w in ['خرسانة', 'أسمنت', 'رخام', 'جرانيت', 'سيراميك', 'زجاج']):
                sector_ar = "مواد بناء ورخام وسيراميك وخرسانة جاهزة"
            elif any(x in all_cat_str for x in ['transport', 'logistics', 'freight', 'warehouse', 'storage', 'depot']) or any(w in display_name for w in ['نقل', 'شحن', 'مستودع', 'مخازن', 'لوجستيك']):
                sector_ar = "نقل بري ولوجستيات وتخزين وأساطيل"
            elif any(x in all_cat_str for x in ['paper', 'packaging', 'cardboard', 'carton']) or any(w in display_name for w in ['كرتون', 'ورق', 'تغليف', 'تعبئة']):
                sector_ar = "تعبئة وتغليف وكرتون وطباعة"
            elif any(x in all_cat_str for x in ['pharmaceutical', 'medical']) or any(w in display_name for w in ['أدوية', 'مستحضرات', 'مستلزمات طبية']):
                sector_ar = "أدوية ومستحضرات تجميل ومستلزمات طبية"
            elif any(x in all_cat_str for x in ['automotive', 'vehicle', 'truck', 'bus']) or any(w in display_name for w in ['سيارات', 'شاحنات', 'أتوبيس', 'مقطورات']):
                sector_ar = "صناعات سيارات وشاحنات ومركبات تجارية"
            elif any(x in all_cat_str for x in ['electric', 'cable', 'electronics']) or any(w in display_name for w in ['كابلات', 'كهرباء', 'الكترونيات']):
                sector_ar = "صناعات كهربائية وكابلات والكترونيات"

            raw_records.append({
                "اسم المصنع / المنشأة": display_name,
                "الاسم بالإنجليزية": primary_name if primary_name != display_name else name_en,
                "القطاع الصناعي": sector_ar,
                "المنطقة الفرعية / المجمع الصناعي": micro_zone,
                "المحافظة": "الجيزة",
                "التصنيف التقني Overture": primary_cat,
                "العنوان التفصيلي": address_str or micro_zone,
                "رقم التليفون": phone or "—",
                "الموقع الإلكتروني": website or "—",
                "رابط Google Maps المباشر": maps_url,
                "خط العرض (Latitude)": round(lat, 6) if lat else None,
                "خط الطول (Longitude)": round(lon, 6) if lon else None,
                "المعرف الفرعي (Overture ID)": pydict['id'][i]
            })
            area_matches += 1

    print(f"Area complete: Scanned {scanned_area} entities -> Found {area_matches} B2B Industrial entities")

print(f"\n==================================================================")
print(f"Total Places Scanned across All Grids: {total_scanned_overall}")
print(f"Total B2B Industrial Entities Extracted: {len(raw_records)}")

df = pd.DataFrame(raw_records)
# Self deduplication
df.drop_duplicates(subset=["اسم المصنع / المنشأة"], inplace=True)
print(f"Total Unique Factories after Harvest Deduplication: {len(df)}")

# Cross-Matching Against Current 25,482 CRM Database
print("\n--- Cross-Auditing against Current Live CRM (25,482 Companies) ---")
node_cmd = """
const fs = require('fs');
global.window = {};
eval(fs.readFileSync('crm/js/egypt_verified_titans.js', 'utf8'));
eval(fs.readFileSync('crm/js/egypt_enterprises_pool.js', 'utf8'));
const pool = window.__EGYPT_ENTERPRISE_POOL || [];
const titans = window.__EGYPT_VERIFIED_TITANS || [];
const all = [...titans, ...pool];
fs.writeFileSync('scraper/output/crm_baseline_subset.json', JSON.stringify(all.map(c => ({
    id: c.id,
    nameAr: c.nameAr || c.name || '',
    nameEn: c.nameEn || '',
    phone: c.phone1 || c.mobile || c.phone2 || '',
    city: c.city || '',
    sector: c.sector || '',
    lat: c.latitude || c.lat || '',
    lon: c.longitude || c.lon || '',
    maps: c.google_maps_url || ''
}))));
"""
subprocess.run(['node', '-e', node_cmd], check=True)

with open('scraper/output/crm_baseline_subset.json', 'r', encoding='utf-8') as f:
    crm_records = json.load(f)

print(f"Loaded CRM records: {len(crm_records)}")

def normalize_arabic(text):
    if not text or not isinstance(text, str):
        return ""
    s = text.lower().strip()
    s = re.sub(r'[أإآٱ]', 'ا', s)
    s = re.sub(r'ة', 'ه', s)
    s = re.sub(r'ى', 'ي', s)
    s = re.sub(r'[ؤئ]', 'ء', s)
    s = re.sub(r'[\u064B-\u065F\u0670]', '', s)
    s = re.sub(r'(ش\.م\.م|ذ\.م\.م|م\.م|شمم|ذمم|مساهمه مصريه|ذات مسئوليه محدوده|شخص واحد)', '', s)
    s = re.sub(r'[^a-z0-9\u0600-\u06FF]', '', s)
    s = re.sub(r'^(شركه|مصنع|مؤسسه|مجموعه|توكيل|مكتب|معرض)', '', s)
    return s.strip()

def normalize_phone(p):
    if not p: return ""
    digits = re.sub(r'[^0-9]', '', str(p))
    if digits.startswith('20'): digits = '0' + digits[2:]
    return digits[-10:] if len(digits) >= 10 else digits

phone_map = {}
norm_name_map = {}

for comp in crm_records:
    p = normalize_phone(comp['phone'])
    if p and len(p) >= 7:
        phone_map[p] = comp
    norm_name = normalize_arabic(comp['nameAr'])
    if norm_name and len(norm_name) >= 4:
        norm_name_map[norm_name] = comp

matched_count = 0
new_unique_count = 0
status_list = []
matched_crm_names = []

for idx, row in df.iterrows():
    name = str(row['اسم المصنع / المنشأة']).strip()
    phone = normalize_phone(row['رقم التليفون'])
    norm_name = normalize_arabic(name)

    matched_crm = None
    if phone and phone in phone_map:
        matched_crm = phone_map[phone]
    elif norm_name and norm_name in norm_name_map:
        matched_crm = norm_name_map[norm_name]

    if matched_crm:
        matched_count += 1
        status_list.append("موجود بالفعل بالسيستم (تحديث/إثراء إحداثيات)")
        matched_crm_names.append(matched_crm['nameAr'])
    else:
        new_unique_count += 1
        status_list.append("مصنع جديد تماماً (حصري)")
        matched_crm_names.append("—")

df['حالة المطابقة مع CRM'] = status_list
df['الاسم المطابق في السيستم'] = matched_crm_names

cols = [
    "اسم المصنع / المنشأة",
    "الاسم بالإنجليزية",
    "القطاع الصناعي",
    "المنطقة الفرعية / المجمع الصناعي",
    "حالة المطابقة مع CRM",
    "الاسم المطابق في السيستم",
    "رقم التليفون",
    "الموقع الإلكتروني",
    "العنوان التفصيلي",
    "رابط Google Maps المباشر",
    "خط العرض (Latitude)",
    "خط الطول (Longitude)",
    "التصنيف التقني Overture",
    "المعرف الفرعي (Overture ID)"
]
df = df[cols]

# Save Outputs
os.makedirs("scraper/output", exist_ok=True)
xlsx_path = "scraper/output/october_aburawash_grid_factories.xlsx"
csv_path = "scraper/output/october_aburawash_grid_factories.csv"

df.to_excel(xlsx_path, index=False, engine='openpyxl')
df.to_csv(csv_path, index=False, encoding='utf-8-sig')

print(f"\n==================== HARVESTING AUDIT REPORT ====================")
print(f"Total Unique Factories Harvested: {len(df)}")
print(f"-> Existing In CRM (Data Enrichment): {matched_count}")
print(f"-> Brand New Factories (New Unique B2B Leads): {new_unique_count}")
print(f"Files saved successfully:")
print(f"  [XLSX]: {xlsx_path} ({os.path.getsize(xlsx_path) / 1024:.1f} KB)")
print(f"  [CSV]:  {csv_path} ({os.path.getsize(csv_path) / 1024:.1f} KB)")
print("=================================================================")
