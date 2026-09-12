const fs = require('fs');
const path = require('path');

async function run() {
    console.log('=== INTEGRATING 33 DYNAMIC COMPANIES INTO PRIMARY POOL ===');

    const poolPath = path.join(__dirname, '../crm/js/egypt_enterprises_pool.js');
    const titansPath = path.join(__dirname, '../crm/js/egypt_verified_titans.js');

    global.window = {};
    eval(fs.readFileSync(titansPath, 'utf8'));
    eval(fs.readFileSync(poolPath, 'utf8'));

    const pool = window.__EGYPT_ENTERPRISE_POOL || [];
    const titans = window.__EGYPT_VERIFIED_TITANS || [];

    console.log(`Current Pool: ${pool.length}, Titans: ${titans.length}, Total: ${pool.length + titans.length}`);

    // 1. Fetch dynamic companies from Firebase
    console.log('Fetching dynamic companies from Firebase...');
    const resp = await fetch('https://fleet-crm-38ba6-default-rtdb.firebaseio.com/dynamic_companies.json');
    const dynamicData = await resp.json();
    const dynamicList = Object.values(dynamicData || {});
    console.log(`Fetched ${dynamicList.length} dynamic companies from Firebase.`);

    if (dynamicList.length !== 33) {
        console.warn(`Warning: expected 33 dynamic companies, found ${dynamicList.length}`);
    }

    let nextId = pool.length + 1; // 26960
    const formattedToAdd = dynamicList.map(c => {
        const compId = `eg_b2b_fleet_${String(nextId).padStart(5, '0')}`;
        nextId++;

        return {
            id: compId,
            nameAr: c.nameAr || c.name || '',
            nameEn: c.nameEn || '',
            sector: c.sector || 'manufacturing',
            city: c.city || 'cairo',
            governorate: c.governorate || 'القاهرة',
            address: c.address || '',
            phone1: c.phone1 || c.mobile || '',
            phone2: c.phone2 || '',
            mobile: c.mobile || c.phone1 || '',
            otherPhones: c.otherPhones || '',
            website: c.website || '',
            google_maps_url: c.google_maps_url || '',
            latitude: c.latitude || null,
            longitude: c.longitude || null,
            fleetSize: c.fleetSize || 18,
            fleetType: c.fleetType || 'شاحنات نقل وتوزيع متوسط',
            priority: c.priority || 'B',
            leadScore: c.leadScore || 70,
            status: c.status || 'new',
            assignedTo: c.assignedTo || '',
            contactPerson: c.contactPerson || '',
            contactTitle: c.contactTitle || '',
            notes: c.notes ? `${c.notes} | مدمج في القاعدة الأساسية` : 'مدمج في القاعدة الأساسية المعتمدة',
            createdAt: c.createdAt || new Date().toISOString(),
            lastUpdated: '2026-09-12'
        };
    });

    const newPool = [...pool, ...formattedToAdd];
    console.log(`New Pool Length: ${newPool.length}`);
    console.log(`New Grand Total (Titans + Pool): ${titans.length + newPool.length}`);

    // Verify 27,026
    if (titans.length + newPool.length !== 27026) {
        throw new Error(`Total count mismatch! Expected 27026, got ${titans.length + newPool.length}`);
    }

    // 2. Write to egypt_enterprises_pool.js
    console.log('Writing updated pool to disk...');
    fs.writeFileSync(poolPath, 'window.__EGYPT_ENTERPRISE_POOL = ' + JSON.stringify(newPool, null, 2) + ';\n', 'utf8');
    console.log('Successfully written to egypt_enterprises_pool.js');

    // 3. Clear dynamic_companies in Firebase & update metadata
    console.log('Clearing dynamic_companies in Firebase cloud...');
    await fetch('https://fleet-crm-38ba6-default-rtdb.firebaseio.com/dynamic_companies.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });

    console.log('Updating Firebase metadata...');
    await fetch('https://fleet-crm-38ba6-default-rtdb.firebaseio.com/metadata.json', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            total_dynamic: 0,
            sync_timestamp: Date.now(),
            updated_at: new Date().toISOString(),
            updated_by: 'pool_consolidation_v216'
        })
    });

    console.log('Firebase cloud updated successfully (dynamic count reset to 0).');
    console.log('=== CONSOLIDATION COMPLETED PERFECTLY ===');
}

run().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
