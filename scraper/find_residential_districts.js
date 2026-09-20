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

const residentialEntities = [];

comps.forEach(c => {
    if (isProtectedTitan(c)) return;
    const addr = (c.address || '').toLowerCase();
    
    // Check for residential districts without industrial zone keyword
    if (/الحي الأول|الحي الاول|الحي الثاني|الحي الثالث|الحي الرابع|الحي الخامس|الحي السادس|الحي السابع|الحي الثامن|الحي التاسع|الحي العاشر|الحي الحادي عشر|الحي المتميز|الشيخ زايد/i.test(addr)) {
        if (!/المنطقة الصناعية|المنطقه الصناعيه|مدينة العاشر|مدينة بدر|مدينة السادات|مدينة برج العرب|أبو رواش|ابورواش/i.test(addr)) {
            // Further verify if it's not a major contractor or corporate HQ
            residentialEntities.push({
                id: c.id,
                name: c.nameAr || c.name,
                sector: c.sector,
                address: c.address
            });
        }
    }
});

console.log('Total entities in purely residential districts:', residentialEntities.length);
residentialEntities.forEach((x, i) => console.log(`${i+1}. [${x.id}] ${x.name} (${x.sector}) -> ${x.address}`));
