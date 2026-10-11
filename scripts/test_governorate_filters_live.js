/**
 * Comprehensive Automated Test for Governorate & City Filtering Architecture
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// 1. Mock minimal browser environment for storage.js
global.window = global;
global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
};

// Load companies data
const rawData = fs.readFileSync(path.join(__dirname, '../crm/data/companies.json'), 'utf-8');
const allCompanies = JSON.parse(rawData);

// Mock storage properties
const storageCode = fs.readFileSync(path.join(__dirname, '../crm/js/storage.js'), 'utf-8');
eval(storageCode);

// Inject dataset into AppStorage
AppStorage.companiesMemory = allCompanies;
AppStorage.getCompanies = () => allCompanies;
AppStorage.getScopedCompanies = () => allCompanies;
AppStorage.getCurrentUser = () => ({ id: 'usr_admin', role: 'admin' });
AppStorage.canViewAll = () => true;

console.log('========================================================');
console.log(' GOVERNORATE & CITY HIERARCHY COMPREHENSIVE QA TEST     ');
console.log('========================================================\n');

// TEST 1: Governorates & Cities definitions integrity
console.log('--- TEST 1: DEFINITIONS INTEGRITY ---');
const govs = AppStorage.GOVERNORATES;
const cities = AppStorage.CITIES;
assert.strictEqual(Object.keys(govs).length, 27, 'Exact 27 Egyptian Governorates defined');
console.log(`[PASS] Exact 27 Egyptian Governorates defined in AppStorage.GOVERNORATES`);

const uniqueCompsCities = new Set(allCompanies.map(c => c.city).filter(Boolean));
console.log(`Unique city slugs in database: ${uniqueCompsCities.size}`);
for (const ck of uniqueCompsCities) {
    assert(cities[ck], `City slug '${ck}' must exist in AppStorage.CITIES`);
    assert(cities[ck].ar, `City slug '${ck}' must have an Arabic title`);
}
console.log(`[PASS] 100% of ${uniqueCompsCities.size} cities in companies.json are fully defined with Arabic names in AppStorage.CITIES`);

// TEST 2: Every city in companies.json mapped to a governorate
console.log('\n--- TEST 2: CITY-TO-GOVERNORATE MAPPING ---');
AppStorage._initGovMaps();
for (const ck of uniqueCompsCities) {
    const gk = AppStorage._cityToGov[ck];
    assert(gk, `City '${ck}' must be mapped to a governorate in AppStorage.GOVERNORATES`);
    assert(govs[gk], `Governorate '${gk}' must exist`);
}
console.log(`[PASS] 100% of ${uniqueCompsCities.size} cities are mapped to their parent governorate`);

// TEST 3: Calculate Gov counts
console.log('\n--- TEST 3: GOVERNORATE COUNTS CALCULATION ---');
// Mock Companies.getSectorCityAndGovCounts
const govCounts = {};
for (const [gk] of Object.entries(govs)) govCounts[gk] = 0;

for (const c of allCompanies) {
    const gk = AppStorage.getGovKey(c);
    assert(gk, `Company ${c.id} must map to a governorate key`);
    govCounts[gk] = (govCounts[gk] || 0) + 1;
}

const totalGovCount = Object.values(govCounts).reduce((a, b) => a + b, 0);
console.log(`Total companies: ${allCompanies.length}`);
console.log(`Total counted by Governorates: ${totalGovCount}`);
assert.strictEqual(totalGovCount, 21225, 'Total governorate counts must equal exact 21,225');
console.log(`[PASS] Total governorate count is EXACTLY 21,225 (0 dropped companies!)`);

// Check each governorate count is > 0
for (const [gk, g] of Object.entries(govs)) {
    assert(govCounts[gk] > 0, `Governorate ${g.ar} (${gk}) must have > 0 companies`);
}
console.log(`[PASS] All 27 governorates have active companies (> 0)`);

// TEST 4: Query filtering by each governorate individually
console.log('\n--- TEST 4: FILTERING BY EVERY SINGLE GOVERNORATE (1 to 27) ---');
for (const [gk, g] of Object.entries(govs)) {
    const expectedCount = govCounts[gk];
    const res = AppStorage._queryCompaniesFallback({ governorates: [gk], pageSize: 30000 });
    assert.strictEqual(res.total, expectedCount, `Query for ${g.ar} (${gk}) must return exactly ${expectedCount}, got ${res.total}`);
    // Also test querying by Arabic name directly
    const resAr = AppStorage._queryCompaniesFallback({ governorates: [g.ar], pageSize: 30000 });
    assert.strictEqual(resAr.total, expectedCount, `Query by Arabic name for ${g.ar} must return exactly ${expectedCount}`);
    console.log(`  ✓ ${g.icon} ${g.ar.padEnd(16)} (${gk.padEnd(18)}): ${res.total.toLocaleString()} companies matched perfectly`);
}
console.log(`[PASS] All 27 governorates filter and return 100% exact counts!`);

// TEST 5: Multi-governorate filtering
console.log('\n--- TEST 5: MULTI-GOVERNORATE FILTERING ---');
const multiRes = AppStorage._queryCompaniesFallback({ governorates: ['gov_cairo', 'gov_giza'], pageSize: 30000 });
const expectedMulti = govCounts['gov_cairo'] + govCounts['gov_giza'];
assert.strictEqual(multiRes.total, expectedMulti, `Cairo + Giza must equal ${expectedMulti}, got ${multiRes.total}`);
console.log(`[PASS] Multi-select [Cairo + Giza]: ${multiRes.total.toLocaleString()} companies (expected ${expectedMulti.toLocaleString()})`);

// TEST 6: Governorate + City drilldown filtering
console.log('\n--- TEST 6: DRILLDOWN FILTERING (GOV + SPECIFIC CITY) ---');
const city10thRes = AppStorage._queryCompaniesFallback({ governorates: ['gov_sharqia'], cities: ['10th_ramadan'], pageSize: 30000 });
assert.strictEqual(city10thRes.total, 760, `10th of Ramadan must return 760 companies, got ${city10thRes.total}`);
console.log(`[PASS] Sharqia -> 10th of Ramadan: ${city10thRes.total.toLocaleString()} companies (expected 760)`);

const cityBelbeisRes = AppStorage._queryCompaniesFallback({ governorates: ['gov_sharqia'], cities: ['belbeis'], pageSize: 30000 });
assert.strictEqual(cityBelbeisRes.total, 1407, `Belbeis must return 1,407 companies, got ${cityBelbeisRes.total}`);
console.log(`[PASS] Sharqia -> Belbeis: ${cityBelbeisRes.total.toLocaleString()} companies (expected 1,407)`);

const cityOctRes = AppStorage._queryCompaniesFallback({ governorates: ['gov_giza'], cities: ['6october'], pageSize: 30000 });
assert.strictEqual(cityOctRes.total, 1527, `6th of October must return 1,527 companies, got ${cityOctRes.total}`);
console.log(`[PASS] Giza -> 6th of October: ${cityOctRes.total.toLocaleString()} companies (expected 1,527)`);

const cityTagamoaRes = AppStorage._queryCompaniesFallback({ governorates: ['gov_cairo'], cities: ['tagamoa'], pageSize: 30000 });
assert.strictEqual(cityTagamoaRes.total, 598, `Tagamoa must return 598 companies, got ${cityTagamoaRes.total}`);
console.log(`[PASS] Cairo -> Tagamoa: ${cityTagamoaRes.total.toLocaleString()} companies (expected 598)`);

console.log('\n========================================================');
console.log(' ALL 6 TEST GROUPS PASSED WITH 100% SUCCESS!           ');
console.log('========================================================');
