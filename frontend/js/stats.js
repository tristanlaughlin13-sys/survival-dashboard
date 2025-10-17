// ===== STATISTICS CALCULATIONS =====

import { safeParseFloat, calculateDaysLeft } from './utils.js';

/**
 * Calculate daily goal
 * @param {number} totalNeeded - Total amount needed
 * @param {number} daysLeft - Days remaining
 * @returns {number} Daily goal amount
 */
export function calculateDailyGoal(totalNeeded, daysLeft) {
    return totalNeeded / Math.max(1, daysLeft);
}

/**
 * Calculate progress percentage
 * @param {number} earned - Amount earned
 * @param {number} needed - Amount needed
 * @returns {number} Progress percentage (0-100)
 */
export function calculateProgress(earned, needed) {
    if (needed === 0) return earned > 0 ? 100 : 0;
    return Math.min((earned / needed) * 100, 100);
}

/**
 * Calculate total with tax
 * @param {number} billsTotal - Total bills amount
 * @param {number} taxRate - Tax rate percentage
 * @returns {number} Total including tax reserve
 */
export function calculateTotalWithTax(billsTotal, taxRate) {
    const afterTaxMultiplier = 1 / (1 - (taxRate / 100));
    return billsTotal * afterTaxMultiplier;
}

/**
 * Calculate tax reserve amount
 * @param {number} earnings - Total earnings
 * @param {number} taxRate - Tax rate percentage
 * @returns {number} Amount to reserve for taxes
 */
export function calculateTaxReserve(earnings, taxRate) {
    return earnings * (taxRate / 100);
}

/**
 * Calculate after-tax amount
 * @param {number} earnings - Total earnings
 * @param {number} taxRate - Tax rate percentage
 * @returns {number} Amount after tax reserve
 */
export function calculateAfterTax(earnings, taxRate) {
    return earnings - calculateTaxReserve(earnings, taxRate);
}

/**
 * Calculate total earnings from sessions
 * @param {Array} sessions - Sessions array
 * @param {boolean} includeLeisure - Include leisure sessions
 * @returns {number} Total earnings
 */
export function calculateTotalEarnings(sessions, includeLeisure = false) {
    return sessions
        .filter(s => includeLeisure || !s.is_leisure)
        .reduce((sum, s) => sum + safeParseFloat(s.earnings), 0);
}

/**
 * Calculate total hours from sessions
 * @param {Array} sessions - Sessions array
 * @param {boolean} includeLeisure - Include leisure sessions
 * @returns {number} Total hours
 */
export function calculateTotalHours(sessions, includeLeisure = false) {
    return sessions
        .filter(s => includeLeisure || !s.is_leisure)
        .reduce((sum, s) => sum + safeParseFloat(s.hours), 0);
}

/**
 * Calculate bills total
 * @param {Array} bills - Bills array
 * @param {string} field - Field to sum ('amount_cad' or 'amount_usd')
 * @param {boolean} unpaidOnly - Only count unpaid bills
 * @returns {number} Bills total
 */
export function calculateBillsTotal(bills, field = 'amount_usd', unpaidOnly = true) {
    return bills
        .filter(b => !unpaidOnly || !b.paid)
        .reduce((sum, b) => sum + safeParseFloat(b[field]), 0);
}

/**
 * Get today's sessions
 * @param {Array} sessions - Sessions array
 * @returns {Array} Today's sessions
 */
export function getTodaySessions(sessions) {
    const today = new Date().toDateString();
    return sessions.filter(s => s.timestamp && new Date(s.timestamp).toDateString() === today);
}

/**
 * Calculate hours needed per day
 * @param {number} remaining - Remaining amount needed
 * @param {number} rate - Hourly rate
 * @param {number} daysLeft - Days left
 * @returns {number} Hours needed per day
 */
export function calculateHoursPerDay(remaining, rate, daysLeft) {
    if (rate <= 0) return 0;
    const dailyGoal = calculateDailyGoal(remaining, daysLeft);
    return dailyGoal / rate;
}

/**
 * Calculate total hours needed
 * @param {number} remaining - Remaining amount needed
 * @param {number} rate - Hourly rate
 * @returns {number} Total hours needed
 */
export function calculateTotalHoursNeeded(remaining, rate) {
    if (rate <= 0) return 0;
    return remaining / rate;
}

/**
 * Process initial balance with currency conversion
 * @param {Object} settings - User settings
 * @returns {number} Initial balance in USD
 */
export function processInitialBalance(settings) {
    if (!settings || !settings.initial_balance) return 0;
    
    let balance = safeParseFloat(settings.initial_balance);
    
    // Convert to USD if in CAD
    if (balance > 0 && settings.initial_balance_currency === 'CAD') {
        const exchangeRate = safeParseFloat(settings.exchange_rate_cad_to_usd, 0.7143);
        balance = balance * exchangeRate;
    }
    
    return balance;
}

/**
 * Calculate target bills amount based on mode
 * @param {Array} bills - Bills array
 * @param {Object} settings - User settings
 * @returns {number} Target amount
 */
export function calculateTargetBills(bills, settings) {
    if (!settings) return 0;
    
    if (settings.target_bills_mode === 'manual') {
        return safeParseFloat(settings.target_bills_manual);
    } else if (settings.target_bills_mode === 'auto_all') {
        return calculateBillsTotal(bills, 'amount_usd', false);
    } else { // auto_unpaid (default)
        return calculateBillsTotal(bills, 'amount_usd', true);
    }
}

