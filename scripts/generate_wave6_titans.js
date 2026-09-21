/**
 * scripts/generate_wave6_titans.js
 * Master execution script for Wave 6 Titans (200 new titans, eg_titan_501 to eg_titan_700).
 * Brings total Titans to 700 and total companies in the system to 25,628.
 */

const fs = require('fs');
const path = require('path');

const { wave6Part1 } = require('./wave6_data_part1');
const { wave6Part2 } = require('./wave6_data_part2');
const { wave6Part3 } = require('./wave6_data_part3');
const { wave6Part4 } = require('./wave6_data_part4');
const { wave6Part5 } = require('./wave6_data_part5');
const { wave6Part6 } = require('./wave6_data_part6');

const ROOT = path.join(__dirname, '..');
const existingTitansPath = path.join(ROOT, 'crm', 'data', 'egypt_verified_titans.json');
const currentTitans = JSON.parse(fs.readFileSync(existingTitansPath, 'utf8'));

console.log(`Current Titans count: ${currentTitans.length}`);

const newTitans = [
  ...wave6Part1,
  ...wave6Part2,
  ...wave6Part3,
  ...wave6Part4,
  ...wave6Part5,
  ...wave6Part6
];

console.log(`Wave 6 Titans count: ${newTitans.length}`);

if (newTitans.length !== 200) {
  throw new Error(`Expected 200 Wave 6 Titans, got ${newTitans.length}`);
}

// Combine all 700 Titans
const allTitans = [...currentTitans, ...newTitans];
console.log(`New Combined Titans count: ${allTitans.length}`);

if (allTitans.length !== 700) {
  throw new Error(`Expected 700 total titans, got ${allTitans.length}`);
}

// Validate sequential IDs
allTitans.forEach((t, i) => {
  const expectedId = `eg_titan_${String(i + 1).padStart(3, '0')}`;
  if (t.id !== expectedId) {
    throw new Error(`Titan at index ${i} has id ${t.id}, expected ${expectedId}`);
  }
});

function executeDeployment() {
  // 1. Write egypt_verified_titans.json
  fs.writeFileSync(existingTitansPath, JSON.stringify(allTitans, null, 2), 'utf8');
  console.log(`Wrote updated egypt_verified_titans.json with ${allTitans.length} titans`);

  // 2. Write egypt_verified_titans.js
  const jsContent = `/**
 * egypt_verified_titans.js
 * Database of Verified Egyptian Industrial Titans & Large Enterprise Fleets (700 Titans).
 * Total Titans: 700
 */

window.EGYPT_VERIFIED_TITANS = ${JSON.stringify(allTitans, null, 2)};
`;
  fs.writeFileSync(path.join(ROOT, 'crm', 'js', 'egypt_verified_titans.js'), jsContent, 'utf8');
  console.log('Wrote updated egypt_verified_titans.js');

  // 3. Write companies.json
  const companiesPath = path.join(ROOT, 'crm', 'data', 'companies.json');
  const existingCompanies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
  const pool = existingCompanies.filter(c => !c.id.startsWith('eg_titan_'));
  console.log(`Pool count: ${pool.length}`);

  const totalCompanies = [...allTitans, ...pool];
  console.log(`Total companies to write: ${totalCompanies.length}`);

  fs.writeFileSync(companiesPath, JSON.stringify(totalCompanies), 'utf8');
  console.log('Wrote updated companies.json');

  let totalFleet = 0;
  allTitans.forEach(t => totalFleet += (t.fleetSize || 0));
  console.log(`Total 700 Titans combined fleet: ${totalFleet}`);
}

if (process.argv.includes('--execute')) {
  executeDeployment();
} else {
  console.log('Dry run completed successfully. To write files, run with --execute.');
}
