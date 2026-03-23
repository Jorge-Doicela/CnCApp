@echo off
set "SCRIPT_PATH=%cd%\prisma\verify_db.js"
set "LOG_PATH=%cd%\prisma\verify-result.txt"
echo Running verification script... > "%LOG_PATH%"
node "%SCRIPT_PATH%" >> "%LOG_PATH%" 2>&1
echo Finished. >> "%LOG_PATH%"
