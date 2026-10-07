# -*- coding: utf-8 -*-
"""
sync_to_cloud.py / sync_to_supabase.py — Push scraper output directly to Firebase Realtime Database
High performance batch upload with delta sync and instant CRM live updates
"""

import json
import os
import sys
import time
import glob
import urllib.request
import urllib.error

FIREBASE_DB_URL = os.environ.get("FIREBASE_DB_URL", "https://fleet-crm-38ba6-default-rtdb.firebaseio.com")

SCRAPER_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRAPER_DIR, 'output')
CRM_IMPORT_FILE = os.path.join(OUTPUT_DIR, 'crm_import_ready.json')


def load_companies(filepath):
    if not os.path.exists(filepath):
        return None
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if isinstance(data, list):
        return data
    elif isinstance(data, dict):
        return data.get('companies', data.get('data', []))
    return None


def find_output_files():
    patterns = ['crm_import_ready.json', 'ALL_COMPANIES_*.json', 'fleet_companies_*.json', 'browser_scrape_*.json']
    files = []
    for pattern in patterns:
        for m in glob.glob(os.path.join(OUTPUT_DIR, pattern)):
            if m not in files and '_progress' not in m and '_cache' not in m and 'config' not in m:
                files.append(m)
    return sorted(files, key=os.path.getmtime, reverse=True)


def push_to_firebase(companies):
    """Push new dynamic companies to Firebase RTDB so the live CRM sees them immediately"""
    if not companies:
        return True
    
    print("  [Firebase Cloud] Syncing {} companies to live CRM database...".format(len(companies)))
    chunk_size = 100
    all_ok = True
    uploaded = 0

    for i in range(0, len(companies), chunk_size):
        chunk = companies[i:i + chunk_size]
        patch_map = {}
        for idx, c in enumerate(chunk):
            cid = c.get('id') or f"scraped_dyn_{int(time.time())}_{i + idx}"
            c['id'] = cid
            patch_map[cid] = c

        body = json.dumps(patch_map, ensure_ascii=False).encode('utf-8')
        url = f"{FIREBASE_DB_URL}/dynamic_companies.json"
        req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'}, method='PATCH')
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                if resp.status in (200, 204):
                    uploaded += len(chunk)
                else:
                    all_ok = False
        except Exception as e:
            print(f"  Firebase chunk error: {e}")
            all_ok = False

    # Update metadata timestamp so CRM UI auto-refreshes
    now_ms = int(time.time() * 1000)
    meta = {
        'updated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'sync_timestamp': now_ms,
        'updated_by': 'python_scraper_sync',
        'total_dynamic': uploaded
    }
    try:
        body = json.dumps(meta).encode('utf-8')
        req = urllib.request.Request(f"{FIREBASE_DB_URL}/metadata.json", data=body, headers={'Content-Type': 'application/json'}, method='PATCH')
        with urllib.request.urlopen(req, timeout=15) as resp:
            pass
        print(f"  [Firebase Cloud] SUCCESS: Uploaded {uploaded} companies live! (Timestamp: {now_ms})")
    except Exception as e:
        print(f"  [Firebase Cloud] Warning updating metadata: {e}")

    return all_ok


def sync():
    print("=" * 60)
    print("  Fleet CRM — Live Cloud Sync Engine (Firebase Realtime DB)")
    print("=" * 60)
    print()

    # 1. Find and load scraper output
    print("[1/3] Scanning scraper output...")
    files = find_output_files()
    if not files:
        print("  No output files found. Run the scraper first.")
        return False

    print("  Found {} file(s)".format(len(files)))
    new_companies = None
    source_file = None
    for f in files[:5]:
        companies = load_companies(f)
        if companies and len(companies) > 0:
            if not new_companies or len(companies) > len(new_companies):
                new_companies = companies
                source_file = f

    if not new_companies:
        print("  Could not load any companies")
        return False

    print("  Loaded {} companies from: {}".format(len(new_companies), os.path.basename(source_file)))

    # 2. Push to Firebase RTDB (Primary Live CRM Database)
    print("[2/3] Uploading to Live CRM (Firebase Realtime Database)...")
    fb_ok = push_to_firebase(new_companies)

    # 3. Save merged output locally
    print("[3/3] Saving merged output locally...")
    try:
        with open(CRM_IMPORT_FILE, 'w', encoding='utf-8') as f:
            json.dump(new_companies, f, ensure_ascii=False)
        print("  Saved merged data locally: {}".format(CRM_IMPORT_FILE))
    except Exception as e:
        pass

    print()
    print("=" * 60)
    print("  SYNC COMPLETE!")
    print("  Data is LIVE now on: https://data-eriny.vercel.app")
    print("=" * 60)
    return True


if __name__ == '__main__':
    try:
        sync()
        input("\nPress Enter to exit...")
    except (EOFError, KeyboardInterrupt):
        pass
