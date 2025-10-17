# Project Structure

Complete overview of the Survival Dashboard project structure.

## Directory Tree

```
survival-dashboard/
│
├── backend/                          # Backend API server
│   ├── server.js                     # Main Express server (JWT auth, all endpoints)
│   ├── database-setup.sql            # PostgreSQL schema with security
│   ├── package.json                  # Dependencies and scripts
│   ├── env.example                   # Environment variables template
│   ├── .gitignore                    # Backend-specific ignores
│   ├── README.md                     # Backend documentation
│   └── node_modules/                 # Installed dependencies (not in git)
│
├── frontend/                         # Frontend web application
│   ├── index.html                    # Main dashboard (authenticated)
│   ├── login.html                    # Login/registration page
│   ├── js/
│   │   └── api.js                    # API communication layer
│   └── README.md                     # Frontend documentation
│
├── docs/                             # Documentation
│   ├── DEPLOYMENT.md                 # Deployment guide (Render, Netlify, etc.)
│   ├── SECURITY.md                   # Security documentation
│   └── API.md                        # API endpoint reference
│
├── .gitignore                        # Git ignore rules
├── README.md                         # Project overview
├── QUICKSTART.md                     # Quick start guide (YOU ARE HERE!)
└── PROJECT_STRUCTURE.md              # This file

```

## File Descriptions

### Root Level

| File | Description | Size |
|------|-------------|------|
| `README.md` | Project overview, features, quick start | ~4 KB |
| `QUICKSTART.md` | Step-by-step setup guide | ~5 KB |
| `PROJECT_STRUCTURE.md` | This file - project organization | ~3 KB |
| `.gitignore` | Files to exclude from git | ~100 B |

### Backend (`backend/`)

| File | Description | Lines | Key Features |
|------|-------------|-------|--------------|
| `server.js` | Express REST API server | ~600 | JWT auth, rate limiting, validation |
| `database-setup.sql` | PostgreSQL schema | ~150 | Users, sessions, bills tables |
| `package.json` | Dependencies | ~40 | Express, pg, bcrypt, JWT, helmet |
| `env.example` | Environment template | ~15 | DATABASE_URL, JWT_SECRET, CORS |
| `README.md` | Backend docs | ~200 | Setup, API reference, security |

**Dependencies** (installed):
- `express` - Web framework
- `pg` - PostgreSQL client
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT tokens
- `dotenv` - Environment variables
- `helmet` - Security headers
- `cors` - CORS middleware
- `express-rate-limit` - Rate limiting
- `express-validator` - Input validation
- `nodemon` (dev) - Auto-reload

### Frontend (`frontend/`)

| File | Description | Lines | Key Features |
|------|-------------|-------|--------------|
| `index.html` | Main dashboard | ~600 | Timer, sessions, bills, stats |
| `login.html` | Auth page | ~300 | Login/register forms |
| `api.js` | API client | ~150 | Fetch wrapper, auth handling |
| `README.md` | Frontend docs | ~200 | Setup, usage, deployment |

**No dependencies** - Pure vanilla JavaScript!

### Documentation (`docs/`)

| File | Description | Pages | Topics |
|------|-------------|-------|--------|
| `DEPLOYMENT.md` | Deployment guide | ~15 | Render, Netlify, Vercel, DNS |
| `SECURITY.md` | Security docs | ~12 | JWT, bcrypt, SQL injection, XSS |
| `API.md` | API reference | ~20 | All endpoints, examples, auth |

## Technology Stack

### Backend Stack

```
┌─────────────────────────────────┐
│       Express.js Server         │
├─────────────────────────────────┤
│  Middleware                     │
│  ├─ Helmet (security headers)   │
│  ├─ CORS (origin control)       │
│  ├─ Rate Limiting               │
│  └─ express-validator           │
├─────────────────────────────────┤
│  Authentication                 │
│  ├─ JWT (jsonwebtoken)          │
│  └─ bcrypt (password hashing)   │
├─────────────────────────────────┤
│  Database                       │
│  └─ PostgreSQL (via node-pg)    │
└─────────────────────────────────┘
```

### Frontend Stack

```
┌─────────────────────────────────┐
│       HTML5 + CSS3              │
├─────────────────────────────────┤
│  JavaScript (Vanilla ES6+)      │
│  ├─ Fetch API                   │
│  ├─ LocalStorage (token)        │
│  └─ DOM Manipulation            │
├─────────────────────────────────┤
│  No frameworks!                 │
│  Pure performance               │
└─────────────────────────────────┘
```

## Database Schema

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ password_hash   │
│ name            │
│ created_at      │
│ last_login      │
└─────────────────┘
        │
        │ 1:N
        ├──────────────────┐
        │                  │
┌───────▼──────┐   ┌───────▼──────┐
│   sessions   │   │    bills     │
├──────────────┤   ├──────────────┤
│ id (PK)      │   │ id (PK)      │
│ user_id (FK) │   │ user_id (FK) │
│ timestamp    │   │ name         │
│ date         │   │ amount_cad   │
│ hours        │   │ amount_usd   │
│ rate         │   │ due_date     │
│ earnings     │   │ paid         │
│ note         │   │ paid_at      │
│ is_leisure   │   │ created_at   │
│ created_at   │   │ updated_at   │
│ updated_at   │   └──────────────┘
└──────────────┘
```

## API Architecture

```
┌──────────────┐
│   Frontend   │
│  (Browser)   │
└──────┬───────┘
       │ HTTPS
       │ JWT Bearer Token
       ▼
┌──────────────┐
│   Backend    │
│  (Express)   │
├──────────────┤
│ Rate Limiter │
│      ↓       │
│  Auth Check  │
│      ↓       │
│  Validation  │
│      ↓       │
│  Controller  │
└──────┬───────┘
       │ SQL (parameterized)
       ▼
┌──────────────┐
│  PostgreSQL  │
│  (Database)  │
└──────────────┘
```

## Security Layers

```
Layer 1: Network Security
├─ HTTPS (TLS/SSL)
├─ CORS restrictions
└─ Rate limiting

Layer 2: Authentication
├─ JWT tokens (7-day expiry)
├─ bcrypt password hashing
└─ Token verification on each request

Layer 3: Authorization
├─ User ID from JWT
├─ Row-level filtering (user_id)
└─ Ownership verification

Layer 4: Input Validation
├─ express-validator
├─ Type checking
└─ Range validation

Layer 5: Database Security
├─ Parameterized queries
├─ Foreign key constraints
└─ Indexes for performance
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│              Production Setup                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Frontend (Static Site)                         │
│  ┌──────────────────────┐                      │
│  │  Netlify / Vercel    │                      │
│  │  - Static hosting    │                      │
│  │  - CDN               │                      │
│  │  - Auto SSL          │                      │
│  │  - Auto deploy       │                      │
│  └──────────┬───────────┘                      │
│             │ HTTPS API calls                   │
│             ▼                                    │
│  Backend (Web Service)                          │
│  ┌──────────────────────┐                      │
│  │  Render.com          │                      │
│  │  - Node.js runtime   │                      │
│  │  - Auto deploy       │                      │
│  │  - Health checks     │                      │
│  │  - Env variables     │                      │
│  └──────────┬───────────┘                      │
│             │ Internal connection               │
│             ▼                                    │
│  Database (PostgreSQL)                          │
│  ┌──────────────────────┐                      │
│  │  Render PostgreSQL   │                      │
│  │  - Managed service   │                      │
│  │  - Daily backups     │                      │
│  │  - SSL connections   │                      │
│  └──────────────────────┘                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Data Flow

### User Registration/Login

```
1. User enters credentials
   ↓
2. Frontend sends POST to /api/auth/register or /api/auth/login
   ↓
3. Backend validates input
   ↓
4. Backend checks database
   ↓
5. Backend hashes password (register) or compares hash (login)
   ↓
6. Backend generates JWT token
   ↓
7. Frontend stores token in localStorage
   ↓
8. Redirect to dashboard
```

### Creating a Session

```
1. User starts timer or fills manual form
   ↓
2. Frontend calculates hours/earnings
   ↓
3. Frontend sends POST to /api/sessions with JWT
   ↓
4. Backend verifies JWT token
   ↓
5. Backend extracts user_id from token
   ↓
6. Backend validates input data
   ↓
7. Backend inserts into database with user_id
   ↓
8. Backend returns created session
   ↓
9. Frontend refreshes session list and stats
```

## File Sizes

| Component | Files | Lines of Code | Size |
|-----------|-------|---------------|------|
| Backend | 3 | ~800 | ~35 KB |
| Frontend | 3 | ~1000 | ~45 KB |
| Documentation | 5 | ~2000 | ~100 KB |
| **Total** | **11** | **~3800** | **~180 KB** |

*Excluding node_modules (186 packages, ~50 MB)*

## Environment Variables

### Required for Backend

```env
DATABASE_URL          # PostgreSQL connection string
JWT_SECRET           # 64-byte random string for JWT signing
PORT                 # Server port (default: 3000)
NODE_ENV             # development or production
ALLOWED_ORIGINS      # Comma-separated frontend URLs
```

### Optional

```env
DEADLINE_DATE        # Goal deadline (default: 2025-10-24)
```

## Git Structure

```
.git/
├── Branches: main
├── Remote: origin (to be added)
└── Initial commit: ✅ Complete project
```

**Not in git** (via .gitignore):
- `node_modules/`
- `.env`
- `*.log`
- `.DS_Store`
- `.vscode/`
- `.idea/`

## Next Steps

1. ✅ **Read**: [QUICKSTART.md](QUICKSTART.md)
2. ⏳ **Setup**: Generate JWT secret
3. ⏳ **Configure**: Create backend/.env
4. ⏳ **Database**: Setup PostgreSQL
5. ⏳ **Test**: Run locally
6. ⏳ **Deploy**: Push to production

---

**Everything is ready! Start with QUICKSTART.md** 🚀

