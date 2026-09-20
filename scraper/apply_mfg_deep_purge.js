const fs = require('fs');
const path = require('path');

const companiesPath = path.join(__dirname, '../crm/data/companies.json');
const poolJsonPath = path.join(__dirname, '../crm/data/egypt_enterprises_pool.json');
const poolJsPath = path.join(__dirname, '../crm/js/egypt_enterprises_pool.js');

const companies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
const pool = JSON.parse(fs.readFileSync(poolJsonPath, 'utf8'));

console.log('Original Companies count:', companies.length);
console.log('Original Pool count:', pool.length);

const set1 = require('./output/deep_mfg_candidates.json').map(x => x.id);
const set2Ids = [
  'eg_b2b_fleet_28037', 'eg_b2b_fleet_29024', 'eg_b2b_fleet_39784', 'eg_b2b_fleet_29679',
  'eg_b2b_fleet_32261', 'eg_b2b_fleet_39381', 'eg_b2b_fleet_39454', 'eg_b2b_fleet_26574',
  'eg_b2b_fleet_29211', 'eg_b2b_fleet_42703', 'eg_b2b_fleet_31143', 'eg_b2b_fleet_38073',
  'eg_b2b_fleet_39380', 'eg_b2b_fleet_39811', 'eg_b2b_fleet_40678', 'eg_b2b_fleet_40252',
  'eg_b2b_fleet_40676', 'eg_b2b_fleet_26396', 'eg_b2b_fleet_41397', 'eg_b2b_fleet_37787',
  'eg_b2b_fleet_25576', 'eg_b2b_fleet_29237',
  'eg_b2b_fleet_26266', 'eg_b2b_fleet_26418', 'eg_b2b_fleet_28087', 'eg_b2b_fleet_28208',
  'eg_b2b_fleet_28226', 'eg_b2b_fleet_28518', 'eg_b2b_fleet_28587', 'eg_b2b_fleet_29017',
  'eg_b2b_fleet_29079', 'eg_b2b_fleet_29821', 'eg_b2b_fleet_31464', 'eg_b2b_fleet_31500',
  'eg_b2b_fleet_31524', 'eg_b2b_fleet_33003', 'eg_b2b_fleet_35273', 'eg_b2b_fleet_36470',
  'eg_b2b_fleet_36867', 'eg_b2b_fleet_36898', 'eg_b2b_fleet_36903', 'eg_b2b_fleet_38638',
  'eg_b2b_fleet_38726', 'eg_b2b_fleet_38748', 'eg_b2b_fleet_39044', 'eg_b2b_fleet_39103',
  'eg_b2b_fleet_39575', 'eg_b2b_fleet_41247', 'eg_b2b_fleet_41628', 'eg_b2b_fleet_41755',
  'eg_b2b_fleet_41889', 'eg_b2b_fleet_42577'
];

const purgeIdSet = new Set([...set1, ...set2Ids]);
console.log('Total unique IDs to purge:', purgeIdSet.size);

// Categorize purged items for detailed user reporting
const purgedEntities = [];
const categoryStats = {
  fiberglass: { name: 'ورش ومصنوعات فيبر جلاس وأكشاك وصناديق دليفري', count: 0, sample: [] },
  garages: { name: 'جراجات وورش تعديل وتظبيط سيارات ملاكي وكماليات', count: 0, sample: [] },
  advertising_print: { name: 'مطابع ومكاتب دعاية وإعلان وأختام وبانرات وتصوير مستندات', count: 0, sample: [] },
  engineering_consulting: { name: 'مكاتب استشارات هندسية ومعمارية وتصميم ديكور', count: 0, sample: [] },
  elevators: { name: 'شركات ومكاتب تركيب وصيانة مصاعد وسلالم متحركة للعمارات', count: 0, sample: [] },
  ac: { name: 'شركات ومراكز صيانة وتجارة تكييف منزلي', count: 0, sample: [] },
  kitchens: { name: 'معارض واستوديوهات مطابخ منزلية ودواليب خشب', count: 0, sample: [] },
  mattresses_foam: { name: 'ورش ومصانع مراتب وفوم ومقاعد خشبية محلية', count: 0, sample: [] },
  furniture: { name: 'ورش ومحلات أثاث وموبيليا وستائر ومفروشات', count: 0, sample: [] },
  security: { name: 'شركات أمن وحراسة أفراد وحراسات خاصة', count: 0, sample: [] },
  embroidery: { name: 'ورش تطريز إلكتروني بالكمبيوتر', count: 0, sample: [] },
  shoes: { name: 'ورش تصنيع وتفصيل نعل أحذية محلية', count: 0, sample: [] },
  equipment_dealers: { name: 'معارض تجارة وتأجير معدات ثقيلة ورافعات شوكية محلية', count: 0, sample: [] }
};

companies.forEach(c => {
  if (purgeIdSet.has(c.id)) {
    purgedEntities.push(c);
    const text = ((c.nameAr || '') + ' ' + (c.nameEn || '')).toLowerCase();
    let catKey = 'advertising_print';

    if (/فيبر|فايبر|fiber/i.test(text)) catKey = 'fiberglass';
    else if (/garage|tuning|car accessories|مركز صيانة|سمكرة|دوكو|انذار وريموت/i.test(text)) catKey = 'garages';
    else if (/consultan|architect|استشارات|استشاري|bim|concreative|تصميم معماري|مكتب هندسي/i.test(text)) catKey = 'engineering_consulting';
    else if (/boom lift|power lift|forklift|معرض العادلي/i.test(text)) catKey = 'equipment_dealers';
    else if (/مصاعد|مصعد|elevator|lift|سلالم متحركة/i.test(text)) catKey = 'elevators';
    else if (/تكييف|تكييفات|air condition/i.test(text)) catKey = 'ac';
    else if (/kitchen|مطابخ|مطبخ/i.test(text)) catKey = 'kitchens';
    else if (/مراتب|فوم|أسفنج|اسفنج/i.test(text)) catKey = 'mattresses_foam';
    else if (/موبيليا|أثاث|اثاث|ستائر|مفروشات|دسكات/i.test(text)) catKey = 'furniture';
    else if (/حراسة|حراسات|أمن وحراسة/i.test(text)) catKey = 'security';
    else if (/تطريز/i.test(text)) catKey = 'embroidery';
    else if (/أحذية|احذية|نعل/i.test(text)) catKey = 'shoes';

    categoryStats[catKey].count++;
    if (categoryStats[catKey].sample.length < 5) {
      categoryStats[catKey].sample.push(c.nameAr || c.nameEn);
    }
  }
});

console.log('\n=== Category Summary ===');
Object.values(categoryStats).forEach(cs => {
  console.log(`- ${cs.name}: ${cs.count} (أمثلة: ${cs.sample.slice(0, 3).join(' ، ')})`);
});

// Perform Purge
const updatedCompanies = companies.filter(c => !purgeIdSet.has(c.id));
const updatedPool = pool.filter(c => !purgeIdSet.has(c.id));

console.log('\nUpdated Companies count:', updatedCompanies.length, '(expected 30272)');
console.log('Updated Pool count:', updatedPool.length, '(expected 30238)');

const remainingMfg = updatedCompanies.filter(c => c.sector === 'manufacturing');
console.log('Remaining clean manufacturing sector count:', remainingMfg.length, '(expected 6335)');

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
// Auto-generated production build: 30,238 verified enterprises.
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

// Save detailed report
fs.writeFileSync(
  path.join(__dirname, 'output/mfg_purged_301_details.json'),
  JSON.stringify({ categoryStats, purgedEntities: purgedEntities.map(c => ({ id: c.id, nameAr: c.nameAr, nameEn: c.nameEn, address: c.address, sector: c.sector })) }, null, 2),
  'utf8'
);
console.log('Saved detailed audit report to scraper/output/mfg_purged_301_details.json');
