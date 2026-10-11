import sys, json

sys.stdout.reconfigure(encoding='utf-8')

worker_path = 'crm/js/companies-worker.js'
with open(worker_path, 'r', encoding='utf-8') as f:
    content = f.read()

from test_gov_counts_complete import GOVERNORATES, city_to_gov, gov_ar_to_key

city_to_gov_js = json.dumps(city_to_gov, ensure_ascii=False, indent=4)
gov_ar_to_key_js = json.dumps(gov_ar_to_key, ensure_ascii=False, indent=4)

top_decls = f"""let _cityToGov = {city_to_gov_js};
let _govArToKey = {gov_ar_to_key_js};
let _govBuckets = new Map();"""

old_top = "let _titanIndices = [];"
new_top = f"let _titanIndices = [];\n{top_decls}"

assert old_top in content, "old_top not found!"
content = content.replace(old_top, new_top, 1)

# In rebuildBuckets:
old_rebuild_clear = """    _sectorBuckets.clear();
    _cityBuckets.clear();
    _priorityBuckets.clear();
    _assignedBuckets.clear();
    _titanIndices = [];"""

new_rebuild_clear = """    _sectorBuckets.clear();
    _cityBuckets.clear();
    _govBuckets.clear();
    _priorityBuckets.clear();
    _assignedBuckets.clear();
    _titanIndices = [];"""

assert old_rebuild_clear in content, "old_rebuild_clear not found!"
content = content.replace(old_rebuild_clear, new_rebuild_clear, 1)

old_rebuild_loop_part = """        const city = c.city || 'other';
        let cityArr = _cityBuckets.get(city);
        if (!cityArr) { cityArr = []; _cityBuckets.set(city, cityArr); }
        cityArr.push(idx);"""

new_rebuild_loop_part = """        const city = c.city || 'other';
        let cityArr = _cityBuckets.get(city);
        if (!cityArr) { cityArr = []; _cityBuckets.set(city, cityArr); }
        cityArr.push(idx);

        const gov = c.governorate || '';
        const govKey = _cityToGov[city] || _govArToKey[gov] || '';
        if (gov) {
            let arr = _govBuckets.get(gov);
            if (!arr) { arr = []; _govBuckets.set(gov, arr); }
            arr.push(idx);
        }
        if (govKey && govKey !== gov) {
            let arr = _govBuckets.get(govKey);
            if (!arr) { arr = []; _govBuckets.set(govKey, arr); }
            arr.push(idx);
        }"""

assert old_rebuild_loop_part in content, "old_rebuild_loop_part not found!"
content = content.replace(old_rebuild_loop_part, new_rebuild_loop_part, 1)

# In INIT_INDEX:
old_init_indexed = """                sector: c.sector || 'other',
                city: c.city || 'other',
                priority: c.priority || 'B',"""

new_init_indexed = """                sector: c.sector || 'other',
                city: c.city || 'other',
                governorate: c.governorate || '',
                priority: c.priority || 'B',"""

assert content.count(old_init_indexed) == 2, f"Expected 2 occurrences of old_init_indexed, found {content.count(old_init_indexed)}"
content = content.replace(old_init_indexed, new_init_indexed)

# In FILTER_AND_SEARCH:
old_search_payload = """            search = '',
            sector = '',
            sectors = [],
            city = '',
            cities = [],"""

new_search_payload = """            search = '',
            sector = '',
            sectors = [],
            governorate = '',
            governorates = [],
            city = '',
            cities = [],"""

assert old_search_payload in content, "old_search_payload not found!"
content = content.replace(old_search_payload, new_search_payload, 1)

old_lists_prep = """        // Multi-city normalization
        let cityList = Array.isArray(cities) ? cities.filter(Boolean) : [];
        if (city && !cityList.includes(city)) cityList.push(city);
        const citySet = cityList.length > 0 ? new Set(cityList) : null;"""

new_lists_prep = """        // Multi-governorate normalization
        let govList = Array.isArray(governorates) ? governorates.filter(Boolean) : [];
        if (governorate && !govList.includes(governorate)) govList.push(governorate);
        const govSet = govList.length > 0 ? new Set(govList) : null;

        // Multi-city normalization
        let cityList = Array.isArray(cities) ? cities.filter(Boolean) : [];
        if (city && !cityList.includes(city)) cityList.push(city);
        const citySet = cityList.length > 0 ? new Set(cityList) : null;"""

assert old_lists_prep in content, "old_lists_prep not found!"
content = content.replace(old_lists_prep, new_lists_prep, 1)

# In the filter loop:
old_filter_loop_checks = """            if (sectorSet && !sectorSet.has(c.sector)) continue;
            if (citySet && !citySet.has(c.city)) continue;"""

new_filter_loop_checks = """            if (sectorSet && !sectorSet.has(c.sector)) continue;
            if (govSet) {
                const cGov = c.governorate || '';
                const cGovKey = _cityToGov[c.city] || _govArToKey[cGov] || '';
                if (!govSet.has(cGov) && !govSet.has(cGovKey)) continue;
            }
            if (citySet && !citySet.has(c.city)) continue;"""

assert old_filter_loop_checks in content, "old_filter_loop_checks not found!"
content = content.replace(old_filter_loop_checks, new_filter_loop_checks, 1)

with open(worker_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully patched crm/js/companies-worker.js!")
