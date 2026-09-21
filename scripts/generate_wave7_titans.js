/**
 * scripts/generate_wave7_titans.js
 * Master execution script for Wave 7 Titans (300 new titans, eg_titan_701 to eg_titan_1000).
 * Brings total Titans to exactly 1,000 and total companies in the system to 25,928.
 * Performs comprehensive zero-collision and schema integrity verification.
 */

const fs = require('fs');
const path = require('path');

const { wave7Part1 } = require('./wave7_data_part1');
const { wave7Part2 } = require('./wave7_data_part2');
const { wave7Part3 } = require('./wave7_data_part3');
const { wave7Part4 } = require('./wave7_data_part4');
const { wave7Part5 } = require('./wave7_data_part5');
const { wave7Part6 } = require('./wave7_data_part6');

const ROOT = path.join(__dirname, '..');
const existingTitansPath = path.join(ROOT, 'crm', 'data', 'egypt_verified_titans.json');
const allExistingTitans = JSON.parse(fs.readFileSync(existingTitansPath, 'utf8'));
const baseTitans = allExistingTitans.slice(0, 700);

console.log(`Base Titans count in DB: ${baseTitans.length}`);

const newTitans = [
  ...wave7Part1,
  ...wave7Part2,
  ...wave7Part3,
  ...wave7Part4,
  ...wave7Part5,
  ...wave7Part6
];

console.log(`Wave 7 new Titans count: ${newTitans.length}`);

if (newTitans.length !== 300) {
  throw new Error(`Expected 300 Wave 7 Titans, got ${newTitans.length}`);
}

// Combine all 1,000 Titans
const allTitans = [...baseTitans, ...newTitans];
console.log(`Total Combined Titans count: ${allTitans.length}`);

if (allTitans.length !== 1000) {
  throw new Error(`Expected 1,000 total titans, got ${allTitans.length}`);
}

// 1. Validate sequential IDs
allTitans.forEach((t, i) => {
  const expectedId = `eg_titan_${String(i + 1).padStart(i >= 999 ? 4 : 3, '0')}`;
  // For 1..999: eg_titan_001..eg_titan_999, for 1000: eg_titan_1000
  const normExpectedId = i < 999 ? `eg_titan_${String(i + 1).padStart(3, '0')}` : 'eg_titan_1000';
  if (t.id !== normExpectedId) {
    throw new Error(`Titan at index ${i} has id ${t.id}, expected ${normExpectedId}`);
  }
});
console.log('✔ All 1,000 Titan IDs are sequentially aligned (eg_titan_001 to eg_titan_1000)');

// 2. Collision Check: Unique IDs, Arabic Names, Phones
const seenIds = new Set();
const seenNames = new Set();
const seenPhones = new Set();

allTitans.forEach((t, i) => {
  if (seenIds.has(t.id)) {
    throw new Error(`Duplicate Titan ID detected: ${t.id} at index ${i}`);
  }
  seenIds.add(t.id);

  const cleanName = t.nameAr.trim().toLowerCase();
  if (seenNames.has(cleanName)) {
    throw new Error(`Duplicate Titan nameAr detected: "${t.nameAr}" at index ${i}`);
  }
  seenNames.add(cleanName);

  if (t.phone1) {
    const p1 = t.phone1.replace(/\D/g, '');
    if (seenPhones.has(p1)) {
      console.warn(`[Notice] Phone1 collision within titans: ${p1} on ${t.nameAr}`);
    } else {
      seenPhones.add(p1);
    }
  }
  if (t.mobile) {
    const mob = t.mobile.replace(/\D/g, '');
    if (seenPhones.has(mob)) {
      console.warn(`[Notice] Mobile collision within titans: ${mob} on ${t.nameAr}`);
    } else {
      seenPhones.add(mob);
    }
  }
});
console.log('✔ Zero duplicate IDs or duplicate Arabic names among all 1,000 Titans');

// 3. Load Pool and check collision with existing pool
const companiesPath = path.join(ROOT, 'crm', 'data', 'companies.json');
const existingCompanies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
const pool = existingCompanies.filter(c => !c.id.startsWith('eg_titan_'));
console.log(`Original Pool companies count: ${pool.length}`);

if (pool.length !== 24928) {
  console.warn(`Warning: Expected pool length 24,928, found ${pool.length}`);
}

// Check if any new titan name collides with pool exactly
let poolNameCollisions = 0;
newTitans.forEach(t => {
  const match = pool.find(p => p.nameAr && p.nameAr.trim() === t.nameAr.trim());
  if (match) {
    poolNameCollisions++;
    console.warn(`Name collision with pool: ${t.nameAr} matches pool id ${match.id}`);
  }
});
console.log(`✔ Pool name collision check complete. Collisions: ${poolNameCollisions}`);

// 4. Sector breakdown & Fleet analytics
const sectorStats = {};
let totalFleet = 0;
let minFleet = Infinity;
let maxFleet = -Infinity;

allTitans.forEach(t => {
  sectorStats[t.sector] = (sectorStats[t.sector] || 0) + 1;
  const f = t.fleetSize || 0;
  totalFleet += f;
  if (f < minFleet) minFleet = f;
  if (f > maxFleet) maxFleet = f;
});

console.log('\n================ 1,000 TITANS SECTOR BREAKDOWN ================');
console.table(sectorStats);
console.log(`Total Combined Fleet Size: ${totalFleet.toLocaleString('en-US')} commercial vehicles`);
console.log(`Fleet Range: Min ${minFleet}, Max ${maxFleet}, Avg ${(totalFleet / allTitans.length).toFixed(1)} vehicles/titan`);
console.log('===============================================================\n');

function executeDeployment() {
  console.log('Starting deployment of Wave 7 (1,000 Titans & 25,928 total companies)...');

  // 1. Write egypt_verified_titans.json
  fs.writeFileSync(existingTitansPath, JSON.stringify(allTitans, null, 2), 'utf8');
  console.log(`✔ Written: ${existingTitansPath} (${allTitans.length} Titans)`);

  // 2. Write egypt_verified_titans.js
  const jsContent = `/**
 * egypt_verified_titans.js
 * Database of Verified Egyptian Industrial Titans & Large Enterprise Fleets (1,000 Titans).
 * Total Titans: 1,000
 * Generated: 2026-09-21
 */

const titansData = ${JSON.stringify(allTitans, null, 2)};

if (typeof window !== 'undefined') {
  window.__EGYPT_VERIFIED_TITANS = window.EGYPT_VERIFIED_TITANS = titansData;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = titansData;
}
`;
  const titansJsPath = path.join(ROOT, 'crm', 'js', 'egypt_verified_titans.js');
  fs.writeFileSync(titansJsPath, jsContent, 'utf8');
  console.log(`✔ Written: ${titansJsPath}`);

  // 3. Write companies.json
  const totalCompanies = [...allTitans, ...pool];
  console.log(`Total companies to write into companies.json: ${totalCompanies.length}`);

  if (totalCompanies.length !== 25928) {
    throw new Error(`Expected 25,928 total companies, got ${totalCompanies.length}`);
  }

  // Double check that titans are pinned to the top: 0 to 999
  for (let i = 0; i < 1000; i++) {
    if (!totalCompanies[i].id.startsWith('eg_titan_')) {
      throw new Error(`Company at index ${i} is not a Titan: ${totalCompanies[i].id}`);
    }
  }
  console.log('✔ Verified all 1,000 Titans occupy indices 0 through 999 at the top of companies.json');

  fs.writeFileSync(companiesPath, JSON.stringify(totalCompanies), 'utf8');
  console.log(`✔ Written: ${companiesPath} (${totalCompanies.length} companies)`);
  console.log('\n🎉 Wave 7 Deployment Successful!');
}

if (process.argv.includes('--execute')) {
  executeDeployment();
} else {
  console.log('Dry run completed successfully with ZERO errors. Run with --execute to write files.');
}
