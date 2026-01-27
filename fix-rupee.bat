@echo off
echo Fixing rupee symbol encoding in POSH files...
echo.
powershell -ExecutionPolicy Bypass -File fix-rupee-symbols.ps1
echo.
echo Testing build...
npm run build
pause
