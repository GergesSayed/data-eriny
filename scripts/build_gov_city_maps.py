import sys, json

sys.stdout.reconfigure(encoding='utf-8')
comps = json.load(open('crm/data/companies.json', encoding='utf-8'))

gov_to_cities = {}
for c in comps:
    g = c.get('governorate', '').strip()
    ct = c.get('city', '').strip()
    if g and ct:
        if g not in gov_to_cities:
            gov_to_cities[g] = {}
        gov_to_cities[g][ct] = gov_to_cities[g].get(ct, 0) + 1

# Let's inspect all cities across all governorates
all_cities_in_db = set()
for g, c_dict in sorted(gov_to_cities.items()):
    all_cities_in_db.update(c_dict.keys())
    print(f"{g}: {sorted(c_dict.keys())}")

print(f"\nTotal unique cities in database: {len(all_cities_in_db)}")
