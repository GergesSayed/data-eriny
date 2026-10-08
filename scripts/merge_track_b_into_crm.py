import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== MERGING TRACK B DATASET INTO PRODUCTION CRM DATABASE ===")

# 1. Load Track B verified companies
track_b = json.load(open('scraper/output/track_b_verified_b2b_fleet.json', encoding='utf-8'))
print(f"Loaded {len(track_b)} Track B verified enterprises.")

# 2. Load existing pool & companies
pool_json_path = 'crm/data/egypt_enterprises_pool.json'
pool = json.load(open(pool_json_path, encoding='utf-8'))
print(f"Current pool companies: {len(pool)}")

companies_json_path = 'crm/data/companies.json'
companies = json.load(open(companies_json_path, encoding='utf-8'))
print(f"Current total companies: {len(companies)}")

# Safety check for duplicates
pool_ids = set(c['id'] for c in pool)
for c in track_b:
    if c['id'] in pool_ids:
        raise ValueError(f"Duplicate ID found: {c['id']}")

# Append to pool
new_pool = pool + track_b
print(f"New pool total: {len(new_pool)} (expected: 18686)")

# Append to companies
new_companies = companies + track_b
print(f"New companies total: {len(new_companies)} (expected: 19686)")

assert len(new_pool) == 18686, f"Expected 18686 pool, got {len(new_pool)}"
assert len(new_companies) == 19686, f"Expected 19686 companies, got {len(new_companies)}"

# 3. Write crm/data/egypt_enterprises_pool.json
with open(pool_json_path, 'w', encoding='utf-8') as f:
    json.dump(new_pool, f, ensure_ascii=False, indent=2)
print(f"Saved {pool_json_path} successfully ({len(new_pool)} items).")

# 4. Write crm/data/companies.json
with open(companies_json_path, 'w', encoding='utf-8') as f:
    json.dump(new_companies, f, ensure_ascii=False, indent=2)
print(f"Saved {companies_json_path} successfully ({len(new_companies)} items).")

# 5. Write crm/js/egypt_enterprises_pool.js
pool_js_path = 'crm/js/egypt_enterprises_pool.js'
js_content = f"// Total Real Verified Enterprises in this pool: {len(new_pool)} (plus 1,000 VIP Titans = {len(new_companies)} Total)\nwindow.EGYPT_ENTERPRISES_POOL = " + json.dumps(new_pool, ensure_ascii=False) + ";\n"
with open(pool_js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)
print(f"Saved {pool_js_path} successfully ({len(new_pool)} items).")

print("\n=== MERGE SUCCESSFUL: 19,686 TOTAL COMPANIES DEPLOYED ===")
