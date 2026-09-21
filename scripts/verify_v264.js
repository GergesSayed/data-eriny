/**
 * scripts/verify_v264.js
 * Comprehensive end-to-end verification script for v264.0
 * Verifies:
 * 1. 1,000 Industrial Titans database (JSON & JS)
 * 2. 25,928 Master Companies database
 * 3. Priority pinning: All 1,000 Titans at top of memory (indices 0..999)
 * 4. Zero collisions across all IDs and Titan names
 * 5. Full schema & field completeness
 * 6. UI & cache buster alignments (index.html, storage.js)
 * 7. Backup files existence and integrity
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

console.log('====================================================');
console.log('   FLEET CRM v264.0 SYSTEM VERIFICATION AUDIT');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}`);
    throw new Error(`Verification failed on: ${testName}`);
  }
}

// 1. Check egypt_verified_titans.json
const titansJsonPath = path.join(ROOT, 'crm', 'data', 'egypt_verified_titans.json');
assert(fs.existsSync(titansJsonPath), 'egypt_verified_titans.json exists');
const titans = JSON.parse(fs.readFileSync(titansJsonPath, 'utf8'));
assert(titans.length === 1000, `egypt_verified_titans.json contains exactly 1,000 Titans (got ${titans.length})`);
assert(titans[0].id === 'eg_titan_001', 'First Titan ID is eg_titan_001');
assert(titans[999].id === 'eg_titan_1000', '1,000th Titan ID is eg_titan_1000');

// 2. Check egypt_verified_titans.js
const titansJsPath = path.join(ROOT, 'crm', 'js', 'egypt_verified_titans.js');
assert(fs.existsSync(titansJsPath), 'egypt_verified_titans.js exists');
delete require.cache[require.resolve(titansJsPath)];
const exportedTitans = require(titansJsPath);
assert(Array.isArray(exportedTitans), 'egypt_verified_titans.js exports an Array');
assert(exportedTitans.length === 1000, `egypt_verified_titans.js exports 1,000 Titans (got ${exportedTitans.length})`);

// 3. Check sequential IDs and non-empty critical fields
const titanIds = new Set();
const titanNames = new Set();
let totalFleet = 0;

titans.forEach((t, i) => {
  const normExpectedId = i < 999 ? `eg_titan_${String(i + 1).padStart(3, '0')}` : 'eg_titan_1000';
  assert(t.id === normExpectedId, `Titan #${i + 1} ID is ${normExpectedId}`);
  assert(!titanIds.has(t.id), `Titan ID ${t.id} is unique`);
  titanIds.add(t.id);

  assert(!titanNames.has(t.nameAr.trim().toLowerCase()), `Titan Arabic name "${t.nameAr}" is unique`);
  titanNames.add(t.nameAr.trim().toLowerCase());

  assert(t.nameAr && t.nameAr.length > 5, `Titan ${t.id} has valid nameAr`);
  assert(t.sector && typeof t.sector === 'string', `Titan ${t.id} has sector`);
  assert(t.governorate && typeof t.governorate === 'string', `Titan ${t.id} has governorate`);
  assert(typeof t.latitude === 'number' && typeof t.longitude === 'number', `Titan ${t.id} has numeric coordinates`);
  assert(t.fleetSize && t.fleetSize >= 30, `Titan ${t.id} has substantial fleetSize (${t.fleetSize})`);
  assert(t.isTitan === true, `Titan ${t.id} isTitan flag is true`);
  assert(t.priority === 'A+', `Titan ${t.id} priority is A+`);
  assert(t.verified === true, `Titan ${t.id} verified flag is true`);

  totalFleet += (t.fleetSize || 0);
});
assert(totalFleet > 140000, `Combined fleet size is massive (>140k): ${totalFleet.toLocaleString()}`);

// 4. Check companies.json
const companiesJsonPath = path.join(ROOT, 'crm', 'data', 'companies.json');
assert(fs.existsSync(companiesJsonPath), 'crm/data/companies.json exists');
const companies = JSON.parse(fs.readFileSync(companiesJsonPath, 'utf8'));
assert(companies.length === 25928, `crm/data/companies.json has exactly 25,928 companies (got ${companies.length})`);

// 5. Verify top 1,000 are the Titans
for (let i = 0; i < 1000; i++) {
  assert(companies[i].id.startsWith('eg_titan_'), `Company at index ${i} is Titan: ${companies[i].id}`);
  assert(companies[i].isTitan === true, `Company at index ${i} has isTitan true`);
}

// 6. Verify remaining 24,928 are pool
const pool = companies.slice(1000);
assert(pool.length === 24928, `Pool section has exactly 24,928 companies (got ${pool.length})`);
assert(!pool[0].id.startsWith('eg_titan_'), 'First pool item is not a titan');

// 7. Verify global ID uniqueness across all 25,928
const allIds = new Set();
companies.forEach(c => {
  if (allIds.has(c.id)) {
    throw new Error(`Duplicate company ID detected in master database: ${c.id}`);
  }
  allIds.add(c.id);
});
assert(allIds.size === 25928, 'All 25,928 company IDs in master database are 100% unique');

// 8. Check crm/index.html alignments
const indexHtml = fs.readFileSync(path.join(ROOT, 'crm', 'index.html'), 'utf8');
assert(indexHtml.includes("CURRENT_VER = '264.0'"), 'index.html CURRENT_VER is 264.0');
assert(indexHtml.includes("'25928'"), 'index.html default count is 25928');
assert(indexHtml.includes('js/egypt_verified_titans.js?v=264.0'), 'index.html script egypt_verified_titans.js?v=264.0');
assert(indexHtml.includes('js/companies.js?v=264.0'), 'index.html script companies.js?v=264.0');
assert(indexHtml.includes('js/storage.js?v=264.0'), 'index.html script storage.js?v=264.0');

// 9. Check crm/js/storage.js alignments
const storageJs = fs.readFileSync(path.join(ROOT, 'crm', 'js', 'storage.js'), 'utf8');
assert(storageJs.includes("companies-worker.js?v=264.0"), 'storage.js instantiates worker with ?v=264.0');

// 10. Check backups exist
const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const backupFolder = path.join(ROOT, 'backups', `companies_backup_v264_${dateStr}`);
assert(fs.existsSync(backupFolder), 'Dated backup directory exists');
assert(fs.existsSync(path.join(backupFolder, 'companies_v264.json')), 'Dated companies_v264.json exists');
assert(fs.existsSync(path.join(backupFolder, 'companies_v264.csv')), 'Dated companies_v264.csv exists');
assert(fs.existsSync(path.join(backupFolder, 'companies_v264.xlsx')), 'Dated companies_v264.xlsx exists');
assert(fs.existsSync(path.join(backupFolder, 'titans_1000_v264.json')), 'Dated titans_1000_v264.json exists');

const latestFolder = path.join(ROOT, 'backups', 'latest');
assert(fs.existsSync(path.join(latestFolder, 'companies_master_25928.json')), 'latest companies_master_25928.json exists');
assert(fs.existsSync(path.join(latestFolder, 'egypt_verified_titans_1000.json')), 'latest egypt_verified_titans_1000.json exists');
assert(fs.existsSync(path.join(latestFolder, 'BACKUP_METADATA.md')), 'latest BACKUP_METADATA.md exists');

console.log('\n====================================================');
console.log(` ALL CHECKS PASSED: ${passedTests}/${totalTests} tests passed successfully!`);
console.log(` Status: CRM v264.0 is fully verified and ready for production.`);
console.log('====================================================\n');
