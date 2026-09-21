const fs = require('fs');
const path = require('path');

console.log('=== RUNNING COMPREHENSIVE V262.0 VERIFICATION ===');

const ROOT = path.join(__dirname, '..');

// 1. Verify Titans JSON
const titansJsonPath = path.join(ROOT, 'crm', 'data', 'egypt_verified_titans.json');
const titans = JSON.parse(fs.readFileSync(titansJsonPath, 'utf8'));

console.log(`[1] Titans JSON count: ${titans.length} (Expected: 500)`);
if (titans.length !== 500) {
    throw new Error(`Titans count is ${titans.length}, expected 500`);
}

// Check sequential IDs and required fields
const titanIdSet = new Set();
let totalFleet = 0;
titans.forEach((t, index) => {
    const expectedId = `eg_titan_${String(index + 1).padStart(3, '0')}`;
    if (t.id !== expectedId) {
        throw new Error(`Titan index ${index} has id ${t.id}, expected ${expectedId}`);
    }
    if (titanIdSet.has(t.id)) {
        throw new Error(`Duplicate Titan ID: ${t.id}`);
    }
    titanIdSet.add(t.id);

    if (t.isTitan !== true) {
        throw new Error(`Titan ${t.id} has isTitan !== true`);
    }
    if (t.priority !== 'A+') {
        throw new Error(`Titan ${t.id} has priority !== 'A+' (${t.priority})`);
    }
    if (!t.nameAr || !t.sector || !t.governorate) {
        throw new Error(`Titan ${t.id} missing nameAr, sector, or governorate`);
    }
    const fleetSize = Number(t.fleetSize || t.fleet_size || 0);
    if (!fleetSize || fleetSize <= 0) {
        throw new Error(`Titan ${t.id} has invalid fleetSize: ${fleetSize}`);
    }
    if (!t.fleetType && !t.fleet_breakdown) {
        throw new Error(`Titan ${t.id} missing fleetType / breakdown`);
    }
    if (!t.fleetTires && !t.commercial_tire_specs) {
        throw new Error(`Titan ${t.id} missing fleetTires / tire specs`);
    }
    totalFleet += fleetSize;
});
console.log(`[1] All 500 Titans passed sequential ID, A+ priority, and spec checks!`);
console.log(`    Total combined fleet of 500 Titans: ${totalFleet.toLocaleString()} vehicles/equipment`);

// 2. Verify Titans JS
const titansJsPath = path.join(ROOT, 'crm', 'js', 'egypt_verified_titans.js');
const titansJsContent = fs.readFileSync(titansJsPath, 'utf8');
if (!titansJsContent.includes('eg_titan_500')) {
    throw new Error('Titans JS missing eg_titan_500');
}
console.log(`[2] Titans JS verified with 500 titans.`);

// 3. Verify Companies JSON
const companiesJsonPath = path.join(ROOT, 'crm', 'data', 'companies.json');
const companies = JSON.parse(fs.readFileSync(companiesJsonPath, 'utf8'));
console.log(`[3] Companies JSON count: ${companies.length} (Expected: 25428)`);
if (companies.length !== 25428) {
    throw new Error(`Companies count is ${companies.length}, expected 25428`);
}

const allIdSet = new Set();
companies.forEach((c, idx) => {
    if (allIdSet.has(c.id)) {
        throw new Error(`Duplicate company ID found in companies.json at index ${idx}: ${c.id}`);
    }
    allIdSet.add(c.id);
});
console.log(`[3] All 25,428 companies have unique IDs! Zero collisions.`);

// Verify first 500 are Titans
for (let i = 0; i < 500; i++) {
    if (companies[i].id !== `eg_titan_${String(i + 1).padStart(3, '0')}`) {
        throw new Error(`companies[${i}] is not Titan eg_titan_${String(i + 1).padStart(3, '0')}`);
    }
}
console.log(`[3] First 500 companies are strictly the verified Titans.`);

// 4. Verify crm/index.html
const indexHtml = fs.readFileSync(path.join(ROOT, 'crm', 'index.html'), 'utf8');
if (!indexHtml.includes("var CURRENT_VER = '262.0';")) {
    throw new Error("index.html missing CURRENT_VER = '262.0'");
}
if (!indexHtml.includes("localStorage.setItem('fleetcrm_company_count', '25428');")) {
    throw new Error("index.html missing count fallback 25428");
}
if (indexHtml.includes("25328") || indexHtml.includes("25,328")) {
    throw new Error("index.html still has old 25328 count string");
}
if (indexHtml.includes("v=261.0")) {
    throw new Error("index.html still has old v=261.0 script tag");
}
console.log(`[4] crm/index.html correctly bumped to v262.0 and 25,428.`);

// 5. Verify crm/js/storage.js
const storageJs = fs.readFileSync(path.join(ROOT, 'crm', 'js', 'storage.js'), 'utf8');
if (!storageJs.includes("companies-worker.js?v=262.0")) {
    throw new Error("storage.js missing companies-worker.js?v=262.0");
}
console.log(`[5] crm/js/storage.js correctly references worker v262.0.`);

console.log('\n>>> ALL V262.0 VERIFICATIONS PASSED SUCCESSFULLY! 🚀 <<<\n');
