# -*- coding: utf-8 -*-
"""
LinkedIn Free Data Enricher — Fleet CRM
Uses Yahoo/DDG Search (via Selenium/HTTP) to find LinkedIn Company Pages
and Decision Makers (Fleet Managers, Logistics Managers) without paying API costs.

Accuracy Strategies:
  1. Confidence scoring (auto-accept > 0.7, reject < 0.4)
  2. Cross-run dedup guard (same contact can't be assigned to 2+ companies)
  3. Foreign domain rejection (sa/ae/jo/ly domains for Egyptian companies)
  4. Arabic name normalization (strip noise words, normalize Hamza/Alef)
  5. Multi-signal scoring (name + country + URL slug + title)
  6. Strict Facebook filtering (no groups/posts/people/events)
  7. Parse title cleanup (strip Yahoo SERP breadcrumbs)
"""

import os
import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')
import re
import json
import time
import random
import argparse
import urllib.parse
import hashlib
import unicodedata
import urllib.request
import threading
from datetime import datetime
from difflib import SequenceMatcher
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Directories
SCRAPER_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRAPER_DIR, 'output')
INPUT_FILE = os.path.join(OUTPUT_DIR, 'crm_import_ready.json')
PROGRESS_FILE = os.path.join(OUTPUT_DIR, '_ultra_progress.json')

def create_driver():
    options = Options()
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--lang=ar')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_experimental_option('excludeSwitches', ['enable-automation'])
    options.add_experimental_option('useAutomationExtension', False)
    
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ]
    ua = random.choice(user_agents)
    options.add_argument(f'user-agent={ua}')
    
    driver = webdriver.Chrome(options=options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    return driver

def clean_google_url(url):
    """Clean Yahoo/DuckDuckGo/Google wrapped URLs to extract direct LinkedIn URL."""
    if not url:
        return ""
    if "RU=" in url:
        try:
            match = re.search(r'/RU=([^/]+(?:%[0-9a-fA-F]{2}[^/]*)*)/RK=', url)
            if match:
                decoded = urllib.parse.unquote(match.group(1))
                if "linkedin.com" in decoded or "facebook.com" in decoded:
                    return decoded
            parts = url.split("/RU=")
            if len(parts) > 1:
                ru_part = parts[1].split("/RK=")[0]
                decoded = urllib.parse.unquote(ru_part)
                if "linkedin.com" in decoded or "facebook.com" in decoded:
                    return decoded
            parsed = urllib.parse.urlparse(url)
            params = urllib.parse.parse_qs(parsed.query)
            if 'RU' in params:
                return urllib.parse.unquote(params['RU'][0])
        except:
            pass
    if "duckduckgo.com/l/?uddg=" in url:
        parsed = urllib.parse.urlparse(url)
        params = urllib.parse.parse_qs(parsed.query)
        if 'uddg' in params:
            return urllib.parse.unquote(params['uddg'][0])
    if "google.com/url?" in url:
        parsed = urllib.parse.urlparse(url)
        params = urllib.parse.parse_qs(parsed.query)
        if 'q' in params:
            return params['q'][0]
    return url


# --- ARABIC TEXT NORMALIZATION ---
def normalize_arabic(text):
    """Normalize Arabic text for consistent comparison."""
    if not text:
        return ""
    # Normalize different Alef forms
    text = re.sub(r'[\u0622\u0623\u0625]', '\u0627', text)
    # Normalize Taa Marbuta
    text = re.sub(r'\u0629', '\u0647', text)
    # Remove diacritics (tashkeel)
    text = re.sub(r'[\u064B-\u0652]', '', text)
    # Remove tatweel
    text = text.replace('\u0640', '')
    return text

def clean_arabic_prefixes(w):
    """Remove Arabic conjunctions (و) and definite articles (ال, لل)."""
    if w.startswith('و') and len(w) > 3:
        w = w[1:]
    if w.startswith('ال') and len(w) > 3:
        w = w[2:]
    elif w.startswith('لل') and len(w) > 3:
        w = w[2:]
    return w

def get_core_words_for_single_string(text_name):
    """Extract significant unique root words from a single name string."""
    name = normalize_arabic(text_name.lower().strip())
    # Remove content in parentheses
    name = re.sub(r'\(.*?\)', '', name)
    # Remove special characters
    name = re.sub(r'[^\w\s\u0600-\u06FF]', ' ', name)
    name = re.sub(r'\s+', ' ', name).strip()
    
    business_noise = {
        'شركة', 'شركه', 'مؤسسة', 'مؤسسه', 'مجموعة', 'مجموعه', 'فرع', 'مكتب', 'محل', 'توكيل', 'توكيلات',
        'company', 'co', 'ltd', 'inc', 'corp', 'group', 'llc', 'corporation', 'enterprise', 'enterprises',
        'incorporated', 'holding', 'holdings', 'limited', 'partners', 'partner'
    }
    
    industry_noise = {
        'شحن', 'نقل', 'نقليات', 'لوجست', 'لوجستي', 'لوجيستي', 'لوجستيه', 'اللوجستية', 'اللوجستيه', 'logistics', 'shipping', 'transport', 'transportation', 'freight', 'cargo',
        'توصيل', 'delivery', 'express', 'اكسبريس', 'سريع',
        'تخليص', 'جمرك', 'جمركي', 'جمارك', 'customs', 'clearance',
        'استيراد', 'تصدير', 'import', 'export', 'trading', 'trade', 'تجارة',
        'ملاحة', 'marine', 'maritime', 'navigation',
        'بحر', 'بحري', 'بحرية', 'بحريه', 'sea', 'ocean',
        'جو', 'جوي', 'جوية', 'جويه', 'air',
        'بر', 'بري', 'برية', 'بريه', 'land', 'road',
        'خدمة', 'خدمات', 'services',
        'عمل', 'اعمال', 'مقاول', 'مقاولات', 'construction', 'contracting',
        'صنع', 'صناعة', 'صناعات', 'صناعي', 'صناعية', 'industries', 'industrial', 'factory', 'مصنع',
        'بترول', 'طاقة', 'energy', 'oil', 'petroleum', 'gas', 'غاز',
        'سلسلة', 'سلاسل', 'امداد', 'امدادات', 'supply', 'chain',
        'السيارات', 'سيارات', 'باص', 'باصات', 'اتوبيس', 'اتوبيسات', 'ليموزين', 'ايجار', 'تأجير', 'rental', 'rent', 'auto', 'car', 'cars', 'motors', 'موتورز',
        'اثاث', 'موبيليا', 'عفش', 'موبيليات', 'furniture', 'moving',
        'مبرد', 'ثلاجة', 'ثلاجات', 'cold', 'refrigerated',
        'for', 'and', 'the', 'of', 'in', 'to', 'with', 'on', 'at', 'by', 'an', 'a',
        'من', 'الى', 'في', 'على', 'عن', 'مع', 'بين', 'تحت', 'فوق', 'او', 'و', 'ب', 'ل', 'ال', 'لل',
        'داخلي', 'رئيسي', 'عمومي', 'مصر', 'القاهرة', 'الجيزة', 'الاسكندرية', 'cairo', 'giza', 'egypt', 'دولي', 'دولية', 'دوليه', 'international'
    }
    
    words = name.split()
    words_no_biz = [w for w in words if w not in business_noise and len(w) > 1]
    
    cleaned_words = [clean_arabic_prefixes(w) for w in words_no_biz]
    core = [w for w in cleaned_words if w not in industry_noise and len(w) > 1]
    
    if len(core) >= 1:
        return set(core)
    if words_no_biz:
        return set(words_no_biz)
    return set(words)

def get_company_core_words(company):
    core_words = set()
    if isinstance(company, dict):
        name_ar = company.get('nameAr', '')
        name_en = company.get('nameEn', '')
        if name_ar:
            core_words.update(get_core_words_for_single_string(name_ar))
        if name_en:
            core_words.update(get_core_words_for_single_string(name_en))
    else:
        core_words.update(get_core_words_for_single_string(company))
    return core_words

# --- CONFIDENCE SCORING ---
AR_TO_EN_TRANSLIT = {
    "نور": ["noor", "nour"],
    "رضا": ["rida", "reda"],
    "امل": ["amal"],
    "مدينه": ["madina", "medina"],
    "منوره": ["monawara", "munawwarah"],
    "بحيرات": ["lakes", "bohirat", "bohairat"],
    "سبع": ["seven", "sabaa", "saba"],
    "ازعر": ["azar", "alazar"],
    "صعيدي": ["saidi", "siedy", "sidi"],
    "عربيه": ["arab", "arabian", "arabic"],
    "متحده": ["united"],
    "شرق": ["shark", "east"],
    "سلام": ["salam", "peace"],
    "حريه": ["horreya", "freedom", "liberty"],
    "فرسان": ["forsan", "knights"],
    "ايمان": ["iman", "eiman"],
    "فهد": ["fahd", "fahad"],
    "غرابلي": ["gharably", "gharabili"],
    "شحن": ["shipping", "freight", "cargo"],
    "نقل": ["transport", "logistics"],
    "لوجستيات": ["logistics"],
    "مكه": ["makkah", "mecca"],
    "وفاء": ["wafaa", "wafa"],
    "هدى": ["hoda", "houda"],
    "جزيره": ["jazira", "gezirah", "island"],
    "قاهره": ["cairo"],
    "جيزه": ["giza"],
    "حلوان": ["helwan"],
    "معادي": ["maadi"],
    "مصري": ["masry", "elmasry", "egypt", "egyptian"],
    "اكسبريس": ["express"],
    "مصر": ["egypt", "masr"],
}

TRANSPORT_NEGATIVES = [
    'school', 'teacher', 'instructor', 'university', 'college', 'student', 'pupil',
    'hospital', 'doctor', 'nurse', 'physician', 'clinic', 'medical', 'pharmacist',
    'hotel', 'restaurant', 'waiter', 'chef', 'resort', 'tourism', 'travel', 'tourist',
    'bank', 'finance', 'auditor', 'accounting', 'legal', 'lawyer', 'bakery', 'sweets',
    'boutique', 'fashion', 'clothing', 'cafe', 'pharmacy',
    
    'مدرسة', 'مدرس', 'معلم', 'جامعة', 'كلية', 'طالب', 'تلميذ',
    'مستشفى', 'طبيب', 'دكتور', 'ممرض', 'عيادة', 'صيدلية', 'صيدلي',
    'فندق', 'مطعم', 'شيف', 'طباخ', 'كافيه', 'مقهى', 'سياحة', 'سياحي',
    'بنك', 'مصرف', 'حسابات', 'محاسب', 'قانوني', 'محامي', 'محاماه',
    'مخبز', 'حلويات', 'حلواني', 'ملابس', 'أزياء', 'ازياء', 'بوتيك', 'عيادات'
]

TRANSPORT_POSITIVES = [
    'fleet', 'logistics', 'transport', 'freight', 'cargo', 'shipping', 'supply chain',
    'operations', 'operation', 'maintenance', 'workshop', 'garage', 'vehicles',
    'trucks', 'buses', 'procurement', 'purchasing',
    'نقل', 'شحن', 'لوجستي', 'سلاسل الامداد', 'مشتريات', 'تشغيل', 'عمليات', 'صيانة',
    'اسطول', 'أسطول', 'سيارات', 'شاحنات', 'اتوبيسات'
]

FLEET_BUYER_SECTORS = {
    'transport_freight', 'shipping', 'logistics', 'courier', 'delivery',
    'bus_company', 'car_rental', 'limousine', 'moving_company', 'refrigerated',
    'tanker', 'security', 'waste_management', 'ambulance', 'food_distribution',
    'pharma_distribution', 'petroleum', 'gas_station', 'construction', 'school',
    'university', 'tourism', 'hotel', 'cement_steel', 'building_materials',
    'factory_general', 'agriculture', 'supermarket', 'restaurant_chain',
    'ecommerce', 'cleaning', 'telecom'
}

FLEET_BUYER_KEYWORDS = [
    'fleet', 'transport', 'shipping', 'logistics', 'delivery', 'courier', 'cargo',
    'freight', 'bus', 'buses', 'truck', 'trucks', 'rental', 'limousine',
    'نقل', 'شحن', 'لوجست', 'توصيل', 'اسطول', 'أسطول', 'اتوبيس', 'أتوبيس',
    'شاحن', 'سيارات', 'مقاولات', 'معدات', 'توزيع', 'نظافة', 'حراسة'
]

def calculate_relevance_score(result_title, result_url, company_name, result_type='in'):
    """
    Calculate a confidence score (0.0 - 1.0) for how well a search result matches the company.
    Uses multi-signal approach: name matching + country + URL slug + title.
    """
    if not result_title and not result_url:
        return 0.0, ['no_data']
    
    score = 0.0
    reasons = []
    
    core_words = get_company_core_words(company_name)
    title_lower = normalize_arabic((result_title or "").lower())
    url_lower = (result_url or "").lower()
    
    # --- Signal 1: Company name word match in title (0 - 0.4) ---
    if core_words:
        matched_words = 0
        for w in core_words:
            if w in title_lower:
                matched_words += 1
            else:
                translit = AR_TO_EN_TRANSLIT.get(w, [])
                if any(t in title_lower or t in url_lower for t in translit):
                    matched_words += 1
                    
        if matched_words == 0:
            return 0.0, ['no_core_name_match']
            
        word_ratio = matched_words / len(core_words)
        name_score = word_ratio * 0.4
        score += name_score
        reasons.append(f'name_match:{matched_words}/{len(core_words)}')
    
    # --- Signal 2: URL slug match for company pages (0 - 0.3) ---
    if result_type == 'company':
        slug_match = re.search(r'linkedin\.com/company/([^/?&#]+)', url_lower)
        if slug_match:
            slug = urllib.parse.unquote(slug_match.group(1)).replace('-', ' ').replace('_', ' ')
            slug_normalized = normalize_arabic(slug)
            slug_words = set(slug_normalized.split())
            if core_words and slug_words:
                overlap = 0
                matched_slug_words = set()
                for w in core_words:
                    if w in slug_words and w not in matched_slug_words:
                        overlap += 1
                        matched_slug_words.add(w)
                    else:
                        translit = AR_TO_EN_TRANSLIT.get(w, [])
                        matched_t = None
                        for t in translit:
                            if t in slug_words and t not in matched_slug_words:
                                matched_t = t
                                break
                        if matched_t:
                            overlap += 1
                            matched_slug_words.add(matched_t)
                if overlap:
                    slug_score = min(overlap / len(core_words), 1.0) * 0.3
                    score += slug_score
                    reasons.append(f'slug_match:{overlap}')
                comp_clean = ' '.join(sorted(core_words))
                slug_clean = ' '.join(sorted(slug_words))
                sim = SequenceMatcher(None, comp_clean, slug_clean).ratio()
                if sim > 0.5:
                    score += sim * 0.1
                    reasons.append(f'slug_fuzzy:{sim:.2f}')
    
    # --- Signal 3: Egyptian domain check (0 or +0.15 / -0.8) ---
    subdomain_match = re.search(r'https?://([a-z0-9\-]+)\.linkedin\.com', url_lower)
    if subdomain_match:
        subdomain = subdomain_match.group(1)
        if subdomain not in ('eg', 'www'):
            score -= 0.8
            reasons.append(f'foreign_subdomain:{subdomain}')
        elif subdomain == 'eg':
            score += 0.15
            reasons.append('egyptian_domain')
            
    # --- Signal 4: Foreign locations / cities rejection (-0.6) ---
    foreign_cities = ['السعودية', 'الامارات', 'الكويت', 'قطر', 'البحرين', 'عمان', 'الاردن', 'ليبيا',
                      'جدة', 'الرياض', 'دبي', 'ابوظبي', 'الشارقة', 'الدمام', 'المنامة', 'مسقط', 'عمان',
                      'saudi', 'uae', 'kuwait', 'qatar', 'bahrain', 'oman', 'jordan', 'libya',
                      'jeddah', 'riyadh', 'dubai', 'abudhabi', 'sharjah', 'dammam', 'manama', 'muscat']
    if any(city in title_lower or city in url_lower for city in foreign_cities):
        score -= 0.6
        reasons.append('foreign_location')
    
    # --- Signal 5: Full name fuzzy match against title AND URL slug (0 - 0.15) ---
    if isinstance(company_name, dict):
        comp_name_str = company_name.get('nameAr') or company_name.get('nameEn') or ""
    else:
        comp_name_str = company_name
    comp_name_normalized = normalize_arabic(comp_name_str.lower())
    
    slug_match_any = re.search(r'linkedin\.com/(?:company|in)/([^/?&#]+)', url_lower)
    if slug_match_any:
        slug_text = urllib.parse.unquote(slug_match_any.group(1)).replace('-', ' ').replace('_', ' ')
        combined_text = title_lower + ' ' + slug_text
    else:
        combined_text = title_lower
    
    if len(comp_name_normalized) > 5:
        sim = SequenceMatcher(None, comp_name_normalized, combined_text).ratio()
        if sim > 0.3:
            score += sim * 0.15
            reasons.append(f'title_sim:{sim:.2f}')
            
    # --- Signal 6: Sector-specific constraints for Transport/Logistics ---
    is_transport = False
    if isinstance(company_name, dict):
        sector_key = str(company_name.get('sector') or '').lower()
        sector_text = ' '.join([
            sector_key,
            str(company_name.get('sector_details') or ''),
            str(company_name.get('nameAr') or ''),
            str(company_name.get('nameEn') or ''),
        ]).lower()
        is_transport = sector_key in FLEET_BUYER_SECTORS or any(k in sector_text for k in FLEET_BUYER_KEYWORDS)
    else:
        is_transport = any(s in str(company_name).lower() for s in ['transport', 'delivery', 'distribution', 'cargo', 'shipping', 'logistics', 'شحن', 'نقل'])
        
    if is_transport and result_type == 'in':
        has_positives = any(kw in title_lower or kw in url_lower for kw in TRANSPORT_POSITIVES)
        if not has_positives:
            score -= 0.35
            reasons.append('no_transport_keywords_for_transport_company')
            
    has_negatives = any(kw in title_lower for kw in TRANSPORT_NEGATIVES)
    if has_negatives:
        score -= 0.4
        reasons.append('sector_mismatch_negative')
        
    return max(0.0, min(1.0, score)), reasons
 
def is_result_relevant(result_title, result_url, company_name, result_type='in'):
    score, reasons = calculate_relevance_score(result_title, result_url, company_name, result_type)
    core_words = get_company_core_words(company_name)
    if len(core_words) <= 1:
        threshold = 0.65 if result_type == 'company' else 0.70
    else:
        threshold = 0.50 if result_type == 'company' else 0.55
    return score >= threshold

def parse_linkedin_title(text, company_name):
    if not text:
        return "", ""
    cleaned = text
    cleaned = re.sub(r'^LinkedIn\s*(?:[\u0600-\u06FF]+)?\s*', '', cleaned, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r'https?://[\w\.]+linkedin\.com\s*[›»‹>\s]*\b(?:in|company)\b\s*[›»‹>\s]*[\w\-%.]+\s*', '', cleaned, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r'^(?:[›»‹>\s]*\b(?:in|company)\b\s*[›»‹>\s]*)+', '', cleaned, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r'^[›»‹>\s]+', '', cleaned).strip()
    cleaned = re.sub(r'https?://\S+', '', cleaned).strip()
    cleaned = re.sub(r'\s*[\-|]\s*LinkedIn.*$', '', cleaned, flags=re.IGNORECASE).strip()
    
    if not cleaned or len(cleaned) < 2:
        return "", ""
    
    paren_match = re.match(r'^([^(]+)\(([^)]+)\)', cleaned)
    if paren_match:
        name = paren_match.group(1).strip()
        title = paren_match.group(2).strip()
        return name, title
    
    parts = re.split(r'\s*[-—|]\s*', cleaned)
    parts = [p.strip() for p in parts if p.strip()]
    
    name = parts[0] if len(parts) >= 1 else ""
    title = parts[1] if len(parts) >= 2 else ""
    
    name = re.sub(r'^(?:[›»‹>\s]*\b(?:in|company)\b\s*[›»‹>\s]*)+', '', name, flags=re.IGNORECASE).strip()
    name = re.sub(r'^[›»‹>\s]+', '', name).strip()
    if 'â€؛' in name or 'linkedin.com' in name.lower() or 'http' in name.lower():
        return "", ""
    if not name or name.lower() in {'in', 'company', 'linkedin'}:
        return "", ""
    
    return name, title

def google_search_linkedin(driver, query, result_type='in', company_name=''):
    search_url = f"https://search.yahoo.com/search?p={urllib.parse.quote(query)}"
    driver.get(search_url)
    time.sleep(random.uniform(2.5, 4.0))
    
    page_text = driver.find_element(By.TAG_NAME, 'body').text
    no_result_indicators = ['We did not find results', 'No results found', 'did not match any documents', 'Try different keywords']
    if any(indicator.lower() in page_text.lower() for indicator in no_result_indicators):
        return []
    
    links = driver.find_elements(By.TAG_NAME, 'a')
    results = []
    seen_urls = set()
    pattern = 'linkedin.com/in/' if result_type == 'in' else 'linkedin.com/company/'
    
    for link in links:
        try:
            href = link.get_attribute('href')
            if href:
                href = clean_google_url(href)
                if pattern in href and "yahoo.com" not in href and "duckduckgo.com" not in href and "google.com" not in href:
                    norm_url = href.split('?')[0].rstrip('/')
                    if norm_url in seen_urls:
                        continue
                    seen_urls.add(norm_url)
                    title_text = link.text.replace('\n', ' ').strip()
                    if company_name and not is_result_relevant(title_text, href, company_name, result_type):
                        continue
                    results.append({'url': href, 'title': title_text})
        except:
            continue
    return results

def yahoo_search_facebook(driver, query):
    search_url = f"https://search.yahoo.com/search?p={urllib.parse.quote(query)}"
    driver.get(search_url)
    time.sleep(random.uniform(2.5, 4.0))
    
    page_text = driver.find_element(By.TAG_NAME, 'body').text
    if any(indicator.lower() in page_text.lower() for indicator in ['we did not find results', 'no results found']):
        return None
        
    links = driver.find_elements(By.TAG_NAME, 'a')
    bad_patterns = ['/sharer', '/login', '/recover', '/signup', 'pages/category', '/search', '/groups/', '/posts/', '/people/', '/events/', 'profile.php', '/reel/', '/watch/', '/marketplace/', '/help/', '/policies/', '/settings/']
    
    for link in links:
        try:
            href = link.get_attribute('href')
            if href:
                href = clean_google_url(href)
                if 'facebook.com/' in href and not any(k in href for k in bad_patterns):
                    clean_href = href.split('?')[0].split('&')[0].rstrip('/')
                    parts = clean_href.replace('https://', '').replace('http://', '').replace('www.', '').split('/')
                    if len(parts) >= 2 and parts[0] == 'facebook.com' and len(parts[1]) > 1:
                        return clean_href
        except:
            continue
    return None

def scrape_facebook_page(driver, fb_url):
    print(f"   └── Visiting Facebook page: {fb_url}... ", end='', flush=True)
    try:
        driver.get(fb_url)
        time.sleep(4.5 + random.uniform(0.5, 1.5))
        
        body_text = driver.find_element(By.TAG_NAME, 'body').text
        lines = [l.strip() for l in body_text.split('\n') if l.strip()]
        
        info = {}
        
        # 1. Email matching
        emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', body_text)
        if emails:
            info['email'] = emails[0].lower().strip()
            
        # 2. Phone numbers matching
        phone_pattern = r'(?:\+?20[\s\-.]?)?(?:0?2[\s\-.]?\d{3,4}[\s\-.]?\d{4}|0?1[0125][\s\-.]?\d{3,4}[\s\-.]?\d{4}|19\d{3}|16\d{3})'
        phones = re.findall(phone_pattern, body_text)
        if phones:
            clean_phones = []
            for p in phones:
                cp = re.sub(r'[\s\-.]', '', p)
                if cp not in clean_phones:
                    clean_phones.append(cp)
            info['phones'] = clean_phones
            
        # 3. Website matching
        for line in lines:
            if re.search(r'\.[a-z]{2,6}$', line, re.IGNORECASE) and not any(k in line.lower() for k in ['facebook', 'twitter', 'instagram', 'youtube', 'linkedin', 'email', 'terms', 'privacy', 'cookies', 'see more']):
                if re.match(r'^(?:https?://)?(?:www\.)?[\w\.-]+\.[a-z]{2,6}', line, re.IGNORECASE):
                    info['website'] = line.strip()
                    break
                    
        # 4. Address matching
        cairo_keywords = ['القاهرة', 'الجيزة', 'Sheraton', 'Cairo', 'Giza', 'Egypt', 'مصر', 'الشارع', 'المنطقة', 'التجمع', 'أكتوبر', 'المعادي']
        for line in lines:
            if any(kw in line for kw in cairo_keywords) and len(line) > 10 and len(line) < 150:
                if not any(k in line for k in ['Log in', 'Sign Up', 'Create Page', 'Posts', 'Followers', 'following', 'Privacy', 'Terms', 'recommend']):
                    info['address'] = line.strip()
                    break
                    
        # 5. Check if page contains foreign phone numbers (non-Egyptian)
        foreign_phones = re.findall(r'(?:\+|00)\d{9,15}', body_text)
        for p in foreign_phones:
            digits = re.sub(r'\D', '', p)
            if digits.startswith('00'):
                digits = digits[2:]
            if digits.startswith('+'):
                digits = digits[1:]
            if digits and not digits.startswith('20'):
                info['is_foreign'] = True
                break
                
        print(f"Scraped: {list(info.keys())}")
        return info
    except Exception as e:
        print(f"Error visiting: {e}")
        return {}

def load_companies():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Input file not found: {INPUT_FILE}")
        return []
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def safe_save_companies(file_path, memory_companies):
    current_companies = []
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as fh:
                current_companies = json.load(fh)
        except Exception as e:
            print(f"⚠️ Error reading current file during safe save: {e}")
            
    merged_map = {}
    
    def get_key(c):
        if c.get('id'):
            return c['id']
        name_key = f"{c.get('nameAr','')}{c.get('nameEn','')}{c.get('phone1','')}".lower().strip()
        return hashlib.md5(name_key.encode()).hexdigest()

    for c in current_companies:
        key = get_key(c)
        merged_map[key] = c

    for c in memory_companies:
        key = get_key(c)
        if key in merged_map:
            existing = merged_map[key]
            for k, v in c.items():
                if v is not None and v != '':
                    existing[k] = v
        else:
            merged_map[key] = c

    merged_list = list(merged_map.values())
    try:
        merged_list.sort(key=lambda x: x.get('id', ''))
    except:
        pass

    with open(file_path, 'w', encoding='utf-8') as fh:
        json.dump(merged_list, fh, ensure_ascii=False, indent=2)
        
    return merged_list

def save_companies(companies):
    merged = safe_save_companies(INPUT_FILE, companies)
    cache_file = os.path.join(OUTPUT_DIR, '_ultra_cache.json')
    safe_save_companies(cache_file, companies)
    update_progress_file(merged)

def update_progress_file(companies):
    if not os.path.exists(PROGRESS_FILE):
        return
    try:
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            progress = json.load(f)
        total_enriched = sum(1 for c in companies if c.get('linkedin') or c.get('linkedinContactUrl'))
        progress['linkedin_enriched_count'] = total_enriched
        progress['linkedin_enriched_pct'] = round((total_enriched / len(companies)) * 100, 1) if companies else 0
        with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
            json.dump(progress, f, ensure_ascii=False)
    except Exception as e:
        print(f"⚠️ Error updating progress file: {e}")

def clean_company_name_for_search(name):
    name = re.sub(r'\(.*?\)', '', name)
    name = re.sub(r'[^\w\s\u0600-\u06FF\-]', ' ', name)
    name = re.sub(r'\s+', ' ', name).strip()
    
    words = name.split()
    noise = ['للشحن', 'الدولي', 'ونقل', 'البضائع', 'شحن', 'نقل', 'شركة', 'مجموعة', 'مؤسسة', 'دراي', 'كلين']
    cleaned_words = [w for w in words if w not in noise]
    if len(cleaned_words) >= 2:
        return " ".join(cleaned_words[:3])
    return " ".join(words[:3])

def build_global_dedup_index(companies):
    used_contact_urls = {}
    used_company_urls = {}
    used_fb_urls = {}
    
    for c in companies:
        cid = c.get('id', '')
        lc = c.get('linkedinContactUrl', '')
        if lc:
            norm = lc.split('?')[0].rstrip('/')
            used_contact_urls[norm] = cid
        li = c.get('linkedin') or c.get('linkedinUrl', '')
        if li:
            norm = li.split('?')[0].rstrip('/')
            used_company_urls[norm] = cid
        fb = c.get('facebook', '')
        if fb:
            norm = fb.split('?')[0].rstrip('/')
            used_fb_urls[norm] = cid
            
    return {
        'contacts': used_contact_urls,
        'companies': used_company_urls,
        'facebook': used_fb_urls,
    }

dedup_lock = threading.Lock()
thread_local = threading.local()

def get_thread_driver():
    if not hasattr(thread_local, "driver"):
        thread_local.driver = create_driver()
    return thread_local.driver

def close_thread_driver():
    if hasattr(thread_local, "driver") and thread_local.driver:
        try:
            thread_local.driver.quit()
        except:
            pass
        thread_local.driver = None

def is_url_already_used(url, dedup_index, index_type, current_company_id):
    if not url:
        return False
    norm = url.split('?')[0].rstrip('/')
    with dedup_lock:
        index = dedup_index.get(index_type, {})
        if norm in index:
            return index[norm] != current_company_id
    return False

def register_url(url, dedup_index, index_type, company_id):
    if not url:
        return
    norm = url.split('?')[0].rstrip('/')
    with dedup_lock:
        dedup_index.setdefault(index_type, {})[norm] = company_id

def ddg_search(query, result_type='in', company_name=''):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    time.sleep(random.uniform(0.6, 1.2))
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
        soup = BeautifulSoup(html, 'lxml')
        results = []
        seen_urls = set()
        pattern = 'linkedin.com/in/' if result_type == 'in' else 'linkedin.com/company/'
        
        for r in soup.select('.result'):
            title_el = r.select_one('.result__title')
            url_el = r.select_one('.result__url')
            if not title_el or not url_el:
                continue
            title_text = title_el.get_text(strip=True).replace('\n', ' ')
            href = url_el.get('href', '')
            real_url = href
            if "uddg=" in href:
                match = re.search(r'uddg=([^&]+)', href)
                if match:
                    real_url = urllib.parse.unquote(match.group(1))
            if pattern in real_url and not any(k in real_url for k in ['duckduckgo.com', 'yahoo.com', 'google.com']):
                norm_url = real_url.split('?')[0].rstrip('/')
                if norm_url in seen_urls:
                    continue
                seen_urls.add(norm_url)
                if company_name and not is_result_relevant(title_text, real_url, company_name, result_type):
                    continue
                results.append({'url': real_url, 'title': title_text})
        return results
    except Exception:
        return []

def ddg_search_facebook(query):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    time.sleep(random.uniform(0.6, 1.2))
    
    results = []
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
        soup = BeautifulSoup(html, 'lxml')
        bad_patterns = ['/sharer', '/login', '/recover', '/signup', 'pages/category', '/search', '/groups/', '/posts/', '/people/', '/events/', 'profile.php', '/reel/', '/watch/', '/marketplace/', '/help/', '/policies/', '/settings/']
        
        for r in soup.select('.result'):
            title_el = r.select_one('.result__title')
            url_el = r.select_one('.result__url')
            if not title_el or not url_el:
                continue
            title_text = title_el.get_text(strip=True).replace('\n', ' ')
            href = url_el.get('href', '')
            real_url = href
            if "uddg=" in href:
                match = re.search(r'uddg=([^&]+)', href)
                if match:
                    real_url = urllib.parse.unquote(match.group(1))
            if 'facebook.com/' in real_url and not any(k in real_url for k in bad_patterns):
                clean_href = real_url.split('?')[0].split('&')[0].rstrip('/')
                parts = clean_href.replace('https://', '').replace('http://', '').replace('www.', '').split('/')
                if len(parts) >= 2 and parts[0] == 'facebook.com' and len(parts[1]) > 1:
                    results.append({'url': clean_href, 'title': title_text})
        return results
    except:
        return []

def yahoo_search_lite(query, result_type='in', company_name=''):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
    url = f"https://search.yahoo.com/search?p={urllib.parse.quote(query)}"
    time.sleep(random.uniform(0.6, 1.2))
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
        soup = BeautifulSoup(html, 'lxml')
        results = []
        seen_urls = set()
        pattern = 'linkedin.com/in/' if result_type == 'in' else 'linkedin.com/company/'
        
        for link in soup.find_all('a'):
            href = link.get('href', '')
            if not href:
                continue
            href = clean_google_url(href)
            if pattern in href and not any(k in href for k in ['duckduckgo.com', 'yahoo.com', 'google.com']):
                norm_url = href.split('?')[0].rstrip('/')
                if norm_url in seen_urls:
                    continue
                seen_urls.add(norm_url)
                title_text = link.get_text(strip=True).replace('\n', ' ')
                if company_name and not is_result_relevant(title_text, href, company_name, result_type):
                    continue
                results.append({'url': href, 'title': title_text})
        return results
    except Exception:
        return []

def yahoo_search_facebook_lite(query):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
    url = f"https://search.yahoo.com/search?p={urllib.parse.quote(query)}"
    time.sleep(random.uniform(0.6, 1.2))
    
    results = []
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
        soup = BeautifulSoup(html, 'lxml')
        bad_patterns = ['/sharer', '/login', '/recover', '/signup', 'pages/category', '/search', '/groups/', '/posts/', '/people/', '/events/', 'profile.php', '/reel/', '/watch/', '/marketplace/', '/help/', '/policies/', '/settings/']
        
        for link in soup.find_all('a'):
            href = link.get('href', '')
            if not href:
                continue
            href = clean_google_url(href)
            if 'facebook.com/' in href and not any(k in href for k in bad_patterns):
                clean_href = href.split('?')[0].split('&')[0].rstrip('/')
                parts = clean_href.replace('https://', '').replace('http://', '').replace('www.', '').split('/')
                if len(parts) >= 2 and parts[0] == 'facebook.com' and len(parts[1]) > 1:
                    title_text = link.get_text(strip=True).replace('\n', ' ')
                    results.append({'url': clean_href, 'title': title_text})
        return results
    except:
        return []

def enrich_single_company(company, args, dedup_index, stats):
    """Enrich a single company with LinkedIn and Facebook data."""
    orig_name = company.get('nameAr') or company.get('nameEn') or ""
    if not orig_name:
        return company, False

    company_id = company.get('id', '')
    comp_name = clean_company_name_for_search(orig_name)
    modified = False
    
    is_arabic = any('\u0600' <= c <= '\u06FF' for c in comp_name)
    country_suffix = "مصر" if is_arabic else "Egypt"
    # ===== 1. LINKEDIN COMPANY PAGE =====
    if not (company.get('linkedin') or company.get('linkedinUrl')):
        co_query = f'"{comp_name}" {country_suffix} site:linkedin.com/company'
        co_results = ddg_search(co_query, 'company', company_name=company)
        if not co_results:
            co_results = yahoo_search_lite(co_query, 'company', company_name=company)
                
        best_result = None
        best_score = 0
        for res in (co_results or []):
            if is_url_already_used(res['url'], dedup_index, 'companies', company_id):
                with dedup_lock:
                    stats['rejected_dedup'] += 1
                continue
            score, reasons = calculate_relevance_score(res['title'], res['url'], company, 'company')
            if score > best_score:
                best_score = score
                best_result = res
                
        req_thresh = 0.65 if len(get_company_core_words(company)) <= 1 else 0.50
        if best_result and best_score >= req_thresh:
            company['linkedin'] = best_result['url']
            company['linkedinUrl'] = best_result['url']
            register_url(best_result['url'], dedup_index, 'companies', company_id)
            with dedup_lock:
                stats['found_li'] += 1
            modified = True
        else:
            if best_result:
                with dedup_lock:
                    stats['rejected_score'] += 1
                    
    # ===== 2. LINKEDIN CONTACT PERSON =====
    if not company.get('linkedinContactUrl'):
        contact_query = f'site:linkedin.com/in/ "{comp_name}" {country_suffix} (fleet OR logistics OR operations OR procurement OR purchasing OR maintenance OR transport OR "مدير أسطول" OR "مدير تشغيل" OR "مدير مشتريات" OR "صيانة" OR "لوجستيات")'
        contact_results = ddg_search(contact_query, 'in', company_name=company)
        if not contact_results:
            contact_results = yahoo_search_lite(contact_query, 'in', company_name=company)
                
        best_contact = None
        best_contact_score = 0
        for res in (contact_results or []):
            if is_url_already_used(res['url'], dedup_index, 'contacts', company_id):
                with dedup_lock:
                    stats['rejected_dedup'] += 1
                continue
                
            score, reasons = calculate_relevance_score(res['title'], res['url'], company, 'in')
            if score > best_contact_score:
                best_contact_score = score
                best_contact = res
                
        req_thresh = 0.70 if len(get_company_core_words(company)) <= 1 else 0.55
        if best_contact and best_contact_score >= req_thresh:
            name, job_title = parse_linkedin_title(best_contact['title'], comp_name)
            if name:
                company['contactPerson'] = name
                company['contactTitle'] = job_title
                company['linkedinContactUrl'] = best_contact['url']
                register_url(best_contact['url'], dedup_index, 'contacts', company_id)
                with dedup_lock:
                    stats['found_contact'] += 1
                modified = True
        else:
            if best_contact:
                with dedup_lock:
                    stats['rejected_score'] += 1
                    
    # ===== 3. FACEBOOK PAGE =====
    has_phone = bool(company.get('phone1'))
    fb_url = company.get('facebook')
    
    if not fb_url:
        fb_query = f'"{comp_name}" {country_suffix} site:facebook.com'
        fb_results = ddg_search_facebook(fb_query)
        if not fb_results:
            fb_results = yahoo_search_facebook_lite(fb_query)
                 
        best_fb = None
        best_fb_score = 0
        for res in (fb_results or []):
            if is_url_already_used(res['url'], dedup_index, 'facebook', company_id):
                with dedup_lock:
                    stats['rejected_dedup'] += 1
                continue
            
            score, reasons = calculate_relevance_score(res['title'], res['url'], company, 'facebook')
            if score > best_fb_score:
                best_fb_score = score
                best_fb = res
                
        req_thresh = 0.50 if len(get_company_core_words(company)) <= 1 else 0.40
        if best_fb and best_fb_score >= req_thresh:
            cand_url = best_fb['url']
            fb_lower = cand_url.lower()
            foreign_fb_indicators = ['.sa', '.ae', '.qa', '.bh', '.kw', '.om', '.jo', 'ksa', 'uae', 'saudi', 'kuwait', 'qatar', 'dubai', 'riyadh']
            if any(ind in fb_lower for ind in foreign_fb_indicators) and 'egypt' not in fb_lower and 'eg' not in fb_lower:
                cand_url = None
                
            if cand_url:
                company['facebook'] = cand_url
                fb_url = cand_url
                register_url(cand_url, dedup_index, 'facebook', company_id)
                with dedup_lock:
                    stats['found_fb'] += 1
                modified = True
        else:
            if best_fb:
                with dedup_lock:
                    stats['rejected_score'] += 1

    if fb_url:
        try:
            driver = get_thread_driver()
            fb_info = scrape_facebook_page(driver, fb_url)
            
            if fb_info.get('is_foreign'):
                print(f"   [REJECT-FB] {orig_name}: Facebook page has foreign phone prefix.")
                company.pop('facebook', None)
                modified = True
            else:
                if 'email' in fb_info and not company.get('email'):
                    company['email'] = fb_info['email']
                    modified = True
                if 'website' in fb_info and not company.get('website'):
                    company['website'] = fb_info['website']
                    modified = True
                if 'address' in fb_info and not company.get('address'):
                    company['address'] = fb_info['address']
                    modified = True
                
                if 'phones' in fb_info and not has_phone:
                    existing_phones = [company.get('phone1'), company.get('phone2'), company.get('mobile')]
                    existing_phones = [p for p in existing_phones if p]
                    new_phones = []
                    for p in fb_info['phones']:
                        if p not in existing_phones and p not in new_phones:
                            new_phones.append(p)
                    for np in new_phones:
                        if not company.get('phone1'):
                            company['phone1'] = np
                            modified = True
                        elif not company.get('phone2'):
                            company['phone2'] = np
                            modified = True
                        elif not company.get('mobile'):
                            company['mobile'] = np
                            modified = True
        except Exception as e:
            print(f"   [FB-ERR] {comp_name}: {e}")

    return company, modified

def main():
    parser = argparse.ArgumentParser(description='LinkedIn Free Data Enricher via Yahoo/DDG X-Ray')
    parser.add_argument('--limit', type=int, default=50, help='Max companies to enrich in this run (default: 50)')
    parser.add_argument('--force', action='store_true', help='Force re-enriching even if already done')
    args = parser.parse_args()

    companies = load_companies()
    if not companies:
        return

    dedup_index = build_global_dedup_index(companies)
    
    print("=" * 60)
    print("LINKEDIN FREE ENRICHER v3 - Threaded Accuracy Mode")
    print(f"   Loaded: {len(companies):,} companies")
    print(f"   Dedup index: {len(dedup_index['contacts'])} contacts, "
          f"{len(dedup_index['companies'])} companies, "
          f"{len(dedup_index['facebook'])} facebook")
    print("=" * 60)

    to_enrich = []
    for idx, c in enumerate(companies):
        has_linkedin = bool(c.get('linkedin') or c.get('linkedinUrl'))
        has_contact_li = bool(c.get('linkedinContactUrl'))
        has_facebook = bool(c.get('facebook'))
        
        if args.force or (not has_linkedin and not has_contact_li) or not has_facebook:
            to_enrich.append((idx, c))

    limit = min(len(to_enrich), args.limit)
    print(f"   Target to enrich: {limit:,} companies")
    if not to_enrich:
        print("   All companies already enriched. Nothing to do!")
        return

    stats = {
        'found_li': 0, 'found_contact': 0, 'found_fb': 0,
        'rejected_score': 0, 'rejected_dedup': 0, 'rejected_foreign': 0
    }
    
    save_lock = threading.Lock()
    processed_count = 0
    
    def process_item(item):
        nonlocal processed_count
        idx, company = item
        comp_name = company.get('nameAr') or company.get('nameEn') or ""
        
        try:
            print(f"   [Thread-{threading.get_ident()}] Processing: {comp_name}")
            updated_company, modified = enrich_single_company(company, args, dedup_index, stats)
            
            with save_lock:
                companies[idx] = updated_company
                processed_count += 1
                if processed_count % 3 == 0:
                    save_companies(companies)
                    print(f"   [Autosaved progress - {processed_count}/{limit}]")
                    
            if modified:
                print(f"   [MODIFIED] {comp_name}")
        except Exception as e:
            print(f"   [FAIL-THREAD] {comp_name}: {e}")
        finally:
            time.sleep(random.uniform(1.0, 2.0))

    try:
        with ThreadPoolExecutor(max_workers=5) as executor:
            executor.map(process_item, to_enrich[:limit])
    except KeyboardInterrupt:
        print("\nEnrichment paused by user.")
    finally:
        try:
            cmd = ['powershell', '-Command', 'Get-CimInstance Win32_Process | Where-Object { $_.Name -match "chromedriver" } | Remove-CimInstance']
            subprocess.run(cmd, creationflags=0x08000000)
        except:
            pass
            
        save_companies(companies)
        print(f"\n{'=' * 60}")
        print("SESSION COMPLETE")
        print(f"  Companies processed: {processed_count}")
        print(f"  LinkedIn Company found: {stats['found_li']}")
        print(f"  LinkedIn Contact found: {stats['found_contact']}")
        print(f"  Facebook found: {stats['found_fb']}")
        print(f"  Rejected (low score): {stats['rejected_score']}")
        print(f"  Rejected (dedup): {stats['rejected_dedup']}")
        print(f"  Rejected (foreign): {stats['rejected_foreign']}")
        print(f"{'=' * 60}")

if __name__ == '__main__':
    main()
