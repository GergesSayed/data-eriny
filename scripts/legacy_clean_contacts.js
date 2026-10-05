const fs = require('fs');
const path = require('path');

// 1. Clean egypt_verified_titans.js
const titansPath = path.join(__dirname, 'data-eriny', 'crm', 'js', 'egypt_verified_titans.js');
if (fs.existsSync(titansPath)) {
    let titansContent = fs.readFileSync(titansPath, 'utf8');
    const beforeCount = (titansContent.match(/"contactPerson":\s*"[^"]+"/g) || []).length;
    titansContent = titansContent.replace(/"contactPerson":\s*"[^"]*"/g, '"contactPerson": ""');
    titansContent = titansContent.replace(/"contactTitle":\s*"[^"]*"/g, '"contactTitle": ""');
    fs.writeFileSync(titansPath, titansContent, 'utf8');
    console.log(`Cleaned egypt_verified_titans.js: cleared ${beforeCount} contactPerson fields.`);
}

// 2. Clean json files
const compJsonPaths = [
    path.join(__dirname, 'data-eriny', 'crm', 'data', 'companies.json'),
    path.join(__dirname, 'data-eriny', 'crm', 'data', 'egypt_enterprises_pool.json'),
    path.join(__dirname, 'data-eriny', 'crm', 'data', 'egypt_verified_titans.json')
];

for (const p of compJsonPaths) {
    if (fs.existsSync(p)) {
        try {
            console.log(`Checking ${p}...`);
            const data = JSON.parse(fs.readFileSync(p, 'utf8'));
            if (Array.isArray(data)) {
                let cleared = 0;
                for (const item of data) {
                    if (item.contactPerson) {
                        item.contactPerson = '';
                        cleared++;
                    }
                    if (item.contactTitle) {
                        item.contactTitle = '';
                    }
                }
                fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
                console.log(`Cleaned ${p}: cleared ${cleared} contactPerson fields.`);
            }
        } catch (e) {
            console.error(`Error processing ${p}:`, e.message);
        }
    }
}
