"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - NOTIFICATIONS MODULE
   CLEAN RECONSTRUCTION - PHASE 4 (FEATURE MODULES)
===================================================== */

import Api from "./api.js";
import State from "./state.js";
import Settings from "./settings.js";
import UI from "./ui.js";
import Utils from "./utils.js";

const NOTIFICATION_TYPES = {
    INFO: "info", SUCCESS: "success", WARNING: "warning", ERROR: "error",
    REWARD: "reward", TASK: "task", WITHDRAWAL: "withdrawal", SYSTEM: "system"
};

const NOTIFICATION_STATUS = { UNREAD: "unread", READ: "read", ARCHIVED: "archived" };
const CACHE_KEY = "rewardhub_notifications_cache";

const Notifications = {
    initialized: false,
    loading: false,
    syncing: false,
    unreadCount: 0,
    notifications: [],
    preferences: { inApp: true, telegram: true, push: true, sound: true },
    cacheTimestamp: null
};

/* --- GETTERS --- */
Notifications.getNotifications = function () { return this.notifications; };
Notifications.getUnreadCount = function () { return this.unreadCount; };

/* --- PUSH NOTIFICATIONS (Browser) --- */
Notifications.enablePush = async function () {
    if (!("Notification" in window)) return { success: false, message: "Not supported" };
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
        this.preferences.push = true;
        return { success: true };
    }
    return { success: false, message: "Permission denied" };
};

Notifications.showPushNotification = function (title, options = {}) {
    if (!this.preferences.push || Notification.permission !== "granted") return false;
    try {
        new Notification(title, {
            body: options.body || "",
            icon: "/assets/images/branding/miniapp-icon.png",
            silent: !this.preferences.sound
        });
        return true;
    } catch (e) { return false; }
};

/* --- IN-APP LOGIC --- */
Notifications.load = async function () {
    try {
        this.loading = true;
        const response = await Api.getActivityFeed(); // Aligned with backend activity feed
        if (response.success) {
            this.notifications = response.data || [];
            this.unreadCount = this.notifications.filter(n => n.status === NOTIFICATION_STATUS.UNREAD).length;
        }
        return response;
    } catch (e) { return { success: false, message: e.message }; }
    finally { this.loading = false; }
};

Notifications.add = function (notification) {
    const item = {
        id: notification.id || Utils.uuid(),
        title: notification.title || "Alert",
        message: notification.message || "",
        type: notification.type || NOTIFICATION_TYPES.INFO,
        status: NOTIFICATION_STATUS.UNREAD,
        createdAt: new Date().toISOString()
    };
    this.notifications.unshift(item);
    this.unreadCount++;
    if (UI.toast) UI.toast(item.message, item.type);
    return item;
};

Notifications.markAsRead = function (id) {
    const n = this.notifications.find(item => item.id === id);
    if (n && n.status === NOTIFICATION_STATUS.UNREAD) {
        n.status = NOTIFICATION_STATUS.READ;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.saveCache();
    }
};

/* --- SYNC & CACHE --- */
Notifications.saveCache = function () {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            notifications: this.notifications,
            unreadCount: this.unreadCount,
            preferences: this.preferences,
            timestamp: Date.now()
        }));
    } catch (e) { console.error(e); }
};

Notifications.loadCache = function () {
    try {
        const data = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (!data) return false;
        this.notifications = data.notifications || [];
        this.unreadCount = data.unreadCount || 0;
        this.preferences = { ...this.preferences, ...data.preferences };
        return true;
    } catch (e) { return false; }
};

Notifications.sync = async function () {
    try {
        this.syncing = true;
        const res = await this.load();
        if (res.success) this.saveCache();
        return res;
    } finally { this.syncing = false; }
};

Notifications.initialize = async function () {
    if (this.initialized) return;
    this.loadCache();
    await this.sync();
    this.initialized = true;
    console.log("Notifications Module Initialized.");
};

Notifications.optimize = function () {
    if (this.notifications.length > 500) { // FIXED comparison operator
        this.notifications = this.notifications.slice(0, 500);
    }
    this.saveCache();
};

/* --- EVENTS --- */
window.addEventListener("DOMContentLoaded", async () => {
    try { await Notifications.initialize(); } catch (e) { console.error(e); }
}); // FIXED missing closure

window.addEventListener("beforeunload", () => {
    Notifications.saveCache();
    Notifications.optimize();
}); // FIXED missing closure

export default Notifications;
