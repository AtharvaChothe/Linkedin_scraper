@echo off
echo Installing required packages (this is quick if already installed)...
pip install flask selenium webdriver-manager openpyxl
echo.
echo Starting the LinkedIn Scraper Web Server...
echo 👉 Please open http://127.0.0.1:3000 in your browser!
echo.
python app.py
pause