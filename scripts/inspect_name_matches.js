const fs = require('fs');
const companies = JSON.parse(fs.readFileSync('crm/data/companies.json', 'utf8'));

const normalizeStr = (str) => {
    if (!str) return '';
    return String(str).toLowerCase().trim()
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/[^a-z0-9\u0600-\u06FF]/gi, '');
};

const genericStopWords = new Set(['شركه', 'مجموعه', 'الشركه', 'المجموعه', 'مصنع', 'المصنع', 'مصر', 'القاهره', 'group', 'co', 'ltd', 'inc', 'egypt', 'company', 'factory', 'global', 'international', 'trade', 'trading']);

const nameMap = new Map();
companies.forEach(c => {
    const nameArNorm = normalizeStr(c.nameAr);
    const nameEnNorm = normalizeStr(c.nameEn);

    if (nameArNorm && nameArNorm.length >= 4 && !genericStopWords.has(nameArNorm)) {
        if (!nameMap.has(nameArNorm)) nameMap.set(nameArNorm, []);
        nameMap.get(nameArNorm).push({ id: c.id, nameAr: c.nameAr, nameEn: c.nameEn, type: 'ar' });
    }
    if (nameEnNorm && nameEnNorm.length >= 4 && !genericStopWords.has(nameEnNorm)) {
        if (!nameMap.has(nameEnNorm)) nameMap.set(nameEnNorm, []);
        nameMap.get(nameEnNorm).push({ id: c.id, nameAr: c.nameAr, nameEn: c.nameEn, type: 'en' });
    }
});

let count = 0;
nameMap.forEach((list, key) => {
    const ids = Array.from(new Set(list.map(x => x.id)));
    if (ids.length > 1) {
        count++;
        console.log(`\n#${count} Match on [${key}]`);
        ids.forEach(id => {
            const item = companies.find(c => c.id === id);
            console.log(`  - [${item.id}] (AR: ${item.nameAr}) (EN: ${item.nameEn})`);
        });
    }
});
console.log('\nTotal duplicate groups:', count);
