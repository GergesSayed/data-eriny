import sys, json

sys.stdout.reconfigure(encoding='utf-8')
comps = json.load(open('crm/data/companies.json', encoding='utf-8'))

from test_gov_counts_complete import GOVERNORATES, city_to_gov

fixed_count = 0
for c in comps:
    city = c.get('city')
    if city and city in city_to_gov:
        proper_gov_ar = GOVERNORATES[city_to_gov[city]]['ar']
        if c.get('governorate') != proper_gov_ar:
            c['governorate'] = proper_gov_ar
            fixed_count += 1

print(f"Total companies: {len(comps)}")
print(f"Aligned governorate for {fixed_count} companies.")

with open('crm/data/companies.json', 'w', encoding='utf-8') as f:
    json.dump(comps, f, ensure_ascii=False, indent=2)

print("Saved crm/data/companies.json successfully!")
