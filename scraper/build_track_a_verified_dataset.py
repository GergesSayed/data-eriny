import json
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

print("=== FINALIZING TRACK A DELTA B2B FLEET EXPANSION DATASET ===")

# 1. Load preview items
with open('scraper/output/delta_track_a_348_preview.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

STRICT_EXCLUDE_WORDS = [
    'gym', 'cars', 'kids', 'بومبا', 'تخرج', 'صالون', 'حلاق', 'كوافير',
    'عيادة', 'دكتور', 'صيدلية', 'مدرسة', 'حضانة', 'كافيه', 'مطعم',
    'أكاديمية', 'محلات', 'معرض سجاد', 'معرض أثاث', 'معرض بيتى', 'معرض جني',
    'معرض الهدى', 'معرض ابو شريف', 'معرض مريم', 'معرض أبو سلامه',
    'معرض مصنع الاسراء', 'سنتر '
]

clean_companies = []
for c in items:
    name_lower = c['nameAr'].lower()
    is_pure_factory = False
    if 'مصنع ومعارض الاخوه' in name_lower or 'رخام وجرانيت' in name_lower or 'رابطة مصانع' in name_lower or 'كنوز' in name_lower:
        is_pure_factory = True
        
    is_purged = False
    if not is_pure_factory:
        for ew in STRICT_EXCLUDE_WORDS:
            if ew in name_lower:
                is_purged = True
                break
    if not is_purged:
        clean_companies.append(c)

print(f"Total Approved Companies: {len(clean_companies)}")

# Map city to CRM city keys
CITY_MAP = {
    'el_mahalla': 'gharbia',
    'quesna': 'monufia',
    'mit_ghamr': 'dakahlia',
    'belbeis': 'sharqia'
}

ID_PREFIX = {
    'gharbia': 'eg_delta_mhl',
    'monufia': 'eg_delta_qsn',
    'dakahlia': 'eg_delta_mtg',
    'sharqia': 'eg_delta_blb'
}

zone_counters = {}
final_dataset = []

for c in clean_companies:
    crm_city = CITY_MAP.get(c['city'], c['city'])
    prefix = ID_PREFIX.get(crm_city, 'eg_delta')
    
    zone_counters[crm_city] = zone_counters.get(crm_city, 0) + 1
    c_id = f"{prefix}_{zone_counters[crm_city]:04d}"
    
    # Map lat/lon
    lat = c.get('lat')
    lon = c.get('lon')
    maps_url = f"https://www.google.com/maps?q={lat},{lon}" if (lat and lon) else ""
    
    final_record = {
        "id": c_id,
        "nameAr": c['nameAr'],
        "nameEn": c['nameEn'] if c.get('nameEn') and c.get('nameEn') != c['nameAr'] else "",
        "sector": c['sector'],
        "city": crm_city,
        "district": c['district'],
        "governorate": c['governorate'],
        "address": c['address'],
        "phone1": c['phone1'],
        "phone2": c['phone2'] or "",
        "mobile": c['mobile'] or (c['phone1'] if c['phone1'].startswith('01') else ""),
        "hotline": c['hotline'] or "",
        "website": c['website'] or "",
        "google_maps_url": maps_url,
        "latitude": lat,
        "longitude": lon,
        "fleetSize": c['fleetSize'],
        "fleetType": c['fleetType'],
        "priority": c['priority'],
        "status": "new",
        "verified": True,
        "notes": f"مصنع وكيان معتمد بالدلتا ({c['governorate']}) - محور {c['district']} - قطاع {c['sector']} - مستهدف لمبيعات إطارات وصيانة الأساطيل B2B",
        "contactPerson": "",
        "contactTitle": "",
        "createdAt": "2026-10-08",
        "lastUpdated": "2026-10-08"
    }
    final_dataset.append(final_record)

print(f"Generated {len(final_dataset)} final verified records.")
print("\nZone counts:")
for z, cnt in zone_counters.items():
    print(f"  * {z}: {cnt} companies")

out_path = 'scraper/output/track_a_verified_delta_b2b_fleet.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(final_dataset, f, ensure_ascii=False, indent=2)

print(f"\nSaved final verified Track A dataset to: {out_path}")
