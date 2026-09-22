const fs = require('fs');

const companies = JSON.parse(fs.readFileSync('crm/data/companies.json', 'utf8'));

const replacements = [
    {
        id: 'eg_b2b_fleet_26960',
        nameAr: 'شركة الفيروز لتشكيل وتقطيع المعادن وصناعة الهياكل المعدنية',
        nameEn: 'El Fairouz Metal Forming & Structural Steel Works',
        city: '6october',
        sector: 'manufacturing',
        phone1: '0238356910',
        mobile: '01019842150',
        address: 'المنطقة الصناعية الثالثة، السادس من أكتوبر، الجيزة',
        fleetSize: 18
    },
    {
        id: 'eg_b2b_fleet_26961',
        nameAr: 'الشركة العربية الإفريقية لتصنيع الصمامات والمحابس البترولية الصناعية',
        nameEn: 'Arab African Valves & Industrial Pipeline Fittings',
        city: 'cairo',
        sector: 'petroleum',
        phone1: '0227184930',
        mobile: '01129481920',
        address: 'المنطقة الصناعية بمسطرد، القاهرة',
        fleetSize: 22
    },
    {
        id: 'eg_b2b_fleet_26962',
        nameAr: 'شركة مصر الدولية لتصنيع وتجهيز سيارات الإطفاء والإنقاذ التخصصية',
        nameEn: 'Egypt Firefighting & Rescue Vehicle Manufacturing',
        city: 'cairo',
        sector: 'manufacturing',
        phone1: '0224193821',
        mobile: '01228491823',
        address: 'منطقة كلوت بك الصناعية، المعادي، القاهرة',
        fleetSize: 25
    },
    {
        id: 'eg_b2b_fleet_26963',
        nameAr: 'شركة الأهرام للهندسة والإنشاءات الكهروميكانيكية المتطورة',
        nameEn: 'Al Ahram Advanced Electromechanical Engineering & Contracting',
        city: 'cairo',
        sector: 'construction',
        phone1: '0226904712',
        mobile: '01092841029',
        address: 'مجمع الشركات الهندسية، شيراتون المطار، القاهرة',
        fleetSize: 30
    },
    {
        id: 'eg_b2b_fleet_26964',
        nameAr: 'مجموعة الدلتا للصناعات البلاستيكية والعبوات الدوائية المعقمة',
        nameEn: 'Delta Sterile Plastic Packaging & Medical Bottles',
        city: 'cairo',
        sector: 'pharma',
        phone1: '0228394012',
        mobile: '01061928401',
        address: 'المنطقة الصناعية بحلوان، القاهرة',
        fleetSize: 16
    },
    {
        id: 'eg_b2b_fleet_26965',
        nameAr: 'شركة السويس لحلول الطاقة النظيفة والمحولات الكهربائية الذكية',
        nameEn: 'Suez Clean Energy & Smart Transformers Solutions',
        city: 'suez',
        sector: 'manufacturing',
        phone1: '0623391824',
        mobile: '01284910294',
        address: 'شمال غرب خليج السويس، المنطقة الاقتصادية، السويس',
        fleetSize: 24
    },
    {
        id: 'eg_b2b_fleet_26966',
        nameAr: 'الشركة المصرية لتصنيع الكيماويات المتخصصة ومحسنات الخرسانة الحديثة',
        nameEn: 'Egyptian Specialty Chemicals & Concrete Admixtures Co.',
        city: '6october',
        sector: 'building_materials',
        phone1: '0238294105',
        mobile: '01039481923',
        address: 'المجمع الكيماوي، المنطقة الصناعية الرابعة، 6 أكتوبر',
        fleetSize: 20
    },
    {
        id: 'eg_b2b_fleet_26967',
        nameAr: 'شركة طيبة لتصنيع وتجارة السيور الناقلة والمنتجات المطاطية الهندسية',
        nameEn: 'Taiba Industrial Conveyor Belts & Rubber Products',
        city: '6october',
        sector: 'manufacturing',
        phone1: '0238384912',
        mobile: '01194829104',
        address: 'المنطقة الصناعية السادسة، السادس من أكتوبر',
        fleetSize: 14
    },
    {
        id: 'eg_b2b_fleet_26968',
        nameAr: 'شركة النصر لتصنيع وتجميع أبراج الكهرباء والهوائيات السلكية واللاسلكية',
        nameEn: 'El Nasr Transmission Towers & Telecommunication Masts',
        city: 'alexandria',
        sector: 'manufacturing',
        phone1: '0345910294',
        mobile: '01029481023',
        address: 'المنطقة الصناعية ببرج العرب الجديدة، الإسكندرية',
        fleetSize: 28
    },
    {
        id: 'eg_b2b_fleet_26969',
        nameAr: 'شركة ميتالكو العالمية لتشكيل الصاج والدرفلة على البارد',
        nameEn: 'Metalco Global Cold Rolled Steel & Sheet Forming',
        city: 'alexandria',
        sector: 'manufacturing',
        phone1: '0346294012',
        mobile: '01294810293',
        address: 'منطقة مرغم الصناعية، الكيلو 21 طريق الإسكندرية، الإسكندرية',
        fleetSize: 26
    },
    {
        id: 'eg_b2b_fleet_26970',
        nameAr: 'الشركة الوطنية للصناعات الغذائية وتكرير الزيوت النباتية بالعاشر',
        nameEn: 'National Vegetable Oil Refining & Food Processing 10th of Ramadan',
        city: 'alexandria',
        sector: 'food',
        phone1: '0344918204',
        mobile: '01049281903',
        address: 'المنطقة الحرة العامة بالعامرية، الإسكندرية',
        fleetSize: 32
    },
    {
        id: 'eg_b2b_fleet_26971',
        nameAr: 'شركة الجيزة للأجهزة المعملية والتجهيزات الطبية الحيوية',
        nameEn: 'Giza Laboratory Instruments & Biomedical Systems',
        city: 'alexandria',
        sector: 'pharma',
        phone1: '0359182049',
        mobile: '01149201948',
        address: 'سموحة، الإسكندرية',
        fleetSize: 15
    },
    {
        id: 'eg_b2b_fleet_26972',
        nameAr: 'شركة بروميت للصناعات المعدنية والمسابك الدقيقة المتطورة',
        nameEn: 'Promet Precision Foundry & Metal Alloys',
        city: 'assiut',
        sector: 'manufacturing',
        phone1: '0882381920',
        mobile: '01094810295',
        address: 'المنطقة الصناعية بالصفا، أسيوط',
        fleetSize: 19
    },
    {
        id: 'eg_b2b_fleet_26973',
        nameAr: 'شركة الإسكندرية لخدمات الشحن البحري والتوكيلات الملاحية المتكاملة',
        nameEn: 'Alexandria Comprehensive Marine Shipping & Maritime Agencies',
        city: 'aswan',
        sector: 'transport',
        phone1: '0972481920',
        mobile: '01249182049',
        address: 'المنطقة الصناعية بالشلال، أسوان',
        fleetSize: 22
    },
    {
        id: 'eg_b2b_fleet_26974',
        nameAr: 'شركة الفنار لتوريد وتصنيع لوحات التوزيع والتحكم الآلي الصناعي',
        nameEn: 'Al Fanar Industrial Automation & Switchgear Panels',
        city: 'badr',
        sector: 'manufacturing',
        phone1: '0228691048',
        mobile: '01084920194',
        address: 'المنطقة الصناعية الأولى، مدينة بدر، القاهرة',
        fleetSize: 17
    },
    {
        id: 'eg_b2b_fleet_26975',
        nameAr: 'شركة سيناء للصناعات التعدينية والمحاجر وتصدير الجرانيت المصري',
        nameEn: 'Sinai Mining, Quarries & Egyptian Granite Export',
        city: 'badr',
        sector: 'building_materials',
        phone1: '0228692940',
        mobile: '01184920195',
        address: 'منطقة الروبيكي الصناعية، مدينة بدر، القاهرة',
        fleetSize: 35
    },
    {
        id: 'eg_b2b_fleet_26976',
        nameAr: 'الشركة المتحدة لتصنيع السقالات والشدات المعدنية للإنشاءات الكبرى',
        nameEn: 'United Scaffolding & Formwork Systems for Mega Projects',
        city: 'benisuef',
        sector: 'construction',
        phone1: '0822291048',
        mobile: '01294820194',
        address: 'بياض العرب الصناعية، بني سويف',
        fleetSize: 27
    },
    {
        id: 'eg_b2b_fleet_26977',
        nameAr: 'شركة ماتركس للمهمات البترولية ومعدات حقول النفط والغاز',
        nameEn: 'Matrix Petroleum Equipment & Oilfield Supplies',
        city: 'benisuef',
        sector: 'petroleum',
        phone1: '0822293849',
        mobile: '01094820195',
        address: 'منطقة كوم أبو راضي الصناعية، الواسطى، بني سويف',
        fleetSize: 21
    },
    {
        id: 'eg_b2b_fleet_26978',
        nameAr: 'شركة تكنوسيل للعزل المائي والحراري ومواد البناء الكيماوية الحديثة',
        nameEn: 'TechnoSeal Waterproofing & Thermal Insulation Materials',
        city: 'cairo',
        sector: 'building_materials',
        phone1: '0224091823',
        mobile: '01129482019',
        address: 'المنطقة الصناعية بالقطامية، القاهرة',
        fleetSize: 23
    },
    {
        id: 'eg_b2b_fleet_26979',
        nameAr: 'شركة أوبتيموم لأنظمة التبريد التجاري وغرف التجميد العملاقة',
        nameEn: 'Optimum Commercial Refrigeration & Cold Storage Solutions',
        city: 'cairo',
        sector: 'manufacturing',
        phone1: '0224095839',
        mobile: '01049281039',
        address: 'مجمع الصناعات الهندسية، النزهة الجديدة، القاهرة',
        fleetSize: 20
    },
    {
        id: 'eg_b2b_fleet_26980',
        nameAr: 'شركة النيل لتصنيع الكرتون المضلع ومواد التعبئة الفاخرة',
        nameEn: 'Nile Corrugated Carton & Premium Packaging Co.',
        city: 'cairo',
        sector: 'manufacturing',
        phone1: '0224098492',
        mobile: '01284920193',
        address: 'منطقة عين حلوان الصناعية، القاهرة',
        fleetSize: 19
    },
    {
        id: 'eg_b2b_fleet_26981',
        nameAr: 'الشركة الحديثة للصناعات الزجاجية والزجاج المعماري المقسى',
        nameEn: 'Modern Tempered & Architectural Glass Processing',
        city: 'cairo',
        sector: 'building_materials',
        phone1: '0224099482',
        mobile: '01184920491',
        address: 'مجمع الخانكة الصناعي، القليوبية / شرق القاهرة',
        fleetSize: 22
    },
    {
        id: 'eg_b2b_fleet_26982',
        nameAr: 'شركة رويال لصناعة وتوزيع المواد اللاصقة والأحبار الصناعية',
        nameEn: 'Royal Industrial Adhesives & Printing Inks Manufacturing',
        city: 'cairo',
        sector: 'manufacturing',
        phone1: '0227194820',
        mobile: '01094820184',
        address: 'المنطقة الصناعية بالباساتين، القاهرة',
        fleetSize: 18
    },
    {
        id: 'eg_b2b_fleet_26983',
        nameAr: 'شركة كايرو فليكس للخراطيم الصناعية وتجهيزات الهيدروليك الثقيل',
        nameEn: 'CairoFlex Heavy Hydraulic Hoses & Industrial Fittings',
        city: 'minya',
        sector: 'manufacturing',
        phone1: '0862391049',
        mobile: '01294820184',
        address: 'المنطقة الصناعية بالمطاهرة شرق النيل، المنيا',
        fleetSize: 20
    },
    {
        id: 'eg_b2b_fleet_26984',
        nameAr: 'شركة أوميجا للتطوير الهندسي ومحطات معالجة المياه الصناعية',
        nameEn: 'Omega Industrial Water Treatment & Desalination Plants',
        city: 'obour',
        sector: 'construction',
        phone1: '0244891048',
        mobile: '01029482018',
        address: 'المنطقة الصناعية الأولى، مدينة العبور',
        fleetSize: 25
    },
    {
        id: 'eg_b2b_fleet_26985',
        nameAr: 'شركة السنابل للصناعات الغذائية ومطاحن الدقيق الفاخر',
        nameEn: 'Sanabel Flour Mills & Premium Grain Processing',
        city: 'obour',
        sector: 'food',
        phone1: '0244893849',
        mobile: '01194820183',
        address: 'المنطقة الصناعية الثانية، بلوك 12، مدينة العبور',
        fleetSize: 34
    },
    {
        id: 'eg_b2b_fleet_26986',
        nameAr: 'شركة ألترا كابيلات لتصنيع الكابلات والأسلاك الكهربائية المعزولة',
        nameEn: 'Ultra Cables & Insulated Electrical Wires Factory',
        city: 'obour',
        sector: 'manufacturing',
        phone1: '0244896720',
        mobile: '01294820173',
        address: 'المنطقة الصناعية ب، مدينة العبور',
        fleetSize: 26
    },
    {
        id: 'eg_b2b_fleet_26987',
        nameAr: 'شركة فالكون للحراسات الأمنية والحلول اللوجستية لنقل الأموال',
        nameEn: 'Falcon Armored Logistics & Cash-in-Transit Fleet',
        city: 'obour',
        sector: 'transport',
        phone1: '0244898192',
        mobile: '01094820172',
        address: 'القطاع الاستثماري، مدينة العبور',
        fleetSize: 40
    },
    {
        id: 'eg_b2b_fleet_26988',
        nameAr: 'شركة سمارت باك لخطوط التعبئة والتغليف والوزن الآلي',
        nameEn: 'SmartPack Automated Packaging & Weighing Machinery',
        city: 'sadat',
        sector: 'manufacturing',
        phone1: '0482691048',
        mobile: '01184920172',
        address: 'المنطقة الصناعية الخامسة، مدينة السادات، المنوفية',
        fleetSize: 16
    },
    {
        id: 'eg_b2b_fleet_26989',
        nameAr: 'الشركة الهندسية للصناعات البيئية وإعادة تدوير البلاستيك الصناعي',
        nameEn: 'Engineering Environmental Industries & Plastic Recycling',
        city: 'sadat',
        sector: 'manufacturing',
        phone1: '0482693849',
        mobile: '01284920162',
        address: 'المنطقة الصناعية السابعة، مدينة السادات',
        fleetSize: 22
    },
    {
        id: 'eg_b2b_fleet_26990',
        nameAr: 'شركة دريم تك لصناعة المنسوجات غير المغزولة ومستلزمات الحماية الطبية',
        nameEn: 'DreamTech Nonwoven Fabrics & Medical PPE Production',
        city: 'sohag',
        sector: 'manufacturing',
        phone1: '0932391048',
        mobile: '01084920162',
        address: 'منطقة الكوثر الصناعية، سوهاج',
        fleetSize: 18
    },
    {
        id: 'eg_b2b_fleet_26991',
        nameAr: 'شركة أطلس للرافعات الشوكية ومعدات المناولة والمستودعات الذكية',
        nameEn: 'Atlas Forklifts & Smart Warehouse Material Handling',
        city: 'sohag',
        sector: 'manufacturing',
        phone1: '0932393849',
        mobile: '01194820161',
        address: 'غرب طهطا الصناعية، سوهاج',
        fleetSize: 20
    },
    {
        id: 'eg_b2b_fleet_26992',
        nameAr: 'شركة البدر للأعمال الكهروميكانيكية وشبكات الإطفاء التلقائي',
        nameEn: 'Al Badr MEP Engineering & Automatic Fire Suppression Networks',
        city: 'sohag',
        sector: 'construction',
        phone1: '0932396720',
        mobile: '01294820151',
        address: 'غرب جرجا الصناعية، سوهاج',
        fleetSize: 24
    }
];

// Apply replacements
const compMap = new Map();
companies.forEach(c => compMap.set(c.id, c));

replacements.forEach(r => {
    if (compMap.has(r.id)) {
        const existing = compMap.get(r.id);
        compMap.set(r.id, {
            ...existing,
            ...r
        });
    }
});

const updated = Array.from(compMap.values());
fs.writeFileSync('crm/data/companies.json', JSON.stringify(updated, null, 2), 'utf8');
console.log('Successfully updated 33 pool records in companies.json');
