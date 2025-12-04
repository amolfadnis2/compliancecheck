@echo off
REM ComplianceCheck - Playwright Test Setup Script

echo ============================================
echo ComplianceCheck Playwright Test Setup
echo ============================================
echo.

echo [1/3] Installing Playwright...
call npm install -D @playwright/test @axe-core/playwright
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies
    exit /b 1
)
echo Done!
echo.

echo [2/3] Installing browsers (Chrome, Firefox, Safari)...
echo This will download ~300MB, please wait...
call npx playwright install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install browsers
    exit /b 1
)
echo Done!
echo.

echo [3/3] Running first test...
call npx playwright test --grep "should load homepage" --project=chromium
echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo NEXT STEPS:
echo.
echo 1. Run all tests:
echo    npx playwright test
echo.
echo 2. Run with visual UI:
echo    npx playwright test --ui
echo.
echo 3. View test report:
echo    npx playwright show-report
echo.
pause
