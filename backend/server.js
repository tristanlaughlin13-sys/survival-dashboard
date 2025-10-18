require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult, param, query } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Database Connection =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected successfully');
  }
});

// ===== Security Middleware =====
app.use(helmet());

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:8000', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Blocked CORS request from: ${origin}`);
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());

// ===== JWT Authentication Middleware =====
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

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

// ===== Validation Middleware =====
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// ===== Health Check Endpoint =====
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});

// ===== Authentication Routes =====

// Register
app.post('/api/auth/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty().withMessage('Name is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    const { email, password, name } = req.body;

    try {
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const result = await pool.query(
        'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
        [email, passwordHash, name]
      );

      const user = result.rows[0];

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log(`✅ New user registered: ${email}`);

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Login
app.post('/api/auth/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  handleValidationErrors,
  async (req, res) => {
    const { email, password } = req.body;

    try {
      // Find user
      const result = await pool.query(
        'SELECT id, email, name, password_hash FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log(`✅ User logged in: ${email}`);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Get current user profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, created_at, last_login FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ===== Session Routes =====

// Get all sessions (with optional filters)
app.get('/api/sessions',
  authenticateToken,
  apiLimiter,
  [
    query('date').optional().isISO8601(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { date, startDate, endDate } = req.query;
      let query = 'SELECT * FROM sessions WHERE user_id = $1';
      const params = [req.user.id];
      let paramIndex = 2;

      if (date) {
        query += ` AND date = $${paramIndex}`;
        params.push(date);
        paramIndex++;
      } else if (startDate && endDate) {
        query += ` AND date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        params.push(startDate, endDate);
        paramIndex += 2;
      } else if (startDate) {
        query += ` AND date >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      } else if (endDate) {
        query += ` AND date <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }

      query += ' ORDER BY timestamp DESC';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Fetch sessions error:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  }
);

// Create session
app.post('/api/sessions',
  authenticateToken,
  apiLimiter,
  [
    body('timestamp').isISO8601(),
    body('date').isISO8601(),
    body('hours').isFloat({ min: 0 }),
    body('rate').isFloat({ min: 0 }),
    body('earnings').isFloat({ min: 0 }),
    body('time_display').optional().isString(),
    body('note').optional().isString(),
    body('is_leisure').optional().isBoolean(),
    body('opportunity_cost').optional().isFloat({ min: 0 }),
    body('is_manual').optional().isBoolean()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        time_display,
        timestamp,
        date,
        hours,
        rate,
        earnings,
        note,
        is_leisure,
        opportunity_cost,
        is_manual
      } = req.body;

      const result = await pool.query(
        `INSERT INTO sessions 
        (user_id, time_display, timestamp, date, hours, rate, earnings, note, is_leisure, opportunity_cost, is_manual)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          req.user.id,
          time_display || null,
          timestamp,
          date,
          hours,
          rate,
          earnings,
          note || null,
          is_leisure || false,
          opportunity_cost || 0,
          is_manual !== undefined ? is_manual : true
        ]
      );

      console.log(`✅ Session created for user ${req.user.email}: ${hours}h, $${earnings}`);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  }
);

// Update session
app.put('/api/sessions/:id',
  authenticateToken,
  apiLimiter,
  [
    param('id').isInt(),
    body('hours').optional().isFloat({ min: 0 }),
    body('rate').optional().isFloat({ min: 0 }),
    body('earnings').optional().isFloat({ min: 0 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verify ownership
      const checkOwnership = await pool.query(
        'SELECT id FROM sessions WHERE id = $1 AND user_id = $2',
        [id, req.user.id]
      );

      if (checkOwnership.rows.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      const allowedFields = ['time_display', 'timestamp', 'date', 'hours', 'rate', 'earnings', 'note', 'is_leisure', 'opportunity_cost'];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateFields.push(`${field} = $${paramIndex}`);
          updateValues.push(req.body[field]);
          paramIndex++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateValues.push(id, req.user.id);

      const result = await pool.query(
        `UPDATE sessions SET ${updateFields.join(', ')} 
         WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
         RETURNING *`,
        updateValues
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update session error:', error);
      res.status(500).json({ error: 'Failed to update session' });
    }
  }
);

// Delete session
app.delete('/api/sessions/:id',
  authenticateToken,
  apiLimiter,
  [param('id').isInt()],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM sessions WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }

      console.log(`✅ Session deleted: ${id}`);

      res.json({ message: 'Session deleted successfully' });
    } catch (error) {
      console.error('Delete session error:', error);
      res.status(500).json({ error: 'Failed to delete session' });
    }
  }
);

// ===== Bills Routes =====

// Get all bills
app.get('/api/bills', authenticateToken, apiLimiter, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bills WHERE user_id = $1 ORDER BY due_date ASC, created_at DESC',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Fetch bills error:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// Create bill
app.post('/api/bills',
  authenticateToken,
  apiLimiter,
  [
    body('name').trim().notEmpty(),
    body('amount_cad').isFloat({ min: 0 }),
    body('amount_usd').isFloat({ min: 0 }),
    body('due_date').optional().isISO8601()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, amount_cad, amount_usd, due_date } = req.body;

      const result = await pool.query(
        `INSERT INTO bills (user_id, name, amount_cad, amount_usd, due_date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [req.user.id, name, amount_cad, amount_usd, due_date || null]
      );

      console.log(`✅ Bill created for user ${req.user.email}: ${name}`);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create bill error:', error);
      res.status(500).json({ error: 'Failed to create bill' });
    }
  }
);

// Update bill
app.put('/api/bills/:id',
  authenticateToken,
  apiLimiter,
  [
    param('id').isInt(),
    body('name').optional().trim().notEmpty(),
    body('amount_cad').optional().isFloat({ min: 0 }),
    body('amount_usd').optional().isFloat({ min: 0 }),
    body('due_date').optional().isISO8601()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verify ownership
      const checkOwnership = await pool.query(
        'SELECT id FROM bills WHERE id = $1 AND user_id = $2',
        [id, req.user.id]
      );

      if (checkOwnership.rows.length === 0) {
        return res.status(404).json({ error: 'Bill not found' });
      }

      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      const allowedFields = ['name', 'amount_cad', 'amount_usd', 'due_date'];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateFields.push(`${field} = $${paramIndex}`);
          updateValues.push(req.body[field]);
          paramIndex++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateValues.push(id, req.user.id);

      const result = await pool.query(
        `UPDATE bills SET ${updateFields.join(', ')} 
         WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
         RETURNING *`,
        updateValues
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update bill error:', error);
      res.status(500).json({ error: 'Failed to update bill' });
    }
  }
);

// Mark bill as paid/unpaid
app.patch('/api/bills/:id/paid',
  authenticateToken,
  apiLimiter,
  [
    param('id').isInt(),
    body('paid').isBoolean()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { paid } = req.body;

      const result = await pool.query(
        `UPDATE bills 
         SET paid = $1, paid_at = CASE WHEN $1 THEN CURRENT_TIMESTAMP ELSE NULL END
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        [paid, id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Bill not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update bill paid status error:', error);
      res.status(500).json({ error: 'Failed to update bill' });
    }
  }
);

// Delete bill
app.delete('/api/bills/:id',
  authenticateToken,
  apiLimiter,
  [param('id').isInt()],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM bills WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Bill not found' });
      }

      res.json({ message: 'Bill deleted successfully' });
    } catch (error) {
      console.error('Delete bill error:', error);
      res.status(500).json({ error: 'Failed to delete bill' });
    }
  }
);

// ===== Statistics Routes =====

// Get overall stats
app.get('/api/stats', authenticateToken, apiLimiter, async (req, res) => {
  try {
    const deadline = new Date(process.env.DEADLINE_DATE || '2025-10-24T23:59:59');
    const now = new Date();
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

    // Get total earned
    const earnedResult = await pool.query(
      'SELECT COALESCE(SUM(earnings), 0) as total FROM sessions WHERE user_id = $1',
      [req.user.id]
    );

    // Get total bills (unpaid only)
    const billsResult = await pool.query(
      'SELECT COALESCE(SUM(amount_usd), 0) as total FROM bills WHERE user_id = $1 AND paid = false',
      [req.user.id]
    );

    const totalEarned = parseFloat(earnedResult.rows[0].total);
    const totalTarget = parseFloat(billsResult.rows[0].total);
    const remaining = totalTarget - totalEarned;
    const dailyGoal = daysLeft > 0 ? remaining / daysLeft : 0;

    res.json({
      totalEarned,
      totalTarget,
      remaining,
      dailyGoal,
      daysLeft
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get today's stats
app.get('/api/stats/today', authenticateToken, apiLimiter, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT 
        COALESCE(SUM(hours), 0) as hours,
        COALESCE(SUM(earnings), 0) as earnings,
        COUNT(*) as sessions
       FROM sessions 
       WHERE user_id = $1 AND date = $2`,
      [req.user.id, today]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Today stats error:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s statistics' });
  }
});

// ===== Data Export =====

app.get('/api/export', authenticateToken, apiLimiter, async (req, res) => {
  try {
    const sessionsResult = await pool.query(
      'SELECT * FROM sessions WHERE user_id = $1 ORDER BY timestamp DESC',
      [req.user.id]
    );

    const billsResult = await pool.query(
      'SELECT * FROM bills WHERE user_id = $1 ORDER BY due_date ASC',
      [req.user.id]
    );

    res.json({
      exportDate: new Date().toISOString(),
      sessions: sessionsResult.rows,
      bills: billsResult.rows
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Export bills as CSV
app.get('/api/bills/export-csv', authenticateToken, apiLimiter, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bills WHERE user_id = $1 ORDER BY due_date ASC, created_at DESC',
      [req.user.id]
    );

    // Generate CSV
    const bills = result.rows;
    let csv = 'Name,Amount (CAD),Amount (USD),Due Date,Paid\n';

    bills.forEach(bill => {
      csv += `"${bill.name}",${bill.amount_cad},${bill.amount_usd},${bill.due_date || ''},${bill.paid ? 'Yes' : 'No'}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="bills-export-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export bills as CSV' });
  }
});

// Import bills from CSV (expects CSV with headers: Name,Amount (CAD),Amount (USD),Due Date,Paid)
app.post('/api/bills/import-csv',
  authenticateToken,
  apiLimiter,
  [
    body('csvData').isString().notEmpty()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { csvData } = req.body;
      const lines = csvData.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        return res.status(400).json({ error: 'CSV file is empty or invalid' });
      }

      // Skip header line
      const dataLines = lines.slice(1);
      const imported = [];
      const errors = [];

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i];
        // Simple CSV parsing (handles quoted fields)
        const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);

        if (!matches || matches.length < 5) {
          errors.push({ line: i + 2, error: 'Invalid CSV format' });
          continue;
        }

        const [name, amountCAD, amountUSD, dueDate, paid] = matches.map(m => m.replace(/^"|"$/g, '').trim());

        try {
          const result = await pool.query(
            `INSERT INTO bills (user_id, name, amount_cad, amount_usd, due_date, paid)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
              req.user.id,
              name || 'Imported Bill',
              parseFloat(amountCAD) || 0,
              parseFloat(amountUSD) || 0,
              dueDate || null,
              paid?.toLowerCase() === 'yes' || paid?.toLowerCase() === 'true'
            ]
          );
          imported.push(result.rows[0]);
        } catch (error) {
          console.error(`Error importing bill line ${i + 2}:`, error);
          errors.push({ line: i + 2, error: error.message });
        }
      }

      res.json({
        message: 'Import completed',
        imported: imported.length,
        errors: errors.length,
        details: errors
      });
    } catch (error) {
      console.error('CSV import error:', error);
      res.status(500).json({ error: 'Failed to import bills from CSV' });
    }
  }
);

// ===== User Settings Routes =====

// Get user settings (create default if not exists)
app.get('/api/settings', authenticateToken, apiLimiter, async (req, res) => {
  try {
    let result = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [req.user.id]
    );

    // If no settings exist, create default settings
    if (result.rows.length === 0) {
      result = await pool.query(
        `INSERT INTO user_settings (user_id)
         VALUES ($1)
         RETURNING *`,
        [req.user.id]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Fetch settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update user settings
app.put('/api/settings',
  authenticateToken,
  apiLimiter,
  [
    body('sprint_end_date').optional().isISO8601(),
    body('target_bills_mode').optional().isIn(['auto_unpaid', 'auto_all', 'manual']),
    body('target_bills_manual').optional().isFloat({ min: 0 }),
    body('initial_balance').optional().isFloat({ min: 0 }),
    body('initial_balance_currency').optional().isIn(['USD', 'CAD']),
    body('default_hourly_rate').optional().isFloat({ min: 0 }),
    body('tax_reserve_rate').optional().isFloat({ min: 0, max: 100 }),
    body('exchange_rate_cad_to_usd').optional().isFloat({ min: 0 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      // First, ensure settings exist
      let checkResult = await pool.query(
        'SELECT id FROM user_settings WHERE user_id = $1',
        [req.user.id]
      );

      if (checkResult.rows.length === 0) {
        await pool.query(
          'INSERT INTO user_settings (user_id) VALUES ($1)',
          [req.user.id]
        );
      }

      // Build update query
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      const allowedFields = [
        'sprint_end_date',
        'target_bills_mode',
        'target_bills_manual',
        'initial_balance',
        'initial_balance_currency',
        'default_hourly_rate',
        'tax_reserve_rate',
        'exchange_rate_cad_to_usd'
      ];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateFields.push(`${field} = $${paramIndex}`);
          updateValues.push(req.body[field]);
          paramIndex++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateValues.push(req.user.id);

      const result = await pool.query(
        `UPDATE user_settings SET ${updateFields.join(', ')}
         WHERE user_id = $${paramIndex}
         RETURNING *`,
        updateValues
      );

      console.log(`✅ Settings updated for user ${req.user.email}`);

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }
);

// ===== Error Handling =====

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ===== Start Server =====

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 CORS enabled for: ${allowedOrigins.join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  pool.end();
  process.exit(0);
});

