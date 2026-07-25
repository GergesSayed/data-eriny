#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fleet CRM — Master Data Audit & Deduplication Engine (Fast O(N) Hash Map)
تنظيف وتدقيق داتا الشركات بالكامل: مراجعة الدقة، حذف التكرار، وتنسيق أرقام الهواتف
"""

import os
import json
import re

def normalize_str(s):
    if not s:
        return ""
    s = str(s).lower().strip()
    s = re.sub(r'[أإآ]', 'ا', s)
    s = re.sub(r'ة', 'ه', s)
    s = re.sub(r'ى', 'ي', s)
    s = re.sub(r'[^a-z0-9\u0600-\u06FF]', '', s)
    return s

def format_egypt_phone(phone_raw):
    if not phone_raw:
        return ""
    digits = re.sub(r'[^0-9]', '', str(phone_raw))
    
    if digits.startswith('20') and len(digits) > 10:
        digits = digits[2:]
        
    if not digits:
        return ""

    if len(digits) == 11 and digits.startswith('01'):
        return f"{digits[:4]}-{digits[4:7]}-{digits[7:]}"
    if len(digits) == 10 and digits.startswith('1'):
        digits = '0' + digits
        return f"{digits[:4]}-{digits[4:7]}-{digits[7:]}"

    if len(digits) == 10 and digits.startswith('02'):
        return f"02-{digits[2:]}"
    if len(digits) == 8 and (digits.startswith('2') or digits.startswith('3')):
        return f"02-{digits}"

    if len(digits) >= 8:
        return digits
    return ""

def calculate_lead_score(company):
    score = 50
    fleet_size = int(company.get('fleetSize') or 0)
    if fleet_size >= 50:
        score += 30
    elif fleet_size >= 15:
        score += 20
    elif fleet_size > 0:
        score += 10

    if company.get('phone1') or company.get('mobile'):
        score += 10
    if company.get('email'):
        score += 5
    if company.get('website'):
        score += 5
    return min(100, score)

def clean_and_deduplicate_dataset():
    crm_data_path = 'e:/Company Sales SAAS/data-eriny/crm/data/companies.json'
    scraper_data_path = 'e:/Company Sales SAAS/data-eriny/scraper/output/crm_import_ready.json'

    if not os.path.exists(crm_data_path):
        print(f"File not found: {crm_data_path}")
        return

    data = json.load(open(crm_data_path, encoding='utf-8'))
    print(f"Total records before clean & merge: {len(data)}")

    # 1. Clean numbers and names
    valid_records = []
    invalid_count = 0

    for c in data:
        name_ar = (c.get('nameAr') or '').strip()
        name_en = (c.get('nameEn') or '').strip()
        phone_raw = (c.get('phone1') or c.get('mobile') or c.get('phone2') or '').strip()

        if not name_ar and not name_en:
            invalid_count += 1
            continue

        formatted_phone = format_egypt_phone(phone_raw)
        if phone_raw and not formatted_phone:
            c['phone1'] = ''
            c['mobile'] = ''
        elif formatted_phone:
            c['phone1'] = formatted_phone

        valid_records.append(c)

    print(f"Cleaned {invalid_count} invalid records.")

    # 2. Fast O(N) Hash Map Deduplication
    master_map = {} # key -> company object

    for idx, c in enumerate(valid_records):
        cid = c.get('id') or f"comp_{idx}"
        c['id'] = cid

        name_norm = normalize_str(c.get('nameAr') or c.get('nameEn'))
        phone_digits = re.sub(r'[^0-9]', '', str(c.get('phone1') or c.get('mobile') or ''))
        phone_norm = phone_digits[-8:] if len(phone_digits) >= 8 else ""

        key = name_norm if name_norm else (f"phone_{phone_norm}" if phone_norm else cid)

        if key not in master_map:
            master_map[key] = c
        else:
            # Merge fields into existing master object
            master = master_map[key]
            for field in ['nameEn', 'phone1', 'phone2', 'mobile', 'email', 'website', 'address', 'contactPerson', 'contactTitle', 'fleetSize', 'linkedin', 'facebook', 'google_maps_url', 'assignedTo']:
                if not master.get(field) and c.get(field):
                    master[field] = c.get(field)

    merged_companies = list(master_map.values())
    for c in merged_companies:
        c['leadScore'] = calculate_lead_score(c)

    duplicates_removed = len(valid_records) - len(merged_companies)
    print(f"Merged {duplicates_removed} duplicate records.")
    print(f"Total clean master companies: {len(merged_companies)}")

    json.dump(merged_companies, open(crm_data_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    json.dump(merged_companies, open(scraper_data_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print("Dataset cleaned and saved successfully!")

if __name__ == "__main__":
    clean_and_deduplicate_dataset()
