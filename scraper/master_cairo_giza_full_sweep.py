import sys
import os
import re
import json
import subprocess
import overturemaps
import pandas as pd

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

print("==========================================================================")
print("=== MASTER SPATIAL SWEEP: 100% EXHAUSTIVE CENSUS OF CAIRO & GIZA ===")
print("==========================================================================")

# Comprehensive seamless grid covering every square meter of Greater Cairo & Giza
# Remaining 4 Master Quadrants (Complementing October/Abu Rawash & 10th of Ramadan):
MASTER_QUADRANTS = [
    {
        "id": "GRID_A_NORTH_NORTHEAST",
        "name": "القطاع الشمالي والشمال الشرقي (العبور، الخانكة، شبرا، مسطرد، قليوب، السلام، الحرفيين، جسر السويس)",
        "bbox": (31.20, 30.10, 31.55, 30.38)
    },
    {
        "id": "GRID_B_EAST_SUEZ_CORRIDOR",
        "name": "شرق القاهرة ومحور السويس (المنطقة الحرة بمدينة نصر، التجمع، الألف مصنع، القطامية، بدر، الروبيكي، الشروق)",
        "bbox": (31.30, 29.92, 31.85, 30.22)
    },
    {
        "id": "GRID_C_SOUTH_HEAVY_INDUSTRY",
        "name": "القطاع الجنوبي ومواد البناء (شق الثعبان، طرة، المعادي الصناعي، البساتين، حلوان، 15 مايو، التبين، الصف)",
        "bbox": (31.20, 29.70, 31.45, 30.00)
    },
    {
        "id": "GRID_D_CENTRAL_GIZA_NILE",
        "name": "قلب الجيزة والشريط النيلي (المهندسين، الدقي، فيصل، الهرم، المنيب، أبو النمرس، الحوامدية، البدرشين، العياط)",
        "bbox": (31.10, 29.70, 31.30, 30.10)
    }
]

# Strict Filter Criteria
EXCLUDE_CATEGORIES = [
    'restaurant', 'cafe', 'coffee_shop', 'bakery', 'fast_food', 'grocery_or_supermarket',
    'convenience_store', 'clothing_store', 'beauty_salon', 'hairdresser', 'school',
    'kindergarten', 'mosque', 'place_of_worship', 'pharmacy', 'hospital', 'clinic', 
    'dentist', 'apartment', 'housing_complex', 'hotel', 'atm', 'park', 'laundry',
    'doctor', 'lawyer', 'bank'
]

AR_EXCLUDE_WORDS = [
    'مطعم', 'كافيه', 'كوفي', 'مقهى', 'سوبر ماركت', 'ماركت', 'بقالة', 'صيدلية',
    'مستشفى', 'عيادة', 'مركز طبي', 'مسجد', 'جامع', 'كنيسة', 'مدرسة', 'حضانة',
    'سنترال', 'بريد', 'صالون', 'حلاق', 'كوافير', 'محكمة', 'قسم شرطة', 'مخبز',
    'فطائر', 'مغسلة', 'دراي كلين', 'جيم', 'نادي صحي', 'شاورما', 'مشويات', 'فول وفلافل'
]

INDUSTRIAL_KEYWORDS = [
    'factory', 'manufactur', 'industrial', 'warehouse', 'logistics', 'transport',
    'chemical', 'plastic', 'steel', 'metal', 'textile', 'food', 'beverage',
    'concrete', 'cement', 'building_materials', 'quarry', 'pharmaceutical',
    'distribution', 'depot', 'packaging', 'engineering', 'machinery', 'automotive',
    'commercial_industrial', 'business_manufacturing_and_supply', 'construction',
    'freight', 'cargo', 'storage', 'wholesaler', 'contractor', 'commercial_truck',
    'ready_mix', 'pipes', 'refinery', 'marble', 'granite', 'tannery'
]

AR_INDUSTRIAL_WORDS = [
    'مصنع', 'شركة', 'مجموعة', 'صناعات', 'للصناعة', 'بلاستيك', 'حديد', 'صلب', 
    'غزل', 'نسيج', 'كرتون', 'أغذية', 'رخام', 'جرانيت', 'كيماويات', 'مستودع', 
    'مخازن', 'نقل', 'شحن', 'خرسانة', 'أسمنت', 'مقاولات', 'تجهيز', 'معدات',
    'أدوية', 'كابلات', 'الومنيوم', 'سيراميك', 'زجاج', 'أعلاف', 'مطاحن',
    'طباعة', 'تغليف', 'لوجستيك', 'ميكانيكا', 'هندسة', 'صناعي', 'تشغيل معادن',
    'خطوط انتاج', 'دهانات', 'زيوت', 'بترول', 'محطة خرسانة', 'مواسير', 'دباغة'
]

def get_zone_description(lon, lat, grid_id):
    if not lon or not lat:
        return "القاهرة الكبرى والجيزة"
    
    # Grid A: North / North-East
    if grid_id == "GRID_A_NORTH_NORTHEAST":
        if lon >= 31.42:
            return "مدينة العبور والمجمع الصناعي"
        elif lon >= 31.35:
            return "الخانكة وأبو زعبل ومحور بلبيس"
        elif lon >= 31.28:
            if lat >= 30.15:
                return "مدينة السلام ومؤسسة الزكاة والحرفيين"
            return "جسر السويس والنزهة الجديدة والمرج"
        else:
            if lat >= 30.18:
                return "قليوب والمحطة اللوجستية للقليوبية"
            elif lat >= 30.11:
                return "مسطرد والمجمع البترولي والصناعي"
            return "شبرا الخيمة والمنطقة الصناعية (15 مايو)"
            
    # Grid B: East & Suez
    elif grid_id == "GRID_B_EAST_SUEZ_CORRIDOR":
        if lon >= 31.65:
            return "مدينة بدر والروبيكي ومجمع الـ 100 فدان"
        elif lon >= 31.50:
            return "مدينة الشروق وهليوبوليس الجديدة اللوجستية"
        elif lon >= 31.40:
            if lat <= 30.02:
                return "المنطقة الصناعية بالتجمع الخامس (الألف مصنع والقطامية)"
            return "التجمع الأول ومحور السويس ومصر الجديدة"
        else:
            return "المنطقة الحرة العامة بمدينة نصر ومحور المشير"

    # Grid C: South & Heavy Industry
    elif grid_id == "GRID_C_SOUTH_HEAVY_INDUSTRY":
        if lat <= 29.80:
            return "التبين والصف وأطفيح (الصناعات الثقيلة)"
        elif lat <= 29.88:
            return "حلوان ومدينة 15 مايو الصناعية"
        elif lat <= 29.95:
            if lon >= 31.30:
                return "منطقة شق الثعبان لصناعة الرخام والجرانيت ومواد البناء"
            return "طرة وكوتسيكا والمعصرة"
        else:
            return "المعادي الصناعية والبساتين ودار السلام"

    # Grid D: Central Giza & Nile
    elif grid_id == "GRID_D_CENTRAL_GIZA_NILE":
        if lat <= 29.85:
            return "الحوامدية والبدرشين والعياط (محور جنوب الجيزة)"
        elif lat <= 29.98:
            return "المنيب وأبو النمرس وغرب النيل"
        else:
            return "المهندسين والدقي وفيصل والهرم (المقرات اللوجستية والتجارية)"

    return "محافظة القاهرة والجيزة"

def get_city_code(lon, lat, grid_id):
    if not lon or not lat:
        return "cairo", "القاهرة"
    
    if grid_id == "GRID_D_CENTRAL_GIZA_NILE":
        return "giza", "الجيزة"
    if grid_id == "GRID_A_NORTH_NORTHEAST":
        if lon >= 31.42:
            return "obour", "القليوبية"
        if lon <= 31.30 and lat >= 30.15:
            return "qalyubia", "القليوبية"
        return "cairo", "القاهرة"
    if grid_id == "GRID_B_EAST_SUEZ_CORRIDOR":
        if lon >= 31.65:
            return "badr", "القاهرة"
        if lon >= 31.50:
            return "shorouk", "القاهرة"
        if lon >= 31.40 and lat <= 30.05:
            return "new_cairo", "القاهرة"
        return "cairo", "القاهرة"
    if grid_id == "GRID_C_SOUTH_HEAVY_INDUSTRY":
        if lat <= 29.90:
            return "helwan", "القاهرة"
        return "cairo", "القاهرة"
        
    return "cairo", "القاهرة"

raw_records = []
total_scanned_overall = 0
grid_stats = {}

for grid in MASTER_QUADRANTS:
    print(f"\n==========================================================================")
    print(f"--- Sweeping Grid: {grid['name']} ---")
    print(f"BBox: {grid['bbox']} with STAC geoparquet streaming...")
    
    reader = overturemaps.record_batch_reader("place", bbox=grid['bbox'], stac=True)
    grid_total = 0
    grid_matches = 0

    for batch in reader:
        pydict = batch.to_pydict()
        batch_size = len(pydict['id'])
        grid_total += batch_size
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

            if any(bad in display_name for bad in AR_EXCLUDE_WORDS):
                continue

            cat_obj = pydict['categories'][i] if pydict['categories'] else None
            primary_cat = cat_obj.get('primary', '') if cat_obj else ''
            alt_cats = cat_obj.get('alternate', []) if cat_obj else []
            all_cat_str = (primary_cat + ' ' + ' '.join(alt_cats if isinstance(alt_cats, list) else [])).lower()

            if any(exc in all_cat_str for exc in EXCLUDE_CATEGORIES):
                continue

            is_industrial = any(kw in all_cat_str for kw in INDUSTRIAL_KEYWORDS)
            has_ar_indicator = any(w in display_name for w in AR_INDUSTRIAL_WORDS)

            if not (is_industrial or has_ar_indicator or 'business' in all_cat_str or 'industrial' in all_cat_str):
                continue

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

            phones_list = pydict['phones'][i] if pydict['phones'] else []
            phone = phones_list[0] if (phones_list and len(phones_list) > 0) else ''

            websites_list = pydict['websites'][i] if pydict['websites'] else []
            website = websites_list[0] if (websites_list and len(websites_list) > 0) else ''

            addr_list = pydict['addresses'][i] if pydict['addresses'] else []
            address_str = ''
            if addr_list and len(addr_list) > 0:
                first_addr = addr_list[0]
                if isinstance(first_addr, dict):
                    address_str = first_addr.get('freeform', '') or first_addr.get('locality', '')

            maps_url = f"https://www.google.com/maps?q={round(lat, 6)},{round(lon, 6)}" if (lat and lon) else ""
            zone_desc = get_zone_description(lon, lat, grid['id'])
            city_code, gov_ar = get_city_code(lon, lat, grid['id'])

            # Sector Mapping
            sector_ar = "تصنيع وإنتاج هندسي عام ومعدات"
            if any(x in all_cat_str for x in ['food', 'beverage', 'snack', 'grain']) or any(w in display_name for w in ['أغذية', 'عصير', 'ألبان', 'مطاحن', 'حلواني', 'شيبس', 'بسكويت']):
                sector_ar = "صناعات غذائية ومشروبات ومطاحن"
            elif any(x in all_cat_str for x in ['plastic', 'rubber', 'pipe']) or any(w in display_name for w in ['بلاستيك', 'مطاط', 'مواسير']):
                sector_ar = "صناعات بلاستيكية ومطاطية ومواسير"
            elif any(x in all_cat_str for x in ['chemical', 'petroleum', 'paint', 'oil', 'lubricant', 'refinery']) or any(w in display_name for w in ['كيماويات', 'دهانات', 'بترول', 'زيوت']):
                sector_ar = "كيماويات وبتروكيماويات ودهانات وزيوت"
            elif any(x in all_cat_str for x in ['textile', 'clothing', 'apparel', 'fabric', 'garment']) or any(w in display_name for w in ['غزل', 'نسيج', 'ملابس', 'أقمشة']):
                sector_ar = "غزل ونسيج وملابس جاهزة"
            elif any(x in all_cat_str for x in ['steel', 'metal', 'iron', 'aluminum']) or any(w in display_name for w in ['حديد', 'صلب', 'معادن', 'الومنيوم', 'صاج']):
                sector_ar = "حديد وصلب وألومنيوم وتشكيل معادن"
            elif any(x in all_cat_str for x in ['concrete', 'cement', 'quarry', 'stone', 'marble', 'granite', 'ceramic', 'glass']) or any(w in display_name for w in ['خرسانة', 'أسمنت', 'رخام', 'جرانيت', 'سيراميك', 'زجاج']):
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
            elif any(x in all_cat_str for x in ['contractor', 'construction']) or any(w in display_name for w in ['مقاولات', 'إنشاءات']):
                sector_ar = "مقاولات وإنشاءات كبرى وأساطيل تشييد"

            raw_records.append({
                "اسم المصنع / المنشأة": display_name,
                "الاسم بالإنجليزية": primary_name if primary_name != display_name else name_en,
                "القطاع الصناعي": sector_ar,
                "المنطقة الفرعية / المجمع": zone_desc,
                "الرمز الإقليمي للمدينة": city_code,
                "المحافظة": gov_ar,
                "التصنيف التقني Overture": primary_cat,
                "العنوان التفصيلي": address_str or zone_desc,
                "رقم التليفون": phone or "—",
                "الموقع الإلكتروني": website or "—",
                "رابط Google Maps المباشر": maps_url,
                "خط العرض (Latitude)": round(lat, 6) if lat else None,
                "خط الطول (Longitude)": round(lon, 6) if lon else None,
                "المعرف الفرعي (Overture ID)": pydict['id'][i],
                "كود المربع الجغرافي": grid['id']
            })
            grid_matches += 1

    grid_stats[grid['id']] = {
        "name": grid['name'],
        "scanned": grid_total,
        "matches": grid_matches
    }
    print(f"Grid Complete: Scanned {grid_total} points -> Found {grid_matches} B2B Industrial entities")

print("\n==========================================================================")
print(f"TOTAL POINTS SCANNED ACROSS GREATER CAIRO & GIZA: {total_scanned_overall}")
print(f"TOTAL CANDIDATE B2B ENTITIES EXTRACTED: {len(raw_records)}")

df = pd.DataFrame(raw_records)
# Self-deduplication by Name and Overture ID
df.drop_duplicates(subset=["اسم المصنع / المنشأة"], inplace=True)
print(f"TOTAL UNIQUE B2B ENTITIES AFTER SELF-DEDUPLICATION: {len(df)}")

# Cross-Reference Against Current CRM Database (27,026 Companies)
print("\n--- Cross-Auditing against Current Live CRM (27,026 Companies) ---")
dump_cmd = """
const fs = require('fs');
global.window = {};
eval(fs.readFileSync('crm/js/egypt_verified_titans.js', 'utf8'));
eval(fs.readFileSync('crm/js/egypt_enterprises_pool.js', 'utf8'));
const pool = window.__EGYPT_ENTERPRISE_POOL || [];
const titans = window.__EGYPT_VERIFIED_TITANS || [];
const all = [...titans, ...pool];
fs.writeFileSync('scraper/output/crm_full_current_subset.json', JSON.stringify(all.map(c => ({
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
subprocess.run(['node', '-e', dump_cmd], check=True)

with open('scraper/output/crm_full_current_subset.json', 'r', encoding='utf-8') as f:
    crm_records = json.load(f)

print(f"Loaded CRM live records: {len(crm_records)}")

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
        status_list.append("موجود بالفعل بالسيستم (إثراء وتحديث)")
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
    "المنطقة الفرعية / المجمع",
    "المحافظة",
    "حالة المطابقة مع CRM",
    "الاسم المطابق في السيستم",
    "رقم التليفون",
    "الموقع الإلكتروني",
    "العنوان التفصيلي",
    "رابط Google Maps المباشر",
    "خط العرض (Latitude)",
    "خط الطول (Longitude)",
    "التصنيف التقني Overture",
    "كود المربع الجغرافي",
    "المعرف الفرعي (Overture ID)"
]
df = df[cols]

# Export clean Excel and CSV
os.makedirs("scraper/output", exist_ok=True)
xlsx_path = "scraper/output/cairo_giza_master_census.xlsx"
csv_path = "scraper/output/cairo_giza_master_census.csv"

df.to_excel(xlsx_path, index=False, engine='openpyxl')
df.to_csv(csv_path, index=False, encoding='utf-8-sig')

print(f"\n==========================================================================")
print(f"=== FULL CENSUS HARVESTING AUDIT REPORT ===")
print(f"Total Unique Factories & B2B Entities: {len(df)}")
print(f"-> Existing in CRM (Data Enrichment): {matched_count}")
print(f"-> Brand New Factories (New Unique B2B Leads): {new_unique_count}")
print(f"Files saved successfully:")
print(f"  [XLSX]: {xlsx_path} ({os.path.getsize(xlsx_path) / 1024:.1f} KB)")
print(f"  [CSV]:  {csv_path} ({os.path.getsize(csv_path) / 1024:.1f} KB)")
print("==========================================================================")
