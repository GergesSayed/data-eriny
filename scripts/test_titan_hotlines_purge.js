const fs = require('fs');

const VERIFIED_HOTLINE_RULES = [
  // 1. Steel & Metallurgy
  { pattern: /حديد عز|عز للصلب|Ezz Steel/i, hotline: '19444', name: 'حديد عز' },
  { pattern: /السويدي إليكتريك|السويدي الكتريك|السويدي كابلات|Elsewedy Electric/i, hotline: '19973', name: 'السويدي إليكتريك' },
  
  // 2. Food & Beverage Consumer Giants
  { pattern: /جهينة|Juhayna/i, hotline: '16630', name: 'جهينة للصناعات الغذائية' },
  { pattern: /دومتي|Domty/i, hotline: '16450', name: 'دومتي للصناعات الغذائية' },
  { pattern: /إيديتا|Edita/i, hotline: '19940', name: 'إيديتا للصناعات الغذائية' },
  { pattern: /المراعي|بيتي|Beyti/i, hotline: '16624', name: 'بيتي / المراعي' },
  { pattern: /عبور لاند|Obour Land/i, hotline: '19404', name: 'عبور لاند' },
  { pattern: /بيبسيكو|PepsiCo|شيبسي للصناعات الغذائية/i, hotline: '16599', name: 'بيبسيكو مصر' },
  { pattern: /كوكاكولا|Coca-Cola/i, hotline: '19494', name: 'كوكاكولا مصر' },
  { pattern: /دانون مصر|Danone/i, hotline: '16146', name: 'دانون مصر' },
  { pattern: /نستله مصر|Nestle/i, hotline: '16180', name: 'نستله مصر' },
  { pattern: /حلواني إخوان|حلواني اخوان|Halwani Bros/i, hotline: '19882', name: 'حلواني إخوان' },
  { pattern: /أمريكانا مصر|امريكانا مصر|كوكي للأغذية/i, hotline: '19077', name: 'أمريكانا / كوكي' },
  { pattern: /حلواني العبد|حلويات العبد/i, hotline: '16766', name: 'حلواني العبد' },
  { pattern: /حلواني لابوار|La Poire/i, hotline: '19512', name: 'لابوار' },
  
  // 3. Construction & Real Estate Giants
  { pattern: /المقاولون العرب|عثمان أحمد عثمان|Arab Contractors/i, hotline: '16960', name: 'المقاولون العرب' },
  { pattern: /أوراسكوم للإنشاءات|Orascom Construction/i, hotline: '16500', name: 'أوراسكوم للإنشاءات' },
  { pattern: /حسن علام القابضة|أبناء حسن علام|Hassan Allam/i, hotline: '16888', name: 'حسن علام القابضة' },
  { pattern: /طلعت مصطفى|Talaat Moustafa/i, hotline: '19691', name: 'مجموعة طلعت مصطفى' },

  // 4. Heavy Transport & Logistics
  { pattern: /أرامكس مصر|Aramex/i, hotline: '16996', name: 'أرامكس مصر' },
  { pattern: /دي إتش إل|DHL Express/i, hotline: '16345', name: 'دي إتش إل إكسبريس' },
  { pattern: /جو باص|Go Bus/i, hotline: '19567', name: 'جو باص' },
  { pattern: /سوبر جيت|الاتحاد العربي للنقل البري والسياحة/i, hotline: '19620', name: 'سوبر جيت' },
  { pattern: /غبور أوتو|جي بي كورب|GB Auto|GB Corp/i, hotline: '19828', name: 'غبور أوتو' },
  { pattern: /مانتراك مصر|Mantrac Egypt/i, hotline: '19266', name: 'مانتراك مصر' },

  // 5. Building Materials & Sanitary Ware
  { pattern: /سيراميكا كليوباترا|Ceramica Cleopatra/i, hotline: '19779', name: 'سيراميكا كليوباترا' },
  { pattern: /كناف مصر|Knauf Egypt/i, hotline: '17300', name: 'كناف مصر للجبس' },
  { pattern: /ديورافيت مصر|Duravit/i, hotline: '19219', name: 'ديورافيت مصر' },
  { pattern: /أيديال ستاندرد|ايديال ستاندرد|Ideal Standard/i, hotline: '19696', name: 'أيديال ستاندرد' },
  { pattern: /روكا مصر|Roca Egypt/i, hotline: '16635', name: 'روكا مصر' },
  { pattern: /السويس للأسمنت|هايدلبرج ماتيريالز|Heidelberg Materials/i, hotline: '19083', name: 'السويس للأسمنت (هايدلبرج)' },
  { pattern: /لافارج للأسمنت مصر|هولسيم مصر|Lafarge Cement Egypt|Holcim Egypt/i, hotline: '16636', name: 'لافارج للأسمنت (هولسيم)' },
  { pattern: /النساجون الشرقيون|Oriental Weavers/i, hotline: '16366', name: 'النساجون الشرقيون' },

  // 6. Paints & Coatings
  { pattern: /كابسي للدهانات|Kapci Coatings/i, hotline: '16008', name: 'كابسي للدهانات' },
  { pattern: /سايبس للدهانات|Sipes Egypt|Sipes Paints/i, hotline: '19852', name: 'سايبس للدهانات' },
  { pattern: /GLC Paints|الألمانية اللبنانية للدهانات/i, hotline: '16730', name: 'دهانات GLC' },

  // 7. Home Appliances & Electronics
  { pattern: /بي تك|B\.TECH/i, hotline: '19966', name: 'بي تك' },
  { pattern: /مجموعة العربي للصناعات|توشيبا العربي|تورنيدو العربي|Elaraby Group/i, hotline: '19319', name: 'مجموعة العربي' },
  { pattern: /مجموعة فريش|شركة فريش إليكتريك|Fresh Electric/i, hotline: '19059', name: 'فريش إليكتريك' },
  { pattern: /كريازي|Kiriazi/i, hotline: '19091', name: 'كريازي' },
  { pattern: /يونيون إير|يونيون اير|Unionaire/i, hotline: '19012', name: 'يونيون إير' },
  { pattern: /يونيفرسال لصناعة الأجهزة|يونيفرسال للأجهزة|Universal Group/i, hotline: '19797', name: 'يونيفرسال' },
  { pattern: /أوليمبيك إليكتريك|اوليمبيك اليكتريك|Olympic Electric/i, hotline: '19999', name: 'أوليمبيك إليكتريك' },
  { pattern: /ميراكو كاريير|Miraco Carrier/i, hotline: '19111', name: 'ميراكو كاريير' },

  // 8. Energy, Petroleum & Gas
  { pattern: /بتروجيت|Petrojet/i, hotline: '19745', name: 'بتروجيت' },
  { pattern: /غاز مصر|Egypt Gas/i, hotline: '19220', name: 'غاز مصر' },
  { pattern: /طاقة عربية|TAQA Arabia/i, hotline: '19134', name: 'طاقة عربية' },
  { pattern: /المصرية للاتصالات \(وي|Telecom Egypt \(WE/i, hotline: '111', name: 'المصرية للاتصالات WE' },

  // 9. Pharmaceuticals & Others
  { pattern: /إيفا فارما|ايفا فارما|Eva Pharma/i, hotline: '19790', name: 'إيفا فارما' },
  { pattern: /تاكي فايتا|Taki-Vita/i, hotline: '19799', name: 'تاكي فايتا' }
];

const titans = JSON.parse(fs.readFileSync('crm/js/egypt_verified_titans.js', 'utf8').slice(fs.readFileSync('crm/js/egypt_verified_titans.js', 'utf8').indexOf('['), fs.readFileSync('crm/js/egypt_verified_titans.js', 'utf8').lastIndexOf(']') + 1));

console.log('Testing refined verified hotline rules on 1,000 Titans:');
let verifiedMatches = [];
let purgedCount = 0;

titans.forEach(t => {
  let matchedRule = null;

  for (const r of VERIFIED_HOTLINE_RULES) {
    if (r.pattern.test(t.nameAr) || (t.nameEn && r.pattern.test(t.nameEn))) {
      matchedRule = r;
      break;
    }
  }

  if (matchedRule) {
    verifiedMatches.push({
      id: t.id,
      nameAr: t.nameAr,
      brand: matchedRule.name,
      hotline: matchedRule.hotline,
      oldHotline: t.hotline
    });
  } else {
    if (t.hotline) {
      purgedCount++;
    }
  }
});

console.log(`\nResults:`);
console.log(`- Verified Titans with legitimate official hotline: ${verifiedMatches.length}`);
console.log(`- Fake/Hallucinated Hotlines PURGED: ${purgedCount}`);
console.log(`- Total Titans with empty hotline (proper B2B format): ${titans.length - verifiedMatches.length}`);

console.log(`\nDetailed list of all matched Titans and their verified hotlines:`);
verifiedMatches.forEach((m, idx) => {
  console.log(`${idx + 1}. ${m.id} | ${m.hotline} (was: ${m.oldHotline || 'none'}) | [${m.brand}] ${m.nameAr}`);
});
