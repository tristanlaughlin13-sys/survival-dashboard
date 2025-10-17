# API Documentation

Complete API reference for the Survival Dashboard backend.

## Base URL

```
Production: https://your-api.onrender.com
Development: http://localhost:3000
```

## Authentication

All endpoints except authentication routes require a valid JWT token.

### Authorization Header

```http
Authorization: Bearer {your-jwt-token}
```

### Token Expiration

Tokens expire after 7 days. Client must handle 401 responses and redirect to login.

---

## Response Format

### Success Response

```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": [ ... ] // Optional validation errors
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Valid token but insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Health Check

### GET /health

Check API and database health.

**Authentication**: Not required

**Response**:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-10-17T12:34:56.789Z"
}
```

**Example**:
```bash
curl https://your-api.onrender.com/health
```

---

## Authentication Endpoints

### POST /api/auth/register

Create a new user account.

**Authentication**: Not required

**Rate Limit**: 5 requests per 15 minutes

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules**:
- `name`: Required, non-empty string
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters

**Success Response** (201):
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- `409 Conflict`: Email already registered
- `400 Bad Request`: Validation failed

**Example**:
```bash
curl -X POST https://your-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

---

### POST /api/auth/login

Authenticate an existing user.

**Authentication**: Not required

**Rate Limit**: 5 requests per 15 minutes

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response** (200):
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials

**Example**:
```bash
curl -X POST https://your-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

---

### GET /api/auth/me

Get current user profile.

**Authentication**: Required

**Success Response** (200):
```json
{
  "id": 1,
  "email": "john@example.com",
  "name": "John Doe",
  "created_at": "2025-10-17T00:00:00.000Z",
  "last_login": "2025-10-17T12:34:56.000Z"
}
```

**Example**:
```bash
curl https://your-api.onrender.com/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Session Endpoints

### GET /api/sessions

Get all sessions for authenticated user.

**Authentication**: Required

**Rate Limit**: 100 requests per minute

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | ISO 8601 date | Filter by specific date (YYYY-MM-DD) |
| `startDate` | ISO 8601 date | Filter from date (inclusive) |
| `endDate` | ISO 8601 date | Filter to date (inclusive) |

**Success Response** (200):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "time_display": "9:00 AM - 5:00 PM",
    "timestamp": "2025-10-17T09:00:00.000Z",
    "date": "2025-10-17",
    "hours": "8.00",
    "rate": "24.00",
    "earnings": "192.00",
    "note": "Client project work",
    "is_leisure": false,
    "opportunity_cost": "0.00",
    "is_manual": true,
    "created_at": "2025-10-17T09:00:00.000Z",
    "updated_at": "2025-10-17T09:00:00.000Z"
  }
]
```

**Examples**:
```bash
# Get all sessions
curl https://your-api.onrender.com/api/sessions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get sessions for specific date
curl https://your-api.onrender.com/api/sessions?date=2025-10-17 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get sessions in date range
curl "https://your-api.onrender.com/api/sessions?startDate=2025-10-16&endDate=2025-10-17" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### POST /api/sessions

Create a new work session.

**Authentication**: Required

**Rate Limit**: 100 requests per minute

**Request Body**:
```json
{
  "time_display": "9:00 AM - 5:00 PM",
  "timestamp": "2025-10-17T09:00:00.000Z",
  "date": "2025-10-17",
  "hours": 8.00,
  "rate": 24.00,
  "earnings": 192.00,
  "note": "Client project work",
  "is_leisure": false,
  "opportunity_cost": 0,
  "is_manual": true
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `time_display` | string | No | Human-readable time range |
| `timestamp` | ISO 8601 | Yes | Session start timestamp |
| `date` | ISO 8601 date | Yes | Session date (YYYY-MM-DD) |
| `hours` | decimal | Yes | Hours worked (≥0) |
| `rate` | decimal | Yes | Hourly rate in USD (≥0) |
| `earnings` | decimal | Yes | Total earnings (hours × rate) |
| `note` | string | No | Session notes |
| `is_leisure` | boolean | No | Is this leisure time? (default: false) |
| `opportunity_cost` | decimal | No | Lost earnings if leisure (default: 0) |
| `is_manual` | boolean | No | Manually entered? (default: true) |

**Success Response** (201):
```json
{
  "id": 1,
  "user_id": 1,
  "time_display": "9:00 AM - 5:00 PM",
  "timestamp": "2025-10-17T09:00:00.000Z",
  "date": "2025-10-17",
  "hours": "8.00",
  "rate": "24.00",
  "earnings": "192.00",
  "note": "Client project work",
  "is_leisure": false,
  "opportunity_cost": "0.00",
  "is_manual": true,
  "created_at": "2025-10-17T09:00:00.000Z",
  "updated_at": "2025-10-17T09:00:00.000Z"
}
```

**Example**:
```bash
curl -X POST https://your-api.onrender.com/api/sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-10-17T09:00:00.000Z",
    "date": "2025-10-17",
    "hours": 8.00,
    "rate": 24.00,
    "earnings": 192.00,
    "note": "Client work"
  }'
```

---

### PUT /api/sessions/:id

Update an existing session.

**Authentication**: Required

**Rate Limit**: 100 requests per minute

**URL Parameters**:
- `id`: Session ID (integer)

**Request Body** (all fields optional):
```json
{
  "time_display": "10:00 AM - 6:00 PM",
  "hours": 8.00,
  "rate": 25.00,
  "earnings": 200.00,
  "note": "Updated notes"
}
```

**Success Response** (200):
```json
{
  "id": 1,
  "user_id": 1,
  "time_display": "10:00 AM - 6:00 PM",
  "timestamp": "2025-10-17T10:00:00.000Z",
  "date": "2025-10-17",
  "hours": "8.00",
  "rate": "25.00",
  "earnings": "200.00",
  "note": "Updated notes",
  "is_leisure": false,
  "opportunity_cost": "0.00",
  "is_manual": true,
  "created_at": "2025-10-17T09:00:00.000Z",
  "updated_at": "2025-10-17T15:30:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: Session doesn't exist or doesn't belong to user
- `400 Bad Request`: No fields to update

**Example**:
```bash
curl -X PUT https://your-api.onrender.com/api/sessions/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rate": 25.00,
    "earnings": 200.00
  }'
```

---

### DELETE /api/sessions/:id

Delete a session.

**Authentication**: Required

**Rate Limit**: 100 requests per minute

**URL Parameters**:
- `id`: Session ID (integer)

**Success Response** (200):
```json
{
  "message": "Session deleted successfully"
}
```

**Error Responses**:
- `404 Not Found`: Session doesn't exist or doesn't belong to user

**Example**:
```bash
curl -X DELETE https://your-api.onrender.com/api/sessions/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Bill Endpoints

### GET /api/bills

Get all bills for authenticated user.

**Authentication**: Required

**Rate Limit**: 100 requests per minute

**Success Response** (200):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Rent",
    "amount_cad": "2250.00",
    "amount_usd": "1607.00",
    "due_date": "2025-10-31",
    "paid": false,
    "paid_at": null,
    "created_at": "2025-10-17T00:00:00.000Z",
    "updated_at": "2025-10-17T00:00:00.000Z"
  }
]
```

**Example**:
```bash
curl https://your-api.onrender.com/api/bills \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### POST /api/bills

Create a new bill.

**Authentication**: Required

**Rate Limit**: 100 requests per minute

**Request Body**:
```json
{
  "name": "Rent",
  "amount_cad": 2250.00,
  "amount_usd": 1607.00,
  "due_date": "2025-10-31"
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Bill name/description |
| `amount_cad` | decimal | Yes | Amount in Canadian dollars (≥0) |
| `amount_usd` | decimal | Yes | Amount in US dollars (≥0) |
| `due_date` | ISO 8601 date | No | Bill due date |

**Success Response** (201):
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Rent",
  "amount_cad": "2250.00",
  "amount_usd": "1607.00",
  "due_date": "2025-10-31",
  "paid": false,
  "paid_at": null,
  "created_at": "2025-10-17T00:00:00.000Z",
  "updated_at": "2025-10-17T00:00:00.000Z"
}
```

**Example**:
```bash
curl -X POST https://your-api.onrender.com/api/bills \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rent",
    "amount_cad": 2250.00,
    "amount_usd": 1607.00,
    "due_date": "2025-10-31"
  }'
```

---

### PUT /api/bills/:id

Update an existing bill.

**Authentication**: Required

**Rate Limit**: 100 requests per minute

**URL Parameters**:
- `id`: Bill ID (integer)

**Request Body** (all fields optional):
```json
{
  "name": "Monthly Rent",
  "amount_cad": 2300.00,
  "amount_usd": 1643.00,
  "due_date": "2025-10-31"
}
```

**Success Response** (200):
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Monthly Rent",
  "amount_cad": "2300.00",
  "amount_usd": "1643.00",
  "due_date": "2025-10-31",
  "paid": false,
  "paid_at": null,
  "created_at": "2025-10-17T00:00:00.000Z",
  "updated_at": "2025-10-17T15:30:00.000Z"
}
```

**Example**:
```bash
curl -X PUT https://your-api.onrender.com/api/bills/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount_usd": 1643.00
  }'
```

---

### PATCH /api/bills/:id/paid

Mark a bill as paid or unpaid.

**Authentication**: Required

**Rate Limit**: 100 requests per minute

**URL Parameters**:
- `id`: Bill ID (integer)

**Request Body**:
```json
{
  "paid": true
}
```

**Success Response** (200):
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Rent",
  "amount_cad": "2250.00",
  "amount_usd": "1607.00",
  "due_date": "2025-10-31",
  "paid": true,
  "paid_at": "2025-10-17T15:30:00.000Z",
  "created_at": "2025-10-17T00:00:00.000Z",
  "updated_at": "2025-10-17T15:30:00.000Z"
}
```

**Examples**:
```bash
# Mark as paid
curl -X PATCH https://your-api.onrender.com/api/bills/1/paid \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paid": true}'

# Mark as unpaid
curl -X PATCH https://your-api.onrender.com/api/bills/1/paid \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paid": false}'
```

---

### DELETE /api/bills/:id

Delete a bill.

**Authentication**: Required

**Rate Limit**: 100 requests per minute

**URL Parameters**:
- `id`: Bill ID (integer)

**Success Response** (200):
```json
{
  "message": "Bill deleted successfully"
}
```

**Error Responses**:
- `404 Not Found`: Bill doesn't exist or doesn't belong to user

**Example**:
```bash
curl -X DELETE https://your-api.onrender.com/api/bills/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Statistics Endpoints

### GET /api/stats

Get overall statistics for authenticated user.

**Authentication**: Required

**Rate Limit**: 100 requests per minute

**Success Response** (200):
```json
{
  "totalEarned": 475.00,
  "totalTarget": 2945.00,
  "remaining": 2470.00,
  "dailyGoal": 274.44,
  "daysLeft": 9
}
```

**Field Descriptions**:
| Field | Description |
|-------|-------------|
| `totalEarned` | Sum of all session earnings (USD) |
| `totalTarget` | Sum of all unpaid bills (USD) |
| `remaining` | Amount still needed (target - earned) |
| `dailyGoal` | Daily earnings needed to meet target |
| `daysLeft` | Days until deadline |

**Example**:
```bash
curl https://your-api.onrender.com/api/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### GET /api/stats/today

Get today's statistics for authenticated user.

**Authentication**: Required

**Rate Limit**: 100 requests per minute

**Success Response** (200):
```json
{
  "hours": "8.00",
  "earnings": "192.00",
  "sessions": "2"
}
```

**Field Descriptions**:
| Field | Description |
|-------|-------------|
| `hours` | Total hours worked today |
| `earnings` | Total earned today (USD) |
| `sessions` | Number of sessions today |

**Example**:
```bash
curl https://your-api.onrender.com/api/stats/today \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Data Management Endpoints

### GET /api/export

Export all user data as JSON.

**Authentication**: Required

**Rate Limit**: 100 requests per minute

**Success Response** (200):
```json
{
  "exportDate": "2025-10-17T15:30:00.000Z",
  "sessions": [
    {
      "id": 1,
      "time_display": "9:00 AM - 5:00 PM",
      "hours": "8.00",
      "rate": "24.00",
      "earnings": "192.00",
      ...
    }
  ],
  "bills": [
    {
      "id": 1,
      "name": "Rent",
      "amount_usd": "1607.00",
      ...
    }
  ]
}
```

**Example**:
```bash
curl https://your-api.onrender.com/api/export \
  -H "Authorization: Bearer YOUR_TOKEN" \
  > export.json
```

---

## Error Handling

### Validation Errors

**Response** (400):
```json
{
  "error": "Validation failed",
  "details": [
    {
      "msg": "Invalid value",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### Authentication Errors

**Token Missing** (401):
```json
{
  "error": "Access token required"
}
```

**Token Expired** (401):
```json
{
  "error": "Token expired"
}
```

**Invalid Token** (403):
```json
{
  "error": "Invalid token"
}
```

### Rate Limit Errors

**Too Many Requests** (429):
```json
{
  "error": "Too many authentication attempts, please try again later"
}
```

---

## Rate Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Auth endpoints | 5 requests | 15 minutes |
| General API | 100 requests | 1 minute |

**Headers**:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Timestamp when limit resets

---

## Testing with cURL

### Complete Workflow Example

```bash
# 1. Register
TOKEN=$(curl -X POST https://your-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test12345"}' \
  | jq -r '.token')

# 2. Create session
curl -X POST https://your-api.onrender.com/api/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-10-17T09:00:00.000Z",
    "date": "2025-10-17",
    "hours": 8,
    "rate": 24,
    "earnings": 192
  }'

# 3. Create bill
curl -X POST https://your-api.onrender.com/api/bills \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rent",
    "amount_cad": 2250,
    "amount_usd": 1607
  }'

# 4. Get stats
curl https://your-api.onrender.com/api/stats \
  -H "Authorization: Bearer $TOKEN"

# 5. Export data
curl https://your-api.onrender.com/api/export \
  -H "Authorization: Bearer $TOKEN" > export.json
```

---

## Postman Collection

Import this collection into Postman for easy API testing:

```json
{
  "info": {
    "name": "Survival Dashboard API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## Changelog

### Version 1.0.0 (2025-10-17)
- Initial API release
- Authentication endpoints
- Session CRUD operations
- Bill tracking
- Statistics and export

---

## Support

For API issues or questions:
- GitHub Issues: [your-repo]/issues
- Email: [your-email]

---

**Last Updated**: October 2025

