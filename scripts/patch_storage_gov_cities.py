import sys, json

sys.stdout.reconfigure(encoding='utf-8')

storage_path = 'crm/js/storage.js'
with open(storage_path, 'r', encoding='utf-8') as f:
    content = f.read()

from test_complete_cities_dict import ALL_CITIES
from test_gov_counts_complete import GOVERNORATES

cities_js = json.dumps(ALL_CITIES, ensure_ascii=False, indent=8)
govs_js = json.dumps(GOVERNORATES, ensure_ascii=False, indent=8)

new_section = f"""    // ---- City & Governorate Definitions (Egypt Comprehensive - 27 Governorates & 106 Cities) ----
    CITIES: {cities_js},

    // ---- Governorate → Cities Hierarchy (Complete & Mathematically Aligned) ----
    GOVERNORATES: {govs_js},

    _cityToGov: null,
    _govArToKey: null,

    _initGovMaps() {{
        if (this._cityToGov && this._govArToKey) return;
        this._cityToGov = {{}};
        this._govArToKey = {{}};
        for (const [gk, g] of Object.entries(this.GOVERNORATES || {{}})) {{
            if (g.ar) this._govArToKey[g.ar] = gk;
            for (const ck of (g.cities || [])) {{
                this._cityToGov[ck] = gk;
            }}
        }}
    }},

    getGovKey(companyOrCityOrGov) {{
        this._initGovMaps();
        if (!companyOrCityOrGov) return '';
        if (typeof companyOrCityOrGov === 'string') {{
            return this._cityToGov[companyOrCityOrGov] || this._govArToKey[companyOrCityOrGov] || '';
        }}
        return (companyOrCityOrGov.city && this._cityToGov[companyOrCityOrGov.city]) ||
               (companyOrCityOrGov.governorate && this._govArToKey[companyOrCityOrGov.governorate]) || '';
    }},"""

# Locate old CITIES start and FLEET_TYPES start
start_marker = "    // ---- City & Governorate Definitions (Egypt Comprehensive) ----\n    CITIES: {"
end_marker = "    FLEET_TYPES: {"

start_pos = content.find(start_marker)
end_pos = content.find(end_marker)

assert start_pos != -1, f"start_marker not found!"
assert end_pos != -1, f"end_marker not found!"

content = content[:start_pos] + new_section + "\n\n    " + content[end_pos:]

# Now update queryCompanies
old_query_destruct = """                sector = '',
                sectors = [],
                city = '',
                cities = [],"""

new_query_destruct = """                sector = '',
                sectors = [],
                governorate = '',
                governorates = [],
                city = '',
                cities = [],"""

assert content.count(old_query_destruct) >= 1, "old_query_destruct not found!"
content = content.replace(old_query_destruct, new_query_destruct, 1)

old_worker_payload = """                            sector,
                            sectors,
                            city,
                            cities,"""

new_worker_payload = """                            sector,
                            sectors,
                            governorate,
                            governorates,
                            city,
                            cities,"""

assert content.count(old_worker_payload) >= 1, "old_worker_payload not found!"
content = content.replace(old_worker_payload, new_worker_payload, 1)

# Now update _queryCompaniesFallback
old_fallback_destruct = """            sector = '',
            sectors = [],
            city = '',
            cities = [],"""

new_fallback_destruct = """            sector = '',
            sectors = [],
            governorate = '',
            governorates = [],
            city = '',
            cities = [],"""

assert content.count(old_fallback_destruct) >= 1, "old_fallback_destruct not found!"
content = content.replace(old_fallback_destruct, new_fallback_destruct, 1)

old_fallback_filter_prep = """        let cityList = Array.isArray(cities) ? cities.filter(Boolean) : [];
        if (city && !cityList.includes(city)) cityList.push(city);
        const citySet = cityList.length > 0 ? new Set(cityList) : null;"""

new_fallback_filter_prep = """        let govList = Array.isArray(governorates) ? governorates.filter(Boolean) : [];
        if (governorate && !govList.includes(governorate)) govList.push(governorate);
        const govSet = govList.length > 0 ? new Set(govList) : null;

        let cityList = Array.isArray(cities) ? cities.filter(Boolean) : [];
        if (city && !cityList.includes(city)) cityList.push(city);
        const citySet = cityList.length > 0 ? new Set(cityList) : null;

        this._initGovMaps();"""

assert content.count(old_fallback_filter_prep) >= 1, "old_fallback_filter_prep not found!"
content = content.replace(old_fallback_filter_prep, new_fallback_filter_prep, 1)

old_filter_check = """            if (sectorSet && !sectorSet.has(c.sector)) return false;
            if (citySet && !citySet.has(c.city)) return false;"""

new_filter_check = """            if (sectorSet && !sectorSet.has(c.sector)) return false;
            if (govSet) {
                const cGov = c.governorate || '';
                const cGovKey = (this._cityToGov && this._cityToGov[c.city]) || (this._govArToKey && this._govArToKey[cGov]);
                if (!govSet.has(cGov) && !govSet.has(cGovKey)) return false;
            }
            if (citySet && !citySet.has(c.city)) return false;"""

assert content.count(old_filter_check) >= 1, "old_filter_check not found!"
content = content.replace(old_filter_check, new_filter_check, 1)

with open(storage_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully patched crm/js/storage.js!")
