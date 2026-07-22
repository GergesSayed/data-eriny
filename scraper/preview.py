import json

with open('output/browser_scrape_20260704_1414.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total: {len(data)} companies")
with_phone = len([c for c in data if c.get('phone1')])
print(f"With phone: {with_phone}")
print()
print("=== Sample Companies ===")
for c in data[:20]:
    name = c.get('nameAr', c.get('nameEn', ''))
    phone = c.get('phone1', 'N/A')
    city = c.get('city', '')
    print(f"  {name[:50]:50s} | {phone:15s} | {city}")
