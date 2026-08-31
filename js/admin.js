"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - ADMIN MODULE
   CLEAN RECONSTRUCTION - COMMAND CENTER (PHASE 5)
===================================================== */

import Api from "./api.js";
import State from "./state.js";
import Settings from "./settings.js";
import UI from "./ui.js";
import Utils from "./utils.js";
import Wallet from "./wallet.js";
import Profile from "./profile.js";
import Notifications from "./notifications.js";

const ADMIN_ROLES = { SUPER_ADMIN: "super_admin", ADMIN: "admin", MODERATOR: "moderator" };
const ADMIN_PERMISSIONS = { USERS: "users", TASKS: "tasks", WITHDRAWALS: "withdrawals", SETTINGS: "settings", BROADCASTS: "broadcasts" };
const ADMIN_STATUS = { OFFLINE: "offline", ONLINE: "online" };
const CACHE_KEY = "rewardhub_admin_cache";

const Admin = {
    initialized: false,
    authenticated: false,
    loading: false,
    currentAdmin: { id: null, role: null, permissions: [], status: ADMIN_STATUS.OFFLINE },
    dashboard: { users: 0, tasks: 0, pendingWithdrawals: 0, revenue: 0 },
    session: { token: null, expiresAt: null },
    preferences: { autoRefresh: true, refreshInterval: 30000 },
    users: [],
    tasks: [],
    withdrawals: [],
    broadcasts: []
};

/* --- AUTHENTICATION --- */
Admin.login = async function (credentials) {
    try {
        this.loading = true;
        const response = await Api.post("/admin/login", credentials);
        if (response.success) {
            this.authenticated = true;
            this.currentAdmin = { ...response.admin, status: ADMIN_STATUS.ONLINE };
            this.session = { token: response.token, expiresAt: response.expiresAt };
            this.saveCache();
        }
        return response;
    } catch (e) { return { success: false, message: e.message }; }
    finally { this.loading = false; }
};

Admin.logout = async function () {
    try { if (this.session.token) await Api.post("/admin/logout"); } catch (e) {}
    this.authenticated = false;
    this.currentAdmin.status = ADMIN_STATUS.OFFLINE;
    this.clearCache();
};

/* --- DASHBOARD & STATISTICS --- */
Admin.loadDashboard = async function () {
    try {
        const response = await Api.get("/admin/dashboard");
        if (response.success) this.dashboard = { ...this.dashboard, ...response.dashboard };
        return response;
    } catch (e) { return { success: false, message: e.message }; }
};

/* --- USER MODERATION --- */
Admin.loadUsers = async function (page = 1) {
    try {
        const response = await Api.get("/admin/users", { page });
        if (response.success) this.users = response.users || [];
        return response;
    } catch (e) { return { success: false }; }
};

Admin.banUser = async function (userId, reason) {
    return await Api.post("/admin/users/ban", { userId, reason });
};

/* --- TASK MANAGEMENT --- */
Admin.createTask = async function (data) {
    const res = await Api.post("/admin/tasks/create", data);
    if (res.success) await this.loadTasks();
    return res;
};

/* --- WITHDRAWAL APPROVALS --- */
Admin.approveWithdrawal = async function (withdrawalId, notes = "") {
    return await Api.post("/admin/withdrawals/approve", { withdrawalId, notes });
};

Admin.rejectWithdrawal = async function (withdrawalId, reason = "") {
    return await Api.post("/admin/withdrawals/reject", { withdrawalId, reason });
};

/* --- BROADCAST SYSTEM --- */
Admin.sendBroadcast = async function (payload) {
    return await Api.post("/admin/broadcast", payload);
};

/* --- SYSTEM MONITORING --- */
Admin.getSystemStatus = async function () {
    return await Api.get("/admin/system/status");
};

/* --- CACHE & SYNC --- */
Admin.saveCache = function () {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            currentAdmin: this.currentAdmin,
            dashboard: this.dashboard,
            authenticated: this.authenticated,
            timestamp: Date.now()
        }));
    } catch (e) { console.error(e); }
};

Admin.loadCache = function () {
    try {
        const data = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (!data) return false;
        this.currentAdmin = data.currentAdmin;
        this.dashboard = data.dashboard;
        this.authenticated = data.authenticated;
        return true;
    } catch (e) { return false; }
};

Admin.clearCache = function () { localStorage.removeItem(CACHE_KEY); };

/* --- INITIALIZATION --- */
Admin.initialize = async function () {
    if (this.initialized) return;
    this.loadCache();
    if (this.authenticated) await this.loadDashboard();
    this.initialized = true;
    console.log("Admin Module Initialized.");
};

/* --- EVENTS --- */
window.addEventListener("DOMContentLoaded", async () => {
    try { await Admin.initialize(); } catch (e) { console.error(e); }
});

window.addEventListener("beforeunload", () => {
    if (Admin.authenticated) Admin.saveCache();
});

Admin.loadPendingProofs = async function() {
    try {
        this.loading = true;
        const response = await Api.get("/admin/tasks/pending");
        if (response.success) {
            this.pendingTasks = response.data || [];
        }
        return response;
    } catch (e) {
        return { success: false, message: e.message };
    } finally {
        this.loading = false;
    }
};

createTask: async function(taskData) {
        try {
            this.loading = true;
            // Aligned with reconstructed Backend route
            const response = await Api.post("/admin/tasks/create", taskData);
            return response;
        } catch (e) {
            return { success: false, message: e.message };
        } finally {
            this.loading = false;
        }
    }; // NO COMMA HERE

export default Admin;
