@echo off
chcp 65001 >nul
cls
echo ============================================================
echo          Fleet Data Collector - سحب بيانات الشركات
echo ============================================================
echo.
echo  *** المسار الموصى به للبداية: اختار [1] ***
echo.
cd /d "%~dp0"

echo ============================================================
echo   DATA COLLECTION (بدون Chrome):
echo ============================================================
echo     [1] 🚀 Quick Start + Sync — 64 شركة بريميوم + رفع للسحابة
echo     [4] Smart Puller — 300-1000 شركة (بحث جوجل)
echo     [5] Mega Scraper — 500-5000 شركة (كل المصادر)
echo.
echo ============================================================
echo   GOOGLE MAPS SCRAPER (محتاج Chrome):
echo ============================================================
echo     [2] Google Maps Light — 200-500 شركة (10-20 دقيقة)
echo     [3] Google Maps Deep — 500-2000 شركة (30-60 دقيقة)
echo.
echo ============================================================
echo   CLOUD ؤ SERVER:
echo ============================================================
echo     [6] Sync to Supabase — رفع أحدث بيانات للسحابة
echo     [7] Open CRM Online — data-eriny.vercel.app
echo     [8] Start Local Server — يشغل السيرفر (CRM يتحكم فيه)
echo.
echo ============================================================
echo   SETUP (مرة واحدة):
echo ============================================================
echo     [9] Install Dependencies
echo     [0] Exit
echo.

set /p choice="Enter choice (0-9): "

if "%choice%"=="1" goto quick
if "%choice%"=="2" goto browser
if "%choice%"=="3" goto browser_deep
if "%choice%"=="4" goto smart
if "%choice%"=="5" goto mega
if "%choice%"=="6" goto sync_supabase
if "%choice%"=="7" goto crm_online
if "%choice%"=="8" goto local_server
if "%choice%"=="9" goto deps
if "%choice%"=="0" goto end
goto end

:quick
echo.
echo ============================================================
echo  [1/2] Collecting 64 premium Egyptian companies...
echo ============================================================
python -X utf8 collect_real_data.py --export-crm
if %errorlevel% neq 0 (
    echo.
    echo [FAILED] Scraper error. Check if dependencies are installed (option 9).
    pause
    goto end
)
echo.
echo ============================================================
echo  [2/2] Syncing to Supabase cloud...
echo ============================================================
python -X utf8 sync_to_supabase.py
echo.
echo ============================================================
echo  DONE! Data is now online.
echo  Open: https://data-eriny.vercel.app
echo ============================================================
echo.
pause
goto end

:browser
echo.
echo Starting Google Maps Browser Scraper (200 companies)...
echo Chrome will open automatically. Do not close it.
echo Press Ctrl+C to stop at any time - progress is saved.
echo.
python -X utf8 browser_scraper.py --headless --max 200
echo.
echo Syncing to Supabase...
python -X utf8 sync_to_supabase.py
pause
goto end

:browser_deep
echo.
echo Starting DEEP Google Maps Scraper (2000 companies)...
echo This will take 30-60 minutes. Chrome will open automatically.
echo Press Ctrl+C to stop at any time - progress is saved.
echo.
python -X utf8 browser_scraper.py --headless --max 2000
echo.
echo Syncing to Supabase...
python -X utf8 sync_to_supabase.py
pause
goto end

:smart
echo.
echo Starting Smart Puller - Google Search scraping...
echo.
python -X utf8 smart_puller.py --deep
echo.
echo Syncing to Supabase...
python -X utf8 sync_to_supabase.py
pause
goto end

:mega
echo.
echo Starting MEGA Scraper - All Sources...
echo Takes 1-2 hours.
echo.
python -X utf8 mega_scraper.py --max-companies 5000
echo.
echo Syncing to Supabase...
python -X utf8 sync_to_supabase.py
pause
goto end

:sync_supabase
echo.
echo Syncing scraper output to Supabase cloud...
python -X utf8 sync_to_supabase.py
pause
goto end

:crm_online
echo.
echo Opening CRM Online...
start https://data-eriny.vercel.app
goto end

:local_server
echo.
echo Starting Local Server on port 8888...
echo The CRM can now connect to this server for Google Maps scraping.
echo.
echo Press Ctrl+C to stop the server.
echo.
start http://localhost:8888
python -X utf8 server.py 8888
goto end

:deps
echo.
echo Installing all dependencies...
pip install -r requirements.txt
echo.
echo Done!
pause
goto end

:end
