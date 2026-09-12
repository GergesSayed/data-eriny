import pandas as pd
import json
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

df = pd.read_excel('scraper/output/october_aburawash_grid_factories.xlsx')

print("=== TOTAL HARVESTED FACTORIES ===")
print("Total records:", len(df))

print("\n=== BREAKDOWN BY SUB-ZONE ===")
for zone, count in df['المنطقة الفرعية / المجمع الصناعي'].value_counts().items():
    print(f"  - {zone}: {count} منشأة")

print("\n=== BREAKDOWN BY INDUSTRIAL SECTOR ===")
for sector, count in df['القطاع الصناعي'].value_counts().items():
    print(f"  - {sector}: {count} مصنع/شركة")

print("\n=== SAMPLE 15 FACTORIES WITH DIRECT MAPS LINKS ===")
for idx, row in df.head(15).iterrows():
    name = row['اسم المصنع / المنشأة']
    sector = row['القطاع الصناعي']
    zone = row['المنطقة الفرعية / المجمع الصناعي']
    phone = row['رقم التليفون']
    maps = row['رابط Google Maps المباشر']
    match_status = row['حالة المطابقة مع CRM']
    print(f"{idx+1}. [{sector}] {name}")
    print(f"    المنطقة: {zone} | الهاتف: {phone}")
    print(f"    المطابقة: {match_status}")
    print(f"    الرابط: {maps}")
    print()
