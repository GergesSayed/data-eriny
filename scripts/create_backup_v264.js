/**
 * scripts/create_backup_v264.js
 * Comprehensive Backup for v264.0 / Clean Deduplicated DB (1,000 Titans + 24,928 Pool = 25,928 Companies).
 * Formats: JSON (formatted), CSV (UTF-8 BOM for Excel), and XLSX (SpreadsheetML).
 */

const fs = require('fs');
const path = require('path');

const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const backupDir = path.join(__dirname, `../backups/companies_backup_v264_${date}`);
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

const latestDir = path.join(__dirname, '../backups/latest');
if (!fs.existsSync(latestDir)) fs.mkdirSync(latestDir, { recursive: true });

const companies = JSON.parse(fs.readFileSync('crm/data/companies.json', 'utf8'));
const titans = JSON.parse(fs.readFileSync('crm/data/egypt_verified_titans.json', 'utf8'));
const pool = JSON.parse(fs.readFileSync('crm/data/egypt_enterprises_pool.json', 'utf8'));

console.log(`Starting v264.0 backup: ${companies.length} companies (${titans.length} Titans + ${pool.length} Pool)...`);

const BOM = '\uFEFF';
const headers = [
  'id', 'nameAr', 'nameEn', 'sector', 'subSector', 'city', 'governorate',
  'address', 'phone1', 'phone2', 'mobile', 'otherPhones', 'hotline',
  'website', 'google_maps_url', 'latitude', 'longitude',
  'fleetSize', 'fleetType', 'fleetTires', 'priority', 'status',
  'verified', 'isTitan', 'vip', 'badge', 'notes', 'contactPerson', 'contactTitle',
  'createdAt', 'lastUpdated', 'leadScore', 'assignedTo', 'branches'
];

function csvEscape(val) {
  if (val === null || val === undefined) return '';
  const str = Array.isArray(val) ? val.join(' | ') : String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function generateCsv(dataList) {
  const rows = [headers.join(',')];
  dataList.forEach(c => {
    rows.push(headers.map(h => csvEscape(c[h])).join(','));
  });
  return BOM + rows.join('\n');
}

function xmlEscape(val) {
  if (val === null || val === undefined) return '';
  const str = Array.isArray(val) ? val.join(' | ') : String(val);
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateXlsxXml(dataList, sheetName) {
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="header"><Font ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/><Interior ss:Color="#4472C4" ss:Pattern="Solid"/></Style>
  <Style ss:ID="data"><Font ss:Size="10"/></Style>
 </Styles>
 <Worksheet ss:Name="${sheetName}">
  <Table>`;
  const xmlFooter = `  </Table>
 </Worksheet>
</Workbook>`;

  let xmlRows = '   <Row ss:StyleID="header">\n';
  headers.forEach(h => {
    xmlRows += `    <Cell><Data ss:Type="String">${xmlEscape(h)}</Data></Cell>\n`;
  });
  xmlRows += '   </Row>\n';

  dataList.forEach(c => {
    xmlRows += '   <Row ss:StyleID="data">\n';
    headers.forEach(h => {
      const val = c[h];
      const type = typeof val === 'number' ? 'Number' : 'String';
      xmlRows += `    <Cell><Data ss:Type="${type}">${xmlEscape(val)}</Data></Cell>\n`;
    });
    xmlRows += '   </Row>\n';
  });

  return xmlHeader + '\n' + xmlRows + xmlFooter;
}

// 1. Write dated backup files
console.log('Writing dated backup files...');
fs.writeFileSync(path.join(backupDir, 'companies_v264.json'), JSON.stringify(companies, null, 2), 'utf8');
const fullCsv = generateCsv(companies);
fs.writeFileSync(path.join(backupDir, 'companies_v264.csv'), fullCsv, 'utf8');
const fullXlsx = generateXlsxXml(companies, 'All Companies v264');
fs.writeFileSync(path.join(backupDir, 'companies_v264.xlsx'), fullXlsx, 'utf8');

fs.writeFileSync(path.join(backupDir, 'titans_1000_v264.json'), JSON.stringify(titans, null, 2), 'utf8');
const titansCsv = generateCsv(titans);
fs.writeFileSync(path.join(backupDir, 'titans_1000_v264.csv'), titansCsv, 'utf8');
const titansXlsx = generateXlsxXml(titans, '1000 Titans');
fs.writeFileSync(path.join(backupDir, 'titans_1000_v264.xlsx'), titansXlsx, 'utf8');

fs.writeFileSync(path.join(backupDir, 'pool_24928_v264.json'), JSON.stringify(pool, null, 2), 'utf8');

// 2. Overwrite latest/ folder
console.log('Updating backups/latest/...');
fs.writeFileSync(path.join(latestDir, 'companies.json'), JSON.stringify(companies, null, 2), 'utf8');
fs.writeFileSync(path.join(latestDir, 'companies.csv'), fullCsv, 'utf8');
fs.writeFileSync(path.join(latestDir, 'companies.xlsx'), fullXlsx, 'utf8');

fs.writeFileSync(path.join(latestDir, 'egypt_verified_titans.json'), JSON.stringify(titans, null, 2), 'utf8');
fs.writeFileSync(path.join(latestDir, 'egypt_verified_titans.csv'), titansCsv, 'utf8');
fs.writeFileSync(path.join(latestDir, 'egypt_verified_titans.xlsx'), titansXlsx, 'utf8');

fs.writeFileSync(path.join(latestDir, 'egypt_enterprises_pool.json'), JSON.stringify(pool, null, 2), 'utf8');

console.log('v264.0 Backup completed successfully!');
