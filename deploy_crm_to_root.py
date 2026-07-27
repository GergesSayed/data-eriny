import os
import shutil

def sync_all():
    root_dir = 'e:/Company Sales SAAS/data-eriny'
    crm_dir = os.path.join(root_dir, 'crm')

    # Copy updated root files to crm/
    items = ['index.html', 'sw.js', 'manifest.json', 'css', 'js', 'data']
    for item in items:
        s = os.path.join(root_dir, item)
        d = os.path.join(crm_dir, item)
        if os.path.exists(s):
            if os.path.isdir(s):
                if os.path.exists(d): shutil.rmtree(d)
                shutil.copytree(s, d)
            else:
                shutil.copy2(s, d)
    print("Bidirectional sync complete!")

if __name__ == "__main__":
    sync_all()
