// ===== AUTHENTICATION MODULE =====

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated() {
    return !!localStorage.getItem('authToken');
}

/**
 * Get authentication token
 * @returns {string|null} Auth token or null
 */
export function getAuthToken() {
    return localStorage.getItem('authToken');
}

/**
 * Set authentication token
 * @param {string} token - JWT token
 */
export function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

/**
 * Clear authentication data
 */
export function clearAuth() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('demoSessions');
    sessionStorage.removeItem('demoBills');
    sessionStorage.removeItem('demoSettings');
}

/**
 * Logout user and return to demo mode
 */
export function logout() {
    if (confirm('Are you sure you want to logout?')) {
        clearAuth();
        window.location.reload();
    }
}

/**
 * Check if in demo mode
 * @returns {boolean} True if in demo mode
 */
export function isDemoMode() {
    return !isAuthenticated();
}

