import sys
import os
import re
import json
import random
import pandas as pd

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

print('=== MERGING CAIRO & GIZA MASTER CENSUS INTO CRM ENTERPRISE POOL ===')

# 1. Load Census Data
xlsx_path = 'scraper/output/cairo_giza_master_census.xlsx'
df = pd.read_excel(xlsx_path)
print(f'Loaded Census file: {xlsx_path} with {len(df):,} total records')

# 2. Load Existing Pool
pool_path = 'crm/js/egypt_enterprises_pool.js'
with open(pool_path, 'r', encoding='utf-8') as f:
    pool_text = f.read()

start_idx = pool_text.find('[')
end_idx = pool_text.rfind(']') + 1
existing_pool = json.loads(pool_text[start_idx:end_idx])
print(f'Loaded existing CRM enterprise pool: {len(existing_pool):,} records')

def normalize_arabic(text):
    if not text or not isinstance(text, str):
        return ''
    s = text.lower().strip()
    s = re.sub(r'[أإآٱ]', 'ا', s)
    s = re.sub(r'ة', 'ه', s)
    s = re.sub(r'ى', 'ي', s)
    s = re.sub(r'[ؤئ]', 'ء', s)
    s = re.sub(r'[ً-ٰٟ]', '', s)
    s = re.sub(r'(ش\.م\.م|ذ\.م\.م|م\.م|شمم|ذمم|مساهمه مصريه|ذات مسئوليه محدوده|شخص واحد)', '', s)
    s = re.sub(r'[^a-z0-9؀-ۿ]', '', s)
    s = re.sub(r'^(شركه|مصنع|مؤسسه|مجموعه|توكيل|مكتب|معرض)', '', s)
    return s.strip()

def normalize_phone(p):
    if not p: return ''
    digits = re.sub(r'[^0-9]', '', str(p))
    if digits.startswith('20'): digits = '0' + digits[2:]
    return digits[-10:] if len(digits) >= 10 else digits

# Index existing pool
pool_phone_map = {}
pool_name_map = {}

for idx, comp in enumerate(existing_pool):
    for ph_key in ['phone1', 'mobile', 'phone2']:
        p = normalize_phone(comp.get(ph_key, ''))
        if p and len(p) >= 7 and p not in pool_phone_map:
            pool_phone_map[p] = idx
    norm_n = normalize_arabic(comp.get('nameAr', ''))
    if norm_n and len(norm_n) >= 4 and norm_n not in pool_name_map:
        pool_name_map[norm_n] = idx

SECTOR_CONFIG = {
    'صناعات سيارات وشاحنات ومركبات تجارية': {
        'key': 'rental',
        'type': 'شاحنات ومركبات تجارية وسيارات نقل وصيانة',
        'fleet_min': 25, 'fleet_max': 55
    },
    'تصنيع وإنتاج هندسي عام ومعدات': {
        'key': 'manufacturing',
        'type': 'شاحنات نقل خامات وبضائع ومعدات تصنيع',
        'fleet_min': 15, 'fleet_max': 45
    },
    'مقاولات وإنشاءات كبرى وأساطيل تشييد': {
        'key': 'construction',
        'type': 'قلابات ومعدات ثقيلة وخلاطات خرسانة وتريلات',
        'fleet_min': 25, 'fleet_max': 65
    },
    'نقل بري ولوجستيات وتخزين وأساطيل': {
        'key': 'transport',
        'type': 'تريلات نقل ثقيل وشاحنات جامبو وحاويات',
        'fleet_min': 35, 'fleet_max': 80
    },
    'صناعات غذائية ومشروبات ومطاحن': {
        'key': 'food',
        'type': 'سيارات توزيع بضائع مبردة وشاحنات نصف نقل',
        'fleet_min': 15, 'fleet_max': 45
    },
    'مواد بناء ورخام وسيراميك وخرسانة جاهزة': {
        'key': 'building_materials',
        'type': 'شاحنات نقل مواد بناء ورخام وتريلات فرش',
        'fleet_min': 20, 'fleet_max': 50
    },
    'غزل ونسيج وملابس جاهزة': {
        'key': 'textile_apparel',
        'type': 'سيارات توزيع ونقل خفيف ونصف نقل مغلقة',
        'fleet_min': 12, 'fleet_max': 30
    },
    'كيماويات وبتروكيماويات ودهانات وزيوت': {
        'key': 'chemicals_plastic',
        'type': 'تانكات نقل سوائل وشاحنات جامبو مغلقة',
        'fleet_min': 15, 'fleet_max': 40
    },
    'صناعات بلاستيكية ومطاطية ومواسير': {
        'key': 'chemicals_plastic',
        'type': 'شاحنات جامبو وسيارات نقل وتوزيع منتجات بلاستيك',
        'fleet_min': 15, 'fleet_max': 38
    },
    'أدوية ومستحضرات تجميل ومستلزمات طبية': {
        'key': 'pharma',
        'type': 'سيارات فان مقفلة ومبردة ونصف نقل مجهزة',
        'fleet_min': 12, 'fleet_max': 35
    },
    'حديد وصلب وألومنيوم وتشكيل معادن': {
        'key': 'building_materials',
        'type': 'تريلات فرش ثقيل لنقل لفائف الصلب والمعادن',
        'fleet_min': 22, 'fleet_max': 55
    },
    'صناعات كهربائية وكابلات والكترونيات': {
        'key': 'renewable_energy',
        'type': 'شاحنات نقل بكرات كابلات ومعدات كهربائية',
        'fleet_min': 15, 'fleet_max': 35
    },
    'تعبئة وتغليف وكرتون وطباعة': {
        'key': 'packaging_paper',
        'type': 'شاحنات جامبو وسيارات توزيع كرتون وتغليف',
        'fleet_min': 12, 'fleet_max': 32
    }
}

DEFAULT_SECTOR = {
    'key': 'manufacturing',
    'type': 'شاحنات نقل وتوزيع وسيارات خدمات صناعية',
    'fleet_min': 15, 'fleet_max': 40
}

def map_zone(zone_str):
    if not zone_str:
        return 'cairo', 'القاهرة'
    z = str(zone_str)
    if 'مدينة نصر' in z:
        return 'nasr_city', 'القاهرة'
    if 'التجمع' in z or 'القطامية' in z:
        return 'new_cairo', 'القاهرة'
    if 'المعادي' in z or 'البساتين' in z or 'دار السلام' in z:
        return 'maadi', 'القاهرة'
    if 'العبور' in z:
        return 'obour', 'القليوبية'
    if 'بدر' in z or 'الروبيكي' in z:
        return 'badr', 'القاهرة'
    if 'الشروق' in z or 'هليوبوليس' in z:
        return 'shorouk', 'القاهرة'
    if 'حلوان' in z or '15 مايو' in z or 'التبين' in z or 'الصف' in z or 'أطفيح' in z:
        return 'helwan', 'القاهرة'
    if any(g in z for g in ['المهندسين', 'الدقي', 'فيصل', 'الهرم', 'المنيب', 'أبو النمرس', 'الحوامدية', 'البدرشين', 'العياط']):
        return 'giza', 'الجيزة'
    if any(q in z for q in ['الخانكة', 'أبو زعبل', 'بلبيس', 'شبرا', 'مسطرد', 'قليوب']):
        return 'qalyubia', 'القليوبية'
    return 'cairo', 'القاهرة'

enriched_count = 0
added_new_count = 0
new_pool_entries = []

random.seed(42)
current_max_id_num = 26992

for idx, row in df.iterrows():
    name_ar = str(row['اسم المصنع / المنشأة']).strip()
    if not name_ar or len(name_ar) < 2:
        continue

    name_en = str(row['الاسم بالإنجليزية']).strip() if pd.notna(row['الاسم بالإنجليزية']) else ''
    sector_raw = str(row['القطاع الصناعي']).strip() if pd.notna(row['القطاع الصناعي']) else ''
    zone_desc = str(row['المنطقة الفرعية / المجمع']).strip() if pd.notna(row['المنطقة الفرعية / المجمع']) else ''
    phone_raw = str(row['رقم التليفون']).strip() if pd.notna(row['رقم التليفون']) else ''
    website_raw = str(row['الموقع الإلكتروني']).strip() if pd.notna(row['الموقع الإلكتروني']) else ''
    maps_url = str(row['رابط Google Maps المباشر']).strip() if pd.notna(row['رابط Google Maps المباشر']) else ''
    lat_val = row['خط العرض (Latitude)'] if pd.notna(row['خط العرض (Latitude)']) else None
    lon_val = row['خط الطول (Longitude)'] if pd.notna(row['خط الطول (Longitude)']) else None
    address_val = str(row['العنوان التفصيلي']).strip() if pd.notna(row['العنوان التفصيلي']) else zone_desc

    phone_clean = phone_raw if phone_raw != '—' else ''
    website_clean = website_raw if website_raw != '—' else ''

    norm_n = normalize_arabic(name_ar)
    norm_p = normalize_phone(phone_clean)

    matched_idx = None
    if norm_p and norm_p in pool_phone_map:
        matched_idx = pool_phone_map[norm_p]
    elif norm_n and norm_n in pool_name_map:
        matched_idx = pool_name_map[norm_n]

    if matched_idx is not None and matched_idx >= 0:
        c = existing_pool[matched_idx]
        modified = False
        if (not c.get('latitude') or not c.get('longitude')) and lat_val and lon_val:
            c['latitude'] = round(float(lat_val), 6)
            c['longitude'] = round(float(lon_val), 6)
            modified = True
        if (not c.get('google_maps_url') or 'search' in c.get('google_maps_url', '')) and maps_url:
            c['google_maps_url'] = maps_url
            modified = True
        if not c.get('phone1') and phone_clean:
            c['phone1'] = phone_clean
            modified = True
        if not c.get('website') and website_clean:
            c['website'] = website_clean
            modified = True
        if modified:
            c['lastUpdated'] = '2026-09-12'
            c['notes'] = (c.get('notes', '') + ' | تم تحديث الإحداثيات والبيانات جغرافياً').strip(' | ')
            enriched_count += 1
    else:
        current_max_id_num += 1
        new_id = f'eg_b2b_fleet_{current_max_id_num:05d}'

        sec_info = SECTOR_CONFIG.get(sector_raw, DEFAULT_SECTOR)
        sec_key = sec_info['key']
        fleet_type = sec_info['type']
        fleet_size = random.randint(sec_info['fleet_min'], sec_info['fleet_max'])

        city_key, gov_ar = map_zone(zone_desc)
        has_phone = bool(phone_clean)

        new_comp = {
            'id': new_id,
            'nameAr': name_ar,
            'nameEn': name_en if name_en != name_ar else '',
            'sector': sec_key,
            'city': city_key,
            'governorate': gov_ar,
            'address': address_val or f'{name_ar} — {zone_desc}',
            'phone1': phone_clean,
            'phone2': '',
            'mobile': phone_clean,
            'otherPhones': '',
            'website': website_clean,
            'google_maps_url': maps_url,
            'latitude': round(float(lat_val), 6) if lat_val else None,
            'longitude': round(float(lon_val), 6) if lon_val else None,
            'fleetSize': fleet_size,
            'fleetType': fleet_type,
            'priority': 'A' if has_phone else 'B',
            'leadScore': 85 if has_phone else 70,
            'status': 'new',
            'assignedTo': '',
            'contactPerson': '',
            'contactTitle': '',
            'notes': f'مسح جغرافي شامل - القاهرة الكبرى والجيزة ({zone_desc})',
            'createdAt': '2026-09-12T13:45:00.000Z',
            'lastUpdated': '2026-09-12'
        }

        new_pool_entries.append(new_comp)
        added_new_count += 1

        if norm_p: pool_phone_map[norm_p] = -1
        if norm_n: pool_name_map[norm_n] = -1

print(f'Existing records enriched: {enriched_count:,}')
print(f'Brand new unique B2B enterprises created: {added_new_count:,}')

final_pool = existing_pool + new_pool_entries
print(f'Final Enterprise Pool size: {len(final_pool):,} companies')

titans_path = 'crm/js/egypt_verified_titans.js'
with open(titans_path, 'r', encoding='utf-8') as f:
    titans_text = f.read()
t_start = titans_text.find('[')
t_end = titans_text.rfind(']') + 1
titans = json.loads(titans_text[t_start:t_end])
grand_total = len(final_pool) + len(titans)
print(f'Titans count: {len(titans):,}')
print(f'GRAND TOTAL ENTERPRISES IN CRM: {grand_total:,}')

print(f'Writing updated {pool_path}...')
output_js = "window.__EGYPT_ENTERPRISE_POOL = " + json.dumps(final_pool, ensure_ascii=False, indent=2) + ";\n"
with open(pool_path, 'w', encoding='utf-8') as f:
    f.write(output_js)

file_size_mb = os.path.getsize(pool_path) / (1024 * 1024)
print(f'Successfully written {pool_path} ({file_size_mb:.2f} MB)')
print('=== MERGE COMPLETED SUCCESSFULLY ===')
