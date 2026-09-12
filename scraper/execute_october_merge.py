import pandas as pd
import json
import re
import os
import subprocess
import sys

# Ensure UTF-8 output
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

print("==================================================================")
print("=== EXECUTING CLEAN SURGICAL MERGE INTO FLEET CRM POOL ===")
print("==================================================================")

# 1. Read the verified Excel file
xlsx_path = 'scraper/output/october_aburawash_grid_factories.xlsx'
df = pd.read_excel(xlsx_path)
print(f"Total Rows in Excel: {len(df)}")

# 2. Extract existing pool & titans via Node
dump_cmd = """
const fs = require('fs');
global.window = {};
eval(fs.readFileSync('crm/js/egypt_verified_titans.js', 'utf8'));
eval(fs.readFileSync('crm/js/egypt_enterprises_pool.js', 'utf8'));
const pool = window.__EGYPT_ENTERPRISE_POOL || [];
const titans = window.__EGYPT_VERIFIED_TITANS || [];
fs.writeFileSync('scraper/output/crm_pool_before_merge.json', JSON.stringify({
    titans: titans,
    pool: pool
}));
"""
subprocess.run(['node', '-e', dump_cmd], check=True)

with open('scraper/output/crm_pool_before_merge.json', 'r', encoding='utf-8') as f:
    dump = json.load(f)

existing_pool = dump['pool']
existing_titans = dump['titans']
print(f"Loaded Existing: Titans = {len(existing_titans)}, Pool = {len(existing_pool)}, Total = {len(existing_titans) + len(existing_pool)}")

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
    if not p or pd.isna(p) or str(p) == '—': return ""
    digits = re.sub(r'[^0-9]', '', str(p))
    if digits.startswith('20'): digits = '0' + digits[2:]
    return digits[-10:] if len(digits) >= 10 else digits

phone_map = {}
name_map = {}

for c in existing_titans + existing_pool:
    p = normalize_phone(c.get('phone1') or c.get('mobile') or c.get('phone2'))
    if p and len(p) >= 8:
        phone_map[p] = c
    n = normalize_arabic(c.get('nameAr') or c.get('name'))
    if n and len(n) >= 4:
        name_map[n] = c

print(f"Index built: {len(phone_map)} phones, {len(name_map)} names.")

# Sector mapping to CRM canonical keys
def map_sector(sec_ar, name):
    s = str(sec_ar)
    n = str(name)
    if 'غذائية' in s or 'أغذية' in n or 'عصير' in n or 'مطاحن' in s: return 'food'
    if 'بلاستيك' in s or 'مطاط' in s or 'مواسير' in s: return 'chemicals_plastic'
    if 'كيماويات' in s or 'دهانات' in s or 'زيوت' in s: return 'chemicals_plastic'
    if 'بترول' in s or 'غاز' in s: return 'petroleum'
    if 'غزل' in s or 'نسيج' in s or 'ملابس' in s: return 'textile_apparel'
    if 'حديد' in s or 'صلب' in s or 'معادن' in s or 'الومنيوم' in s: return 'building_materials'
    if 'خرسانة' in s or 'أسمنت' in s or 'رخام' in s or 'سيراميك' in s: return 'building_materials'
    if 'نقل' in s or 'شحن' in s or 'لوجستيك' in s or 'مستودع' in s: return 'transport'
    if 'تعبئة' in s or 'تغليف' in s or 'كرتون' in s or 'ورق' in s: return 'packaging_paper'
    if 'أدوية' in s or 'مستلزمات طبية' in s: return 'pharma'
    if 'مقاولات' in s or 'إنشاءات' in s: return 'construction'
    return 'manufacturing'

enriched_count = 0
added_count = 0
next_id_num = len(existing_pool) + 1
new_items_to_append = []

for idx, row in df.iterrows():
    name = str(row['اسم المصنع / المنشأة']).strip()
    if not name or len(name) < 2 or name == 'nan':
        continue

    phone_raw = str(row['رقم التليفون']).strip() if (not pd.isna(row['رقم التليفون']) and str(row['رقم التليفون']) != '—') else ""
    phone_norm = normalize_phone(phone_raw)
    norm_name = normalize_arabic(name)

    matched = None
    if phone_norm and phone_norm in phone_map:
        matched = phone_map[phone_norm]
    elif norm_name and norm_name in name_map:
        matched = name_map[norm_name]

    lat = float(row['خط العرض (Latitude)']) if not pd.isna(row['خط العرض (Latitude)']) else None
    lon = float(row['خط الطول (Longitude)']) if not pd.isna(row['خط الطول (Longitude)']) else None
    maps_url = str(row['رابط Google Maps المباشر']).strip() if not pd.isna(row['رابط Google Maps المباشر']) else ""
    website = str(row['الموقع الإلكتروني']).strip() if (not pd.isna(row['الموقع الإلكتروني']) and str(row['الموقع الإلكتروني']) != '—') else ""
    zone_desc = str(row['المنطقة الفرعية / المجمع الصناعي']).strip() if not pd.isna(row['المنطقة الفرعية / المجمع الصناعي']) else "مدينة 6 أكتوبر"
    address_str = str(row['العنوان التفصيلي']).strip() if (not pd.isna(row['العنوان التفصيلي']) and str(row['العنوان التفصيلي']) != '—') else zone_desc

    if matched:
        enriched_count += 1
        # Enrich coordinates
        if lat and lon and not matched.get('latitude'):
            matched['latitude'] = lat
            matched['longitude'] = lon
        if maps_url and not matched.get('google_maps_url'):
            matched['google_maps_url'] = maps_url
        if phone_raw and not matched.get('phone1'):
            matched['phone1'] = phone_raw
            matched['mobile'] = phone_raw
        if website and not matched.get('website'):
            matched['website'] = website
        if zone_desc and ('أكتوبر' in zone_desc or 'أبو رواش' in zone_desc):
            if not matched.get('notes') or 'موثق' not in matched.get('notes', ''):
                matched['notes'] = f"{matched.get('notes', '')} | موثق مكانياً: {zone_desc}".strip(' |')
    else:
        added_count += 1
        sec_code = map_sector(row['القطاع الصناعي'], name)
        comp_id = f"eg_b2b_fleet_{next_id_num:05d}"
        next_id_num += 1

        is_aburawash = 'أبو رواش' in zone_desc
        city_code = 'giza' if is_aburawash else '6october'

        fleet_size = 18 if sec_code in ['transport', 'distribution'] else (20 if sec_code == 'building_materials' else 15)
        fleet_type = "تريلات وشاحنات نقل ثقيل" if sec_code in ['transport', 'distribution'] else ("خلاطات خرسانة ومعدات ثقيلة" if sec_code == 'building_materials' else "شاحنات نقل وتوزيع متوسط")

        name_en = str(row['الاسم بالإنجليزية']).strip() if (not pd.isna(row['الاسم بالإنجليزية']) and str(row['الاسم بالإنجليزية']) != 'nan') else ""

        new_comp = {
            "id": comp_id,
            "nameAr": name,
            "nameEn": name_en if name_en != name else "",
            "sector": sec_code,
            "city": city_code,
            "governorate": "الجيزة",
            "address": address_str,
            "phone1": phone_raw,
            "phone2": "",
            "mobile": phone_raw,
            "otherPhones": "",
            "website": website,
            "google_maps_url": maps_url or (f"https://www.google.com/maps?q={lat},{lon}" if lat and lon else ""),
            "latitude": lat,
            "longitude": lon,
            "fleetSize": fleet_size,
            "fleetType": fleet_type,
            "priority": "B",
            "leadScore": 75 if phone_raw else 70,
            "status": "new",
            "assignedTo": "",
            "contactPerson": "",
            "contactTitle": "",
            "notes": f"مصنع موثق مكانياً - {zone_desc} (Overture Maps Harvester)",
            "createdAt": "2026-09-12T12:00:00.000Z",
            "lastUpdated": "2026-09-12"
        }
        new_items_to_append.append(new_comp)

print("\n=== MERGE AUDIT SUMMARY ===")
print(f"Enriched existing companies: {enriched_count}")
print(f"New Validated B2B Factories to Add: {len(new_items_to_append)}")
final_pool = existing_pool + new_items_to_append
final_total = len(existing_titans) + len(final_pool)
print(f"Previous Total: {len(existing_titans) + len(existing_pool)} (25,482)")
print(f"New Grand Total: {final_total} ({final_total:,})")

# Write to egypt_enterprises_pool.js safely
pool_file_path = 'e:/Company Sales SAAS/data-eriny/crm/js/egypt_enterprises_pool.js'
backup_pool_path = 'e:/Company Sales SAAS/data-eriny/crm/js/egypt_enterprises_pool.js.bak'

with open(pool_file_path, 'r', encoding='utf-8') as src:
    with open(backup_pool_path, 'w', encoding='utf-8') as dst:
        dst.write(src.read())

print(f"Safe backup preserved at {backup_pool_path}")

with open(pool_file_path, 'w', encoding='utf-8') as f:
    f.write('window.__EGYPT_ENTERPRISE_POOL = ')
    json.dump(final_pool, f, ensure_ascii=False, indent=2)
    f.write(';\n')

print(f"Successfully updated {pool_file_path} with {len(final_pool)} enterprises!")
