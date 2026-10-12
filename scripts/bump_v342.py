import sys, re

sys.stdout.reconfigure(encoding='utf-8')

OLD_VER = '341.0'
NEW_VER = '342.0'
OLD_DATASET_TAG = 'v341.0_mobile_cards_view_render_fix'
NEW_DATASET_TAG = 'v342.0_mobile_topbar_spacing_and_icons_polish'

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
    new_content = new_content.replace('fleetcrm-v341-0-shell', 'fleetcrm-v342-0-shell')
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated version in {file_path}")
    else:
        print(f"No changes in {file_path}")

print("Version bump to v342.0 complete!")
