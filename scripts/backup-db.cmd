@echo off
setlocal
cd /d "%~dp0.."
if not exist logs mkdir logs
echo ---- %date% %time% ---- >> logs\backup-db.log
"C:\Program Files\nodejs\node.exe" scripts\backup-db.mjs >> logs\backup-db.log 2>&1
echo Exit code: %errorlevel% >> logs\backup-db.log
endlocal
