import sys, re

sys.stdout.reconfigure(encoding='utf-8')

OLD_VER = '343.0'
NEW_VER = '344.0'
OLD_DATASET_TAG = 'v343.0_mobile_topbar_icons_grouped_side_by_side'
NEW_DATASET_TAG = 'v344.0_restore_stable_clean_baseline'

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
    new_content = new_content.replace('fleetcrm-v343-0-shell', 'fleetcrm-v344-0-shell')
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated version in {file_path}")
    else:
        print(f"No changes in {file_path}")

print("Version bump to v344.0 complete!")
