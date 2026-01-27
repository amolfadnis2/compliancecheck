# Fix rupee symbol encoding in POSH files
$file = "C:\Users\amol.fadnis\compliancecheck\src\lib\assessments\posh\posh-compliance-questions.ts"
$content = Get-Content $file -Raw -Encoding UTF8
$content = $content -replace 'â‚¹', 'Rs.'
$content | Set-Content $file -NoNewline -Encoding UTF8
Write-Host "Fixed rupee symbols in posh-compliance-questions.ts"

# Also fix in rules file
$file2 = "C:\Users\amol.fadnis\compliancecheck\src\lib\assessments\posh\posh-compliance-rules.ts"
if (Test-Path $file2) {
    $content2 = Get-Content $file2 -Raw -Encoding UTF8
    $content2 = $content2 -replace 'â‚¹', 'Rs.'
    $content2 | Set-Content $file2 -NoNewline -Encoding UTF8
    Write-Host "Fixed rupee symbols in posh-compliance-rules.ts"
}

# Also fix in applicability file
$file3 = "C:\Users\amol.fadnis\compliancecheck\src\lib\assessments\posh\posh-applicability-questions.ts"
if (Test-Path $file3) {
    $content3 = Get-Content $file3 -Raw -Encoding UTF8
    $content3 = $content3 -replace 'â‚¹', 'Rs.'
    $content3 | Set-Content $file3 -NoNewline -Encoding UTF8
    Write-Host "Fixed rupee symbols in posh-applicability-questions.ts"
}

Write-Host "Done! Run: npm run build"
