/**
 * Create v257 backup - JSON, CSV (UTF-8 BOM), XLSX
 */
const fs = require('fs');
const path = require('path');

const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const backupDir = path.join(__dirname, `../backups/companies_backup_v257_${date}`);
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

const companies = JSON.parse(fs.readFileSync('crm/data/companies.json', 'utf8'));

// 1. JSON backup
fs.writeFileSync(path.join(backupDir, 'companies_v257.json'), JSON.stringify(companies, null, 2), 'utf8');
console.log(`✅ JSON backup: ${companies.length} companies`);

// 2. CSV with UTF-8 BOM
const BOM = '\uFEFF';
const headers = [
  'id', 'nameAr', 'nameEn', 'sector', 'subSector', 'city', 'governorate',
  'address', 'phone1', 'phone2', 'mobile', 'otherPhones', 'hotline',
  'website', 'google_maps_url', 'latitude', 'longitude',
  'fleetSize', 'fleetType', 'fleetTires', 'priority', 'status',
  'verified', 'isTitan', 'notes', 'contactPerson', 'contactTitle',
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

const csvRows = [headers.join(',')];
companies.forEach(c => {
  const row = headers.map(h => csvEscape(c[h]));
  csvRows.push(row.join(','));
});
fs.writeFileSync(path.join(backupDir, 'companies_v257.csv'), BOM + csvRows.join('\n'), 'utf8');
console.log(`✅ CSV backup (UTF-8 BOM): ${csvRows.length - 1} rows`);

// 3. XLSX using simple XML spreadsheet
const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="header"><Font ss:Bold="1" ss:Size="11"/><Interior ss:Color="#4472C4" ss:Pattern="Solid"/><Font ss:Color="#FFFFFF" ss:Bold="1"/></Style>
  <Style ss:ID="data"><Font ss:Size="10"/></Style>
 </Styles>
 <Worksheet ss:Name="Companies v257">
  <Table>`;

const xmlFooter = `  </Table>
 </Worksheet>
</Workbook>`;

function xmlEscape(val) {
  if (val === null || val === undefined) return '';
  const str = Array.isArray(val) ? val.join(' | ') : String(val);
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

let xmlRows = '';
// Header row
xmlRows += '   <Row ss:StyleID="header">\n';
headers.forEach(h => {
  xmlRows += `    <Cell><Data ss:Type="String">${xmlEscape(h)}</Data></Cell>\n`;
});
xmlRows += '   </Row>\n';

// Data rows
companies.forEach(c => {
  xmlRows += '   <Row ss:StyleID="data">\n';
  headers.forEach(h => {
    const val = c[h];
    const type = typeof val === 'number' ? 'Number' : 'String';
    xmlRows += `    <Cell><Data ss:Type="${type}">${xmlEscape(val)}</Data></Cell>\n`;
  });
  xmlRows += '   </Row>\n';
});

fs.writeFileSync(path.join(backupDir, 'companies_v257.xlsx'), xmlHeader + '\n' + xmlRows + xmlFooter, 'utf8');
console.log(`✅ XLSX backup: ${companies.length} rows`);

// Update backups/latest
const latestDir = path.join(__dirname, '../backups/latest');
if (fs.existsSync(latestDir)) {
  fs.writeFileSync(path.join(latestDir, 'companies_master_latest.json'), JSON.stringify(companies, null, 2), 'utf8');
  fs.writeFileSync(path.join(latestDir, 'companies_master_latest.csv'), BOM + csvRows.join('\n'), 'utf8');
  fs.writeFileSync(path.join(latestDir, 'companies_master_latest.xlsx'), xmlHeader + '\n' + xmlRows + xmlFooter, 'utf8');
  
  // Also specific 24962 files
  fs.writeFileSync(path.join(latestDir, 'companies_master_24962.json'), JSON.stringify(companies, null, 2), 'utf8');
  fs.writeFileSync(path.join(latestDir, 'companies_master_24962.csv'), BOM + csvRows.join('\n'), 'utf8');
  fs.writeFileSync(path.join(latestDir, 'companies_master_24962.xlsx'), xmlHeader + '\n' + xmlRows + xmlFooter, 'utf8');
  
  // Pool
  const pool = JSON.parse(fs.readFileSync('crm/data/egypt_enterprises_pool.json', 'utf8'));
  fs.writeFileSync(path.join(latestDir, 'egypt_enterprises_pool_24928.json'), JSON.stringify(pool, null, 2), 'utf8');
  fs.copyFileSync('crm/js/egypt_enterprises_pool.js', path.join(latestDir, 'egypt_enterprises_pool.js'));
  console.log(`✅ backups/latest updated with v257.0 (24,962 companies)`);
}

console.log(`\n📁 All backups saved to: ${backupDir}`);
