import sys, json

sys.stdout.reconfigure(encoding='utf-8')
comps = json.load(open('crm/data/companies.json', encoding='utf-8'))

# The 27 Egyptian Governorates
GOVERNORATES = {
    'gov_cairo': {
        'ar': 'القاهرة',
        'icon': '🏙️',
        'cities': ['nasr_city', 'new_cairo', 'heliopolis', 'maadi', 'cairo', 'helwan', 'badr', 'shorouk', 'shaq_thoaban', 'new_capital', 'shaq_el_thoaban', 'downtown', 'abbasiya', 'el_tebbin', 'shubra_cairo', 'salam_marg', 'mokattam']
    },
    'gov_giza': {
        'ar': 'الجيزة',
        'icon': '🏛️',
        'cities': ['6october', 'giza', 'october', 'arab_abu_saed', 'el_saff']
    },
    'gov_sharqia': {
        'ar': 'الشرقية',
        'icon': '🌿',
        'cities': ['10th_ramadan', '10thramadan', 'sharqia']
    },
    'gov_qalyubia': {
        'ar': 'القليوبية',
        'icon': '🏘️',
        'cities': ['obour', 'qalyubia', 'banha', 'qalyub']
    },
    'gov_alexandria': {
        'ar': 'الإسكندرية',
        'icon': '⚓',
        'cities': ['alexandria', 'borg_el_arab']
    },
    'gov_monufia': {
        'ar': 'المنوفية',
        'icon': '🌾',
        'cities': ['sadat', 'monufia', 'quesna', 'shebin_el_koum']
    },
    'gov_gharbia': {
        'ar': 'الغربية',
        'icon': '🧵',
        'cities': ['gharbia', 'kafr_el_zayat', 'tanta', 'mahalla', 'qotour']
    },
    'gov_dakahlia': {
        'ar': 'الدقهلية',
        'icon': '🌊',
        'cities': ['dakahlia', 'gamasa', 'mansoura', 'belqas', 'sherbin', 'senbellawein']
    },
    'gov_beheira': {
        'ar': 'البحيرة',
        'icon': '🌅',
        'cities': ['beheira', 'nubaria', 'wadi_el_natrun']
    },
    'gov_kafr_el_sheikh': {
        'ar': 'كفر الشيخ',
        'icon': '🐟',
        'cities': ['kafr_el_sheikh', 'baltim', 'metoubes', 'burullus']
    },
    'gov_damietta': {
        'ar': 'دمياط',
        'icon': '🪑',
        'cities': ['damietta', 'kafr_saad', 'ras_el_bar']
    },
    'gov_suez': {
        'ar': 'السويس',
        'icon': '🚢',
        'cities': ['suez', 'sokhna', 'ataqa']
    },
    'gov_port_said': {
        'ar': 'بورسعيد',
        'icon': '⛵',
        'cities': ['port_said', 'east_port_said']
    },
    'gov_ismailia': {
        'ar': 'الإسماعيلية',
        'icon': '🌴',
        'cities': ['ismailia', 'qantara_west', 'qantara_east', 'fayed']
    },
    'gov_matrouh': {
        'ar': 'مطروح',
        'icon': '🏖️',
        'cities': ['matrouh', 'salloum', 'marsa_matrouh', 'dabaa', 'siwa', 'alamein']
    },
    'gov_fayoum': {
        'ar': 'الفيوم',
        'icon': '🏺',
        'cities': ['fayoum', 'kom_oshim']
    },
    'gov_beni_suef': {
        'ar': 'بني سويف',
        'icon': '🏔️',
        'cities': ['beni_suef', 'kom_abu_radi', 'bayad_el_arab']
    },
    'gov_minya': {
        'ar': 'المنيا',
        'icon': '⛰️',
        'cities': ['minya', 'west_minya', 'samalut', 'new_minya']
    },
    'gov_assiut': {
        'ar': 'أسيوط',
        'icon': '🏗️',
        'cities': ['assiut', 'asyut', 'arab_el_awamer', 'new_assiut']
    },
    'gov_sohag': {
        'ar': 'سوهاج',
        'icon': '🌾',
        'cities': ['sohag', 'tahta', 'girga', 'kawthar']
    },
    'gov_qena': {
        'ar': 'قنا',
        'icon': '🏛️',
        'cities': ['qena', 'nagaa_hammadi', 'qous', 'hoo']
    },
    'gov_luxor': {
        'ar': 'الأقصر',
        'icon': '🏛️',
        'cities': ['luxor']
    },
    'gov_aswan': {
        'ar': 'أسوان',
        'icon': '💧',
        'cities': ['aswan', 'toshka', 'edfu', 'kom_ombo', 'sebaiya']
    },
    'gov_new_valley': {
        'ar': 'الوادي الجديد',
        'icon': '🏜️',
        'cities': ['new_valley', 'east_oweinat', 'kharga', 'dakhla', 'farafra']
    },
    'gov_red_sea': {
        'ar': 'البحر الأحمر',
        'icon': '🐠',
        'cities': ['red_sea', 'safaga', 'ras_ghareb', 'hurghada', 'marsa_alam', 'quseir']
    },
    'gov_north_sinai': {
        'ar': 'شمال سيناء',
        'icon': '🏕️',
        'cities': ['north_sinai', 'central_sinai', 'el_arish', 'bir_al_abd']
    },
    'gov_south_sinai': {
        'ar': 'جنوب سيناء',
        'icon': '⛰️',
        'cities': ['south_sinai', 'abu_zenima', 'nuweiba', 'ras_sedr', 'abu_rudeis', 'taba']
    }
}

gov_ar_to_key = {g['ar']: k for k, g in GOVERNORATES.items()}
city_to_gov = {}
for gk, g in GOVERNORATES.items():
    for ck in g['cities']:
        city_to_gov[ck] = gk

# Calculate govCounts
gov_counts = {}
unmapped = []

for c in comps:
    gov_ar = c.get('governorate', '').strip()
    ct = c.get('city', '').strip()
    gk = gov_ar_to_key.get(gov_ar) or city_to_gov.get(ct)
    if gk:
        gov_counts[gk] = gov_counts.get(gk, 0) + 1
    else:
        unmapped.append(c)

total_counted = sum(gov_counts.values())
print(f"Total companies in DB: {len(comps)}")
print(f"Total counted by Govs: {total_counted}")
print(f"Unmapped: {len(unmapped)}")
assert total_counted == len(comps), "Not all companies mapped!"
print("SUCCESS: 100% of companies mapped accurately!\n")

print("Governorates and company counts (Sorted descending):")
for gk, cnt in sorted(gov_counts.items(), key=lambda x: -x[1]):
    g = GOVERNORATES[gk]
    print(f"  {g['icon']} {g['ar']} ({gk}): {cnt:,}")
