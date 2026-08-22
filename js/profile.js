"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - PROFILE MODULE
   CLEAN RECONSTRUCTION - PHASE 4 (FEATURE MODULES)
===================================================== */

import Api from "./api.js";
import State from "./state.js";
import Settings from "./settings.js";
import Utils from "./utils.js";

const PROFILE_STATUS = { ACTIVE: "active", INACTIVE: "inactive", BANNED: "banned" };
const GENDER = { MALE: "male", FEMALE: "female", OTHER: "other", PREFER_NOT_TO_SAY: "prefer_not_to_say" };
const AVATAR_TYPES = { TELEGRAM: "telegram", UPLOAD: "upload", DEFAULT: "default" };
const CACHE_KEY = "rewardhub_profile_cache";

const Profile = {
    initialized: false,
    loading: false,
    saving: false,
    syncing: false,
    profile: {
        id: null,
        telegramId: null,
        username: "",
        firstName: "",
        lastName: "",
        displayName: "",
        email: "",
        phone: "",
        gender: GENDER.PREFER_NOT_TO_SAY,
        bio: "",
        avatar: "",
        avatarType: AVATAR_TYPES.DEFAULT,
        status: PROFILE_STATUS.ACTIVE
    },
    statistics: {
        referrals: 0,
        completedTasks: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        level: 1,
        xp: 0
    },
    preferences: {
        showEmail: false,
        showPhone: false,
        publicProfile: false
    },
    cacheTimestamp: null
};

/* --- GETTERS & SETTERS --- */
Profile.getProfile = function () { return this.profile; };
Profile.getStatistics = function () { return this.statistics; };
Profile.getDisplayName = function () {
    return this.profile.displayName || this.profile.firstName || this.profile.username || "User";
};

Profile.setLoading = function (v) { this.loading = v; };

/* --- CORE MANAGEMENT --- */
Profile.load = async function () {
    try {
        this.setLoading(true);
        const response = await Api.getProfile();
        if (!response.success) return response;

        this.profile = { ...this.profile, ...(response.profile || {}) };
        this.statistics = { ...this.statistics, ...(response.statistics || {}) };
        this.preferences = { ...this.preferences, ...(response.preferences || {}) };

        State.setUser(this.profile);
        return { success: true, profile: this.profile };
    } catch (error) {
        console.error("Profile Load Error:", error);
        return { success: false, message: error.message };
    } finally {
        this.setLoading(false);
    }
};

Profile.sync = async function () {
    try {
        this.syncing = true;
        const response = await Profile.load();
        if (response.success) this.saveCache();
        return response;
    } finally {
        this.syncing = false;
    }
};

/* --- CACHE --- */
Profile.saveCache = function () {
    try {
        const cache = { profile: this.profile, statistics: this.statistics, preferences: this.preferences, timestamp: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        this.cacheTimestamp = cache.timestamp;
    } catch (e) { console.error(e); }
};

Profile.loadCache = function () {
    try {
        const data = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (!data) return false;
        this.profile = data.profile;
        this.statistics = data.statistics;
        this.preferences = data.preferences;
        return true;
    } catch (e) { return false; }
};

/* --- INITIALIZATION --- */
Profile.initialize = async function () {
    if (this.initialized) return;
    this.loadCache();
    await this.sync();
    this.initialized = true;
    console.log("Profile Module Initialized.");
};

/* --- EVENTS --- */
window.addEventListener("DOMContentLoaded", async () => {
    try { await Profile.initialize(); } catch (e) { console.error(e); }
});

window.addEventListener("beforeunload", () => {
    Profile.saveCache();
});

export default Profile;
