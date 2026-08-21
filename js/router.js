"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - ROUTER MODULE
   CLEAN RECONSTRUCTION - PHASE 3 (AUTH & NAV)
===================================================== */

import State from "./state.js";
import Settings from "./settings.js";
import Auth from "./auth.js";
import Utils from "./utils.js";

const DEFAULT_ROUTE = "dashboard";
const LOGIN_ROUTE = "login";
const ADMIN_ROUTE = "admin-dashboard";

const Router = {
    initialized: false,
    currentRoute: DEFAULT_ROUTE,
    previousRoute: null,
    history: [],
    routes: new Map(),
    guards: new Map(),
    events: {
        beforeNavigate: [],
        afterNavigate: [],
        pageEnter: [],
        pageLeave: [],
        initialized: []
    }
};

/* --- ROUTE REGISTRY --- */
Router.register = function (name, config = {}) {
    this.routes.set(name, {
        name,
        title: config.title || name,
        protected: config.protected ?? true,
        adminOnly: config.adminOnly ?? false,
        animation: config.animation || "fade"
    });
};

Router.exists = function (name) { return this.routes.has(name); };

// Registering all screens from index.html
const screens = [
    { id: "login", prot: false },
    { id: "splash", prot: false },
    { id: "onboarding", prot: true },
    { id: "dashboard", prot: true },
    { id: "tasks", prot: true },
    { id: "offerwalls", prot: true },
    { id: "rewards", prot: true },
    { id: "daily-bonus", prot: true },
    { id: "spin-wheel", prot: true },
    { id: "mystery-box", prot: true },
    { id: "watch-ads", prot: true },
    { id: "wallet", prot: true },
    { id: "withdrawals", prot: true },
    { id: "referrals", prot: true },
    { id: "profile", prot: true },
    { id: "settings", prot: true },
    { id: "notifications", prot: true },
    { id: "announcements", prot: true },
    { id: "achievements", prot: true },
    { id: "level-up", prot: true },
    { id: "live-activity", prot: true },
    { id: "help", prot: true },
    { id: "admin-dashboard", prot: true, admin: true }
];

screens.forEach(s => Router.register(s.id, { title: Utils.capitalize(s.id), protected: s.prot, adminOnly: s.admin || false }));

/* --- NAVIGATION ENGINE --- */
Router.go = async function (route, data = {}) {
    if (!this.exists(route)) {
        console.error(`Route "${route}" not found.`);
        return false;
    }

    await this.emit("beforeNavigate", { route, data });
    await this.emit("pageLeave", { route: this.currentRoute });

    this.previousRoute = this.currentRoute;
    this.currentRoute = route;
    this.history.push({ route, data, timestamp: Date.now() });

    State.setCurrentPage(route);
    this.syncURL();

    await this.emit("pageEnter", { route });
    await this.emit("afterNavigate", { route, data });
    
    return true;
};

Router.back = async function () {
    if (this.history.length > 1) { // FIXED
        this.history.pop();
        const prev = this.history[this.history.length - 1];
        return await this.go(prev.route, prev.data);
    }
    return false;
};

Router.replace = async function (route, data = {}) {
    if (this.history.length > 0) this.history.pop(); // FIXED
    return await this.go(route, data);
};

/* --- EVENTS & GUARDS --- */
Router.on = function (event, callback) { if (this.events[event]) this.events[event].push(callback); };

Router.emit = async function (event, payload = {}) {
    if (!this.events[event]) return;
    for (const listener of this.events[event]) {
        try { await listener(payload); } catch (e) { console.error(e); }
    }
};

Router.checkGuard = async function (route) {
    const config = this.routes.get(route);
    if (!config) return true;
    if (config.adminOnly && !Auth.isAdmin()) return false;
    if (config.protected && !Auth.isAuthenticated()) return true; // Bypassed for startup as per original
    return true;
};

/* --- URL SYNC --- */
Router.syncURL = function () {
    try { history.replaceState({}, "", `#${this.currentRoute}`); } catch (e) {}
};

Router.loadURL = async function () {
    const hash = window.location.hash.replace("#", "");
    if (hash && this.exists(hash)) await this.go(hash);
};

/* --- INITIALIZATION --- */
Router.initialize = async function () {
    if (this.initialized) return;
    this.initialized = true;
    await this.loadURL();
    await this.emit("initialized", { route: this.currentRoute });
    console.log("Router Module Initialized.");
};

// Global Listeners
window.addEventListener("hashchange", async () => { await Router.loadURL(); });

window.addEventListener("load", async () => {
    try { await Router.initialize(); } catch (e) { console.error("Router Init Error:", e); }
});

export default Router;
