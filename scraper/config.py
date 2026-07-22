# ============================================
# Configuration — Egypt Companies Scraper
# Focus: Greater Cairo (القاهرة الكبرى)
# ============================================

# Target sectors with search keywords
SECTORS = {
    'transport': {
        'ar': 'نقل وشحن',
        'keywords': [
            'شركة نقل', 'شركات نقل', 'نقل بضائع', 'شحن', 'نقل ثقيل',
            'transport company egypt', 'freight egypt', 'trucking egypt',
            'logistics egypt', 'cargo egypt'
        ]
    },
    'food': {
        'ar': 'أغذية ومشروبات',
        'keywords': [
            'مصنع أغذية', 'شركة مشروبات', 'توزيع أغذية',
            'food factory egypt', 'beverage company egypt', 'food distribution egypt'
        ]
    },
    'pharma': {
        'ar': 'أدوية',
        'keywords': [
            'شركة أدوية', 'مصنع أدوية', 'توزيع أدوية',
            'pharmaceutical egypt', 'pharma company egypt'
        ]
    },
    'construction': {
        'ar': 'مقاولات',
        'keywords': [
            'شركة مقاولات', 'مقاولات عمومية', 'بناء وتشييد',
            'construction company egypt', 'contractor egypt'
        ]
    },
    'petroleum': {
        'ar': 'بترول وطاقة',
        'keywords': [
            'شركة بترول', 'خدمات بترولية', 'طاقة',
            'oil company egypt', 'petroleum egypt', 'energy egypt'
        ]
    },
    'distribution': {
        'ar': 'توزيع ولوجستيات',
        'keywords': [
            'شركة توزيع', 'لوجستيات', 'سلسلة إمداد',
            'distribution company egypt', 'logistics egypt', 'supply chain egypt'
        ]
    },
    'security': {
        'ar': 'أمن وحراسة',
        'keywords': [
            'شركة أمن', 'حراسة', 'خدمات أمنية',
            'security company egypt', 'guard services egypt'
        ]
    },
    'rental': {
        'ar': 'تأجير سيارات',
        'keywords': [
            'تأجير سيارات', 'إيجار سيارات',
            'car rental egypt', 'vehicle rental egypt'
        ]
    },
    'manufacturing': {
        'ar': 'مصانع',
        'keywords': [
            'مصنع', 'مصانع', 'صناعة',
            'factory egypt', 'manufacturing egypt', 'industrial egypt'
        ]
    },
    'education': {
        'ar': 'مدارس وجامعات',
        'keywords': [
            'مدرسة دولية', 'جامعة خاصة', 'مدارس خاصة',
            'international school egypt', 'private university egypt'
        ]
    },
    'healthcare': {
        'ar': 'مستشفيات',
        'keywords': [
            'مستشفى خاص', 'مستشفيات', 'مركز طبي',
            'private hospital egypt', 'hospital egypt'
        ]
    },
    'tourism': {
        'ar': 'سياحة',
        'keywords': [
            'شركة سياحة', 'سفر وسياحة', 'نقل سياحي',
            'tourism company egypt', 'travel egypt', 'tour operator egypt'
        ]
    },
    'public_transport': {
        'ar': 'نقل جماعي',
        'keywords': [
            'نقل جماعي', 'باصات', 'أتوبيسات',
            'bus company egypt', 'public transport egypt'
        ]
    },
    'delivery': {
        'ar': 'توصيل ودليفري',
        'keywords': [
            'شركة توصيل', 'دليفري', 'توصيل طلبات',
            'delivery company egypt', 'courier egypt', 'last mile egypt'
        ]
    },
    'government': {
        'ar': 'جهات حكومية',
        'keywords': [
            'هيئة حكومية', 'وزارة',
            'government agency egypt'
        ]
    }
}

# Target cities in Greater Cairo
CITIES = {
    'cairo': {'ar': 'القاهرة', 'en': 'Cairo'},
    'giza': {'ar': 'الجيزة', 'en': 'Giza'},
    'qalyubia': {'ar': 'القليوبية', 'en': 'Qalyubia'},
    '6october': {'ar': '6 أكتوبر', 'en': '6th of October City'},
    '10thramadan': {'ar': 'العاشر من رمضان', 'en': '10th of Ramadan City'},
    'obour': {'ar': 'العبور', 'en': 'Obour City'},
    'shorouk': {'ar': 'الشروق', 'en': 'Shorouk City'},
    'helwan': {'ar': 'حلوان', 'en': 'Helwan'},
    'nasr_city': {'ar': 'مدينة نصر', 'en': 'Nasr City'},
    'maadi': {'ar': 'المعادي', 'en': 'Maadi'},
    'new_cairo': {'ar': 'القاهرة الجديدة', 'en': 'New Cairo'},
    'badr': {'ar': 'مدينة بدر', 'en': 'Badr City'},
    'sadat': {'ar': 'مدينة السادات', 'en': 'Sadat City'},
}

# Industrial zones in Greater Cairo (for targeted scraping)
INDUSTRIAL_ZONES = [
    '6th of October Industrial Zone',
    '10th of Ramadan Industrial Zone',
    'Obour Industrial Zone',
    'Badr City Industrial Zone',
    'Sadat City Industrial Zone',
    'Helwan Industrial Zone',
    'Shoubra El Kheima Industrial Zone',
    'Abu Rawash Industrial Zone',
    'Ain Sokhna Industrial Zone',
    'Amreya Industrial Zone',
]

# Google Maps search coordinates (Greater Cairo center + radius)
GOOGLE_MAPS_CENTER = {'lat': 30.0444, 'lng': 31.2357}  # Cairo center
SEARCH_RADIUS_KM = 60  # Covers all Greater Cairo

# Rate limiting settings
REQUEST_DELAY_SECONDS = 2  # Delay between requests to avoid blocking
MAX_RETRIES = 3
REQUEST_TIMEOUT = 30  # seconds

# Output settings
OUTPUT_DIR = 'output'
OUTPUT_FILENAME = 'egypt_fleet_companies'

# Yellow Pages Egypt settings
YELLOW_PAGES_BASE_URL = 'https://www.yellowpages.com.eg'
YELLOW_PAGES_CATEGORIES = [
    'transport-companies',
    'freight-companies',
    'logistics',
    'food-manufacturers',
    'pharmaceutical-companies',
    'construction-companies',
    'car-rental',
    'security-companies',
    'tourism-companies',
    'hospitals',
    'schools',
    'factories',
]

# Job site keywords (companies hiring drivers = have fleets)
JOB_SEARCH_KEYWORDS = [
    'سائق', 'سائق نقل ثقيل', 'سائق تريلا', 'driver',
    'fleet manager', 'مدير أسطول', 'مشرف حركة',
    'transport manager', 'مدير نقل'
]

# Priority classification rules
PRIORITY_RULES = {
    'A': {
        'min_fleet_size': 100,
        'company_sizes': ['large'],
        'sectors': ['transport', 'food', 'petroleum', 'construction', 'public_transport', 'rental']
    },
    'B': {
        'min_fleet_size': 30,
        'company_sizes': ['medium', 'large'],
        'sectors': ['distribution', 'delivery', 'pharma', 'manufacturing', 'security', 'tourism']
    },
    'C': {
        'min_fleet_size': 0,
        'company_sizes': ['small'],
        'sectors': ['education', 'healthcare', 'government']
    }
}
