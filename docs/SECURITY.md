# Security Documentation

Comprehensive security guide for the Survival Dashboard application.

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Password Security](#password-security)
4. [API Security](#api-security)
5. [Database Security](#database-security)
6. [Frontend Security](#frontend-security)
7. [Network Security](#network-security)
8. [Security Best Practices](#security-best-practices)
9. [Threat Model](#threat-model)
10. [Incident Response](#incident-response)

---

## Security Overview

The Survival Dashboard implements multiple layers of security:

- ✅ **Authentication**: JWT-based token system
- ✅ **Password Hashing**: bcrypt with salt rounds = 12
- ✅ **Rate Limiting**: Protection against brute force attacks
- ✅ **Input Validation**: express-validator on all endpoints
- ✅ **SQL Injection Prevention**: Parameterized queries only
- ✅ **XSS Protection**: Helmet security headers
- ✅ **CORS**: Strict origin whitelisting
- ✅ **HTTPS**: Enforced on all production deployments
- ✅ **Data Isolation**: User-scoped database queries

---

## Authentication & Authorization

### JWT (JSON Web Tokens)

**Token Generation**:
```javascript
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Security Features**:
- 7-day expiration (balance between security and UX)
- Signed with strong secret (64-byte random string)
- Verified on every protected endpoint
- No sensitive data in payload

**Token Storage**:
- **Client**: localStorage (considered acceptable for this use case)
- **Server**: Not stored (stateless authentication)

**Token Lifecycle**:
1. User logs in → Server generates token
2. Client stores token in localStorage
3. Client includes token in Authorization header for all requests
4. Server verifies token signature and expiration
5. Token expires after 7 days → User must re-authenticate

### Authentication Middleware

```javascript
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists
    const userResult = await pool.query(
      'SELECT id, email, name FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};
```

**Security Considerations**:
- ✅ Verifies token signature
- ✅ Checks expiration
- ✅ Validates user still exists (handles deleted accounts)
- ✅ Attaches user object to request for authorization

### Authorization

**Row-Level Security**:
All queries are scoped to authenticated user:

```javascript
// Good: User can only access their own data
const result = await pool.query(
  'SELECT * FROM sessions WHERE user_id = $1',
  [req.user.id]
);

// Bad: Would allow access to all users' data (NEVER DO THIS)
const result = await pool.query('SELECT * FROM sessions');
```

**Ownership Verification**:
Before updates/deletes:
```javascript
const checkOwnership = await pool.query(
  'SELECT id FROM sessions WHERE id = $1 AND user_id = $2',
  [sessionId, req.user.id]
);

if (checkOwnership.rows.length === 0) {
  return res.status(404).json({ error: 'Session not found' });
}
```

---

## Password Security

### bcrypt Hashing

**Configuration**:
```javascript
const passwordHash = await bcrypt.hash(password, 12);
```

**Salt Rounds**: 12 (industry standard)
- Computational cost: ~250ms per hash
- Protects against rainbow table attacks
- Automatically handles salting

**Password Requirements**:
- Minimum 8 characters (enforced client and server-side)
- No maximum (bcrypt handles long passwords)
- Recommended: Mix of letters, numbers, symbols

### Password Storage

**What is stored**:
```sql
password_hash VARCHAR(255) -- Contains bcrypt hash
```

**What is NOT stored**:
- ❌ Plain text passwords
- ❌ Reversibly encrypted passwords
- ❌ Password hints

### Password Verification

```javascript
const isValidPassword = await bcrypt.compare(password, user.password_hash);

if (!isValidPassword) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
```

**Timing Attack Mitigation**:
- bcrypt.compare() has constant time comparison
- Same error message for invalid email and invalid password

### Password Best Practices

**For Users**:
- Use unique password (not reused from other sites)
- Use password manager
- Enable 2FA when available (future feature)

**For Developers**:
- Never log passwords
- Never send passwords in error messages
- Never include passwords in URLs
- Always use HTTPS

---

## API Security

### Rate Limiting

**Authentication Endpoints** (stricter limits):
```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later'
});
```

**General API Endpoints**:
```javascript
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
});
```

**Why Rate Limiting**:
- Prevents brute force password attacks
- Mitigates DDoS attacks
- Prevents API abuse

### Input Validation

**Using express-validator**:
```javascript
app.post('/api/sessions',
  authenticateToken,
  [
    body('hours').isFloat({ min: 0 }),
    body('rate').isFloat({ min: 0 }),
    body('email').isEmail().normalizeEmail(),
  ],
  handleValidationErrors,
  async (req, res) => { /* ... */ }
);
```

**Validation Layers**:
1. **Type validation**: Ensures correct data types
2. **Range validation**: Min/max values
3. **Format validation**: Email, dates, etc.
4. **Sanitization**: normalizeEmail(), trim(), etc.

### SQL Injection Prevention

**Always use parameterized queries**:

✅ **Good**:
```javascript
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
```

❌ **Bad** (NEVER DO THIS):
```javascript
const result = await pool.query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

**Why**:
- Parameterized queries treat input as data, not code
- PostgreSQL driver handles escaping
- Prevents all SQL injection attacks

### XSS (Cross-Site Scripting) Prevention

**Server-Side**:
- Helmet middleware sets security headers
- Content Security Policy (CSP)
- X-XSS-Protection header

**Client-Side**:
- Avoid innerHTML (use textContent)
- Sanitize user input before rendering
- Use modern framework (or vanilla JS safely)

**Example - Safe Rendering**:
```javascript
// Good
element.textContent = userInput;

// Bad - XSS vulnerable
element.innerHTML = userInput;
```

---

## Database Security

### Connection Security

**Environment Variables**:
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
```

**SSL/TLS**:
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});
```

### Access Control

**Principle of Least Privilege**:
- Application user has only necessary permissions
- No superuser access
- Limited to CRUD operations on specific tables

**Recommended Database Permissions**:
```sql
-- Create application user
CREATE USER survival_app WITH PASSWORD 'strong_password';

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON users, sessions, bills TO survival_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO survival_app;

-- Revoke dangerous permissions
REVOKE CREATE ON SCHEMA public FROM survival_app;
```

### Data Isolation

**User Data Scoping**:
Every query includes user_id filter:
```javascript
// All sessions belong to specific user
'SELECT * FROM sessions WHERE user_id = $1'

// All bills belong to specific user
'SELECT * FROM bills WHERE user_id = $1'
```

**Foreign Key Constraints**:
```sql
CONSTRAINT fk_user FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE
```

**Benefits**:
- Automatic cleanup when user deleted
- Referential integrity
- Data consistency

### Database Indexes

**Performance & Security**:
```sql
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_bills_user_id ON bills(user_id);
CREATE INDEX idx_users_email ON users(email);
```

**Why Important**:
- Fast queries = less server load
- Less server load = harder to DDoS
- Indexed lookups prevent table scans

---

## Frontend Security

### Token Management

**Storage**:
```javascript
// Store token
localStorage.setItem('authToken', token);

// Retrieve token
const token = localStorage.getItem('authToken');

// Remove token (logout)
localStorage.removeItem('authToken');
```

**Considerations**:
- ✅ Survives page refresh
- ✅ Simple to implement
- ⚠️ Vulnerable to XSS (mitigated by safe coding)
- ⚠️ Accessible to JavaScript (by design)

**Alternative**: httpOnly cookies (more secure, but requires session management)

### API Communication

**Secure Headers**:
```javascript
getHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (this.token) {
    headers['Authorization'] = `Bearer ${this.token}`;
  }
  
  return headers;
}
```

**Error Handling**:
```javascript
if (response.status === 401) {
  localStorage.removeItem('authToken');
  window.location.href = '/login.html';
  throw new Error('Authentication required');
}
```

### HTTPS Enforcement

**Production**:
- All platforms (Render, Netlify, Vercel) enforce HTTPS
- Automatic SSL certificate provisioning
- HTTP → HTTPS redirect

**Local Development**:
- HTTP is acceptable for localhost
- Use mkcert for local HTTPS if needed

---

## Network Security

### CORS (Cross-Origin Resource Sharing)

**Configuration**:
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true
}));
```

**Why Strict CORS**:
- Prevents unauthorized sites from accessing API
- Protects against CSRF attacks
- Controls which domains can make requests

### Helmet Security Headers

```javascript
app.use(helmet());
```

**Headers Set**:
- `X-DNS-Prefetch-Control`: Controls DNS prefetching
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-XSS-Protection`: Enables XSS filter
- `Strict-Transport-Security`: Enforces HTTPS

---

## Security Best Practices

### For Developers

1. **Never commit secrets**
   - Use `.env` files (gitignored)
   - Use environment variables in production
   - Rotate secrets if accidentally exposed

2. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Use security linters**
   ```bash
   npm install --save-dev eslint-plugin-security
   ```

4. **Log security events**
   - Failed login attempts
   - Unusual API access patterns
   - Error conditions

5. **Regular security audits**
   - Review dependencies monthly
   - Check for CVEs
   - Update Node.js version

### For Users

1. **Strong passwords**
   - Minimum 8 characters
   - Mix of character types
   - Unique per service

2. **Secure devices**
   - Keep OS updated
   - Use antivirus/antimalware
   - Don't use public/shared computers

3. **Logout when done**
   - Especially on shared devices
   - Clears authentication token

4. **Report suspicious activity**
   - Unexpected emails
   - Unauthorized access
   - Security concerns

---

## Threat Model

### Threats Addressed

| Threat | Mitigation |
|--------|------------|
| **Brute Force** | Rate limiting (5 attempts / 15 min) |
| **SQL Injection** | Parameterized queries only |
| **XSS** | Helmet headers, safe rendering |
| **CSRF** | JWT tokens (not cookies) |
| **Session Hijacking** | HTTPS, short token expiry |
| **Data Leakage** | User-scoped queries, proper errors |
| **DDoS** | Rate limiting, CDN caching |
| **Password Theft** | bcrypt hashing (irreversible) |

### Threats NOT Addressed

| Threat | Status | Future Plans |
|--------|--------|--------------|
| **2FA** | ❌ Not implemented | Planned feature |
| **Email Verification** | ❌ Not implemented | Planned feature |
| **Password Reset** | ❌ Not implemented | Planned feature |
| **Account Recovery** | ❌ Not implemented | Contact admin |
| **Audit Logging** | ⚠️ Basic | Enhance with timestamps |
| **Intrusion Detection** | ❌ Not implemented | Consider Sentry |

---

## Incident Response

### If You Suspect Compromise

1. **Change Passwords Immediately**
   - Change database password
   - Rotate JWT_SECRET
   - Change hosting platform passwords

2. **Revoke All Sessions**
   - Rotating JWT_SECRET invalidates all tokens
   - Users must re-login

3. **Audit Logs**
   - Check Render logs for unusual activity
   - Look for failed login attempts
   - Check database for suspicious data

4. **Notify Users**
   - If data breach suspected
   - Recommend password changes
   - Explain what happened

### If JWT_SECRET Leaked

```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update in Render dashboard
# Environment → JWT_SECRET → [new value] → Save

# All users must re-login (tokens invalidated)
```

### If Database Compromised

1. **Immediate Actions**:
   - Change database password
   - Review database access logs
   - Check for unauthorized users

2. **Assess Damage**:
   - What data was accessed?
   - What data was modified/deleted?
   - Restore from backup if needed

3. **Prevent Recurrence**:
   - Review security settings
   - Enable audit logging
   - Implement stricter firewall rules

---

## Security Checklist

### Deployment

- [ ] JWT_SECRET is strong (64+ random characters)
- [ ] DATABASE_URL uses SSL in production
- [ ] ALLOWED_ORIGINS only includes legitimate domains
- [ ] NODE_ENV is set to "production"
- [ ] HTTPS is enforced
- [ ] .env is gitignored
- [ ] No secrets in code or logs
- [ ] Rate limiting is active

### Ongoing

- [ ] Dependencies updated monthly
- [ ] npm audit clean (no vulnerabilities)
- [ ] Logs reviewed weekly
- [ ] Backups configured and tested
- [ ] Monitoring alerts configured
- [ ] Security headers verified

### User Management

- [ ] Strong password policy enforced
- [ ] Password hashing with bcrypt
- [ ] User data isolated properly
- [ ] No PII in logs
- [ ] GDPR compliance (if applicable)

---

## Compliance & Privacy

### Data Collected

- Email address
- Name
- Password (hashed)
- Work sessions
- Bills/financial goals

### Data NOT Collected

- No tracking cookies
- No analytics (unless you add them)
- No third-party sharing
- No advertising

### GDPR Considerations

If serving EU users:
- ✅ User controls their own data
- ✅ Data can be exported (JSON export feature)
- ⚠️ Need to implement account deletion
- ⚠️ Need to add privacy policy

---

## Security Contact

For security issues:
1. DO NOT open public GitHub issue
2. Email: [your-security-email@example.com]
3. Expected response: 48 hours
4. Will acknowledge and patch ASAP

---

## Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725
- **bcrypt Documentation**: https://github.com/kelektiv/node.bcrypt.js
- **Node.js Security**: https://nodejs.org/en/docs/guides/security/
- **PostgreSQL Security**: https://www.postgresql.org/docs/current/security.html

---

**Last Updated**: October 2025

**Version**: 1.0

**Next Review**: January 2026

