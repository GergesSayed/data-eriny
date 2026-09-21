/**
 * scripts/verify_v260.js
 * Comprehensive integrity verification for v260.0 release:
 * 300 Titans + 24,928 Pool = 25,228 Total Companies.
 */

const fs = require('fs');
const path = require('path');

const titansJsonPath = path.join(__dirname, '../crm/data/egypt_verified_titans.json');
const titansJsPath = path.join(__dirname, '../crm/js/egypt_verified_titans.js');
const poolJsonPath = path.join(__dirname, '../crm/data/egypt_enterprises_pool.json');
const companiesJsonPath = path.join(__dirname, '../crm/data/companies.json');
const indexHtmlPath = path.join(__dirname, '../crm/index.html');
const storageJsPath = path.join(__dirname, '../crm/js/storage.js');

console.log('=== RUNNING COMPREHENSIVE V260.0 INTEGRITY VERIFICATION ===\n');

let passCount = 0;
let failCount = 0;

function check(label, condition, details = '') {
  if (condition) {
    console.log(`[PASS] ${label}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${label} - ${details}`);
    failCount++;
  }
}

// 1. Titans JSON checks
const titans = JSON.parse(fs.readFileSync(titansJsonPath, 'utf8'));
check('Titans count is exactly 300', titans.length === 300, `Found: ${titans.length}`);

// ID sequence check
let idsMatchSequence = true;
const titanIds = new Set();
for (let i = 0; i < titans.length; i++) {
  const expectedId = `eg_titan_${String(i + 1).padStart(3, '0')}`;
  if (titans[i].id !== expectedId) {
    idsMatchSequence = false;
    console.error(`Mismatch at index ${i}: expected ${expectedId}, got ${titans[i].id}`);
    break;
  }
  titanIds.add(titans[i].id);
}
check('All 300 Titans have strictly sequential IDs eg_titan_001 to eg_titan_300', idsMatchSequence);
check('All 300 Titan IDs are unique', titanIds.size === 300);

// Schema integrity check
let schemaValid = true;
let totalTitanFleet = 0;
const sectorCounts = {};

for (const t of titans) {
  totalTitanFleet += (t.fleetSize || 0);
  sectorCounts[t.sector] = (sectorCounts[t.sector] || 0) + 1;

  if (!t.nameAr || !t.nameEn || !t.sector || !t.city || !t.governorate || !t.address ||
      !t.phone1 || !t.mobile || !t.fleetSize || !t.fleetType || !t.fleetTires ||
      t.priority !== 'A+' || t.isTitan !== true || t.verified !== true || !t.notes) {
    schemaValid = false;
    console.error('Invalid schema for titan:', t.id, t.nameAr, 'priority:', t.priority);
  }
}
check('All 300 Titans have complete mandatory attributes (isTitan, priority A+, fleet specs)', schemaValid);
check('Total combined fleet of 300 Titans is verified', totalTitanFleet > 70000, `Total Fleet: ${totalTitanFleet}`);

// 2. Titans JS file check
const titansJsContent = fs.readFileSync(titansJsPath, 'utf8');
check('egypt_verified_titans.js sets window.__EGYPT_VERIFIED_TITANS', titansJsContent.includes('window.__EGYPT_VERIFIED_TITANS = ['));
check('egypt_verified_titans.js contains eg_titan_300', titansJsContent.includes('eg_titan_300'));

// 3. Pool JSON check
const pool = JSON.parse(fs.readFileSync(poolJsonPath, 'utf8'));
check('Pool count is exactly 24,928', pool.length === 24928, `Found: ${pool.length}`);

// No overlap
let overlap = false;
for (const p of pool) {
  if (titanIds.has(p.id)) {
    overlap = true;
    console.error('Overlap found:', p.id);
    break;
  }
}
check('Zero ID overlap between Titans and Pool', !overlap);

// 4. Companies JSON check
const companies = JSON.parse(fs.readFileSync(companiesJsonPath, 'utf8'));
check('Total companies.json count is exactly 25,228 (300 + 24,928)', companies.length === 25228, `Found: ${companies.length}`);

const allCompanyIds = new Set();
for (const c of companies) {
  allCompanyIds.add(c.id);
}
check('All 25,228 company IDs in companies.json are unique', allCompanyIds.size === 25228);

// First 300 must be Titans
let first300AreTitans = true;
for (let i = 0; i < 300; i++) {
  if (companies[i].id !== `eg_titan_${String(i + 1).padStart(3, '0')}`) {
    first300AreTitans = false;
    break;
  }
}
check('First 300 companies in companies.json are the 300 Titans', first300AreTitans);

// 5. Version checks in index.html & storage.js
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
check('index.html specifies CURRENT_VER 260.0', indexHtml.includes("var CURRENT_VER = '260.0';"));
check('index.html specifies count 25228 in storage check', indexHtml.includes("localStorage.setItem('fleetcrm_company_count', '25228');"));
check('index.html specifies count 25,228 in fallback UI', indexHtml.includes("'25,228'"));
check('index.html references script bundles with ?v=260.0', indexHtml.includes('js/egypt_verified_titans.js?v=260.0'));

const storageJs = fs.readFileSync(storageJsPath, 'utf8');
check('storage.js uses worker cache buster ?v=260.0', storageJs.includes("js/companies-worker.js?v=260.0"));

console.log('\n--- Sector Breakdown of 300 Titans ---');
for (const [sector, count] of Object.entries(sectorCounts)) {
  console.log(`  ${sector}: ${count} Titans`);
}
console.log(`  TOTAL FLEET: ${totalTitanFleet.toLocaleString()} vehicles\n`);

console.log(`=== SUMMARY: ${passCount} PASSED, ${failCount} FAILED ===`);
if (failCount > 0) process.exit(1);
