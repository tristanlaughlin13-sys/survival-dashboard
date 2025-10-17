# Survival Dashboard Backend

Secure REST API for the Survival Dashboard application.

## Features

- JWT authentication with bcrypt password hashing
- PostgreSQL database with row-level security
- Rate limiting and security headers
- Input validation on all endpoints
- CORS protection
- RESTful API design

## Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express
- **Database**: PostgreSQL 12+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: express-validator

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Add to .env
DATABASE_URL=postgresql://localhost:5432/survival_dashboard
JWT_SECRET=your-generated-secret-here
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:8000
```

### 3. Setup Database

```bash
# Create database
createdb survival_dashboard

# Run schema
psql survival_dashboard -f database-setup.sql
```

### 4. Start Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

## API Endpoints

See [../docs/API.md](../docs/API.md) for complete API documentation.

### Quick Reference

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get profile
- `GET /api/sessions` - List sessions
- `POST /api/sessions` - Create session
- `GET /api/bills` - List bills
- `POST /api/bills` - Create bill
- `GET /api/stats` - Get statistics

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing (64+ chars) |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |
| `ALLOWED_ORIGINS` | Yes | Comma-separated CORS origins |
| `DEADLINE_DATE` | No | Goal deadline (default: 2025-10-24) |

## Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens expire after 7 days
- Rate limiting: 5 auth attempts per 15 min, 100 API requests per minute
- All queries use parameterized statements (SQL injection prevention)
- Helmet security headers enabled
- CORS restricted to allowed origins only

See [../docs/SECURITY.md](../docs/SECURITY.md) for detailed security documentation.

## Database Schema

Tables:
- `users` - User accounts
- `sessions` - Work sessions
- `bills` - Bills to pay

All user data is isolated with row-level user_id filtering.

## Testing

### Test Health Endpoint

```bash
curl http://localhost:3000/health
```

### Test Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test12345"}'
```

## Deployment

See [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for deployment instructions.

Recommended: Render.com with PostgreSQL Starter plan ($14/month)

## License

MIT

