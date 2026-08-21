"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - STATE MODULE
   CLEAN RECONSTRUCTION - PHASE 2 (PLUMBING)
===================================================== */

import * as Utils from "./utils.js";

const STATE_KEY = "rewardhub_state";
const DEFAULT_THEME = "dark";
const DEFAULT_LANGUAGE = "en";
const DEFAULT_PAGE = "dashboard";

const State = {
    initialized: false,
    loading: false,
    online: navigator.onLine,

    user: null,
    session: null,
    settings: {},
    cache: {},

    ui: {
        currentPage: DEFAULT_PAGE,
        previousPage: null,
        theme: DEFAULT_THEME,
        language: DEFAULT_LANGUAGE,
        sidebarOpen: false,
        modalOpen: false,
        searchOpen: false,
        bottomSheetOpen: false,
        loadingOverlay: false
    },

    statistics: {
        launchedAt: Date.now(),
        lastSync: null,
        totalRequests: 0,
        cacheHits: 0
    },

    observers: []
};

/* --- BASIC HELPERS --- */
State.isInitialized = function () { return this.initialized; };
State.isOnline = function () { return this.online; };
State.isLoading = function () { return this.loading; };

/* --- USER & SESSION --- */
State.setUser = function (user) { this.user = user || null; };
State.getUser = function () { return this.user; };
State.clearUser = function () { this.user = null; };

State.setSession = function (session) { this.session = session || null; };
State.getSession = function () { return this.session; };
State.clearSession = function () { this.session = null; };
State.isLoggedIn = function () { return this.user !== null; };

/* --- NAVIGATION & UI --- */
State.setCurrentPage = function (page) {
    this.ui.previousPage = this.ui.currentPage;
    this.ui.currentPage = page;
};

State.getCurrentPage = function () { return this.ui.currentPage; };

State.setTheme = function (theme) {
    this.ui.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
};

/* --- PERSISTENCE --- */
State.save = function () {
    try {
        localStorage.setItem(STATE_KEY, JSON.stringify({
            user: this.user,
            session: this.session,
            ui: this.ui,
            statistics: this.statistics
        }));
    } catch (error) { console.error("State save failed:", error); }
};

State.load = function () {
    try {
        const saved = localStorage.getItem(STATE_KEY);
        if (!saved) return false;
        const state = JSON.parse(saved);
        this.user = state.user || null;
        this.session = state.session || null;
        this.ui = { ...this.ui, ...(state.ui || {}) };
        this.statistics = { ...this.statistics, ...(state.statistics || {}) };
        return true;
    } catch (error) { return false; }
};

/* --- OBSERVER PATTERN --- */
State.subscribe = function (callback) { this.observers.push(callback); };
State.notify = function (event, payload = {}) {
    this.observers.forEach(observer => {
        try { observer(event, payload); } catch (e) { console.error(e); }
    });
};

/* --- INITIALIZATION --- */
State.initialize = async function () {
    if (this.initialized) return;
    this.load();
    // Auto-sync state every 30 seconds
    setInterval(() => { this.statistics.lastSync = Date.now(); this.save(); }, 30000);
    this.initialized = true;
    console.log("Global State Initialized.");
};

/* --- SYSTEM EVENTS --- */
window.addEventListener("online", () => {
    State.online = true;
    State.notify("network-online");
});

window.addEventListener("offline", () => {
    State.online = false;
    State.notify("network-offline");
});

window.addEventListener("beforeunload", () => {
    State.save();
});

export default State;
