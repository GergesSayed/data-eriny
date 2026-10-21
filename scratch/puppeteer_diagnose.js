const puppeteer = require('puppeteer-core');

async function run() {
    console.log('🚀 Launching Chrome...');
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1536,864']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1536, height: 864 });

    const logs = [];
    const errors = [];

    page.on('console', msg => {
        const text = msg.text();
        logs.push(`[CONSOLE ${msg.type().toUpperCase()}] ${text}`);
        if (msg.type() === 'error') {
            errors.push(text);
        }
    });

    page.on('pageerror', err => {
        errors.push(`[PAGE ERROR] ${err.toString()}`);
    });

    page.on('requestfailed', req => {
        errors.push(`[REQ FAILED] ${req.method()} ${req.url()}: ${req.failure()?.errorText}`);
    });

    console.log('🌐 Navigating to https://data-eriny.vercel.app/?t=' + Date.now());
    await page.goto('https://data-eriny.vercel.app/?t=' + Date.now(), { waitUntil: 'networkidle2', timeout: 30000 });

    console.log('⏳ Waiting 4 seconds for initialization...');
    await new Promise(r => setTimeout(r, 4000));

    // 1. Version and status
    const ver = await page.evaluate(() => {
        const badge = document.querySelector('.brand-ver-badge');
        return badge ? badge.textContent.trim() : 'N/A';
    });
    console.log('📌 Live Version Badge:', ver);

    await page.evaluate(async () => {
        if (!window.AppStorage.getCurrentUser() && window.App) {
            await window.App.switchUser('admin');
        }
    });

    const currentUser = await page.evaluate(() => {
        return window.AppStorage ? window.AppStorage.getCurrentUser() : null;
    });
    console.log('👤 Current User:', currentUser?.name, `(Role: ${currentUser?.role}, ID: ${currentUser?.id})`);

    const totalComps = await page.evaluate(() => {
        return window.AppStorage?.companiesMemory?.length || 0;
    });
    console.log('🏢 companiesMemory length:', totalComps);

    // 2. Navigate to #companies
    console.log('📂 Navigating to #companies...');
    await page.evaluate(() => {
        window.location.hash = '#companies';
        if (window.App && window.App.navigateTo) window.App.navigateTo('companies');
    });
    await new Promise(r => setTimeout(r, 2000));

    const rowsCount = await page.evaluate(() => {
        return document.querySelectorAll('#companies-tbody tr').length;
    });
    console.log('📋 Companies table rows rendered:', rowsCount);

    const countDisplay = await page.evaluate(() => {
        return document.getElementById('companies-count-display')?.textContent || '';
    });
    console.log('📊 Count display text:', countDisplay);

    // 3. Test Select All
    console.log('\n--- TESTING SELECT ALL CHECKBOX ---');
    await page.evaluate(() => {
        const cb = document.getElementById('select-all-companies');
        if (cb) {
            cb.checked = true;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    await new Promise(r => setTimeout(r, 500));

    const selectState = await page.evaluate(() => {
        return {
            selectedSize: window.Companies?.selectedCompanies?.size,
            bulkBarDisplay: document.getElementById('bulk-actions-bar')?.style.display,
            bulkBarCount: document.getElementById('selected-companies-count')?.textContent
        };
    });
    console.log('Select all state:', selectState);

    // 4. Test Bulk Assign to Peter
    console.log('\n--- TESTING BULK ASSIGN TO PETER ---');
    const peterId = 'usr_1788180884769_rucvo';
    const assignResult = await page.evaluate(async (targetUserId) => {
        const select = document.getElementById('bulk-assign-user-select');
        if (select) select.value = targetUserId;
        await window.Companies.applyBulkAssign();
        return {
            selectedAfter: window.Companies.selectedCompanies.size
        };
    }, peterId);
    console.log('Assign result:', assignResult);

    await new Promise(r => setTimeout(r, 2000));

    // 5. Switch to Peter
    console.log('\n--- SWITCHING TO PETER SAMER ---');
    await page.evaluate(async (targetUserId) => {
        await window.App.switchUser(targetUserId);
        window.App.navigateTo('companies');
    }, peterId);
    await new Promise(r => setTimeout(r, 2000));

    const peterView = await page.evaluate(() => {
        const currentUser = window.AppStorage.getCurrentUser();
        const scoped = window.AppStorage.getScopedCompanies();
        const rows = document.querySelectorAll('#companies-tbody tr').length;
        const countTxt = document.getElementById('companies-count-display')?.textContent || '';
        return {
            userName: currentUser?.name,
            scopedLength: scoped.length,
            rowsRendered: rows,
            countText: countTxt
        };
    });
    console.log('Peter View:', peterView);

    // 6. Switch back to Admin
    console.log('\n--- SWITCHING BACK TO ADMIN ---');
    await page.evaluate(async () => {
        await window.App.switchUser('admin');
        window.App.navigateTo('companies');
    });
    await new Promise(r => setTimeout(r, 2000));

    // Filter by Peter in Admin view
    console.log('Filtering by Peter in Admin view...');
    await page.evaluate(async (targetUserId) => {
        const sel = document.getElementById('filter-assigned');
        if (sel) {
            sel.value = targetUserId;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
        await window.Companies.render();
    }, peterId);
    await new Promise(r => setTimeout(r, 1000));

    const adminFilterPeterRows = await page.evaluate(() => {
        return document.querySelectorAll('#companies-tbody tr').length;
    });
    console.log('Admin filter Peter rows:', adminFilterPeterRows);

    // 7. Bulk Unassign (NEUTRALIZED - DO NOT RUN IN PRODUCTION)
    console.log('\n--- SKIPPING BULK UNASSIGN IN PRODUCTION ---');
    const unassignDebug = { beforeCheck: 0, afterCheck: 0, afterUnassign: 0 };
    console.log('Unassign debug:', unassignDebug);
    await new Promise(r => setTimeout(r, 500));

    const afterUnassignRows = await page.evaluate(() => {
        return document.querySelectorAll('#companies-tbody tr').length;
    });
    console.log('Admin filter Peter rows after unassign:', afterUnassignRows);

    const debugFilterAfterUnassign = await page.evaluate(async (targetUserId) => {
        const compPage = document.getElementById('page-companies');
        const isActive = compPage ? compPage.classList.contains('active') : false;
        const currentHash = window.location.hash;
        const currentViewMode = window.Companies.viewMode;
        
        console.log('[DEBUG] Calling render() manually...');
        await window.Companies.render();
        
        const queryRes = await window.AppStorage.queryCompanies({ assigned: targetUserId });
        const tbodyRows = document.querySelectorAll('#companies-tbody tr').length;
        const emptyDisplay = document.getElementById('companies-empty')?.style.display;
        return { isActive, currentHash, currentViewMode, queryResTotal: queryRes.total, tbodyRows, emptyDisplay };
    }, peterId);
    console.log('debugFilterAfterUnassign:', debugFilterAfterUnassign);

    // 8. Switch to Peter to verify 0
    await page.evaluate(async (targetUserId) => {
        await window.App.switchUser(targetUserId);
        window.App.navigateTo('companies');
    }, peterId);
    await new Promise(r => setTimeout(r, 2000));

    const peterAfterUnassign = await page.evaluate(() => {
        const scoped = window.AppStorage.getScopedCompanies();
        const rows = document.querySelectorAll('#companies-tbody tr').length;
        return { scopedLength: scoped.length, rowsRendered: rows };
    });
    console.log('Peter view after unassign:', peterAfterUnassign);

    console.log('\n=== CAPTURED ERRORS ===');
    console.log(errors.length > 0 ? errors.join('\n') : 'NO ERRORS! 0 ERRORS!');

    console.log('\n=== RECENT RELEVANT CONSOLE LOGS ===');
    console.log(logs.slice(-25).join('\n'));

    await browser.close();
}

run().catch(e => {
    console.error('Fatal script error:', e);
    process.exit(1);
});
