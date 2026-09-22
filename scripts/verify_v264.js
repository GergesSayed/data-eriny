const fs = require('fs');
const vm = require('vm');

console.log('========================================================');
console.log('RUNNING COMPREHENSIVE END-TO-END VERIFICATION v264.2');
console.log('========================================================\n');

// 1. Check companies.json
const companies = JSON.parse(fs.readFileSync('crm/data/companies.json', 'utf8'));
console.log(`[1] Total companies in companies.json: ${companies.length}`);
if (companies.length !== 25928) throw new Error(`Expected 25928 companies, got ${companies.length}`);

// 2. Check egypt_verified_titans.json
const titans = JSON.parse(fs.readFileSync('crm/data/egypt_verified_titans.json', 'utf8'));
console.log(`[2] Total Titans in egypt_verified_titans.json: ${titans.length}`);
if (titans.length !== 1000) throw new Error(`Expected 1000 titans, got ${titans.length}`);

// 3. Check egypt_enterprises_pool.json
const pool = JSON.parse(fs.readFileSync('crm/data/egypt_enterprises_pool.json', 'utf8'));
console.log(`[3] Total Pool in egypt_enterprises_pool.json: ${pool.length}`);
if (pool.length !== 24928) throw new Error(`Expected 24928 pool, got ${pool.length}`);

// 4. Verify all Titans have VIP & unique IDs & unique Names
const titanIds = new Set();
const titanNames = new Set();
titans.forEach(t => {
    if (!t.vip || t.badge !== '👑 VIP' || !t.isTitan) {
        throw new Error(`Titan ${t.id} missing VIP properties`);
    }
    if (titanIds.has(t.id)) throw new Error(`Duplicate Titan ID: ${t.id}`);
    if (titanNames.has(t.nameAr)) throw new Error(`Duplicate Titan Name: ${t.nameAr}`);
    titanIds.add(t.id);
    titanNames.add(t.nameAr);
});
console.log('[4] All 1,000 Titans are 100% unique and have 👑 VIP badge.');

// 5. Verify VM execution of storage and audit
const mockWindow = {
    location: { hostname: 'localhost' },
    addEventListener: () => { },
    document: { getElementById: () => null, querySelectorAll: () => [] }
};
mockWindow.window = mockWindow;
const context = {
    window: mockWindow,
    document: mockWindow.document,
    navigator: { userAgent: 'Node' },
    console: console,
    localStorage: { getItem: () => null, setItem: () => { }, removeItem: () => { } },
    location: mockWindow.location
};
vm.createContext(context);

vm.runInContext(fs.readFileSync('crm/js/egypt_verified_titans.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('crm/js/egypt_enterprises_pool.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('crm/js/storage.js', 'utf8'), context);

const AppStorage = context.window.AppStorage;
const loaded = AppStorage.getCompanies();
console.log(`[5] AppStorage in-memory hydration: ${loaded.length} companies.`);
if (loaded.length !== 25928) throw new Error(`Expected 25928 companies in memory, got ${loaded.length}`);

// 6. Test Data Audit Engine
console.log('[6] Running AppStorage.auditCompanyData()...');
const audit = AppStorage.auditCompanyData();
console.log(`    - Total: ${audit.total}`);
console.log(`    - Total Duplicates: ${audit.totalDuplicates}`);
console.log(`    - Duplicate Groups: ${audit.duplicateGroups.length}`);
console.log(`    - Shared Switchboards: ${audit.sharedSwitchboardGroups.length}`);
console.log(`    - Clean Data Count: ${audit.cleanDataCount}`);
console.log(`    - Quality Score: ${Math.round((audit.cleanDataCount / audit.total) * 100)}%`);

if (audit.totalDuplicates !== 0) throw new Error(`Expected 0 duplicates, got ${audit.totalDuplicates}`);
if (audit.duplicateGroups.length !== 0) throw new Error(`Expected 0 duplicate groups, got ${audit.duplicateGroups.length}`);
if (audit.cleanDataCount !== 25928) throw new Error(`Expected 25928 clean data count, got ${audit.cleanDataCount}`);

// 7. Test autoCleanAndMergeDuplicates
console.log('[7] Running AppStorage.autoCleanAndMergeDuplicates()...');
const autoClean = AppStorage.autoCleanAndMergeDuplicates();
console.log(`    - Merged: ${autoClean.mergedCount}`);
console.log(`    - Cleaned: ${autoClean.cleanedCount}`);
console.log(`    - Remaining Total: ${autoClean.remainingTotal}`);

if (autoClean.mergedCount !== 0) throw new Error(`Expected 0 merged, got ${autoClean.mergedCount}`);
if (autoClean.remainingTotal !== 25928) throw new Error(`Expected 25928 remaining, got ${autoClean.remainingTotal}`);

console.log('\n========================================================');
console.log('ALL AUDITS PASSED WITH ZERO ERRORS AND ZERO DUPLICATES! 🎉');
console.log('========================================================\n');
