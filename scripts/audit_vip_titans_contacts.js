const fs = require('fs');

const titansCode = fs.readFileSync('crm/js/egypt_verified_titans.js', 'utf8');
const titans = JSON.parse(titansCode.slice(titansCode.indexOf('['), titansCode.lastIndexOf(']') + 1));

console.log('Total VIP Titans:', titans.length);

const withHotline = titans.filter(t => t.hotline);
console.log('Titans with hotline:', withHotline.length);

const hotlineMap = new Map();
withHotline.forEach(t => {
  const h = t.hotline;
  if (!hotlineMap.has(h)) hotlineMap.set(h, []);
  hotlineMap.get(h).push(t.nameAr);
});

console.log('Unique hotlines count:', hotlineMap.size);

let multiCount = 0;
hotlineMap.forEach((companies, h) => {
  if (companies.length > 1) {
    multiCount++;
    console.log(`Hotline ${h} shared by ${companies.length} companies:`, companies.slice(0, 3));
  }
});
console.log('Hotlines shared by >1 company:', multiCount);

console.log('\nAll 1,000 Titans hotlines overview:');
const sample = [];
titans.forEach((t, idx) => {
  if (t.hotline) {
    sample.push({
      id: t.id,
      name: t.nameAr,
      hotline: t.hotline,
      phone1: t.phone1,
      website: t.website
    });
  }
});
console.log(`Total Titans with hotlines: ${sample.length}`);
console.log('First 40 Titans with hotlines:');
sample.slice(0, 40).forEach(s => {
  console.log(`${s.id} | ${s.hotline} | ${s.phone1 || 'no-landline'} | ${s.name} | ${s.website}`);
});
