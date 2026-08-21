"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - UTILITIES
   CLEAN RECONSTRUCTION - PHASE 2 (PLUMBING)
===================================================== */

const APP_NAME = "Crown Prince Reward Hub";
const APP_VERSION = "1.0.0";
const DEFAULT_LOCALE = "en-US";
const DEFAULT_CURRENCY = "USD";

const DATE_FORMAT_OPTIONS = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
};

const Utils = {
    version: APP_VERSION,
    locale: DEFAULT_LOCALE,
    currency: DEFAULT_CURRENCY,
    initialized: false
};

/* --- INITIALIZATION --- */
Utils.initialize = function () {
    if (this.initialized) return;
    this.initialized = true;
    console.log(`${APP_NAME} Utilities ${APP_VERSION} initialized.`);
};

/* --- TYPE HELPERS --- */
Utils.isNull = value => value === null;
Utils.isUndefined = value => value === undefined;
Utils.isString = value => typeof value === "string";
Utils.isNumber = value => typeof value === "number" && !Number.isNaN(value);
Utils.isBoolean = value => typeof value === "boolean";
Utils.isArray = value => Array.isArray(value);
Utils.isObject = value => value !== null && typeof value === "object" && !Array.isArray(value);

/* --- EMPTY CHECKS --- */
Utils.isEmpty = function (value) {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    if (this.isObject(value)) return Object.keys(value).length === 0;
    return false;
};

Utils.clone = function (value) {
    return structuredClone(value);
};

/* --- FORMATTING --- */
Utils.formatCurrency = function (amount, currency = this.currency, locale = this.locale) {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
};

Utils.formatNumber = function (number, decimals = 2, locale = this.locale) {
    return Number(number).toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

Utils.formatDate = function (date) {
    return new Date(date).toLocaleDateString(this.locale, DATE_FORMAT_OPTIONS);
};

Utils.timeAgo = function (date) {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hrs ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
};

Utils.capitalize = function (text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
};

Utils.maskWallet = function (wallet) {
    if (!wallet || wallet.length < 10) return wallet;
    return wallet.substring(0, 6) + "..." + wallet.substring(wallet.length - 4);
};

/* --- VALIDATION --- */
Utils.isValidEmail = function (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

Utils.isValidWallet = function (wallet) {
    if (!wallet) return false;
    return /^0x[a-fA-F0-9]{40}$/.test(wallet.trim());
};

Utils.isStrongPassword = function (password) {
    if (!password) return false;
    return password.length >= 8; // FIXED
};

Utils.isNumeric = function (value) {
    return !isNaN(value) && value !== "";
};

Utils.isPositiveNumber = function (value) {
    return this.isNumeric(value) && Number(value) > 0; // FIXED
};

/* --- GENERAL HELPERS --- */
Utils.debounce = function (callback, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => callback(...args), delay);
    };
};

Utils.copyToClipboard = async function (text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) { return false; }
};

Utils.download = function (filename, content, type = "text/plain") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

/* --- STORAGE --- */
Utils.storage = {
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
    get(key, fallback = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch { return fallback; }
    },
    remove(key) { localStorage.removeItem(key); }
};

/* --- ERROR HANDLING --- */
Utils.handleError = function (error, context = "Application") {
    console.error(`[${context}]`, error);
    return { success: false, message: error?.message || "Unknown error.", error };
};

/* --- INITIALIZE --- */
Utils.initialize();

export default Utils;
