"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - API MODULE
   CLEAN RECONSTRUCTION - PHASE 2 (PLUMBING)
===================================================== */

import * as Utils from "./utils.js";

const API_VERSION = "v1";
const API_BASE_URL = "https://http--rewardhub-production-bot--7yrkypbyrrz6.code.run/api/v1";
const API_TIMEOUT = 30000;

const Api = {
    initialized: false,
    online: navigator.onLine,
    baseUrl: API_BASE_URL,
    token: null,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    requestQueue: [],
    pendingRequests: 0,
    statistics: { total: 0, success: 0, failed: 0 }
};

/* =====================================================
   CORE HTTP CLIENT
===================================================== */

async function request(method, path, data = null) {
    Api.statistics.total++;
    Api.pendingRequests++;

    const url = path.startsWith("http") ? path : `${Api.baseUrl}${path}`;
    
    const config = {
        method,
        headers: Api.headers,
        signal: AbortSignal.timeout(API_TIMEOUT)
    };

    if (data && method !== "GET") {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, config);
        const json = await response.json();
        Api.pendingRequests--;

        if (!response.ok) {
            Api.statistics.failed++;
            throw { status: response.status, message: json.message || "Request failed" };
        }

        Api.statistics.success++;
        return json;
    } catch (error) {
        Api.pendingRequests--;
        throw error;
    }
}

// Helper Wrappers
Api.get = (path, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request("GET", query ? `${path}?${query}` : path);
};
Api.post = (path, body = {}) => request("POST", path, body);
Api.put = (path, body = {}) => request("PUT", path, body);
Api.delete = (path) => request("DELETE", path);

/* =====================================================
   AUTHENTICATION & SESSION
===================================================== */
Api.setToken = (token) => {
    Api.token = token;
    Api.headers["Authorization"] = `Bearer ${token}`;
};

Api.clearToken = () => {
    delete Api.headers["Authorization"];
    Api.token = null;
};

/* =====================================================
   API METHODS (Aligned with Backend Reconstruction)
===================================================== */

// Users & Profile
Api.getProfile = (userId) => Api.get("/profile", { user_id: userId });
Api.verifyMiniApp = (initData) => Api.post("/miniapp/verify", { initData });
Api.validateSession = () => Api.get("/miniapp/session");

// Wallet & Financial
Api.getWalletBalance = (userId) => Api.get("/balance", { user_id: userId });
Api.getTransactions = (userId) => Api.get("/wallet/history", { user_id: userId });
Api.getWithdrawals = (userId) => Api.get("/withdrawals", { user_id: userId });
Api.requestWithdrawal = (data) => Api.post("/withdrawals", data);

// Tasks & Offerwalls
Api.getTasks = (userId) => Api.get("/tasks", { user_id: userId });
Api.getOfferwalls = () => Api.get("/offerwalls");
Api.verifyTelegramTask = (taskId) => Api.post("/tasks/verify/telegram", { taskId });
Api.verifyTwitterTask = (taskId) => Api.post("/tasks/verify/twitter", { taskId });

// Rewards & Games
Api.claimDailyBonus = (data) => Api.post("/daily", data);
Api.claimSpin = (data) => Api.post("/spin", data);
Api.claimMysteryBox = (data) => Api.post("/mystery-box", data);
Api.claimWatchAd = (data) => Api.post("/watch-ad", data);

// System & Admin
Api.getSettings = () => Api.get("/settings");
Api.getActivityFeed = (limit = 20) => Api.get("/activity", { limit });

/* =====================================================
   INITIALIZATION & EVENTS
===================================================== */
Api.initialize = async function (session = null) {
    if (this.initialized) return;
    if (session?.token) this.setToken(session.token);
    this.initialized = true;
    console.log("Reward Hub API Bridge Initialized.");
};

// Network Listeners
window.addEventListener("online", () => { Api.online = true; });
window.addEventListener("offline", () => { Api.online = false; });

/* =====================================================
   ERROR HANDLING
===================================================== */
Api.handleError = function (error) {
    console.error("API Bridge Error:", error);
    const status = error?.status || 500;
    
    if (status === 401) console.warn("Session expired or invalid.");
    if (status >= 500) console.warn("Backend server error.");

    return {
        success: false,
        message: error?.message || "Communication error.",
        status
    };
};

export default Api;
