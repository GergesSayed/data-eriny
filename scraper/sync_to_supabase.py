# -*- coding: utf-8 -*-
"""
sync_to_supabase.py — Push scraper output to Supabase cloud
Reads scraper output JSON files and pushes to the master_data table.
Supports batched uploads to avoid payload size limits.

Usage:
    python sync_to_supabase.py                    # Sync crm_import_ready.json
    python sync_to_supabase.py --file output/xxx.json  # Sync specific file
    python sync_to_supabase.py --all              # Sync ALL output files
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
BATCH_SIZE = 500  # Companies per Supabase PATCH (to avoid payload limits)


def get_headers():
    return {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer {}'.format(SUPABASE_ANON_KEY),
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }


def fetch_master_data():
    """GET current master_data from Supabase"""
    url = "{}/rest/v1/master_data?id=eq.1&select=*".format(SUPABASE_URL)
    req = urllib.request.Request(url, headers=get_headers())
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            if data and len(data) > 0:
                return data[0]
    except Exception as e:
        print("  Could not fetch cloud data: {}".format(e))
    return None


def push_batch(companies_chunk, batch_num, total_batches):
    """Push a single batch of companies to Supabase"""
    payload = {
        'id': 1,
        'companies': companies_chunk,
        'updated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'updated_by': 'python-scraper'
    }
    url = "{}/rest/v1/master_data?id=eq.1".format(SUPABASE_URL)
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=get_headers(), method='PATCH')

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp.read()
            return True, None
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ''
        return False, "HTTP {}: {}".format(e.code, body[:200])
    except Exception as e:
        return False, str(e)


def push_companies_in_batches(companies):
    """Push companies in batches of BATCH_SIZE"""
    total = len(companies)
    total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE
    succeeded = 0

    for i in range(0, total, BATCH_SIZE):
        chunk = companies[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        print("  Batch {}/{} ({} companies)...".format(batch_num, total_batches, len(chunk)), end=' ')

        ok, err = push_batch(chunk, batch_num, total_batches)
        if ok:
            print("OK")
            succeeded += len(chunk)
        else:
            print("FAILED: {}".format(err))
            return succeeded

    return succeeded


def find_output_files():
    """Find all scraper output JSON files"""
    patterns = [
        'crm_import_ready.json',
        'ALL_COMPANIES_*.json',
        'fleet_companies_*.json',
        'ULTRA_*.json',
        '*.json'
    ]
    files = []
    for pattern in patterns:
        matches = glob.glob(os.path.join(OUTPUT_DIR, pattern))
        for m in matches:
            if m not in files and not m.endswith('_progress.json') and not m.endswith('_cache.json') and not m.endswith('config.json'):
                files.append(m)
    files = sorted(files, key=os.path.getmtime, reverse=True)
    return files


def load_companies(filepath):
    """Load companies from JSON file"""
    if not os.path.exists(filepath):
        return None

    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if isinstance(data, list):
        return data
    elif isinstance(data, dict):
        return data.get('companies', data.get('data', []))
    return None


def merge_companies(existing, new_companies):
    """Merge new companies, deduplicating by id/name"""
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


def sync():
    """Main sync function — intelligent file discovery + batched upload"""
    print("=" * 60)
    print("  Fleet CRM - Supabase Cloud Sync v2.0")
    print("=" * 60)
    print()

    # 1. Find all output files
    print("[1/4] Scanning scraper output...")
    all_files = find_output_files()

    if not all_files:
        print("  No output files found in scraper/output/")
        print("  Run the scraper first: START.bat option 1")
        return False

    print("  Found {} output file(s):".format(len(all_files)))
    for f in all_files[:5]:
        size_kb = os.path.getsize(f) / 1024
        print("    - {} ({:.0f} KB)".format(os.path.basename(f), size_kb))

    # Load the best file
    best_file = all_files[0]
    new_companies = load_companies(best_file)

    if not new_companies:
        print("  Could not load companies from any file")
        return False

    print("  Loaded {} companies from: {}".format(len(new_companies), os.path.basename(best_file)))

    # 2. Fetch current cloud data
    print("[2/4] Fetching cloud data...")
    cloud_data = fetch_master_data()

    existing_companies = cloud_data.get('companies', []) if cloud_data else []
    existing_users = cloud_data.get('users', []) if cloud_data else []
    existing_calls = cloud_data.get('calls', []) if cloud_data else []
    existing_deals = cloud_data.get('deals', []) if cloud_data else []
    existing_activities = cloud_data.get('activities', []) if cloud_data else []

    print("  Cloud: {} companies, {} users".format(len(existing_companies), len(existing_users)))

    # 3. Merge
    print("[3/4] Merging data...")
    added, updated = merge_companies(existing_companies, new_companies)
    print("  Added: {}, Updated: {}, Total after merge: {}".format(added, updated, len(existing_companies)))

    # 4. Push to Supabase in batches
    print("[4/4] Pushing to Supabase (batch size: {})...".format(BATCH_SIZE))
    pushed = push_companies_in_batches(existing_companies)

    if pushed > 0:
        print()
        print("  DONE! {} companies online".format(pushed))
        print("  View: https://data-eriny.vercel.app")

        # Save merged result back to crm_import_ready.json
        crm_file = os.path.join(OUTPUT_DIR, 'crm_import_ready.json')
        try:
            with open(crm_file, 'w', encoding='utf-8') as f:
                json.dump(existing_companies, f, ensure_ascii=False)
            print("  Saved merged data to: {}".format(os.path.basename(crm_file)))
        except Exception as e:
            print("  Could not save merged data: {}".format(e))
        return True
    else:
        print("  FAILED: No companies were pushed")
        return False


if __name__ == '__main__':
    try:
        success = sync()
        if not success:
            print("\nTroubleshooting:")
            print("  1. Run START.bat option 9 to install dependencies")
            print("  2. Run START.bat option 1 to collect + sync data")
            print("  3. Make sure you have internet connection")
        input("\nPress Enter to exit...")
    except (EOFError, KeyboardInterrupt):
        pass
