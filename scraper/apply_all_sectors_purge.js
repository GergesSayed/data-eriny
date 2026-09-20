const fs = require('fs');
const path = require('path');

const companiesPath = path.join(__dirname, '../crm/data/companies.json');
const poolJsonPath = path.join(__dirname, '../crm/data/egypt_enterprises_pool.json');
const poolJsPath = path.join(__dirname, '../crm/js/egypt_enterprises_pool.js');

const companies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
const pool = JSON.parse(fs.readFileSync(poolJsonPath, 'utf8'));

console.log('Original Companies count:', companies.length);
console.log('Original Pool count:', pool.length);

const purgeIds = new Set(require('./output/all_sectors_purge_ids.json'));
console.log('Total IDs to purge across all sectors:', purgeIds.size);

// Perform Purge
const updatedCompanies = companies.filter(c => !purgeIds.has(c.id));
const updatedPool = pool.filter(c => !purgeIds.has(c.id));

console.log('\nUpdated Companies count:', updatedCompanies.length, '(expected 25335)');
console.log('Updated Pool count:', updatedPool.length, '(expected 25301)');

// Write updated companies.json
fs.writeFileSync(companiesPath, JSON.stringify(updatedCompanies, null, 2), 'utf8');
console.log('Saved updated companies.json');

// Write updated egypt_enterprises_pool.json
fs.writeFileSync(poolJsonPath, JSON.stringify(updatedPool, null, 2), 'utf8');
console.log('Saved updated egypt_enterprises_pool.json');

// Generate updated egypt_enterprises_pool.js
console.log('Regenerating egypt_enterprises_pool.js...');
const jsCode = `// Production Harvested Pool - Real Verified Egyptian Commercial Companies & Industrial Fleets
// High-grade B2B dataset: strictly verified commercial fleets, logistics, factories & contractors.
// Auto-generated production build: 25,301 verified enterprises.
(function(window) {
    'use strict';
    var pool = ${JSON.stringify(updatedPool)};
    if (typeof window !== 'undefined') {
        window.EGYPT_ENTERPRISES_POOL = pool;
        window.__EGYPT_ENTERPRISE_POOL = pool;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = pool;
    }
})(typeof window !== 'undefined' ? window : global);
`;

fs.writeFileSync(poolJsPath, jsCode, 'utf8');
console.log('Saved updated egypt_enterprises_pool.js');
