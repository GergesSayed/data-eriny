const fs = require('fs');
const comps = require('../crm/data/companies.json');

function isProtectedTitan(c) {
    if (c.id && c.id.startsWith('eg_titan_')) return true;
    const name = (c.nameAr || c.name || '').trim();
    const eng = (c.nameEn || '').trim();
    const text = (name + ' ' + eng).toLowerCase();
    if (/gipsina|sina gips|duravit|electrolux|cleopatra|oriental weavers|totalenergies|elsewedy|kandil steel|egypt aluminium|alpla 10th|friday ice cream|startex|solex|soven|unipack|rich bake|halwani|جهينة|دومتي|إيديتا|بيتي|شيبسي|عبور لاند|حديد عز|السويدي|لافارج|سيمكس|بتروجيت|المقاولون العرب|أوراسكوم|حسن علام|redcon|novartis|unilever|gac egypt|taki|مراتب تاكى|مصنع قادر|مونتانا|جوهر ستيل|الفجر ستيل|الشناوي تانك|بولي تكس|حورس للتهويه|روتوكرافيا|rotografia|compo expert|volvo cars egypt|se wiring|sumitomo|عز العرب|شورى|اعلاف الوادي|أعلاف الوادي|aramex|mylerz|fcl logistics/i.test(text)) return true;
    if (c.id === 'eg_b2b_fleet_36999' || c.id === 'eg_b2b_fleet_41215') return true;
    return false;
}

// Candidates identified from rigorous inspection of residential neighborhoods, plazas, and commercial centers
const targetCandidateIds = [
    // 1. Boutiques, Books, and Fashion in Malls / Plazas
    'eg_b2b_fleet_26342', // No Name Scarf (طرح ومحجبات دياموند مول)
    'eg_b2b_fleet_26668', // Master BookStore (مكتبة كتب بمول جاليريا الشيخ زايد)
    'eg_b2b_fleet_26675', // City Card (داخل جاليريا مول)
    'eg_b2b_fleet_26315', // Khyoot masrya خيوط مصرية (خيوط وتطريز مول الإسراء بلازا)
    'eg_b2b_fleet_25132', // NO END Print (مول الصباح)

    // 2. Food kiosks, restaurants, noodles, sweet potato
    'eg_b2b_fleet_26721', // Batata (عربة بطاطا الشيخ زايد)
    'eg_b2b_fleet_26020', // أطيب نودلز-Atyab Noodles (مطعم نودلز الشيخ زايد)
    'eg_b2b_fleet_25152', // سمنة شام (محل سمنة بالعاشر من رمضان)

    // 3. Passenger car showrooms, car rentals, detailing, garages & repair
    'eg_b2b_fleet_26213', // Turbó (معرض كاريزما للسيارات بالحصري)
    'eg_b2b_fleet_25915', // Car Town (أبراج سيتي ستارز مركز اوتو وان وكار تاون)
    'eg_b2b_fleet_25898', // Elish auto group (ابراج سيتي ستارز معرض سيارات)
    'eg_b2b_fleet_26126', // Elmagd For Rent Car (تأجير سيارات ملاكي)
    'eg_b2b_fleet_26196', // Rentex (ميدان النجدة تأجير)
    'eg_b2b_fleet_26121', // Go On Auto 6 October (سنتر كنوز النيل)
    'eg_b2b_fleet_26043', // APEX Auto (عمارة 55 الدور الرابع)
    'eg_b2b_fleet_26429', // Nissan Pro Max (مول الحجاز)
    'eg_b2b_fleet_26501', // QGAutomotive (فيلا 1659)
    'eg_b2b_fleet_25812', // اوتو سيرفيس عطيه محروس 2 (ابراج ستي ستار برج 8)
    'eg_b2b_fleet_25822', // Gaballah Service Center (سكوير مول صيانة)
    'eg_b2b_fleet_25824', // Motifix-موتيفكس (بجوار مدرسة الثانوية الصناعية)
    'eg_b2b_fleet_25933', // Helmy October Service Center (مركز صيانة سيارات ملاكي)
    'eg_b2b_fleet_26537', // Mobil Autocare - Dahsour 2 (مغسلة وغيار زيت شيل أوت دهشور)
    'eg_b2b_fleet_26889', // مركز التهامي لإصلاح وتجديد السيارات (ورشة تجديد سيارات بأبورواش)
    'eg_b2b_fleet_26129', // Turbo Centre (مركز تيربو سيارات ملاكي)
    'eg_b2b_fleet_26569', // German Adler Zayed (ساب مول بيع زيوت سيارات ملاكي)

    // 4. Gyms, Clinics, Small Pet / Hobby Exporters
    'eg_b2b_fleet_26204', // Be Fit (جيم رياضي أعلى حضرموت الدور الرابع)
    'eg_b2b_fleet_26926', // Tut Masr - Live Reptiles Exporter (توت مصر لتصدير الزواحف الحية)

    // 5. Mall tags / charging points
    'eg_b2b_fleet_26394', // Jordanian Mall (مول الأردنية مسجل كشركة)
    'eg_b2b_fleet_26454', // Makany Mall (مكاني مول مسجل كشركة)
    'eg_b2b_fleet_26951', // Recharged by Infinity (شحن سيارات كهربائية بمول النجار)
    'eg_b2b_fleet_26952', // OneraSystems (مكتب بمول النجار)

    // 6. Marketing, Social Media, Real Estate Brokers, Freelance Offices in Towers / Apartments
    'eg_b2b_fleet_25902', // مجموعة شركات Ahs المستشار الاقتصادي ايمن حامد سليمان (ابراج سيتي ستارز برج 2 الدور الرابع)
    'eg_b2b_fleet_25870', // EG Masr Group (مول الأمريكية الدور السابع مكتب ١)
    'eg_b2b_fleet_26233', // POWER art (95 المحور المركزي الحصري)
    'eg_b2b_fleet_26269', // ARKAN - Contracting & Marketing (ابراج العالمية برج ١ الدور 2 مكتب 3)
    'eg_b2b_fleet_26317', // Miracle Trade (ابراج برعي بلازا برج 1 الدور 4)
    'eg_b2b_fleet_26220', // شركة الروائع المعمارية (اكتوبر بلازا الدور الأول)
    'eg_b2b_fleet_26104', // smart Team Construction (الحصري المحور المركزي)
    'eg_b2b_fleet_26236', // Inshaa Misr (ميدان الحصري برج الفيروز 1)
    'eg_b2b_fleet_26264', // MN Group (أبراج عزيز ميخائيل بجوار Air gym)
    'eg_b2b_fleet_26097', // Namaa For Integrated Works (ابراج الفتح)
    'eg_b2b_fleet_26096', // First Trust - فرست تراست (أبراج سيتي ستار برج 5 الدور 5)
    'eg_b2b_fleet_25875', // Ultra Construction Group Co (ابراج ستى استار)
    'eg_b2b_fleet_25213', // الرواد للتكنولوجيا والتوريدات العمومية (أبراج نجوم الصفا)
    'eg_b2b_fleet_25384', // المول جلوبال تريدينج /آيكون باك (ابراج الأحلام 'أ')
    'eg_b2b_fleet_26347', // RepairLine (ابراج الامريكية بجوار مطعم كرم الشام)
    'eg_b2b_fleet_26457', // Media Reach Nova (دولفن مول)
    'eg_b2b_fleet_26472', // 3D Art (سنتر الامل الدور الاول)
    'eg_b2b_fleet_26559', // Socialista (وكالة سوشيال ميديا الشيخ زايد)
    'eg_b2b_fleet_26611', // VR Agency (وكالة الواقع الافتراضي الشيخ زايد)
    'eg_b2b_fleet_26598', // بروبرتي زايد - Property Zayed (مكتب تسويق عقاري الشيخ زايد)
    'eg_b2b_fleet_26614', // Mountain View Creek View New Cairo (إعلان مشروع عقاري)
    'eg_b2b_fleet_26567', // Creative _ كريتيڤ للتشطيبات والديكورات (مكتب تشطيبات وديكور)
    'eg_b2b_fleet_26693', // Visual Home (ديكور منزلي الشيخ زايد)
    'eg_b2b_fleet_26597', // Kamal Ayman (اسم شخص فردي بالشيخ زايد)
    'eg_b2b_fleet_26730', // شركة الكابتن لشحن الطرود وطلبات الاونلاين (سنتر المهندسين شحن اوردرات اونلاين)
    'eg_b2b_fleet_26733', // B7C Atrio (أتريو زايد)

    // 7. Small strip shops, furniture showrooms, and local trading desks
    'eg_b2b_fleet_26436', // كيماويات البناء الحديث 6 أكتوبر (محل بويات بالاردنيه مول)
    'eg_b2b_fleet_25231', // الشافعى للهندسة وتجارة مستلزمات المصانع (معرض 6 مول الصفا مودرن)
    'eg_b2b_fleet_25284', // شيتيك لتجارة و تصنيع الالواح الصناعية (سوق المجاورة السابعة)
    'eg_b2b_fleet_25288', // ANGLE for Engineering and Finishing (مجاوره ١١ بجوار معرض ربيع الحصرى)
    'eg_b2b_fleet_25653', // Concret for Contracting and Decoration (ع ٧١ معرض ٥ الاتحاد التعاوني)
    'eg_b2b_fleet_25872', // الخبير للرخام والجرانيت (مول الصفوه بلازا)
    'eg_b2b_fleet_26259', // AlFares Egypt (برايم بلازا)
    'eg_b2b_fleet_26534', // Bio Nano Tech (ويست جيت مول شارع السنترال)
    'eg_b2b_fleet_26651', // Materialistique (الجزيرة بلازا برج 1)
    'eg_b2b_fleet_26655', // Red Square (إيدن بلازا)
    'eg_b2b_fleet_26648', // MRCON (أركان بلازا مكتب)
    'eg_b2b_fleet_25980', // Unimar Shipping Services (سيلفر مول برج 4)
    'eg_b2b_fleet_25981', // HaiBuild (سيلفر مول برج 1)
    'eg_b2b_fleet_25984', // RIGHT for Engineering and Contracting (سيلفر مول برج 4)
    'eg_b2b_fleet_25985', // Guangzhou for shipping (سيلفر مول)
    'eg_b2b_fleet_25185', // شركه الرحاب للرخام والجرانيت (الصفا مول مجاورة 12)
    'eg_b2b_fleet_25205', // عالم الهواء (الصفا مول خلف هاي سيلز)
    'eg_b2b_fleet_25348', // الطاقة للهندسة والتجارة (الجوهره مول الأردنية)
    'eg_b2b_fleet_25264', // الراوي للنشر والتوزيع (مجاورة 61)
    'eg_b2b_fleet_25745', // الصباحي و الجابري (اسم شخصي)
    'eg_b2b_fleet_26495', // المركز التقني السوري (مجاورة 8)
    'eg_b2b_fleet_26688', // فاست للكيماويات (The Lane, Palm Hills)
    'eg_b2b_fleet_26261', // الالفي (سنتر الاردنية الحي السابع)
    'eg_b2b_fleet_26298', // يس للخدمات الهندسية (سنتر الاردنية)
    'eg_b2b_fleet_26197', // نور جروب noor group (سنتر أكتوبر 3)
    'eg_b2b_fleet_26337', // شركة دمياط فرنتشر بأكتوبر (معرض موبيليا بجوار سنتر منهاتن)
    'eg_b2b_fleet_26350', // مشارق للتجارة العامة والشحن الدولي (مقابل كبدة الشرقاوي)
    'eg_b2b_fleet_26372', // Kemet Travel (سياحة وحجز تذاكر الحصري)
    'eg_b2b_fleet_25622', // شركة الرسالة لتشغيل العمال (بجوار كافتيريا الخديوي شارع كان كان)
    'eg_b2b_fleet_25640', // مركز العالميه - Alealamih center (سنتر الاردنيه الحي الحادي عشر)
    'eg_b2b_fleet_25851', // المصرية للرخام والجرانيت راشد (الحجاز مول)
    'eg_b2b_fleet_25913', // المؤسسة الدولية للكلادينج السعودي (ستي ستار برج 7 الدور 3 مكتب 6)
    'eg_b2b_fleet_25979', // Organda (عمارة 31 الدور 3 وحدة 8 مقابل سيلفر مول)
    'eg_b2b_fleet_26010', // شركة ترست كير للخدمات البيئية والمرافق (الحي السابع ميدان الحصري)
    'eg_b2b_fleet_26012', // Mohandes Group (عمارة 43 الدور الأول)
    'eg_b2b_fleet_26029', // الزياد للمقاولات والإنشاءات (عماره 223)
    'eg_b2b_fleet_26058', // Elomda -العمدة (مبنى 281 أمام ملاعب الياسمين)
    'eg_b2b_fleet_26365'  // الشروق فيبركوم الادارة (ميدان الحصري)
];

const uniqueIds = Array.from(new Set(targetCandidateIds));
console.log('Total candidate IDs to evaluate:', uniqueIds.length);

const verifiedPurge = [];
uniqueIds.forEach(id => {
    const c = comps.find(x => x.id === id);
    if (!c) {
        console.log('Not found in DB:', id);
        return;
    }
    if (isProtectedTitan(c)) {
        console.error('CRITICAL WARNING: Protected Titan matched!', id, c.nameAr || c.name);
        return;
    }
    verifiedPurge.push({
        id: c.id,
        name: c.nameAr || c.name,
        sector: c.sector,
        city: c.city,
        address: c.address
    });
});

console.log('Total verified entities confirmed for purge:', verifiedPurge.length);

const bySector = {};
verifiedPurge.forEach(v => bySector[v.sector] = (bySector[v.sector] || 0) + 1);
console.log('\nBreakdown by Sector:');
console.log(bySector);

fs.writeFileSync('./scraper/output/pass8_verified_purge_ids.json', JSON.stringify(verifiedPurge.map(v => v.id), null, 2));
fs.writeFileSync('./scraper/output/pass8_verified_purge_details.json', JSON.stringify(verifiedPurge, null, 2));
console.log('\nSaved verified purge list to scraper/output/pass8_verified_purge_ids.json');
