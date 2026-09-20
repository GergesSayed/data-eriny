const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function executeFourthPass() {
    console.log('=== Executing Fourth Forensic Purge Pass ===');

    // 1. Build Census Map
    const censusMap = new Map();
    const censusCsvPath = path.resolve('scraper/output/cairo_giza_master_census.csv');
    if (fs.existsSync(censusCsvPath)) {
        const rl = readline.createInterface({
            input: fs.createReadStream(censusCsvPath),
            crlfDelay: Infinity
        });
        for await (const line of rl) {
            const parts = line.split(',');
            const nameAr = parts[0] ? parts[0].trim() : '';
            const phone = parts[7] ? parts[7].trim() : '';
            let type = '';
            for (let i = 0; i < parts.length; i++) {
                const p = parts[i].trim();
                if (p.startsWith('GRID_')) { type = parts[i - 1]; break; }
            }
            if (nameAr && type) {
                censusMap.set(nameAr + '|' + phone, type);
                if (!censusMap.has(nameAr)) censusMap.set(nameAr, type);
            }
        }
    }

    // 2. Load Pool
    const poolPath = path.resolve('crm/js/egypt_enterprises_pool.js');
    const poolRaw = fs.readFileSync(poolPath, 'utf8');
    const poolJsonStr = poolRaw.substring(poolRaw.indexOf('['), poolRaw.lastIndexOf(']') + 1);
    const pool = JSON.parse(poolJsonStr);
    console.log(`Current Pool records: ${pool.length}`);

    function isPreservedEnterprise(c) {
        const text = (c.nameAr || '') + ' ' + (c.nameEn || '');
        if (/شركة.*للصناعات|مصنع|مصانع|للتصنيع|للإنتاج والتوزيع|للصناعات الهندسية|للصناعات الكيماوية|للغزل والنسيج|للصناعات الغذائية|للصناعات الدوائية|للحديد والصلب|للأسمنت|للسيراميك|للبلاستيك|للكاوتشوك المطاط|تشغيل.*ميكانيك|بتروجيت|رخام.*جرانيت|الرخام والجرانيت|Industries/i.test(text)) return true;
        if (/شركة.*للمقاولات|شركة.*للإنشاءات|شركة.*للخرسانة الجاهزة|شركة.*للنقل الثقيل|شركة.*للشحن واللوجستيات|المقاولات العامة/i.test(text)) return true;
        if (/للنقل الجماعي|للنقل السياحي|أتوبيسات|باصات|النقل النهرى|النقل البري/i.test(text)) return true;
        return false;
    }

    const badCensusTypes = new Set([
        'car_dealer', 'used_car_dealer', 'motorcycle_dealer', 'car_stereo_store', 'car_rental_agency',
        'limo_services', 'automobile_leasing', 'taxi_service', 'towing_service', 'airport_shuttles',
        'flea_market', 'department_store', 'desserts', 'sporting_goods', 'bags_luggage_company',
        'linen', 'fashion', 'outdoor_gear', 'photography_store_and_services', 'event_photography',
        'music_production', 'record_label', 'arts_and_entertainment', 'active_life', 'accommodation',
        'real_estate_service', 'real_estate_investment', 'real_estate_agent', 'commercial_real_estate', 'property_management',
        'advertising_agency', 'marketing_agency', 'internet_marketing_service', 'business_advertising', 'mass_media',
        'software_development', 'information_technology_company', 'computer_hardware_company', 'internet_service_provider',
        'architectural_designer', 'legal_services', 'accountant', 'brokers', 'insurance_agency', 'investing', 'financial_service',
        'central_government_office', 'public_service_and_government', 'community_services_non_profits', 'organization', 'housing_authorities',
        'health_and_medical', 'surgical_appliances_and_supplies', 'medical_supply', 'medical_service_organizations',
        'medical_research_and_development', 'vitamins_and_supplements', 'cosmetic_and_beauty_supplies', 'beauty_product_supplier',
        'janitorial_services', 'home_service', 'landscaping', 'electrician', 'carpenter', 'boat_parts_and_supply_store', 'boat_dealer', 'mobile_home_dealer'
    ]);

    const cleanPool = [];
    let purgedCount = 0;
    const stats = {};

    for (let i = 0; i < pool.length; i++) {
        const c = pool[i];
        if (!c) continue;

        const name = (c.nameAr || '').trim();
        const nameEn = (c.nameEn || '').trim();
        const p1 = (c.phone1 || '').trim();
        const fullText = name + ' ' + nameEn;

        let shouldPurge = false;
        let reason = '';

        if (/مبيضين المحاره|الجبس بورد|تركيب السيراميك الكسر|عيش الرفاهيه في العجمي|بوابتك للإستثمار في العاصمة|ما تبحث عنه فى مشروعات مجموعة طلعت مصطفى/i.test(fullText)) {
            shouldPurge = true;
            reason = 'Handyman/Chalet';
        } else if (/Bath & Body Works|Max Muscle|IMTENAN|Imtenan|1897 The Bar|كاسات حجامه|المتميز للعيون الصناعية|توريد العماله المنزلية|ملعب السكة الحديد|مرور البساتين|جهاز حماية المستهلك|مصلحة الرقابة الصناعية|الوحدة المحلية|وزارة النقل|وزارة البترول|وزاره الانتاج الحريى|هيئة الرقابة الإدارية|شرطة النقل والمواصلات|قرض الأطباء|تداول الاوراق المالية|تداول الأوراق المالية|شركة مصر للمقاصة|تحصيل الديون|هندسة الزلازل/i.test(fullText)) {
            shouldPurge = true;
            reason = 'Mall/Clinic/Gov';
        } else if (/كاميرات المراقبه|كاميرات مراقبة|الانظمه الامنيه وكاميرات|CCTV|Camgraphy|كروما تأجير|Dynamic studio|فرش سيارات/i.test(fullText)) {
            shouldPurge = true;
            reason = 'CCTV/Studio';
        } else {
            const poi = censusMap.get(name + '|' + p1) || censusMap.get(name);
            if (poi && badCensusTypes.has(poi) && !isPreservedEnterprise(c)) {
                shouldPurge = true;
                reason = 'Census: ' + poi;
            }
        }

        if (shouldPurge) {
            purgedCount++;
            stats[reason] = (stats[reason] || 0) + 1;
        } else {
            cleanPool.push(c);
        }
    }

    console.log('--- Fourth Pass Results ---');
    console.log('Total purged from pool:', purgedCount);
    console.log('Purged reasons:', stats);
    console.log('Remaining pool count:', cleanPool.length);

    // Save cleaned pool
    console.log('Writing updated crm/js/egypt_enterprises_pool.js ...');
    const poolJsContent = `window.__EGYPT_ENTERPRISE_POOL = ${JSON.stringify(cleanPool)};\n`;
    fs.writeFileSync(poolPath, poolJsContent, 'utf8');

    console.log('Writing updated crm/data/egypt_enterprises_pool.json ...');
    const poolJsonPath = path.resolve('crm/data/egypt_enterprises_pool.json');
    fs.writeFileSync(poolJsonPath, JSON.stringify(cleanPool, null, 2), 'utf8');

    // Combine with Titans
    console.log('Updating crm/data/companies.json ...');
    let titans = [];
    const titansPath = path.resolve('crm/data/egypt_verified_titans.json');
    if (fs.existsSync(titansPath)) {
        try {
            titans = JSON.parse(fs.readFileSync(titansPath, 'utf8'));
        } catch(e) {}
    }
    const allCleanCompanies = [...titans, ...cleanPool];
    const companiesJsonPath = path.resolve('crm/data/companies.json');
    fs.writeFileSync(companiesJsonPath, JSON.stringify(allCleanCompanies), 'utf8');

    console.log(`=== SUCCESS: Fourth Pass Complete ===`);
    console.log(`Titans: ${titans.length}`);
    console.log(`Clean Pool: ${cleanPool.length}`);
    console.log(`TOTAL CLEAN VERIFIED B2B ENTERPRISES: ${allCleanCompanies.length}`);
}

executeFourthPass().catch(console.error);
