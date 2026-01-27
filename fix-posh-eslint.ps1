#!/usr/bin/env pwsh
# Fix all ESLint errors in POSH assessment files

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "POSH Assessment ESLint Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "C:\Users\amol.fadnis\compliancecheck"
Set-Location $projectRoot

# ============================================================================
# Fix 1: src/app/assessment/posh/page.tsx
# ============================================================================

Write-Host "Fixing: src/app/assessment/posh/page.tsx..." -ForegroundColor Yellow

$pageFile = "src\app\assessment\posh\page.tsx"
$content = Get-Content $pageFile -Raw

# Remove unused imports from Card components
Write-Host "  - Removing unused Card imports..."
$content = $content -replace "import \{ Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter \} from", "import { Card, CardContent, CardDescription, CardHeader, CardTitle } from"

# Remove Select components import (not used)
Write-Host "  - Removing Select components import..."
$content = $content -replace "import \{ Select, SelectContent, SelectItem, SelectTrigger, SelectValue \} from '@/components/ui/select';\r?\n", ""

# Remove Users icon from lucide-react
Write-Host "  - Removing unused lucide icons..."
$content = $content -replace ",\s*Users,", ","

# Remove unused imports from posh-applicability-questions
Write-Host "  - Removing unused applicability imports..."
$content = $content -replace "  HIGH_RISK_INDUSTRIES,\r?\n", ""
$content = $content -replace "  ICC_REGISTRATION_STATES,\r?\n", ""
$content = $content -replace "  type ApplicabilityQuestion,\r?\n", ""

# Remove COMPLIANCE_STATUS_INFO from posh-compliance-questions import
Write-Host "  - Removing unused compliance imports..."
$content = $content -replace "  COMPLIANCE_STATUS_INFO,\r?\n", ""

# Remove entire POSH_COMPLIANCE_RULES import block
Write-Host "  - Removing unused compliance rules import..."
$content = $content -replace "import \{\r?\n  POSH_COMPLIANCE_RULES,\r?\n  getRuleByQuestionId,\r?\n  type POSHComplianceRule\r?\n\} from '@/lib/assessments/posh/posh-compliance-rules';\r?\n", ""
$content = $content -replace "import \{\r?\n  getRuleByQuestionId,\r?\n\} from '@/lib/assessments/posh/posh-compliance-rules';\r?\n", ""

# Delete unused constants (EMPLOYEE_COUNT_OPTIONS, INDUSTRY_OPTIONS, STATE_OPTIONS)
Write-Host "  - Removing unused constant arrays..."

# Find and remove EMPLOYEE_COUNT_OPTIONS array
$content = $content -replace "const EMPLOYEE_COUNT_OPTIONS = \[[^\]]*\]\r?\n\r?\n", ""

# Find and remove INDUSTRY_OPTIONS array  
$content = $content -replace "const INDUSTRY_OPTIONS = \[[^\]]*?\](\r?\n)+", ""

# Find and remove STATE_OPTIONS array
$content = $content -replace "const STATE_OPTIONS = \[[\s\S]*?\{ value: 'other_ut', label: 'Other Union Territory' \},\r?\n\]\r?\n", ""

# Remove getRiskLevelBgColor function
Write-Host "  - Removing unused helper functions..."
$content = $content -replace "const getRiskLevelBgColor[^\}]*\}\r?\n\r?\n", ""

# Fix useForm destructuring - remove unused setValue and watch
Write-Host "  - Fixing useForm destructuring..."
$content = $content -replace "const \{ register, handleSubmit, formState: \{ errors \}, setValue, watch \}", "const { register, handleSubmit, formState: { errors } }"

# Fix explicit any type
Write-Host "  - Fixing explicit any types..."
$content = $content -replace "\(e: any\)", "(e: React.ChangeEvent<HTMLInputElement>)"
$content = $content -replace "\(event: any\)", "(event: React.ChangeEvent<HTMLSelectElement>)"

# Fix wrong function name import
Write-Host "  - Fixing function import name..."
$content = $content -replace "determinePOSHAssessmentProfile", "generatePOSHAssessmentProfile"

# Also fix all calls to this function throughout the file
$content = $content -replace "const profile = determinePOSHAssessmentProfile", "const profile = generatePOSHAssessmentProfile"
$content = $content -replace "= determinePOSHAssessmentProfile\(", "= generatePOSHAssessmentProfile("

# Save fixed content
$content | Set-Content $pageFile -NoNewline
Write-Host "  ✓ Fixed!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Fix 2: src/lib/assessments/posh/posh-compliance-questions.ts
# ============================================================================

Write-Host "Fixing: src/lib/assessments/posh/posh-compliance-questions.ts..." -ForegroundColor Yellow

$questionsFile = "src\lib\assessments\posh\posh-compliance-questions.ts"
$content = Get-Content $questionsFile -Raw

# Fix: Remove unused parameter 'companyDetails' from filterPOSHQuestions
Write-Host "  - Removing unused parameter..."
$content = $content -replace "export function filterPOSHQuestions\(\r?\n  applicabilityCodes: string\[\],\r?\n  companyDetails: Partial<POSHCompanyDetails>\r?\n\)", "export function filterPOSHQuestions(
  applicabilityCodes: string[]
)"

# Fix: Remove unused variable 'isPartiallyCompliant'
Write-Host "  - Removing unused variables..."
$content = $content -replace "    let isPartiallyCompliant = false;\r?\n", ""
$content = $content -replace "      isPartiallyCompliant = true;\r?\n", ""

# Save fixed content
$content | Set-Content $questionsFile -NoNewline
Write-Host "  ✓ Fixed!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Test Build
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Build..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Build completed" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run database migration: supabase db push"
    Write-Host "2. Test locally: npm run dev"
    Write-Host "3. Run tests: npm test"
    Write-Host "4. Deploy: git add . ; git commit ; git push"
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Build still has errors" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the error output above for remaining issues."
}
