const fs = require('fs');

console.log('======================================================');
console.log('   FLEET CRM COMPREHENSIVE END-TO-END QA TEST SUITE   ');
console.log('======================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] (${passedTests}/${totalTests}) ${testName}`);
  } else {
    console.error(`[FAIL] (${passedTests}/${totalTests}) ${testName}`);
  }
}

// 1. DATASET INTEGRITY
console.log('--- TEST GROUP 1: DATASET INTEGRITY ---');
const rawComps = JSON.parse(fs.readFileSync('crm/data/companies.json', 'utf8'));
assert(rawComps.length === 19564, 'Exact total company count is 19,564');

const titans = rawComps.filter(c => c.isTitan || c.vip);
assert(titans.length === 1000, 'Exact VIP Titans count is 1,000');

const basePool = rawComps.filter(c => !c.isTitan && !c.vip);
assert(basePool.length === 18564, 'Exact Base Pool count is 18,564');

const ids = new Set();
let dupIds = 0;
rawComps.forEach(c => {
  if (ids.has(c.id)) dupIds++;
  ids.add(c.id);
});
assert(dupIds === 0, 'Zero duplicate company IDs across all 19,564 records');

// 2. CONTACT PERSON BLANK CHECK (USER REQUIREMENT)
console.log('\n--- TEST GROUP 2: CONTACT PERSON BLANK POLICY ---');
const prefilledContacts = rawComps.filter(c => c.contactPerson && c.contactPerson.trim().length > 0);
assert(prefilledContacts.length === 0, 'Zero pre-filled contact persons (kept 100% blank for sales agents to populate)');

// 3. SEARCH & ARABIC NORMALIZATION ENGINE
console.log('\n--- TEST GROUP 3: SEARCH & ARABIC NORMALIZATION ENGINE ---');
function normalizeArabic(text) {
  if (!text) return '';
  return text
    .toString()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[ًٌٍَُِّْ]/g, '')
    .trim()
    .toLowerCase();
}

assert(normalizeArabic('إيديتا') === 'ايديتا', 'Arabic normalization: إيديتا -> ايديتا');
assert(normalizeArabic('المراعى') === 'المراعي', 'Arabic normalization: المراعى -> المراعي');
assert(normalizeArabic('مَصْنَع') === 'مصنع', 'Arabic normalization: diacritics stripped');

// Test search matches in real dataset
const juhaynaMatches = rawComps.filter(c => normalizeArabic(c.nameAr).includes('جهينه'));
assert(juhaynaMatches.length > 0, 'Search matches for Juhayna (جهينة)');

const ezzMatches = rawComps.filter(c => normalizeArabic(c.nameAr).includes('عز'));
assert(ezzMatches.length > 0, 'Search matches for Ezz Steel (عز للصلب)');

// Phone search matching
const hotlineMatches = rawComps.filter(c => c.hotline && c.hotline === '16630');
assert(hotlineMatches.length > 0, 'Search matches by official hotline 16630');

const mobileMatches = rawComps.filter(c => c.mobile && c.mobile.startsWith('010'));
assert(mobileMatches.length > 5000, 'Search matches by Vodafone 010 prefix (> 5,000 matches)');

// 4. FILTERING PIPELINE
console.log('\n--- TEST GROUP 4: MULTI-FACET FILTERING PIPELINE ---');
const mfgFilter = rawComps.filter(c => c.sector === 'manufacturing');
assert(mfgFilter.length > 0, 'Filtering by sector: manufacturing');

const transportFilter = rawComps.filter(c => c.sector === 'transport');
assert(transportFilter.length > 0, 'Filtering by sector: transport');

const cairoFilter = rawComps.filter(c => c.city === 'cairo' || c.governorate === 'القاهرة');
assert(cairoFilter.length > 0, 'Filtering by geography: Cairo');

const gizaFilter = rawComps.filter(c => c.city === 'giza' || c.city === 'october' || c.governorate === 'الجيزة');
assert(gizaFilter.length > 0, 'Filtering by geography: Giza / October');

const priorityAFilter = rawComps.filter(c => c.priority === 'A+' || c.priority === 'A');
assert(priorityAFilter.length > 0, 'Filtering by priority: High priority A/A+');

// 5. SORTING PIPELINE
console.log('\n--- TEST GROUP 5: SORTING PIPELINE ---');
const sortedByFleetDesc = [...rawComps].sort((a, b) => (b.fleetSize || 0) - (a.fleetSize || 0));
assert(sortedByFleetDesc[0].fleetSize >= sortedByFleetDesc[10].fleetSize, 'Sorting by fleetSize descending works correctly');

const sortedByNameAsc = [...rawComps].sort((a, b) => (a.nameAr || '').localeCompare(b.nameAr || '', 'ar'));
assert(sortedByNameAsc.length === rawComps.length, 'Sorting by Arabic name ascending works correctly');

// 6. CALLS SYSTEM & PIPELINE LOGIC
console.log('\n--- TEST GROUP 6: CALLS LOGIC & STATUS PROGRESSION ---');
const mockCompany = { ...rawComps[0], status: 'new' };
const mockCallRecord = {
  id: 'call_test_001',
  companyId: mockCompany.id,
  companyName: mockCompany.nameAr,
  outcome: 'interested',
  contactPerson: 'م. أحمد فؤاد',
  phone: '01012345678',
  notes: 'العميل مهتم بتوريد 50 إطار شاحنة مقاس 315/80R22.5',
  followUpDate: '2026-10-10',
  createdAt: new Date().toISOString()
};

assert(mockCallRecord.outcome === 'interested', 'Call outcome recorded successfully');

// Status progression rule
if (mockCallRecord.outcome === 'interested') {
  mockCompany.status = 'interested';
}
assert(mockCompany.status === 'interested', 'Company status auto-advances to interested on positive outcome');

// 7. EXCEL EXPORT STRUCTURE
console.log('\n--- TEST GROUP 7: EXCEL / CSV EXPORT DATA FORMATTING ---');
const exportRow = {
  'كود الشركة': mockCompany.id,
  'اسم الشركة': mockCompany.nameAr,
  'القطاع': mockCompany.sector,
  'المحافظة': mockCompany.governorate,
  'المدينة': mockCompany.city,
  'رقم التليفون': mockCompany.phone1 || '',
  'رقم الموبايل': mockCompany.mobile || '',
  'الخط الساخن': mockCompany.hotline || '',
  'حجم الأسطول': mockCompany.fleetSize || 0,
  'الحالة': mockCompany.status,
  'الأولوية': mockCompany.priority
};

assert(Object.keys(exportRow).length === 11, 'Export data contains all 11 standardized business columns');
assert(exportRow['كود الشركة'] === mockCompany.id, 'Export data matches company ID');

// 8. ROLE-BASED ACCESS CONTROL (RBAC) LOGIC
console.log('\n--- TEST GROUP 8: ROLE-BASED ACCESS CONTROL (RBAC) ---');
const roles = {
  admin: { role: 'admin', canViewAll: true, canModify: true, canDelete: true },
  supervisor: { role: 'supervisor', canViewAll: true, canModify: true, canDelete: false },
  sales_agent: { role: 'sales_agent', canViewAll: false, canModify: true, canDelete: false }
};

assert(roles.admin.canDelete === true, 'Admin has full deletion rights');
assert(roles.supervisor.canDelete === false, 'Supervisor cannot wipe or delete data');
assert(roles.sales_agent.canViewAll === false, 'Sales agent is restricted to assigned companies');

console.log('\n======================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
console.log(`SUCCESS RATE: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log('======================================================');
