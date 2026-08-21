"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - SETTINGS MODULE
   CLEAN RECONSTRUCTION - PHASE 2 (PLUMBING)
===================================================== */

import Api from "./api.js";
import State from "./state.js";
import Utils from "./utils.js";

const SETTINGS_STORAGE_KEY = "rewardhub_settings";

const DEFAULT_SETTINGS = {
    appearance: {
        theme: "dark",
        language: "en",
        animations: true,
        hapticFeedback: true
    },
    notifications: {
        enabled: true,
        announcements: true,
        rewards: true,
        withdrawals: true
    },
    wallet: {
        currency: "USD",
        hideBalance: false
    }
};

const Settings = {
    initialized: false,
    loaded: false,
    version: "1.0.0",
    values: structuredClone(DEFAULT_SETTINGS),
    defaults: structuredClone(DEFAULT_SETTINGS),
    lastUpdated: null,
    
    // System Rules (Synced with Backend)
    system: {
        minimumWithdrawal: 1.00,
        referralReward: 0.01,
        dailyBonus: 0.0001,
        spinEnabled: true,
        mysteryBoxEnabled: true,
        watchAdsEnabled: true,
        maintenanceMode: false
    },

    admin: {
        editing: false,
        synchronized: false
    }
};

/* --- PREFERENCES --- */
Settings.setTheme = function (theme) {
    this.values.appearance.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    if (State.setTheme) State.setTheme(theme);
};

Settings.getTheme = function () { return this.values.appearance.theme; };

Settings.toggleTheme = function () {
    this.setTheme(this.getTheme() === "dark" ? "light" : "dark");
};

/* --- SYSTEM CONFIG --- */
Settings.getMinimumWithdrawal = function () { return this.system.minimumWithdrawal; };
Settings.isMaintenanceMode = function () { return this.system.maintenanceMode; };

/* --- DATA PERSISTENCE --- */
Settings.load = async function () {
    try {
        const local = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (local) {
            this.values = { ...this.defaults, ...JSON.parse(local) };
        }
        this.loaded = true;
        this.lastUpdated = Date.now();
        return true;
    } catch (error) {
        console.error("Settings load failed:", error);
        return false;
    }
};

Settings.save = async function () {
    try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.values));
        this.lastUpdated = Date.now();
        return true;
    } catch (error) { return false; }
};

/* --- SERVER SYNC --- */
Settings.syncFromServer = async function () {
    try {
        const response = await Api.get("/settings");
        if (response && response.success && response.data) {
            const d = response.data;
            // Map backend names to frontend names
            this.system.maintenanceMode = d.maintenance_mode || false;
            this.system.minimumWithdrawal = Number(d.min_withdraw || 1.00);
            this.system.dailyBonus = Number(d.daily_bonus || 0.0001);
            this.system.spinEnabled = d.spin_enabled !== false;
            
            this.admin.synchronized = true;
            this.lastUpdated = Date.now();
        }
        return true;
    } catch (error) {
        console.error("Settings sync error:", error);
        return false;
    }
};

/* --- INITIALIZATION --- */
Settings.initialize = async function () {
    if (this.initialized) return;
    await this.load();
    // Start auto-save every 30 seconds
    setInterval(() => this.save(), 30000);
    this.initialized = true;
    console.log("Settings Module Initialized.");
};

/* --- EVENTS --- */
window.addEventListener("beforeunload", () => {
    Settings.save();
});

export default Settings;
