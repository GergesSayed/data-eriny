# -*- coding: utf-8 -*-
"""
sync_to_supabase.py — Push scraper output to Supabase cloud v3
Single-request upload with smart diff (only upload new/changed companies)
"""

import json
import os
import sys
import time
import glob
import urllib.request
import urllib.error

SUPABASE_URL = "https://vefitfgvdgjqipkkttry.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZml0Zmd2ZGdqcWlwa2t0dHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNjQ0MzMsImV4cCI6MjEwMDY0MDQzM30.G4PnsfUnAI9gdNPFoSJuWKlE9VCmUXAkHOxzJb51Rrk"

SCRAPER_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRAPER_DIR, 'output')
CRM_IMPORT_FILE = os.path.join(OUTPUT_DIR, 'crm_import_ready.json')


def get_headers():
    return {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer {}'.format(SUPABASE_ANON_KEY),
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }


def fetch_master_data():
    url = "{}/rest/v1/master_data?id=eq.1&select=*".format(SUPABASE_URL)
    req = urllib.request.Request(url, headers=get_headers())
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            return data[0] if data else None
    except Exception as e:
        print("  Could not fetch cloud data: {}".format(e))
        return None


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


def merge_and_diff(existing, new_companies):
    """Merge new companies into existing. Returns the full merged list."""
    by_id = {}
    by_name = {}

    for c in existing:
        cid = c.get('id', '')
        name = (c.get('nameAr', '') or c.get('nameEn', '')).strip().lower()
        if cid:
            by_id[cid] = c
        if name:
            by_name[name] = c

    added = 0
    updated = 0

    for nc in new_companies:
        nc_id = nc.get('id', '')
        nc_name = (nc.get('nameAr', '') or nc.get('nameEn', '')).strip().lower()
        existing_company = by_id.get(nc_id) or by_name.get(nc_name)

        if existing_company:
            changed = False
            for key, value in nc.items():
                if value and value != existing_company.get(key):
                    existing_company[key] = value
                    changed = True
            if changed:
                updated += 1
        else:
            if nc_id:
                by_id[nc_id] = nc
            if nc_name:
                by_name[nc_name] = nc
            existing.append(nc)
            added += 1

    return added, updated


def find_output_files():
    patterns = ['crm_import_ready.json', 'ALL_COMPANIES_*.json', 'fleet_companies_*.json', 'browser_scrape_*.json']
    files = []
    for pattern in patterns:
        for m in glob.glob(os.path.join(OUTPUT_DIR, pattern)):
            if m not in files and '_progress' not in m and '_cache' not in m and 'config' not in m:
                files.append(m)
    return sorted(files, key=os.path.getmtime, reverse=True)


def sync():
    print("=" * 60)
    print("  Fleet CRM - Supabase Cloud Sync v3")
    print("=" * 60)
    print()

    # 1. Find and load scraper output
    print("[1/4] Scanning scraper output...")
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

    # 2. Fetch cloud data
    print("[2/4] Fetching cloud data...")
    cloud_data = fetch_master_data()

    existing_companies = cloud_data.get('companies', []) if cloud_data else []
    existing_users = cloud_data.get('users', []) if cloud_data else []
    print("  Cloud: {} companies, {} users".format(len(existing_companies), len(existing_users)))

    # 3. Merge
    print("[3/4] Merging data...")
    added, updated = merge_and_diff(existing_companies, new_companies)
    total = len(existing_companies)
    print("  Added: {}, Updated: {}, Final: {}".format(added, updated, total))

    # 4. Push in ONE request
    print("[4/4] Pushing to Supabase (single upload)...")
    payload = {
        'id': 1,
        'companies': existing_companies,
        'users': existing_users,
        'calls': cloud_data.get('calls', []) if cloud_data else [],
        'deals': cloud_data.get('deals', []) if cloud_data else [],
        'activities': cloud_data.get('activities', []) if cloud_data else [],
        'updated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'updated_by': 'python-scraper'
    }

    body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
    size_kb = len(body) / 1024
    print("  Payload: {:.0f} KB for {} companies".format(size_kb, total))

    url = "{}/rest/v1/master_data?id=eq.1".format(SUPABASE_URL)
    req = urllib.request.Request(url, data=body, headers=get_headers(), method='PATCH')

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            print()
            print("  UPLOADED {} companies successfully!".format(total))
            print("  View: https://data-eriny.vercel.app")

            # Save merged result locally
            try:
                with open(CRM_IMPORT_FILE, 'w', encoding='utf-8') as f:
                    json.dump(existing_companies, f, ensure_ascii=False)
                print("  Saved merged data locally")
            except:
                pass
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ''
        print("  FAILED (HTTP {}): {}".format(e.code, body[:300]))
        print()
        print("  The payload might be too large (Supabase limit ~1 MB).")
        print("  Try uploading a smaller file, or use the web CRM to pull data.")
        return False
    except Exception as e:
        print("  FAILED: {}".format(e))
        return False


if __name__ == '__main__':
    try:
        sync()
        input("\nPress Enter to exit...")
    except (EOFError, KeyboardInterrupt):
        pass
