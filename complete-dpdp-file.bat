@echo off
echo.
echo ===============================================
echo   DPDP Test File Completion Script
echo ===============================================
echo.
echo This will complete the dpdp-assessment.spec.ts file
echo Current file is incomplete (only ~300 lines of 1128)
echo.
pause

powershell -Command "& {
    Write-Host 'Copying complete file from project knowledge...' -ForegroundColor Cyan
    
    # The file location in /mnt/project
    $sourceFile = '/mnt/project/dpdp-assessment.spec.ts'
    $destFile = 'C:\Users\amol.fadnis\compliancecheck\tests\dpdp-assessment.spec.ts'
    
    if (Test-Path $sourceFile) {
        Copy-Item -Path $sourceFile -Destination $destFile -Force
        Write-Host 'File copied successfully!' -ForegroundColor Green
        Write-Host ''
        Write-Host 'Verifying file size...' -ForegroundColor Yellow
        $fileInfo = Get-Item $destFile
        Write-Host ('File size: {0:N0} bytes ({1:N0} KB)' -f $fileInfo.Length, ($fileInfo.Length/1KB)) -ForegroundColor White
        Write-Host ''
        
        if ($fileInfo.Length -gt 40000) {
            Write-Host 'SUCCESS! File is complete.' -ForegroundColor Green
        } else {
            Write-Host 'WARNING: File may still be incomplete.' -ForegroundColor Yellow
        }
    } else {
        Write-Host 'ERROR: Source file not found in project directory' -ForegroundColor Red
        Write-Host 'The file should be downloaded from Claude outputs' -ForegroundColor Yellow
    }
}"

echo.
echo ===============================================
pause
