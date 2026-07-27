import os
import shutil

def sync_crm_to_root():
    """Copy updated files from crm/ TO root (source of truth = crm/)"""
    root_dir = 'e:/Company Sales SAAS/data-eriny'
    crm_dir = os.path.join(root_dir, 'crm')

    items = ['index.html', 'sw.js', 'manifest.json', 'css', 'js', 'data']
    for item in items:
        s = os.path.join(crm_dir, item)
        d = os.path.join(root_dir, item)
        if os.path.exists(s):
            if os.path.isdir(s):
                if os.path.exists(d):
                    shutil.rmtree(d)
                shutil.copytree(s, d)
            else:
                shutil.copy2(s, d)
    print("Sync from crm/ -> root complete!")

if __name__ == "__main__":
    sync_crm_to_root()
