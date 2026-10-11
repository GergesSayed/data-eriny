import urllib.request
import re

url = 'https://data-eriny.vercel.app/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        print('HTTP Status:', resp.status)
        ver_match = re.search(r'CURRENT_VER\s*=\s*[\'"]([^\'"]+)[\'"]', html)
        print('CURRENT_VER in live HTML:', ver_match.group(1) if ver_match else 'Not found')
        dataset_match = re.search(r'DATASET_VER\s*=\s*[\'"]([^\'"]+)[\'"]', html)
        print('DATASET_VER in live HTML:', dataset_match.group(1) if dataset_match else 'Not found')
        count_match = re.search(r'id="sidebar-total-companies">([^<]+)<', html)
        print('Sidebar counter in live HTML:', count_match.group(1) if count_match else 'Not found')
except Exception as e:
    print('Error:', e)

# Also check egypt_enterprises_pool.js on Vercel
pool_url = 'https://data-eriny.vercel.app/js/egypt_enterprises_pool.js?v=317.0'
try:
    with urllib.request.urlopen(urllib.request.Request(pool_url, headers={'User-Agent': 'Mozilla/5.0'})) as resp:
        header_line = resp.readline().decode('utf-8')
        print('Live pool JS header:', header_line.strip())
except Exception as e:
    print('Error checking pool JS:', e)
