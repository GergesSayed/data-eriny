const fs = require('fs');

const titansCode = fs.readFileSync('crm/js/egypt_verified_titans.js', 'utf8');
const titans = JSON.parse(titansCode.slice(titansCode.indexOf('['), titansCode.lastIndexOf(']') + 1));

console.log('Total Titans:', titans.length);

let withHotline = 0;
let withLandline = 0;
let withMobile = 0;
let withWebsite = 0;
let withMaps = 0;

const landlines = [];
const hotlines = [];

titans.forEach(t => {
  if (t.hotline) {
    withHotline++;
    hotlines.push({ id: t.id, name: t.nameAr, hotline: t.hotline });
  }
  if (t.phone1) {
    withLandline++;
    landlines.push({ id: t.id, name: t.nameAr, phone1: t.phone1 });
  }
  if (t.mobile) withMobile++;
  if (t.website) withWebsite++;
  if (t.google_maps_url) withMaps++;
});

console.log('With Hotline:', withHotline);
console.log('With Landline (phone1):', withLandline);
console.log('With Mobile:', withMobile);
console.log('With Website:', withWebsite);
console.log('With Maps:', withMaps);

// Check landline patterns
const landlinePrefixes = {};
landlines.forEach(l => {
  const p = l.phone1.slice(0, 3);
  landlinePrefixes[p] = (landlinePrefixes[p] || 0) + 1;
});
console.log('\nLandline prefixes:', landlinePrefixes);

// Check if landlines end in round zeros (like 0228131000, 0238331100, 0235370200)
let roundZeros = 0;
landlines.forEach(l => {
  if (l.phone1.endsWith('000') || l.phone1.endsWith('500') || l.phone1.endsWith('100')) {
    roundZeros++;
  }
});
console.log('Landlines ending in 000/500/100:', roundZeros, 'out of', landlines.length);

// Check hotlines distribution (15xxx, 16xxx, 19xxx)
const hotlinePrefixes = {};
hotlines.forEach(h => {
  const p = h.hotline.slice(0, 2);
  hotlinePrefixes[p] = (hotlinePrefixes[p] || 0) + 1;
});
console.log('\nHotline prefixes:', hotlinePrefixes);
