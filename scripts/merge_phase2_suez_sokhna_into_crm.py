# -*- coding: utf-8 -*-
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== MERGING PHASE 2 - SQUARE 3 (SUEZ, AIN SOKHNA SCZONE, ATAQA & ADABIYA) INTO CRM ===")

# 1. Load Phase 2 Square 3 verified companies
suez_sokhna = json.load(open('scraper/output/phase2_suez_sokhna_verified_b2b_fleet.json', encoding='utf-8'))
print(f"Loaded {len(suez_sokhna)} Suez & Sokhna verified enterprises.")

# 2. Load existing pool & companies
pool_json_path = 'crm/data/egypt_enterprises_pool.json'
pool = json.load(open(pool_json_path, encoding='utf-8'))
print(f"Current pool companies: {len(pool)}")

companies_json_path = 'crm/data/companies.json'
companies = json.load(open(companies_json_path, encoding='utf-8'))
print(f"Current total companies: {len(companies)}")

# Safety check for duplicates
pool_ids = set(c['id'] for c in pool)
for c in suez_sokhna:
    if c['id'] in pool_ids:
        raise ValueError(f"Duplicate ID found: {c['id']}")

# Append to pool
new_pool = pool + suez_sokhna
print(f"New pool total: {len(new_pool)} (expected: 19225)")

# Append to companies
new_companies = companies + suez_sokhna
print(f"New companies total: {len(new_companies)} (expected: 20225)")

assert len(new_pool) == 19225, f"Expected 19225 pool, got {len(new_pool)}"
assert len(new_companies) == 20225, f"Expected 20225 companies, got {len(new_companies)}"

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

print(f"\n=== PHASE 2 SQUARE 3 MERGE COMPLETE: EXACTLY {len(new_companies)} TOTAL REAL COMPANIES DEPLOYED ===")
