import sys

sys.stdout.reconfigure(encoding='utf-8')

OLD_VER = '404.0'
NEW_VER = '405.0'

files_to_update = [
    'crm/sw.js',
    'crm/js/storage.js',
    'crm/js/companies.js',
    'crm/js/calls.js',
    'crm/js/supabase-client.js',
    'crm/js/dashboard.js',
    'crm/js/excel-handler.js',
    'crm/js/app.js',
    'crm/index.html',
    'crm/css/style.css',
]

for file_path in files_to_update:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content.replace(f'v={OLD_VER}', f'v={NEW_VER}')
        new_content = new_content.replace(f"'{OLD_VER}'", f"'{NEW_VER}'")
        new_content = new_content.replace(f'"{OLD_VER}"', f'"{NEW_VER}"')
        new_content = new_content.replace(f'v{OLD_VER}', f'v{NEW_VER}')
        new_content = new_content.replace('fleetcrm-v404-0-shell', 'fleetcrm-v405-0-shell')
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated version in {file_path}")
        else:
            print(f"No changes in {file_path}")
    except Exception as e:
        print(f"Error updating {file_path}: {e}")

print("Version bump to v405.0 complete!")
