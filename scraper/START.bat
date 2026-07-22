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
echo   [1] Quick Start - سحب سريع (64 شركة مؤكدة + Excel)
echo   [2] Google Maps Browser Scraper (200-500 شركة)
echo   [3] Google Maps Browser Scraper - Deep (500-2000 شركة)
echo   [4] Smart Puller - All Sectors (300-1000 شركة)
echo   [5] Mega Scraper - All Sources (500-5000 شركة)
echo   [6] Open CRM in Browser
echo   [7] Install Dependencies
echo   [0] Exit
echo.

set /p choice="Enter choice (1-7): "

if "%choice%"=="1" goto quick
if "%choice%"=="2" goto browser
if "%choice%"=="3" goto browser_deep
if "%choice%"=="4" goto smart
if "%choice%"=="5" goto mega
if "%choice%"=="6" goto crm
if "%choice%"=="7" goto deps
if "%choice%"=="0" goto end

:quick
echo.
echo [1/2] Collecting curated companies...
python -X utf8 collect_real_data.py --export-crm
echo.
echo [2/2] Done! Check scraper\output\ folder
echo.
pause
goto end

:browser
echo.
echo Starting Google Maps Browser Scraper (200 companies)...
echo This will open Chrome and scrape Google Maps automatically.
echo Press Ctrl+C to stop at any time - progress is saved.
echo.
python -X utf8 browser_scraper.py --headless --max 200
echo.
pause
goto end

:browser_deep
echo.
echo Starting DEEP Google Maps Scraper (2000 companies)...
echo This will take 30-60 minutes. Press Ctrl+C to stop - progress is saved.
echo.
python -X utf8 browser_scraper.py --headless --max 2000
echo.
pause
goto end

:smart
echo.
echo Starting Smart Puller - All Sectors...
echo This scrapes Google search results. Takes 20-40 minutes.
echo.
python -X utf8 smart_puller.py --deep
echo.
pause
goto end

:mega
echo.
echo Starting MEGA Scraper - All Sources...
echo This uses Yellow Pages + Google + Wuzzuf + EGX + more.
echo Takes 1-2 hours. Press Ctrl+C to stop - progress is saved.
echo.
python -X utf8 mega_scraper.py --max-companies 5000
echo.
pause
goto end

:crm
echo.
echo Opening CRM...
start http://localhost:8080
cd ..\crm
npx -y http-server . -p 8080 -c-1 --cors
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
