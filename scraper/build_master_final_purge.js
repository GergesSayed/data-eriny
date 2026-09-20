const fs = require('fs');
const comps = require('../crm/data/companies.json');

function isProtectedTitan(c) {
    if (c.id && c.id.startsWith('eg_titan_')) return true;
    const name = (c.nameAr || c.name || '').trim();
    const eng = (c.nameEn || '').trim();
    const text = (name + ' ' + eng).toLowerCase();
    if (/gipsina|sina gips|duravit|electrolux|cleopatra|oriental weavers|totalenergies|elsewedy|kandil steel|egypt aluminium|alpla 10th|friday ice cream|startex|solex|soven|unipack|rich bake|halwani|جهينة|دومتي|إيديتا|بيتي|شيبسي|عبور لاند|حديد عز|السويدي|لافارج|سيمكس|بتروجيت|المقاولون العرب|أوراسكوم|حسن علام|redcon|novartis|unilever|gac egypt|taki|مراتب تاكى|مصنع قادر|مونتانا|جوهر ستيل|الفجر ستيل|الشناوي تانك|بولي تكس|حورس للتهويه|روتوكرافيا|rotografia|compo expert|volvo cars egypt|se wiring|sumitomo|عز العرب|شورى|اعلاف الوادي|أعلاف الوادي|aramex|mylerz|fcl logistics|معدات ثقيلة|yilmaz/i.test(text)) return true;
    if (c.id === 'eg_b2b_fleet_36999' || c.id === 'eg_b2b_fleet_41215') return true;
    return false;
}

// 1. Base 95 from pass 8
const pass8Ids = JSON.parse(fs.readFileSync('./scraper/output/pass8_verified_purge_ids.json', 'utf8'));

// 2. Newly discovered mall retail shops, car wrap, spare parts, and residential offices
const newlyDiscoveredIds = [
    'eg_b2b_fleet_25318', // مؤسسة الرواد لإيجار السيارات (مول امل 1)
    'eg_b2b_fleet_25336', // KIXX WASH (غسيل سيارات مول الحجاز)
    'eg_b2b_fleet_25339', // شركة آفاقي لتقنية المعلومات (مول الدوحة)
    'eg_b2b_fleet_25342', // City print (مول الجوهره)
    'eg_b2b_fleet_25345', // CarveWolf.Adv (مول الفيروز)
    'eg_b2b_fleet_25347', // شركة صقر تكنولوجى للأنظمة الأمنية (مول الجوهره)
    'eg_b2b_fleet_25352', // Bassem welding (مول الجوهرة)
    'eg_b2b_fleet_25368', // تارجت للتجارة (مول سيتى سنتر)
    'eg_b2b_fleet_25380', // شركة الصقر (مول شمس الاردنية)
    'eg_b2b_fleet_25382', // Azzar (مول الصباح)
    'eg_b2b_fleet_25244', // Stock Tronic (خلف مول رنين)
    'eg_b2b_fleet_25248', // Safety Egypt company (مول الحجاز الدولي)
    'eg_b2b_fleet_25256', // البلتاجي للتسويق و الإستثمار الصناعي (مول الهاشمية)
    'eg_b2b_fleet_25262', // ريادة للمقاولات العامة (الجوهرة مول)
    'eg_b2b_fleet_25711', // رواد السبتية للأدوات الصحية (مول الزهور)
    'eg_b2b_fleet_25721', // Elsaad Electric (مول المجد)
    'eg_b2b_fleet_25725', // Alio-Mar (مول الزهور)
    'eg_b2b_fleet_25749', // Bmw Auto Spare Parts (محل قطع غيار بمول طيبة)
    'eg_b2b_fleet_25767', // H R C Automotive - Mg (مول شبانه)
    'eg_b2b_fleet_25821', // A.G cars (معرض سيارات بمول المختار)
    'eg_b2b_fleet_25828', // إتقان للتوريدات الكهربائية والميكانيكية (مكتب بمول الطارق)
    'eg_b2b_fleet_25862', // Khater consturction (فينوس مول)
    'eg_b2b_fleet_25906', // Healthy Degla palms (محل بمول دجلة بالمز)
    'eg_b2b_fleet_25910', // French Club Service Center (ورشة سيارات بمول فايف ستارز)
    'eg_b2b_fleet_25920', // City Stars Towers Mall October (اسم المول نفسه)
    'eg_b2b_fleet_25938', // الملكة للمنتجات الألبان (محل ألبان بسنتر الفيروز)
    'eg_b2b_fleet_25959', // Nano4life Car Protection (حماية سيارات بمول المستقبل)
    'eg_b2b_fleet_25960', // Wrap Zone (تفييم وتغليف سيارات بمول المستقبل)
    'eg_b2b_fleet_25976', // Future I T Company (مكتب بمول علي الدين)
    'eg_b2b_fleet_26009', // Landmark October (مكتب 304 بمول أجياد)
    'eg_b2b_fleet_26023', // شركة طلعة للسياحة الداخلية (مكتب بجوار سيتي سكيب)
    'eg_b2b_fleet_26040', // Up Towels (محل فوط بماكسيم مول التجمع)
    'eg_b2b_fleet_26117', // Trust construction & decorations (مول كنوز النيل)
    'eg_b2b_fleet_26135', // Magic Express (مول الياسمين)
    'eg_b2b_fleet_26229', // Stand form (لاسيتيه مول)
    'eg_b2b_fleet_26424', // Reda carbon (الحجاز مول)
    'eg_b2b_fleet_26441', // Infinity Park (مول جرين بارك)
    'eg_b2b_fleet_26482', // Prime Hills Development (مول أكاسيا)
    'eg_b2b_fleet_26592', // Tokyo Drift (محل بمول المعز)
    'eg_b2b_fleet_26678', // Safwa Mall (اسم المول نفسه)
    'eg_b2b_fleet_26683', // Misr Decoration (مول دبي الخمايل)

    // 3. Additional mall office desks and retail parts in Jordania and plazas
    'eg_b2b_fleet_25137', // Web Idea (مكتب برمجيات بمول الصباح)
    'eg_b2b_fleet_25128', // Al-Hendawi2 (محل بمول مكة)
    'eg_b2b_fleet_25126', // Al_Fateh For Industrial Systems (مكتب بالمركز العالمي)
    'eg_b2b_fleet_25168', // Value Construction (سيتي مول)
    'eg_b2b_fleet_25085', // العلم للتجارة والمقاولات العامة (مول الجوهرة)
    'eg_b2b_fleet_24970', // تكنو بيلت Techno Belt (مول الصفا 2)
    'eg_b2b_fleet_25093', // نيوماتيك الشروق الهندسية للتوريدات (مول سينيكو)
    'eg_b2b_fleet_25228', // إفرست باك لمواد التعبئة والتغليف (البتراء مول 2)
    'eg_b2b_fleet_25229', // Power Oil Seal باور أويل سيل (مول المصرية سنتر 3)
    'eg_b2b_fleet_25756', // شركة الخبير (مول شبانة)
    'eg_b2b_fleet_26734'  // Ahdaf for Trading and Distribution (مول بارك أفينيو)
];

const allTargetIds = Array.from(new Set([...pass8Ids, ...newlyDiscoveredIds]));
console.log('Total aggregated target candidate IDs:', allTargetIds.length);

const finalPurgeList = [];
allTargetIds.forEach(id => {
    const c = comps.find(x => x.id === id);
    if (!c) {
        console.log('ID not found in DB:', id);
        return;
    }
    if (isProtectedTitan(c)) {
        console.error('CRITICAL: Titan protection triggered for:', id, c.nameAr || c.name);
        return;
    }
    finalPurgeList.push({
        id: c.id,
        name: c.nameAr || c.name,
        sector: c.sector,
        city: c.city,
        address: c.address
    });
});

console.log('Final verified entities to purge:', finalPurgeList.length);

const bySector = {};
finalPurgeList.forEach(v => bySector[v.sector] = (bySector[v.sector] || 0) + 1);
console.log('\nSector Breakdown of Final Purge List:');
console.log(bySector);

fs.writeFileSync('./scraper/output/final_master_purge_ids.json', JSON.stringify(finalPurgeList.map(v => v.id), null, 2));
fs.writeFileSync('./scraper/output/final_master_purge_details.json', JSON.stringify(finalPurgeList, null, 2));
console.log('\nSaved final purge list to scraper/output/final_master_purge_ids.json');
