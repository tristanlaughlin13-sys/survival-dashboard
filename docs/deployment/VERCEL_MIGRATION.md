# 🚀 Vercel Migration Guide

## Why We're Migrating

Netlify free tier limit reached:
> "This team has exceeded the credit limit. All projects and deploys have been paused."

**Solution:** Migrate to Vercel (more generous free tier)

---

## 🎯 Vercel Setup (5 Minutes)

### Step 1: Sign Up for Vercel

1. **Go to:** https://vercel.com
2. **Click:** "Sign Up" (top right)
3. **Choose:** "Continue with GitHub"
4. **Authorize:** Allow Vercel to access your GitHub
5. **Done:** You're signed up!

---

### Step 2: Import Project

1. **Dashboard:** You should be on Vercel dashboard
2. **Click:** "Add New..." → "Project"
3. **Find repo:** Search for `survival-dashboard`
   - If not visible, click "Adjust GitHub App Permissions"
   - Select your repositories
4. **Click:** "Import" next to `survival-dashboard`

---

### Step 3: Configure Build Settings

**Configure Project:**

| Setting | Value |
|---------|-------|
| **Framework Preset** | Other (or leave as detected) |
| **Root Directory** | `frontend` ← **IMPORTANT!** |
| **Build Command** | Leave empty (static site) |
| **Output Directory** | `.` (current directory) |
| **Install Command** | Leave empty |

**Click:** "Deploy"

---

### Step 4: Wait for Deployment

- First deploy takes ~1-2 minutes
- You'll see build logs in real-time
- When done, you'll see: ✅ "Your project has been deployed"

---

### Step 5: Get Your URL

**Your new URL will be:**
```
https://survival-dashboard.vercel.app
```

Or similar (Vercel auto-generates it)

**Copy this URL** - we'll need it for CORS setup!

---

## 🔧 Update Backend CORS

After deployment, we need to tell the backend about the new frontend URL.

### Update Render Environment Variables

1. **Go to:** https://dashboard.render.com
2. **Find:** `survival-dashboard-api` service
3. **Click:** "Environment" tab
4. **Find:** `ALLOWED_ORIGINS` variable
5. **Update to:**
   ```
   https://survival-dashboard.vercel.app,http://localhost:3000
   ```
   (Keep localhost for local development)
6. **Save Changes**
7. **Wait** for Render to redeploy (~2 min)

---

## ✅ Verify It Works

### Test Checklist:

1. **Open:** Your new Vercel URL
2. **Check:** Guest mode loads with demo data
3. **Try:** Login (after rate limit resets)
4. **Verify:** No CORS errors in console (F12)
5. **Test:** All features work

---

## 🎉 Benefits of Vercel

### vs. Netlify:

| Feature | Netlify Free | Vercel Free |
|---------|--------------|-------------|
| **Bandwidth** | 100GB/month | 100GB/month |
| **Build Minutes** | 300/month | 6000 hours/month |
| **Deploys** | Unlimited | Unlimited |
| **Custom Domain** | Yes | Yes |
| **HTTPS** | Auto | Auto |
| **Speed** | Fast | Faster |

**Winner:** Vercel (way more build time!)

---

## 🔄 Automatic Deployments

Just like Netlify, Vercel auto-deploys on git push:

1. **Push to GitHub:** `git push origin main`
2. **Vercel detects:** New commit
3. **Auto-builds:** Deploys in ~1 min
4. **Live:** Changes are live!

**Same workflow, different host!**

---

## 📱 Vercel Dashboard Features

### What You Get:

- **Deployments:** See all deployments, rollback if needed
- **Analytics:** Track visitors (free tier)
- **Logs:** Build and runtime logs
- **Previews:** Each branch gets preview URL
- **Instant Rollbacks:** One-click rollback to any deploy

---

## 🆘 Troubleshooting

### Issue: Can't Find Repo
**Solution:** Adjust GitHub App Permissions
1. In Vercel: "Add New Project"
2. Click "Adjust GitHub App Permissions"
3. Grant access to `survival-dashboard` repo

### Issue: Build Fails
**Solution:** Check Root Directory
- Make sure Root Directory is set to `frontend`
- Leave Build Command empty (it's a static site)

### Issue: CORS Errors
**Solution:** Update Backend
- Make sure `ALLOWED_ORIGINS` in Render includes Vercel URL
- Wait for Render to redeploy

### Issue: 404 on Routes
**Solution:** Add `vercel.json` (if using client-side routing)
- We don't need this yet (single page app)
- But I can add it if needed

---

## 🔐 Custom Domain (Optional)

Want to use your own domain? Easy!

1. **Vercel Dashboard:** Go to project
2. **Click:** "Settings" → "Domains"
3. **Add domain:** Enter your domain
4. **Update DNS:** Follow Vercel's instructions
5. **Done:** HTTPS auto-configured!

---

## 💰 Cost Comparison

### Netlify (We Hit Limit):
- Free: 100GB bandwidth
- **You hit:** Limit somehow (probably build minutes)
- **Paused:** Until next month

### Vercel (New):
- Free: 100GB bandwidth + 6000 hours build time
- **Much harder to hit:** Way more generous
- **For this project:** Should never hit limits

---

## 📊 Migration Checklist

- [ ] Sign up for Vercel (with GitHub)
- [ ] Import `survival-dashboard` repo
- [ ] Set Root Directory to `frontend`
- [ ] Deploy
- [ ] Copy new Vercel URL
- [ ] Update `ALLOWED_ORIGINS` on Render backend
- [ ] Wait for Render redeploy (2 min)
- [ ] Test new URL (guest mode, login, features)
- [ ] ✅ Migration complete!

**Estimated Time:** 10 minutes total

---

## 🚀 Next Steps After Migration

Once Vercel is live:
1. Test auth works (after rate limit resets)
2. Continue with Phases B-E:
   - Realistic demo data
   - Layout improvements
   - Bill card redesign
   - UI polish

**Development continues as normal!**

---

## 📝 Notes

### Git Workflow Unchanged:
```bash
git add .
git commit -m "your changes"
git push origin main
# Vercel auto-deploys!
```

### Environment Variables:
- None needed for frontend (API URL is hardcoded in api.js)
- If we need them later, easy to add in Vercel dashboard

### Multiple Environments:
- **Production:** `main` branch → survival-dashboard.vercel.app
- **Preview:** Other branches → auto preview URLs
- **Local:** `localhost:3000` (same as before)

---

**Ready to migrate? Follow the steps above!** 🚀

Let me know when you have your Vercel URL, and I'll update the backend CORS!

