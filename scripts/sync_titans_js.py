import sys, json

sys.stdout.reconfigure(encoding='utf-8')
comps = json.load(open('crm/data/companies.json', encoding='utf-8'))
titans = [c for c in comps if str(c.get('id', '')).startswith('eg_titan_')]

assert len(titans) == 1000, f"Titans must be 1,000, got {len(titans)}"

with open('crm/data/egypt_verified_titans.json', 'w', encoding='utf-8') as f:
    json.dump(titans, f, ensure_ascii=False, indent=2)

titans_js = f"""// Fleet CRM — Verified VIP Industrial & Commercial Titans (Sanitized v335.0)
(function() {{
  var data = {json.dumps(titans, ensure_ascii=False)};
  if (typeof window !== 'undefined') {{
    window.EGYPT_VERIFIED_TITANS = data;
    window.__EGYPT_VERIFIED_TITANS = data;
  }}
  if (typeof module !== 'undefined' && module.exports) {{
    module.exports = data;
  }}
}})();
"""

with open('crm/js/egypt_verified_titans.js', 'w', encoding='utf-8') as f:
    f.write(titans_js)

print("Saved crm/data/egypt_verified_titans.json and crm/js/egypt_verified_titans.js successfully!")
