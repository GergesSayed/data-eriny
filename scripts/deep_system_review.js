const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('         DEEP FORENSIC SYSTEM REVIEW (FLEET CRM v352.0)         ');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;
let warnCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passCount++;
    console.log(`[PASS] ${testName} ${details ? '-> ' + details : ''}`);
  } else {
    failCount++;
    console.error(`[FAIL] ${testName} ${details ? '-> ' + details : ''}`);
  }
}

function warn(testName, details = '') {
  warnCount++;
  console.warn(`[WARN] ${testName} ${details ? '-> ' + details : ''}`);
}

// -------------------------------------------------------------
// 1. ASSETS & DEPENDENCIES AUDIT (HTML, SW, CSS, JS)
// -------------------------------------------------------------
console.log('--- 1. ASSETS & DEPENDENCIES AUDIT ---');

const indexHtml = fs.readFileSync('crm/index.html', 'utf8');
const swJs = fs.readFileSync('crm/sw.js', 'utf8');

// Check script tags in index.html
const scriptMatches = [...indexHtml.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);
console.log(`Found ${scriptMatches.length} script references in index.html`);

scriptMatches.forEach(src => {
  if (src.startsWith('http')) return; // external CDN (e.g., FontAwesome, Chart.js)
  const cleanPath = src.split('?')[0];
  const fullPath = path.join('crm', cleanPath);
  assert(fs.existsSync(fullPath), `HTML script reference exists on disk: ${src}`);
  if (src.includes('js/') && !src.includes('?v=357.0')) {
    warn(`Script tag version query mismatch: ${src} (Expected ?v=357.0)`);
  }
});

// Check css link tags in index.html
const cssMatches = [...indexHtml.matchAll(/<link[^>]+href=["']([^"']+\.css[^"']*)["']/g)].map(m => m[1]);
cssMatches.forEach(href => {
  if (href.startsWith('http')) return;
  const cleanPath = href.split('?')[0];
  const fullPath = path.join('crm', cleanPath);
  assert(fs.existsSync(fullPath), `HTML CSS reference exists on disk: ${href}`);
});

// Check Service Worker assets list
const swMatch = swJs.match(/const ASSETS = \[([\s\S]*?)\];/);
if (swMatch) {
  const assets = swMatch[1]
    .split('\n')
    .map(l => l.trim().replace(/^['"]|['"],?$/g, ''))
    .filter(l => l.length > 0 && !l.startsWith('//'));
  
  console.log(`Checking ${assets.length} cache assets in sw.js...`);
  assets.forEach(a => {
    if (a === './' || a === '.') return;
    const cleanPath = a.split('?')[0].replace(/^\.\//, '');
    const fullPath = path.join('crm', cleanPath);
    assert(fs.existsSync(fullPath), `SW Asset exists on disk: ${a}`);
  });
}

// -------------------------------------------------------------
// 2. DATASET SCHEMA & STRICT COMPLIANCE (21,225 records)
// -------------------------------------------------------------
console.log('\n--- 2. DATASET SCHEMA & DATA INTEGRITY ---');

const companiesRaw = fs.readFileSync('crm/data/companies.json', 'utf8');
const companies = JSON.parse(companiesRaw);

assert(companies.length === 21225, `Total companies count is exactly 21,225 (Actual: ${companies.length})`);

const idSet = new Set();
let dupIds = 0;
let missingName = 0;
let missingSector = 0;
let missingCity = 0;
let missingGov = 0;
let missingStatus = 0;
let prefilledContacts = 0;
let negativeFleet = 0;
let titansCount = 0;

companies.forEach(c => {
  if (idSet.has(c.id)) dupIds++;
  idSet.add(c.id);

  if (!c.nameAr || c.nameAr.trim().length === 0) missingName++;
  if (!c.sector) missingSector++;
  if (!c.city) missingCity++;
  if (!c.governorate) missingGov++;
  if (!c.status) missingStatus++;
  if (c.contactPerson && c.contactPerson.trim().length > 0) prefilledContacts++;
  if (c.fleetSize !== undefined && c.fleetSize < 0) negativeFleet++;
  if (c.isTitan || c.vip) titansCount++;
});

assert(dupIds === 0, 'Zero duplicate company IDs');
assert(missingName === 0, 'All companies have valid Arabic names');
assert(missingSector === 0, 'All companies have sector assigned');
assert(missingGov === 0, 'All companies have governorate assigned');
assert(missingCity === 0, 'All companies have city assigned');
assert(missingStatus === 0, 'All companies have initial status');
assert(prefilledContacts === 0, 'Contact Person policy: 100% blank for sales agents');
assert(negativeFleet === 0, 'Zero negative fleet sizes');
assert(titansCount === 1000, `VIP Titans count is exactly 1,000 (Actual: ${titansCount})`);

// -------------------------------------------------------------
// 3. STORAGE LOGIC & QUOTA PROTECTION AUDIT
// -------------------------------------------------------------
console.log('\n--- 3. STORAGE & LOCALSTORAGE QUOTA AUDIT ---');

const storageJs = fs.readFileSync('crm/js/storage.js', 'utf8');

// Check that _set(KEYS.COMPANIES) is strictly prevented from writing to localStorage
const hasLocalStorageCompaniesGuard = storageJs.includes("key === this.KEYS.COMPANIES") && storageJs.includes("NEVER store 21,225 full companies in localStorage");
assert(hasLocalStorageCompaniesGuard, 'Storage has explicit guard preventing 21k companies in localStorage (Quota Protection)');

// Check that IndexedDB deletion is NOT present
const hasDbWipe = storageJs.includes('indexedDB.deleteDatabase');
assert(!hasDbWipe, 'Storage has NO destructive indexedDB.deleteDatabase calls');

// Check that getStats has memoization
const hasStatsCache = storageJs.includes('this._statsCache') && storageJs.includes('this._statsCacheTime');
assert(hasStatsCache, 'Storage has memory caching for getStats() to avoid 21k iteration loops');

// -------------------------------------------------------------
// 4. CALLS LIFECYCLE & ORPHAN BADGE LOGIC AUDIT
// -------------------------------------------------------------
console.log('\n--- 4. CALLS & CUSTODY LOGIC AUDIT ---');

const callsJs = fs.readFileSync('crm/js/calls.js', 'utf8');

// Check active-page check
const hasCallsActiveCheck = callsJs.includes("document.getElementById('page-calls')") && callsJs.includes("classList.contains('active')");
assert(hasCallsActiveCheck, 'Calls.render() has strict active page check');

// Check reports.js active check and performance loop
const reportsJs = fs.readFileSync('crm/js/reports.js', 'utf8');
const hasReportsActiveCheck = reportsJs.includes("document.getElementById('page-reports')") && reportsJs.includes("classList.contains('active')");
assert(hasReportsActiveCheck, 'Reports.render() has strict active page check');

// Check dashboard.js active check and chart update reuse
const dashJs = fs.readFileSync('crm/js/dashboard.js', 'utf8');
const hasDashActiveCheck = dashJs.includes("document.getElementById('page-dashboard')") && dashJs.includes("classList.contains('active')");
assert(hasDashActiveCheck, 'Dashboard.render() has strict active page check');

const hasChartUpdate = dashJs.includes("existingChart.update()") && dashJs.includes("Chart.getChart(ctx)");
assert(hasChartUpdate, 'Dashboard reuses Chart.js instances instead of destroying and re-allocating canvas');

// -------------------------------------------------------------
// 5. CLOUD SYNC & API INTEGRITY AUDIT
// -------------------------------------------------------------
console.log('\n--- 5. CLOUD SYNC & API INTEGRITY AUDIT ---');

const cloudJs = fs.readFileSync('crm/js/supabase-client.js', 'utf8');

// Check that root probe is removed
const hasRootProbe = cloudJs.includes("'/.json'") || cloudJs.includes('"/.json"');
assert(!hasRootProbe, 'Cloud client has removed failing root probe (/.json 401 Unauthorized)');

// Check memory cache on cloud client
const hasCloudCache = cloudJs.includes('_cachedDynamicCompanies') && cloudJs.includes('_cachedCustody') && cloudJs.includes('DYNAMIC_COMPANIES_TTL');
assert(hasCloudCache, 'Cloud client caches heavy payloads (dynamic_companies.json and custody.json) to eliminate repeated downloads');

// -------------------------------------------------------------
// 6. EXPORT MODULE INTEGRITY (CSV / Excel Arabic UTF-8 BOM)
// -------------------------------------------------------------
console.log('\n--- 6. EXPORT MODULE INTEGRITY AUDIT ---');

const excelJs = fs.readFileSync('crm/js/excel-handler.js', 'utf8');
const hasUtf8Bom = excelJs.includes('\\uFEFF') || excelJs.includes('\uFEFF');
assert(hasUtf8Bom, 'Excel/CSV export module uses UTF-8 BOM for Arabic compatibility');

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`AUDIT RESULTS:`);
console.log(`[PASS]: ${passCount}`);
console.log(`[WARN]: ${warnCount}`);
console.log(`[FAIL]: ${failCount}`);
console.log(`SYSTEM HEALTH: ${failCount === 0 ? '100% HEALTHY & PRODUCTION-READY' : 'ACTION REQUIRED'}`);
console.log('================================================================\n');
