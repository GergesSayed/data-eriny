@echo off
chcp 65001 >nul
cls
echo ============================================================
echo          Fleet Data Collector - سحب بيانات الشركات
echo ============================================================
echo.

cd /d "%~dp0"

echo Choose an option / اختار:
echo.
echo   [1] Quick Start - سحب سريع + رفع للسحابة (موصى به)
echo   [2] Google Maps Browser Scraper (200-500 شركة)
echo   [3] Google Maps Deep Scraper (500-2000 شركة)
echo   [4] Smart Puller - All Sectors (300-1000 شركة)
echo   [5] Mega Scraper - All Sources (500-5000 شركة)
echo   [6] Sync to Supabase - رفع البيانات للسحابة
echo   [7] Open CRM Online (Vercel)
echo   [8] Open CRM Local + Server
echo   [9] Install Dependencies
echo   [0] Exit
echo.

set /p choice="Enter choice (1-9): "

if "%choice%"=="1" goto quick
if "%choice%"=="2" goto browser
if "%choice%"=="3" goto browser_deep
if "%choice%"=="4" goto smart
if "%choice%"=="5" goto mega
if "%choice%"=="6" goto sync_supabase
if "%choice%"=="7" goto crm_online
if "%choice%"=="8" goto crm_local
if "%choice%"=="9" goto deps
if "%choice%"=="0" goto end

:quick
echo.
echo [1/3] Collecting companies...
python -X utf8 collect_real_data.py --export-crm
if %errorlevel% neq 0 (
    echo ❌ Scraper failed!
    pause
    goto end
)
echo.
echo [2/3] Syncing to Supabase cloud...
python -X utf8 sync_to_supabase.py
echo.
echo [3/3] Done! Data is now available on all devices.
echo 🔗 https://data-eriny.vercel.app
echo.
pause
goto end

:browser
echo.
echo Starting Google Maps Browser Scraper (200 companies)...
echo This will open Chrome and scrape Google Maps.
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
echo This will take 30-60 minutes.
echo.
python -X utf8 browser_scraper.py --headless --max 2000
echo.
echo Syncing to Supabase...
python -X utf8 sync_to_supabase.py
pause
goto end

:smart
echo.
echo Starting Smart Puller - All Sectors...
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
echo Syncing latest scraper output to Supabase cloud...
python -X utf8 sync_to_supabase.py
pause
goto end

:crm_online
echo.
echo Opening CRM Online...
start https://data-eriny.vercel.app
goto end

:crm_local
echo.
echo Opening CRM Locally + Starting HTTP Server...
start http://localhost:8888
start python -X utf8 server.py
goto end

:deps
echo.
echo Installing all dependencies...
pip install requests beautifulsoup4 openpyxl lxml selenium webdriver-manager
echo.
echo Done!
pause
goto end

:end
