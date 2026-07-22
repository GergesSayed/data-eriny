# -*- coding: utf-8 -*-
"""
Google Maps Details Enricher (Multi-threaded)
==============================================
Visits Google Maps URLs of scraped companies in parallel to extract:
  - Phone numbers (via data-item-id="phone:tel:")
  - Website (via data-item-id="authority")
  - Address (via data-item-id="address")
  - Precise GPS coordinates (extracted from active browser URL)

Uses ThreadPoolExecutor to run 5 parallel headless Chrome browsers,
speeding up detail enrichment to over 1000+ companies per hour.
"""

import os
import re
import json
import time
import random
import argparse
import hashlib
import threading
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from contextlib import contextmanager

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
except ImportError:
    print("Selenium not installed. Run: pip install selenium")
    import sys
    sys.exit(1)

# Directories
SCRAPER_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRAPER_DIR, 'output')
INPUT_FILE = os.path.join(OUTPUT_DIR, 'crm_import_ready.json')
CACHE_FILE = os.path.join(OUTPUT_DIR, '_ultra_cache.json')
PROGRESS_FILE = os.path.join(OUTPUT_DIR, '_ultra_progress.json')
LOCK_FILE = os.path.join(OUTPUT_DIR, '_crm_write.lock')

# ============================================================
# CROSS-PROCESS LOCK & ATOMIC SAVE
# ============================================================

@contextmanager
def file_lock(lock_path=LOCK_FILE, timeout=120, poll=0.15):
    """Cross-process lock for thread-safe/process-safe CRM files."""
    os.makedirs(os.path.dirname(lock_path), exist_ok=True)
    lock_file = open(lock_path, 'a+b')
    acquired = False
    start = time.time()
    try:
        if os.name == 'nt':
            import msvcrt
            while True:
                try:
                    lock_file.seek(0)
                    msvcrt.locking(lock_file.fileno(), msvcrt.LK_NBLCK, 1)
                    acquired = True
                    break
                except OSError:
                    if time.time() - start >= timeout:
                        raise TimeoutError(f"Timed out waiting for output lock: {lock_path}")
                    time.sleep(poll)
        else:
            import fcntl
            while True:
                try:
                    fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
                    acquired = True
                    break
                except OSError:
                    if time.time() - start >= timeout:
                        raise TimeoutError(f"Timed out waiting for output lock: {lock_path}")
                    time.sleep(poll)
        yield
    finally:
        try:
            if acquired:
                if os.name == 'nt':
                    import msvcrt
                    lock_file.seek(0)
                    msvcrt.locking(lock_file.fileno(), msvcrt.LK_UNLCK, 1)
                else:
                    import fcntl
                    fcntl.flock(lock_file.fileno(), fcntl.LOCK_UN)
        except Exception:
            pass
        lock_file.close()

def atomic_json_save(file_path, data):
    """Save JSON atomically to prevent corruption."""
    temp_path = file_path + '.tmp'
    try:
        with open(temp_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        if os.path.exists(file_path):
            os.replace(temp_path, file_path)
        else:
            import shutil
            shutil.move(temp_path, file_path)
    except Exception as e:
        print(f"Error saving atomically to {file_path}: {e}")
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass

# ============================================================
# BROWSER MANAGEMENT
# ============================================================

def create_driver():
    """Create a headless Chrome instance."""
    options = Options()
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--lang=ar')
    options.add_argument('--window-size=1200,900')
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_experimental_option('excludeSwitches', ['enable-automation'])
    options.add_experimental_option('useAutomationExtension', False)
    
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    ]
    options.add_argument(f'user-agent={random.choice(user_agents)}')
    driver = webdriver.Chrome(options=options)
    driver.set_page_load_timeout(18)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    return driver

# ============================================================
# NORMALIZATION UTILS
# ============================================================

def normalize_phone(value):
    """Normalize common Egyptian phone formats."""
    if not value:
        return ''
    digits = re.sub(r'\D', '', str(value))
    if digits.startswith('0020'):
        digits = digits[2:]
    if digits.startswith('20') and len(digits) in (11, 12):
        digits = '0' + digits[2:]
    if len(digits) == 10 and digits.startswith('1'):
        digits = '0' + digits
    if len(digits) == 9 and digits.startswith('2'):
        digits = '0' + digits
    return digits

# ============================================================
# DETAILS EXTRACTION WORKER
# ============================================================

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

def extract_place_details(driver, url):
    """Navigate to place URL and scrape information from details panel."""
    driver.get(url)
    
    # Wait for details panel to render
    time.sleep(random.uniform(2.5, 4.0))
    
    details = {}
    
    # 1. Phone extraction
    try:
        phone_els = driver.find_elements(By.CSS_SELECTOR, 'button[data-item-id^="phone:tel:"]')
        phones = []
        for el in phone_els:
            tel_attr = el.get_attribute('data-item-id')
            if tel_attr:
                raw_tel = tel_attr.replace('phone:tel:', '').strip()
                norm = normalize_phone(raw_tel)
                if norm and norm not in phones:
                    phones.append(norm)
                    
        # Fallback phone extraction from visible text elements
        if not phones:
            phone_re = r'(?:\+?20[\s\-.]?)?(?:0?2[\s\-.]?\d{3,4}[\s\-.]?\d{4}|0?1[0125][\s\-.]?\d{3,4}[\s\-.]?\d{4}|19\d{3}|16\d{3})'
            io_els = driver.find_elements(By.CLASS_NAME, 'Io6YTe')
            for el in io_els:
                el_text = el.text or ''
                matches = re.findall(phone_re, el_text)
                for p in matches:
                    norm = normalize_phone(p)
                    if norm and norm not in phones:
                        phones.append(norm)
                        
        if phones:
            details['phone1'] = phones[0]
            if len(phones) > 1:
                details['phone2'] = phones[1]
            if len(phones) > 2:
                details['mobile'] = phones[2]
    except Exception as e:
        pass

    # 2. Website extraction
    try:
        website = None
        web_els = driver.find_elements(By.CSS_SELECTOR, 'a[data-item-id="authority"]')
        for el in web_els:
            href = el.get_attribute('href')
            if href and 'google.com' not in href:
                website = href.strip()
                break
                
        # Fallback website extraction from visible info anchors or text elements
        if not website:
            io_els = driver.find_elements(By.CLASS_NAME, 'Io6YTe')
            for el in io_els:
                el_text = (el.text or '').strip()
                if '.' in el_text and not any(k in el_text for k in ['القاهرة', 'الجيزة', 'مصر', 'شارع', 'طريق', 'بجوار', 'الدور']):
                    if re.match(r'^(?:https?://)?(?:www\.)?[\w\.-]+\.[a-z]{2,6}', el_text, re.IGNORECASE):
                        if not re.search(r'^\d+$', el_text.replace('.', '')):
                            website = el_text if el_text.startswith('http') else 'http://' + el_text
                            break
        if website:
            details['website'] = website
    except:
        pass

    # 3. Address extraction
    try:
        addr_els = driver.find_elements(By.CSS_SELECTOR, 'button[data-item-id="address"]')
        for el in addr_els:
            addr = el.text
            if addr and len(addr) > 5:
                # Clean address prefix/suffix characters
                addr = re.sub(r'^[\s·•\-\u202d\u202c]+', '', addr)
                details['address'] = addr.strip()
                break
    except:
        pass

    # 4. GPS Coordinates extraction
    try:
        current_url = driver.current_url
        match = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+)', current_url)
        if match:
            details['latitude'] = float(match.group(1))
            details['longitude'] = float(match.group(2))
    except:
        pass
        
    return details

# ============================================================
# MAIN
# ============================================================

def main():
    parser = argparse.ArgumentParser(description='Google Maps Details Enricher (Multi-threaded)')
    parser.add_argument('--limit', type=int, default=1000, help='Max companies to enrich in this run (default: 1000)')
    parser.add_argument('--force', action='store_true', help='Force re-enriching even if already has phone')
    args = parser.parse_args()

    # Load companies from INPUT_FILE
    companies = []
    if os.path.exists(INPUT_FILE):
        try:
            with open(INPUT_FILE, 'r', encoding='utf-8') as f:
                companies = json.load(f)
        except Exception as e:
            print(f"Error loading companies: {e}")
            return

    if not companies:
        print("No companies found to enrich.")
        return

    # Filter companies to process
    to_enrich = []
    for idx, c in enumerate(companies):
        has_url = bool(c.get('google_maps_url'))
        has_phone = bool(c.get('phone1'))
        
        if has_url and (args.force or not has_phone):
            to_enrich.append((idx, c))

    limit = min(len(to_enrich), args.limit)
    print("=" * 60)
    print("GOOGLE MAPS DETAILS ENRICHER (Multi-threaded)")
    print(f"  Loaded: {len(companies):,} total companies")
    print(f"  Target to enrich: {limit:,} companies (missing phones)")
    print("=" * 60)

    if limit == 0:
        print("All companies already have phone numbers. Nothing to do!")
        return

    save_lock = threading.Lock()
    processed = 0
    updated_count = 0

    def process_item(item):
        nonlocal processed, updated_count
        idx, company = item
        name = company.get('nameAr') or company.get('nameEn') or f"ID: {company.get('id')}"
        url = company.get('google_maps_url')
        
        try:
            driver = get_thread_driver()
            print(f"  [Thread-{threading.get_ident()}] Enriching: {name}")
            details = extract_place_details(driver, url)
            
            if details:
                with save_lock:
                    # Update details in-place
                    for k, v in details.items():
                        company[k] = v
                    company['lastUpdated'] = datetime.now().strftime('%Y-%m-%d')
                    companies[idx] = company
                    updated_count += 1
                    
                    # Save results atomically every 5 processed items
                    if updated_count % 5 == 0:
                        save_progress_atomic(companies)
                        
                print(f"    └─ [SUCCESS] {name} -> Phone: {details.get('phone1','None')}, Web: {details.get('website','None')}")
            else:
                print(f"    └─ [NO DETAILS] {name}")
                
        except Exception as e:
            print(f"    └─ [FAIL] {name}: {e}")
            close_thread_driver()
        finally:
            with save_lock:
                processed += 1

    try:
        # Run with 5 threads (max worker engines)
        with ThreadPoolExecutor(max_workers=5) as executor:
            executor.map(process_item, to_enrich[:limit])
    except KeyboardInterrupt:
        print("\nOperation interrupted by user. Saving progress...")
    finally:
        # Final save and cleanup
        save_progress_atomic(companies)
        
        # Shutdown Chrome engines in thread pools
        try:
            cmd = ['powershell', '-Command', 'Get-CimInstance Win32_Process | Where-Object { $_.Name -match "chromedriver" } | Remove-CimInstance']
            import subprocess
            subprocess.run(cmd, creationflags=0x08000000)
        except:
            pass
            
        print("\n" + "=" * 60)
        print("ENRICHMENT SESSION COMPLETE")
        print(f"  Processed: {processed}/{limit}")
        print(f"  Enriched with Phone/Details: {updated_count}")
        print("=" * 60)

def save_progress_atomic(companies_list):
    """Save progress lock-safely to both cache and CRM output files."""
    with file_lock():
        # Write to CRM ready json
        atomic_json_save(INPUT_FILE, companies_list)
        # Write to ultra cache json
        atomic_json_save(CACHE_FILE, companies_list)
        
        # Write to progress file
        if os.path.exists(PROGRESS_FILE):
            try:
                with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
                    progress = json.load(f)
                progress['total'] = len(companies_list)
                progress['with_phone'] = sum(1 for c in companies_list if c.get('phone1'))
                progress['timestamp'] = datetime.now().isoformat()
                atomic_json_save(PROGRESS_FILE, progress)
            except:
                pass

if __name__ == '__main__':
    main()
