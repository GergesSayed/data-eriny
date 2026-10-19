const fs = require('fs');
const vm = require('vm');

// Mock localStorage
const localStorageStore = {};
const localStorage = {
    getItem: (k) => localStorageStore[k] || null,
    setItem: (k, v) => { localStorageStore[k] = String(v); },
    removeItem: (k) => { delete localStorageStore[k]; },
    clear: () => { for (const k in localStorageStore) delete localStorageStore[k]; }
};

const sessionStorageStore = {};
const sessionStorage = {
    getItem: (k) => sessionStorageStore[k] || null,
    setItem: (k, v) => { sessionStorageStore[k] = String(v); },
    removeItem: (k) => { delete sessionStorageStore[k]; },
    clear: () => { for (const k in sessionStorageStore) delete sessionStorageStore[k]; }
};

const documentMock = {
    getElementById: () => null,
    querySelectorAll: () => [],
    querySelector: () => null
};

const windowMock = {
    location: { hash: '#companies' },
    localStorage,
    sessionStorage,
    document: documentMock,
    navigator: { onLine: true }
};

const context = {
    window: windowMock,
    document: documentMock,
    localStorage,
    sessionStorage,
    setInterval: (fn) => setInterval(fn, 10),
    clearInterval: () => {},
    console,
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: () => {},
    Promise,
    Date,
    Math,
    JSON,
    Array,
    Object,
    Set,
    Map
};
windowMock.window = windowMock;

vm.createContext(context);

// Load storage.js
const storageCode = fs.readFileSync('crm/js/storage.js', 'utf8');
vm.runInContext(storageCode, context);

const AppStorage = context.window.AppStorage;

async function runTest() {
    console.log('🧪 Starting Peter Samer Assignment & Unassignment Cycle Test...');

    // Mock 21,225 baseline companies in memory
    const comps = [];
    for (let i = 1; i <= 21225; i++) {
        comps.push({
            id: `comp_${i}`,
            nameAr: `شركة تجريبية ${i}`,
            sector: 'transport',
            city: 'cairo',
            governorate: 'القاهرة',
            assignedTo: '',
            isTitan: false
        });
    }
    AppStorage.companiesMemory = comps;

    const peterId = 'usr_1788180884769_rucvo';
    const target15Ids = comps.slice(0, 15).map(c => c.id);

    // 1. Admin assigns 15 companies to Peter
    AppStorage.setCurrentUser('admin');
    console.log('1. Admin assigning 15 companies to Peter...');
    await AppStorage.bulkAssignCompanies(target15Ids, peterId);

    // 2. Peter views companies
    AppStorage.setCurrentUser(peterId);
    let peterScoped = AppStorage.getScopedCompanies();
    console.log('Peter scoped companies count:', peterScoped.length);
    if (peterScoped.length !== 15) throw new Error(`Expected 15, got ${peterScoped.length}`);

    let peterQuery = await AppStorage.queryCompanies({ page: 1, pageSize: 50 });
    console.log('Peter queryCompanies total:', peterQuery.total);
    if (peterQuery.total !== 15) throw new Error(`Expected 15, got ${peterQuery.total}`);

    // 3. Admin unassigns all 15 companies
    AppStorage.setCurrentUser('admin');
    console.log('2. Admin unassigning all 15 companies...');
    await AppStorage.bulkAssignCompanies(target15Ids, '');

    // 4. Peter views companies after unassign
    AppStorage.setCurrentUser(peterId);
    peterScoped = AppStorage.getScopedCompanies();
    console.log('Peter scoped companies count after unassign:', peterScoped.length);
    if (peterScoped.length !== 0) throw new Error(`Expected 0, got ${peterScoped.length}`);

    peterQuery = await AppStorage.queryCompanies({ page: 1, pageSize: 50 });
    console.log('Peter queryCompanies total after unassign:', peterQuery.total);
    if (peterQuery.total !== 0) throw new Error(`Expected 0, got ${peterQuery.total}`);

    // 5. Simulate page refresh / memory reload with dirty indexedDB data
    console.log('3. Simulating page refresh with dirty IDB records...');
    const dirtyComps = comps.map((c, idx) => {
        if (idx < 15) {
            return Object.assign({}, c, { assignedTo: peterId }); // Stale IDB data!
        }
        return c;
    });

    // Run applyStoredAssignments on dirtyComps
    AppStorage.applyStoredAssignments(dirtyComps);
    AppStorage.companiesMemory = dirtyComps;

    // Check Peter's view again
    peterScoped = AppStorage.getScopedCompanies();
    console.log('Peter scoped after dirty IDB hydration:', peterScoped.length);
    if (peterScoped.length !== 0) throw new Error(`Resurrection detected! Expected 0, got ${peterScoped.length}`);

    peterQuery = await AppStorage.queryCompanies({ page: 1, pageSize: 50 });
    console.log('Peter queryCompanies total after dirty IDB hydration:', peterQuery.total);
    if (peterQuery.total !== 0) throw new Error(`Resurrection detected! Expected 0, got ${peterQuery.total}`);

    console.log('✅ ALL PETER CYCLE CHECKS PASSED WITH 100% SUCCESS! ZERO RESURRECTION!');
}

runTest().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
