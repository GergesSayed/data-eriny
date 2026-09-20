const fs = require('fs');
const path = require('path');

const companies = JSON.parse(fs.readFileSync(path.join(__dirname, '../crm/data/companies.json'), 'utf8'));
console.log('Total companies at start of 6th pass:', companies.length);

// Base 171 verified IDs from scraper/build_verified_sixth_pass.js
const basePurge = JSON.parse(fs.readFileSync(path.join(__dirname, 'output/verified_sixth_pass_purge.json'), 'utf8'));
const purgeMap = new Map();

basePurge.forEach(p => {
    purgeMap.set(p.id, p);
});

// Additional auto repair, accessories, private car shops, home AC & water filters
const additionalIds = [
    // 5 Car workshops & tuning
    'eg_b2b_fleet_25297', // السوري للحام الفايبر وتصليح الأكصدامات
    'eg_b2b_fleet_25733', // مركز بيبو لهندسة كهرباء السيارات الحديثة
    'eg_b2b_fleet_26276', // طيبة للزوايا والترصيص
    'eg_b2b_fleet_26309', // الهندسيه لتكييف السيارات
    'eg_b2b_fleet_26876', // العفيفي لكهرباء السيارات وشحن التكيف
    
    // 5 Car accessories & private brake repair
    'eg_b2b_fleet_25209', // Fwanes_ book لكماليات ونظم انارة السيارات
    'eg_b2b_fleet_25386', // الدبلوماسي لاكسسورات وكماليات السيارات والفاميه
    'eg_b2b_fleet_25710', // اوتو بلس لكماليات السيارات بمدينة 6 اكتوبر
    'eg_b2b_fleet_25990', // مشمش لكماليات السيارات والفنش وتعديل الفوانيس
    'eg_b2b_fleet_43185', // مركز خدمة فرامل عز الشافعي

    // Retail home AC, water filters, scrap AC buyers, car AC
    'eg_b2b_fleet_25743', // مركز كويل لتكييف وقطع غيار السيارات
    'eg_b2b_fleet_26136', // تأسيس مواسير التكييف on service
    'eg_b2b_fleet_26262', // شركة تكييف 6 اكتوبر - 01101120111
    'eg_b2b_fleet_25208', // تارجت للتكييف وفلاتر المياه
    'eg_b2b_fleet_29701', // شركة ابو كريمة لأعمال التكييف وفلاتر المياه
    'eg_b2b_fleet_32925', // افريقيا للتكييف وفلاتر المياه
    'eg_b2b_fleet_34875', // شركة الريس للتكييف وفلاتر المياة
    'eg_b2b_fleet_34243', // ارقام خدمة عملاء تكييف شارب الخط الساخن
    'eg_b2b_fleet_34412', // توكيل تكييف شارب و تورنيدو العربى فى القاهره
    'eg_b2b_fleet_28586', // المكتب الاستشاري لأعمال التكييف
    'eg_b2b_fleet_38831', // شركة الحمد لشراء التكييفات المستعملة
    'eg_b2b_fleet_41057', // شركة الحمد لشراء التكييفات
    'eg_b2b_fleet_41658', // مجدى اسماعيل للتكييف
    'eg_b2b_fleet_41772', // الغزاوى للتجارة والتكييف
    'eg_b2b_fleet_38155', // كول وان سنتر للتكييف
    'eg_b2b_fleet_38531', // سيتي اير للتكييف
    'eg_b2b_fleet_38497', // كوند اير للتكييف
    'eg_b2b_fleet_39135', // اير هاوس للتكييف
    'eg_b2b_fleet_38450', // للتكييف والتجارة AC Air
    'eg_b2b_fleet_38581', // شركة الناصف للتكييف و التجارة
    'eg_b2b_fleet_37942', // السعدني للتكييف والتجارة
    'eg_b2b_fleet_37988'  // الشركة المصرية للتكييف والتجارة بحلوان
];

additionalIds.forEach(id => {
    const c = companies.find(x => x.id === id);
    if (c) {
        purgeMap.set(id, { id: c.id, nameAr: c.nameAr, reason: 'Private Car Workshop / Accessories / Home AC / Scrap AC' });
    }
});

console.log('Total verified non-B2B entities to purge in 6th pass:', purgeMap.size);

const toPurgeList = Array.from(purgeMap.values());
const purgeIds = new Set(toPurgeList.map(p => p.id));

const cleanCompanies = companies.filter(c => !purgeIds.has(c.id));
console.log('Clean companies remaining:', cleanCompanies.length);

const titans = cleanCompanies.filter(c => c.id && c.id.startsWith('eg_titan_'));
const pool = cleanCompanies.filter(c => !(c.id && c.id.startsWith('eg_titan_')));
console.log(`Titans: ${titans.length} | Pool: ${pool.length}`);

// Save to disk
fs.writeFileSync(path.join(__dirname, '../crm/data/companies.json'), JSON.stringify(cleanCompanies, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, '../crm/data/egypt_enterprises_pool.json'), JSON.stringify(pool, null, 2), 'utf8');

const jsContent = 'window.EGYPT_ENTERPRISES_POOL = ' + JSON.stringify(pool) + ';\n';
fs.writeFileSync(path.join(__dirname, '../crm/js/egypt_enterprises_pool.js'), jsContent, 'utf8');

fs.writeFileSync(path.join(__dirname, 'output/sixth_pass_final_purged.json'), JSON.stringify(toPurgeList, null, 2));
console.log('Successfully executed 6th pass purge and updated files on disk!');
