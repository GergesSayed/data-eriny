const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDirName = `companies_backup_v249_2026-09-20`;
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
fs.writeFileSync(path.join(backupDir, 'companies_master_30690.json'), JSON.stringify(companies, null, 2), 'utf8');
fs.writeFileSync(path.join(latestDir, 'companies_master_30690.json'), JSON.stringify(companies, null, 2), 'utf8');

fs.writeFileSync(path.join(backupDir, 'egypt_verified_titans_34.json'), JSON.stringify(titans, null, 2), 'utf8');
fs.writeFileSync(path.join(latestDir, 'egypt_verified_titans_34.json'), JSON.stringify(titans, null, 2), 'utf8');

fs.writeFileSync(path.join(backupDir, 'egypt_enterprises_pool_30656.json'), JSON.stringify(pool, null, 2), 'utf8');
fs.writeFileSync(path.join(latestDir, 'egypt_enterprises_pool_30656.json'), JSON.stringify(pool, null, 2), 'utf8');

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
    'كود المنشأة (ID)',
    'اسم الشركة / المصنع (عربي)',
    'Company Name (English)',
    'القطاع الصناعي (Sector)',
    'النشاط الفرعي / التخصص (Sub Sector)',
    'المحافظة (Governorate)',
    'المدينة / المنطقة الصناعية (City)',
    'العنوان التفصيلي (Address)',
    'التليفون الأرضي الرئيسي (Phone 1)',
    'تليفون أرضي إضافي (Phone 2)',
    'موبايل / مسؤول الحركة (Mobile)',
    'الخط الساخن (Hotline)',
    'أرقام تواصل أخرى (Other Phones)',
    'البريد الإلكتروني (Email)',
    'الموقع الإلكتروني (Website)',
    'رابط خرائط جوجل (Google Maps URL)',
    'خط العرض (Latitude)',
    'خط الطول (Longitude)',
    'حجم الأسطول التقديري (Fleet Size)',
    'نوع الشاحنات والمركبات (Fleet Type)',
    'مقاسات الإطارات المطلوبة (Fleet Tires)',
    'الأولوية (Priority)',
    'حالة التوثيق (Verified)',
    'كيان عملاق (Is Titan)'
];

const csvRows = [csvHeaders.map(cleanCsvValue).join(',')];

companies.forEach(c => {
    const row = [
        c.id || '',
        c.nameAr || c.name || '',
        c.nameEn || '',
        c.sector || '',
        c.subSector || '',
        c.governorate || '',
        c.city || '',
        c.address || '',
        c.phone1 || c.phone || '',
        c.phone2 || '',
        c.mobile || '',
        c.hotline || '',
        c.otherPhones || '',
        c.email || '',
        c.website || '',
        c.google_maps_url || '',
        c.latitude || '',
        c.longitude || '',
        c.fleetSize || '',
        c.fleetType || '',
        c.fleetTires || '',
        c.priority || '',
        c.verified ? 'موثق' : 'مؤكد',
        c.isTitan ? 'نعم (Titan)' : 'لا'
    ];
    csvRows.push(row.map(cleanCsvValue).join(','));
});

// UTF-8 BOM: \uFEFF
const csvContent = '\uFEFF' + csvRows.join('\r\n');
fs.writeFileSync(path.join(backupDir, 'companies_master_30690.csv'), csvContent, 'utf8');
fs.writeFileSync(path.join(latestDir, 'companies_master_30690.csv'), csvContent, 'utf8');
console.log('CSV backup with UTF-8 BOM successfully generated.');

// 5. Excel (.xlsx) generation if xlsx is available
try {
    const xlsx = require('xlsx');
    console.log('Generating Excel (.xlsx) workbook...');
    
    // Map records to clean object for worksheet
    const excelData = companies.map(c => ({
        'كود المنشأة': c.id || '',
        'اسم الشركة أو المصنع': c.nameAr || c.name || '',
        'Company Name': c.nameEn || '',
        'القطاع': c.sector || '',
        'النشاط والتخصص': c.subSector || '',
        'المحافظة': c.governorate || '',
        'المدينة': c.city || '',
        'العنوان': c.address || '',
        'تليفون 1': c.phone1 || c.phone || '',
        'تليفون 2': c.phone2 || '',
        'الموبايل': c.mobile || '',
        'الخط الساخن': c.hotline || '',
        'أرقام أخرى': c.otherPhones || '',
        'الإيميل': c.email || '',
        'الموقع': c.website || '',
        'خرائط جوجل': c.google_maps_url || '',
        'حجم الأسطول': c.fleetSize || '',
        'نوع الأسطول والشاحنات': c.fleetType || '',
        'مقاسات الكاوتش': c.fleetTires || '',
        'الأولوية': c.priority || '',
        'كيان عملاق': c.isTitan ? 'نعم' : 'لا'
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(excelData);
    xlsx.utils.book_append_sheet(wb, ws, 'الشركات والمصانع');
    
    xlsx.writeFile(wb, path.join(backupDir, 'companies_master_30690.xlsx'));
    xlsx.writeFile(wb, path.join(latestDir, 'companies_master_30690.xlsx'));
    console.log('Excel (.xlsx) workbook successfully generated.');
} catch (e) {
    console.log('xlsx library note:', e.message);
}

// 6. Generate detailed BACKUP_METADATA.md
const sectorsCount = {};
const citiesCount = {};
companies.forEach(c => {
    sectorsCount[c.sector || 'أخرى'] = (sectorsCount[c.sector || 'أخرى'] || 0) + 1;
    citiesCount[c.city || 'أخرى'] = (citiesCount[c.city || 'أخرى'] || 0) + 1;
});

const metadata = `# وثيقة النسخة الاحتياطية المعتمدة لقاعدة بيانات الشركات (Master Backup)

- **تاريخ أخذ النسخة**: ${new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- **توقيت الإنشاء**: ${new Date().toLocaleTimeString('ar-EG')} (UTC+3)
- **إصدار النظام وقت النسخ**: v249.0
- **إجمالي الشركات والمصانع بالنسخة**: **${companies.length.toLocaleString()}** شركة ومصنع مسجل وموثق
- **مجمع عمالقة الصناعة (Titans)**: **${titans.length}** شركة عملاقة
- **مجمع الأساطيل الميدانية (Pool)**: **${pool.length.toLocaleString()}** شركة ومصنع

---

## 📁 ملفات النسخة الاحتياطية المتوفرة في هذا المجلد:

1. \`companies_master_30690.json\`: النسخة الكاملة لجميع الـ 30,690 شركة بصيغة JSON القياسية.
2. \`companies_master_30690.csv\`: النسخة الكاملة بصيغة CSV مشفرة بنظام (UTF-8 with BOM) لفتحها مباشرة في مايكروسوفت إكسيل دون أي تشويه في الحروف العربية.
3. \`companies_master_30690.xlsx\`: ملف إكسيل كامل جاهز للاستخدام المباشر.
4. \`egypt_verified_titans_34.json\`: ملف الـ 34 شركة ومصنع عملاق.
5. \`egypt_enterprises_pool_30656.json\`: ملف الـ 30,656 شركة ومصنع ميداني.
6. \`egypt_enterprises_pool.js\`: كود الجافاسكريبت الجاهز للعمل المباشر في السيستم.
7. \`egypt_verified_titans.js\`: كود الجافاسكريبت لعمالقة الصناعة في السيستم.

---

## 📊 توزيع القطاعات في النسخة الاحتياطية:
${Object.entries(sectorsCount).sort((a,b) => b[1] - a[1]).map(([s, c]) => `- **${s}**: ${c.toLocaleString()} منشأة`).join('\n')}

---

## 🔄 كيفية استرجاع النسخة الاحتياطية في أي وقت:
في حال الرغبة في استرجاع هذه النسخة بالكامل:
1. نسخ \`companies_master_30690.json\` إلى \`crm/data/companies.json\`.
2. نسخ \`egypt_enterprises_pool_30656.json\` إلى \`crm/data/egypt_enterprises_pool.json\`.
3. نسخ \`egypt_verified_titans_34.json\` إلى \`crm/data/egypt_verified_titans.json\`.
4. نسخ \`egypt_enterprises_pool.js\` إلى \`crm/js/egypt_enterprises_pool.js\`.
5. نسخ \`egypt_verified_titans.js\` إلى \`crm/js/egypt_verified_titans.js\`.
`;

fs.writeFileSync(path.join(backupDir, 'BACKUP_METADATA.md'), metadata, 'utf8');
fs.writeFileSync(path.join(latestDir, 'BACKUP_METADATA.md'), metadata, 'utf8');
console.log('BACKUP_METADATA.md generated successfully.');
