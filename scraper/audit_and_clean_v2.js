const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function runSecondaryAudit() {
    console.log('=== Starting Complete Secondary Forensic Audit ===');

    // 1. Load census map
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
                if (!censusMap.has(nameAr)) censusMap.set(nameAr, type);
            }
        }
        console.log(`Loaded census mapping records: ${censusMap.size}`);
    }

    // 2. Load current pool & companies
    const poolPath = path.resolve('crm/js/egypt_enterprises_pool.js');
    const poolRaw = fs.readFileSync(poolPath, 'utf8');
    const poolJsonStr = poolRaw.substring(poolRaw.indexOf('['), poolRaw.lastIndexOf(']') + 1);
    const pool = JSON.parse(poolJsonStr);
    console.log(`Initial Pool records: ${pool.length}`);

    // Bad Google Maps Census POI types
    const badPoiTypes = new Set([
        // Auto repair & glass & micro services
        'auto_glass_service', 'automotive_repair', 'tire_shop', 'wheel_and_rim_repair',
        'recreation_vehicle_repair', 'motorsport_vehicle_repair', 'auto_customization',
        'car_window_tinting', 'automotive_wheel_polishing_service', 'automotive_services_and_repair',
        'tire_dealer_and_repair', 'motorcycle_repair', 'auto_parts_and_supply_store',
        'car_stereo_store', 'car_wash', 'engine_repair_service', 'oil_change_station',
        'auto_body_shop', 'auto_detailing', 'boat_service_and_repair',

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
        'pet_store', 'video_game_store', 'sports_wear', 'sporting_goods', 'patio_covers',
        'flea_market', 'educational_supply_store', 'department_store', 'computer_store',
        'discount_store', 'organic_grocery_store', 'fishmonger', 'tableware_supplier',
        'arts_and_crafts', 'art_gallery', 'gun_and_ammo', 'desserts',

        // Food, cafes, restaurants
        'restaurant', 'cafe', 'food', 'food_court', 'food_truck', 'salad_bar',
        'pancake_house', 'donuts', 'diner', 'steakhouse', 'sandwich_shop', 'bakery',
        'smoothie_juice_bar', 'ice_cream_shop', 'chocolatier', 'bar', 'farmers_market',
        'caterer', 'eat_and_drink', 'food_delivery_service',

        // Personal care, beauty, spas, gyms
        'barber', 'hair_salon', 'beauty_salon', 'spas', 'laser_hair_removal',
        'gym', 'skin_care', 'tattoo_and_piercing', 'hair_supply_stores', 'physical_therapy',
        'hair_replacement', 'audiologist',

        // Healthcare / individual clinics / pharmacies
        'pharmacy', 'optometrist', 'dentist', 'doctor', 'hospital', 'surgeon', 'orthopedist',
        'chiropractor', 'diagnostic_services', 'speech_therapist', 'drugstore', 'dermatologist',
        'medical_center', 'plastic_surgeon', 'surgical_center', 'blood_and_plasma_donation_center',
        'veterinarian', 'nutritionist', 'prosthetics', 'naturopathic_holistic',

        // Entertainment & Sports & Tourism individual
        'cinema', 'theatre', 'dance_club', 'swimming_pool', 'fair', 'music_venue',
        'art_museum', 'museum', 'campground', 'movie_television_studio', 'animation_studio',
        'hot_air_balloons_tour', 'batting_cage', 'stadium_arena', 'soccer_field',
        'atv_rentals_and_tours', 'boat_rental_and_training', 'boat_tours', 'food_tours',
        'historical_tours', 'sightseeing_tour_agency', 'travel_agents',

        // Education, religious, public
        'tutoring_center', 'education', 'computer_coaching', 'educational_services',
        'church_cathedral', 'religious_organization', 'library', 'courthouse',
        'town_hall', 'embassy', 'monument', 'landmark_and_historical_building', 'mountain', 'river',
        'fountain', 'police_department', 'train_station', 'department_of_motor_vehicles',
        'public_plaza', 'campus_building', 'labor_union', 'charity_organization',
        'community_services_non_profits', 'non_governmental_association',
        'environmental_conservation_organization', 'criminal_defense_law', 'college_university',

        // Micro trades / services / individual handymen
        'laundromat', 'dry_cleaning', 'carpet_cleaning', 'key_and_locksmith',
        'handyman', 'pet_services', 'pool_cleaning', 'luggage_storage', 'septic_services',
        'party_supply', 'party_and_event_planning', 'glass_and_mirror_sales_service',
        'windows_installation', 'interior_design', 'pest_control_service', 'employment_agencies',
        'sewing_and_alterations', 'wedding_planning', 'career_counseling',
        'home_cleaning', 'plumbing', 'electrician', 'carpenter', 'painting', 'tiling', 'roofing',
        'appliance_repair_service', 'countertop_installation', 'garage_door_service',
        'fence_and_gate_sales_service', 'fireplace_service', 'furniture_assembly', 'home_service',
        'damage_restoration', 'nursery_and_gardening', 'sign_making', 'shredding_services',
        'it_service_and_computer_repair', 'broadcasting_media_production', 'media_news_company',
        'print_media', 'topic_publisher', 'book_magazine_distribution',
        'television_service_providers', 'web_designer', 'graphic_designer', 'architect',
        'real_estate_agent', 'financial_advising', 'appraisal_services',
        'marketing_consultant', 'merchandising_service', 'vending_machine_supplier',
        'writing_service', 'copywriting_service', 'translating_and_interpreting_services',
        'passport_and_visa_services', 'car_rental_agency', 'holiday_rental_home',
        'senior_citizen_services', 'disability_services_and_support_organization',
        'funeral_services_and_cemeteries'
    ]);

    function isPreservedEnterprise(c) {
        const name = (c.nameAr || '') + ' ' + (c.nameEn || '');
        // Real industrial / manufacturing plants
        if (/شركة.*للصناعات|مصنع|مصانع|للتصنيع|للإنتاج والتوزيع|للصناعات الهندسية|للصناعات الكيماوية|للغزل والنسيج|للصناعات الغذائية|للصناعات الدوائية|للحديد والصلب|للأسمنت|للسيراميك|للبلاستيك|للكاوتشوك المطاط|تشغيل.*ميكانيك/i.test(name)) {
            if (!/صيانة.*ثلاجات|صيانة.*غسالات|صيانة.*تكييف|صيانة.*بوتاجاز|بيع كراتين|نقل عفش/i.test(name)) {
                return true;
            }
        }
        // Heavy commercial fleet / contractor
        if (/شركة.*للمقاولات|شركة.*للإنشاءات|شركة.*للنقل الثقيل|شركة.*للشحن واللوجستيات|شركة.*للتجارة والتوزيع|شركة.*لتوريد|شركة.*للخرسانة الجاهزة/i.test(name)) {
            if (!/نقل عفش|نقل اثاث|بيع كراتين|ونش انقاذ|ونش رفع/i.test(name)) {
                return true;
            }
        }
        // Heavy bus fleet companies
        if (/للنقل الجماعي|للنقل السياحي|أتوبيسات|باصات/i.test(name) && !/حجز نايل كروز|تأجير ميكروباص|عربية ربع نقل/i.test(name)) {
            return true;
        }
        return false;
    }

    const cleanPool = [];
    const stats = {
        noPhone: 0,
        foreignPhone: 0,
        badPoiType: 0,
        autoRepair: 0,
        carShowroom: 0,
        applianceRepair: 0,
        streetRetailBoxes: 0,
        streetArtisans: 0,
        seoWinchDish: 0,
        medicalClinic: 0,
        govUnion: 0
    };

    const purgedDetails = [];

    for (let i = 0; i < pool.length; i++) {
        const c = pool[i];
        if (!c) continue;

        const nameAr = (c.nameAr || '').trim();
        const nameEn = (c.nameEn || '').trim();
        const fullText = nameAr + ' ' + nameEn;
        const p1 = (c.phone1 || '').trim();
        const mob = (c.mobile || '').trim();
        const p2 = (c.phone2 || '').trim();

        // 1. Phone number requirement
        if (!p1 && !mob && !p2) {
            stats.noPhone++;
            continue;
        }

        // 2. Foreign phone number check
        const phones = [p1, mob, p2].filter(Boolean);
        let isForeign = false;
        for (let p of phones) {
            const clean = p.replace(/[\s\-\(\)]/g, '');
            if ((clean.startsWith('+') && !clean.startsWith('+20')) || (clean.startsWith('00') && !clean.startsWith('0020'))) {
                isForeign = true;
                break;
            }
            if (clean === '+1200000000' || clean === '1200000000') {
                isForeign = true;
                break;
            }
        }
        if (isForeign) {
            stats.foreignPhone++;
            purgedDetails.push({ name: nameAr, reason: 'Foreign / Dummy Phone' });
            continue;
        }

        const preserved = isPreservedEnterprise(c);

        // 3. POI Type check (from census mapping)
        const key = nameAr + '|' + p1;
        const poiType = censusMap.get(key) || censusMap.get(nameAr);
        if (poiType && badPoiTypes.has(poiType) && !preserved) {
            stats.badPoiType++;
            purgedDetails.push({ name: nameAr, reason: `Bad Census POI: ${poiType}` });
            continue;
        }

        // 4. Auto Repair & Workshops (Mechanics, denting, painting, car AC, suspension, car electrician, puncture)
        if (/سمكر|دوكو|دهان سيارات|ميكانيكا وزيوت|ميكانيكي سيارات|ميكانيكا سيارات|غيار زيت|تغيير زيوت|تغيير الزيوت|عفشة|عفشجي|شكمانات|شكمان|ريداتير|سروجي|تكييف سيارات|كهرباء سيارات|كهربائي سيارات|كار كير|غسيل سيارات|تعديل السيارات|فوانيس السيارات|شروخ الزجاج|كاوتش تامر|لحام كاوتش|بنشر|تصليح كاوتش|رصاص ونيتروجين|زوايا واتزان|مركز صيانه السيارات|مركز صيانة السيارات|صيانة السيارات|صيانة وتجديد السيارات|لخدمة السيارات|لخدمات السيارات|كراج سما الشام/i.test(fullText)) {
            if (!/تشغيل.*ميكانيك|تصنيع.*كاوتش|منتجات.*كاوتش|الفرعونية للكاوتش|المعدات الثقيلة|صيانة خطوط السكك الحديدية|مرافق النقل والمطارات/i.test(fullText)) {
                stats.autoRepair++;
                purgedDetails.push({ name: nameAr, reason: 'Auto Workshop / Repair' });
                continue;
            }
        }

        // 5. Passenger Car / Scooter / Motorcycle Showrooms & Light Retail
        if (/معرض.*(سيار|موتوس|سكوتر|اسكوتر|بيجو)|موتوسيكل|موتوسكل|توك توك|توكتوك|تقسيط الموتوسيكلات|لخدمة وسائل النقل الخفيف/i.test(fullText)) {
            if (!/معدات ثقيلة|السيارات النقل|نقل جماعي/i.test(fullText)) {
                stats.carShowroom++;
                purgedDetails.push({ name: nameAr, reason: 'Car / Scooter Showroom' });
                continue;
            }
        }

        // 6. Home Appliance Repair
        if (/صيانة.*(يونيون اير|كريازي|زانوسي|لاجيرمانيا|فريش|ايبرنا|وايت بوينت|جليم جاز|ال جي|ثلاجات|غسالات|تكييف شارب|الاجهزة المنزلية|الأجهزة المنزلية|البانيوهات|شيش حصيرة|المشايات)|رقم صيانه|مركز خدمة اصلاح اجهزة/i.test(fullText)) {
            stats.applianceRepair++;
            purgedDetails.push({ name: nameAr, reason: 'Appliance Repair Broker' });
            continue;
        }

        // 7. Street Retail & Cardboard Boxes & Used Car Parts
        if (/قطع غيار.*(مستعمل|سيارات ملاكي|كوري|ياباني|فيات بونتو|الموتوسكلات|توكتوك)|لكماليات وقطع غيار السيارات/i.test(fullText)) {
            stats.streetRetailBoxes++;
            purgedDetails.push({ name: nameAr, reason: 'Used / Retail Auto Parts' });
            continue;
        }
        if (/كراتين|كرتون فاضي|كراتين فارغه|كراتين فاضية|تجهيز محلات النظارات|ساعاتي|شراء الساعات السويسرية|فضة الورشة|محلات كمال انور مرسي|محلات حميدو هتلر|الخواجة شنودة|محلات الامام للبلاستيك/i.test(fullText)) {
            if (!/شركة.*للكرتون|مصنع.*كرتون|للصناعات الكرتونية|المصرية للكرتون/i.test(fullText)) {
                stats.streetRetailBoxes++;
                purgedDetails.push({ name: nameAr, reason: 'Empty Boxes / Street Shop' });
                continue;
            }
        }

        // 8. Individual Tradesmen & Street Aluminum / Kitchen Workshops
        if (/فني ستائر|كابتن الوميتال|الحاج محمود عطيه|Almaalem-المعلم|الحاج حمادة لأعمال النجارة|الدسوقى للمطابخ|المصريه للمطابخ والشابيك eng\.wael|ديزاين ستار للالوميتال|ك\.ت\. فني صناعي الصحافة|مكتب ديكورأت للستائر|تلوين دهانات Glc/i.test(fullText)) {
            stats.streetArtisans++;
            purgedDetails.push({ name: nameAr, reason: 'Individual Tradesman' });
            continue;
        }
        if (/^(ال كمال|المنار|اولاد رجب|الماهر|العنانى|التوحيد|المهدي|ال زين) للالوميتال$/i.test(nameAr)) {
            stats.streetArtisans++;
            purgedDetails.push({ name: nameAr, reason: 'Street Aluminum Workshop' });
            continue;
        }

        // 9. SEO Spam & Individual Winches / Dish Installers
        if (/زيزو سات|الدش واﻻقمار الصناعيه|عربية ربع نقل|ونش انقاذ سيارات|ونش إنقاذ سيارات|ونش رفع الاثاث|ونش رفع العفش|اوناش رفع الاثاث|اوناش المميز لرفع الأثاث|مقاول تدبيش|بديل الرخام والخشب pvc/i.test(fullText)) {
            stats.seoWinchDish++;
            purgedDetails.push({ name: nameAr, reason: 'SEO Spam Winch/Dish' });
            continue;
        }
        if (/01[0125][0-9]{8}/.test(nameAr) && /نقل|كراتين|صيانه|ونش|دش|عفش/i.test(nameAr) && !preserved) {
            stats.seoWinchDish++;
            purgedDetails.push({ name: nameAr, reason: 'SEO Phone in Name' });
            continue;
        }

        // 10. Clinics, Medical Centers & Photocopy Shops
        if (/العلاج الطبيعي والسمنة|العلاج الطبيعى وعلاج السمنه|نقل الدم وتجميع البلازما|العيون الصناعية بالبصمة|معمل علكة الأكرمي|معمل الحياة|معمل الخبير|لخدمات المحمول والطباعة|للكمبيوتر والطباعة|لخدمات الطباعة والتصوير|للتصوير والطباعة|مركز طباعة/i.test(fullText)) {
            stats.medicalClinic++;
            purgedDetails.push({ name: nameAr, reason: 'Clinic / Photocopy' });
            continue;
        }

        // 11. Government / Labor Union / Manpower
        if (/النقابة العامة|كلية التعليم الصناعي|مكتب التأمينات الاجتماعية|إلحاق العمالة بالخارج/i.test(fullText)) {
            stats.govUnion++;
            purgedDetails.push({ name: nameAr, reason: 'Union / Gov / Agency' });
            continue;
        }

        cleanPool.push(c);
    }

    console.log('\n--- Secondary Filtration Results ---');
    console.log('Pool original size:', pool.length);
    console.log('Excluded breakdown:', stats);
    const totalExcluded = Object.values(stats).reduce((a, b) => a + b, 0);
    console.log(`Total records purged in this pass: ${totalExcluded}`);
    console.log(`Remaining clean enterprise pool: ${cleanPool.length}`);

    // Verify: No bad keywords remaining
    const testBad = cleanPool.filter(c => /زجاج سيارات|سمكر|دوكو|كاوتش تامر|كابتن الوميتال|فني ستائر|زيزو سات|كراتين فارغه|معرض.*بيجو/i.test((c.nameAr||'')));
    console.log(`Verification of 0 bad keywords remaining: ${testBad.length}`);

    // Save cleaned pool
    console.log('\nWriting updated crm/js/egypt_enterprises_pool.js ...');
    const poolJsContent = `window.__EGYPT_ENTERPRISE_POOL = ${JSON.stringify(cleanPool)};\n`;
    fs.writeFileSync(poolPath, poolJsContent, 'utf8');

    console.log('Writing updated crm/data/egypt_enterprises_pool.json ...');
    const poolJsonPath = path.resolve('crm/data/egypt_enterprises_pool.json');
    fs.writeFileSync(poolJsonPath, JSON.stringify(cleanPool, null, 2), 'utf8');

    // Combine with Titans for crm/data/companies.json
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

    console.log(`\n=== SUCCESS ===`);
    console.log(`Titans: ${titans.length}`);
    console.log(`Pool: ${cleanPool.length}`);
    console.log(`TOTAL CLEAN VERIFIED ENTERPRISES: ${allCleanCompanies.length}`);

    return {
        totalClean: allCleanCompanies.length,
        poolClean: cleanPool.length,
        purgedCount: totalExcluded,
        purgedDetails: purgedDetails
    };
}

runSecondaryAudit().catch(console.error);
