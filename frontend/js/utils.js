// ===== UTILITY FUNCTIONS =====

/**
 * Format currency to display format
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
    return `$${Math.round(amount)}`;
}

/**
 * Format currency with decimals
 * @param {number} amount - Amount to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted currency string
 */
export function formatCurrencyPrecise(amount, decimals = 2) {
    return `$${amount.toFixed(decimals)}`;
}

/**
 * Format date to locale string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date - Date to format
 * @returns {string} ISO date string
 */
export function formatDateISO(date) {
    return new Date(date).toISOString().split('T')[0];
}

/**
 * Calculate hours between two times
 * @param {string} startTime - Start time string
 * @param {string} endTime - End time string
 * @param {string} date - Date string
 * @returns {number} Hours difference
 */
export function calculateHours(startTime, endTime, date) {
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    return (end - start) / (1000 * 60 * 60);
}

/**
 * Calculate days between two dates
 * @param {Date|string} endDate - End date
 * @param {Date|string} startDate - Start date (defaults to now)
 * @returns {number} Days difference
 */
export function calculateDaysLeft(endDate, startDate = new Date()) {
    const end = new Date(endDate);
    const start = new Date(startDate);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

/**
 * Parse float with fallback
 * @param {any} value - Value to parse
 * @param {number} fallback - Fallback value if parse fails
 * @returns {number} Parsed number or fallback
 */
export function safeParseFloat(value, fallback = 0) {
    const parsed = parseFloat(value);
    return (!isNaN(parsed) && isFinite(parsed)) ? parsed : fallback;
}

/**
 * Generate unique ID
 * @param {string} prefix - ID prefix
 * @returns {string} Unique ID
 */
export function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
    const today = new Date().toDateString();
    return new Date(date).toDateString() === today;
}

/**
 * Get urgency level based on days until due
 * @param {string} dueDate - Due date
 * @returns {string} 'urgent'|'warning'|'normal'|'paid'
 */
export function getBillUrgency(dueDate, isPaid) {
    if (isPaid) return 'paid';
    
    const daysLeft = calculateDaysLeft(dueDate);
    if (daysLeft <= 0) return 'urgent';
    if (daysLeft <= 3) return 'urgent';
    if (daysLeft <= 7) return 'warning';
    return 'normal';
}

