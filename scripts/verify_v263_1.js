const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== RUNNING COMPREHENSIVE V263.1 RUNTIME VERIFICATION ===');

const ROOT = path.join(__dirname, '..');

// Create mock browser window context
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
console.log('[1] Loading crm/js/egypt_verified_titans.js into sandbox...');
const titansCode = fs.readFileSync(path.join(ROOT, 'crm', 'js', 'egypt_verified_titans.js'), 'utf8');
vm.runInContext(titansCode, context);

if (!context.window.__EGYPT_VERIFIED_TITANS || !Array.isArray(context.window.__EGYPT_VERIFIED_TITANS)) {
    throw new Error('FAIL: window.__EGYPT_VERIFIED_TITANS is not defined or not an array!');
}
if (!context.window.EGYPT_VERIFIED_TITANS || !Array.isArray(context.window.EGYPT_VERIFIED_TITANS)) {
    throw new Error('FAIL: window.EGYPT_VERIFIED_TITANS is not defined or not an array!');
}
console.log(`[PASS] Verified window.__EGYPT_VERIFIED_TITANS: ${context.window.__EGYPT_VERIFIED_TITANS.length} titans.`);
console.log(`[PASS] Verified window.EGYPT_VERIFIED_TITANS: ${context.window.EGYPT_VERIFIED_TITANS.length} titans.`);

// 2. Load egypt_enterprises_pool.js
console.log('[2] Loading crm/js/egypt_enterprises_pool.js into sandbox...');
const poolCode = fs.readFileSync(path.join(ROOT, 'crm', 'js', 'egypt_enterprises_pool.js'), 'utf8');
vm.runInContext(poolCode, context);

const poolCount = context.window.EGYPT_ENTERPRISES_POOL.length;
console.log(`[PASS] Verified baseline enterprises pool: ${poolCount} companies.`);

// 3. Load storage.js
console.log('[3] Loading crm/js/storage.js into sandbox...');
const storageCode = fs.readFileSync(path.join(ROOT, 'crm', 'js', 'storage.js'), 'utf8');
vm.runInContext(storageCode, context);

const AppStorage = context.AppStorage;
if (!AppStorage) {
    throw new Error('FAIL: AppStorage is not defined!');
}

const titansFromStorage = AppStorage.getVerifiedTitans();
console.log(`[PASS] AppStorage.getVerifiedTitans() returned ${titansFromStorage.length} titans.`);
if (titansFromStorage.length !== 700) {
    throw new Error(`FAIL: Expected 700 titans, got ${titansFromStorage.length}`);
}

const allCompanies = AppStorage.getCompanies();
console.log(`[PASS] AppStorage.getCompanies() returned ${allCompanies.length} total companies.`);
if (allCompanies.length !== 25628) {
    throw new Error(`FAIL: Expected 25,628 companies, got ${allCompanies.length}`);
}

const savedCount = mockLocalStorage.getItem('fleetcrm_company_count');
console.log(`[PASS] localStorage fleetcrm_company_count is: ${savedCount}`);
if (savedCount !== '25628') {
    throw new Error(`FAIL: Expected fleetcrm_company_count to be '25628', got '${savedCount}'`);
}

// 4. Verify Titan records integrity
let titansFound = 0;
allCompanies.forEach(c => {
    if (c.isTitan || (c.id && c.id.startsWith('eg_titan_'))) {
        titansFound++;
    }
});
console.log(`[PASS] Total Titan companies found in merged list: ${titansFound}`);
if (titansFound !== 700) {
    throw new Error(`FAIL: Expected 700 Titans in merged list, got ${titansFound}`);
}

// 5. Verify index.html version bump
const indexHtml = fs.readFileSync(path.join(ROOT, 'crm', 'index.html'), 'utf8');
if (!indexHtml.includes("var CURRENT_VER = '263.1';")) {
    throw new Error("FAIL: index.html CURRENT_VER is not '263.1'");
}
if (!indexHtml.includes("js/egypt_verified_titans.js?v=263.1")) {
    throw new Error("FAIL: index.html missing ?v=263.1 for egypt_verified_titans.js");
}
if (!indexHtml.includes("js/storage.js?v=263.1")) {
    throw new Error("FAIL: index.html missing ?v=263.1 for storage.js");
}
console.log('[PASS] crm/index.html properly updated to v263.1 with cache busters.');

console.log('\n>>> ALL V263.1 TESTS PASSED PERFECTLY! 🚀 25,628 COMPANIES FULLY HYDRATED! <<<\n');
