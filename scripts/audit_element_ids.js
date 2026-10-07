const fs = require('fs');

const html = fs.readFileSync('crm/index.html', 'utf8');

// Collect all IDs defined in index.html
const idRegex = /id=["']([^"']+)["']/g;
let m;
const htmlIds = new Set();
while ((m = idRegex.exec(html)) !== null) {
  htmlIds.add(m[1]);
}
console.log('Total IDs defined in index.html:', htmlIds.size);

const jsFiles = [
  'crm/js/companies-worker.js',
  'crm/js/supabase-client.js',
  'crm/js/storage.js',
  'crm/js/excel-handler.js',
  'crm/js/dashboard.js',
  'crm/js/companies.js',
  'crm/js/calls.js',
  'crm/js/reports.js',
  'crm/js/scraper.js',
  'crm/js/team.js',
  'crm/js/settings.js',
  'crm/js/app.js'
];

const missingIds = [];

jsFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const getElemRegex = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
  let em;
  while ((em = getElemRegex.exec(content)) !== null) {
    const id = em[1];
    if (!htmlIds.has(id)) {
      missingIds.push({ file, id });
    }
  }
});

console.log('Total document.getElementById calls referencing IDs not directly in static HTML:', missingIds.length);

const missingGroup = new Map();
missingIds.forEach(({ file, id }) => {
  if (!missingGroup.has(id)) missingGroup.set(id, new Set());
  missingGroup.get(id).add(file);
});

console.log('Unique non-static IDs referenced:', missingGroup.size);
for (const [id, files] of missingGroup.entries()) {
  // Check if this ID is created dynamically in any JS file (e.g. innerHTML or createElement)
  let isDynamic = false;
  jsFiles.forEach(f => {
    const txt = fs.readFileSync(f, 'utf8');
    if (txt.includes(`id="${id}"`) || txt.includes(`id='${id}'`) || txt.includes(`id: '${id}'`)) {
      isDynamic = true;
    }
  });
  console.log(` - ID: "${id}" (used in ${[...files].join(', ')}) -> Dynamically Created in JS? ${isDynamic ? 'YES ✅' : 'NO ❌ (NEEDS CHECK)'}`);
}
