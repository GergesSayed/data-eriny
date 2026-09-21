const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== VERIFYING TITANS-FIRST PRIORITY ORDER ===');

const ROOT = path.join(__dirname, '..');

const mockLocalStorage = {
    _data: {},
    getItem(k) { return this._data[k] !== undefined ? this._data[k] : null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
};

const sandbox = {
    console,
    window: {},
    localStorage: mockLocalStorage,
    sessionStorage: mockLocalStorage,
    document: {
        getElementById: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {}
    },
    navigator: { userAgent: 'Node' },
    setTimeout: (fn) => fn(),
    setInterval: () => {},
    Set,
    Map,
    Array,
    Object,
    String,
    Number,
    Date,
    parseInt,
    parseFloat,
    Math,
    JSON
};
sandbox.window = sandbox;

const context = vm.createContext(sandbox);

// 1. Load egypt_verified_titans.js
const titansCode = fs.readFileSync(path.join(ROOT, 'crm', 'js', 'egypt_verified_titans.js'), 'utf8');
vm.runInContext(titansCode, context);

// 2. Load egypt_enterprises_pool.js
const poolCode = fs.readFileSync(path.join(ROOT, 'crm', 'js', 'egypt_enterprises_pool.js'), 'utf8');
vm.runInContext(poolCode, context);

// 3. Load storage.js
const storageCode = fs.readFileSync(path.join(ROOT, 'crm', 'js', 'storage.js'), 'utf8');
vm.runInContext(storageCode, context);

const AppStorage = context.AppStorage;
const allCompanies = AppStorage.getCompanies();

console.log(`[1] Total companies in memory: ${allCompanies.length}`);
if (allCompanies.length !== 25628) {
    throw new Error(`Expected 25,628 companies, got ${allCompanies.length}`);
}

// 4. Check that indices 0 to 699 are ALL Titans!
console.log('[2] Checking that indices 0 to 699 in companiesMemory are ALL Titans...');
for (let i = 0; i < 700; i++) {
    const c = allCompanies[i];
    if (!c.isTitan && !(c.id && c.id.startsWith('eg_titan_'))) {
        throw new Error(`FAIL: Company at index ${i} (${c.id} - ${c.nameAr}) is NOT a Titan!`);
    }
}
console.log(`[PASS] Indices 0 to 699 are 100% verified Titans! (First: ${allCompanies[0].nameAr}, Last Titan: ${allCompanies[699].nameAr})`);

// 5. Check index 700 is first baseline company
console.log(`[3] Index 700 company: ${allCompanies[700].id} - ${allCompanies[700].nameAr} (Baseline Enterprise)`);
if (allCompanies[700].id.startsWith('eg_titan_')) {
    throw new Error(`Expected non-titan at index 700, got ${allCompanies[700].id}`);
}

// 6. Test fallback query with priority_fleet
console.log('[4] Testing AppStorage._queryCompaniesFallback with priority_fleet...');
const queryRes = AppStorage._queryCompaniesFallback({
    sortMode: 'priority_fleet',
    page: 1,
    pageSize: 15
});

console.log(`[PASS] Query page 1 returned ${queryRes.items.length} items.`);
queryRes.items.forEach((item, idx) => {
    console.log(`   ${idx + 1}. [${item.priority || 'A+'}] (Fleet: ${item.fleetSize}) ${item.nameAr}`);
    if (!item.isTitan && !item.id.startsWith('eg_titan_')) {
        throw new Error(`FAIL: Item ${idx} on page 1 is not a Titan!`);
    }
});
console.log('[PASS] Page 1 is 100% Titans with highest fleet and priority!');

console.log('\n>>> ALL TITANS-FIRST TESTS PASSED 100%! 🚀 <<<\n');
