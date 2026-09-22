/**
 * scripts/deep_audit_duplicates.js
 * Comprehensive Forensic Audit for Duplicates & Near-Duplicates across all 25,928 Companies.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const companiesPath = path.join(ROOT, 'crm', 'data', 'companies.json');
const companies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));

console.log(`Auditing ${companies.length} companies from companies.json...\n`);

// Helper: Normalize Arabic string for strict semantic matching
function normalizeArabic(str) {
  if (!str) return '';
  let s = String(str).toLowerCase().trim();
  // Remove content in brackets like (Ezz Steel) or (العاشر من رمضان)
  s = s.replace(/\([^)]*\)/g, ' ');
  s = s.replace(/\[[^\]]*\]/g, ' ');
  // Remove common corporate prefixes
  s = s.replace(/\b(شركة|مجموعة|مصنع|مؤسسة|مركز|توكيل|معرض|ورشة|محطة)\b/g, ' ');
  // Normalize letters
  s = s.replace(/[أإآ]/g, 'ا');
  s = s.replace(/ة/g, 'ه');
  s = s.replace(/ى/g, 'ي');
  s = s.replace(/[\u064B-\u065F]/g, ''); // Remove Harakat/Tashkeel
  s = s.replace(/[^a-z0-9\u0621-\u064A]/g, ' '); // Keep only alphanumeric + Arabic
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function cleanPhone(p) {
  if (!p) return '';
  const digits = String(p).replace(/\D/g, '');
  if (digits.length >= 8) {
    // take last 9 or 10 digits to normalize with/without country code
    return digits.slice(-9);
  }
  return '';
}

// 1. Exact ID Duplicates
const idMap = new Map();
const duplicateIds = [];
companies.forEach(c => {
  if (idMap.has(c.id)) {
    duplicateIds.push({ id: c.id, name1: idMap.get(c.id).nameAr, name2: c.nameAr });
  } else {
    idMap.set(c.id, c);
  }
});

// 2. Exact Arabic Name Duplicates
const exactNameMap = new Map();
const exactNameDuplicates = [];
companies.forEach(c => {
  const name = (c.nameAr || '').trim();
  if (!name) return;
  if (exactNameMap.has(name)) {
    exactNameDuplicates.push({ name, id1: exactNameMap.get(name).id, id2: c.id });
  } else {
    exactNameMap.set(name, c);
  }
});

// 3. Normalized Name Duplicates
const normNameMap = new Map();
const normNameDuplicates = [];
companies.forEach(c => {
  const norm = normalizeArabic(c.nameAr);
  if (!norm || norm.length < 4) return; // skip very short names
  if (normNameMap.has(norm)) {
    normNameDuplicates.push({
      norm,
      orig1: normNameMap.get(norm).nameAr,
      id1: normNameMap.get(norm).id,
      orig2: c.nameAr,
      id2: c.id,
      isTitan1: Boolean(normNameMap.get(norm).isTitan),
      isTitan2: Boolean(c.isTitan)
    });
  } else {
    normNameMap.set(norm, c);
  }
});

// 4. Phone Number Duplicates
const phoneMap = new Map();
const phoneDuplicates = [];
companies.forEach(c => {
  const p1 = cleanPhone(c.phone1);
  const mob = cleanPhone(c.mobile);
  const phonesToCheck = [p1, mob].filter(Boolean);

  phonesToCheck.forEach(p => {
    if (phoneMap.has(p)) {
      const other = phoneMap.get(p);
      if (other.id !== c.id) {
        phoneDuplicates.push({
          phone: p,
          id1: other.id,
          name1: other.nameAr,
          id2: c.id,
          name2: c.nameAr
        });
      }
    } else {
      phoneMap.set(p, c);
    }
  });
});

// 5. Titans vs Pool Overlap (Check if any of the 1,000 Titans is also in the pool)
const titans = companies.filter(c => c.isTitan || (c.id && c.id.startsWith('eg_titan_')));
const pool = companies.filter(c => !c.id || !c.id.startsWith('eg_titan_'));

const titanNormMap = new Map();
titans.forEach(t => {
  const norm = normalizeArabic(t.nameAr);
  if (norm && norm.length >= 4) {
    titanNormMap.set(norm, t);
  }
});

const titanPoolOverlaps = [];
pool.forEach(p => {
  const norm = normalizeArabic(p.nameAr);
  if (norm && titanNormMap.has(norm)) {
    const t = titanNormMap.get(norm);
    titanPoolOverlaps.push({
      titanId: t.id,
      titanName: t.nameAr,
      poolId: p.id,
      poolName: p.nameAr,
      norm
    });
  }
});

console.log('============= AUDIT RESULTS =============');
console.log(`1. Exact ID Duplicates: ${duplicateIds.length}`);
console.log(`2. Exact Name Duplicates: ${exactNameDuplicates.length}`);
console.log(`3. Normalized Name Duplicates: ${normNameDuplicates.length}`);
console.log(`4. Phone Duplicates: ${phoneDuplicates.length}`);
console.log(`5. Titans overlapping with Pool: ${titanPoolOverlaps.length}`);
console.log('=========================================\n');

if (exactNameDuplicates.length > 0) {
  console.log('--- Sample Exact Name Duplicates (Top 5) ---');
  console.log(exactNameDuplicates.slice(0, 5));
}

if (titanPoolOverlaps.length > 0) {
  console.log('--- Sample Titans Overlapping with Pool (Top 5) ---');
  console.log(titanPoolOverlaps.slice(0, 5));
}

// Save detailed report to file
const report = {
  timestamp: new Date().toISOString(),
  totalCompanies: companies.length,
  titansCount: titans.length,
  poolCount: pool.length,
  summary: {
    duplicateIdsCount: duplicateIds.length,
    exactNameDuplicatesCount: exactNameDuplicates.length,
    normNameDuplicatesCount: normNameDuplicates.length,
    phoneDuplicatesCount: phoneDuplicates.length,
    titanPoolOverlapsCount: titanPoolOverlaps.length
  },
  exactNameDuplicates: exactNameDuplicates.slice(0, 50),
  normNameDuplicates: normNameDuplicates.slice(0, 50),
  titanPoolOverlaps: titanPoolOverlaps.slice(0, 50),
  phoneDuplicatesSample: phoneDuplicates.slice(0, 20)
};

fs.writeFileSync(path.join(ROOT, 'scraper', 'output', 'duplicate_audit_report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log('Detailed report written to scraper/output/duplicate_audit_report.json');
