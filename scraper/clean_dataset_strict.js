const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function cleanDataset() {
    console.log('--- Starting Complete Dataset Audit & Purge ---');

    // 1. Build Census POI Types Map
    const censusMap = new Map();
    const censusCsvPath = path.resolve('scraper/output/cairo_giza_master_census.csv');
    if (fs.existsSync(censusCsvPath)) {
        const rl = readline.createInterface({
            input: fs.createReadStream(censusCsvPath),
            crlfDelay: Infinity
        });

        let lineNo = 0;
        for await (const line of rl) {
            lineNo++;
            if (lineNo === 1) continue;
            const parts = line.split(',');
            const nameAr = parts[0] ? parts[0].trim() : '';
            const phone = parts[7] ? parts[7].trim() : '';
            let type = '';
            for (let i = 0; i < parts.length; i++) {
                const p = parts[i].trim();
                if (p.startsWith('GRID_')) {
                    type = parts[i - 1];
                    break;
                }
            }
            if (nameAr) {
                censusMap.set(nameAr + '|' + phone, type);
                // Also map by name alone as fallback
                if (!censusMap.has(nameAr)) {
                    censusMap.set(nameAr, type);
                }
            }
        }
        console.log(`Loaded ${censusMap.size} census mapping records.`);
    }

    // 2. Read current enterprises pool
    const poolPath = path.resolve('crm/js/egypt_enterprises_pool.js');
    const poolRaw = fs.readFileSync(poolPath, 'utf8');
    const jsonStr = poolRaw.substring(poolRaw.indexOf('['), poolRaw.lastIndexOf(']') + 1);
    const pool = JSON.parse(jsonStr);
    console.log(`Original enterprises pool size: ${pool.length}`);

    // Bad POI types from Google Maps census
    const badPoiTypes = new Set([
        // Auto repair & glass & micro services
        'auto_glass_service', 'automotive_repair', 'tire_shop', 'wheel_and_rim_repair',
        'recreation_vehicle_repair', 'motorsport_vehicle_repair', 'auto_customization',
        'car_window_tinting', 'automotive_wheel_polishing_service', 'automotive_services_and_repair',
        'tire_dealer_and_repair', 'motorcycle_repair', 'auto_parts_and_supply_store',
        'car_stereo_store', 'car_wash', 'engine_repair_service', 'oil_change_station',
        'auto_body_shop', 'auto_detailing',

        // Retail stores
        'shopping', 'furniture_store', 'grocery_store', 'health_food_store',
        'building_supply_store', 'wholesale_store', 'fabric_store', 'shopping_center',
        'mattress_store', 'jewelry_store', 'butcher_shop', 'home_improvement_store',
        'hardware_store', 'specialty_foods', 'shoe_store', 'appliance_store',
        'home_goods_store', 'fashion_accessories_store', 'mobile_phone_store', 'bookstore',
        'convenience_store', 'supermarket', 'superstore', 'outlet_store', 'toy_store',
        'uniform_store', 'electronics', 'lighting_store', 'antique_store', 'candy_store',
        'tobacco_shop', 'thrift_store', 'lumber_store', 'cupcake_shop', 'perfume_store',
        'kitchen_supply_store', 'liquor_store', 'kiosk', 'delicatessen', 'luggage_store',
        'gift_shop', 'souvenir_shop', 'cheese_shop', 'lingerie_store', 'musical_instrument_store',
        'eyewear_and_optician', 'flowers_and_gifts_shop', 'carpet_store', 'bridal_shop',
        'e_cigarette_store', 'hobby_shop', 'hunting_and_fishing_supplies', 'audio_visual_equipment_store',
        'pet_store', 'video_game_store', 'sports_wear', 'patio_covers',

        // Food, cafes, restaurants
        'restaurant', 'cafe', 'food', 'food_court', 'food_truck', 'salad_bar',
        'pancake_house', 'donuts', 'diner', 'steakhouse', 'sandwich_shop', 'bakery',
        'smoothie_juice_bar', 'ice_cream_shop', 'chocolatier', 'bar', 'farmers_market',

        // Personal care, beauty, spas, gyms
        'barber', 'hair_salon', 'beauty_salon', 'spas', 'laser_hair_removal',
        'gym', 'skin_care', 'tattoo_and_piercing', 'hair_supply_stores', 'physical_therapy',
        'hair_replacement', 'audiologist',

        // Healthcare / individual clinics / pharmacies
        'pharmacy', 'optometrist', 'dentist', 'doctor', 'hospital', 'surgeon', 'orthopedist',
        'chiropractor', 'diagnostic_services', 'speech_therapist', 'drugstore', 'dermatologist',

        // Entertainment & Sports
        'cinema', 'theatre', 'dance_club', 'swimming_pool', 'fair', 'music_venue',
        'art_museum', 'museum', 'campground', 'movie_television_studio', 'animation_studio',
        'hot_air_balloons_tour', 'batting_cage', 'stadium_arena', 'soccer_field',

        // Education, religious, public
        'tutoring_center', 'education', 'computer_coaching', 'educational_services',
        'church_cathedral', 'religious_organization', 'library', 'courthouse',
        'town_hall', 'embassy', 'monument', 'landmark_and_historical_building', 'mountain', 'river',
        'fountain', 'police_department', 'train_station', 'department_of_motor_vehicles',

        // Micro trades / services
        'laundromat', 'dry_cleaning', 'carpet_cleaning', 'key_and_locksmith',
        'handyman', 'pet_services', 'pool_cleaning', 'luggage_storage', 'septic_services',
        'party_supply', 'party_and_event_planning', 'glass_and_mirror_sales_service',
        'windows_installation', 'interior_design', 'pest_control_service', 'employment_agencies',
        'sewing_and_alterations', 'wedding_planning', 'career_counseling'
    ]);

    // Bad keywords regex for names
    const badNameRegex = /زجاج سيارات|زجاج السيارات|auto glass|سمكري|دوكو|عفشة|غيار زيت|تغيير زيت|غسيل سيارات|كار ووش|لحام كاوتش|بنشر|تصليح كاوتش|رصاص ونيتروجين|ضبط زوايا|ميكانيكي سيارات|ورشة ميكانيكا|ورشة صيانة|كهربائي سيارات|سروجي|شكمانات|ريداتير|تكييف سيارات|قطع غيار مستعملة|سوبر ماركت|سوبرماركت|ميني ماركت|بقالة|كشك|مقلة|محمصة|عطارة|كافيه|مقهى|كافتيريا|مطعم|مشويات|شاورما|فول وطعمية|كشري|بيتزا|فطائر|حلواني|باتيسري|مخبز بلدي|فرن عيش|جزارة|مسمط|حلاق|كوافير|صالون تجميل|بيوتي سنتر|مغسلة|دراي كلين|مكوجي|ترزي|خياط|خياطة|اتيليه|بوتيك|لانجري|صيدلية|مكتبة مدرسية|بلايستيشن|بلاي استيشن|سايبر|شيشة|دخان ومعسل|كشك سجائر|صيانة موبايل|اكسسوارات موبايل|سنتر دروس|حضانة|روضة اطفال|مسجد|جامع|كنيسة|مقابر|مدافن|استوديو تصوير|فوتوغراف|قسم شرطة|مركز شرطة|نقطة شرطة|محطة قطار|محطة مترو|موقف ميكروباص|السحب التوسعي/i;

    const cleanPool = [];
    const excludedStats = {
        noPhone: 0,
        badPoiType: 0,
        badKeyword: 0
    };

    for (let i = 0; i < pool.length; i++) {
        const c = pool[i];
        if (!c) continue;

        const nameAr = (c.nameAr || '').trim();
        const nameEn = (c.nameEn || '').trim();
        const p1 = (c.phone1 || '').trim();
        const mob = (c.mobile || '').trim();
        const p2 = (c.phone2 || '').trim();

        // 1. Phone check: Must have at least one phone
        if (!p1 && !mob && !p2) {
            excludedStats.noPhone++;
            continue;
        }

        // 2. POI Type check (from census mapping)
        const key = nameAr + '|' + p1;
        const poiType = censusMap.get(key) || censusMap.get(nameAr);
        if (poiType && badPoiTypes.has(poiType)) {
            excludedStats.badPoiType++;
            continue;
        }

        // 3. Name check: Eliminate auto glass, mechanics, micro-retail, salons, etc.
        const isCorp = /شركة.*لتوزيع|شركة.*لتوريد|شركة.*للصناعات|مصنع.*للأغذية|شركة.*للتجارة والتوزيع/i.test(nameAr);
        if ((badNameRegex.test(nameAr) || badNameRegex.test(nameEn)) && !isCorp) {
            excludedStats.badKeyword++;
            continue;
        }

        cleanPool.push(c);
    }

    console.log('--- Filtration Results ---');
    console.log(`Total original records: ${pool.length}`);
    console.log(`Excluded (No phone): ${excludedStats.noPhone}`);
    console.log(`Excluded (Bad POI Type): ${excludedStats.badPoiType}`);
    console.log(`Excluded (Bad Keyword): ${excludedStats.badKeyword}`);
    console.log(`Clean verified enterprises kept: ${cleanPool.length}`);

    // Verify no auto glass or Ziad remaining
    const badRemaining = cleanPool.filter(c => /زجاج سيارات|زياد.*زجاج/i.test(c.nameAr || ''));
    console.log(`Remaining auto glass check (must be 0): ${badRemaining.length}`);

    // 4. Save clean data to files
    console.log('Writing updated crm/js/egypt_enterprises_pool.js ...');
    const poolJsContent = `window.__EGYPT_ENTERPRISE_POOL = ${JSON.stringify(cleanPool)};\n`;
    fs.writeFileSync(poolPath, poolJsContent, 'utf8');

    console.log('Writing updated crm/data/egypt_enterprises_pool.json ...');
    const poolJsonPath = path.resolve('crm/data/egypt_enterprises_pool.json');
    fs.writeFileSync(poolJsonPath, JSON.stringify(cleanPool, null, 2), 'utf8');

    // 5. Also update crm/data/companies.json with Titans + Clean Pool
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

    console.log(`Total combined verified companies (Titans ${titans.length} + Pool ${cleanPool.length}): ${allCleanCompanies.length}`);
    console.log('--- Cleanup Complete Successfully! ---');
    return {
        totalKept: allCleanCompanies.length,
        poolKept: cleanPool.length,
        titansCount: titans.length
    };
}

cleanDataset().catch(console.error);
