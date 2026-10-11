import sys, json

sys.stdout.reconfigure(encoding='utf-8')
comps = json.load(open('crm/data/companies.json', encoding='utf-8'))

pool = [c for c in comps if not str(c.get('id', '')).startswith('eg_titan_')]
titans = [c for c in comps if str(c.get('id', '')).startswith('eg_titan_')]

print(f"Total companies: {len(comps)}")
print(f"Pool size: {len(pool)}")
print(f"Titans size: {len(titans)}")

assert len(pool) == 20225, f"Pool must be 20,225, got {len(pool)}"
assert len(titans) == 1000, f"Titans must be 1,000, got {len(titans)}"

# Update crm/data/egypt_enterprises_pool.json
with open('crm/data/egypt_enterprises_pool.json', 'w', encoding='utf-8') as f:
    json.dump(pool, f, ensure_ascii=False, indent=2)

# Update crm/js/egypt_enterprises_pool.js
pool_js = f"// Total Real Verified Enterprises in this pool: {len(pool)} (plus 1,000 VIP Titans = {len(comps)} Total)\nwindow.EGYPT_ENTERPRISES_POOL = " + json.dumps(pool, ensure_ascii=False) + ";\n"
with open('crm/js/egypt_enterprises_pool.js', 'w', encoding='utf-8') as f:
    f.write(pool_js)

print("Saved crm/data/egypt_enterprises_pool.json and crm/js/egypt_enterprises_pool.js successfully!")
