const fs = require('fs');

const css = fs.readFileSync('crm/css/style.css', 'utf8');

console.log('=== CSS & COLOR SYSTEM AUDIT ===');
console.log('Total CSS size:', (css.length / 1024).toFixed(1), 'KB');

// 1. Extract CSS custom properties (--var)
const varDefRegex = /(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
let m;
const definedVars = new Map();
while ((m = varDefRegex.exec(css)) !== null) {
  if (!definedVars.has(m[1])) definedVars.set(m[1], []);
  definedVars.get(m[1]).push(m[2].trim());
}

console.log('Unique CSS Variables defined:', definedVars.size);

// 2. Check all var(--...) usage in CSS and HTML
const varUseRegex = /var\((--[a-zA-Z0-9_-]+)[^)]*\)/g;
const usedVars = new Set();
while ((m = varUseRegex.exec(css)) !== null) {
  usedVars.add(m[1]);
}

const html = fs.readFileSync('crm/index.html', 'utf8');
while ((m = varUseRegex.exec(html)) !== null) {
  usedVars.add(m[1]);
}

console.log('Unique CSS Variables used:', usedVars.size);

// 3. Find any undefined variables
const undefinedVars = [];
for (const v of usedVars) {
  if (!definedVars.has(v)) {
    undefinedVars.push(v);
  }
}

if (undefinedVars.length > 0) {
  console.log('❌ Undefined CSS Variables found:', undefinedVars);
} else {
  console.log('✅ ALL used CSS Variables are properly defined! (0 undefined)');
}

// 4. Check Dark Mode Coverage
const hasDarkRoot = css.includes('[data-theme="dark"]') || css.includes(':root[data-theme="dark"]');
console.log('Dark mode theme block present:', hasDarkRoot ? 'YES ✅' : 'NO ❌');

// Check key palette tokens
const keyTokens = [
  '--bg-primary',
  '--bg-secondary',
  '--surface-card',
  '--text-primary',
  '--text-secondary',
  '--primary',
  '--border-color',
  '--accent',
  '--success',
  '--warning',
  '--danger'
];

console.log('\nKey Design Token Verification:');
keyTokens.forEach(t => {
  const defs = definedVars.get(t);
  if (defs) {
    console.log(` - ${t}: ${defs.length} variations (e.g. ${defs[0]})`);
  } else {
    console.log(` - ❌ Missing key token: ${t}`);
  }
});
