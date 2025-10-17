# 🎭 Guest/Demo Mode Feature Plan

## Executive Summary
Create a fully functional demo version of the dashboard that:
- Acts as the landing page (no auth required)
- Generates realistic fake data dynamically
- Allows users to interact with features
- Has Login/Register buttons prominently displayed
- Data doesn't persist (session-only)
- Can be used to demo the app to friends without exposing personal data

---

## User Experience Flow

### Landing on Site (Not Logged In)
```
1. User visits https://survival-dashboard.netlify.app
2. Dashboard loads immediately with DEMO MODE banner
3. Fake data is displayed (randomized on each visit)
4. Top right shows: [Login] [Register] buttons
5. Prominent banner: "You're in Demo Mode - Create an account to save your data"
6. User can fully interact: add/edit/delete sessions & bills
7. Changes stored in sessionStorage (lost on tab close)
8. Click Login → Modal appears over dashboard
9. After login → Seamlessly transition to real user data
```

### Demo Mode Features
- ✅ All features work (add/edit/delete sessions & bills)
- ✅ Stats calculate in real-time
- ✅ Timer works
- ✅ Settings can be changed (session-only)
- ✅ Export works (downloads demo data)
- ✅ Import disabled (or shows "Create account to import")
- ⚠️ Persistent reminder that data won't be saved
- 🎨 Visual distinction (banner, watermark, different color accent?)

---

## Technical Architecture

### Option A: Client-Side Only (Recommended)
**Pros:**
- No backend changes needed
- Instant load (no API calls)
- Works offline
- No server costs for demo users

**Cons:**
- Can't share demo sessions (each user gets random data)
- SessionStorage limits (~5MB)

**Implementation:**
```javascript
// On page load
if (!isLoggedIn()) {
    loadDemoMode();
} else {
    loadUserData();
}

function loadDemoMode() {
    // Generate fake data
    sessions = generateRandomSessions();
    bills = generateRandomBills();
    userSettings = generateDemoSettings();
    
    // Store in sessionStorage
    sessionStorage.setItem('demoMode', 'true');
    sessionStorage.setItem('demoSessions', JSON.stringify(sessions));
    sessionStorage.setItem('demoBills', JSON.stringify(bills));
    
    // Render dashboard
    renderDashboard();
    showDemoModeBanner();
}
```

### Option B: Shared Demo Account
**Pros:**
- Everyone sees same demo data
- Can pre-populate with "perfect" example data
- Easier to demo specific features

**Cons:**
- Requires backend modification
- Demo data can be messed up by trolls
- Need to reset demo account periodically

**NOT RECOMMENDED** - Too complex, can be gamed

---

## Data Generation Strategy

### Realistic Fake Data Generator

#### Sessions (15-25 random entries)
```javascript
function generateRandomSessions() {
    const sessions = [];
    const today = new Date();
    const names = ['Client Project', 'Freelance Work', 'Side Gig', 'Consulting', 'Development'];
    const rates = [45, 55, 65, 75, 85];
    
    for (let i = 0; i < 20; i++) {
        const daysAgo = Math.floor(Math.random() * 14); // Last 2 weeks
        const date = new Date(today - daysAgo * 24 * 60 * 60 * 1000);
        const hours = (Math.random() * 6 + 1).toFixed(2); // 1-7 hours
        const rate = rates[Math.floor(Math.random() * rates.length)];
        const earnings = (hours * rate).toFixed(2);
        
        sessions.push({
            id: `demo-${i}`,
            time_display: date.toLocaleTimeString(),
            timestamp: date.toISOString(),
            date: date.toISOString().split('T')[0],
            hours: parseFloat(hours),
            rate: parseFloat(rate),
            earnings: parseFloat(earnings),
            note: names[Math.floor(Math.random() * names.length)],
            is_leisure: false,
            opportunity_cost: 0,
            is_manual: true
        });
    }
    
    return sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}
```

#### Bills (7-12 random entries)
```javascript
function generateRandomBills() {
    const billTypes = [
        { name: 'Rent', cadRange: [1200, 2500], usdFactor: 0.72 },
        { name: 'Groceries', cadRange: [150, 400], usdFactor: 0.72 },
        { name: 'Utilities', cadRange: [80, 200], usdFactor: 0.72 },
        { name: 'Internet', cadRange: [60, 120], usdFactor: 0.72 },
        { name: 'Phone Bill', cadRange: [30, 80], usdFactor: 0.72 },
        { name: 'Credit Card', cadRange: [100, 800], usdFactor: 0.72 },
        { name: 'Insurance', cadRange: [150, 400], usdFactor: 0.72 },
        { name: 'Gas', cadRange: [50, 150], usdFactor: 0.72 }
    ];
    
    const bills = [];
    const billCount = Math.floor(Math.random() * 6) + 7; // 7-12 bills
    
    for (let i = 0; i < billCount; i++) {
        const billType = billTypes[Math.floor(Math.random() * billTypes.length)];
        const amountCAD = (Math.random() * (billType.cadRange[1] - billType.cadRange[0]) + billType.cadRange[0]).toFixed(2);
        const amountUSD = (amountCAD * billType.usdFactor).toFixed(2);
        const daysUntilDue = Math.floor(Math.random() * 30) - 5; // -5 to +25 days
        const dueDate = new Date(Date.now() + daysUntilDue * 24 * 60 * 60 * 1000);
        const paid = daysUntilDue < 0 ? (Math.random() > 0.3) : false; // 70% of past bills are paid
        
        bills.push({
            id: `demo-bill-${i}`,
            name: `${billType.name}${Math.random() > 0.7 ? ' (Upcoming)' : ''}`,
            amount_cad: parseFloat(amountCAD),
            amount_usd: parseFloat(amountUSD),
            due_date: dueDate.toISOString().split('T')[0],
            paid: paid,
            paid_at: paid ? new Date(dueDate.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() : null
        });
    }
    
    return bills.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
}
```

#### Settings
```javascript
function generateDemoSettings() {
    const sprintEnd = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000); // 9 days from now
    
    return {
        sprint_end_date: sprintEnd.toISOString(),
        target_bills_mode: 'auto_unpaid',
        target_bills_manual: 0,
        initial_balance: Math.floor(Math.random() * 500 + 200), // $200-$700
        initial_balance_currency: Math.random() > 0.5 ? 'USD' : 'CAD',
        default_hourly_rate: [45, 55, 65, 75][Math.floor(Math.random() * 4)],
        tax_reserve_rate: [25, 30, 35][Math.floor(Math.random() * 3)],
        exchange_rate_cad_to_usd: 0.7143
    };
}
```

---

## UI/UX Design

### Demo Mode Banner
```html
<div class="demo-banner">
    🎭 DEMO MODE - You're trying out the app! 
    <button onclick="showRegisterModal()">Create Account to Save Data</button>
    <button onclick="dismissBanner()">Dismiss</button>
</div>
```

**Styling:**
- Bright gradient background (e.g., purple/blue)
- Sticky to top (stays visible while scrolling)
- Dismiss button (hides banner but not mode)
- Create Account button (prominent, calls to action)

### Login/Register Buttons
```html
<div class="auth-buttons">
    <button class="btn-outline" onclick="showLoginModal()">Login</button>
    <button class="btn-primary" onclick="showRegisterModal()">Register</button>
</div>
```

**Placement:** Top right of header (where burger menu currently is for guests)

### Modal-Based Auth (Not Redirect)
- Login/Register open as modals OVER the dashboard
- User can see demo data in background
- After successful auth, modal closes and data refreshes
- Smooth transition (no full page reload)

---

## Implementation Checklist

### Phase 1: Core Demo Mode (2-3 hours)
- [ ] Create `generateRandomSessions()` function
- [ ] Create `generateRandomBills()` function
- [ ] Create `generateDemoSettings()` function
- [ ] Add `loadDemoMode()` function
- [ ] Modify page load to check auth status first
- [ ] Store demo data in sessionStorage
- [ ] Add demo mode banner HTML/CSS
- [ ] Add auth buttons to header
- [ ] Test: Visit site without login → See demo data

### Phase 2: Auth Integration (1-2 hours)
- [ ] Convert login form to modal (instead of separate page)
- [ ] Convert register form to modal
- [ ] Add modal overlay and animations
- [ ] Handle successful login → refresh to user data
- [ ] Handle logout → return to demo mode
- [ ] Test: Demo → Login → See real data → Logout → Demo again

### Phase 3: Demo Mode Interactions (1-2 hours)
- [ ] Add/Edit/Delete sessions in demo mode (sessionStorage)
- [ ] Add/Edit/Delete bills in demo mode (sessionStorage)
- [ ] Settings changes in demo mode (sessionStorage)
- [ ] Export demo data (works as normal)
- [ ] Import disabled with "Create account" message
- [ ] Test: All CRUD operations work without backend

### Phase 4: Polish & Edge Cases (1 hour)
- [ ] Add visual distinction (demo watermark?)
- [ ] Handle session expiry (regenerate data on new session)
- [ ] Handle localStorage quota exceeded (fallback to in-memory)
- [ ] Add tooltips/hints explaining demo mode
- [ ] Test on mobile
- [ ] Test transition flows exhaustively

---

## File Structure Changes

```
frontend/
├── index.html (modified)
├── login.html (DEPRECATED - convert to modal)
├── js/
│   ├── api.js (add demo mode bypass)
│   ├── demo-generator.js (NEW - fake data generators)
│   └── auth-modal.js (NEW - login/register modals)
└── css/
    └── demo-mode.css (NEW - demo-specific styles)
```

---

## Code Snippets

### Main Entry Point Modification
```javascript
// At the very start of <script> in index.html

async function initializeApp() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        // No token = demo mode
        loadDemoMode();
        showAuthButtons();
        showDemoModeBanner();
    } else {
        // Has token = try to load user data
        try {
            currentUser = await window.api.getProfile();
            await loadDashboardData();
            initializeTimers();
            showUserMenu(); // Burger menu
        } catch (error) {
            // Token expired/invalid = fallback to demo
            localStorage.removeItem('authToken');
            loadDemoMode();
            showAuthButtons();
            showDemoModeBanner();
        }
    }
}

// Call on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
```

### Demo Mode Storage Wrapper
```javascript
// Wrap all API calls to use sessionStorage in demo mode
function isDemoMode() {
    return !localStorage.getItem('authToken');
}

async function getSessions() {
    if (isDemoMode()) {
        const stored = sessionStorage.getItem('demoSessions');
        return stored ? JSON.parse(stored) : generateRandomSessions();
    } else {
        return await window.api.getSessions();
    }
}

async function createSession(sessionData) {
    if (isDemoMode()) {
        const sessions = await getSessions();
        sessionData.id = `demo-${Date.now()}`;
        sessions.unshift(sessionData);
        sessionStorage.setItem('demoSessions', JSON.stringify(sessions));
        return sessionData;
    } else {
        return await window.api.createSession(sessionData);
    }
}

// Repeat for bills, settings, etc.
```

---

## Benefits

### For You
- ✅ Easy to demo to friends without screen sharing
- ✅ Can share a link instead of walking through features
- ✅ No risk of exposing personal financial data
- ✅ Professional landing page (not just login screen)

### For New Users
- ✅ See the app in action before committing
- ✅ Try features risk-free (no signup required)
- ✅ Understand value proposition immediately
- ✅ Lower barrier to entry

### For Recruitment/Portfolio
- ✅ Hiring managers can try it instantly
- ✅ No need to create accounts for demos
- ✅ Shows UX thoughtfulness
- ✅ Demonstrates full-stack capabilities

---

## Potential Enhancements (Phase 2)

1. **Shareable Demo Seeds**
   - URL param like `?demo=12345` loads specific fake data
   - Can share "This is what working 40 hrs/week looks like" scenarios

2. **Guided Tour**
   - Highlight features one by one
   - "Try adding a session!" tooltips
   - Tutorial mode for first-time users

3. **"Convert to Real Account" Flow**
   - Button to "Keep this data and create account"
   - Demo data gets saved to new user account
   - Seamless upgrade path

4. **Analytics**
   - Track which features demo users try
   - See where they drop off
   - Optimize onboarding flow

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Demo users never convert | Add persistent CTA, limit demo features after X minutes |
| SessionStorage limits | Add quota check, graceful fallback to in-memory |
| Confusion between demo/real | Clear visual distinction, banner, watermarks |
| Poor demo data | Test with real scenarios, iterate on generators |
| Performance issues | Lazy load demo data, optimize generators |

---

## Success Metrics

- ✅ Demo mode loads in < 1 second
- ✅ All features work identically to logged-in mode
- ✅ Data persists within browser session
- ✅ Smooth transition from demo → logged in
- ✅ No console errors in demo mode
- ✅ Mobile-friendly

---

## Estimated Time
- **Planning:** 30 min (this document)
- **Phase 1:** 2-3 hours
- **Phase 2:** 1-2 hours
- **Phase 3:** 1-2 hours
- **Phase 4:** 1 hour
- **Total:** **~6-9 hours** of focused development

---

## Next Steps

1. **Review this plan** - Any changes to scope/approach?
2. **Approve architecture** - Client-side only vs shared demo account?
3. **Prioritize features** - MVP first or full feature set?
4. **Begin implementation** - Start with Phase 1?

---

**Ready to build?** 🚀

