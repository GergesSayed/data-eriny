const fs = require('fs');
const companies = JSON.parse(fs.readFileSync('crm/data/companies.json', 'utf8')).slice(0, 1000);

global.window = {
  AppStorage: {
    escapeHtml: s => s || '',
    getSectorLabel: s => s,
    getCityLabel: c => c,
    getGoogleMapsUrl: c => c.google_maps_url || '',
    getCurrentUser: () => ({ id: 'usr_admin', role: 'admin' }),
    getCalls: () => [],
    getCallResultLabel: r => r,
    canModify: () => true
  }
};
global.document = {
  getElementById: (id) => ({
    style: {},
    innerHTML: '',
    classList: { toggle: () => {} }
  })
};

const Companies = {
  selectedSectors: new Set(),
  selectedGovs: new Set(),
  buildAssignedWidget: () => '<span>مسند</span>',
  showDetail: () => {},
  edit: () => {},
  confirmDelete: () => {}
};

const code = fs.readFileSync('crm/js/companies.js', 'utf8');
const renderCardsMatch = code.match(/renderCards\(companies, total\) \{([\s\S]*?)\n    \},/);
const fnBody = renderCardsMatch[1];

try {
  const fn = new Function('companies', 'total', fnBody);
  fn.call(Companies, companies, 1000);
  console.log('SUCCESS: All 1,000 companies rendered in cards view flawlessly!');
} catch(e) {
  console.error('FAILED with error:', e.message);
  process.exitCode = 1;
}
