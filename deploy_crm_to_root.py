#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sync CRM directory contents directly to repository root for zero-redirect Vercel deployment.
"""

import os
import shutil

def sync_crm_to_root():
    root_dir = 'e:/Company Sales SAAS/data-eriny'
    crm_dir = os.path.join(root_dir, 'crm')

    for item in os.listdir(crm_dir):
        s = os.path.join(crm_dir, item)
        d = os.path.join(root_dir, item)
        if os.path.isdir(s):
            if os.path.exists(d):
                shutil.rmtree(d)
            shutil.copytree(s, d)
            print(f"Copied directory: {item} -> root")
        else:
            shutil.copy2(s, d)
            print(f"Copied file: {item} -> root")

    print("Successfully synced all CRM files to root!")

if __name__ == "__main__":
    sync_crm_to_root()
