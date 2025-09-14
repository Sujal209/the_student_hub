# Setup Script for Vercel Auto-Deployment
# This script helps you configure automatic deployment when pushing to main branch

Write-Host "🚀 Setting up Vercel Auto-Deployment" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: This directory is not a Git repository" -ForegroundColor Red
    exit 1
}

# Check if GitHub CLI is installed
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghInstalled) {
    Write-Host "⚠️ GitHub CLI (gh) is not installed" -ForegroundColor Yellow
    Write-Host "Please install it from: https://cli.github.com/" -ForegroundColor Yellow
    Write-Host "Or run: winget install GitHub.CLI" -ForegroundColor Yellow
    exit 1
}

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel@latest
}

Write-Host ""
Write-Host "📋 To enable auto-deployment, you need to set up these GitHub secrets:" -ForegroundColor Cyan
Write-Host ""

# Get Vercel token
Write-Host "1️⃣ Getting your Vercel Token..." -ForegroundColor Yellow
Write-Host "   - Go to: https://vercel.com/account/tokens" -ForegroundColor Gray
Write-Host "   - Create a new token with full access" -ForegroundColor Gray
Write-Host "   - Copy the token" -ForegroundColor Gray
Write-Host ""

$vercelToken = Read-Host "   Paste your Vercel Token here"

if ([string]::IsNullOrEmpty($vercelToken)) {
    Write-Host "❌ Vercel token is required" -ForegroundColor Red
    exit 1
}

# Get project information
Write-Host ""
Write-Host "2️⃣ Getting your Vercel Project Information..." -ForegroundColor Yellow

# Try to get project info from vercel.json or .vercel folder
$projectId = ""
$orgId = ""

if (Test-Path ".vercel/project.json") {
    $projectInfo = Get-Content ".vercel/project.json" | ConvertFrom-Json
    $projectId = $projectInfo.projectId
    $orgId = $projectInfo.orgId
    Write-Host "   ✅ Found project info in .vercel/project.json" -ForegroundColor Green
} else {
    Write-Host "   - Link your project first by running: vercel link" -ForegroundColor Gray
    Write-Host "   - Or get these values from your Vercel dashboard" -ForegroundColor Gray
    Write-Host ""
    
    $projectId = Read-Host "   Enter your Vercel Project ID"
    $orgId = Read-Host "   Enter your Vercel Org ID"
}

if ([string]::IsNullOrEmpty($projectId) -or [string]::IsNullOrEmpty($orgId)) {
    Write-Host "❌ Project ID and Org ID are required" -ForegroundColor Red
    exit 1
}

# Set GitHub secrets
Write-Host ""
Write-Host "3️⃣ Setting up GitHub secrets..." -ForegroundColor Yellow

try {
    # Check if user is logged in to GitHub CLI
    gh auth status | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   Please login to GitHub CLI first:" -ForegroundColor Gray
        Write-Host "   gh auth login" -ForegroundColor Gray
        exit 1
    }

    # Set the secrets
    Write-Host "   Setting VERCEL_TOKEN..." -ForegroundColor Gray
    $vercelToken | gh secret set VERCEL_TOKEN

    Write-Host "   Setting VERCEL_PROJECT_ID..." -ForegroundColor Gray
    $projectId | gh secret set VERCEL_PROJECT_ID

    Write-Host "   Setting VERCEL_ORG_ID..." -ForegroundColor Gray
    $orgId | gh secret set VERCEL_ORG_ID

    Write-Host "   ✅ GitHub secrets configured successfully!" -ForegroundColor Green

} catch {
    Write-Host "   ❌ Failed to set GitHub secrets: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "   You can set them manually in your GitHub repository:" -ForegroundColor Yellow
    Write-Host "   - Go to: Settings > Secrets and variables > Actions" -ForegroundColor Gray
    Write-Host "   - Add these secrets:" -ForegroundColor Gray
    Write-Host "     VERCEL_TOKEN: $vercelToken" -ForegroundColor Gray
    Write-Host "     VERCEL_PROJECT_ID: $projectId" -ForegroundColor Gray
    Write-Host "     VERCEL_ORG_ID: $orgId" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Auto-deployment is now configured!" -ForegroundColor Green
Write-Host "✅ Every push to 'main' branch will automatically deploy to Vercel" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Make a change to your code" -ForegroundColor Gray
Write-Host "   2. Commit and push to main branch:" -ForegroundColor Gray
Write-Host "      git add ." -ForegroundColor White
Write-Host "      git commit -m \"feat: trigger auto-deployment\"" -ForegroundColor White
Write-Host "      git push origin main" -ForegroundColor White
Write-Host "   3. Check the Actions tab in your GitHub repository" -ForegroundColor Gray
Write-Host "   4. Your site will be automatically deployed! 🚀" -ForegroundColor Gray
Write-Host ""
Write-Host "⚡ No more manual 'vercel --prod' commands needed!" -ForegroundColor Yellow