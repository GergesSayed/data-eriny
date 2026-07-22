@echo off
cd /d "%~dp0"
cd scraper
start "" python -X utf8 server.py 8888
timeout /t 2 >nul
start "" "http://localhost:8888/"
exit
