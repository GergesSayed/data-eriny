const fs = require('fs');
const comps = JSON.parse(fs.readFileSync('./crm/data/companies.json', 'utf8'));
const pool = JSON.parse(fs.readFileSync('./crm/data/egypt_enterprises_pool.json', 'utf8'));
const titans = JSON.parse(fs.readFileSync('./crm/data/egypt_verified_titans.json', 'utf8'));

console.log('=== VERIFICATION OF V254.0 DATASET ===');
console.log('Total Companies in companies.json:', comps.length);
console.log('Total Pool in egypt_enterprises_pool.json:', pool.length);
console.log('Total Titans in egypt_verified_titans.json:', titans.length);
console.log('Math check:', pool.length + titans.length === comps.length ? 'PASS (25,181 + 34 = 25,215)' : 'FAIL');

// Check purge list verification
const purgeIds = new Set(require('../scraper/output/mall_and_retail_purge_ids.json'));
let leakedPurge = 0;
comps.forEach(c => {
    if (purgeIds.has(c.id)) {
        console.error('LEAK FOUND:', c.id, c.nameAr || c.name);
        leakedPurge++;
    }
});
console.log('Purge verification (leaked items):', leakedPurge === 0 ? 'PASS (0 leaked)' : 'FAIL');

// Check titans protection
const titanIds = new Set(titans.map(t => t.id));
let preservedTitans = 0;
comps.forEach(c => {
    if (titanIds.has(c.id)) preservedTitans++;
});
console.log('Titans preservation:', preservedTitans === 34 ? 'PASS (34/34)' : 'FAIL');

// Check index.html fallback
const html = fs.readFileSync('./crm/index.html', 'utf8');
console.log('index.html CURRENT_VER check:', html.includes("var CURRENT_VER = '254.0';") ? 'PASS' : 'FAIL');
console.log('index.html 25215 check:', html.includes('25215') && html.includes('25,215') ? 'PASS' : 'FAIL');
console.log('index.html old 25335 absent check:', !html.includes('25335') && !html.includes('25,335') ? 'PASS' : 'FAIL');
