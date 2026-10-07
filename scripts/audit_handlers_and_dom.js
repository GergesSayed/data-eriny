const fs = require('fs');

const html = fs.readFileSync('crm/index.html', 'utf8');

// Match all onclick, onchange, onsubmit, oninput
const handlerRegex = /(onclick|onchange|onsubmit|oninput)=["']([^"']+)["']/g;
let match;
const handlers = [];

while ((match = handlerRegex.exec(html)) !== null) {
  handlers.push({ type: match[1], code: match[2] });
}

console.log('Total inline event handlers in index.html:', handlers.length);

const uniqueHandlers = [...new Set(handlers.map(h => h.code))];
console.log('Unique handler calls:', uniqueHandlers.length);

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
const allJs = jsFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');

let missing = [];
for (const h of uniqueHandlers) {
  const callMatch = h.match(/([a-zA-Z0-9_$]+(\.[a-zA-Z0-9_$]+)?)\s*\(/);
  if (callMatch) {
    const fnName = callMatch[1];
    const parts = fnName.split('.');
    if (parts.length === 2) {
      const obj = parts[0];
      const method = parts[1];
      const re = new RegExp(method + '\\s*[:=(]', 'g');
      if (!re.test(allJs)) {
        missing.push({ handler: h, fnName });
      }
    } else {
      const re = new RegExp('(function\\s+' + fnName + '|window\\.' + fnName + '|var\\s+' + fnName + ')', 'g');
      if (!re.test(allJs) && !html.includes('function ' + fnName)) {
        missing.push({ handler: h, fnName });
      }
    }
  }
}

console.log('Potential missing functions:', missing.length);
if (missing.length > 0) {
  missing.forEach(m => console.log(' - ' + m.fnName + ' in handler: ' + m.handler));
} else {
  console.log('✅ ALL handler calls matched valid definitions in codebase!');
}
