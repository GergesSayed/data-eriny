#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fleet CRM — Unified Scraper Engine (Master Orchestrator)
يوحد جميع أدوات الكشط واستخراج بيانات الشركات ذات الأساطيل في واجهة موحدة
"""

import sys
import os
import argparse
import subprocess
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

SCRAPERS = {
    "ultra": {
        "name": "كشط شامل وتلقائي للأساطيل (Ultra Fleet Scraper)",
        "file": "ultra_scraper.py",
        "description": "استخراج وتوزيع وتصنيف الشركات من كافة القطاعات في القاهرة الكبرى"
    },
    "places": {
        "name": "كشط خرائط جوجل المباشر (Google Places API)",
        "file": "google_places_scraper.py",
        "description": "سحب تفاصيل المكان والتقييمات وساعات العمل واللوكيشن مباشرة"
    },
    "egypt": {
        "name": "دليل الشركات والمصانع المصرية (Egypt Companies)",
        "file": "egypt_companies_scraper.py",
        "description": "سحب بيانات المصانع والشركات الكبرى وسجلات التواصل"
    },
    "smart": {
        "name": "المستخرج الذكي بكلمات مفتاحية (Smart Puller)",
        "file": "smart_puller.py",
        "description": "بحث وتصفية مخصصة بكلمات النقل والشحن والسيارات"
    },
    "enrich": {
        "name": "إثراء بيانات LinkedIn والمسؤولين (LinkedIn Enricher)",
        "file": "linkedin_enricher.py",
        "description": "سحب وسائط وحسابات التواصل الاجتماعي لمدراء المشتريات"
    }
}

def run_scraper(scraper_key):
    if scraper_key not in SCRAPERS:
        logging.error(f"عفواً، السكرابر المطلوب غير موجود: {scraper_key}")
        logging.info(f"السكرابرز المتاحة: {', '.join(SCRAPERS.keys())}")
        return False

    info = SCRAPERS[scraper_key]
    script_path = os.path.join(os.path.dirname(__file__), info["file"])
    
    if not os.path.exists(script_path):
        logging.error(f"لم يتم العثور على الملف: {script_path}")
        return False

    logging.info(f"🚀 بدء تشغيل {info['name']}...")
    try:
        res = subprocess.run([sys.executable, script_path], check=True)
        logging.info(f"✅ تم الانتهاء بنجاح من {info['name']}")
        return True
    except Exception as e:
        logging.error(f"❌ حدث خطأ أثناء تشغيل {info['name']}: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Fleet CRM — Unified Scraper Engine")
    parser.add_argument(
        "--mode",
        choices=list(SCRAPERS.keys()) + ["all"],
        default="ultra",
        help="اختر أداة الكشط المراد تشغيلها (ultra, places, egypt, smart, enrich, all)"
    )
    
    args = parser.parse_args()
    
    if args.mode == "all":
        logging.info("🌟 تشغيل جميع أدوات الكشط بالتتابع...")
        for key in ["ultra", "places", "egypt", "smart", "enrich"]:
            run_scraper(key)
    else:
        run_scraper(args.mode)

if __name__ == "__main__":
    main()
