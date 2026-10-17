import sys

sys.stdout.reconfigure(encoding='utf-8')

OLD_VER = '385.0'
NEW_VER = '386.0'

files_to_update = [
    'crm/sw.js',
    'crm/js/storage.js',
    'crm/js/companies.js',
    'crm/js/calls.js',
    'crm/js/supabase-client.js',
    'crm/js/dashboard.js',
    'crm/js/excel-handler.js',
    'crm/js/app.js',
    'crm/index.html'
]

for file_path in files_to_update:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content.replace(f'v={OLD_VER}', f'v={NEW_VER}')
        new_content = new_content.replace(f"'{OLD_VER}'", f"'{NEW_VER}'")
        new_content = new_content.replace(f'"{OLD_VER}"', f'"{NEW_VER}"')
        new_content = new_content.replace(f'v{OLD_VER}', f'v{NEW_VER}')
        new_content = new_content.replace('fleetcrm-v385-0-shell', 'fleetcrm-v386-0-shell')
        new_content = new_content.replace('v385.0_realtime_stream_user_presence_and_anti_false_offline', 'v386.0_freeze_eliminated_clean_architecture_assignments_calls')
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated version in {file_path}")
        else:
            print(f"No changes in {file_path}")
    except Exception as e:
        print(f"Error updating {file_path}: {e}")

print("Version bump to v386.0 complete!")
