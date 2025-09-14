#!/bin/bash

# Student Notes Hub - Instance Deployment Script
# This script helps deploy a new instance for a college

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
PROJECT_NAME=""
COLLEGE_NAME=""
COLLEGE_DOMAIN=""
VERCEL_DEPLOY=false
SUPABASE_PROJECT_REF=""

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Deploy a new Student Notes Hub instance for a college"
    echo ""
    echo "Options:"
    echo "  -n, --name          Project name (e.g., 'stanford-notes')"
    echo "  -c, --college       College name (e.g., 'Stanford University')"
    echo "  -d, --domain        College domain (e.g., 'stanford.edu')"
    echo "  -p, --project       Supabase project reference"
    echo "  -v, --vercel        Deploy to Vercel after setup"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 -n stanford-notes -c 'Stanford University' -d stanford.edu -p abcdef123456"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--name)
            PROJECT_NAME="$2"
            shift 2
            ;;
        -c|--college)
            COLLEGE_NAME="$2"
            shift 2
            ;;
        -d|--domain)
            COLLEGE_DOMAIN="$2"
            shift 2
            ;;
        -p|--project)
            SUPABASE_PROJECT_REF="$2"
            shift 2
            ;;
        -v|--vercel)
            VERCEL_DEPLOY=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Interactive input if parameters not provided
if [ -z "$PROJECT_NAME" ]; then
    read -p "Enter project name (e.g., 'stanford-notes'): " PROJECT_NAME
fi

if [ -z "$COLLEGE_NAME" ]; then
    read -p "Enter college name (e.g., 'Stanford University'): " COLLEGE_NAME
fi

if [ -z "$COLLEGE_DOMAIN" ]; then
    read -p "Enter college domain (e.g., 'stanford.edu'): " COLLEGE_DOMAIN
fi

if [ -z "$SUPABASE_PROJECT_REF" ]; then
    read -p "Enter Supabase project reference (leave empty to create new): " SUPABASE_PROJECT_REF
fi

# Validate inputs
if [ -z "$PROJECT_NAME" ] || [ -z "$COLLEGE_NAME" ] || [ -z "$COLLEGE_DOMAIN" ]; then
    print_error "Missing required parameters"
    show_help
    exit 1
fi

print_status "Starting deployment for $COLLEGE_NAME ($COLLEGE_DOMAIN)"

# Check required tools
print_status "Checking required tools..."

if ! command_exists "node"; then
    print_error "Node.js is not installed"
    exit 1
fi

if ! command_exists "npm"; then
    print_error "npm is not installed"
    exit 1
fi

print_success "Node.js and npm are available"

# Check optional tools
if command_exists "supabase"; then
    print_success "Supabase CLI is available"
    SUPABASE_CLI_AVAILABLE=true
else
    print_warning "Supabase CLI not found. Install with: npm install -g supabase"
    SUPABASE_CLI_AVAILABLE=false
fi

if command_exists "vercel"; then
    print_success "Vercel CLI is available"
    VERCEL_CLI_AVAILABLE=true
else
    print_warning "Vercel CLI not found. Install with: npm install -g vercel"
    VERCEL_CLI_AVAILABLE=false
fi

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
fi

# Create environment file
print_status "Creating environment configuration..."

if [ -f ".env.local" ]; then
    cp .env.local .env.local.backup
    print_warning "Backed up existing .env.local"
fi

cp .env.example .env.local

# Update environment variables
sed -i.bak "s/NEXT_PUBLIC_APP_NAME=.*/NEXT_PUBLIC_APP_NAME=Student Notes Hub/" .env.local
sed -i.bak "s/NEXT_PUBLIC_COLLEGE_NAME=.*/NEXT_PUBLIC_COLLEGE_NAME=$COLLEGE_NAME/" .env.local
sed -i.bak "s/NEXT_PUBLIC_COLLEGE_DOMAIN=.*/NEXT_PUBLIC_COLLEGE_DOMAIN=$COLLEGE_DOMAIN/" .env.local

# Handle Supabase project
if [ -n "$SUPABASE_PROJECT_REF" ]; then
    print_status "Using existing Supabase project: $SUPABASE_PROJECT_REF"
    SUPABASE_URL="https://$SUPABASE_PROJECT_REF.supabase.co"
    sed -i.bak "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|" .env.local
    
    print_warning "Please manually update NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in .env.local"
else
    if [ "$SUPABASE_CLI_AVAILABLE" = true ]; then
        print_status "Creating new Supabase project..."
        print_warning "Please run 'supabase projects create $PROJECT_NAME' manually and update .env.local"
    else
        print_warning "Please create a new Supabase project manually at https://supabase.com/dashboard"
        print_warning "Then update NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    fi
fi

# Clean up sed backup files
rm -f .env.local.bak

print_success "Environment configuration created"

# Database setup instructions
print_status "Database Setup Instructions:"
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to the SQL Editor"
echo "3. Run the schema file: db/schema.sql"
echo "4. Run the seed data: db/seeds/initial_data.sql"
echo "5. Update the college_configs table with your college information"
echo ""
echo "Or run these commands if you have Supabase CLI configured:"
echo "  supabase db push"
echo "  supabase db seed"

# Storage bucket setup
print_status "Storage Setup Instructions:"
echo "1. Go to Storage in your Supabase dashboard"
echo "2. Create a bucket named 'student-notes'"
echo "3. Set the bucket to private"
echo "4. Configure the storage policies as defined in the schema"

# Build and test
print_status "Building the application..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build successful"
else
    print_error "Build failed"
    exit 1
fi

# Vercel deployment
if [ "$VERCEL_DEPLOY" = true ]; then
    if [ "$VERCEL_CLI_AVAILABLE" = true ]; then
        print_status "Deploying to Vercel..."
        
        # Login check
        if ! vercel whoami >/dev/null 2>&1; then
            print_status "Please login to Vercel"
            vercel login
        fi
        
        # Deploy
        vercel --prod
        
        if [ $? -eq 0 ]; then
            print_success "Deployed to Vercel successfully"
            print_status "Don't forget to configure your domain and environment variables in Vercel dashboard"
        else
            print_error "Vercel deployment failed"
        fi
    else
        print_warning "Vercel CLI not available. Deploy manually at https://vercel.com"
    fi
fi

# Final instructions
print_success "Deployment setup completed!"
echo ""
print_status "Next steps:"
echo "1. Complete the database setup (see instructions above)"
echo "2. Update .env.local with your Supabase keys"
echo "3. Configure your domain in Vercel (if using Vercel)"
echo "4. Set up SSL certificate for your domain"
echo "5. Test the application with your college email"
echo ""
print_status "For local development, run:"
echo "  npm run dev"
echo ""
print_status "For production deployment, run:"
echo "  npm run build && npm start"
echo ""
print_status "For more help, check the README.md file"

# Create deployment log
echo "Deployment completed at $(date)" > deployment.log
echo "Project: $PROJECT_NAME" >> deployment.log
echo "College: $COLLEGE_NAME" >> deployment.log
echo "Domain: $COLLEGE_DOMAIN" >> deployment.log
echo "Supabase Project: ${SUPABASE_PROJECT_REF:-'New project needed'}" >> deployment.log

print_success "Deployment log saved to deployment.log"