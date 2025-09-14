#!/bin/bash

# Setup Script for Vercel Auto-Deployment
# This script helps you configure automatic deployment when pushing to main branch

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up Vercel Auto-Deployment${NC}"
echo -e "${GREEN}=====================================${NC}"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: This directory is not a Git repository${NC}"
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️ GitHub CLI (gh) is not installed${NC}"
    echo -e "${YELLOW}Please install it from: https://cli.github.com/${NC}"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel@latest
fi

echo ""
echo -e "${CYAN}📋 To enable auto-deployment, you need to set up these GitHub secrets:${NC}"
echo ""

# Get Vercel token
echo -e "${YELLOW}1️⃣ Getting your Vercel Token...${NC}"
echo -e "   - Go to: https://vercel.com/account/tokens"
echo -e "   - Create a new token with full access"
echo -e "   - Copy the token"
echo ""

read -p "   Paste your Vercel Token here: " vercel_token

if [ -z "$vercel_token" ]; then
    echo -e "${RED}❌ Vercel token is required${NC}"
    exit 1
fi

# Get project information
echo ""
echo -e "${YELLOW}2️⃣ Getting your Vercel Project Information...${NC}"

project_id=""
org_id=""

# Try to get project info from .vercel folder
if [ -f ".vercel/project.json" ]; then
    project_id=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
    org_id=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*' | cut -d'"' -f4)
    echo -e "   ${GREEN}✅ Found project info in .vercel/project.json${NC}"
else
    echo -e "   - Link your project first by running: ${BLUE}vercel link${NC}"
    echo -e "   - Or get these values from your Vercel dashboard"
    echo ""
    
    read -p "   Enter your Vercel Project ID: " project_id
    read -p "   Enter your Vercel Org ID: " org_id
fi

if [ -z "$project_id" ] || [ -z "$org_id" ]; then
    echo -e "${RED}❌ Project ID and Org ID are required${NC}"
    exit 1
fi

# Set GitHub secrets
echo ""
echo -e "${YELLOW}3️⃣ Setting up GitHub secrets...${NC}"

# Check if user is logged in to GitHub CLI
if ! gh auth status &> /dev/null; then
    echo -e "   Please login to GitHub CLI first:"
    echo -e "   ${BLUE}gh auth login${NC}"
    exit 1
fi

# Set the secrets
echo -e "   Setting VERCEL_TOKEN..."
echo "$vercel_token" | gh secret set VERCEL_TOKEN

echo -e "   Setting VERCEL_PROJECT_ID..."
echo "$project_id" | gh secret set VERCEL_PROJECT_ID

echo -e "   Setting VERCEL_ORG_ID..."
echo "$org_id" | gh secret set VERCEL_ORG_ID

echo -e "   ${GREEN}✅ GitHub secrets configured successfully!${NC}"

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo -e "${GREEN}==================${NC}"
echo ""
echo -e "${GREEN}✅ Auto-deployment is now configured!${NC}"
echo -e "${GREEN}✅ Every push to 'main' branch will automatically deploy to Vercel${NC}"
echo ""
echo -e "${CYAN}📝 Next steps:${NC}"
echo -e "   1. Make a change to your code"
echo -e "   2. Commit and push to main branch:"
echo -e "      ${BLUE}git add .${NC}"
echo -e "      ${BLUE}git commit -m \"feat: trigger auto-deployment\"${NC}"
echo -e "      ${BLUE}git push origin main${NC}"
echo -e "   3. Check the Actions tab in your GitHub repository"
echo -e "   4. Your site will be automatically deployed! 🚀"
echo ""
echo -e "${YELLOW}⚡ No more manual 'vercel --prod' commands needed!${NC}"