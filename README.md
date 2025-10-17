# Survival Dashboard

A secure time tracking and financial goal management dashboard for freelancers.

## Features

- 🔒 **Secure Authentication** - JWT tokens with bcrypt password hashing
- ⏱️ **Work Session Tracking** - Live timer and manual entry support
- 💰 **Financial Goal Tracking** - Real-time progress toward deadlines
- 📊 **Progress Visualization** - Beautiful charts and statistics
- 💸 **Bill Tracking** - Track bills with due dates and payment status
- 📈 **Statistics & Analytics** - Daily goals, earnings, and more
- 🔐 **Row-Level Security** - Your data is isolated and secure
- 📥 **Data Export** - Export all your data as JSON

## Tech Stack

### Backend
- **Node.js** & **Express** - Fast, secure REST API
- **PostgreSQL** - Robust relational database
- **JWT** - Secure token-based authentication
- **bcrypt** - Industry-standard password hashing
- **Helmet** - Security headers middleware
- **Rate Limiting** - Protection against brute force attacks

### Frontend
- **Vanilla JavaScript** - No frameworks, pure performance
- **HTML5** & **CSS3** - Modern, responsive design
- **Fetch API** - Clean API communication layer

### Deployment
- **Backend**: Render.com (Free/Starter tier)
- **Frontend**: Amplify/Netlify/Vercel (Free tier)
- **Database**: Render PostgreSQL (Free/Starter tier)

## Quick Start

### Prerequisites

- Node.js v16 or higher
- PostgreSQL 12 or higher
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp env.example .env
   ```

4. **Generate JWT secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Copy the output and paste it in `.env` as `JWT_SECRET`

5. **Configure database**
   Edit `.env` with your PostgreSQL connection string:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/survival_dashboard
   ```

6. **Set up database**
   ```bash
   # Create database
   createdb survival_dashboard
   
   # Run schema
   psql survival_dashboard -f database-setup.sql
   ```

7. **Start the server**
   ```bash
   npm start
   ```
   
   Server will run on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Start a local server**
   
   Option A - Using Python:
   ```bash
   python -m http.server 8000
   ```
   
   Option B - Using npx:
   ```bash
   npx serve
   ```
   
   Option C - Using Node.js http-server:
   ```bash
   npx http-server -p 8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

### First Run

1. Navigate to `http://localhost:8000/login.html`
2. Click "Register" tab
3. Create your account
4. Start tracking your work!

## Project Structure

```
survival-dashboard/
├── backend/
│   ├── server.js              # Main Express server with JWT auth
│   ├── database-setup.sql     # PostgreSQL schema
│   ├── package.json           # Backend dependencies
│   └── env.example            # Environment variables template
├── frontend/
│   ├── index.html             # Main dashboard (authenticated)
│   ├── login.html             # Login/registration page
│   └── js/
│       ├── api.js             # API communication layer
│       └── dashboard.js       # Dashboard logic (embedded in index.html)
├── docs/
│   ├── DEPLOYMENT.md          # Deployment guide
│   ├── SECURITY.md            # Security documentation
│   └── API.md                 # API endpoint documentation
└── README.md                  # This file
```

## API Endpoints

All API endpoints are documented in [docs/API.md](docs/API.md).

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login to existing account
- `GET /api/auth/me` - Get current user profile

### Sessions
- `GET /api/sessions` - Get all sessions (with filters)
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### Bills
- `GET /api/bills` - Get all bills
- `POST /api/bills` - Create new bill
- `PUT /api/bills/:id` - Update bill
- `PATCH /api/bills/:id/paid` - Mark bill as paid/unpaid
- `DELETE /api/bills/:id` - Delete bill

### Statistics
- `GET /api/stats` - Get overall statistics
- `GET /api/stats/today` - Get today's statistics

### Data Management
- `GET /api/export` - Export all user data

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions for:
- Render.com (backend + database)
- Netlify/Vercel/Amplify (frontend)

## Security

See [docs/SECURITY.md](docs/SECURITY.md) for comprehensive security documentation including:
- Password hashing with bcrypt
- JWT token management
- Rate limiting
- CORS configuration
- SQL injection prevention
- XSS protection

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Server
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your-generated-secret-here
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:5173

# App Settings
DEADLINE_DATE=2025-10-24T23:59:59
```

### Frontend (js/api.js)

Update the `API_URL` constant after deploying the backend:

```javascript
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://your-backend.onrender.com';
```

## Development

### Backend Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Testing API

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePass123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123"}'
```

## Deployment Costs

### Free Tier (Recommended for personal use)
- **Backend**: Render Free (500 hrs/month, sleeps after 15 min inactivity)
- **Database**: Render Free PostgreSQL (limited to 1GB)
- **Frontend**: Netlify/Vercel Free
- **Total**: **$0/month**

### Production Tier (Recommended for serious use)
- **Backend**: Render Starter ($7/month, no sleeping)
- **Database**: Render Starter ($7/month, 10GB, daily backups)
- **Frontend**: Netlify/Vercel Free
- **Total**: **$14/month**

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `psql -l`
- Verify DATABASE_URL in `.env`
- Ensure JWT_SECRET is set
- Check port 3000 is not in use

### Frontend can't connect to API
- Verify backend is running on correct port
- Check CORS settings in backend
- Update API_URL in `frontend/js/api.js`
- Check browser console for errors

### Database connection failed
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists: `createdb survival_dashboard`
- Run schema: `psql survival_dashboard -f backend/database-setup.sql`

### CORS errors
- Add frontend URL to `ALLOWED_ORIGINS` in backend `.env`
- Restart backend server after changing environment variables

## Contributing

This is a personal project, but suggestions are welcome! Please open an issue to discuss proposed changes.

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## Roadmap

- [ ] Email notifications for bill due dates
- [ ] Weekly/monthly reports
- [ ] Mobile app (React Native)
- [ ] Team collaboration features
- [ ] Invoice generation
- [ ] Multi-currency support
- [ ] Dark mode theme
- [ ] Calendar integration

## Acknowledgments

Built with ❤️ for freelancers who need to survive and thrive.

---

**Last Updated**: October 2025

