const fs = require('fs');
const comps = require('../crm/data/companies.json');

function isProtectedTitan(c) {
    if (c.id && c.id.startsWith('eg_titan_')) return true;
    const name = (c.nameAr || c.name || '').trim();
    const eng = (c.nameEn || '').trim();
    const text = (name + ' ' + eng).toLowerCase();
    if (/gipsina|sina gips|duravit|electrolux|cleopatra|oriental weavers|totalenergies|elsewedy|kandil steel|egypt aluminium|alpla 10th|friday ice cream|startex|solex|soven|unipack|rich bake|halwani|جهينة|دومتي|إيديتا|بيتي|شيبسي|عبور لاند|حديد عز|السويدي|لافارج|سيمكس|بتروجيت|المقاولون العرب|أوراسكوم|حسن علام|redcon|novartis|unilever|gac egypt|taki|مراتب تاكى|مصنع قادر|مونتانا|جوهر ستيل|الفجر ستيل|الشناوي تانك|بولي تكس|حورس للتهويه|روتوكرافيا|rotografia|compo expert|volvo cars egypt/i.test(text)) return true;
    return false;
}

const flagged = [];

comps.forEach(c => {
    if (isProtectedTitan(c)) return;
    const nameAr = (c.nameAr || '').trim();
    const nameEn = (c.nameEn || '').trim();
    const addr = (c.address || '').trim();
    const notes = (c.notes || '').trim();
    const full = (nameAr + ' ' + nameEn + ' ' + addr + ' ' + notes).toLowerCase();

    const reasons = [];

    // 1. Any entity in a mall / shopping plaza
    if (/\bmall\b|مول\b|مركز تجاري|سنتر تجاري/i.test(addr)) {
        if (!/المنطقة الصناعية|مدينة العاشر|مدينة بدر|مدينة السادات|مدينة برج العرب/i.test(addr) || /office|flat|شقة|محل|وحدة|unit|store|el-naggar mall|el naggar mall/i.test(addr)) {
            reasons.push('عنوان بمول تجاري أو سنتر تسوق');
        }
    }

    // 2. Private passenger car repair / detailing / garages
    if (/إصلاح وتجديد السيارات|صيانة وتجديد سيارات|مركز خدمة سيارات|تجديد سيارات ملاكي/i.test(full)) {
        reasons.push('مركز تجديد أو تصليح سيارات ملاكي أفراد');
    }

    // 3. Residential compounds / villas / apartments without factory / fleet context
    if (/compound\b|كمبوند|كمباوند|villa \d+|فيلا \d+/i.test(addr)) {
        if (!/مصنع|شركة مقاولات كبرى/i.test(full)) {
            reasons.push('عنوان داخل كمبوند أو فيلا سكنية');
        }
    }

    // 4. EV charging kiosks or small utility points
    if (/recharged by infinity|محطة شحن كهربائي أفراد/i.test(full)) {
        reasons.push('نقطة شحن سيارات كهربائية بمول');
    }

    // 5. Reptiles / Pets / Aquariums / Non-fleet oddities
    if (/live reptiles exporter|تصدير زواحف|محل أسماك زينة/i.test(full)) {
        reasons.push('نشاط أفراد أو حيوانات وزواحف أليفة');
    }

    // 6. Generic single person names without any corporate or factory indication
    const name = nameAr || nameEn;
    if (/^[أ-ي]+\s+[أ-ي]+(\s+[أ-ي]+)?$/.test(name)) {
        if (!/شركة|شركه|مصنع|مجموعة|مجموعه|مؤسسة|مؤسسه|مجمع|توكيل|مقاولات|للصناعة|للصناعه|للتجارة|للتجاره|للنقل|للتوريدات|للتوزيع|الهندسية|الهندسيه|الدولية|الدوليه|المصرية|المصريه|العالمية|العالميه|العربية|العربيه|ستيل|جروب|للتنمية|للتنميه|للخدمات|تكنولوجي|تك\b|تكس\b|بلاست\b|فود\b|فارما\b|كيميكال|ميتال|الوطنية|الوطنيه|الحديثة|الحديثه|كرفان|طوب|رخام|جرانيت|خرسانة/i.test(name)) {
            if (!/المنطقة الصناعية|قطعة|مصنع/i.test(addr)) {
                reasons.push('اسم شخص فردي بدون صفة تجارية أو أسطول');
            }
        }
    }

    if (reasons.length > 0) {
        flagged.push({
            id: c.id,
            name: name,
            sector: c.sector,
            city: c.city,
            address: addr,
            reasons: reasons.join(' + ')
        });
    }
});

console.log('Total flagged candidate entities:', flagged.length);
flagged.forEach((f, idx) => {
    console.log(`${idx+1}. [${f.id}] ${f.name} (${f.sector} | ${f.city}) -> ${f.reasons} | ${f.address}`);
});
