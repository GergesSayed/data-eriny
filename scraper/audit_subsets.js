const fs = require('fs');
const comps = require('../crm/data/companies.json');

console.log('=== SECTOR & SUBSET AUDIT ===');

// 1. Renewable Energy (1)
console.log('\n--- Renewable Energy ---');
comps.filter(c => c.sector === 'renewable_energy').forEach(c => {
    console.log(`[${c.id}] ${c.nameAr || c.name} | ${c.city} | ${c.address}`);
});

// 2. Packaging Paper (8)
console.log('\n--- Packaging Paper (8) ---');
comps.filter(c => c.sector === 'packaging_paper').forEach(c => {
    console.log(`[${c.id}] ${c.nameAr || c.name} | ${c.city} | ${c.address}`);
});

// 3. Concrete (8)
console.log('\n--- Concrete (8) ---');
comps.filter(c => c.sector === 'concrete').forEach(c => {
    console.log(`[${c.id}] ${c.nameAr || c.name} | ${c.city} | ${c.address}`);
});

// 4. Textile Apparel (46)
console.log('\n--- Textile Apparel (sample) ---');
comps.filter(c => c.sector === 'textile_apparel').slice(0, 10).forEach(c => {
    console.log(`[${c.id}] ${c.nameAr || c.name} | ${c.city} | ${c.address}`);
});

// 5. Chemicals Plastic (81)
console.log('\n--- Chemicals Plastic (sample) ---');
comps.filter(c => c.sector === 'chemicals_plastic').slice(0, 10).forEach(c => {
    console.log(`[${c.id}] ${c.nameAr || c.name} | ${c.city} | ${c.address}`);
});

// 6. Remaining Census Records (44)
console.log('\n--- Remaining Census Records (44) ---');
const census = comps.filter(c => c.notes && c.notes.includes('مسح جغرافي'));
console.log(`Total census records remaining: ${census.length}`);
census.forEach(c => {
    console.log(`[${c.id}] ${c.nameAr || c.name} | ${c.sector} | ${c.address}`);
});
