const fs = require('fs');
const path = require('path');

async function executeThirdForensicPass() {
    console.log('=== Executing Third Forensic Purge Pass ===');

    const poolPath = path.resolve('crm/js/egypt_enterprises_pool.js');
    const poolRaw = fs.readFileSync(poolPath, 'utf8');
    const poolJsonStr = poolRaw.substring(poolRaw.indexOf('['), poolRaw.lastIndexOf(']') + 1);
    const pool = JSON.parse(poolJsonStr);
    console.log(`Current Pool records: ${pool.length}`);

    function isPreservedEnterprise(c) {
        const text = (c.nameAr || '') + ' ' + (c.nameEn || '');
        if (/شركة.*للصناعات|مصنع|مصانع|للتصنيع|للإنتاج والتوزيع|للصناعات الهندسية|للصناعات الكيماوية|للغزل والنسيج|للصناعات الغذائية|للصناعات الدوائية|للحديد والصلب|للأسمنت|للسيراميك|للبلاستيك|للكاوتشوك المطاط|تشغيل.*ميكانيك|بتروجيت/i.test(text)) {
            return true;
        }
        if (/شركة.*للمقاولات العامة|شركة.*للإنشاءات|شركة.*للخرسانة الجاهزة|شركة.*للنقل الثقيل|شركة.*للشحن واللوجستيات/i.test(text)) {
            return true;
        }
        if (/للنقل الجماعي|للنقل السياحي|أتوبيسات|باصات/i.test(text)) {
            return true;
        }
        return false;
    }

    const thirdPassFilters = [
        {
            category: 'Real Estate Marketing & Brokerage',
            test: c => {
                const t = (c.nameAr || '') + ' ' + (c.nameEn || '');
                if (/تسويق.*عقار|عقار.*تسويق|وسيط عقار|تمويل عقارى|ادارة املاك|إدارة أملاك|شقق.*فيلات|شقق.*شاليهات|عقارات للبيع|سمسار|شاليهات فى/i.test(t)) {
                    if (!/للمقاولات العامة والإنشاءات|للتنمية العمرانية والاستثمار الصناعي/i.test(t)) return true;
                }
                return false;
            }
        },
        {
            category: 'Law Offices & Tax Accounting & Financial Consultancies',
            test: c => {
                const t = (c.nameAr || '') + ' ' + (c.nameEn || '');
                return /محاماة|استشارات قانونية|شؤون قانونية|ضرائب|محاسبون قانوني|محاسبة ومراجعة|استشارات مالية|استشارات اقتصادية|مأمورية الضرائب/i.test(t);
            }
        },
        {
            category: 'Pure Engineering & Design Consultancies',
            test: c => {
                const t = (c.nameAr || '') + ' ' + (c.nameEn || '');
                if (/استشارات هندسية|استشارات الهندسية|تصميم معماري|استشارات وتصميم|للاستشارات البيئية/i.test(t)) {
                    if (!isPreservedEnterprise(c)) return true;
                }
                return false;
            }
        },
        {
            category: 'Training Academies & Driving & Sports Schools',
            test: c => {
                const t = (c.nameAr || '') + ' ' + (c.nameEn || '');
                return /أكاديمية|اكاديميه|اكاديمى|أكاديميه|تدريب السواقه|تعليم القيادة|سنتر دروس|خدمات تعليمية|مؤسسة.*التعليمية|للتدريب المهنى|التدريب الهندسى/i.test(t);
            }
        },
        {
            category: 'Pest Control & Home / Apartment Cleaning',
            test: c => {
                const t = (c.nameAr || '') + ' ' + (c.nameEn || '');
                return /مكافحة حشرات|ابادة حشرات|تنظيف منازل|نظافة منازل|نظافة شقق|غسيل سجاد|خدمات فندقية.*نظافة|شركة نظافة بالرحاب/i.test(t);
            }
        },
        {
            category: 'Digital Marketing & SEO & Software Web Agencies',
            test: c => {
                const t = (c.nameAr || '') + ' ' + (c.nameEn || '');
                return /تسويق الكترون|تسويق إلكترون|سوشيال ميديا|تصميم مواقع|شركة تصميم مواقع|برمجة وتصميم|Marketer Mart|ميديا مارت/i.test(t);
            }
        },
        {
            category: 'Custom Domestic Kitchens & Dressing Rooms',
            test: c => {
                const t = (c.nameAr || '') + ' ' + (c.nameEn || '');
                if (/مطابخ.*مصر العبور|مطابخ فكرة|مطابخ الحديدي|أصيل للمطابخ|المهندس للمطابخ|اليسر والنور للمطابخ|جني تال للمطابخ|مطابخ سيتى أرو|الريان للمطابخ|المصرية للمطابخ|تاتش للمطابخ|كولي نوفا للمطابخ|نفوذ للمطابخ/i.test(t)) {
                    return true;
                }
                return false;
            }
        },
        {
            category: 'Retail Upholstery / Gifts / Nuts / Miscellaneous Shops',
            test: c => {
                const t = (c.nameAr || '') + ' ' + (c.nameEn || '');
                return /فرش سيارات|محامص و ضيافة|هدايا الحج والعمره|تحف والهدايا والنتيكات|سيزر ستورز|ديكور ستورز|صيانة ستورز|سجاد التجمع|ستائر مكتبية - توكيل|قرميد تركي بلاستيك مستورد|تشطيبات شقق وتجهيز محلات/i.test(t);
            }
        }
    ];

    const cleanPool = [];
    let purgedCount = 0;
    const stats = {};

    for (let i = 0; i < pool.length; i++) {
        const c = pool[i];
        if (!c) continue;

        let shouldPurge = false;
        for (let f of thirdPassFilters) {
            if (f.test(c)) {
                shouldPurge = true;
                purgedCount++;
                stats[f.category] = (stats[f.category] || 0) + 1;
                break;
            }
        }

        if (!shouldPurge) {
            cleanPool.push(c);
        }
    }

    console.log('--- Third Pass Results ---');
    console.log('Purged breakdown:', stats);
    console.log(`Total purged from pool: ${purgedCount}`);
    console.log(`Remaining pool: ${cleanPool.length}`);

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

    console.log(`=== SUCCESS: Third Pass Complete ===`);
    console.log(`Titans: ${titans.length}`);
    console.log(`Clean Pool: ${cleanPool.length}`);
    console.log(`TOTAL CLEAN VERIFIED B2B ENTERPRISES: ${allCleanCompanies.length}`);
}

executeThirdForensicPass().catch(console.error);
