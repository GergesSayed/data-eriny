import sys, json

sys.stdout.reconfigure(encoding='utf-8')
comps = json.load(open('crm/data/companies.json', encoding='utf-8'))

# Construct the full CITIES dictionary
ALL_CITIES = {
    # القاهرة
    'nasr_city': {'ar': 'مدينة نصر', 'en': 'Nasr City'},
    'new_cairo': {'ar': 'القاهرة الجديدة والتجمع والقطامية', 'en': 'New Cairo & Tagamoa'},
    'heliopolis': {'ar': 'مصر الجديدة والنزهة وشيراتون', 'en': 'Heliopolis & Nozha'},
    'maadi': {'ar': 'المعادي ودجلة والبساتين', 'en': 'Maadi & Degla'},
    'cairo': {'ar': 'القاهرة (مناطق متنوعة)', 'en': 'Cairo (Other Areas)'},
    'helwan': {'ar': 'حلوان و15 مايو', 'en': 'Helwan & 15th of May'},
    'el_tebbin': {'ar': 'التبين ومجمع الصناعات الثقيلة', 'en': 'El Tebbin'},
    'badr': {'ar': 'مدينة بدر والروبيكي للجلود', 'en': 'Badr City & Robbiki'},
    'shorouk': {'ar': 'مدينة الشروق', 'en': 'Shorouk'},
    'shaq_thoaban': {'ar': 'شق الثعبان والرخام', 'en': 'Shaq El Thoaban'},
    'shaq_el_thoaban': {'ar': 'شق الثعبان ومحاجر طرة', 'en': 'Shaq El Thoaban Quarries'},
    'new_capital': {'ar': 'العاصمة الإدارية الجديدة', 'en': 'New Administrative Capital'},
    'downtown': {'ar': 'وسط البلد والتحرير وعابدين', 'en': 'Downtown & Tahrir'},
    'abbasiya': {'ar': 'العباسية والأميرية والزيتون', 'en': 'Abbasiya & Amiriya'},
    'shubra_cairo': {'ar': 'شبرا مصر والساحل', 'en': 'Shubra Masr'},
    'salam_marg': {'ar': 'عين شمس والسلام والمرج', 'en': 'Ain Shams & Salam'},
    'mokattam': {'ar': 'المقطم والهضبة الوسطى', 'en': 'Mokattam'},

    # الجيزة
    '6october': {'ar': 'السادس من أكتوبر والمناطق الصناعية', 'en': '6th of October'},
    'october': {'ar': 'أكتوبر والواحات ومحور التوسعات', 'en': 'October Industrial & Wahat'},
    'giza': {'ar': 'الجيزة (الهرم، فيصل، الدقي، زايد، أبو رواش)', 'en': 'Giza & Zayed'},
    'arab_abu_saed': {'ar': 'عرب أبو ساعد وقلاع الطوب الطفلي', 'en': 'Arab Abu Saed'},
    'el_saff': {'ar': 'الصف ومصانع الطوب والحراريات', 'en': 'El Saff'},

    # الشرقية
    '10th_ramadan': {'ar': 'العاشر من رمضان والمنطقة الصناعية', 'en': '10th of Ramadan'},
    '10thramadan': {'ar': 'العاشر من رمضان وبلبيس', 'en': '10th of Ramadan & Belbeis'},
    'sharqia': {'ar': 'الشرقية (الزقازيق ومراكز المحافظة)', 'en': 'Sharqia (Zagazig)'},

    # القليوبية
    'obour': {'ar': 'مدينة العبور والامتداد الصناعي', 'en': 'Obour City'},
    'qalyubia': {'ar': 'القليوبية (شبرا الخيمة، قليوب، قها)', 'en': 'Qalyubia'},
    'banha': {'ar': 'بنها وقها والمنطقة اللوجستية', 'en': 'Banha & Qaha'},
    'qalyub': {'ar': 'قليوب وميت حلفا وطريق مصر إسكندرية', 'en': 'Qalyub'},

    # الإسكندرية
    'alexandria': {'ar': 'الإسكندرية وميناء الإسكندرية والدخيلة', 'en': 'Alexandria & Seaport'},
    'borg_el_arab': {'ar': 'برج العرب والعامرية والمناطق الصناعية', 'en': 'Borg El Arab & Amreya'},

    # المنوفية
    'sadat': {'ar': 'مدينة السادات ومجمع الصناعات الثقيلة', 'en': 'Sadat City'},
    'monufia': {'ar': 'المنوفية (شبين الكوم ومراكز المحافظة)', 'en': 'Monufia (Shebin El Koum)'},
    'quesna': {'ar': 'قويسنا والمنطقة الصناعية الكبرى', 'en': 'Quesna Industrial Zone'},
    'shebin_el_koum': {'ar': 'شبين الكوم ومصانع الغزل والنسيج', 'en': 'Shebin El Koum'},

    # الغربية
    'gharbia': {'ar': 'الغربية (مراكز المحافظة)', 'en': 'Gharbia'},
    'tanta': {'ar': 'طنطا والمجمع اللوجستي المركزي', 'en': 'Tanta Logistics Hub'},
    'mahalla': {'ar': 'المحلة الكبرى وقلاع الغزل والنسيج', 'en': 'El Mahalla El Kubra'},
    'kafr_el_zayat': {'ar': 'كفر الزيات والكيماويات والزيوت', 'en': 'Kafr El Zayat'},
    'qotour': {'ar': 'قطور والحاصلات الزراعية', 'en': 'Qotour'},

    # الدقهلية
    'dakahlia': {'ar': 'الدقهلية (مراكز المحافظة)', 'en': 'Dakahlia'},
    'mansoura': {'ar': 'المنصورة والمنطقة اللوجستية', 'en': 'Mansoura'},
    'gamasa': {'ar': 'جمصة والمنطقة الصناعية الساحلية', 'en': 'Gamasa Industrial Zone'},
    'belqas': {'ar': 'بلقاس وسكر الحامول', 'en': 'Belqas & Hamool'},
    'sherbin': {'ar': 'شربين والمحاصيل الزراعية', 'en': 'Sherbin'},
    'senbellawein': {'ar': 'السنبلاوين والمصنوعات', 'en': 'Senbellawein'},

    # البحيرة
    'beheira': {'ar': 'البحيرة (دمنهور وكفر الدوار والساحل)', 'en': 'Beheira'},
    'nubaria': {'ar': 'النوبارية وصناعات سكر البنجر والاستصلاح', 'en': 'Nubaria & Agro Sugar'},
    'wadi_el_natrun': {'ar': 'وادي النطرون والملاحات والصناعات الاستخراجية', 'en': 'Wadi El Natrun'},

    # كفر الشيخ
    'kafr_el_sheikh': {'ar': 'كفر الشيخ ودسوق', 'en': 'Kafr El Sheikh'},
    'baltim': {'ar': 'بلطيم ومجمع الرمال السوداء والصناعات التعدينية', 'en': 'Baltim Black Sands'},
    'metoubes': {'ar': 'مطوبس والمنطقة الصناعية بملاحة منيسي', 'en': 'Metoubes Industrial'},
    'burullus': {'ar': 'البرلس وميناء التعدين ومحطة الطاقة', 'en': 'Burullus Mining Port'},

    # دمياط
    'damietta': {'ar': 'دمياط وميناء دمياط الجديد وموبكو', 'en': 'Damietta Port & MOPCO'},
    'kafr_saad': {'ar': 'كفر سعد والصناعات التموينية والزيوت', 'en': 'Kafr Saad'},
    'ras_el_bar': {'ar': 'رأس البر وعزبة البرج والترسانات البحرية', 'en': 'Ras El Bar & Shipyards'},

    # السويس
    'suez': {'ar': 'السويس وميناء الأدبية وحوض البترول', 'en': 'Suez & Adabiya Port'},
    'sokhna': {'ar': 'العين السخنة والموانئ التخصصية والمناطق الاقتصادية', 'en': 'Ain Sokhna'},
    'ataqa': {'ar': 'عتاقة والصناعات الثقيلة ومجمع الصلب', 'en': 'Ataqa Industrial'},

    # بورسعيد
    'port_said': {'ar': 'بورسعيد وبورفؤاد والمناطق الحرة', 'en': 'Port Said & Free Zones'},
    'east_port_said': {'ar': 'شرق بورسعيد ومحطة الحاويات وبيراميدز', 'en': 'East Port Said & SCCT'},

    # الإسماعيلية
    'ismailia': {'ar': 'الإسماعيلية ووادي التكنولوجيا وأنفاق القناة', 'en': 'Ismailia & Tech Valley'},
    'sarabiom': {'ar': 'سرابيوم ومحطات فرز وتصدير الفراولة والمانجو', 'en': 'Sarabiom Agro Export'},
    'fayed': {'ar': 'فايد وبساتين الموالح ومحطات التبريد', 'en': 'Fayed Agro Logistics'},
    'qantara_west': {'ar': 'القنطرة غرب والمنطقة الصناعية والتخزينية', 'en': 'Qantara West'},
    'qantara_east': {'ar': 'القنطرة شرق والصوامع الاستراتيجية بسيناء', 'en': 'Qantara East'},

    # مطروح
    'matrouh': {'ar': 'مطروح والساحل الشمالي الغربي', 'en': 'Matrouh & North Coast'},
    'alamein': {'ar': 'العلمين وميناء الحاويات والمشاريع التنموية', 'en': 'El Alamein'},
    'dabaa': {'ar': 'الضبعة ومجمع مشروعات الطاقة النووية', 'en': 'El Dabaa'},
    'marsa_matrouh': {'ar': 'مرسى مطروح وميناء جرجوب اللوجستي الدولي', 'en': 'Marsa Matrouh & Gargoub'},
    'salloum': {'ar': 'السلوم والمنفذ اللوجستي البري الدولي', 'en': 'Salloum Land Port'},
    'siwa': {'ar': 'واحة سيوة وملاحات الملح الصخري والتعدين', 'en': 'Siwa Rock Salt Mining'},

    # الفيوم
    'fayoum': {'ar': 'الفيوم والمناطق الصناعية (كوم أوشيم)', 'en': 'Fayoum'},
    'kom_oshim': {'ar': 'كوم أوشيم الصناعية والملاحات', 'en': 'Kom Oshim'},

    # بني سويف
    'beni_suef': {'ar': 'بني سويف والمناطق الصناعية الكبرى', 'en': 'Beni Suef'},
    'kom_abu_radi': {'ar': 'كوم أبو راضي ومجمعات الإلكترونيات والهندسة', 'en': 'Kom Abu Radi'},
    'bayad_el_arab': {'ar': 'بياض العرب ومجمعات السيراميك ومواد البناء', 'en': 'Bayad El Arab'},

    # المنيا
    'minya': {'ar': 'المنيا والمطاهرة شرق النيل', 'en': 'Minya & Matahra'},
    'samalut': {'ar': 'سمالوط ومحاجر الحجر الجيري الأبيض وكربونات الكالسيوم', 'en': 'Samalut Limestone Quarries'},
    'west_minya': {'ar': 'غرب المنيا ومجمع سكر القناة واستصلاح الأراضي', 'en': 'West Minya & Canal Sugar'},
    'new_minya': {'ar': 'المنيا الجديدة والمنطقة اللوجستية', 'en': 'New Minya'},

    # أسيوط
    'assiut': {'ar': 'أسيوط ومصفاة التكرير والهضبة الغربية', 'en': 'Assiut & ASORC Refinery'},
    'asyut': {'ar': 'منقباد وجحدم ومصانع الأسمنت', 'en': 'Manqabad & Cement Complex'},
    'arab_el_awamer': {'ar': 'عرب العوامر الصناعية ومجمعات الأدوية والمطاحن', 'en': 'Arab El Awamer Industrial'},
    'new_assiut': {'ar': 'أسيوط الجديدة ومجمعات التبريد والتخزين', 'en': 'New Assiut'},

    # سوهاج
    'sohag': {'ar': 'سوهاج ومجمعات المطاحن والغزل والزيوت', 'en': 'Sohag'},
    'kawthar': {'ar': 'حي الكوثر والمنطقة الصناعية ومصانع الكرتون', 'en': 'El Kawthar Industrial'},
    'tahta': {'ar': 'طهطا وغرب طهطا ومحطات فرز وتصدير البصل', 'en': 'Tahta Agro Export'},
    'girga': {'ar': 'جرجا ومجمع مصانع السكر والصوامع', 'en': 'Girga Sugar Mills'},

    # قنا
    'qena': {'ar': 'قنا والجبلاو ومحطات تفريغ وتداول الحبوب', 'en': 'Qena'},
    'nagaa_hammadi': {'ar': 'نجع حمادي ومجمع الألومنيوم العملاق', 'en': 'Nagaa Hammadi Aluminium'},
    'qous': {'ar': 'قوص ومصانع السكر ولب الورق والخشب الحبيبي', 'en': 'Qous Sugar & Paper Mills'},
    'hoo': {'ar': 'منطقة هو الصناعية ومصانع المواسير وشبكات الري', 'en': 'Hoo Industrial Zone'},

    # الأقصر
    'luxor': {'ar': 'الأقصر وطيبة الجديدة والمنطقة اللوجستية', 'en': 'Luxor & New Tiba'},

    # أسوان
    'aswan': {'ar': 'أسوان ومجمع كيما للأسمدة واليوريا والشلال', 'en': 'Aswan & KIMA Complex'},
    'edfu': {'ar': 'إدفو والسباعية ومناجم الفوسفات الصخري والورق', 'en': 'Edfu & Sebaiya Phosphate'},
    'kom_ombo': {'ar': 'كوم أمبو ومصانع السكر وبنبان للطاقة الشمسية', 'en': 'Kom Ombo & Benban Solar'},
    'sebaiya': {'ar': 'السباعية ومجمعات تكسير الفوسفات والجبس الزراعي', 'en': 'El Sebaiya Mining'},
    'toshka': {'ar': 'توشكى الخير ومشروعات الاستصلاح الزراعي الكبرى', 'en': 'Toshka Land Reclamation'},

    # الوادي الجديد
    'new_valley': {'ar': 'الوادي الجديد ومناجم فوسفات أبو طرطور', 'en': 'New Valley & Abu Tartur'},
    'kharga': {'ar': 'الخارجة والصناعات التعدينية ومحطات التمور', 'en': 'El Kharga'},
    'dakhla': {'ar': 'الداخلة ومجمعات التمور والاستصلاح', 'en': 'El Dakhla'},
    'farafra': {'ar': 'الفرافرة وسهل بركة وصوامع الحبوب', 'en': 'El Farafra'},
    'east_oweinat': {'ar': 'شرق العوينات ومزارع القمح والبطاطس التصديرية', 'en': 'East Oweinat Mega Farms'},

    # البحر الأحمر
    'red_sea': {'ar': 'البحر الأحمر والموانئ التعدينية والبترولية', 'en': 'Red Sea'},
    'safaga': {'ar': 'سفاجا وميناء تصدير الفوسفات والحبوب والألومنيوم', 'en': 'Safaga Mining Port'},
    'ras_ghareb': {'ar': 'رأس غارب وقلاع حقول وإنتاج البترول', 'en': 'Ras Ghareb Oilfields'},
    'hurghada': {'ar': 'الغردقة ومحطات الخلط الخرساني والنقل السياحي', 'en': 'Hurghada'},
    'marsa_alam': {'ar': 'مرسى علم وموانئ ومحاجر التعدين والذهب', 'en': 'Marsa Alam Mining'},
    'quseir': {'ar': 'القصير ومناجم التلك والفوسفات التاريخية', 'en': 'El Quseir'},

    # شمال سيناء
    'north_sinai': {'ar': 'شمال سيناء وميناء العريش البحري ومصانع الملح', 'en': 'North Sinai'},
    'el_arish': {'ar': 'العريش وميناء التصدير وملاحات سبيكة', 'en': 'El Arish Port & Sebika'},
    'central_sinai': {'ar': 'وسط سيناء ومجمعات مصانع الأسمنت والجبس', 'en': 'Central Sinai Cement Hub'},
    'bir_al_abd': {'ar': 'بئر العبد ومصانع تكرير الملح الزراعي والصناعي', 'en': 'Bir Al Abd Saltworks'},

    # جنوب سيناء
    'south_sinai': {'ar': 'جنوب سيناء وموانئ التعدين والبترول والترانزيت', 'en': 'South Sinai'},
    'abu_zenima': {'ar': 'أبو زنيمة وقلاع مجمع سيناء للمنجنيز والجبس', 'en': 'Abu Zenima Manganese'},
    'abu_rudeis': {'ar': 'أبو رديس وحقول البترول البحرية وميناء الشحن', 'en': 'Abu Rudeis Petroleum'},
    'ras_sedr': {'ar': 'رأس سدر واللوجستيات والخدمات البترولية', 'en': 'Ras Sedr Logistics'},
    'nuweiba': {'ar': 'نويبع وميناء نويبع البحري الدولي للترانزيت', 'en': 'Nuweiba International Port'},
    'taba': {'ar': 'طابا والمنفذ البري والجوي الدولي', 'en': 'Taba International Port'}
}

comp_cities = set(c.get('city') for c in comps if c.get('city'))
missing = comp_cities - set(ALL_CITIES.keys())
print(f"Total unique cities in comps: {len(comp_cities)}")
print(f"Missing from ALL_CITIES: {missing}")
assert len(missing) == 0, f"Some cities are missing: {missing}"
print("VERIFIED: 100% of all cities in database are fully defined with Arabic titles!")
