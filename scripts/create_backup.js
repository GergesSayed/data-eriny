const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const rootDir = path.join(__dirname, '..');
const backupDirName = `companies_backup_v254_2026-09-20`;
const backupDir = path.join(rootDir, 'backups', backupDirName);
const latestDir = path.join(rootDir, 'backups', 'latest');

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}
if (!fs.existsSync(latestDir)) {
    fs.mkdirSync(latestDir, { recursive: true });
}

console.log(`Creating Master Enterprise Backup at: ${backupDir}`);

// 1. Source files paths
const companiesJsonPath = path.join(rootDir, 'crm/data/companies.json');
const titansJsonPath = path.join(rootDir, 'crm/data/egypt_verified_titans.json');
const poolJsonPath = path.join(rootDir, 'crm/data/egypt_enterprises_pool.json');
const poolJsPath = path.join(rootDir, 'crm/js/egypt_enterprises_pool.js');
const titansJsPath = path.join(rootDir, 'crm/js/egypt_verified_titans.js');

// 2. Load and verify
const companies = JSON.parse(fs.readFileSync(companiesJsonPath, 'utf8'));
const titans = JSON.parse(fs.readFileSync(titansJsonPath, 'utf8'));
const pool = JSON.parse(fs.readFileSync(poolJsonPath, 'utf8'));
const poolJs = fs.readFileSync(poolJsPath, 'utf8');
const titansJs = fs.readFileSync(titansJsPath, 'utf8');

console.log(`Loaded: Companies (${companies.length}), Titans (${titans.length}), Pool (${pool.length})`);

// 3. Save direct JSON and JS copies in backupDir and latestDir
fs.writeFileSync(path.join(backupDir, `companies_master_${companies.length}.json`), JSON.stringify(companies, null, 2), 'utf8');
fs.writeFileSync(path.join(latestDir, `companies_master_latest.json`), JSON.stringify(companies, null, 2), 'utf8');
fs.writeFileSync(path.join(latestDir, `companies_master_${companies.length}.json`), JSON.stringify(companies, null, 2), 'utf8');

fs.writeFileSync(path.join(backupDir, `egypt_verified_titans_${titans.length}.json`), JSON.stringify(titans, null, 2), 'utf8');
fs.writeFileSync(path.join(latestDir, `egypt_verified_titans_${titans.length}.json`), JSON.stringify(titans, null, 2), 'utf8');

fs.writeFileSync(path.join(backupDir, `egypt_enterprises_pool_${pool.length}.json`), JSON.stringify(pool, null, 2), 'utf8');
fs.writeFileSync(path.join(latestDir, `egypt_enterprises_pool_${pool.length}.json`), JSON.stringify(pool, null, 2), 'utf8');

fs.writeFileSync(path.join(backupDir, 'egypt_enterprises_pool.js'), poolJs, 'utf8');
fs.writeFileSync(path.join(latestDir, 'egypt_enterprises_pool.js'), poolJs, 'utf8');

fs.writeFileSync(path.join(backupDir, 'egypt_verified_titans.js'), titansJs, 'utf8');
fs.writeFileSync(path.join(latestDir, 'egypt_verified_titans.js'), titansJs, 'utf8');

console.log('JSON & JS backup files successfully written.');

// 4. Generate CSV with UTF-8 BOM for seamless Excel compatibility
function cleanCsvValue(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
    return `"${str}"`;
}

const csvHeaders = [
    'المعرف (ID)',
    'اسم الشركة / المصنع بالعربي',
    'اسم المنشأة بالإنجليزي',
    'القطاع الصناعي / التجاري',
    'المدينة / المنطقة الصناعية',
    'المحافظة',
    'العنوان التفصيلي',
    'الهاتف الرئيسي',
    'هاتف إضافي',
    'الموبايل',
    'هواتف أخرى',
    'الموقع الإلكتروني',
    'رابط خرائط جوجل',
    'خط العرض',
    'خط الطول',
    'حجم الأسطول التقديري (شاحنات وسيارات)',
    'نوع الأسطول واستخداماته',
    'الأولوية البيعية',
    'درجة العميل المتوقع (Lead Score)',
    'الحالة',
    'المسؤول عن الحساب',
    'اسم الشخص المسؤول للتواصل',
    'المسمى الوظيفي للمسؤول',
    'ملاحظات وتوثيق السجل',
    'تاريخ التسجيل بالسيستم',
    'آخر تحديث'
];

const csvRows = [csvHeaders.join(',')];

companies.forEach(c => {
    const row = [
        cleanCsvValue(c.id),
        cleanCsvValue(c.nameAr || c.name),
        cleanCsvValue(c.nameEn),
        cleanCsvValue(c.sector),
        cleanCsvValue(c.city),
        cleanCsvValue(c.governorate),
        cleanCsvValue(c.address),
        cleanCsvValue(c.phone1),
        cleanCsvValue(c.phone2),
        cleanCsvValue(c.mobile),
        cleanCsvValue(c.otherPhones),
        cleanCsvValue(c.website),
        cleanCsvValue(c.google_maps_url),
        cleanCsvValue(c.latitude),
        cleanCsvValue(c.longitude),
        cleanCsvValue(c.fleetSize),
        cleanCsvValue(c.fleetType),
        cleanCsvValue(c.priority),
        cleanCsvValue(c.leadScore),
        cleanCsvValue(c.status),
        cleanCsvValue(c.assignedTo),
        cleanCsvValue(c.contactPerson),
        cleanCsvValue(c.contactTitle),
        cleanCsvValue(c.notes),
        cleanCsvValue(c.createdAt),
        cleanCsvValue(c.lastUpdated)
    ];
    csvRows.push(row.join(','));
});

// Add UTF-8 BOM (\uFEFF)
const csvContent = '\uFEFF' + csvRows.join('\r\n');

fs.writeFileSync(path.join(backupDir, `companies_master_${companies.length}.csv`), csvContent, 'utf8');
fs.writeFileSync(path.join(latestDir, `companies_master_latest.csv`), csvContent, 'utf8');
fs.writeFileSync(path.join(latestDir, `companies_master_${companies.length}.csv`), csvContent, 'utf8');
console.log('CSV backup file with UTF-8 BOM generated successfully.');

// 5. Generate Excel XLSX
console.log('Generating XLSX spreadsheet (this might take a few moments)...');
const xlsxData = companies.map(c => ({
    'المعرف (ID)': c.id || '',
    'اسم الشركة / المصنع بالعربي': c.nameAr || c.name || '',
    'اسم المنشأة بالإنجليزي': c.nameEn || '',
    'القطاع الصناعي / التجاري': c.sector || '',
    'المدينة / المنطقة الصناعية': c.city || '',
    'المحافظة': c.governorate || '',
    'العنوان التفصيلي': c.address || '',
    'الهاتف الرئيسي': c.phone1 || '',
    'هاتف إضافي': c.phone2 || '',
    'الموبايل': c.mobile || '',
    'هواتف أخرى': c.otherPhones || '',
    'الموقع الإلكتروني': c.website || '',
    'رابط خرائط جوجل': c.google_maps_url || '',
    'خط العرض': c.latitude || '',
    'خط الطول': c.longitude || '',
    'حجم الأسطول التقديري': c.fleetSize || 0,
    'نوع الأسطول': c.fleetType || '',
    'الأولوية البيعية': c.priority || '',
    'درجة العميل المتوقع': c.leadScore || 0,
    'الحالة': c.status || '',
    'المسؤول عن الحساب': c.assignedTo || '',
    'اسم الشخص المسؤول للتواصل': c.contactPerson || '',
    'المسمى الوظيفي للمسؤول': c.contactTitle || '',
    'ملاحظات وتوثيق السجل': c.notes || '',
    'تاريخ التسجيل': c.createdAt || '',
    'آخر تحديث': c.lastUpdated || ''
}));

const worksheet = xlsx.utils.json_to_sheet(xlsxData);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, 'الشركات والمصانع المعتمدة');

const xlsxBackupPath = path.join(backupDir, `companies_master_${companies.length}.xlsx`);
const xlsxLatestPath = path.join(latestDir, `companies_master_latest.xlsx`);
const xlsxNamedLatestPath = path.join(latestDir, `companies_master_${companies.length}.xlsx`);

xlsx.writeFile(workbook, xlsxBackupPath);
xlsx.writeFile(workbook, xlsxLatestPath);
xlsx.writeFile(workbook, xlsxNamedLatestPath);
console.log('XLSX spreadsheet generated successfully.');

// 6. Generate Metadata README
const sectorsCount = {};
const citiesCount = {};
companies.forEach(c => {
    sectorsCount[c.sector || 'أخرى'] = (sectorsCount[c.sector || 'أخرى'] || 0) + 1;
    citiesCount[c.city || 'أخرى'] = (citiesCount[c.city || 'أخرى'] || 0) + 1;
});

const metadata = `# وثيقة النسخة الاحتياطية المعتمدة لقاعدة بيانات الشركات (Master Backup)

- **تاريخ أخذ النسخة**: ${new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- **توقيت الإنشاء**: ${new Date().toLocaleTimeString('ar-EG')} (UTC+3)
- **إصدار النظام وقت النسخ**: v254.0
- **إجمالي الشركات والمصانع بالنسخة**: **${companies.length.toLocaleString()}** شركة ومصنع مسجل وموثق
- **مجمع عمالقة الصناعة (Titans)**: **${titans.length}** شركة عملاقة
- **مجمع الأساطيل الميدانية (Pool)**: **${pool.length.toLocaleString()}** شركة ومصنع

---

## 📁 ملفات النسخة الاحتياطية المتوفرة في هذا المجلد:

1. \`companies_master_${companies.length}.json\`: النسخة الكاملة لجميع الـ ${companies.length.toLocaleString()} شركة بصيغة JSON القياسية.
2. \`companies_master_${companies.length}.csv\`: النسخة الكاملة بصيغة CSV مشفرة بنظام (UTF-8 with BOM) لفتحها مباشرة في مايكروسوفت إكسيل دون أي تشويه في الحروف العربية.
3. \`companies_master_${companies.length}.xlsx\`: ملف إكسيل كامل جاهز للاستخدام المباشر.
4. \`egypt_verified_titans_${titans.length}.json\`: ملف الـ ${titans.length} شركة ومصنع عملاق.
5. \`egypt_enterprises_pool_${pool.length}.json\`: ملف الـ ${pool.length.toLocaleString()} شركة ومصنع ميداني.
6. \`egypt_enterprises_pool.js\`: كود الجافاسكريبت الجاهز للعمل المباشر في السيستم.
7. \`egypt_verified_titans.js\`: كود الجافاسكريبت لعمالقة الصناعة في السيستم.

---

## 📊 توزيع القطاعات في النسخة الاحتياطية:
${Object.entries(sectorsCount).sort((a,b) => b[1] - a[1]).map(([s, c]) => `- **${s}**: ${c.toLocaleString()} منشأة`).join('\n')}

---

## 🔄 كيفية استرجاع النسخة الاحتياطية في أي وقت:
في حال الرغبة في استرجاع هذه النسخة بالكامل:
1. نسخ \`companies_master_${companies.length}.json\` إلى \`crm/data/companies.json\`.
2. نسخ \`egypt_enterprises_pool_${pool.length}.json\` إلى \`crm/data/egypt_enterprises_pool.json\`.
3. نسخ \`egypt_verified_titans_${titans.length}.json\` إلى \`crm/data/egypt_verified_titans.json\`.
4. نسخ \`egypt_enterprises_pool.js\` إلى \`crm/js/egypt_enterprises_pool.js\`.
5. نسخ \`egypt_verified_titans.js\` إلى \`crm/js/egypt_verified_titans.js\`.
`;

fs.writeFileSync(path.join(backupDir, 'BACKUP_METADATA.md'), metadata, 'utf8');
fs.writeFileSync(path.join(latestDir, 'BACKUP_METADATA.md'), metadata, 'utf8');
console.log('BACKUP_METADATA.md generated successfully.');
