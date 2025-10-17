# Quick Start Guide

Your Survival Dashboard is ready! Follow these steps to get it running.

## ✅ What's Been Done

- ✅ Project structure created
- ✅ Backend server with JWT authentication
- ✅ Database schema with security features
- ✅ Frontend with login and dashboard
- ✅ Complete documentation
- ✅ Git repository initialized
- ✅ Backend dependencies installed

## 🚀 Next Steps

### Step 1: Generate JWT Secret

Open a terminal and run:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output (should be a long random string).

### Step 2: Create Backend Environment File

1. Navigate to the `backend` folder
2. Create a file named `.env` (note: starts with a dot)
3. Add this content (replace with your values):

```env
DATABASE_URL=postgresql://localhost:5432/survival_dashboard
PORT=3000
NODE_ENV=development
JWT_SECRET=paste-your-generated-secret-here
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:5173
DEADLINE_DATE=2025-10-24T23:59:59
```

**Important**: Replace `JWT_SECRET` with the value from Step 1!

### Step 3: Setup PostgreSQL Database

#### Option A: Local PostgreSQL (Recommended for Development)

1. **Install PostgreSQL** if not already installed:
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create database**:
   ```bash
   createdb survival_dashboard
   ```

3. **Run schema**:
   ```bash
   psql survival_dashboard -f backend/database-setup.sql
   ```

4. **Verify**:
   ```bash
   psql survival_dashboard -c "\dt"
   ```
   
   You should see 3 tables: users, sessions, bills

#### Option B: Skip Local Setup, Use Render Directly

If you don't want to install PostgreSQL locally, you can:
1. Skip to Step 7 (Deploy to Render)
2. Use Render's database directly
3. Test there instead of locally

### Step 4: Start Backend Server

```bash
cd backend
npm start
```

You should see:
```
🚀 Server running on port 3000
📝 Environment: development
🔒 CORS enabled for: http://localhost:8000, http://localhost:5173
✅ Database connected successfully
```

**Keep this terminal open!**

### Step 5: Test Backend

Open a new terminal and run:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-10-17T..."
}
```

### Step 6: Start Frontend

Open a **new terminal** (keep backend running!):

```bash
cd frontend
npx serve
```

Or use Python:
```bash
python -m http.server 8000
```

### Step 7: Test in Browser

1. Open browser to `http://localhost:3000` (or whatever port serve shows)
2. You'll see the login page
3. Click "Register" tab
4. Create an account
5. Start using the dashboard!

## 🌐 Deploy to Production

When you're ready to deploy:

### 1. Push to GitHub

```bash
# If you haven't already:
# 1. Create a new repository on GitHub
# 2. Copy the repository URL

git remote add origin https://github.com/YOUR_USERNAME/survival-dashboard.git
git branch -M main
git push -u origin main
```

### 2. Deploy Backend (Render)

Follow detailed instructions in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md):

1. Sign up at https://render.com
2. Create PostgreSQL database
3. Run database schema on Render
4. Create Web Service for backend
5. Set environment variables
6. Deploy!

### 3. Deploy Frontend (Netlify/Vercel)

1. Sign up at https://netlify.com (or vercel.com)
2. Connect GitHub repository
3. Configure:
   - Base directory: `frontend`
   - Build command: (empty)
   - Publish directory: `.`
4. Deploy!

### 4. Update API URL

After deploying backend:

1. Edit `frontend/js/api.js`
2. Change line 3:
   ```javascript
   : 'https://your-actual-backend.onrender.com';
   ```
3. Commit and push:
   ```bash
   git add frontend/js/api.js
   git commit -m "Update API URL for production"
   git push
   ```

### 5. Update CORS

In Render backend dashboard:
1. Go to Environment variables
2. Update `ALLOWED_ORIGINS` to include your frontend URL:
   ```
   ALLOWED_ORIGINS=https://your-app.netlify.app
   ```

## 📝 Important Notes

### Security

- **Never commit `.env` file** - It's already in .gitignore
- **Keep JWT_SECRET private** - It's like a master password
- **Use strong passwords** - Minimum 8 characters

### Database

- Local development: `postgresql://localhost:5432/survival_dashboard`
- Production: Use Render's **Internal Database URL** (not External)

### npm Audit Warning

There's a moderate vulnerability in the validator package. This is a URL validation issue that doesn't affect this app (we don't validate URLs). You can ignore it for now, but keep dependencies updated.

## 🆘 Troubleshooting

### Backend won't start

**Problem**: "Database connection error"
- **Solution**: Make sure PostgreSQL is running and database exists

**Problem**: "JWT_SECRET not defined"
- **Solution**: Create `.env` file in backend folder with JWT_SECRET

### Frontend can't connect

**Problem**: CORS error in browser console
- **Solution**: Make sure ALLOWED_ORIGINS in backend includes your frontend URL

**Problem**: 401 Authentication error
- **Solution**: Clear browser localStorage and try registering again

### Database issues

**Problem**: "relation 'users' does not exist"
- **Solution**: Run the database schema:
  ```bash
  psql survival_dashboard -f backend/database-setup.sql
  ```

## 📚 Documentation

- **Complete deployment guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Security documentation**: [docs/SECURITY.md](docs/SECURITY.md)
- **API reference**: [docs/API.md](docs/API.md)
- **Backend README**: [backend/README.md](backend/README.md)
- **Frontend README**: [frontend/README.md](frontend/README.md)

## 💡 Tips

1. **Start simple**: Get it working locally first
2. **Test thoroughly**: Create test data, logout, login again
3. **Backup data**: Use the export feature regularly
4. **Monitor costs**: Start with free tier, upgrade if needed
5. **Keep updated**: Run `npm audit fix` periodically

## 🎯 Your Goal

Track work sessions and reach your financial goal by October 24, 2025!

## 📞 Need Help?

- Check the documentation in `docs/` folder
- Review error messages in browser console
- Check backend logs in terminal
- Verify environment variables are set correctly

---

**You're all set! Start with Step 1 above and get your dashboard running! 🚀**

