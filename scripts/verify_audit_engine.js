const fs = require('fs');
const vm = require('vm');

const mockWindow = {
    location: { hostname: 'localhost' },
    addEventListener: () => { },
    document: {
        getElementById: () => null,
        querySelectorAll: () => []
    }
};
mockWindow.window = mockWindow;

const context = {
    window: mockWindow,
    document: mockWindow.document,
    navigator: { userAgent: 'Node' },
    console: console,
    localStorage: {
        getItem: () => null,
        setItem: () => { },
        removeItem: () => { }
    },
    location: mockWindow.location
};
vm.createContext(context);

// 1. Load Titans
console.log('Loading titans...');
vm.runInContext(fs.readFileSync('crm/js/egypt_verified_titans.js', 'utf8'), context);
// 2. Load Pool
console.log('Loading pool...');
vm.runInContext(fs.readFileSync('crm/js/egypt_enterprises_pool.js', 'utf8'), context);
// 3. Load Storage
console.log('Loading storage.js...');
vm.runInContext(fs.readFileSync('crm/js/storage.js', 'utf8'), context);

const AppStorage = context.window.AppStorage;

console.log('\n--- Testing AppStorage.getCompanies() ---');
const companies = AppStorage.getCompanies();
console.log('Total Companies loaded:', companies.length);

console.log('\n--- Running AppStorage.auditCompanyData() ---');
const report = AppStorage.auditCompanyData();
console.log('Total:', report.total);
console.log('Invalid Count:', report.invalidCount);
console.log('Missing Phone:', report.missingPhone);
console.log('Missing Sector:', report.missingSector);
console.log('Missing City:', report.missingCity);
console.log('Total Duplicates:', report.totalDuplicates);
console.log('Duplicate Groups Count:', report.duplicateGroups.length);
console.log('Shared Switchboard Groups:', report.sharedSwitchboardGroups.length);
console.log('Clean Data Count:', report.cleanDataCount);
console.log('Deduplication Score:', Math.round((report.cleanDataCount / report.total) * 100) + '%');

if (report.totalDuplicates !== 0 || report.duplicateGroups.length !== 0) {
    console.error('FAIL: duplicateGroups should be 0!');
    process.exit(1);
} else {
    console.log('\n=============================================');
    console.log('SUCCESS! Database is 100% clean with 0 duplicates!');
    console.log('=============================================');
}
