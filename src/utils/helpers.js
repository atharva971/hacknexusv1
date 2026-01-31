/* ========================================
   Smart City Planner - Helper Functions
   ======================================== */

/**
 * Format a number with commas
 * @param {number} num 
 * @returns {string}
 */
export function formatNumber(num) {
    return new Intl.NumberFormat().format(Math.round(num));
}

/**
 * Clamp a value between min and max
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 * @param {number} a 
 * @param {number} b 
 * @param {number} t 
 * @returns {number}
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Map a value from one range to another
 * @param {number} value 
 * @param {number} inMin 
 * @param {number} inMax 
 * @param {number} outMin 
 * @param {number} outMax 
 * @returns {number}
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random item from an array
 * @param {Array} arr 
 * @returns {*}
 */
export function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Debounce a function
 * @param {Function} fn 
 * @param {number} delay 
 * @returns {Function}
 */
export function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Throttle a function
 * @param {Function} fn 
 * @param {number} limit 
 * @returns {Function}
 */
export function throttle(fn, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Calculate distance between two points
 * @param {number} x1 
 * @param {number} y1 
 * @param {number} x2 
 * @param {number} y2 
 * @returns {number}
 */
export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Convert hex color to rgba
 * @param {string} hex 
 * @param {number} alpha 
 * @returns {string}
 */
export function hexToRgba(hex, alpha = 1) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Interpolate between two colors
 * @param {string} color1 - Hex color
 * @param {string} color2 - Hex color
 * @param {number} t - Interpolation factor (0-1)
 * @returns {string}
 */
export function lerpColor(color1, color2, t) {
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);

    const r1 = (c1 >> 16) & 0xff;
    const g1 = (c1 >> 8) & 0xff;
    const b1 = c1 & 0xff;

    const r2 = (c2 >> 16) & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = c2 & 0xff;

    const r = Math.round(lerp(r1, r2, t));
    const g = Math.round(lerp(g1, g2, t));
    const b = Math.round(lerp(b1, b2, t));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Deep clone an object
 * @param {Object} obj 
 * @returns {Object}
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Generate unique ID
 * @returns {string}
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Sleep for a specified duration
 * @param {number} ms 
 * @returns {Promise}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a 2D array filled with a value
 * @param {number} rows 
 * @param {number} cols 
 * @param {*} fill 
 * @returns {Array}
 */
export function create2DArray(rows, cols, fill = null) {
    return Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () =>
            typeof fill === 'function' ? fill() : fill
        )
    );
}

/**
 * Calculate sustainability score from zone distribution
 * @param {Object} distribution 
 * @returns {number}
 */
export function calculateSustainabilityScore(distribution) {
    const { residential, commercial, industrial, green, transit, road } = distribution;
    const total = residential + commercial + industrial + green + transit + road;

    if (total === 0) return 0;

    // Weights for sustainability calculation
    const greenWeight = 2.5;
    const transitWeight = 2.0;
    const residentialWeight = 1.0;
    const commercialWeight = 0.8;
    const roadWeight = 0.5;
    const industrialWeight = 0.3;

    const score = (
        (green / total) * 100 * greenWeight +
        (transit / total) * 100 * transitWeight +
        (residential / total) * 100 * residentialWeight +
        (commercial / total) * 100 * commercialWeight +
        (road / total) * 100 * roadWeight +
        (industrial / total) * 100 * industrialWeight
    ) / (greenWeight + transitWeight + residentialWeight + commercialWeight + roadWeight + industrialWeight);

    return Math.round(clamp(score * 1.5, 0, 100));
}

/**
 * Show toast notification
 * @param {string} message 
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {number} duration 
 */
export function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
    <span class="toast-icon">${getToastIcon(type)}</span>
    <span class="toast-message">${message}</span>
  `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function getToastIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}
