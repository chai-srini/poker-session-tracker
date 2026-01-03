/**
 * Poker Night Score Tracker - Storage Module
 * Handles localStorage operations for session persistence
 */

const STORAGE_KEY = 'poker-tracker-session';

/**
 * Save current session data to localStorage
 * @param {Object} sessionData - The session data to save
 * @returns {boolean} True if save was successful
 */
function saveSession(sessionData) {
    try {
        const dataToSave = {
            ...sessionData,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        return true;
    } catch (error) {
        console.error('Error saving session:', error);
        return false;
    }
}

/**
 * Load session data from localStorage
 * @returns {Object|null} The loaded session data or null if not found
 */
function loadSession() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error('Error loading session:', error);
        return null;
    }
}

/**
 * Clear the current session from localStorage
 * @returns {boolean} True if clear was successful
 */
function clearSession() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing session:', error);
        return false;
    }
}

/**
 * Check if a saved session exists
 * @returns {boolean} True if a session exists in localStorage
 */
function hasSession() {
    try {
        return localStorage.getItem(STORAGE_KEY) !== null;
    } catch (error) {
        console.error('Error checking session:', error);
        return false;
    }
}

/**
 * Get the timestamp of the saved session
 * @returns {string|null} ISO timestamp string or null
 */
function getSessionTimestamp() {
    const session = loadSession();
    return session ? session.timestamp : null;
}
