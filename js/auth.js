"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - AUTH MODULE
   CLEAN RECONSTRUCTION - PHASE 3 (AUTH & NAV)
===================================================== */

import Api from "./api.js";
import State from "./state.js";
import Utils from "./utils.js";

const TelegramApp = window.Telegram?.WebApp ?? null;
const SESSION_KEY = "rewardhub_session";
const AUTH_TIMEOUT = 3600000; // 1 Hour

const Auth = {
    initialized: false,
    authenticated: false,
    adminAuthenticated: false,
    loading: false,
    telegram: TelegramApp,
    user: null,
    session: null,
    token: null,
    expiresAt: null,
    permissions: []
};

/* --- STATUS CHECKS --- */
Auth.isAuthenticated = function () { return this.authenticated; };
Auth.isAdmin = function () { return this.adminAuthenticated; };

Auth.isSessionExpired = function () {
    if (!this.expiresAt) return true;
    return Date.now() >= this.expiresAt; // FIXED
};

/* --- INITIALIZATION --- */
Auth.initialize = async function () {
    if (this.initialized) return;
    if (this.telegram) {
        this.telegram.ready();
        this.telegram.expand();
    }
    this.initialized = true;
    console.log("Authentication Module Initialized.");
};

/* --- TELEGRAM AUTHENTICATION --- */
Auth.authenticate = async function () {
    this.loading = true;
    try {
        if (!this.telegram || !this.telegram.initData) {
            throw new Error("Telegram SDK unavailable or data missing.");
        }

        const response = await Api.verifyMiniApp(this.telegram.initData);

        if (!response.success) {
            throw new Error(response.message || "Login failed.");
        }

        this.authenticated = true;
        this.user = response.user;
        this.session = response.session;
        this.token = response.session.token;
        this.expiresAt = response.session.expires_at * 1000; // Convert to ms

        // Set global state
        Api.setToken(this.token);
        State.setUser(this.user);
        
        this.saveSession();
        return true;
    } catch (error) {
        console.error("Auth Error:", error);
        return false;
    } finally {
        this.loading = false;
    }
};

/* --- SESSION PERSISTENCE --- */
Auth.saveSession = function () {
    const data = {
        user: this.user,
        token: this.token,
        expiresAt: this.expiresAt,
        adminAuthenticated: this.adminAuthenticated,
        permissions: this.permissions
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
};

Auth.restoreSession = async function () {
    try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (!stored) return false;

        const data = JSON.parse(stored);
        this.expiresAt = data.expiresAt;

        if (this.isSessionExpired()) {
            this.clearSession();
            return false;
        }

        this.user = data.user;
        this.token = data.token;
        this.adminAuthenticated = data.adminAuthenticated;
        this.permissions = data.permissions || [];

        Api.setToken(this.token);
        State.setUser(this.user);
        this.authenticated = true;
        return true;
    } catch (e) {
        this.clearSession();
        return false;
    }
};

Auth.clearSession = function () {
    this.authenticated = false;
    this.user = null;
    this.token = null;
    Api.clearToken();
    localStorage.removeItem(SESSION_KEY);
};

/* --- ADMIN SECURITY --- */
Auth.hasPermission = function (p) {
    return this.adminAuthenticated && this.permissions.includes(p);
};

/* --- LOGOUT --- */
Auth.logout = async function () {
    try {
        if (this.token) await Api.post("/miniapp/logout");
    } catch (e) {}
    this.clearSession();
};

export default Auth;
