# 🎯 Feature Backlog

Ideas and feature requests for future implementation after MVP is complete.

---

## 🎉 Goal Completion UX

### "What's Next?" Approach
**Priority:** HIGH  
**Status:** Backlog

**Idea:** When user meets sprint or daily goal, immediately encourage setting new goals

**Implementation Ideas:**
1. **Sprint Complete:**
   - Show celebration modal: "🎉 Sprint Complete!"
   - Display achievement summary
   - Button: "Set New Sprint" → Opens sprint settings with suggested date
   - Button: "Take a Break" → Dismisses, shows confetti

2. **Daily Goal Complete:**
   - Progress bar shows "✅ GOAL MET!"
   - Show bonus amount: "+$XX extra earned"
   - Subtle prompt: "Keep rolling? New goal: $YY"
   - One-click "Accept" button to set stretch goal

3. **Psychological Benefits:**
   - Creates momentum
   - Reduces decision fatigue
   - Gamification element
   - Immediate positive reinforcement

**Technical Approach:**
- Add `goal_completion_prompts` user setting
- Track goal completion events
- Modal system for celebrations
- Suggested goal calculations based on:
  - Current velocity (hrs/day average)
  - Remaining bills
  - User's historical performance

**UX/UI Design Notes:**
- Non-intrusive (can dismiss easily)
- Celebratory but not obnoxious
- Quick action buttons
- Show progress/momentum metrics

---

## 👤 User Profile & Welcome

### Personalized Welcome Message
**Priority:** MEDIUM  
**Status:** Backlog

**Idea:** Show user's name in header when logged in

**Implementation:**
```html
<h1>🔥 SURVIVAL MODE 🔥</h1>
<div class="header-subtitle">Welcome back, {userName}!</div>
```

**Benefits:**
- Personal touch
- Confirms logged-in state
- Professional feel

---

## 🎭 Demo Mode Enhancements

### Rotating Demo Profiles
**Priority:** LOW  
**Status:** Backlog

**Idea:** Instead of random data, rotate through pre-made "demo profiles"

**Example Profiles:**
1. **"The Freelancer"**
   - Hustling toward rent + living expenses
   - 5 days into 9-day sprint
   - 60% complete, on track

2. **"The Student"**
   - Paying for tuition + books
   - 2 days into sprint
   - Behind schedule, needs 8hrs/day

3. **"The Consultant"**
   - High hourly rate, multiple clients
   - Sprint nearly complete
   - Crushing goals

**Benefits:**
- More realistic demo data
- Shows different use cases
- Consistent for screenshots/demos
- Can highlight specific features per profile

**Implementation:**
- Create `demo-profiles.json` with pre-made data
- Rotate based on: time of day, random, or user selection
- Each profile has: name, sessions, bills, settings, story

---

## 📊 Data Visualization

### Sprint Progress Timeline
**Priority:** MEDIUM  
**Status:** Backlog

**Idea:** Visual timeline showing daily earnings over sprint

**Features:**
- Line graph of earnings per day
- Goal line overlay
- Trend projection
- Peak days highlighted

---

## 🔔 Notifications & Reminders

### Bill Due Date Alerts
**Priority:** MEDIUM  
**Status:** Backlog

**Idea:** Browser notifications for upcoming bills

**Features:**
- 3 days before due date
- Day before due date
- On due date
- Customizable timing
- Option to disable

---

## 💰 Currency Features

### Multi-Currency Support
**Priority:** LOW  
**Status:** Backlog

**Idea:** Support multiple work currencies, not just USD

**Features:**
- Work in EUR, GBP, AUD, etc.
- Auto-conversion to primary currency
- Exchange rate history
- Multiple currency bills

---

## 📈 Analytics & Insights

### Performance Dashboard
**Priority:** MEDIUM  
**Status:** Backlog

**Idea:** Historical performance metrics

**Features:**
- Average hrs/day over time
- Best/worst days
- Sprint completion rate
- Income trends
- Bill payment history

---

## 🎨 Themes & Customization

### Custom Color Schemes
**Priority:** LOW  
**Status:** Backlog

**Idea:** Let users customize the color scheme

**Options:**
- Keep "Survival Mode" dark theme
- Add "Productivity Mode" (lighter, calming)
- Add "Focus Mode" (minimalist, high contrast)
- Custom color picker

---

## 🔗 Integrations

### API Integrations (Future)
**Priority:** VERY LOW  
**Status:** Backlog

**Ideas:**
- **Bank API:** Auto-import bills
- **PayPal API:** Auto-track earnings
- **Google Calendar:** Block out work hours
- **Toggl/Harvest:** Import time tracking
- **Stripe/Wise:** Real-time currency conversion
- **Notion/Todoist:** Sync tasks with earnings

---

## 📱 Mobile App

### Native Mobile Version
**Priority:** LOW  
**Status:** Backlog

**Idea:** iOS/Android app for time tracking on the go

**Features:**
- Quick session logging
- Push notifications for bills
- Widget for today's goal
- Offline mode

---

## 🤝 Collaboration Features

### Team/Household Mode
**Priority:** VERY LOW  
**Status:** Backlog

**Idea:** Multiple users contributing to shared bills

**Features:**
- Shared bill dashboard
- Individual earnings tracking
- Fair split calculations
- Contribution percentages

---

## 🎓 Onboarding & Tutorials

### Interactive Tutorial
**Priority:** MEDIUM  
**Status:** Backlog

**Idea:** First-time user walkthrough

**Features:**
- Highlight key features
- Sample data pre-loaded
- Step-by-step guidance
- Skip option

---

## 🏆 Gamification

### Achievement System
**Priority:** LOW  
**Status:** Backlog

**Ideas:**
- "First Sprint Complete" badge
- "Streak Master" (7 days in a row)
- "Goal Crusher" (exceed daily goal 10x)
- "Bill Ninja" (all bills paid on time)

---

## 💾 Data Management

### Advanced Import/Export
**Priority:** MEDIUM  
**Status:** Backlog (Phase 5 starts this)

**Future Formats:**
- Excel (.xlsx)
- Google Sheets API
- Toggl CSV
- Harvest CSV
- Custom format builder

---

## 🔒 Privacy & Security

### Data Privacy Features
**Priority:** MEDIUM  
**Status:** Backlog

**Ideas:**
- Export all user data (GDPR)
- Delete account option
- Data encryption at rest
- 2FA (two-factor authentication)
- Session management

---

## 📅 Advanced Sprint Features

### Sprint Templates
**Priority:** LOW  
**Status:** Backlog

**Idea:** Save and reuse sprint configurations

**Features:**
- "Rent Week" template
- "Tuition Sprint" template
- "Holiday Savings" template
- Custom template creation

---

## 🎯 Smart Goal Setting

### AI-Assisted Goal Recommendations
**Priority:** VERY LOW  
**Status:** Backlog

**Idea:** ML-based goal suggestions

**Features:**
- Analyze historical performance
- Suggest realistic daily goals
- Predict sprint completion
- Adjust for trends

---

## 📧 Email Reports

### Weekly Summary Emails
**Priority:** LOW  
**Status:** Backlog

**Idea:** Optional email digest of performance

**Features:**
- Weekly earnings summary
- Upcoming bills
- Sprint progress
- Achievements unlocked
- Opt-in only

---

## 🌍 Localization

### Multi-Language Support
**Priority:** VERY LOW  
**Status:** Backlog

**Languages:**
- Spanish
- French
- German
- Portuguese
- Mandarin

---

Last Updated: October 17, 2025  
Total Features: 20+  
Priority Distribution: 5 HIGH/MED, 15 LOW/VERY LOW

