@echo off
REM POSH Assessment ESLint Fix Script
REM Fixes all ESLint errors automatically

echo ========================================
echo POSH Assessment ESLint Fix Script
echo ========================================
echo.

cd C:\Users\amol.fadnis\compliancecheck

echo Running PowerShell fix script...
echo.

powershell.exe -ExecutionPolicy Bypass -File fix-posh-eslint.ps1

if %ERRORLEVEL% == 0 (
    echo.
    echo ========================================
    echo Fix script completed successfully!
    echo ========================================
    echo.
    echo Now testing build...
    echo.
    call npm run build
) else (
    echo.
    echo ========================================
    echo Fix script encountered errors
    echo ========================================
    echo.
    echo Please check the output above
)

pause
