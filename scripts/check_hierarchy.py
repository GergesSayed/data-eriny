import sys, json
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')
comps = json.load(open('crm/data/companies.json', encoding='utf-8'))

from test_gov_counts_complete import GOVERNORATES, city_to_gov, gov_ar_to_key

city_counts = Counter(c['city'] for c in comps if c.get('city'))
gov_counts = Counter(c['governorate'] for c in comps if c.get('governorate'))

print(f"{'Governorate':<20} | {'Sum of Cities':<15} | {'Gov Field Total':<15} | {'Diff':<6}")
print("-" * 62)
total_diff = 0
for gk, g in GOVERNORATES.items():
    sum_cities = sum(city_counts[ck] for ck in g['cities'])
    gov_total = gov_counts[g['ar']]
    diff = sum_cities - gov_total
    total_diff += abs(diff)
    print(f"{g['ar']:<20} | {sum_cities:<15} | {gov_total:<15} | {diff:<6}")

print("-" * 62)
print(f"Total absolute difference: {total_diff}")
