/**
 * Verify v257.0 dataset integrity
 */
const fs = require('fs');
const path = require('path');

const companies = JSON.parse(fs.readFileSync('crm/data/companies.json', 'utf8'));
const pool = JSON.parse(fs.readFileSync('crm/data/egypt_enterprises_pool.json', 'utf8'));
const poolJs = fs.readFileSync('crm/js/egypt_enterprises_pool.js', 'utf8');
const html = fs.readFileSync('crm/index.html', 'utf8');
const storage = fs.readFileSync('crm/js/storage.js', 'utf8');

let pass = true;
function check(name, condition, msg) {
  if (condition) {
    console.log(`  ✅ ${name}: ${msg}`);
  } else {
    console.log(`  ❌ ${name}: ${msg}`);
    pass = false;
  }
}

console.log('\n=== VERIFICATION v257.0 ===\n');

// Count checks
const titans = companies.filter(c => c.id && c.id.startsWith('eg_titan_'));
check('Total companies', companies.length === 24962, `${companies.length} (expected 24962)`);
check('Titans count', titans.length === 34, `${titans.length} (expected 34)`);
check('Pool count', pool.length === 24928, `${pool.length} (expected 24928)`);
check('companies = titans + pool', companies.length === titans.length + pool.length,
  `${companies.length} = ${titans.length} + ${pool.length}`);

// No titans in pool
const titansInPool = pool.filter(c => c.id && c.id.startsWith('eg_titan_'));
check('No titans in pool', titansInPool.length === 0, `${titansInPool.length} titans found in pool`);

// All titans have isTitan = true
const titansMissing = titans.filter(c => !c.isTitan);
check('All titans flagged', titansMissing.length === 0, `${titansMissing.length} missing isTitan flag`);

// No duplicate IDs
const ids = companies.map(c => c.id);
const uniqueIds = new Set(ids);
check('No duplicate IDs', ids.length === uniqueIds.size, `${ids.length - uniqueIds.size} duplicates`);

// Version in index.html
check('index.html version', /CURRENT_VER\s*=\s*'257\.0'/.test(html), 'CURRENT_VER = 257.0');
check('index.html query strings', /\?v=257\.0/.test(html), 'Has ?v=257.0');

// Version in storage.js
check('storage.js version', /\?v=257\.0/.test(storage), 'Has ?v=257.0');

// Pool JS has both window assignments
check('pool.js has EGYPT_ENTERPRISES_POOL', poolJs.includes('window.EGYPT_ENTERPRISES_POOL'), 'window.EGYPT_ENTERPRISES_POOL present');
check('pool.js has __EGYPT_ENTERPRISE_POOL', poolJs.includes('window.__EGYPT_ENTERPRISE_POOL'), 'window.__EGYPT_ENTERPRISE_POOL present');

// Fleet data integrity
const noFleet = companies.filter(c => !c.fleetSize && !c.id.startsWith('eg_titan_'));
check('All pool have fleet', noFleet.length === 0, `${noFleet.length} without fleet data`);

// Sector distribution sanity
const sectors = {};
companies.forEach(c => { sectors[c.sector || 'none'] = (sectors[c.sector || 'none'] || 0) + 1; });
check('Has manufacturing', sectors.manufacturing >= 4000, `manufacturing: ${sectors.manufacturing}`);
check('Has construction', sectors.construction >= 4000, `construction: ${sectors.construction}`);
check('Has transport', sectors.transport >= 2000, `transport: ${sectors.transport}`);

console.log(`\n${'='.repeat(40)}`);
if (pass) {
  console.log('  🎉 ALL CHECKS PASSED - v257.0 VERIFIED');
} else {
  console.log('  ⚠️ SOME CHECKS FAILED');
}
console.log(`${'='.repeat(40)}\n`);
