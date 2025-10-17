# Deployment Guide

Complete step-by-step guide to deploy the Survival Dashboard to production.

## Overview

- **Backend**: Render.com (Node.js + PostgreSQL)
- **Frontend**: Netlify, Vercel, or AWS Amplify
- **Cost**: Free tier available, $14/month recommended for production

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Database Setup (Render PostgreSQL)](#database-setup)
4. [Frontend Deployment](#frontend-deployment)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Custom Domain Setup](#custom-domain-setup-optional)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

Before starting deployment:

- [x] GitHub account created
- [x] Project pushed to GitHub repository
- [x] Render.com account (sign up at https://render.com)
- [x] Choose frontend platform: Netlify, Vercel, or Amplify
- [x] JWT secret generated (keep it safe!)

---

## Backend Deployment (Render)

### Step 1: Create PostgreSQL Database

1. **Go to Render Dashboard**
   - Navigate to https://dashboard.render.com
   - Click "New +" → "PostgreSQL"

2. **Configure Database**
   - **Name**: `survival-db` (or your preferred name)
   - **Database**: `survival_dashboard`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users
   - **Plan**: 
     - **Free**: Limited to 1GB, no backups (good for testing)
     - **Starter ($7/mo)**: 10GB, daily backups (recommended)

3. **Create Database**
   - Click "Create Database"
   - Wait for status to become "Available"

4. **Copy Connection Details**
   - **Internal Database URL**: Use this for the backend (faster, free)
   - **External Database URL**: Use for local administration
   - Save these URLs securely

### Step 2: Initialize Database Schema

Using your local terminal:

```bash
# Install psql if not already installed
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client
# Windows: Download from postgresql.org

# Connect and run schema
psql "YOUR_INTERNAL_DATABASE_URL" -f backend/database-setup.sql

# Verify tables were created
psql "YOUR_INTERNAL_DATABASE_URL" -c "\dt"
```

Expected output:
```
             List of relations
 Schema |   Name   | Type  |     Owner      
--------+----------+-------+----------------
 public | bills    | table | your_db_user
 public | sessions | table | your_db_user
 public | users    | table | your_db_user
```

### Step 3: Deploy Backend Web Service

1. **Create Web Service**
   - In Render Dashboard, click "New +" → "Web Service"
   - Select "Connect Repository"
   - Authorize GitHub and choose your repository

2. **Configure Service**
   ```
   Name: survival-dashboard-api
   Region: (same as database)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Choose Plan**
   - **Free**: Spins down after 15 min inactivity, 750 hours/month
   - **Starter ($7/mo)**: Always on, better performance (recommended)

4. **Add Environment Variables**
   
   Click "Advanced" → "Add Environment Variable":

   | Key | Value | Notes |
   |-----|-------|-------|
   | `DATABASE_URL` | `[Internal Database URL from Step 1]` | Use Internal URL! |
   | `JWT_SECRET` | `[Your generated 64-byte secret]` | Generate with crypto.randomBytes(64) |
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `3000` | Render auto-assigns, but set for clarity |
   | `ALLOWED_ORIGINS` | `https://your-frontend.netlify.app` | Update after frontend deployment |

   **Generate JWT Secret** (if not done yet):
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait 2-5 minutes for deployment
   - Watch logs for any errors

6. **Verify Deployment**
   
   Your backend URL will be: `https://survival-dashboard-api.onrender.com`
   
   Test health endpoint:
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```
   
   Expected response:
   ```json
   {
     "status": "ok",
     "database": "connected",
     "timestamp": "2025-10-17T..."
   }
   ```

---

## Frontend Deployment

Choose one of the following options:

### Option A: Netlify (Recommended)

**Pros**: Simple, fast, excellent free tier, automatic HTTPS

1. **Sign up at https://netlify.com**

2. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize
   - Select your repository

3. **Configure Build**
   ```
   Base directory: frontend
   Build command: (leave empty)
   Publish directory: .
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait 1-2 minutes
   - Your site will be live at `https://random-name.netlify.app`

5. **Custom Domain** (Optional)
   - Go to "Domain settings"
   - Click "Add custom domain"
   - Follow DNS setup instructions

### Option B: Vercel

**Pros**: Excellent performance, great developer experience

1. **Sign up at https://vercel.com**

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure**
   ```
   Framework Preset: Other
   Root Directory: frontend
   Build Command: (leave empty)
   Output Directory: .
   ```

4. **Deploy**
   - Click "Deploy"
   - Your site will be live at `https://your-project.vercel.app`

### Option C: AWS Amplify

**Pros**: AWS integration, scalable, generous free tier

1. **Sign in to AWS Console**
   - Navigate to AWS Amplify service

2. **Create New App**
   - Choose "Host web app"
   - Connect to GitHub

3. **Configure**
   ```
   Repository: your-repository
   Branch: main
   App root: frontend
   Build command: (leave empty)
   ```

4. **Deploy**
   - Click "Save and deploy"
   - Your app will be at `https://main.xxxxx.amplifyapp.com`

### Option D: Render Static Site

**Pros**: Everything in one place, simple management

1. **In Render Dashboard**
   - Click "New +" → "Static Site"

2. **Configure**
   ```
   Repository: your-repository
   Root Directory: frontend
   Build Command: (leave empty)
   Publish Directory: .
   ```

3. **Deploy**
   - Click "Create Static Site"
   - Your site will be at `https://your-site.onrender.com`

---

## Post-Deployment Configuration

### Step 1: Update Frontend API URL

1. **Edit `frontend/js/api.js`**
   ```javascript
   const API_URL = window.location.hostname === 'localhost' 
     ? 'http://localhost:3000' 
     : 'https://your-actual-backend.onrender.com'; // ← UPDATE THIS
   ```

2. **Commit and Push**
   ```bash
   git add frontend/js/api.js
   git commit -m "Update API URL for production"
   git push origin main
   ```

   Your frontend will auto-deploy with the update.

### Step 2: Update Backend CORS

1. **In Render Backend Dashboard**
   - Go to your backend service
   - Click "Environment"
   - Find `ALLOWED_ORIGINS`

2. **Update Value**
   ```
   ALLOWED_ORIGINS=https://your-frontend.netlify.app,https://www.your-custom-domain.com
   ```
   
   Multiple origins separated by commas, no spaces

3. **Save and Redeploy**
   - Backend will automatically restart

### Step 3: Test End-to-End

1. **Visit your frontend URL**
2. **Register a new account**
3. **Login**
4. **Create a test session**
5. **Add a test bill**
6. **Logout and login again** - verify data persists

---

## Custom Domain Setup (Optional)

### For Frontend (Netlify Example)

1. **In Netlify Dashboard**
   - Go to "Domain settings"
   - Click "Add custom domain"
   - Enter your domain: `dashboard.yourdomain.com`

2. **Update DNS**
   
   Add these records to your domain's DNS:
   ```
   Type: A
   Name: @ (or subdomain)
   Value: 75.2.60.5 (Netlify's IP)
   
   OR
   
   Type: CNAME
   Name: dashboard
   Value: your-site.netlify.app
   ```

3. **Enable HTTPS**
   - Netlify auto-provisions Let's Encrypt SSL
   - Wait 5-10 minutes for certificate

### For Backend (Render)

1. **In Render Dashboard**
   - Go to backend service settings
   - Click "Custom Domain"
   - Add domain: `api.yourdomain.com`

2. **Update DNS**
   ```
   Type: CNAME
   Name: api
   Value: your-backend.onrender.com
   ```

3. **Update CORS**
   - Add your custom frontend domain to `ALLOWED_ORIGINS`

---

## Monitoring & Maintenance

### Set Up Monitoring

**UptimeRobot** (Free, recommended)

1. Sign up at https://uptimerobot.com
2. Add monitors:
   - **API Health**: `https://your-backend.onrender.com/health`
   - **Frontend**: `https://your-frontend.netlify.app`
3. Configure email alerts

### Database Backups

**Render Starter Plan**: Automatic daily backups

**Free Plan**: Manual backups
```bash
# Export database
pg_dump "YOUR_EXTERNAL_DATABASE_URL" > backup-$(date +%Y%m%d).sql

# Schedule with cron (weekly)
0 2 * * 0 pg_dump "YOUR_DB_URL" > ~/backups/survival-$(date +\%Y\%m\%d).sql
```

### Error Tracking

**Sentry** (Optional)

1. Sign up at https://sentry.io
2. Install SDK:
   ```bash
   npm install @sentry/node
   ```
3. Add to `server.js`:
   ```javascript
   const Sentry = require('@sentry/node');
   Sentry.init({ dsn: 'YOUR_DSN' });
   ```

### View Logs

**Render Logs**:
- Dashboard → Your Service → Logs tab
- Real-time log streaming
- Search and filter

**Download Logs**:
```bash
# Using Render CLI
render logs -s your-service-name
```

---

## Scaling Considerations

### When to Upgrade Plans

**Render Free Tier Limits**:
- Backend sleeps after 15 min inactivity (50-100 sec wake time)
- 750 hours/month (enough for 1 user)
- Database limited to 1GB

**Upgrade to Starter ($7/mo each) when**:
- Multiple concurrent users
- Need instant response times
- Database approaching 1GB
- Want automatic backups

### Performance Optimization

1. **Enable Database Connection Pooling**
   ```javascript
   const pool = new Pool({
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

2. **Add Database Indexes** (already in schema)
   - Sessions by user_id and date
   - Bills by user_id

3. **CDN for Frontend** (automatic with Netlify/Vercel)

---

## Troubleshooting

### Backend deployment fails

**Check build logs**:
- Render Dashboard → Service → Logs
- Look for npm install errors
- Verify Node version compatibility

**Common issues**:
```bash
# Missing dependencies
npm install --save missing-package

# Node version
# Add to package.json:
"engines": {
  "node": ">=16.0.0"
}
```

### Database connection fails

**Check DATABASE_URL**:
- Must use Internal Database URL (not External)
- Format: `postgresql://user:pass@host:5432/dbname`
- No extra spaces or quotes

**Test connection**:
```bash
psql "YOUR_DATABASE_URL" -c "SELECT NOW();"
```

### CORS errors

**Symptoms**: Browser console shows CORS policy error

**Solutions**:
1. Add frontend URL to `ALLOWED_ORIGINS`
2. Ensure no trailing slash: `https://app.com` not `https://app.com/`
3. Include both www and non-www if using custom domain
4. Restart backend after changing env vars

### Frontend can't reach backend

**Check API_URL**:
- Must match exact backend URL
- Include https:// prefix
- No trailing slash

**Test backend directly**:
```bash
curl https://your-backend.onrender.com/health
```

### Authentication fails

**Check JWT_SECRET**:
- Same value in backend environment
- At least 64 characters
- No special characters that need escaping

**Clear browser data**:
- Logout
- Clear localStorage
- Try registering new account

---

## Security Checklist

- [ ] JWT_SECRET is random and secure (64+ characters)
- [ ] DATABASE_URL uses Internal URL (not External)
- [ ] ALLOWED_ORIGINS only includes your domains
- [ ] NODE_ENV is set to "production"
- [ ] HTTPS is enabled (automatic on all platforms)
- [ ] .env file is NOT committed to Git
- [ ] Database has connection limits configured
- [ ] Rate limiting is enabled (built into backend)
- [ ] Strong password policy enforced (8+ chars)

---

## Deployment Costs Summary

### Free Tier
| Service | Plan | Cost |
|---------|------|------|
| Render Backend | Free | $0 |
| Render Database | Free | $0 |
| Netlify Frontend | Free | $0 |
| **Total** | | **$0/month** |

**Limitations**: Backend sleeps, 1GB database, 750 hours/month

### Recommended Production
| Service | Plan | Cost |
|---------|------|------|
| Render Backend | Starter | $7/mo |
| Render Database | Starter | $7/mo |
| Netlify Frontend | Free | $0 |
| **Total** | | **$14/month** |

**Benefits**: No sleeping, 10GB database, daily backups, 99.9% uptime

---

## Next Steps

After successful deployment:

1. ✅ Test all features thoroughly
2. ✅ Set up monitoring (UptimeRobot)
3. ✅ Configure backups
4. ✅ Add custom domain (optional)
5. ✅ Document your specific URLs
6. ✅ Share with users!

---

## Support

- **Render Docs**: https://render.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Vercel Docs**: https://vercel.com/docs

For project-specific issues, check the GitHub repository.

---

**Last Updated**: October 2025

