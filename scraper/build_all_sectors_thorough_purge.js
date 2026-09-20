const fs = require('fs');
const comps = require('../crm/data/companies.json');
const pool = require('../crm/data/egypt_enterprises_pool.json');

console.log('Total companies before cross-sector purge:', comps.length);

function isProtectedTitanOrGiant(c) {
    if (c.id && c.id.startsWith('eg_titan_')) return true;
    const text = ((c.nameAr || '') + ' ' + (c.nameEn || '')).toLowerCase();

    // Giants
    if (/gipsina|sina gips|duravit|electrolux|cleopatra|oriental weavers|totalenergies|elsewedy|kandil steel|egypt aluminium|alpla 10th|friday ice cream|startex|solex|soven|unipack|rich bake|halwani|جهينة|دومتي|إيديتا|بيتي|شيبسي|عبور لاند|حديد عز|السويدي|لافارج|سيمكس|بتروجيت|المقاولون العرب|أوراسكوم|حسن علام|redcon|novartis|unilever|gac egypt/i.test(text)) return true;
    if (c.id === 'eg_b2b_fleet_36999' || c.id === 'eg_b2b_fleet_41215') return true;
    if (/مراتب تاكى|taki|حورس للتهويه الصناعيه|مصنع قادر للصناعات المتطورة/i.test(text)) return true;
    return false;
}

// 1. Identify all census street-level POIs across all sectors
// Protection list for genuine large factories/contractors in census:
const protectedCensusIds = new Set([
    // From manufacturing:
    'eg_b2b_fleet_41215', 'eg_b2b_fleet_38808', 'eg_b2b_fleet_41480', 'eg_b2b_fleet_36999',
    'eg_b2b_fleet_39034', 'eg_b2b_fleet_42469', 'eg_b2b_fleet_27129', 'eg_b2b_fleet_27290',
    'eg_b2b_fleet_27084', 'eg_b2b_fleet_26999', 'eg_b2b_fleet_31787', 'eg_b2b_fleet_30875',
    'eg_b2b_fleet_34376', 'eg_b2b_fleet_27072', 'eg_b2b_fleet_27127', 'eg_b2b_fleet_27017',
    'eg_b2b_fleet_27042', 'eg_b2b_fleet_29904', 'eg_b2b_fleet_30687', 'eg_b2b_fleet_41464',
    'eg_b2b_fleet_27244', 'eg_b2b_fleet_27250', 'eg_b2b_fleet_30699', 'eg_b2b_fleet_29734',
    'eg_b2b_fleet_27950', 'eg_b2b_fleet_41706', 'eg_b2b_fleet_42065',
    // Major national contractors & shipping giants in census:
    'eg_b2b_fleet_36716', // المقاولون العرب
    'eg_b2b_fleet_27441', // Redcon Construction
    'eg_b2b_fleet_27484', // GAC Egypt
    'eg_b2b_fleet_27625', // Novartis Pharma
    'eg_b2b_fleet_40975', // Unilever Mashreq
    'eg_b2b_fleet_40820'  // حديد عز
]);

const purgeIds = new Set();
const purgeDetails = [];

// Filter 1: Census street-level POIs (keep ONLY the verified heavy plants / giants)
comps.forEach(c => {
    if (c.notes && c.notes.includes('مسح جغرافي')) {
        if (!protectedCensusIds.has(c.id) && !isProtectedTitanOrGiant(c)) {
            // Check if it is a verified factory with heavy plant equipment
            const name = (c.nameAr || c.name || '').trim();
            const isHeavyFactory = /^مصنع\s+كرتون|^مصنع\s+طوب|^مصنع\s+رخام|^مصنع\s+بلاستيك|^مسبك\s+/i.test(name);
            if (!isHeavyFactory) {
                purgeIds.add(c.id);
                purgeDetails.push({
                    id: c.id,
                    name: c.nameAr || c.nameEn,
                    sector: c.sector,
                    reason: 'census_street_poi',
                    address: c.address
                });
            }
        }
    }
});

// Filter 2: Non-census residential flats, shops, and micro workshops
const residentialAndShopRegex = /شقة \d+|شقه \d+|الدور الأول علوي - شقة|الدور الثاني - شقة|الدور الثالث - شقة|الدور الرابع - شقة|الدور الخامس - شقة|محل رقم \d+|محل \d+|بجوار سوبر ماركت بيم|أولادالكوز|تكسير والتشوين|شريك العمر|موازين|بسكول|sror for tools|the mechanic|ستار تولز|swimming tools/i;

comps.forEach(c => {
    if (isProtectedTitanOrGiant(c) || purgeIds.has(c.id)) return;
    const text = ((c.nameAr || '') + ' ' + (c.nameEn || '') + ' ' + (c.address || '')).toLowerCase();
    if (residentialAndShopRegex.test(text)) {
        // Exclude industrial city addresses
        if (/المنطقة الصناعية|قطعة رقم|مدينة العاشر|مدينة 6 اكتوبر|مدينة السادات|مدينة برج العرب/i.test(c.address || '')) {
            // If it's a factory in the industrial zone, keep it unless it explicitly says flat/shop
            if (!/شقة \d+|شقه \d+|محل رقم/i.test(text)) return;
        }
        purgeIds.add(c.id);
        purgeDetails.push({
            id: c.id,
            name: c.nameAr || c.nameEn,
            sector: c.sector,
            reason: 'residential_flat_or_shop',
            address: c.address
        });
    }
});

console.log('Total entities flagged for purge across all sectors:', purgeIds.size);

const sectorPurged = {};
purgeDetails.forEach(p => {
    sectorPurged[p.sector] = (sectorPurged[p.sector] || 0) + 1;
});

console.log('\nPurged Entities Breakdown by Sector:');
Object.entries(sectorPurged).sort((a,b) => b[1] - a[1]).forEach(([s, c]) => console.log(`- ${s}: ${c}`));

// Simulation of remaining counts
const updatedComps = comps.filter(c => !purgeIds.has(c.id));
const updatedPool = pool.filter(c => !purgeIds.has(c.id));

console.log('\n--- Simulation Summary ---');
console.log('Companies: ' + comps.length + ' -> ' + updatedComps.length);
console.log('Pool: ' + pool.length + ' -> ' + updatedPool.length);

const sectorRemaining = {};
updatedComps.forEach(c => {
    sectorRemaining[c.sector] = (sectorRemaining[c.sector] || 0) + 1;
});
console.log('\nRemaining Companies by Sector:');
Object.entries(sectorRemaining).sort((a,b) => b[1] - a[1]).forEach(([s, c]) => console.log(`- ${s}: ${c}`));

fs.writeFileSync('./scraper/output/all_sectors_purge_ids.json', JSON.stringify(Array.from(purgeIds), null, 2));
fs.writeFileSync('./scraper/output/all_sectors_purge_details.json', JSON.stringify(purgeDetails, null, 2));
