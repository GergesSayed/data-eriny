import sys, json, os

sys.stdout.reconfigure(encoding='utf-8')

print("Starting merge of rental sector into transport...")

COMPANIES_PATH = 'crm/data/companies.json'
POOL_PATH = 'crm/data/egypt_enterprises_pool.json'
TITANS_PATH = 'crm/data/egypt_verified_titans.json'

with open(COMPANIES_PATH, 'r', encoding='utf-8') as f:
    comps = json.load(f)

print(f"Loaded {len(comps)} companies from {COMPANIES_PATH}")

c_converted = 0
for c in comps:
    if c.get('sector') == 'rental':
        c['sector'] = 'transport'
        c['lastUpdated'] = '2026-10-12'
        c_converted += 1

print(f"Converted {c_converted} companies from rental to transport in companies.json")

with open(COMPANIES_PATH, 'w', encoding='utf-8') as f:
    json.dump(comps, f, ensure_ascii=False, indent=2)

# Update pool
if os.path.exists(POOL_PATH):
    with open(POOL_PATH, 'r', encoding='utf-8') as f:
        pool = json.load(f)
    p_converted = 0
    for c in pool:
        if c.get('sector') == 'rental':
            c['sector'] = 'transport'
            c['lastUpdated'] = '2026-10-12'
            p_converted += 1
    with open(POOL_PATH, 'w', encoding='utf-8') as f:
        json.dump(pool, f, ensure_ascii=False, indent=2)
    print(f"Converted {p_converted} companies in egypt_enterprises_pool.json")

# Update titans
if os.path.exists(TITANS_PATH):
    with open(TITANS_PATH, 'r', encoding='utf-8') as f:
        titans = json.load(f)
    t_converted = 0
    for c in titans:
        if c.get('sector') == 'rental':
            c['sector'] = 'transport'
            c['lastUpdated'] = '2026-10-12'
            t_converted += 1
    with open(TITANS_PATH, 'w', encoding='utf-8') as f:
        json.dump(titans, f, ensure_ascii=False, indent=2)
    print(f"Converted {t_converted} companies in egypt_verified_titans.json")

print("Dataset merge completed successfully!")
