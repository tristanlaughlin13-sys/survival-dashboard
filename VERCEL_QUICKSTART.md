# ⚡ Vercel Migration - Quick Start

## Why?
Netlify free tier limit hit. Vercel has more generous limits.

---

## 🚀 **5-Minute Setup**

### 1. Sign Up
- Go to: https://vercel.com
- Click "Sign Up" → "Continue with GitHub"
- Authorize

### 2. Import Project
- Dashboard → "Add New Project"
- Find `survival-dashboard` repo
- Click "Import"

### 3. Configure
- **Root Directory:** `frontend` ← CRITICAL
- **Build Command:** (leave empty)
- Click "Deploy"

### 4. Get URL
- Copy your new URL: `https://survival-dashboard.vercel.app`

### 5. Update Backend
- Render Dashboard → `survival-dashboard-api`
- Environment → `ALLOWED_ORIGINS`
- Add your Vercel URL: `https://survival-dashboard.vercel.app,http://localhost:3000`
- Save (wait 2min for redeploy)

---

## ✅ Done!

**Test:** Open your Vercel URL, everything should work!

**Full Guide:** See `docs/deployment/VERCEL_MIGRATION.md`

---

## 💬 Tell Me:

Once deployed, share your Vercel URL so I can:
1. Verify CORS is correct
2. Help troubleshoot if needed
3. Continue with remaining bugfixes

---

**Deployment continues as normal:**
```bash
git push origin main  # Auto-deploys to Vercel!
```

