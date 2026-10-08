const fs = require('fs');
const path = require('path');

console.log('=== MERGING TRACK A DELTA B2B FLEET EXPANSION ===');

const compsPath = path.join(__dirname, '../crm/data/companies.json');
const poolJsonPath = path.join(__dirname, '../crm/data/egypt_enterprises_pool.json');
const poolJsPath = path.join(__dirname, '../crm/js/egypt_enterprises_pool.js');
const trackAPath = path.join(__dirname, '../scraper/output/track_a_verified_delta_b2b_fleet.json');

// 1. Read files
const existingComps = JSON.parse(fs.readFileSync(compsPath, 'utf8'));
const existingPool = JSON.parse(fs.readFileSync(poolJsonPath, 'utf8'));
const trackAComps = JSON.parse(fs.readFileSync(trackAPath, 'utf8'));

console.log(`Current companies.json:           ${existingComps.length}`);
console.log(`Current egypt_enterprises_pool.json: ${existingPool.length}`);
console.log(`Track A verified companies to add:   ${trackAComps.length}`);

// 2. Validate zero duplication
const existingIds = new Set(existingComps.map(c => c.id));
for (const tc of trackAComps) {
    if (existingIds.has(tc.id)) {
        throw new Error(`Duplicate ID detected: ${tc.id}`);
    }
}

// 3. Merge into companies.json
const newComps = existingComps.concat(trackAComps);
console.log(`New total companies.json:         ${newComps.length}`);

// 4. Merge into egypt_enterprises_pool.json
const newPool = existingPool.concat(trackAComps);
console.log(`New total egypt_enterprises_pool: ${newPool.length}`);

// 5. Write JSON files
fs.writeFileSync(compsPath, JSON.stringify(newComps, null, 2), 'utf8');
console.log(`Successfully updated ${compsPath}`);

fs.writeFileSync(poolJsonPath, JSON.stringify(newPool, null, 2), 'utf8');
console.log(`Successfully updated ${poolJsonPath}`);

// 6. Write JS file
const jsContent = `// Total Real Verified Enterprises in this pool: ${newPool.length} (plus 1,000 VIP Titans = ${newComps.length} Total)
// Auto-generated baseline dataset for Fleet CRM - Track A Delta Expansion 2026
window.EGYPT_ENTERPRISES_POOL = ${JSON.stringify(newPool)};
`;

fs.writeFileSync(poolJsPath, jsContent, 'utf8');
console.log(`Successfully updated ${poolJsPath}`);

console.log('\n=== MERGE COMPLETE & VERIFIED ===');
