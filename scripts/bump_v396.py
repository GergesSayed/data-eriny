import re

files_to_update = ['crm/index.html', 'crm/sw.js', 'crm/js/app.js']

for f_path in files_to_update:
    with open(f_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content.replace('395.0', '396.0').replace('v395.0', 'v396.0').replace('v395-0', 'v396-0')

    with open(f_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"Bumped {f_path} to v396.0")
