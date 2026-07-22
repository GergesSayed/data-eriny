# -*- coding: utf-8 -*-
"""
Scraper API & File Server — Fleet CRM
Replaces http-server on port 8888, serving static files
and exposing APIs to run scraper/enricher scripts as background subprocesses.
"""

import os
import sys
import subprocess
import json
import urllib.parse
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

if sys.stdout is None:
    sys.stdout = open(os.devnull, 'w')
if sys.stderr is None:
    sys.stderr = open(os.devnull, 'w')

SCRAPER_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(SCRAPER_DIR)

# Track active subprocesses
processes = {
    'scraper': None,
    'enricher': None
}
process_lock = threading.RLock()

def get_script_pids(script_name):
    try:
        cmd = ['powershell', '-Command', f'Get-CimInstance Win32_Process | Where-Object {{ $_.Name -match "python" -and $_.CommandLine -like "*{script_name}*" -and $_.CommandLine -notlike "*Get-CimInstance*" }} | Select-Object -ExpandProperty ProcessId']
        creation_flags = 0
        if sys.platform == 'win32':
            creation_flags = 0x08000000 # CREATE_NO_WINDOW
        output = subprocess.check_output(cmd, creationflags=creation_flags, timeout=3).decode('utf-8', errors='ignore')
        pids = []
        for line in output.split('\n'):
            line = line.strip()
            if line.isdigit():
                pids.append(int(line))
        return pids
    except Exception:
        return []

def is_script_running(script_name):
    # 1. Fast check: see if we have an active subprocess handle tracked in memory
    p_key = 'scraper' if 'ultra_scraper' in script_name else 'enricher'
    with process_lock:
        p = processes.get(p_key)
        if p is not None:
            if p.poll() is None:
                return True
            processes[p_key] = None # Reset finished subprocess

    # 2. Slow fallback check (only if not launched by this server session)
    return len(get_script_pids(script_name)) > 0


# Global cache for stats
stats_cache = {
    'last_mtime_crm': 0,
    'last_mtime_progress': 0,
    'total': 0,
    'with_phone': 0,
    'with_linkedin': 0,
    'recent_companies': [],
    'recent_linkedin': [],
    'target': 5000,
    'completed_searches_count': 0,
    'stats': {},
    'status': 'stopped',
    'timestamp': ''
}

class ScraperHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Normalize and split path
        parsed = urllib.parse.urlparse(path)
        p = parsed.path
        
        # Workspace root is parent of SCRAPER_DIR
        workspace_root = os.path.dirname(SCRAPER_DIR)
        
        # Redirect / or /index.html to CRM main page
        if p in ('/', '/index.html'):
            return os.path.join(workspace_root, 'crm', 'index.html')
            
        parts = p.strip('/').split('/')
        if parts and parts[0] in ('js', 'css', 'img', 'assets'):
            return os.path.join(workspace_root, 'crm', *parts)
            
        crm_path = os.path.join(workspace_root, 'crm', *parts)
        if os.path.exists(crm_path) and not os.path.isdir(crm_path):
            return crm_path
            
        return super().translate_path(path)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.end_headers()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path == '/api/save-config':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                config_data = json.loads(post_data.decode('utf-8'))
                config_path = os.path.join(SCRAPER_DIR, 'output', 'scraper_config.json')
                
                # Direct atomic write in Python
                temp_path = config_path + '.tmp'
                with open(temp_path, 'w', encoding='utf-8') as f:
                    json.dump(config_data, f, ensure_ascii=False, indent=2)
                if os.path.exists(config_path):
                    os.replace(temp_path, config_path)
                else:
                    shutil = __import__('shutil')
                    shutil.move(temp_path, config_path)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'saved'}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
            return

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        # API: Status Check
        if path == '/api/status':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            scraper_running = is_script_running('ultra_scraper.py')
            enricher_running = is_script_running('linkedin_enricher.py')
            
            response = {
                'scraper_running': scraper_running,
                'enricher_running': enricher_running
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        # API: Load Scraper Config
        elif path == '/api/load-config':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            config_path = os.path.join(SCRAPER_DIR, 'output', 'scraper_config.json')
            if os.path.exists(config_path):
                try:
                    with open(config_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    self.wfile.write(json.dumps(data).encode('utf-8'))
                    return
                except:
                    pass
            self.wfile.write(json.dumps({}).encode('utf-8'))
            return

        # API: Scraper Stats (Optimization to prevent loading 11MB JSON in client)
        elif path == '/api/scraper-stats':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            crm_path = os.path.join(SCRAPER_DIR, 'output', 'crm_import_ready.json')
            progress_path = os.path.join(SCRAPER_DIR, 'output', '_ultra_progress.json')
            
            global stats_cache
            
            # Check CRM file modification time to see if we need to reload it
            crm_modified = False
            if os.path.exists(crm_path):
                try:
                    crm_mtime = os.path.getmtime(crm_path)
                    if crm_mtime != stats_cache['last_mtime_crm']:
                        crm_modified = True
                        stats_cache['last_mtime_crm'] = crm_mtime
                except Exception:
                    crm_modified = True # Force reload if getmtime fails
            else:
                stats_cache['last_mtime_crm'] = 0
                stats_cache['total'] = 0
                stats_cache['with_phone'] = 0
                stats_cache['recent_companies'] = []
                stats_cache['recent_linkedin'] = []
            
            if crm_modified:
                try:
                    with open(crm_path, 'r', encoding='utf-8') as f:
                        companies = json.load(f)
                    stats_cache['total'] = len(companies)
                    stats_cache['with_phone'] = sum(1 for c in companies if c.get('phone1'))
                    stats_cache['recent_companies'] = companies[-15:]
                    enriched = [c for c in companies if c.get('linkedinContactUrl') or c.get('linkedinUrl') or c.get('linkedin')]
                    stats_cache['recent_linkedin'] = enriched[-15:]
                    stats_cache['with_linkedin'] = len(enriched)
                except Exception as e:
                    print(f"Error reading crm_import_ready.json: {e}")
            
            # Check progress file modification time
            progress_modified = False
            if os.path.exists(progress_path):
                try:
                    prog_mtime = os.path.getmtime(progress_path)
                    if prog_mtime != stats_cache['last_mtime_progress']:
                        progress_modified = True
                        stats_cache['last_mtime_progress'] = prog_mtime
                except Exception:
                    progress_modified = True
            else:
                stats_cache['last_mtime_progress'] = 0
                stats_cache['target'] = 5000
                stats_cache['completed_searches_count'] = 0
                stats_cache['stats'] = {}
                stats_cache['status'] = 'stopped'
                stats_cache['timestamp'] = ''
                
            if progress_modified:
                try:
                    with open(progress_path, 'r', encoding='utf-8') as f:
                        progress_data = json.load(f)
                    stats_cache['target'] = progress_data.get('target', 5000)
                    stats_cache['completed_searches_count'] = len(progress_data.get('completed_searches', []))
                    stats_cache['stats'] = progress_data.get('stats', {})
                    stats_cache['status'] = progress_data.get('status', 'stopped')
                    stats_cache['timestamp'] = progress_data.get('timestamp', '')
                except Exception:
                    pass
            
            scraper_running = is_script_running('ultra_scraper.py')
            enricher_running = is_script_running('linkedin_enricher.py')
            actual_status = 'running' if scraper_running or enricher_running else 'stopped'

            response = {
                'total': stats_cache['total'],
                'with_phone': stats_cache['with_phone'],
                'with_linkedin': stats_cache.get('with_linkedin', 0),
                'recent_companies': stats_cache['recent_companies'],
                'recent_linkedin': stats_cache['recent_linkedin'],
                'target': stats_cache['target'],
                'completed_searches_count': stats_cache['completed_searches_count'],
                'stats': stats_cache['stats'],
                'status': actual_status,
                'scraper_running': scraper_running,
                'enricher_running': enricher_running,
                'progress_status': stats_cache['status'],
                'timestamp': stats_cache['timestamp'],
                'last_mtime_crm': stats_cache.get('last_mtime_crm', 0)
            }
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        # API: Run Google Maps Scraper
        elif path == '/api/run-scraper':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            try:
                with process_lock:
                    if is_script_running('ultra_scraper.py'):
                        self.wfile.write(json.dumps({'status': 'started'}).encode('utf-8'))
                        return
                    log_file = open('output/scraper.log', 'w', encoding='utf-8')
                    cmd = [sys.executable, '-X', 'utf8', 'ultra_scraper.py', '--resume']
                    creation_flags = 0
                    if sys.platform == 'win32':
                        creation_flags = 0x08000000
                    p = subprocess.Popen(cmd, stdout=log_file, stderr=subprocess.STDOUT, creationflags=creation_flags)
                    processes['scraper'] = p
                self.wfile.write(json.dumps({'status': 'started'}).encode('utf-8'))
            except Exception as e:
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
            return

        # API: Run LinkedIn Enricher
        elif path == '/api/run-enricher':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            try:
                with process_lock:
                    if is_script_running('linkedin_enricher.py'):
                        self.wfile.write(json.dumps({'status': 'started'}).encode('utf-8'))
                        return
                    log_file = open('output/enricher.log', 'w', encoding='utf-8')
                    cmd = [sys.executable, '-X', 'utf8', 'linkedin_enricher.py', '--limit', '5000']
                    creation_flags = 0
                    if sys.platform == 'win32':
                        creation_flags = 0x08000000
                    p = subprocess.Popen(cmd, stdout=log_file, stderr=subprocess.STDOUT, creationflags=creation_flags)
                    processes['enricher'] = p
                self.wfile.write(json.dumps({'status': 'started'}).encode('utf-8'))
            except Exception as e:
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
            return

        # API: Stop Running Process
        elif path == '/api/stop':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            query = urllib.parse.parse_qs(parsed_url.query)
            target = query.get('target', [None])[0]
            
            pids = []
            if target == 'scraper':
                pids = get_script_pids('ultra_scraper.py')
            elif target == 'enricher':
                pids = get_script_pids('linkedin_enricher.py')
                
            if pids:
                for pid in pids:
                    try:
                        subprocess.run(['taskkill', '/F', '/PID', str(pid)], creationflags=0x08000000)
                    except Exception:
                        pass
                if target in processes:
                    processes[target] = None
                self.wfile.write(json.dumps({'status': 'stopped'}).encode('utf-8'))
                return
            
            # Fallback to processes dict
            if target in processes:
                p = processes[target]
                if p is not None and p.poll() is None:
                    p.terminate()
                    p.wait()
                    processes[target] = None
                    self.wfile.write(json.dumps({'status': 'stopped'}).encode('utf-8'))
                    return
            
            self.wfile.write(json.dumps({'status': 'not_running'}).encode('utf-8'))
            return

        # Default: Serve static files
        return super().do_GET()

def run(port=8888):
    server_address = ('', port)
    httpd = ThreadingHTTPServer(server_address, ScraperHandler)
    print(f"[SERVER] Scraper API & File Server running on port {port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        for name, p in processes.items():
            if p is not None and p.poll() is None:
                p.terminate()
        httpd.server_close()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8888))
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run(port)
