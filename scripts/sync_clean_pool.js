const fs = require('fs');

console.log('Loading clean companies.json...');
const companies = JSON.parse(fs.readFileSync('crm/data/companies.json', 'utf8'));

const poolComps = companies.filter(c => !c.id.startsWith('eg_titan_'));
console.log(`Extracted ${poolComps.length} pool companies.`);

if (poolComps.length !== 24928) {
    throw new Error(`Expected 24928 pool companies, got ${poolComps.length}`);
}

// 1. Write crm/data/egypt_enterprises_pool.json
console.log('Writing crm/data/egypt_enterprises_pool.json...');
fs.writeFileSync('crm/data/egypt_enterprises_pool.json', JSON.stringify(poolComps, null, 2), 'utf8');

// 2. Write crm/js/egypt_enterprises_pool.js
console.log('Writing crm/js/egypt_enterprises_pool.js...');
const poolJsContent = `// Auto-generated – do NOT edit by hand
// Audited & Cleaned v264.0 – 2026-09-22
// Total pool companies: 24928
(function() {
  var data = ${JSON.stringify(poolComps)};
  window.EGYPT_ENTERPRISES_POOL = data;
  window.__EGYPT_ENTERPRISE_POOL = data;
})();
`;
fs.writeFileSync('crm/js/egypt_enterprises_pool.js', poolJsContent, 'utf8');

console.log('Sync complete!');
