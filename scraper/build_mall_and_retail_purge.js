const fs = require('fs');
const comps = require('../crm/data/companies.json');

function isProtectedTitan(c) {
    if (c.id && c.id.startsWith('eg_titan_')) return true;
    const name = (c.nameAr || c.name || '').trim();
    const eng = (c.nameEn || '').trim();
    const text = (name + ' ' + eng).toLowerCase();
    if (/gipsina|sina gips|duravit|electrolux|cleopatra|oriental weavers|totalenergies|elsewedy|kandil steel|egypt aluminium|alpla 10th|friday ice cream|startex|solex|soven|unipack|rich bake|halwani|جهينة|دومتي|إيديتا|بيتي|شيبسي|عبور لاند|حديد عز|السويدي|لافارج|سيمكس|بتروجيت|المقاولون العرب|أوراسكوم|حسن علام|redcon|novartis|unilever|gac egypt|taki|مراتب تاكى|مصنع قادر|مونتانا|جوهر ستيل|الفجر ستيل|الشناوي تانك|بولي تكس|حورس للتهويه|روتوكرافيا|rotografia|compo expert|volvo cars egypt/i.test(text)) return true;
    if (c.id === 'eg_b2b_fleet_36999' || c.id === 'eg_b2b_fleet_41215') return true;
    return false;
}

// Complete list of verified non-fleet entities across all sectors
const targetIds = [
    // 1. Stationeries & Bookstores
    'eg_b2b_fleet_26292', // Bernasos Stationery (برناسوس للأدوات المكتبية والمدرسية)
    'eg_b2b_fleet_26533', // Bakier Stationery (مكتبة بكير بمول العرب)
    'eg_b2b_fleet_26769', // Khodeir Stationery (مكتبة خضير بداندي ميجا مول)

    // 2. Jewelry & Mall Boutiques
    'eg_b2b_fleet_26511', // Jewel Hub (مجوهرات بمول العرب)

    // 3. Clinics, Beauty & Wellness
    'eg_b2b_fleet_26692', // La baraque Clinique (عيادة تجميل بمول تريفيوم)

    // 4. Auto Garages, Detailing, Oil Change, Alignment, Radiators & Passenger Car Showrooms
    'eg_b2b_fleet_25201', // بتاع لصق (داون تاون مول)
    'eg_b2b_fleet_25280', // السوري لكمليات السيارات
    'eg_b2b_fleet_25287', // أوتو السخاوى للسيارات
    'eg_b2b_fleet_25182', // أبو عيسى للسيارات
    'eg_b2b_fleet_25301', // المهندس لتكنولوجيا السيارات
    'eg_b2b_fleet_25344', // سوريا كار
    'eg_b2b_fleet_25646', // Autofresh (غسيل سيارات جراج أركان مول)
    'eg_b2b_fleet_25752', // Nour Auto
    'eg_b2b_fleet_25882', // رينو الشرقاوي
    'eg_b2b_fleet_25921', // اسلام زوايا
    'eg_b2b_fleet_25994', // دلل سيارتك
    'eg_b2b_fleet_26188', // Bara Auto
    'eg_b2b_fleet_26190', // Master Car ماستر كار
    'eg_b2b_fleet_26328', // الفارسان لايجار السيارات
    'eg_b2b_fleet_26348', // الكبيسي للسيارات (مول علي الدين)
    'eg_b2b_fleet_26392', // سيارات محمود حمد
    'eg_b2b_fleet_26433', // محمد كرم -Mauto
    'eg_b2b_fleet_26588', // المعز ليموزين (المعز مول)
    'eg_b2b_fleet_26590', // Auto (ELMoz Mall)
    'eg_b2b_fleet_26679', // Bestune Egypt - بستيون مصر (الصفا مول معرض سيارات ملاكي)
    'eg_b2b_fleet_26684', // Guru Protection (Majarrah Mall - حماية وتفييم سيارات)
    'eg_b2b_fleet_26875', // أحمد الدمشقي للردتيرات (سنتر الشباب)
    'eg_b2b_fleet_25073', // الأمير للسيارات

    // 5. Turning Lathes, Retail Parts, Bearings & Scales
    'eg_b2b_fleet_25005', // ليزر ماجيك (سنتر الشباب)
    'eg_b2b_fleet_25236', // أويل سيل الفارس
    'eg_b2b_fleet_25292', // مخرطة أولاد البغدادي
    'eg_b2b_fleet_25691', // المثنى لتجارة الرولمان بلى والسيور
    'eg_b2b_fleet_25720', // رولمان بلي - إنترناشونال بيرنج (سنتر المجد)
    'eg_b2b_fleet_25946', // ماهر جلهوم (سنتر الشباب)
    'eg_b2b_fleet_25987', // القدس للادوات الصحية
    'eg_b2b_fleet_26522', // ZFA Weighing Solutions (موازين أمام مول العرب)

    // 6. Local Supermarkets, Meat & Food Kiosks
    'eg_b2b_fleet_25026', // أسواق شهد
    'eg_b2b_fleet_25053', // اسواق الحجاز
    'eg_b2b_fleet_25334', // Rivo-ريڤو (چرش مول ٢ بجوار عصائر العباسى)
    'eg_b2b_fleet_25659', // خيرات بلدنا
    'eg_b2b_fleet_26004', // صنوبر للمواد الغذائية
    'eg_b2b_fleet_26343', // حصري أكتوبر
    'eg_b2b_fleet_26705', // Gee (Street 88 Mall)

    // 7. Residential Flats, Villas & Small Offices (Marketing, Decor, Design, Real Estate)
    'eg_b2b_fleet_25315', // AG marketing (فيلا 77)
    'eg_b2b_fleet_25326', // مهندس معماري (المصرية سنتر 1)
    'eg_b2b_fleet_25804', // AbwabMisr (عمارة 39 الدور الرابع)
    'eg_b2b_fleet_25845', // قرميد بلاستيك تركي ابناء العربي (عمارة 309)
    'eg_b2b_fleet_25846', // Dyar Construction (عمارة 5 الدور الثالث مكتب 2)
    'eg_b2b_fleet_25864', // Apex Constructions and Decoration (عمارة 30)
    'eg_b2b_fleet_25878', // Vertex innovation & interior design
    'eg_b2b_fleet_25995', // كيو جين Q Gen (عمارة 826)
    'eg_b2b_fleet_26014', // Al Mourad Real estate (عمارة 880)
    'eg_b2b_fleet_26024', // Arco Contracting and Decoration (عمارة 33)
    'eg_b2b_fleet_26057', // Click Pixel (فيلا 1880)
    'eg_b2b_fleet_26122', // ناجح ميديا - Nageh Media (عمارة 1509)
    'eg_b2b_fleet_26205', // Egyptian European General Services (الدور الثالث شقة رقم 10)
    'eg_b2b_fleet_26296', // انفيديا ميديا (فيلا 8)
    'eg_b2b_fleet_26303', // في الخدمة
    'eg_b2b_fleet_26439', // الزخرف لانشاء و ادارة المشاريع (عمارة 266 الدور 3 مكتب 8)
    'eg_b2b_fleet_26470', // الابداع السورى (سنتر الامل التجاري)
    'eg_b2b_fleet_26491', // Arab Pyramid (فيلا 10)
    'eg_b2b_fleet_26496', // PLD Development (فيلا 3 غرب سوميد)
    'eg_b2b_fleet_26507', // Vertex (فيلا 7 غرب سوميد)
    'eg_b2b_fleet_26562', // المصطفي لتوريد وتركيب الرخام (عمارة 62 الاتحاد التعاوني)
    'eg_b2b_fleet_25652', // المصطفي لتوريد وتركيب الرخام (عمارة 62 الاتحاد التعاوني)
    'eg_b2b_fleet_26600', // EGYPT PRO For Technology (Villa 852)
    'eg_b2b_fleet_26610', // ArcCorner (فيلا 230)
    'eg_b2b_fleet_26632', // Scope Innovation (Villa 105)
    'eg_b2b_fleet_26634', // EMS Solutions (Villa 8 Diplomatic)
    'eg_b2b_fleet_26656', // Kingfisher Studio (The Polygon Suite 4-6D)
    'eg_b2b_fleet_26727', // Old Cairo Design (Villa 99)

    // 8. Commercial Mall Retail Stores, Small Showroom Units & Shopping Center Desks
    'eg_b2b_fleet_25039', // Deal Every Day (METRO DEGLA MALL)
    'eg_b2b_fleet_25109', // Instec Automation (Al Masa Mall Office 13)
    'eg_b2b_fleet_25124', // MELPR (Abu Elnaga maal Flat 2&3)
    'eg_b2b_fleet_25131', // Modern Automation Technology (flat 203A Makka mall)
    'eg_b2b_fleet_25133', // مكين لحلول التغليف (سنتر سما شقة 14)
    'eg_b2b_fleet_25206', // ARC Electric (الصفا مول وحدة 111)
    'eg_b2b_fleet_25222', // Kemet Water Treatment (El batraa mall)
    'eg_b2b_fleet_25223', // Heliopolis for mining (Al Batraa Mall)
    'eg_b2b_fleet_25226', // Master Point (البتراء مول عماره 3)
    'eg_b2b_fleet_25276', // شركه المجد للمقاولات (جنب ماركت الصعيدي)
    'eg_b2b_fleet_25283', // Quiz (Grash Mall)
    'eg_b2b_fleet_25333', // MEGA Works (Gersh mall)
    'eg_b2b_fleet_25349', // KEMT Warehouses (Al Shams Mall)
    'eg_b2b_fleet_25354', // Green (الجوهة مول وحدة 216)
    'eg_b2b_fleet_25359', // Golden Tech (Abdelmaksoud Mall Flat 5/6 & shop 23)
    'eg_b2b_fleet_25361', // Islamco Construction (مول عبدالمقصود فوق فينوس للموبايل)
    'eg_b2b_fleet_25365', // Pyramix (Shams Mall Office 32)
    'eg_b2b_fleet_25686', // Egypt For Engineering (Al-Majd Mall office 6)
    'eg_b2b_fleet_25740', // أبو عدي (طيبة جراند مول)
    'eg_b2b_fleet_25772', // Talent For Decoration (Agyad castle mall)
    'eg_b2b_fleet_25802', // High Quality Home (west point mall)
    'eg_b2b_fleet_25805', // Middle East For Electrical (Golden Mall)
    'eg_b2b_fleet_25848', // QMS certification (Al Safwa Mall)
    'eg_b2b_fleet_25854', // كرتون اون لاين (الحصري)
    'eg_b2b_fleet_25908', // Stampa (Abazeya Mall Office 23)
    'eg_b2b_fleet_25952', // BaNOx (Glory mall)
    'eg_b2b_fleet_26152', // الاتحاد لتجارة مواتير وفلاتر المياه (aly eldeen mall)
    'eg_b2b_fleet_26162', // Afnan Catering (El Yasmine Mall)
    'eg_b2b_fleet_26164', // المصرية الدولية للطاقة الشمسية (El-Mounir Commercial Mall)
    'eg_b2b_fleet_26171', // ArchiCave (Rana mall)
    'eg_b2b_fleet_26214', // Baba Saleh (La Cite Mall)
    'eg_b2b_fleet_26216', // New Era Investment (Royal Towers Mall 102)
    'eg_b2b_fleet_26230', // Kaza Kitch (La Cite Mall)
    'eg_b2b_fleet_26255', // Homeart (Blue star mall office 49)
    'eg_b2b_fleet_26386', // Young Innovative (Jordanian mall)
    'eg_b2b_fleet_26462', // Jablotron (Dolphin Land Mall Unit 2)
    'eg_b2b_fleet_26465', // I and R Egypt (Dolphin Mall Unit 2)
    'eg_b2b_fleet_26471', // Future Transport (El Amal Mall)
    'eg_b2b_fleet_26503', // Safe Zone Co. (Kazan Mall)
    'eg_b2b_fleet_26530', // Trade House (MALL OF ARABIA)
    'eg_b2b_fleet_26531', // Arrows (mall of arabia)
    'eg_b2b_fleet_26601', // WOODCRAFT Egypt (Mazar Mall)
    'eg_b2b_fleet_26606', // Khaiyalsolar (El moaz mall)
    'eg_b2b_fleet_26613', // Peacock Business Solutions (behind mall THE GATE)
    'eg_b2b_fleet_26618', // Tebmar (Al Saraya Mall)
    'eg_b2b_fleet_26637', // Al Wahaibi (Beverly Hills 4mix Mall B11)
    'eg_b2b_fleet_26695', // Gears (Park St. Mall)
    'eg_b2b_fleet_26777', // Harmony Home by Aya (Park Avenue Mall Showroom 280)

    // 9. Personal Names
    'eg_b2b_fleet_25734'  // ناصر احمد عمر
];

const uniqueTargetIds = Array.from(new Set(targetIds));
console.log('Total unique target IDs compiled:', uniqueTargetIds.length);

const validList = [];
uniqueTargetIds.forEach(id => {
    const c = comps.find(x => x.id === id);
    if (!c) {
        console.log('Not found in DB:', id);
        return;
    }
    if (isProtectedTitan(c)) {
        console.error('ERROR: Titan protection triggered for:', id, c.nameAr || c.name);
        return;
    }
    validList.push({
        id: c.id,
        name: c.nameAr || c.name,
        sector: c.sector,
        address: c.address
    });
});

console.log('Total verified entities to purge:', validList.length);
fs.writeFileSync('./scraper/output/mall_and_retail_purge_ids.json', JSON.stringify(validList.map(v => v.id), null, 2));
fs.writeFileSync('./scraper/output/mall_and_retail_purge_details.json', JSON.stringify(validList, null, 2));
console.log('Saved files to scraper/output/');
