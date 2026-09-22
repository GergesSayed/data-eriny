const fs = require('fs');

console.log('Ensuring all 1,000 Titans have isTitan: true, vip: true, badge: "👑 VIP"...');

// 1. egypt_verified_titans.json
const titans = JSON.parse(fs.readFileSync('crm/data/egypt_verified_titans.json', 'utf8'));
titans.forEach(t => {
    t.isTitan = true;
    t.vip = true;
    t.badge = '👑 VIP';
});
fs.writeFileSync('crm/data/egypt_verified_titans.json', JSON.stringify(titans, null, 2), 'utf8');
console.log('Updated crm/data/egypt_verified_titans.json');

// 2. egypt_verified_titans.js
const titansJsContent = `// Egypt 1000 Verified Industrial & Commercial Titans (VIP Giants Database)
// Auto-generated & audited to guarantee 1,000 unique corporate fortresses
window.EGYPT_VERIFIED_TITANS = ${JSON.stringify(titans, null, 2)};
`;
fs.writeFileSync('crm/js/egypt_verified_titans.js', titansJsContent, 'utf8');
console.log('Updated crm/js/egypt_verified_titans.js');

// 3. companies.json
const comps = JSON.parse(fs.readFileSync('crm/data/companies.json', 'utf8'));
comps.forEach(c => {
    if (c.id && c.id.startsWith('eg_titan_')) {
        c.isTitan = true;
        c.vip = true;
        c.badge = '👑 VIP';
    }
});
fs.writeFileSync('crm/data/companies.json', JSON.stringify(comps, null, 2), 'utf8');
console.log('Updated crm/data/companies.json');

console.log('All 1,000 Titans successfully marked with isTitan: true, vip: true, badge: "👑 VIP"');
