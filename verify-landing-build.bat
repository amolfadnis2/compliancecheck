@echo off
REM ComplianceCheck Landing Page - Build Verification Script (Windows)
REM Run this script to verify everything is set up correctly

echo.
echo ====================================================
echo ComplianceCheck Landing Page - Build Verification
echo ====================================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found
    echo Please run this script from your Next.js project root
    pause
    exit /b 1
)

echo [OK] Found package.json
echo.

REM Check for required files
echo Checking required files...
echo.

set "missing_files=0"

if exist "src\app\page.tsx" (
    echo [OK] src\app\page.tsx exists
) else (
    echo [MISSING] src\app\page.tsx
    set "missing_files=1"
)

if exist "src\app\layout.tsx" (
    echo [OK] src\app\layout.tsx exists
) else (
    echo [MISSING] src\app\layout.tsx
    set "missing_files=1"
)

if exist "src\app\globals.css" (
    echo [OK] src\app\globals.css exists
) else (
    echo [MISSING] src\app\globals.css
    set "missing_files=1"
)

if exist "tailwind.config.ts" (
    echo [OK] tailwind.config.ts exists
) else (
    echo [MISSING] tailwind.config.ts
    set "missing_files=1"
)

if %missing_files%==1 (
    echo.
    echo [WARNING] Some files are missing. Please copy them to your project.
    echo.
)

REM Check Node.js version
echo.
echo Checking Node.js version...
node -v
echo.

REM Check if node_modules exists
echo Checking dependencies...
if exist "node_modules" (
    echo [OK] node_modules exists
) else (
    echo [WARNING] node_modules not found. Run 'npm install'
)
echo.

REM Try to build
echo.
echo ====================================================
echo Attempting to build...
echo ====================================================
echo.

call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================
    echo [SUCCESS] BUILD SUCCESSFUL!
    echo ====================================================
    echo.
    echo Your landing page is ready to deploy!
    echo.
    echo Next steps:
    echo 1. Run 'npm run dev' to test locally
    echo 2. Visit http://localhost:3000
    echo 3. Deploy to Netlify when ready
    echo.
) else (
    echo.
    echo ====================================================
    echo [ERROR] BUILD FAILED
    echo ====================================================
    echo.
    echo Common fixes:
    echo 1. Delete .next and node_modules folders
    echo 2. Run: npm install
    echo 3. Run: npm run build
    echo.
)

pause
