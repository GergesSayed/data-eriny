import sys, re

sys.stdout.reconfigure(encoding='utf-8')

OLD_VER = '349.0'
NEW_VER = '350.0'
OLD_DATASET_TAG = 'v349.0_hide_menu_toggle_on_desktop'
NEW_DATASET_TAG = 'v350.0_fix_mobile_notif_and_search'

files_to_update = [
    'crm/sw.js',
    'crm/js/storage.js',
    'crm/js/companies.js',
    'crm/js/app.js',
    'crm/index.html'
]

for file_path in files_to_update:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace(OLD_DATASET_TAG, NEW_DATASET_TAG)
    new_content = new_content.replace(f'v={OLD_VER}', f'v={NEW_VER}')
    new_content = new_content.replace(f"'{OLD_VER}'", f"'{NEW_VER}'")
    new_content = new_content.replace(f'"{OLD_VER}"', f'"{NEW_VER}"')
    new_content = new_content.replace(f'v{OLD_VER}', f'v{NEW_VER}')
    new_content = new_content.replace('fleetcrm-v349-0-shell', 'fleetcrm-v350-0-shell')
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated version in {file_path}")
    else:
        print(f"No changes in {file_path}")

print("Version bump to v350.0 complete!")
