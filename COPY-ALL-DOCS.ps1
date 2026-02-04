# ComplianceCheck - Copy All Documents Script
# This PowerShell script copies all 36 documents to one folder

Write-Host "ComplianceCheck Document Collector" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$targetFolder = "C:\Users\amol.fadnis\OneDrive - insightsoftware\Projects\ComplianceCheck\ALL-36-DOCUMENTS"

# Create target folder
New-Item -ItemType Directory -Path $targetFolder -Force | Out-Null
Write-Host "✓ Created folder: $targetFolder" -ForegroundColor Green
Write-Host ""

# Source 1: Your existing OneDrive folder (10 files)
$oneDriveSource = "C:\Users\amol.fadnis\OneDrive - insightsoftware\Projects\ComplianceCheck\Key Documents"

if (Test-Path $oneDriveSource) {
    Write-Host "Copying from OneDrive Key Documents folder..." -ForegroundColor Yellow
    Copy-Item "$oneDriveSource\*.md" $targetFolder -Force -ErrorAction SilentlyContinue
    $count1 = (Get-ChildItem $oneDriveSource -Filter *.md).Count
    Write-Host "  ✓ Copied $count1 files" -ForegroundColor Green
} else {
    Write-Host "  ✗ OneDrive source not found" -ForegroundColor Red
}

# Source 2: WSL project folder via \\wsl$ path (26 files)
$wslSource = "\\wsl$\Ubuntu\mnt\project"

if (Test-Path $wslSource) {
    Write-Host "Copying from WSL project folder..." -ForegroundColor Yellow
    
    $filesToCopy = @{
        "India_s_Four_Labor_Codes__SME_Compliance_Thresholds_and_Triggers.md" = "08-India-Labour-Codes-Reference.md"
        "DPDP_Act_2023_Compliance_Assessment__Complete_Framework_for_Indian_Businesses.md" = "09-DPDP-Act-2023-Framework.md"
        "Indian_Food_Business_Compliance__Complete_Regulatory_Framework.md" = "10-Food-Business-Compliance-Framework.md"
        "POSH_Act_2013_Compliance__A_Complete_Audit_Framework_for_Indian_Businesses.md" = "11-POSH-Act-2013-Framework.md"
        "state-wise-compliance-summary.md" = "12-State-Wise-Compliance-Summary.md"
        "ASSESSMENT_BASELINE_STANDARD.md" = "13-Assessment-Baseline-Standard.md"
        "NEW_ASSESSMENT_CHECKLIST.md" = "14-New-Assessment-Checklist.md"
        "TESTING_BEST_PRACTICES.md" = "15-Testing-Best-Practices.md"
        "TESTING_GUIDE.md" = "16-Testing-Guide.md"
        "ComplianceCheck_Configuration_Reference.md" = "17-Configuration-Reference.md"
        "compliancecheck-master-reference.md" = "18-Master-Development-Reference.md"
        "Comprehensive_SEO_Strategy_for_ComplianceCheck__Indian_Compliance_SaaS_for_SMEs.md" = "19-SEO-Strategy.md"
        "Premium_GCC_Compliance_Assessment_Opportunities_in_India__2025_Strategic_Analysis.md" = "20-Premium-GCC-Opportunities.md"
        "Indian_Compliance_SaaS__Five_High-Opportunity_Assessments_for_SMEs.md" = "21-Five-High-Opportunity-Assessments.md"
        "Building_an_Indian_CTC_to_In-Hand_Salary_Calculator__Complete_Technical_Reference.md" = "22-CTC-Calculator-Reference.md"
        "Building_a_Feature-Rich_PF_Contribution_Calculator_for_Indian_Compliance_SaaS.md" = "23-PF-Calculator-Reference.md"
        "free-employee-tools-recommendations.md" = "24-Free-Tools-Strategy.md"
        "Complete_Compliance_Landscape_for_Indian_Startups__A_State-Wise_Framework.md" = "25-Complete-Compliance-Landscape.md"
        "ACCESSIBILITY_FIXES_APPLIED.md" = "26-Accessibility-Fixes-Applied.md"
        "DOCS_INDEX.md" = "27-Documentation-Index.md"
        "compliancecheck-dev-summary.md" = "28-Development-Summary.md"
        "food-business-applicability-summary.md" = "30-Food-Business-Applicability-Summary.md"
        "food-business-questions-summary.md" = "31-Food-Business-Questions-Summary.md"
        "posh-applicability-summary.md" = "32-POSH-Applicability-Summary.md"
        "posh-compliance-questions-summary.md" = "33-POSH-Questions-Summary.md"
        "SEO_Strategy_for_Indian_Labour_Compliance_SaaS__A_Timely_Opportunity.md" = "34-SEO-Labour-Compliance-Opportunity.md"
    }
    
    $copied2 = 0
    foreach ($file in $filesToCopy.GetEnumerator()) {
        $srcPath = Join-Path $wslSource $file.Key
        $dstPath = Join-Path $targetFolder $file.Value
        
        if (Test-Path $srcPath) {
            Copy-Item $srcPath $dstPath -Force -ErrorAction SilentlyContinue
            $copied2++
        }
    }
    Write-Host "  ✓ Copied $copied2 files from project" -ForegroundColor Green
} else {
    Write-Host "  ✗ WSL source not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
$totalFiles = (Get-ChildItem $targetFolder -Filter *.md).Count
Write-Host "COMPLETE! Total documents: $totalFiles" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Location: $targetFolder" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Open this folder in File Explorer and review all documents"
Write-Host ""
pause
EOFPS

ls -lh copy-all-docs-simple.ps1
echo ""
echo "✓ Script created successfully!"
echo ""
echo "================================"
echo "TO GET ALL 36 DOCUMENTS:"
echo "================================"
echo "1. Open PowerShell"
echo "2. Run: cd C:\\Users\\amol.fadnis\\compliancecheck"
echo "3. Run: .\\copy-all-docs-simple.ps1"
echo ""
echo "All documents will be in:"
echo "C:\\Users\\amol.fadnis\\compliancecheck\\ALL-COMPLIANCECHECK-DOCS"
