/**
 * scripts/merge_phase2_expansion.js
 * Merges Phase 2: Suez, Ain Sokhna, Damietta Port, Sadat City, Beni Suef & 10th of Ramadan
 * (290 verified B2B fleet companies) into Fleet CRM database
 * (Base Pool: 17,956 -> 18,246, Total CRM: 18,956 -> 19,246).
 */

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('  FLEET CRM — PHASE 2 INDUSTRIAL CLUSTERS & CORRIDORS MERGE    ');
console.log('================================================================\n');

// 1. Load Datasets
const phase2Path = 'scraper/output/phase2_verified_b2b_fleet.json';
const compsPath = 'crm/data/companies.json';
const poolJsonPath = 'crm/data/egypt_enterprises_pool.json';
const poolJsPath = 'crm/js/egypt_enterprises_pool.js';

if (!fs.existsSync(phase2Path)) {
  console.error('ERROR: Phase 2 verified batch not found at:', phase2Path);
  process.exit(1);
}

const phase2Batch = JSON.parse(fs.readFileSync(phase2Path, 'utf8'));
const existingComps = JSON.parse(fs.readFileSync(compsPath, 'utf8'));
const existingPool = JSON.parse(fs.readFileSync(poolJsonPath, 'utf8'));

console.log(`[1] Loaded existing CRM companies: ${existingComps.length.toLocaleString()}`);
console.log(`[1] Loaded existing base pool: ${existingPool.length.toLocaleString()}`);
console.log(`[1] Loaded Phase 2 candidates: ${phase2Batch.length.toLocaleString()}`);

// 2. Strict Deduplication Indexing
function normArabic(t) {
  if (!t) return '';
  return t.toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[ؤئ]/g, 'ء')
    .replace(/[^a-z0-9\u0621-\u064A]/g, '')
    .replace(/^(شركه|مصنع|مؤسسه|مجموعه|توكيل|مكتب|معرض)/, '')
    .trim();
}

function normPhone(p) {
  if (!p) return '';
  let d = p.toString().replace(/[^0-9]/g, '');
  if (d.startsWith('20')) d = '0' + d.slice(2);
  return d.length >= 7 ? d.slice(-9) : '';
}

const existingIds = new Set(existingComps.map(c => c.id));
const existingPhones = new Set();
const existingNames = new Set();

existingComps.forEach(c => {
  [c.phone1, c.phone2, c.mobile, c.hotline].forEach(p => {
    const np = normPhone(p);
    if (np) existingPhones.add(np);
  });
  const na = normArabic(c.nameAr);
  if (na && na.length >= 3) existingNames.add(na);
});

// 3. Filter Candidates
const acceptedNew = [];
let skippedDups = 0;

phase2Batch.forEach(c => {
  if (existingIds.has(c.id)) {
    skippedDups++;
    return;
  }
  const p1 = normPhone(c.phone1);
  const mob = normPhone(c.mobile);
  if ((p1 && existingPhones.has(p1)) || (mob && existingPhones.has(mob))) {
    skippedDups++;
    return;
  }
  const na = normArabic(c.nameAr);
  if (na && existingNames.has(na)) {
    skippedDups++;
    return;
  }

  existingIds.add(c.id);
  if (p1) existingPhones.add(p1);
  if (mob) existingPhones.add(mob);
  if (na) existingNames.add(na);

  acceptedNew.push(c);
});

console.log(`[2] Candidate processing complete: ${acceptedNew.length} accepted, ${skippedDups} duplicates skipped.`);

if (acceptedNew.length === 0) {
  console.log('No new companies to merge. Exiting.');
  process.exit(0);
}

// 4. Update Datasets
const updatedPool = [...existingPool, ...acceptedNew];
const updatedComps = [...existingComps, ...acceptedNew];

console.log(`[3] Updated Base Pool: ${existingPool.length} -> ${updatedPool.length}`);
console.log(`[3] Updated Total Companies: ${existingComps.length} -> ${updatedComps.length}`);

// Write crm/data/egypt_enterprises_pool.json
fs.writeFileSync(poolJsonPath, JSON.stringify(updatedPool, null, 2), 'utf8');
console.log(`  -> Wrote ${poolJsonPath}`);

// Write crm/data/companies.json
fs.writeFileSync(compsPath, JSON.stringify(updatedComps, null, 2), 'utf8');
console.log(`  -> Wrote ${compsPath}`);

// Write crm/js/egypt_enterprises_pool.js
const poolJsContent = `// Fleet CRM — 100% Real & Verified Egyptian Enterprises Pool (Sanitized v312.0)
// Total Real Verified Enterprises in this pool: ${updatedPool.length} (plus 1,000 VIP Titans = ${updatedComps.length} Total)
(function() {
  var data = ${JSON.stringify(updatedPool)};
  if (typeof window !== 'undefined') {
    window.__EGYPT_ENTERPRISE_POOL = data;
    window.EGYPT_ENTERPRISE_POOL = data;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = data;
  }
})();
`;
fs.writeFileSync(poolJsPath, poolJsContent, 'utf8');
console.log(`  -> Wrote ${poolJsPath} (${(fs.statSync(poolJsPath).size / 1024 / 1024).toFixed(2)} MB)`);

// 5. Update Version Constants across CRM Files
const PREV_VER_TAG = `v311.0_alexandria_expansion_18956`;
const NEW_VER_TAG = `v312.0_industrial_corridors_${updatedComps.length}`;
console.log(`\n[4] Updating dataset version tags to: ${NEW_VER_TAG}`);

// 5a. crm/index.html
const indexHtmlPath = 'crm/index.html';
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
indexHtml = indexHtml.replace(new RegExp(PREV_VER_TAG, 'g'), NEW_VER_TAG);
indexHtml = indexHtml.replace(/parsed < 1000\) parsed = 18956;/g, `parsed < 1000) parsed = ${updatedComps.length};`);
fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
console.log(`  -> Updated ${indexHtmlPath}`);

// 5b. crm/js/storage.js
const storageJsPath = 'crm/js/storage.js';
let storageJs = fs.readFileSync(storageJsPath, 'utf8');
storageJs = storageJs.replace(new RegExp(PREV_VER_TAG, 'g'), NEW_VER_TAG);
storageJs = storageJs.replace(/length >= 18956/g, `length >= ${updatedComps.length}`);
storageJs = storageJs.replace(/length < 18956/g, `length < ${updatedComps.length}`);
storageJs = storageJs.replace(/length === 18956/g, `length === ${updatedComps.length}`);
storageJs = storageJs.replace(/: 18956;/g, `: ${updatedComps.length};`);
storageJs = storageJs.replace(/count = 18956;/g, `count = ${updatedComps.length};`);
storageJs = storageJs.replace(/: 18956\)/g, `: ${updatedComps.length})`);
storageJs = storageJs.replace(/updateLiveCounters\(18956\)/g, `updateLiveCounters(${updatedComps.length})`);
fs.writeFileSync(storageJsPath, storageJs, 'utf8');
console.log(`  -> Updated ${storageJsPath}`);

// 5c. crm/js/companies.js
const companiesJsPath = 'crm/js/companies.js';
let companiesJs = fs.readFileSync(companiesJsPath, 'utf8');
companiesJs = companiesJs.replace(new RegExp(PREV_VER_TAG, 'g'), NEW_VER_TAG);
fs.writeFileSync(companiesJsPath, companiesJs, 'utf8');
console.log(`  -> Updated ${companiesJsPath}`);

// 5d. crm/js/app.js
const appJsPath = 'crm/js/app.js';
let appJs = fs.readFileSync(appJsPath, 'utf8');
appJs = appJs.replace(new RegExp(PREV_VER_TAG, 'g'), NEW_VER_TAG);
fs.writeFileSync(appJsPath, appJs, 'utf8');
console.log(`  -> Updated ${appJsPath}`);

// 5e. scripts/run_e2e_functional_tests.js
const testJsPath = 'scripts/run_e2e_functional_tests.js';
let testJs = fs.readFileSync(testJsPath, 'utf8');
testJs = testJs.replace(/rawComps\.length === 18956, 'Exact total company count is 18,956'/g, `rawComps.length === ${updatedComps.length}, 'Exact total company count is ${updatedComps.length.toLocaleString()}'`);
testJs = testJs.replace(/basePool\.length === 17956, 'Exact Base Pool count is 17,956'/g, `basePool.length === ${updatedPool.length}, 'Exact Base Pool count is ${updatedPool.length.toLocaleString()}'`);
testJs = testJs.replace(/18,956 records/g, `${updatedComps.length.toLocaleString()} records`);
fs.writeFileSync(testJsPath, testJs, 'utf8');
console.log(`  -> Updated ${testJsPath}`);

console.log('\n================================================================');
console.log(`  MERGE COMPLETED SUCCESSFULLY: ${updatedComps.length.toLocaleString()} TOTAL COMPANIES  `);
console.log('================================================================');
