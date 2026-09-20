const fs = require('fs');
const comps = require('../crm/data/companies.json');

console.log('Total companies in database:', comps.length);

function isProtectedTitan(c) {
    if (c.id && c.id.startsWith('eg_titan_')) return true;
    const name = (c.nameAr || c.name || '').trim();
    const eng = (c.nameEn || '').trim();
    const text = (name + ' ' + eng).toLowerCase();
    if (/gipsina|sina gips|duravit|electrolux|cleopatra|oriental weavers|totalenergies|elsewedy|kandil steel|egypt aluminium|alpla 10th|friday ice cream|startex|solex|soven|unipack|rich bake|halwani|جهينة|دومتي|إيديتا|بيتي|شيبسي|عبور لاند|حديد عز|السويدي|لافارج|سيمكس|بتروجيت|المقاولون العرب|أوراسكوم|حسن علام|redcon|novartis|unilever|gac egypt|taki|مراتب تاكى|مصنع قادر/i.test(text)) return true;
    if (c.id === 'eg_b2b_fleet_36999' || c.id === 'eg_b2b_fleet_41215') return true;
    return false;
}

// Forensic audit checks
const tests = [
    {
        name: 'أسماء أشخاص أفراد أو أسماء شخصية بحتة',
        test: (c, text) => {
            const name = (c.nameAr || c.name || '').trim();
            // Check if name is just 2-3 personal Arabic words with no company keyword
            if (/^[أ-ي]+\s+[أ-ي]+(\s+[أ-ي]+)?$/.test(name)) {
                if (!/شركة|مصنع|مجموعة|مؤسسة|مقاولات|للصناعة|للتجارة|للنقل|للتوريدات|ستيل|جروب|للتوزيع|للتنمية|للخدمات|العالمية|المصرية|الدولية|الهندسية/i.test(name)) {
                    return true;
                }
            }
            if (/^amr\s+ahmed|^ahmed\s+[a-z]+$|^mohamed\s+[a-z]+$/i.test(c.nameEn || '')) return true;
            return false;
        }
    },
    {
        name: 'شقق وأدوار سكنية وفيلات وعمارات ومولات تجارية وسكنية',
        test: (c, text) => {
            const addr = (c.address || '').toLowerCase();
            if (/شقة|شقه|دور أول|دور ثان|دور ثالث|دور رابع|دور خامس|دور أرضي|دور ارضي|عمارة \d+|عماره \d+|فيلا \d+|villa \d+|flat \d+|apartment \d+|suite \d+|مول \d+|mall\b/i.test(addr)) {
                if (!/المنطقة الصناعية|مدينة العاشر|مدينة 6 اكتوبر|مدينة السادات|مدينة برج العرب|مدينة بدر/i.test(addr)) {
                    return true;
                }
            }
            return false;
        }
    },
    {
        name: 'مكاتب سياحة وحجز تذاكر طيران ورحلات أفراد',
        test: (c, text) => {
            return /حجز تذاكر|تذاكر طيران|سياحة دينية|عمرة وحج|travel agency|tourism travel|رحلات سياحية أفراد/i.test(text);
        }
    },
    {
        name: 'مكاتب شحن طرود سريع وفروع استلام كوريير أفراد',
        test: (c, text) => {
            return /flick courier|rapide logistics & courier|استلام طرود|فرع استلام|شحن طرود أفراد/i.test(text);
        }
    },
    {
        name: 'مكاتب استشارات وتصميم ديكور وتصميم داخلي وبرمجة',
        test: (c, text) => {
            return /design studio|interior design|decor studio|استوديو ديكور|تصميم داخلي|web development|software house|برمجيات وتطبيقات/i.test(text) && !/مصنع|شركة مقاولات كبرى/i.test(text);
        }
    },
    {
        name: 'محلات ومعارض كماليات وسيارات ملاكي ومغاسل وغيار زيت وزوايا وترصيص',
        test: (c, text) => {
            return /مغسلة سيارات|غسيل سيارات|غيار زيت وترصيص|زوايا وترصيص|تلميع سيارات|تفييم|كماليات سيارات ملاكي/i.test(text);
        }
    },
    {
        name: 'محلات تجزئة وأغذية ومطاعم وكافيهات ومخابز',
        test: (c, text) => {
            if (/توزيع الأغذية المحفوظة وسلاسل السوبرماركت/i.test(text)) return false;
            return /مطعم\b|كافيه\b|كوفي شوب|شاورما|بيتزا|برجر|عصائر|مخبز\b|حلواني|ألبان\b|جزارة\b|سوبر ماركت\b|ماركت\b/i.test(text) && !/صناعات غذائية كبرى|مصنع|مجموعة/i.test(text);
        }
    },
    {
        name: 'صيدليات وعيادات ومختبرات ومراكز أشعة وتجميل',
        test: (c, text) => {
            return /صيدلية\b|عيادة\b|معمل تحاليل|مركز أشعة|بيوتي سنتر|تجميل\b|صالون\b/i.test(text) && !/شركة أدوية|مصنع أدوية|مستودع أدوية/i.test(text);
        }
    },
    {
        name: 'محلات بيع خامات وعدد وأدوات ومسامير وموازين بالقطاعي',
        test: (c, text) => {
            return /موازين|ميزان|بسكول|تولز|tools\b|مسامير|رولمان بلي|رولمان بلى|حدائد وبويات/i.test(text) && !/مصنع|مجمع صناعات/i.test(text);
        }
    },
    {
        name: 'ورش حرفية صغيرة ونجارة وتطريز وألوميتال شوارع',
        test: (c, text) => {
            return /ورشة نجارة|ورشه نجاره|ورشه حداده|ورشة حدادة|ورشة ألوميتال|شباك ألوميتال|تطريز كمبيوتر محلي/i.test(text);
        }
    },
    {
        name: 'بقايا سجلات المسح الجغرافي العشوائية غير المؤهلة (Census POIs)',
        test: (c, text) => {
            if (c.notes && c.notes.includes('مسح جغرافي')) {
                // If it's not a known protected heavy company or industrial plant, check carefully
                const name = c.nameAr || c.nameEn || '';
                if (!/مصنع|شركة\s+المقاولون|شركة\s+النصر|شركة\s+السويدي|شركة\s+ريدكون|شركة\s+حديد|شركة\s+أسمنت|شركة\s+بترول|مسبك|درفلة/i.test(name)) {
                    return true;
                }
            }
            return false;
        }
    }
];

const flagged = [];
const seen = new Set();

comps.forEach(c => {
    if (isProtectedTitan(c)) return;
    const name = (c.nameAr || c.name || '').trim();
    const eng = (c.nameEn || '').trim();
    const addr = (c.address || '').trim();
    const text = (name + ' ' + eng + ' ' + addr).toLowerCase();

    for (const t of tests) {
        if (t.test(c, text)) {
            if (!seen.has(c.id)) {
                seen.add(c.id);
                flagged.push({
                    id: c.id,
                    name: name || eng,
                    sector: c.sector,
                    testName: t.name,
                    address: c.address,
                    phone: c.phone1 || c.mobile,
                    notes: c.notes
                });
            }
            break;
        }
    }
});

console.log('Total flagged candidate entities for exclusion:', flagged.length);

const bySector = {};
const byTest = {};

flagged.forEach(f => {
    bySector[f.sector] = (bySector[f.sector] || 0) + 1;
    byTest[f.testName] = (byTest[f.testName] || 0) + 1;
});

console.log('\nBreakdown by Sector:');
Object.entries(bySector).sort((a,b) => b[1] - a[1]).forEach(([s, count]) => console.log(`- ${s}: ${count}`));

console.log('\nBreakdown by Test Category:');
Object.entries(byTest).sort((a,b) => b[1] - a[1]).forEach(([t, count]) => console.log(`- ${t}: ${count}`));

fs.writeFileSync('./scraper/output/forensic_candidates.json', JSON.stringify(flagged, null, 2));
console.log('\nSaved details to scraper/output/forensic_candidates.json');
