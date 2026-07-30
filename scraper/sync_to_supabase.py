# -*- coding: utf-8 -*-
"""
sync_to_supabase.py — Push scraper output to Supabase cloud
Reads crm_import_ready.json and pushes to the master_data table.
Run after scraping to make data available to all devices.
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error

SUPABASE_URL = "https://vefitfgvdgjqipkkttry.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZml0Zmd2ZGdqcWlwa2t0dHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNjQ0MzMsImV4cCI6MjEwMDY0MDQzM30.G4PnsfUnAI9gdNPFoSJuWKlE9VCmUXAkHOxzJb51Rrk"

SCRAPER_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRAPER_DIR, 'output')
CRM_FILE = os.path.join(OUTPUT_DIR, 'crm_import_ready.json')


def get_headers():
    return {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }


def fetch_current_master_data():
    """GET current master_data from Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/master_data?id=eq.1&select=*"
    req = urllib.request.Request(url, headers=get_headers())
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            if data and len(data) > 0:
                return data[0]
    except Exception as e:
        print(f"  ⚠️ Could not fetch current cloud data: {e}")
    return None


def push_to_supabase(payload):
    """PATCH master_data in Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/master_data?id=eq.1"
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=get_headers(), method='PATCH')
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode())
            return True, result
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ''
        return False, f"HTTP {e.code}: {body}"
    except Exception as e:
        return False, str(e)


def load_scraper_output(filepath):
    """Load companies from scraper output JSON"""
    if not os.path.exists(filepath):
        print(f"  ⚠️ File not found: {filepath}")
        return None

    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Handle both array and {companies: [...]} formats
    if isinstance(data, list):
        companies = data
    elif isinstance(data, dict):
        companies = data.get('companies', data.get('data', []))
    else:
        print(f"  ⚠️ Unexpected data format: {type(data)}")
        return None

    return companies


def merge_companies(existing, new_companies):
    """Merge new companies into existing list, deduplicating by id/name"""
    existing_by_id = {}
    existing_by_name = {}

    for c in existing:
        cid = c.get('id', '')
        name = (c.get('nameAr', '') or c.get('nameEn', '')).strip().lower()
        if cid:
            existing_by_id[cid] = c
        if name:
            existing_by_name[name] = c

    added = 0
    updated = 0

    for nc in new_companies:
        nc_id = nc.get('id', '')
        nc_name = (nc.get('nameAr', '') or nc.get('nameEn', '')).strip().lower()

        # Check for duplicate by ID or name
        existing_company = existing_by_id.get(nc_id) or existing_by_name.get(nc_name)

        if existing_company:
            # Update existing with non-empty fields
            changed = False
            for key, value in nc.items():
                if value and value != existing_company.get(key):
                    existing_company[key] = value
                    changed = True
            if changed:
                updated += 1
        else:
            # Add new company
            if nc_id:
                existing_by_id[nc_id] = nc
            if nc_name:
                existing_by_name[nc_name] = nc
            existing.append(nc)
            added += 1

    return added, updated


def sync():
    """Main sync function"""
    print("=" * 60)
    print("  Fleet CRM — Supabase Cloud Sync")
    print("=" * 60)
    print()

    # 1. Load scraper output
    print("[1/4] Loading scraper output...")
    new_companies = load_scraper_output(CRM_FILE)

    if not new_companies:
        # Try alternative files
        alt_files = [
            'ALL_COMPANIES_*.json',
            'fleet_companies_*.json',
            'ULTRA_*.json'
        ]
        import glob
        for pattern in alt_files:
            matches = glob.glob(os.path.join(OUTPUT_DIR, pattern))
            matches = sorted(matches, key=os.path.getmtime, reverse=True)
            for match in matches:
                new_companies = load_scraper_output(match)
                if new_companies:
                    print(f"  ✅ Loaded from: {os.path.basename(match)}")
                    break
            if new_companies:
                break

    if not new_companies:
        print("  ❌ No scraper output found. Run the scraper first (START.bat)")
        return False

    print(f"  ✅ {len(new_companies)} companies in scraper output")

    # 2. Fetch current cloud data
    print("[2/4] Fetching current cloud data...")
    cloud_data = fetch_current_master_data()

    existing_companies = []
    existing_users = []
    existing_calls = []
    existing_deals = []
    existing_activities = []

    if cloud_data:
        existing_companies = cloud_data.get('companies', [])
        existing_users = cloud_data.get('users', [])
        existing_calls = cloud_data.get('calls', [])
        existing_deals = cloud_data.get('deals', [])
        existing_activities = cloud_data.get('activities', [])
        print(f"  ✅ Cloud has {len(existing_companies)} companies, {len(existing_users)} users")
    else:
        print("  ⚠️ No existing cloud data — creating initial record")

    # 3. Merge
    print("[3/4] Merging data...")
    added, updated = merge_companies(existing_companies, new_companies)
    print(f"  ✅ Added: {added}, Updated: {updated}, Total: {len(existing_companies)}")

    # 4. Push to Supabase
    print("[4/4] Pushing to Supabase...")
    payload = {
        'id': 1,
        'companies': existing_companies,
        'users': existing_users,
        'calls': existing_calls,
        'deals': existing_deals,
        'activities': existing_activities,
        'updated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'updated_by': 'python-scraper'
    }

    success, result = push_to_supabase(payload)
    if success:
        print(f"  ✅ SYNced successfully!")
        print(f"  📊 {len(existing_companies)} companies now online")
        print(f"  🔗 View: https://data-eriny.vercel.app")
    else:
        print(f"  ❌ Failed: {result}")

    print()
    return success


if __name__ == '__main__':
    try:
        sync()
        input("\nPress Enter to exit...")
    except (EOFError, KeyboardInterrupt):
        pass
