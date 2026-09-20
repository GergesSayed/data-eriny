const fs = require('fs');
const path = require('path');

console.log('--- Applying Mall & Retail Cross-Sector Purge ---');

const companiesPath = path.join(__dirname, '../crm/data/companies.json');
const poolJsonPath = path.join(__dirname, '../crm/data/egypt_enterprises_pool.json');
const poolJsPath = path.join(__dirname, '../crm/js/egypt_enterprises_pool.js');
const purgeIdsPath = path.join(__dirname, 'output/mall_and_retail_purge_ids.json');

const companies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
const purgeIdsArray = JSON.parse(fs.readFileSync(purgeIdsPath, 'utf8'));
const purgeSet = new Set(purgeIdsArray);

console.log('Total companies before purge:', companies.length);
console.log('Total IDs marked for purge:', purgeSet.size);

// Safety assertions
const titansBefore = companies.filter(c => c.id && c.id.startsWith('eg_titan_'));
console.log('Titans before purge:', titansBefore.length);
if (titansBefore.length !== 34) {
    throw new Error(`Titans count anomaly: expected 34, found ${titansBefore.length}`);
}

const cleanedCompanies = companies.filter(c => !purgeSet.has(c.id));
console.log('Total companies after purge:', cleanedCompanies.length);

const titansAfter = cleanedCompanies.filter(c => c.id && c.id.startsWith('eg_titan_'));
if (titansAfter.length !== 34) {
    throw new Error(`Titans protection compromised! Expected 34, found ${titansAfter.length}`);
}

const poolOnly = cleanedCompanies.filter(c => !(c.id && c.id.startsWith('eg_titan_')));
console.log(`Verified Clean State -> Titans: ${titansAfter.length} | Pool: ${poolOnly.length} | Total: ${cleanedCompanies.length}`);

// 1. Write companies.json
fs.writeFileSync(companiesPath, JSON.stringify(cleanedCompanies, null, 2), 'utf8');
console.log('Updated crm/data/companies.json successfully.');

// 2. Write egypt_enterprises_pool.json
fs.writeFileSync(poolJsonPath, JSON.stringify(poolOnly, null, 2), 'utf8');
console.log('Updated crm/data/egypt_enterprises_pool.json successfully.');

// 3. Write egypt_enterprises_pool.js
const headerComment = `// Production Harvested Pool - Real Verified Egyptian Commercial Companies & Industrial Fleets
// High-grade B2B dataset: strictly verified commercial fleets, logistics, factories & contractors.
// Auto-generated production build: ${poolOnly.length.toLocaleString('en-US')} verified enterprises.
(function(window) {
    'use strict';
    var pool = ${JSON.stringify(poolOnly)};
    if (typeof window !== 'undefined') {
        window.EGYPT_ENTERPRISES_POOL = pool;
        window.__EGYPT_ENTERPRISE_POOL = pool;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = pool;
    }
})(typeof window !== 'undefined' ? window : global);
`;

fs.writeFileSync(poolJsPath, headerComment, 'utf8');
console.log('Updated crm/js/egypt_enterprises_pool.js successfully.');

console.log('--- Mall & Retail Cross-Sector Purge Completed Successfully! ---');
