# 🔧 Manual Auto-Deployment Setup

Since the automated setup encountered some issues, here's how to set up auto-deployment manually:

## 📋 Your Project Information

I've extracted your Vercel project information:

- **Project ID**: `prj_VUKRdJbiWfPDPJC7YDiQzB2zOVH6`
- **Org ID**: `team_U8Acnx7OJfROYdDa953NuRz0`
- **Vercel Token**: `oNKbu7aWigiUabXfMkmWQkoo`

## 🎯 Step-by-Step Setup

### 1. Set GitHub Secrets

Go to your GitHub repository and set up these secrets:

1. **Navigate to your repository** on GitHub
2. **Go to**: Settings → Secrets and variables → Actions
3. **Click**: "New repository secret"
4. **Add these three secrets**:

#### Secret 1: VERCEL_TOKEN
- **Name**: `VERCEL_TOKEN`
- **Value**: `oNKbu7aWigiUabXfMkmWQkoo`

#### Secret 2: VERCEL_PROJECT_ID
- **Name**: `VERCEL_PROJECT_ID`
- **Value**: `prj_VUKRdJbiWfPDPJC7YDiQzB2zOVH6`

#### Secret 3: VERCEL_ORG_ID
- **Name**: `VERCEL_ORG_ID`  
- **Value**: `team_U8Acnx7OJfROYdDa953NuRz0`

### 2. Verify the Workflow File

Make sure you have the deployment workflow file at:
`.github/workflows/deploy.yml`

This file should already be created and ready to go!

### 3. Test Your Setup

Once you've added the secrets:

```bash
git add .
git commit -m "feat: trigger auto-deployment"
git push origin main
```

### 4. Monitor the Deployment

- Go to your GitHub repository
- Click on the **Actions** tab
- You should see the "Auto Deploy to Vercel" workflow running
- Click on it to see the progress

## ✅ What Happens Next

Every time you push to the `main` branch:

1. ✅ GitHub Actions automatically triggers
2. ✅ Installs dependencies and builds your project
3. ✅ Deploys to Vercel production
4. ✅ Runs health checks to verify deployment
5. ✅ Shows success/failure status

## 🚨 Security Note

⚠️ **Important**: After setting up, consider regenerating your Vercel token for security:

1. Go to: https://vercel.com/account/tokens
2. Delete the current token
3. Create a new one
4. Update the `VERCEL_TOKEN` secret in GitHub

## 🔄 Alternative: Using GitHub CLI Later

If you want to install GitHub CLI later for easier secret management:

1. **Download from**: https://cli.github.com/
2. **Or run as Administrator**:
   ```powershell
   # Run PowerShell as Administrator
   Set-ExecutionPolicy Bypass -Scope Process -Force
   iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
   choco install gh -y
   ```

3. **Then use CLI to set secrets**:
   ```bash
   gh auth login
   echo "oNKbu7aWigiUabXfMkmWQkoo" | gh secret set VERCEL_TOKEN
   echo "prj_VUKRdJbiWfPDPJC7YDiQzB2zOVH6" | gh secret set VERCEL_PROJECT_ID
   echo "team_U8Acnx7OJfROYdDa953NuRz0" | gh secret set VERCEL_ORG_ID
   ```

## 🎉 You're All Set!

Once the GitHub secrets are configured:

- **No more manual deployments needed!** 
- **Just push to main and it deploys automatically**
- **Monitor deployments in GitHub Actions**
- **Health checks ensure your app is working**

---

**Next**: Go set up those GitHub secrets and test it out! 🚀