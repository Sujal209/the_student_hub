# 🔧 Vercel Environment Variables Setup

## Required Environment Variables

Add these in your Vercel project settings → Environment Variables:

### 🔑 **Supabase Configuration** (REQUIRED)
```
NEXT_PUBLIC_SUPABASE_URL=https://xejypgqugfzhdfttibkz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-dashboard
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-dashboard
```

### 📱 **App Configuration**
```
NEXT_PUBLIC_APP_NAME=Student Notes Hub
NEXT_PUBLIC_APP_DESCRIPTION=A college-specific notes sharing platform
NEXT_PUBLIC_COLLEGE_NAME=Your College Name
NEXT_PUBLIC_COLLEGE_DOMAIN=your-college.edu
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

### 🎨 **Branding**
```
NEXT_PUBLIC_BRAND_PRIMARY_COLOR=220 200 100
NEXT_PUBLIC_BRAND_SECONDARY_COLOR=220 220 220
NEXT_PUBLIC_BRAND_LOGO_URL=
```

### 📁 **File Upload**
```
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=pdf,docx,pptx,jpg,jpeg,png,gif
```

### 🔒 **Security**
```
NEXTAUTH_SECRET=generate-random-secret-for-production
NEXTAUTH_URL=https://your-app.vercel.app
```

### 🗄️ **Storage**
```
SUPABASE_STORAGE_BUCKET=student-notes
```

### 🏗️ **Build**
```
NODE_ENV=production
```

## 📋 **How to Add in Vercel:**

1. Go to your project in Vercel dashboard
2. Click "Settings" tab
3. Click "Environment Variables" in sidebar
4. For each variable:
   - Name: Variable name (e.g., NEXT_PUBLIC_SUPABASE_URL)
   - Value: Your actual value
   - Environment: Production (or All)
5. Click "Save"

## 🔍 **Where to Find Supabase Keys:**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → NEXT_PUBLIC_SUPABASE_URL  
   - anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role secret → SUPABASE_SERVICE_ROLE_KEY

⚠️ **IMPORTANT**: Keep service_role key secret!