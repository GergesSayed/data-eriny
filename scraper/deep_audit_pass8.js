const fs = require('fs');
const comps = require('../crm/data/companies.json');

console.log('Total companies in DB:', comps.length);

function isProtectedTitan(c) {
    if (c.id && c.id.startsWith('eg_titan_')) return true;
    const name = (c.nameAr || c.name || '').trim();
    const eng = (c.nameEn || '').trim();
    const text = (name + ' ' + eng).toLowerCase();
    if (/gipsina|sina gips|duravit|electrolux|cleopatra|oriental weavers|totalenergies|elsewedy|kandil steel|egypt aluminium|alpla 10th|friday ice cream|startex|solex|soven|unipack|rich bake|halwani|جهينة|دومتي|إيديتا|بيتي|شيبسي|عبور لاند|حديد عز|السويدي|لافارج|سيمكس|بتروجيت|المقاولون العرب|أوراسكوم|حسن علام|redcon|novartis|unilever|gac egypt|taki|مراتب تاكى|مصنع قادر|مونتانا|جوهر ستيل|الفجر ستيل|الشناوي تانك|بولي تكس|حورس للتهويه|روتوكرافيا|rotografia|compo expert|volvo cars egypt/i.test(text)) return true;
    return false;
}

const checks = [
    {
        category: 'صالونات حلاقة وتجميل وكوافير وسبا',
        test: (full) => /كوافير|حلاقة|صالون رجالي|صالون حلاقة|بيوتي صالون|سبا\b|\bspa\b|مساج/i.test(full)
    },
    {
        category: 'مدارس وحضانات وأكاديميات تعليمية وسناتر دروس',
        test: (full) => /حضانة|حضانه|مدرسة خاصة|مدرسه خاصة|أكاديمية تعليمية|سنتر تعليمي|دروس خصوصية|تأسيس أطفال/i.test(full) && !/تدريب سائقين|أكاديمية نقل/i.test(full)
    },
    {
        category: 'محلات ملابس وأحذية وشنط وأقمشة وعطور تجزئة',
        test: (full) => /أحذية وشنط|ملابس جاهزة حريمي|بوتيك|طرح ومحجبات|لانجيري|عطور وتركيبات|مكياج ومستحضرات/i.test(full) && !/مصنع ملابس|مصنع غزل|شركة غزل ونسيج/i.test(full)
    },
    {
        category: 'محلات موبايلات وكمبيوتر وإلكترونيات قطاعي',
        test: (full) => /صيانة موبايل|قطع غيار موبايل|اكسسوارات موبايل|لاب توب مستعمل|بلايستيشن|سايبر/i.test(full)
    },
    {
        category: 'مطاعم وكافيهات ومقاهي وعصائر وتيك أواي',
        test: (full) => /كافيه\b|مقهى|كوفي شوب|شاورما|سندوتشات|فطائر|مشويات|بيتزا|برجر|حواوشي|عصائر ومشروبات/i.test(full) && !/صناعات غذائية|مصنع|توزيع أغذية ومشروبات|إنتاج وتوزيع/i.test(full)
    },
    {
        category: 'ورش تنجيد وخياطة وتطريز وزجاج ومرايات شوارع',
        test: (full) => /منجد|تنجيد انتريهات|ترزي|خياط|تفصيل ملابس|زجاج ومرايات|براويز/i.test(full) && !/مصنع زجاج|الزجاج الدوائي|تصنيع الزجاج/i.test(full)
    },
    {
        category: 'ورش صيانة كاوتش وبطاريات شوارع (بنشر/لحام)',
        test: (full) => /لحام كاوتش|بنشر|باتش كاوتش|تزويد نيتروجين|شحن بطاريات شوارع/i.test(full)
    },
    {
        category: 'مكاتب شحن طرود سريع واستلام أفراد',
        test: (full) => /flick courier|rapide logistics|استلام طرود أفراد/i.test(full)
    },
    {
        category: 'سياحة دينية وحجز تذاكر ورحلات أفراد',
        test: (full) => /حجز تذاكر طيران|سياحة دينية|عمرة وحج أفراد/i.test(full)
    }
];

const results = {};
comps.forEach(c => {
    if (isProtectedTitan(c)) return;
    const full = ((c.nameAr || c.name || '') + ' ' + (c.nameEn || '') + ' ' + (c.address || '') + ' ' + (c.notes || '')).toLowerCase();
    
    for (const chk of checks) {
        if (chk.test(full)) {
            results[chk.category] = results[chk.category] || [];
            results[chk.category].push({
                id: c.id,
                name: c.nameAr || c.name,
                sector: c.sector,
                address: c.address
            });
        }
    }
});

console.log('=== SUSPICIOUS ENTITY SCAN RESULTS ===');
for (const [cat, list] of Object.entries(results)) {
    console.log(`\nCategory: ${cat} (${list.length})`);
    list.slice(0, 10).forEach(x => console.log(`  [${x.id}] ${x.name} (${x.sector}) -> ${x.address || ''}`));
}

if (Object.keys(results).length === 0) {
    console.log('Zero suspicious retail/micro entities found in these categories!');
}
