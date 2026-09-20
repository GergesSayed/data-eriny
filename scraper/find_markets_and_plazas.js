const fs = require('fs');
const comps = require('../crm/data/companies.json');

function isProtectedTitan(c) {
    if (c.id && c.id.startsWith('eg_titan_')) return true;
    const name = (c.nameAr || c.name || '').trim();
    const eng = (c.nameEn || '').trim();
    const text = (name + ' ' + eng).toLowerCase();
    if (/gipsina|sina gips|duravit|electrolux|cleopatra|oriental weavers|totalenergies|elsewedy|kandil steel|egypt aluminium|alpla 10th|friday ice cream|startex|solex|soven|unipack|rich bake|halwani|جهينة|دومتي|إيديتا|بيتي|شيبسي|عبور لاند|حديد عز|السويدي|لافارج|سيمكس|بتروجيت|المقاولون العرب|أوراسكوم|حسن علام|redcon|novartis|unilever|gac egypt|taki|مراتب تاكى|مصنع قادر|مونتانا|جوهر ستيل|الفجر ستيل|الشناوي تانك|بولي تكس|حورس للتهويه|روتوكرافيا|rotografia|compo expert|volvo cars egypt|عز العرب|شورى|اعلاف الوادي|أعلاف الوادي/i.test(text)) return true;
    return false;
}

const found = [];

comps.forEach(c => {
    if (isProtectedTitan(c)) return;
    const addr = (c.address || '').toLowerCase();
    const name = ((c.nameAr || c.name || '') + ' ' + (c.nameEn || '')).toLowerCase();
    const full = (name + ' ' + addr).toLowerCase();

    // Look for commercial plazas, street markets, showrooms, retail desks
    if (/بلازا|plaza|سوق|معرض|محل\b|بوتيك|سنترال|كشك/i.test(addr)) {
        if (!/المنطقة الصناعية|قطعة \d+|بلوك \d+|المطورين/i.test(addr)) {
            found.push({
                id: c.id,
                name: c.nameAr || c.name,
                sector: c.sector,
                address: c.address
            });
        }
    }
});

console.log('Total found in plazas, markets, showrooms:', found.length);
found.forEach((x, i) => console.log(`${i+1}. [${x.id}] ${x.name} (${x.sector}) -> ${x.address}`));
