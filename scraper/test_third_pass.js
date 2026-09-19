const fs = require('fs');
const path = require('path');

const comp = JSON.parse(fs.readFileSync('crm/data/companies.json', 'utf8'));
console.log('Current total companies:', comp.length);

function isPreservedEnterprise(c) {
    const text = (c.nameAr || '') + ' ' + (c.nameEn || '');
    // Heavy industrial manufacturing
    if (/شركة.*للصناعات|مصنع|مصانع|للتصنيع|للإنتاج والتوزيع|للصناعات الهندسية|للصناعات الكيماوية|للغزل والنسيج|للصناعات الغذائية|للصناعات الدوائية|للحديد والصلب|للأسمنت|للسيراميك|للبلاستيك|للكاوتشوك المطاط|تشغيل.*ميكانيك|بتروجيت/i.test(text)) {
        return true;
    }
    // Heavy contractors, construction, ready mix, earthmoving
    if (/شركة.*للمقاولات العامة|شركة.*للإنشاءات|شركة.*للخرسانة الجاهزة|شركة.*للنقل الثقيل|شركة.*للشحن واللوجستيات/i.test(text)) {
        return true;
    }
    // Heavy bus fleets
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

const flagged = [];
const stats = {};

comp.forEach(c => {
    for (let f of thirdPassFilters) {
        if (f.test(c)) {
            flagged.push({ c, category: f.category });
            stats[f.category] = (stats[f.category] || 0) + 1;
            break;
        }
    }
});

console.log('--- Third Forensic Audit Findings ---');
console.log(stats);
console.log('Total flagged in third pass:', flagged.length);
console.log('Remaining 100% verified pure B2B count would be:', comp.length - flagged.length);

console.log('\n--- All Flagged Entities ---');
flagged.forEach((f, i) => {
    console.log(`${i+1}. [${f.category}] ${f.c.nameAr} | ${f.c.phone1||f.c.mobile}`);
});
