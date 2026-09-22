const fs = require('fs');
const companies = JSON.parse(fs.readFileSync('crm/data/companies.json', 'utf8'));

const normalizePhone = (num) => {
    if (!num) return '';
    const cleaned = String(num).replace(/[^0-9]/g, '');
    if (cleaned.length >= 8) return cleaned.slice(-8);
    return cleaned;
};

const phoneMap = new Map();
companies.forEach(c => {
    const mainPhoneNorm = normalizePhone(c.phone1 || c.mobile || c.phone2);
    if (mainPhoneNorm && mainPhoneNorm.length >= 8) {
        if (!phoneMap.has(mainPhoneNorm)) phoneMap.set(mainPhoneNorm, []);
        phoneMap.get(mainPhoneNorm).push(c);
    }
});

let shown = 0;
phoneMap.forEach((list, phone) => {
    const ids = new Set(list.map(x => x.id));
    if (ids.size > 1 && shown < 8) {
        shown++;
        console.log(`\n#${shown} Phone: ${phone}`);
        list.forEach(c => {
            console.log(`   [${c.id}] ${c.nameAr} | ${c.city} | ${c.sector} | ${c.phone1 || c.mobile}`);
        });
    }
});
