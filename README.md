# Student Notes Hub

A production-ready, college-specific notes sharing platform built with Next.js, TypeScript, Supabase, and Tailwind CSS. Each deployment serves a single college with isolated data and custom branding.

## 🌟 Features

- **Authentication**: Google OAuth + Email/Password with college email verification
- **File Management**: Upload, preview, and download study notes (PDF, DOCX, PPTX, images)
- **Search & Filter**: Full-text search with filters by subject, semester, tags, and year
- **College Branding**: Customizable colors, logos, and themes per college
- **Admin Panel**: Content moderation, user management, and analytics
- **Responsive Design**: Mobile-first UI with accessibility support
- **Security**: Row-level security, file validation, and signed URLs

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI Components**: Radix UI, shadcn/ui
- **File Handling**: React Dropzone, React PDF
- **Deployment**: Vercel (recommended)
- **Testing**: Jest, React Testing Library

## 📁 Project Structure

```
student-notes-hub/
├── app/                    # Next.js 13+ app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── auth/             # Authentication components  
│   ├── dashboard/        # Dashboard components
│   └── upload/           # File upload components
├── lib/                  # Utility libraries
│   ├── supabaseClient.ts # Supabase configuration
│   ├── auth.ts           # Auth utilities
│   └── utils.ts          # Helper functions
├── types/                # TypeScript type definitions
├── db/                   # Database schema and seeds
├── scripts/              # Deployment and utility scripts
├── docs/                 # Documentation
└── public/               # Static assets
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- Supabase account
- Vercel account (for deployment)

### Local Development Setup

1. **Clone and install dependencies**:
```bash
git clone <repository-url> college-notes
cd college-notes
npm install
```

2. **Environment setup**:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Supabase setup**:
   - Create a new Supabase project at https://supabase.com/dashboard
   - Copy your project URL and anon key to `.env.local`
   - Run the database schema in SQL Editor: `db/schema.sql`
   - Run the seed data: `db/seeds/initial_data.sql`
   - Create storage bucket named 'student-notes' (private)

4. **Start development server**:
```bash
npm run dev
```

Visit `http://localhost:3000` to see your application.

### Production Deployment

Use the automated deployment script:

```bash
# Make script executable
chmod +x scripts/deploy_instance.sh

# Deploy new instance
./scripts/deploy_instance.sh -n "stanford-notes" -c "Stanford University" -d "stanford.edu" -v
```

Or deploy manually:
1. Set up Supabase project and database
2. Configure environment variables in Vercel
3. Deploy to Vercel: `vercel --prod`

## 🗄️ Database Setup

### 1. Run Schema

Execute `db/schema.sql` in your Supabase SQL Editor to create:
- User profiles and authentication
- Notes and subjects tables
- Download tracking and ratings
- Row-level security policies
- Full-text search functions

### 2. Run Seed Data

Execute `db/seeds/initial_data.sql` to add:
- Sample college configurations
- Common academic subjects
- Helper functions for search and analytics

### 3. Configure Storage

1. Create bucket named `student-notes` (private)
2. Set up storage policies for file access
3. Configure file upload limits (10MB default)

## ⚙️ Environment Variables

### Required Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# College Branding
NEXT_PUBLIC_COLLEGE_NAME=Your College Name
NEXT_PUBLIC_COLLEGE_DOMAIN=college.edu
NEXT_PUBLIC_APP_NAME=Student Notes Hub

# File Upload Settings
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=pdf,docx,pptx,jpg,jpeg,png,gif
```

### Optional Variables

```bash
# Branding
NEXT_PUBLIC_BRAND_PRIMARY_COLOR=220 200 100
NEXT_PUBLIC_BRAND_LOGO_URL=/images/logo.png

# Admin Settings
ADMIN_EMAIL=admin@college.edu

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 🎨 Customization

### Brand Colors

Update brand colors in `.env.local`:
```bash
NEXT_PUBLIC_BRAND_PRIMARY_COLOR=220 200 100  # HSL values
```

Or customize in `app/globals.css`:
```css
:root {
  --brand-500: 220 150 100; /* Your primary color */
}
```

### College Logo

1. Add logo to `public/images/`
2. Update `NEXT_PUBLIC_BRAND_LOGO_URL` in `.env.local`

### Custom Styling

- Modify `tailwind.config.js` for theme changes
- Update `app/globals.css` for global styles
- Create custom components in `components/` directory

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- Component tests: `components/**/*.test.tsx`
- API tests: `app/api/**/*.test.ts`
- Utility tests: `lib/**/*.test.ts`

## 📦 Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
vercel --prod
```

3. **Configure Environment Variables**:
   - Go to Vercel dashboard
   - Add all required environment variables
   - Set up custom domain

### Alternative Deployments

- **Netlify**: Use `npm run build` output
- **Docker**: Dockerfile provided for containerization
- **AWS/GCP**: Standard Next.js deployment

## 🔒 Security Checklist

Before going live:

- [ ] ✅ Enable HTTPS on your domain
- [ ] ✅ Set up proper CORS policies
- [ ] ✅ Configure Supabase RLS policies
- [ ] ✅ Validate file uploads server-side
- [ ] ✅ Use signed URLs for file access
- [ ] ✅ Set up rate limiting
- [ ] ✅ Configure CSP headers
- [ ] ✅ Enable audit logging
- [ ] ✅ Test with college email domains
- [ ] ✅ Set up backup procedures

## 🚨 Troubleshooting

### 1. Supabase Connection Issues

**Problem**: `Error: Missing Supabase environment variables`

**Solution**:
```bash
# Check .env.local file exists and has correct values
cat .env.local | grep SUPABASE

# Verify Supabase project is active
# Visit https://supabase.com/dashboard
```

### 2. Authentication Not Working

**Problem**: Users can't sign in with Google

**Solution**:
- Check Google OAuth configuration in Supabase Auth settings
- Verify redirect URLs include your domain
- Ensure college email domain validation is working

### 3. File Upload Failures

**Problem**: Files fail to upload

**Solutions**:
```bash
# Check file size limits
grep MAX_FILE_SIZE .env.local

# Verify storage bucket exists and is private
# Check Supabase Storage dashboard

# Validate file types
grep ALLOWED_FILE_TYPES .env.local
```

### 4. Database Permission Errors

**Problem**: `Row Level Security policy violated`

**Solution**:
- Verify RLS policies are correctly set up
- Check user has proper college_domain set
- Ensure authenticated user exists in users table

### 5. Search Not Working

**Problem**: Notes search returns no results

**Solution**:
```sql
-- Check if full-text search index exists
SELECT indexname FROM pg_indexes WHERE tablename = 'notes';

-- Rebuild search index if needed
REINDEX INDEX idx_notes_search;
```

### 6. Build Errors

**Problem**: `Module not found` errors during build

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript configuration
npm run type-check
```

### 7. Vercel Deployment Issues

**Problem**: Deployment fails on Vercel

**Solutions**:
- Check build logs for specific errors
- Verify all environment variables are set
- Ensure Node.js version matches (`package.json`)

### 8. CORS Errors

**Problem**: API requests blocked by CORS

**Solution**:
```bash
# Check Supabase CORS settings
# Ensure your domain is whitelisted

# Verify Next.js API routes have proper headers
# Check next.config.js headers configuration
```

### 9. Storage Access Denied

**Problem**: Can't download files

**Solution**:
- Check storage bucket policies
- Verify signed URL generation
- Ensure user has access to the file's college domain

### 10. Email Domain Validation

**Problem**: College emails not being recognized

**Solution**:
```typescript
// Update domain validation patterns in lib/auth.ts
const eduPatterns = [
  /\.edu$/,
  /\.ac\./,
  /\.edu\.au$/,
  // Add your specific domain pattern
];
```

## 🔄 Maintenance

### Database Backups

```bash
# Automated backups via Supabase
# Manual backup command:
supabase db dump --file backup.sql
```

### File Storage Management

- Monitor storage usage in Supabase dashboard  
- Set up automatic cleanup for flagged content
- Archive old files periodically

### Performance Monitoring

- Use Vercel Analytics for performance insights
- Monitor Supabase dashboard for database performance
- Set up error tracking (Sentry recommended)

## 🚀 Scaling for Multiple Colleges

### Method 1: Separate Deployments

Deploy separate instances for each college:

```bash
# Deploy for College A
./scripts/deploy_instance.sh -n "college-a-notes" -c "College A" -d "collegea.edu"

# Deploy for College B  
./scripts/deploy_instance.sh -n "college-b-notes" -c "College B" -d "collegeb.edu"
```

### Method 2: Multi-tenant Single Instance

Use one deployment with college domain routing:
- Set up domain-based routing
- Use single Supabase project with college_domain filtering
- Share common infrastructure while isolating data

## 📞 Support

### Getting Help

1. Check this README for common issues
2. Search existing GitHub Issues
3. Check Supabase documentation
4. Create new issue with detailed description

### Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes with tests
4. Submit pull request

### Reporting Issues

When reporting issues, include:
- Node.js and npm versions
- Error messages and stack traces  
- Steps to reproduce
- Environment details (OS, browser)

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://radix-ui.com/) for component primitives
- [Vercel](https://vercel.com/) for hosting platform

---

**Built with ❤️ for students and educators**

For more information, visit our documentation at `docs/` or contact the maintainers.