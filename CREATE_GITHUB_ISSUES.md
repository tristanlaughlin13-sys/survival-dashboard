# GitHub Issues to Create

Go to: https://github.com/tristanlaughlin13-sys/survival-dashboard/issues/new

Copy-paste each issue below:

---

## Issue 1: [FEATURE] Realistic Demo Data Generation

**Labels:** `enhancement`, `guest-mode`, `medium-priority`

**Description:**
Currently the demo/guest mode generates truly random data which often shows a 100% complete sprint. This isn't realistic and doesn't showcase the app well.

**Problem:**
- Often shows sprint 100% complete (not realistic)
- Today's goal shows $0 (because sprint complete)
- Random data doesn't simulate realistic usage patterns

**Proposed Solution:**
Weight data generation so 90% of cases show incomplete sprint:
- Sprint config: 2-4 days left (not complete)
- Work sessions: 60-80% of target earned so far
- Today: 20-60% of daily goal complete
- Bills: 40% paid, 60% unpaid, mix of overdue/upcoming

**Benefits:**
- Better first impression for new users
- Showcases app's actual use case (tracking incomplete sprint)
- More realistic for demos and screenshots

**Estimated Time:** 45 minutes

**Files to Modify:**
- `frontend/js/demo.js` - Data generation functions

**Related:**
- Phase B from Bugfix Round 2 Plan

---

## Issue 2: [FEATURE] Compact Layout - Stack Bills Breakdown + Tax Tracker

**Labels:** `enhancement`, `ui`, `medium-priority`

**Description:**
Reorganize the Bills Breakdown and Tax Tracker cards to use vertical space more efficiently.

**Current Layout:**
```
[Bills Breakdown - Full Height]
  - Bills Total (CAD)
  - Bills Total (USD)
  - USD + Tax (33%)    ← REMOVE THIS
  - Covered %
```

**Proposed Layout:**
```
[Bills Breakdown - Half Height]
  - Bills Total (CAD) | Bills Total (USD) | Covered %

[Tax Reserve Tracker - Half Height]
  - Total Earned | Tax Reserve | After Tax | Rate %
```

**Benefits:**
- Better use of screen space
- More professional, compact look
- USD + Tax stat is redundant (tax tracker shows this)

**Estimated Time:** 20 minutes

**Files to Modify:**
- `frontend/index.html` - Remove USD + Tax stat
- `frontend/css/layout.css` - Add `.compact-stats-row` wrapper
- `frontend/css/components.css` - Card sizing adjustments

**Related:**
- Phase C from Bugfix Round 2 Plan

---

## Issue 3: [FEATURE] Redesign Bill Cards for Better Mobile UX

**Labels:** `enhancement`, `ui`, `mobile`, `medium-priority`

**Description:**
Bill cards are currently too tall with poor text hierarchy and space-consuming button layout.

**Current Problems:**
- Bill cards too tall (takes up lots of screen space)
- Text stacking poorly (name/amount huge, date/USD tiny and off-screen)
- 3 separate buttons taking too much horizontal space
- Not mobile-friendly

**Proposed Solution:**
1. **Horizontal flex layout:** `[Name + Amount] [Due Date] [Actions ⋮]`
2. **Combine buttons into menu:** Click ⋮ → dropdown with Edit/Mark Paid/Delete
3. **Reduce card height:** 80px → 60px
4. **Better text sizing:** Proportional hierarchy

**Benefits:**
- Cleaner, more compact display
- More bills visible on screen
- Better mobile experience
- Professional appearance

**Estimated Time:** 30 minutes

**Files to Modify:**
- `frontend/index.html` - Bill card HTML structure, add menu
- `frontend/css/components.css` - Bill card styles
- `frontend/index.html` - Add menu toggle functions

**Related:**
- Phase D from Bugfix Round 2 Plan

---

## Issue 4: [FEATURE] Collapsible Date Groups in Session History

**Labels:** `enhancement`, `ui`, `low-priority`

**Description:**
Add ability to collapse/expand date groups in session history for better organization.

**Proposed Implementation:**
- Add chevron icon to date group headers: `▼` (expanded) / `▶` (collapsed)
- Click date header to toggle `.collapsed` class
- CSS transition for smooth collapse animation
- Save collapsed state in localStorage (persist across refreshes)

**Benefits:**
- Easier to navigate long session histories
- Focus on specific date ranges
- Cleaner, more organized view

**Example:**
```
▼ October 17, 2025 (3 sessions)
  - 2:00 PM - 4:30 PM | 2.5h @ $55/h | $137.50
  - ...

▶ October 16, 2025 (2 sessions)
```

**Estimated Time:** 20 minutes

**Files to Modify:**
- `frontend/index.html` - Add chevron, toggle function
- `frontend/css/components.css` - Collapse transitions

**Related:**
- Phase E1 from Bugfix Round 2 Plan

---

## Issue 5: [FEATURE] Improve Demo Banner UX

**Labels:** `enhancement`, `ui`, `low-priority`

**Description:**
The demo banner has some UX issues that should be addressed.

**Current Problems:**
- Covers login/register buttons (accessibility issue)
- Purple color doesn't match color scheme
- Too persistent (stays visible indefinitely)

**Proposed Solutions:**
1. **Position:** Move below header (not fixed to top) so it doesn't cover buttons
2. **Color:** Change to red/orange accent to match app theme
3. **Auto-hide:** Dismiss after 10 seconds OR on scroll
4. **Keep X button:** Still allow manual dismissal

**Benefits:**
- Better accessibility (login buttons always visible)
- Consistent color scheme
- Less intrusive for users who want to explore

**Estimated Time:** 15 minutes

**Files to Modify:**
- `frontend/index.html` - Banner positioning, auto-hide logic
- `frontend/css/components.css` - Banner colors, animations

**Related:**
- Phase E2 from Bugfix Round 2 Plan

---

## Instructions for Creating Issues

1. Go to https://github.com/YOUR_USERNAME/survival-dashboard/issues
2. Click "New Issue"
3. Copy-paste the title and content
4. Add the suggested labels (create them if they don't exist)
5. Optionally create a "Bugfix Round 2" milestone
6. Assign to yourself if you plan to work on it

## Recommended Labels to Create

- `bug` (red) - Something isn't working
- `enhancement` (green) - New feature or request
- `ui` (blue) - User interface changes
- `mobile` (purple) - Mobile-specific issues
- `guest-mode` (yellow) - Demo/guest mode related
- `high-priority` (red) - Critical fixes
- `medium-priority` (orange) - Important but not urgent
- `low-priority` (gray) - Nice to have

## Optional: Create a Milestone

Create a "Bugfix Round 2" milestone with:
- Due date: (whenever you want)
- Description: "UI/UX improvements and demo mode enhancements"
- Add all 5 issues to the milestone

## Linking Commits to Issues

When you commit fixes, reference the issue number in the commit message:
```bash
git commit -m "fix: Improve demo data generation (fixes #1)"
```

This will:
- Automatically link the commit to issue #1
- Close issue #1 when merged to main (if using "fixes #1")

## Project Board (Optional)

Create a GitHub Project board with columns:
- 📋 To Do
- 🚧 In Progress
- ✅ Done

Then drag issues between columns as you work on them.