// ===== DEMO MODE DATA GENERATORS =====

import { generateId } from './utils.js';

/**
 * Generate random work sessions for demo mode
 * @returns {Array} Array of session objects
 */
export function generateRandomSessions() {
    const sessions = [];
    const today = new Date();
    const names = [
        'Client Website', 
        'App Development', 
        'Consulting Call', 
        'Bug Fixes', 
        'Code Review',
        'Feature Implementation',
        'Database Migration',
        'UI/UX Design',
        'API Integration',
        'Testing & QA'
    ];
    const rates = [45, 55, 65, 75, 85, 95];
    
    // Generate 15-25 sessions over last 14 days
    const sessionCount = Math.floor(Math.random() * 11) + 15;
    
    for (let i = 0; i < sessionCount; i++) {
        const daysAgo = Math.floor(Math.random() * 14);
        const date = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const hours = (Math.random() * 6 + 1).toFixed(2); // 1-7 hours
        const rate = rates[Math.floor(Math.random() * rates.length)];
        const earnings = (parseFloat(hours) * rate).toFixed(2);
        
        // Random time of day
        date.setHours(Math.floor(Math.random() * 12) + 8); // 8am-8pm
        date.setMinutes(Math.floor(Math.random() * 60));
        
        sessions.push({
            id: `demo-session-${i}`,
            time_display: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            timestamp: date.toISOString(),
            date: date.toISOString().split('T')[0],
            hours: parseFloat(hours),
            rate: parseFloat(rate),
            earnings: parseFloat(earnings),
            note: names[Math.floor(Math.random() * names.length)],
            is_leisure: false,
            opportunity_cost: 0,
            is_manual: true,
            created_at: date.toISOString(),
            updated_at: date.toISOString()
        });
    }
    
    return sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Generate random bills for demo mode
 * @returns {Array} Array of bill objects
 */
export function generateRandomBills() {
    const billTypes = [
        { name: 'Rent', cadRange: [1200, 2500], usdFactor: 0.7143 },
        { name: 'Groceries', cadRange: [150, 400], usdFactor: 0.7143 },
        { name: 'Utilities', cadRange: [80, 200], usdFactor: 0.7143 },
        { name: 'Internet', cadRange: [60, 120], usdFactor: 0.7143 },
        { name: 'Phone Bill', cadRange: [30, 80], usdFactor: 0.7143 },
        { name: 'Credit Card', cadRange: [100, 800], usdFactor: 0.7143 },
        { name: 'Insurance', cadRange: [150, 400], usdFactor: 0.7143 },
        { name: 'Gas/Fuel', cadRange: [50, 150], usdFactor: 0.7143 },
        { name: 'Subscription Services', cadRange: [15, 80], usdFactor: 0.7143 },
        { name: 'Student Loan', cadRange: [200, 600], usdFactor: 0.7143 }
    ];
    
    const bills = [];
    const billCount = Math.floor(Math.random() * 6) + 7; // 7-12 bills
    const usedTypes = new Set();
    
    for (let i = 0; i < billCount; i++) {
        // Pick a unique bill type
        let billType;
        do {
            billType = billTypes[Math.floor(Math.random() * billTypes.length)];
        } while (usedTypes.has(billType.name) && usedTypes.size < billTypes.length);
        usedTypes.add(billType.name);
        
        const amountCAD = (Math.random() * (billType.cadRange[1] - billType.cadRange[0]) + billType.cadRange[0]).toFixed(2);
        const amountUSD = (amountCAD * billType.usdFactor).toFixed(2);
        const daysUntilDue = Math.floor(Math.random() * 30) - 5; // -5 to +25 days
        const dueDate = new Date(Date.now() + daysUntilDue * 24 * 60 * 60 * 1000);
        const paid = daysUntilDue < 0 ? (Math.random() > 0.3) : false; // 70% of past bills are paid
        
        bills.push({
            id: `demo-bill-${i}`,
            name: billType.name,
            amount_cad: parseFloat(amountCAD),
            amount_usd: parseFloat(amountUSD),
            due_date: dueDate.toISOString().split('T')[0],
            paid: paid,
            paid_at: paid ? new Date(dueDate.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }
    
    return bills.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
}

/**
 * Generate demo settings
 * @returns {Object} Settings object
 */
export function generateDemoSettings() {
    const sprintEnd = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000); // 9 days from now
    const hourlyRates = [45, 55, 65, 75, 85];
    const taxRates = [25, 30, 35];
    const initialBalances = [200, 300, 400, 500, 600];
    
    return {
        sprint_end_date: sprintEnd.toISOString(),
        target_bills_mode: 'auto_unpaid',
        target_bills_manual: 0,
        initial_balance: initialBalances[Math.floor(Math.random() * initialBalances.length)],
        initial_balance_currency: Math.random() > 0.5 ? 'USD' : 'CAD',
        default_hourly_rate: hourlyRates[Math.floor(Math.random() * hourlyRates.length)],
        tax_reserve_rate: taxRates[Math.floor(Math.random() * taxRates.length)],
        exchange_rate_cad_to_usd: 0.7143
    };
}

/**
 * Save demo data to sessionStorage
 * @param {Array} sessions - Sessions array
 * @param {Array} bills - Bills array
 * @param {Object} settings - Settings object
 */
export function saveDemoData(sessions, bills, settings) {
    sessionStorage.setItem('demoSessions', JSON.stringify(sessions));
    sessionStorage.setItem('demoBills', JSON.stringify(bills));
    sessionStorage.setItem('demoSettings', JSON.stringify(settings));
}

/**
 * Load demo data from sessionStorage
 * @returns {Object} Object with sessions, bills, settings
 */
export function loadDemoData() {
    const storedSessions = sessionStorage.getItem('demoSessions');
    const storedBills = sessionStorage.getItem('demoBills');
    const storedSettings = sessionStorage.getItem('demoSettings');
    
    if (storedSessions && storedBills && storedSettings) {
        return {
            sessions: JSON.parse(storedSessions),
            bills: JSON.parse(storedBills),
            settings: JSON.parse(storedSettings)
        };
    }
    
    return null;
}

/**
 * Create session in demo mode
 * @param {Object} sessionData - Session data
 * @param {Array} sessions - Sessions array
 * @param {Array} bills - Bills array
 * @param {Object} settings - Settings object
 * @returns {Object} Created session
 */
export async function demo_createSession(sessionData, sessions, bills, settings) {
    sessionData.id = generateId('demo-session');
    sessionData.created_at = new Date().toISOString();
    sessionData.updated_at = new Date().toISOString();
    sessions.unshift(sessionData);
    saveDemoData(sessions, bills, settings);
    return sessionData;
}

/**
 * Update session in demo mode
 * @param {string} id - Session ID
 * @param {Object} updates - Update data
 * @param {Array} sessions - Sessions array
 * @param {Array} bills - Bills array
 * @param {Object} settings - Settings object
 * @returns {Object} Updated session
 */
export async function demo_updateSession(id, updates, sessions, bills, settings) {
    const index = sessions.findIndex(s => s.id === id);
    if (index !== -1) {
        sessions[index] = { ...sessions[index], ...updates, updated_at: new Date().toISOString() };
        saveDemoData(sessions, bills, settings);
        return sessions[index];
    }
    throw new Error('Session not found');
}

/**
 * Delete session in demo mode
 * @param {string} id - Session ID
 * @param {Array} sessions - Sessions array
 * @param {Array} bills - Bills array
 * @param {Object} settings - Settings object
 */
export async function demo_deleteSession(id, sessions, bills, settings) {
    const index = sessions.findIndex(s => s.id === id);
    if (index !== -1) {
        sessions.splice(index, 1);
        saveDemoData(sessions, bills, settings);
    }
}

/**
 * Create bill in demo mode
 * @param {Object} billData - Bill data
 * @param {Array} sessions - Sessions array
 * @param {Array} bills - Bills array
 * @param {Object} settings - Settings object
 * @returns {Object} Created bill
 */
export async function demo_createBill(billData, sessions, bills, settings) {
    billData.id = generateId('demo-bill');
    billData.created_at = new Date().toISOString();
    billData.updated_at = new Date().toISOString();
    billData.paid = false;
    billData.paid_at = null;
    bills.push(billData);
    saveDemoData(sessions, bills, settings);
    return billData;
}

/**
 * Update bill in demo mode
 * @param {string} id - Bill ID
 * @param {Object} updates - Update data
 * @param {Array} sessions - Sessions array
 * @param {Array} bills - Bills array
 * @param {Object} settings - Settings object
 * @returns {Object} Updated bill
 */
export async function demo_updateBill(id, updates, sessions, bills, settings) {
    const index = bills.findIndex(b => b.id === id);
    if (index !== -1) {
        bills[index] = { ...bills[index], ...updates, updated_at: new Date().toISOString() };
        saveDemoData(sessions, bills, settings);
        return bills[index];
    }
    throw new Error('Bill not found');
}

/**
 * Mark bill paid/unpaid in demo mode
 * @param {string} id - Bill ID
 * @param {boolean} paid - Paid status
 * @param {Array} sessions - Sessions array
 * @param {Array} bills - Bills array
 * @param {Object} settings - Settings object
 * @returns {Object} Updated bill
 */
export async function demo_markBillPaid(id, paid, sessions, bills, settings) {
    const index = bills.findIndex(b => b.id === id);
    if (index !== -1) {
        bills[index].paid = paid;
        bills[index].paid_at = paid ? new Date().toISOString() : null;
        bills[index].updated_at = new Date().toISOString();
        saveDemoData(sessions, bills, settings);
        return bills[index];
    }
    throw new Error('Bill not found');
}

/**
 * Delete bill in demo mode
 * @param {string} id - Bill ID
 * @param {Array} sessions - Sessions array
 * @param {Array} bills - Bills array
 * @param {Object} settings - Settings object
 */
export async function demo_deleteBill(id, sessions, bills, settings) {
    const index = bills.findIndex(b => b.id === id);
    if (index !== -1) {
        bills.splice(index, 1);
        saveDemoData(sessions, bills, settings);
    }
}

/**
 * Update settings in demo mode
 * @param {Object} updates - Settings updates
 * @param {Array} sessions - Sessions array
 * @param {Array} bills - Bills array
 * @param {Object} settings - Settings object
 * @returns {Object} Updated settings
 */
export async function demo_updateSettings(updates, sessions, bills, settings) {
    const updatedSettings = { ...settings, ...updates };
    saveDemoData(sessions, bills, updatedSettings);
    return updatedSettings;
}

