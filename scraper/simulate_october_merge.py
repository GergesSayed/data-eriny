import pandas as pd
import json
import re
import subprocess
import os

print("=== STARTING MERGE SIMULATION FOR 6TH OF OCTOBER & ABU RAWASH ===")

df = pd.read_excel('scraper/output/october_aburawash_grid_factories.xlsx')
print(f"Total Rows in Excel: {len(df)}")

# Load current CRM dataset
dump_cmd = """
const fs = require('fs');
global.window = {};
eval(fs.readFileSync('crm/js/egypt_verified_titans.js', 'utf8'));
eval(fs.readFileSync('crm/js/egypt_enterprises_pool.js', 'utf8'));
const pool = window.__EGYPT_ENTERPRISE_POOL || [];
const titans = window.__EGYPT_VERIFIED_TITANS || [];
fs.writeFileSync('scraper/output/crm_current_dump.json', JSON.stringify({
    titans: titans,
    pool: pool
}));
"""
subprocess.run(['node', '-e', dump_cmd], check=True)

with open('scraper/output/crm_current_dump.json', 'r', encoding='utf-8') as f:
    dump = json.load(f)

existing_pool = dump['pool']
existing_titans = dump['titans']
all_existing = existing_titans + existing_pool
print(f"Loaded Existing: Titans = {len(existing_titans)}, Pool = {len(existing_pool)}, Total = {len(all_existing)}")

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

for c in all_existing:
    p = normalize_phone(c.get('phone1') or c.get('mobile') or c.get('phone2'))
    if p and len(p) >= 8:
        phone_map[p] = c
    n = normalize_arabic(c.get('nameAr') or c.get('name'))
    if n and len(n) >= 4:
        name_map[n] = c

print(f"Indexed {len(phone_map)} phones and {len(name_map)} normalized names.")

enriched_count = 0
added_count = 0
skipped_count = 0

sample_enriched = []
sample_added = []

for idx, row in df.iterrows():
    name = str(row['اسم المصنع / المنشأة']).strip()
    if not name or len(name) < 2 or name == 'nan':
        skipped_count += 1
        continue

    phone_raw = str(row['رقم التليفون']).strip() if (not pd.isna(row['رقم التليفون']) and str(row['رقم التليفون']) != '—') else ""
    phone_norm = normalize_phone(phone_raw)
    norm_name = normalize_arabic(name)

    matched = None
    if phone_norm and phone_norm in phone_map:
        matched = phone_map[phone_norm]
    elif norm_name and norm_name in name_map:
        matched = name_map[norm_name]

    if matched:
        enriched_count += 1
        sample_enriched.append({
            "existing_id": matched['id'],
            "existing_name": matched.get('nameAr') or matched.get('name'),
            "harvested_name": name,
            "harvested_maps": row['رابط Google Maps المباشر']
        })
    else:
        added_count += 1
        if len(sample_added) < 5:
            sample_added.append({
                "name": name,
                "sector": row['القطاع الصناعي'],
                "zone": row['المنطقة الفرعية / المجمع الصناعي'],
                "phone": phone_raw,
                "maps": row['رابط Google Maps المباشر']
            })

print("\n=== SIMULATION RESULTS ===")
print(f"Total Harvested in Excel: {len(df)}")
print(f"Enriched Existing Companies: {enriched_count}")
print(f"Brand New Factories to Add:  {added_count}")
print(f"Skipped / Invalid:           {skipped_count}")
print(f"Current Total:               {len(all_existing)} (25,482)")
print(f"Expected Final Total:        {len(all_existing) + added_count} ({len(all_existing) + added_count:,})")

print("\nSample Enriched Companies:")
for item in sample_enriched[:5]:
    print(f"  - [{item['existing_id']}] {item['existing_name']} <= {item['harvested_name']}")

print("\nSample Added Factories:")
for item in sample_added:
    print(f"  + {item['name']} | {item['sector']} | {item['zone']} | {item['phone']}")
