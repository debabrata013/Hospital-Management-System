# Vercel Deployment Guide for Arogya Hospital Management System

## 🚀 Quick Deployment Steps

### 1. Prerequisites
- GitHub repository with your code
- Vercel account (free tier available)
- Environment variables ready

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration
5. Configure environment variables (see below)
6. Click "Deploy"

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Link to existing project? N
# - Project name: arogya-hospital
# - Directory: ./
# - Override settings? N
```

### 3. Environment Variables Setup

In Vercel Dashboard → Project → Settings → Environment Variables, add:

#### Required Variables
```env
# Database (MongoDB Atlas recommended for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hospital_management
MONGODB_DB_NAME=hospital_management

# JWT Security
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# Application URLs
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api

# Hospital Configuration
HOSPITAL_NAME=Arogya Hospital
HOSPITAL_PHONE=+91 98765 43210
HOSPITAL_EMAIL=care@arogyahospital.com
EMERGENCY_PHONE=+91 98765 43211

# Production Settings
NODE_ENV=production
DEBUG=false
```

#### Optional Variables (for enhanced features)
```env
# Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Notifications
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=arogya-hospital-files

# AI Features
OPENAI_API_KEY=your-openai-key
AI_FEATURES_ENABLED=true
```

### 4. Database Setup (MongoDB Atlas)

1. Create MongoDB Atlas account
2. Create a new cluster (free tier available)
3. Create database user
4. Whitelist Vercel IPs (or use 0.0.0.0/0 for all IPs)
5. Get connection string and add to `MONGODB_URI`

### 5. Custom Domain (Optional)

1. In Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### 6. Deployment Configuration Files

#### vercel.json (already created)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "regions": ["bom1"],
  "framework": "nextjs"
}
```

#### next.config.mjs (updated for Vercel)
- Removed `output: 'export'` for API routes support
- Added proper image configuration
- Configured external packages for serverless

### 7. Post-Deployment Checklist

- [ ] Test landing page loads correctly
- [ ] Test surgery appointment booking form
- [ ] Verify bilingual language switching
- [ ] Test responsive design on mobile
- [ ] Check all images load properly
- [ ] Test API endpoints functionality
- [ ] Verify environment variables are working
- [ ] Test database connections
- [ ] Check console for any errors

### 8. Monitoring & Maintenance

#### Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor page performance and user interactions

#### Error Tracking
- Consider adding Sentry for error tracking
- Monitor API response times

#### Regular Updates
```bash
# Update dependencies
npm update

# Deploy updates
git add .
git commit -m "Update dependencies"
git push origin main
# Vercel auto-deploys on push
```

### 9. Performance Optimization

#### Already Implemented
- ✅ Image optimization with Next.js Image component
- ✅ Code splitting and lazy loading
- ✅ Responsive design
- ✅ SEO-friendly structure

#### Additional Optimizations
- Consider adding Redis for caching (Vercel KV)
- Implement service worker for offline functionality
- Add compression for API responses

### 10. Security Considerations

- ✅ Environment variables secured
- ✅ JWT token authentication
- ✅ Input validation on forms
- ✅ HTTPS enforced by Vercel
- Consider adding rate limiting for API routes
- Implement CORS policies if needed

### 11. Troubleshooting

#### Common Issues
1. **Build Fails**: Check TypeScript errors and dependencies
2. **API Routes 404**: Ensure correct file structure in `app/api/`
3. **Environment Variables**: Double-check spelling and values
4. **Database Connection**: Verify MongoDB URI and network access
5. **Images Not Loading**: Check image paths and domains configuration

#### Debug Commands
```bash
# Local development
npm run dev

# Build locally to test
npm run build
npm run start

# Check Vercel logs
vercel logs
```

### 12. Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/)

---

## 🎉 Your Arogya Hospital Management System is now live!

The system now features:
- ✅ Surgery-focused appointment booking (not general OPD)
- ✅ Bilingual support (Hindi/English)
- ✅ Responsive design for all devices
- ✅ Professional healthcare interface
- ✅ Vercel-optimized deployment
- ✅ Production-ready configuration

**Live URL**: `https://your-project-name.vercel.app`

For any deployment issues, check the Vercel dashboard logs or contact support.
