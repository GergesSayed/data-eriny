# -*- coding: utf-8 -*-
"""
Company Identity Normalization and Deduplication Engine — Fleet CRM
Uses built-in difflib SequenceMatcher fuzzy matching and normalized fingerprint keys.
"""

import os
import re
import json
import hashlib
from difflib import SequenceMatcher

SCRAPER_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRAPER_DIR, 'output')
DATA_FILE = os.path.join(OUTPUT_DIR, 'crm_import_ready.json')
CACHE_FILE = os.path.join(OUTPUT_DIR, '_ultra_cache.json')

def normalize_text(text):
    if not text:
        return ""
    # Convert to lowercase
    t = text.lower().strip()
    # Unify Arabic characters
    t = re.sub(r'[أإآ]', 'ا', t)
    t = re.sub(r'ة', 'ه', t)
    t = re.sub(r'ى', 'ي', t)
    # Remove common business suffixes and noise
    noise_patterns = [
        r'\bشركة\b', r'\bجروب\b', r'\bمجموعة\b', r'\bمؤسسة\b', r'\bش\.م\.م\b', 
        r'\bذ\.م\.م\b', r'\bltd\b', r'\bllc\b', r'\binc\b', r'\bco\b', r'\bgroup\b',
        r'\bfor transport\b', r'\btransport\b', r'\blogistics\b', r'\bshipping\b',
        r'\bللنقل\b', r'\bللشحن\b', r'\bاللوجستية\b', r'\bالتجارة\b', r'\bوالتوزيع\b'
    ]
    for p in noise_patterns:
        t = re.sub(p, ' ', t)
    # Remove non-word characters and collapse spaces
    t = re.sub(r'[^\w\s]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def get_similarity(s1, s2):
    return SequenceMatcher(None, s1, s2).ratio()

def clean_phone(phone):
    if not phone:
        return ""
    # Extract only digits
    return re.sub(r'\D', '', phone)

def merge_companies(c1, c2):
    """Merges c2 into c1, keeping the best of both."""
    merged = {**c1}
    
    # Text fields: take the longer/more descriptive one
    for field in ['nameAr', 'nameEn', 'address', 'sector_details', 'notes', 'working_hours', 'contactPerson', 'contactTitle']:
        v1 = c1.get(field) or ""
        v2 = c2.get(field) or ""
        if len(v2) > len(v1):
            merged[field] = v2
            
    # Single value fields: take the first non-empty
    for field in ['sector', 'city', 'governorate', 'email', 'website', 'google_maps_url', 'rating', 'reviews_count', 'operating_status', 'fleetSize', 'fleetType', 'companySize', 'branchesCount', 'linkedin', 'linkedinUrl', 'linkedinContactUrl', 'facebook']:
        if not merged.get(field) and c2.get(field):
            merged[field] = c2[field]
            
    # Handle phones list merging
    phones = []
    for phone_field in ['phone1', 'phone2', 'mobile', 'contactPhone']:
        for comp in [c1, c2]:
            p = clean_phone(comp.get(phone_field))
            if p and p not in phones:
                phones.append(p)
                
    # Assign back to clean slots
    if len(phones) >= 1: merged['phone1'] = phones[0]
    if len(phones) >= 2: merged['phone2'] = phones[1]
    if len(phones) >= 3: merged['mobile'] = phones[2]
    if len(phones) >= 4: merged['contactPhone'] = phones[3]
    
    # Preserve timelines
    t1 = c1.get('timeline') or []
    t2 = c2.get('timeline') or []
    seen_events = set(e.get('event') for e in t1)
    for event in t2:
        if event.get('event') not in seen_events:
            t1.append(event)
    merged['timeline'] = t1
    
    # Priority: take the higher one (A > B > C)
    p1 = c1.get('priority', 'C')
    p2 = c2.get('priority', 'C')
    if p2 < p1: # A is lexicographically smaller than B and C
        merged['priority'] = p2
        
    # Last updated
    merged['lastUpdated'] = max(c1.get('lastUpdated') or "", c2.get('lastUpdated') or "")
    
    return merged

def run_deduplication():
    if not os.path.exists(DATA_FILE):
        print("❌ No unified dataset found to deduplicate.")
        return
        
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        companies = json.load(f)
        
    print(f"📊 Loading {len(companies)} companies for duplicate analysis...")
    
    unique_companies = []
    merged_count = 0
    
    for c in companies:
        name1 = c.get('nameAr') or c.get('nameEn') or ""
        norm1 = normalize_text(name1)
        phone1 = clean_phone(c.get('phone1'))
        maps_url1 = c.get('google_maps_url') or ""
        
        is_duplicate = False
        for idx, uc in enumerate(unique_companies):
            name2 = uc.get('nameAr') or uc.get('nameEn') or ""
            norm2 = normalize_text(name2)
            phone2 = clean_phone(uc.get('phone1'))
            maps_url2 = uc.get('google_maps_url') or ""
            
            # Match condition 1: Exact Maps URL match
            if maps_url1 and maps_url2 and maps_url1 == maps_url2:
                is_duplicate = True
            # Match condition 2: Exact phone match (if present)
            elif phone1 and phone2 and phone1 == phone2:
                is_duplicate = True
            # Match condition 3: High fuzzy similarity on name (>85%) AND same city
            elif norm1 and norm2 and c.get('city') == uc.get('city'):
                sim = get_similarity(norm1, norm2)
                if sim > 0.85:
                    is_duplicate = True
                    
            if is_duplicate:
                unique_companies[idx] = merge_companies(uc, c)
                merged_count += 1
                break
                
        if not is_duplicate:
            unique_companies.append(c)
            
    print(f"✅ Deduplication complete: {len(companies)} -> {len(unique_companies)} (Merged {merged_count} duplicates)")
    
    # Save back to master JSON and cache
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(unique_companies, f, ensure_ascii=False, indent=2)
    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(unique_companies, f, ensure_ascii=False, indent=2)
        
    print("💾 Files saved successfully.")

if __name__ == '__main__':
    run_deduplication()
