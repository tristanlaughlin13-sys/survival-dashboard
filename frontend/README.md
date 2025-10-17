# Survival Dashboard Frontend

Beautiful, responsive frontend for time tracking and financial goal management.

## Features

- 🔐 Secure login and registration
- ⏱️ Live work timer with manual entry
- 📊 Real-time progress tracking
- 💸 Bill tracking with payment status
- 📈 Statistics and daily goals
- 📥 Data export functionality
- 🎨 Modern gradient design
- 📱 Responsive layout

## Tech Stack

- **Vanilla JavaScript** - No frameworks, pure performance
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **Fetch API** - Clean API communication

## Project Structure

```
frontend/
├── index.html          # Main dashboard (authenticated users)
├── login.html          # Login/registration page
└── js/
    └── api.js          # API communication layer
```

## Setup

### Local Development

1. **Start a local server** (required for API calls):

   Option A - Python:
   ```bash
   python -m http.server 8000
   ```

   Option B - npx:
   ```bash
   npx serve
   ```

   Option C - http-server:
   ```bash
   npx http-server -p 8000
   ```

2. **Open in browser**:
   ```
   http://localhost:8000/login.html
   ```

### Configure API URL

Edit `js/api.js`:

```javascript
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://your-backend-url.onrender.com'; // ← Change this
```

## Usage

### First Time Setup

1. Navigate to `/login.html`
2. Click "Register" tab
3. Create your account
4. Start tracking work!

### Features

**Work Timer**:
- Click "Start Timer" to begin tracking
- Click "Stop & Save" to save session
- Or use "Manual Entry" for past sessions

**Bills Tracker**:
- Add bills with CAD and USD amounts
- Mark bills as paid
- Track due dates

**Statistics**:
- Real-time progress toward goal
- Daily earning targets
- Days remaining until deadline

**Data Export**:
- Export all data as JSON
- Backup your records

## Deployment

### Netlify (Recommended)

1. Connect GitHub repository
2. Build settings:
   - Base directory: `frontend`
   - Build command: (empty)
   - Publish directory: `.`
3. Deploy!

### Vercel

1. Import repository
2. Root directory: `frontend`
3. Framework: Other
4. Deploy!

### AWS Amplify

1. Connect repository
2. App root: `frontend`
3. Build command: (empty)
4. Deploy!

See [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for detailed instructions.

## API Integration

All API calls go through `js/api.js`:

```javascript
// Example usage
const api = window.api;

// Login
await api.login(email, password);

// Create session
await api.createSession({
  timestamp: new Date().toISOString(),
  date: '2025-10-17',
  hours: 8,
  rate: 24,
  earnings: 192
});

// Get statistics
const stats = await api.getStats();
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Modern browsers with ES6 support required.

## Customization

### Change Colors

Edit the CSS in `index.html` and `login.html`:

```css
/* Main gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Accent colors */
.stat-value.positive { color: #28a745; }
.stat-value.negative { color: #dc3545; }
```

### Change Deadline

Update in backend environment variables:
```
DEADLINE_DATE=2025-10-24T23:59:59
```

### Change Currency

Currently supports CAD and USD. To add more currencies:
1. Update database schema (add columns)
2. Update API endpoints
3. Update frontend forms

## Security

- Tokens stored in localStorage
- All API calls use Bearer token authentication
- Auto-logout on 401 responses
- HTTPS enforced in production

## Troubleshooting

### Can't login after registration
- Check browser console for errors
- Verify API_URL in `js/api.js`
- Ensure backend is running

### CORS errors
- Add frontend URL to backend `ALLOWED_ORIGINS`
- Restart backend server

### Timer not saving
- Check network tab for API errors
- Verify authentication token is valid
- Check backend logs

## License

MIT

