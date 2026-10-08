import overturemaps
import sys
import json
import re

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

print("=== SPATIAL HARVESTER: TRACK A - DELTA INDUSTRIAL & AGRO HUBS ===")

ZONES = [
    {
        "id": "MAHALLA_TEXTILE_AGRO",
        "name": "المحلة الكبرى - قلاع الغزل والنسيج والصناعات الغذائية والمطاحن",
        "city": "el_mahalla",
        "district": "المحلة الكبرى",
        "governorate": "الغربية",
        "gov_code": "040",
        "bbox": (31.10, 30.92, 31.25, 31.05)
    },
    {
        "id": "QUESNA_INDUSTRIAL_ZONE",
        "name": "المنطقة الصناعية بقويسنا - مجمع الأجهزة والهندسة والكيماويات والكرتون",
        "city": "quesna",
        "district": "المنطقة الصناعية بقويسنا",
        "governorate": "المنوفية",
        "gov_code": "048",
        "bbox": (31.10, 30.50, 31.22, 30.63)
    },
    {
        "id": "MIT_GHAMR_AGA_ALUMINUM_AGRO",
        "name": "محور ميت غمر وأجا - قلاع الألومنيوم ومحطات الفرز والتصدير الزراعي والغذائي",
        "city": "mit_ghamr",
        "district": "ميت غمر وأجا",
        "governorate": "الدقهلية",
        "gov_code": "050",
        "bbox": (31.20, 30.70, 31.35, 30.95)
    },
    {
        "id": "BELBEIS_FEED_POULTRY_LOGISTICS",
        "name": "محور بلبيس وأبو حماد - مصانع الأعلاف ومجازر الدواجن والشاحنات اللوجستية ومواد البناء",
        "city": "belbeis",
        "district": "بلبيس وأبو حماد",
        "governorate": "الشرقية",
        "gov_code": "055",
        "bbox": (31.50, 30.36, 31.75, 30.60)
    }
]

harvested_raw = []

for zone in ZONES:
    print(f"\nHarvesting raw records from: {zone['name']} ({zone['id']})...")
    try:
        reader = overturemaps.record_batch_reader('place', bbox=zone['bbox'], stac=True)
        count = 0
        for batch in reader:
            pydict = batch.to_pydict()
            b_len = len(pydict['id'])
            for i in range(b_len):
                count += 1
                name_obj = pydict['names'][i] if pydict['names'] else {}
                primary_name = name_obj.get('primary', '') if isinstance(name_obj, dict) else ''
                common = name_obj.get('common', {}) if isinstance(name_obj, dict) else {}
                name_ar = common.get('ar', '') if isinstance(common, dict) else ''
                name_en = common.get('en', '') if isinstance(common, dict) else ''
                
                tax_obj = pydict['taxonomy'][i] or {}
                hierarchy = tax_obj.get('hierarchy', []) if isinstance(tax_obj, dict) else []
                primary_tax = tax_obj.get('primary', '') if isinstance(tax_obj, dict) else ''
                basic_cat = pydict['basic_category'][i] or ''
                
                bbox_item = pydict['bbox'][i] or {}
                lon = (bbox_item.get('xmin', 0) + bbox_item.get('xmax', 0)) / 2 if bbox_item else None
                lat = (bbox_item.get('ymin', 0) + bbox_item.get('ymax', 0)) / 2 if bbox_item else None
                
                phones = pydict['phones'][i] or []
                websites = pydict['websites'][i] or []
                emails = pydict['emails'][i] or []
                addresses = pydict['addresses'][i] or []
                addr_str = addresses[0].get('freeform', '') if (addresses and isinstance(addresses[0], dict)) else ''
                
                harvested_raw.append({
                    "raw_id": pydict['id'][i],
                    "zone_id": zone["id"],
                    "city": zone["city"],
                    "district": zone["district"],
                    "governorate": zone["governorate"],
                    "gov_code": zone["gov_code"],
                    "primary_name": primary_name,
                    "name_ar": name_ar,
                    "name_en": name_en,
                    "primary_taxonomy": primary_tax,
                    "hierarchy": hierarchy,
                    "basic_category": basic_cat,
                    "phones": phones,
                    "websites": websites,
                    "emails": emails,
                    "address": addr_str,
                    "lat": round(lat, 6) if lat else None,
                    "lon": round(lon, 6) if lon else None
                })
        print(f"Zone {zone['id']} complete: {count} raw places collected.")
    except Exception as e:
        print(f"Error in {zone['id']}: {e}")

print(f"\nTotal raw places collected across Track A: {len(harvested_raw)}")

output_file = 'scraper/output/delta_track_a_raw.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(harvested_raw, f, ensure_ascii=False, indent=2)

print(f"Saved raw harvest to {output_file}")
