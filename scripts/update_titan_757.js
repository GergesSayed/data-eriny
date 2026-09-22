const fs = require('fs');

const petrogas = {
    id: 'eg_titan_757',
    nameAr: 'شركة الغازات البترولية (بتروجاس - Petrogas)',
    nameEn: 'Petroleum Gases Company (Petrogas)',
    sector: 'petroleum',
    city: 'cairo',
    address: 'شارع الألفي، عمارة الثورة، وسط البلد / المقطم، القاهرة',
    phone1: '0225752390',
    phone2: '0225752405',
    mobile: '01001859201',
    hotline: '19902',
    email: 'info@petrogas.com.eg',
    website: 'https://www.petrogas.com.eg',
    contactPerson: 'قطاع النقل والأسطول وتوزيع أسطوانات الغاز والصب',
    fleetSize: 185,
    truckTypes: ['سيارات صهريجية لنقل البوتاجاز الصب (LPG Tankers)', 'شاحنات نقل أسطوانات الغاز الثقيلة', 'سيارات خدمة وتوزيع سريعة'],
    priority: 'high',
    notes: 'إحدى كبرى قلاع قطاع البترول المصري التابعة للهيئة المصرية العامة للبترول، مسؤولة عن تعبئة ونقل وتوزيع غاز البوتاجاز بكافة محافظات الجمهورية بأكبر أسطول صهاريج وشاحنات متخصصة.',
    vip: true,
    isTitan: true,
    badge: '👑 VIP'
};

// 1. Update egypt_verified_titans.json
const titansJson = JSON.parse(fs.readFileSync('crm/data/egypt_verified_titans.json', 'utf8'));
const titanIdx = titansJson.findIndex(t => t.id === 'eg_titan_757');
if (titanIdx !== -1) {
    titansJson[titanIdx] = { ...titansJson[titanIdx], ...petrogas };
    fs.writeFileSync('crm/data/egypt_verified_titans.json', JSON.stringify(titansJson, null, 2), 'utf8');
    console.log('Updated egypt_verified_titans.json');
}

// 2. Update egypt_verified_titans.js
const titansJsContent = `// Egypt 1000 Verified Industrial & Commercial Titans (VIP Giants Database)
// Auto-generated & audited to guarantee 1,000 unique corporate fortresses
window.EGYPT_VERIFIED_TITANS = ${JSON.stringify(titansJson, null, 2)};
`;
fs.writeFileSync('crm/js/egypt_verified_titans.js', titansJsContent, 'utf8');
console.log('Updated egypt_verified_titans.js');

// 3. Update companies.json
const compsJson = JSON.parse(fs.readFileSync('crm/data/companies.json', 'utf8'));
const compIdx = compsJson.findIndex(c => c.id === 'eg_titan_757');
if (compIdx !== -1) {
    compsJson[compIdx] = { ...compsJson[compIdx], ...petrogas };
    fs.writeFileSync('crm/data/companies.json', JSON.stringify(compsJson, null, 2), 'utf8');
    console.log('Updated companies.json');
}
