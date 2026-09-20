const fs = require('fs');
const path = require('path');

const companies = JSON.parse(fs.readFileSync(path.join(__dirname, '../crm/data/companies.json'), 'utf8'));
console.log('Total companies at start of 5th review:', companies.length);

// Load CSV
const csvLines = fs.readFileSync(path.join(__dirname, 'output/cairo_giza_master_census.csv'), 'utf8').split('\n');
function parseCsvLine(line) {
    const res = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            res.push(cur.trim());
            cur = '';
        } else {
            cur += ch;
        }
    }
    res.push(cur.trim());
    return res;
}
const csvMapName = new Map();
const csvMapUrl = new Map();
for (let i = 1; i < csvLines.length; i++) {
    if (!csvLines[i].trim()) continue;
    const parts = parseCsvLine(csvLines[i]);
    if (parts[0]) csvMapName.set(parts[0].trim().toLowerCase(), parts[13]);
    if (parts[10]) csvMapUrl.set(parts[10].trim(), parts[13]);
}

function shouldPurge(c) {
    const name = (c.nameAr || '').trim();
    const eng = (c.nameEn || '').trim();
    const fullText = (name + ' ' + eng + ' ' + (c.address || '')).toLowerCase();
    const cat = (c.nameAr && csvMapName.get(c.nameAr.trim().toLowerCase())) ||
                (c.google_maps_url && csvMapUrl.get(c.google_maps_url.trim())) || '';

    // PROTECT GENUINE HEAVY B2B ENTITIES FIRST
    // 1. Titans & major industrial groups
    if (c.id && c.id.startsWith('eg_titan_')) return { purge: false };
    if (/حديد عز|السويدي|مصر لأعمال الأسمنت المسلح|المقاولون العرب|لافارج|سيمكس|السويس للأسمنت|سيراميكا كليوباترا|بتروجيت|إنبي|مصر للألومنيوم|قنديل للصلب|حديد المصريين|الدلتا للسكر|القومية للأسمنت/.test(name)) {
        return { purge: false };
    }
    // 2. Heavy industry keywords
    if (/للصلب|للحديد والصلب|درفلة|مسبك|صهر المعادن|لتشغيل المعادن وسباكة|للخرسانة الجاهزة|طوب طفلي|خلاطات خرسانة|طرق وكباري|أنفاق وعدايات|حفر وتكريك|هيدروليك معدات|قطع غيار نقل ثقيل|مقطورات وتريلات|Lathing Heavy Metals|Wadi El Nile Diesel/.test(name + ' ' + eng)) {
        return { purge: false };
    }
    // 3. Shaq El-Thouban & marble/granite plants & heavy equipment trading
    if (/شق التعبان|للرخام والجرانيت|رخام وجرانيت|Memphis Stones|محاجر|لتجارة المعدات الثقيله|للأرضيات الصناعية/.test(name) || /شق التعبان/.test(c.address || '')) {
        return { purge: false };
    }
    // 4. Genuine public bus operators & major trucking
    if (/جو باص|شرق الدلتا للنقل|غرب ووسط الدلتا|الصعيد للنقل|مستر باص للنقل|الصياد للنقل الجماعى|يوساب للنقل/.test(name)) {
        return { purge: false };
    }
    // 5. Protect passenger transport & fleet rental companies with fleets
    if (/لنقل الركاب والرحلات والسياحة والليموزين|لتأجير أساطيل الحافلات|نقل جماعي|شحن دولي|لنقل الاثاث/.test(name)) {
        return { purge: false };
    }
    // 6. Protect manufacturing & trade
    if (/مصنوعات جلدية|شروق تكس|مؤسسه الدكتور للاستيراد|مونة المحارة فيجا/.test(name)) {
        return { purge: false };
    }

    // PURGE CONDITIONS

    // 1. Medical Clinics, Doctors, IVF, Dental, Outpatient Labs & Social Clubs / Boy Scouts
    if (/عيادة|عيادات|نساء وتوليد|عقم وحقن مجهري|دكتور |دكتورة |طبيب|أخصائي|مركز أسنان|جراحة تجميل|تجميل وليزر|جلدية وتناسلية|علاج طبيعي|مركز تخسيس|حجامة|معمل تحاليل|مختبر تحاليل|مركز أشعة|الدكتور أحمد أبو النصر/.test(name)) {
        if (!/مصنع|صناعات دوائية|تصنيع|للصناعات الطبية/.test(name)) {
            return { purge: true, reason: 'Medical Clinic / Doctor / Outpatient Center' };
        }
    }
    if (/نادي مصر للبترول|نادي مصر حلوان|مجموعة الملاك الكشفية|Scout Team|جمعية خيرية|مؤسسة ازرع شجرة/.test(name)) {
        return { purge: true, reason: 'Social Club / Scout / Charity' };
    }

    // 2. Overseas labor recruitment & visa brokers (إلحاق عمالة / توظيف)
    if (/لإلحاق العمالة|الحاق العمالة|لإلحاق عمالة|الحاق عمالة|للتوظيف بالخارج|توظيف المصريين|Recruitment Group|الريتال للتوظيف|شركة القدس للتوظيف|شركة الأسطورة للعمالة|شركة خلود لتوظيف|شركة التعاون الدولي للتوظيف|شركة القارات لإلحاق|شركة الركن الملكي لإلحاق|شركة سويدان للسفر والتوظيف/.test(name)) {
        return { purge: true, reason: 'Overseas Labor Recruitment Agency' };
    }

    // 3. Passenger car repair workshops, tuning & small artisans
    if (/زجاج سيارات|لتلميع وصب وتعديل الفوانيس|مرايات السيارات|car tuning|Hussien koria|غسيل وتلميع|نانو سيراميك|كار كير|car care|العالمية للبطاريات|توكيل بجاج غبور|مشروعى فرع|مركز خدمه\/المجد المتميز/.test(name)) {
        return { purge: true, reason: 'Passenger Car Repair Workshop / Tuning / Tuk-tuk branch' };
    }
    if (/زجاج ومرايات السيارات/.test(name)) {
        return { purge: true, reason: 'Passenger car auto glass repair' };
    }
    if (/ز د للسباكات الحديثه|الاندلس لتكسير والتشوين والسباكة|شركة الحمد للسقف المعلق|جبس بورد المغربى|شركة المصري للجبس بورد|شركة القدس للديكورات والجبسمبورد|شركة العبد لقطع غيار الغسالات/.test(name)) {
        return { purge: true, reason: 'Plumber / Gypsum board / Domestic handyman' };
    }

    // 4. Passenger car dealerships / showrooms & motors
    if (/Kings Motors|Automatika Showroom|أوتو أحمد الكسار|معرض الصعيدي للسايرات|موتورز لبيع|لتجارة السيارات الملاكي|جنرال موتورز لتجارة السيارات|ابو دياب موتورز|ناشيونال موتورز|Ring Motors|Mechano Motors|Rally Motors|Amir Motors|Hamedo motors|البرادعى موتورز|السويسي موتورز|السباعي موتورز لتاجير|الاصلي موتورز-ايجار|إمام موتورز|Bargasy Motors|ماستر موتورز|Modern Motors Suzuki|Trust Motors|Mando motors|الخولى - شركة نيو موتورز/.test(name)) {
        return { purge: true, reason: 'Passenger Car Dealership / Showroom' };
    }

    // 5. Retail showrooms & decor shops
    if (/معرض السفير الهندى|معرض الشيخ للفرز التاني|معرض رامي صلد|معرض لؤلؤة حلوان|معرض شتا للسيراميك|بلاك ايجل للباركيه|معرض فخرى للادوات الصحية/.test(name)) {
        return { purge: true, reason: 'Retail Showroom / Sanitary / Parquet shop' };
    }

    // 6. Khan El-Khalili jewelry shops & gold retail
    if (cat === 'jewelry_and_watches_manufacturer' || /بيراندو جولد|Khan Abou Takeya|خان أبو طاقية|شارع المعز|خميس العدس|Gold Era|صاغة/.test(fullText)) {
        if (/Perando Gold|Magdy Nessem Silver|Tarek Shalaby|Gold Era|Markat - ماركات|الحمد لله|فضة بالعربي|Safwet Isaac|الأسد للفضيات|معدات الصاغه المصريه|ME Gold/.test(name) || (c.address && /خان|المعز|العدس/.test(c.address))) {
            return { purge: true, reason: 'Khan El-Khalili Jewelry / Gold Shop' };
        }
    }

    // 7. Bus terminals / station parking lots & ferry landings
    if (/موقف عبود|ميناء القاهره البرى|محطة اتوبيس القللي|معدية الحوامدية/.test(name)) {
        return { purge: true, reason: 'Public Bus Station / Terminal / Ferry Landing' };
    }

    // 8. Nile dinner cruises & floating yachts (boats, not commercial road vehicles)
    if (/MS Paradise Nile Cruise|M\/S River Pioneer|My Christina Yacht|Nile cruise journey|حجز نايل كروز/.test(name)) {
        return { purge: true, reason: 'Nile Cruise Tourist Boat' };
    }

    // 9. Pure consumer travel agency desks & honeymoon advisors (no coach fleet)
    if (name === 'شركة سياحة' || /Lef el Donia|ترافيل دور للسياحة|المحبة ترافيل|مواسم البركة|ساعة وساعة|ترافيلوا للسياحة|Al Nada Travel|Orion Traver|Genoa Tours|فلاتشي جروب للسياحة|فابي للسياحة|تورز ان ايجي|الشريف ترافيل|هاى لايتس للسياحة|الرضا للسياحة|جنه للسياحه|النهى ايجيبت|MK Travel|Travel Joy|الحلا ترافل|Step for trips|Honymoon Advisor|غرناطة ترافيل|ميدبوينت للسياحة|ViaMondo|Standard Tours|المسافر للخدمات السياحية|شركة رمضان|نيو أيبر ترافيل|Scaper Travel|Hashtag Travel|موجه ترافيل|سهلة للخدمات السياحية|فلاي جت|شركة النور للسياحة|آل ياسر للخدمات السياحية|TOFY Travel|الراعي ترافيل|Medex Egypt|زهرة مكة للسياحة|الريادة للسياحة|Safari-Egypt|شركة مجموعة الصالحين|المفاوض الدولى|رايت واي للسياحة|الفهد للسياحة|نور للسياحة|El Wedyan Tours|كازبلانكا لخدمات الليموزين|ماندولين للسياحة|Maxim Travel|رحلات الطيب|مجموعة ضمان للسياحة|Favia Travel|ودينى أى حتة|كرم ليبيا|مكتب التواصل لسفريات/.test(name)) {
        return { purge: true, reason: 'Retail Travel / Tourism Booking Desk' };
    }

    // 10. Trademark, Legal, Tech, Sound Studio, Decor, MLM
    if (/Zeyad mohamed Sound Studio|Expert Edge|تسجيل العلامات التجارية|كاميرات المراقبة - بيع|زمزم للعمارة والديكور|Midan Studio|UBER  Egypt|Edex Brand Consultancy|7ollol Tech|Advansys|RT Entrepreneurs|شركة كمبيوماجيك|شركة كافيلو/.test(name)) {
        return { purge: true, reason: 'Office / Tech / Decor / Domestic Repair / CCTV / Studio' };
    }

    // 11. Specific invalid entities spotted in unmapped / census
    if (name === 'Al Dokki, Giza, Egypt' || name === 'General trade' || name === 'کریستال جروب' || name === 'كريستال جروب " سيراميك&بورسلين."') {
        return { purge: true, reason: 'Invalid placeholder or retail tile shop' };
    }
    if (/Etisalat and shubra|Mobinil - Egyptian|We Telecom Egypt, Roxy/.test(name)) {
        return { purge: true, reason: 'Retail Telecom Shop' };
    }
    if (/Harmony Club House|BoHub|the garden shop/.test(name)) {
        return { purge: true, reason: 'Retail / Clubhouse / Garden shop' };
    }

    return { purge: false };
}

const toPurge = [];
const cleanCompanies = [];

companies.forEach(c => {
    const res = shouldPurge(c);
    if (res.purge) {
        toPurge.push({
            id: c.id,
            nameAr: c.nameAr,
            nameEn: c.nameEn,
            sector: c.sector,
            address: c.address,
            reason: res.reason
        });
    } else {
        cleanCompanies.push(c);
    }
});

console.log(`\nPurged entities count: ${toPurge.length}`);
console.log(`Clean companies remaining: ${cleanCompanies.length}`);

// Separate Titans and Pool
const titans = cleanCompanies.filter(c => c.id && c.id.startsWith('eg_titan_'));
const pool = cleanCompanies.filter(c => !(c.id && c.id.startsWith('eg_titan_')));
console.log(`Titans: ${titans.length} | Pool: ${pool.length}`);

// Save to disk
fs.writeFileSync(path.join(__dirname, '../crm/data/companies.json'), JSON.stringify(cleanCompanies, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, '../crm/data/egypt_enterprises_pool.json'), JSON.stringify(pool, null, 2), 'utf8');

const jsContent = 'window.EGYPT_ENTERPRISES_POOL = ' + JSON.stringify(pool) + ';\n';
fs.writeFileSync(path.join(__dirname, '../crm/js/egypt_enterprises_pool.js'), jsContent, 'utf8');

console.log('Successfully written updated datasets to disk!');
