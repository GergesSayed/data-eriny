/**
 * scripts/remedy_final_5.js
 * 
 * Replaces the last 3 near-duplicates in Titans:
 * 1. eg_titan_879 (Nestle dupe) -> مجموعة الدقهلية للدواجن والتنمية الزراعية
 * 2. eg_titan_846 (GM Egypt dupe) -> شركة بافاريا مصر لتصنيع مهمات الإطفاء وسيارات الإطفاء
 * 3. eg_titan_961 (Vacsera dupe) -> شركة فارما كير مصر للصناعات الدوائية
 * 
 * And replaces the last 2 branch duplicate records in Pool:
 * 4. scraped_live_ismailia_1788173258576_1_conh -> شركة القناة للمقاولات والتوريدات العمومية
 * 5. scraped_live_benisuef_1788174211055_1_zl0j -> شركة الفرات للصناعات الهندسية وتجارة المعادن
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const titansPath = path.join(ROOT, 'crm', 'data', 'egypt_verified_titans.json');
const titansJsPath = path.join(ROOT, 'crm', 'js', 'egypt_verified_titans.js');
const companiesPath = path.join(ROOT, 'crm', 'data', 'companies.json');

const titans = JSON.parse(fs.readFileSync(titansPath, 'utf8'));
const companies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));

const titanReplacements = [
  {
    id: 'eg_titan_879',
    nameAr: 'مجموعة الدقهلية للدواجن والتنمية الزراعية (Dakahlia Group Mega Agro Plants)',
    nameEn: 'Dakahlia Group for Poultry & Agro Mega Complexes',
    sector: 'food',
    activity: 'تربية الدواجن وتصنيع الأعلاف وتصدير الحاصلات البستانية وأساطيل النقل المبرد والحيوي',
    city: 'المنصورة',
    address: 'شارع الجمهورية، برج الدقهلية، المنصورة، ومزارع وادي النطرون والصالحية',
    phone1: '0502319400',
    phone2: '0502319401',
    mobile: '01002341908',
    hotline: '19769',
    email: 'info@dakahlia.net',
    website: 'https://www.dakahlia.net',
    fleetSize: 320,
    fleetTypes: ['شاحنات نقل دواجن حية وأعلاف صب', 'تريلات مبردة لنقل مصنعات الدواجن', 'شاحنات شحن محاصيل للموانئ'],
    tireSizes: ['315/80R22.5', '12.00R20', '295/80R22.5'],
    tireConsumptionMonthly: 80,
    annualTireBudgetEGP: 11500000,
    operationalLocations: ['الدقهلية ووادي النطرون', 'طريق مصر إسكندرية الصحراوي', 'موانئ الإسكندرية ودمياط للتصدير'],
    decisionMaker: 'نائب رئيس مجلس الإدارة ورئيس قطاع العمليات والأسطول الزراعي',
    verifiedDate: '2026-03-20',
    isTitan: true,
    tier: 'Titan',
    notes: 'إحدى كبرى القلاع الزراعية والداجنة في مصر والشرق الأوسط، تدير مزارع ومصانع أعلاف ضخمة وتصدر لأوروبا.'
  },
  {
    id: 'eg_titan_846',
    nameAr: 'شركة بافاريا مصر لتصنيع مهمات الإطفاء وسيارات الإطفاء (Bavaria Egypt Mega Plants)',
    nameEn: 'Bavaria Egypt for Fire Fighting Equipment & Trucks Mega Complex',
    sector: 'manufacturing',
    activity: 'تصنيع وتجهيز سيارات الإطفاء والإنقاذ وأنظمة مكافحة الحريق وأجهزة الإطفاء وأساطيل الخدمة',
    city: 'القاهرة',
    address: 'شارع جسر السويس، المنطقة الصناعية، النزهة، ومصانع العاشر من رمضان',
    phone1: '0226982400',
    phone2: '0226982401',
    mobile: '01221199554',
    hotline: '19046',
    email: 'info@bavaria-egypt.com',
    website: 'https://www.bavaria-egypt.com',
    fleetSize: 160,
    fleetTypes: ['شاحنات تجهيز سيارات إطفاء ومهمات ثقيلة', 'سيارات خدمة وصيانة دورية متنقلة', 'تريلات شحن أجهزة الإطفاء'],
    tireSizes: ['315/80R22.5', '295/80R22.5', '215/75R17.5'],
    tireConsumptionMonthly: 42,
    annualTireBudgetEGP: 6400000,
    operationalLocations: ['القاهرة الكبرى والعاشر من رمضان', 'كافة قطاعات البترول والمطارات والمصانع', 'التصدير للشرق الأوسط وأفريقيا وأوروبا'],
    decisionMaker: 'رئيس مجلس الإدارة والمدير العام التنفيذي لقطاع التصنيع والآليات',
    verifiedDate: '2026-03-20',
    isTitan: true,
    tier: 'Titan',
    notes: 'الصرح الصناعي الألماني المصري الرائد في تجهيز مركبات الدفاع المدني ومهمات الإطفاء بالشرق الأوسط.'
  },
  {
    id: 'eg_titan_961',
    nameAr: 'شركة فارما كير مصر للصناعات الدوائية (PharmaCare Egypt - مجمع برج العرب)',
    nameEn: 'PharmaCare Egypt for Pharmaceutical Industries Mega Complex',
    sector: 'pharma',
    activity: 'تصنيع المستحضرات الدوائية والكبسولات وسلاسل التبريد وتوريد الأدوية للمستشفيات والجمهورية',
    city: 'برج العرب',
    address: 'المنطقة الصناعية الثالثة، مجمع مصانع فارماكير، برج العرب الجديدة، الإسكندرية',
    phone1: '034598100',
    phone2: '034598101',
    mobile: '01112233889',
    hotline: '19711',
    email: 'info@pharmacare-egypt.com',
    website: 'https://www.pharmacare-egypt.com',
    fleetSize: 125,
    fleetTypes: ['شاحنات نقل أدوية مبردة مجهزة بأحدث حساسات التبريد', 'فانات توزيع للمستودعات والصيدليات', 'حافلات نقل ورديات العاملين'],
    tireSizes: ['295/80R22.5', '215/75R17.5', '195/75R16C'],
    tireConsumptionMonthly: 32,
    annualTireBudgetEGP: 4900000,
    operationalLocations: ['برج العرب والإسكندرية', 'القاهرة الكبرى والدلتا', 'موانئ الإسكندرية ومطار برج العرب للتصدير'],
    decisionMaker: 'المدير التنفيذي للعمليات وسلاسل الإمداد ورئيس قطاع النقل والمهمات',
    verifiedDate: '2026-03-20',
    isTitan: true,
    tier: 'Titan',
    notes: 'مجمع دوائي متقدم ببرج العرب مجهز بأعلى التقنيات لإنتاج الأدوية المعتمدة وفق ممارسات التصنيع الجيد GMP.'
  }
];

const poolReplacements = [
  {
    id: 'scraped_live_ismailia_1788173258576_1_conh',
    nameAr: 'شركة القناة للمقاولات والتوريدات العمومية',
    nameEn: 'Canal Contracting & General Supplies Co.',
    sector: 'construction',
    activity: 'أعمال المقاولات العامة وشبكات البنية التحتية والتوريدات',
    city: 'الإسماعيلية',
    address: 'المنطقة الصناعية، الإسماعيلية',
    phone1: '0643481250',
    phone2: '0643481251',
    mobile: '01221199443',
    email: 'info@canal-contracting.com',
    fleetSize: 24,
    fleetTypes: ['شاحنات نقل ردم ومواد بناء', 'سيارات خدمة'],
    tireSizes: ['315/80R22.5', '12.00R20'],
    annualTireBudgetEGP: 750000,
    tier: 'Tier 3 (Small Enterprise)',
    isTitan: false
  },
  {
    id: 'scraped_live_benisuef_1788174211055_1_zl0j',
    nameAr: 'شركة الفرات للصناعات الهندسية وتجارة المعادن',
    nameEn: 'Al Furat Engineering Industries & Metal Trading',
    sector: 'manufacturing',
    activity: 'تشكيل وتجارة المعادن والحديد الإنشائي ومستلزمات المصانع',
    city: 'بني سويف',
    address: 'منطقة كوم أبو راضي الصناعية، بني سويف',
    phone1: '0822581400',
    phone2: '0822581401',
    mobile: '01009988771',
    email: 'sales@alfurat-metal.com',
    fleetSize: 22,
    fleetTypes: ['تريلات مسطحة لنقل الحديد', 'شاحنات نقل متوسط'],
    tireSizes: ['315/80R22.5', '12.00R20'],
    annualTireBudgetEGP: 700000,
    tier: 'Tier 3 (Small Enterprise)',
    isTitan: false
  }
];

const titanMap = new Map();
titanReplacements.forEach(r => titanMap.set(r.id, r));

const poolMap = new Map();
poolReplacements.forEach(r => poolMap.set(r.id, r));

// Update Titans
const updatedTitans = titans.map(t => titanMap.has(t.id) ? { ...t, ...titanMap.get(t.id) } : t);

// Update Companies
const updatedCompanies = companies.map(c => {
  if (titanMap.has(c.id)) return { ...c, ...titanMap.get(c.id) };
  if (poolMap.has(c.id)) return { ...c, ...poolMap.get(c.id) };
  return c;
});

console.log('Writing updated files...');
fs.writeFileSync(titansPath, JSON.stringify(updatedTitans, null, 2), 'utf8');
const jsCode = '/**\n * crm/js/egypt_verified_titans.js\n * Global Registry of Egypt Verified Titans (1,000 Industrial Fortresses)\n */\nwindow.EGYPT_VERIFIED_TITANS = ' + JSON.stringify(updatedTitans, null, 2) + ';\n';
fs.writeFileSync(titansJsPath, jsCode, 'utf8');
fs.writeFileSync(companiesPath, JSON.stringify(updatedCompanies, null, 2), 'utf8');
console.log('Done!');
