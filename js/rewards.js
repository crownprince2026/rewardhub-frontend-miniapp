"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - REWARDS MODULE
   CLEAN RECONSTRUCTION - PHASE 4 (FEATURE MODULES)
===================================================== */

import Api from "./api.js";
import State from "./state.js";
import Settings from "./settings.js";
import Utils from "./utils.js";

const REWARD_TYPES = {
    DAILY: "daily",
    TASK: "task",
    REFERRAL: "referral",
    SPIN: "spin",
    MYSTERY_BOX: "mystery_box",
    WATCH_AD: "watch_ad",
    ACHIEVEMENT: "achievement",
    LEVEL_UP: "level_up",
    BONUS: "bonus",
    PROMOTION: "promotion"
};

// --- COOLDOWN SETTINGS (Surgical Fix) ---
const COOLDOWNS = {
    DAILY: 86400,    // 24 Hours
    SPIN: 3600,     // 1 Hour
    MYSTERY: 3600   // 1 Hour
};

const Rewards = {
    initialized: false,
    loading: false,
    syncing: false,
    claiming: false,
    rewards: [],
    history: [],
    dailyBonus: null,
    spinWheel: null,
    mysteryBox: null,
    cooldowns: {},
    statistics: {
        totalEarned: 0,
        totalClaimed: 0,
        pendingRewards: 0,
        availableRewards: 0,
        spinsToday: 0,
        mysteryBoxesOpened: 0,
        dailyBonusesClaimed: 0
    }
};

/* --- GETTERS & STATUS --- */
Rewards.getDailyStreak = function () { 
    return this.dailyBonus?.streak || 0; 
};

Rewards.getNextDailyBonusTime = function () { 
    return this.getCooldown("daily"); 
};

Rewards.getStatistics = function () { 
    return this.statistics; 
};

Rewards.getDailyBonus = function () { 
    return this.dailyBonus; 
};

Rewards.getCooldown = function (type) { 
    return this.cooldowns[type] || 0; 
};

Rewards.getStreakTier = function() {
    const streak = this.getDailyStreak();
    if (streak >= 30) return { name: "Senior", class: "tier-senior", ring: "ring-gold" };
    if (streak >= 7) return { name: "Junior", class: "tier-junior", ring: "ring-silver" };
    return { name: "Amateur", class: "tier-amateur", ring: "ring-none" };
};

Rewards.isAvailable = function (type) {
    return Date.now() >= this.getCooldown(type); // FIXED
};

/* --- COOLDOWN MANAGEMENT --- */
Rewards.setCooldown = function (type, seconds = DEFAULT_COOLDOWN) {
    this.cooldowns[type] = Date.now() + (seconds * 1000);
};

/* --- DAILY BONUS SYSTEM --- */
Rewards.loadDailyBonus = async function () {
    try {
        this.loading = true;
        const response = await Api.getDailyBonusStatus();
        if (response.success) {
            this.dailyBonus = response.dailyBonus;
        }
        return response;
    } catch (error) {
        console.error("Daily Bonus Load Error:", error);
        return { success: false, message: error.message };
    } finally {
        this.loading = false;
    }
};

/* --- DAILY BONUS --- */
Rewards.claimDailyBonus = async function (uid) {
    try {
        this.claiming = true;
        // Corrected: Removed junk code after the API call
        const response = await Api.claimDailyBonus(uid);

        if (response.success) {
            const reward = Number(response.reward || 0);
            if (State.user) State.user.balance += reward;
            this.statistics.totalEarned += reward;
            this.statistics.dailyBonusesClaimed++;
            this.setCooldown("daily", 86400);
            this.saveCache();
        }
        return response;
    } catch (error) {
        return { success: false, message: error.message };
    } finally {
        this.claiming = false;
    }
};

/* --- SPIN WHEEL --- */
Rewards.spin = async function (uid) {
    try {
        if (!this.isAvailable("spin")) return { success: false, message: "Wait for cooldown." };

        const weights = [
            { index: 0, weight: 100 }, { index: 1, weight: 150 },
            { index: 2, weight: 100 }, { index: 3, weight: 200 },
            { index: 4, weight: 100 }, { index: 5, weight: 200 },
            { index: 6, weight: 100 }, { index: 7, weight: 5   },
            { index: 8, weight: 40  }, { index: 9, weight: 5   }
        ];

        let totalWeight = weights.reduce((acc, w) => acc + w.weight, 0);
        let random = Math.floor(Math.random() * totalWeight);
        let selected = weights[0];

        for (let w of weights) {
            if (random < w.weight) { selected = w; break; }
            random -= w.weight;
        }

        // Corrected: Call claimSpin and pass the index correctly
        const response = await Api.claimSpin(uid, selected.index);

        if (response.success) {
            this.setCooldown("spin", 3600);
            this.saveCache();
        }
        return { ...response, stopIndex: selected.index };
    } catch (e) { return { success: false, message: e.message }; }
};

/* --- MYSTERY BOX --- */
Rewards.openMysteryBox = async function (uid) {
    try {
        if (!this.isAvailable("mystery_box")) {
            return { success: false, message: "Mystery Box cooldown active." };
        }

        this.claiming = true;
        // Corrected: Removed junk code and called correct API
        const response = await Api.claimMysteryBox(uid);

        if (response.success) {
            const random = Math.random() * 100;
            let reward = 0;
            let type = "xp";
            let label = "50 XP";

            if (random < 70) { type = "xp"; label = "50 XP"; reward = 50; }
            else if (random < 85) { type = "cash"; reward = 0.001; label = "$0.001"; }
            else if (random < 93) { type = "cash"; reward = 0.005; label = "$0.005"; }
            else if (random < 97) { type = "cash"; reward = 0.05; label = "$0.05"; }
            else if (random < 99.5) { type = "cash"; reward = 0.9; label = "$0.90"; }
            else { type = "cash"; reward = 1.0; label = "$1.00"; }

            if (random > 50 && random < 55) { label = "Oops, No Luck!"; reward = 0; }

            if (type === "cash" && State.user) State.user.balance += reward;
            if (type === "xp" && State.user) State.user.xp = (State.user.xp || 0) + reward;

            this.statistics.totalEarned += (type === "cash" ? reward : 0);
            this.setCooldown("mystery_box", 3600);
            this.saveCache();
            return { success: true, reward: label, type: type };
        }
    } catch (error) {
        return { success: false, message: error.message };
    } finally {
        this.claiming = false;
    }
};


/* --- SYNCHRONIZATION --- */
Rewards.sync = async function () {
    try {
        this.syncing = true;
        // Logic to sync general rewards list from backend
        const response = await Api.get("/rewards/history", { user_id: State.getUser()?.user_id });
        if (response.success) {
            this.history = response.data || [];
        }
        await this.loadDailyBonus();
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    } finally {
        this.syncing = false;
    }
};

/* --- INITIALIZATION --- */
Rewards.initialize = async function () {
    if (this.initialized) return;
    await this.sync();
    this.initialized = true;
    console.log("Rewards Module Initialized.");
};

/* --- STARTUP --- */
window.addEventListener("DOMContentLoaded", async () => {
    try {
        await Rewards.initialize();
    } catch (error) {
        console.error("Rewards Startup Error:", error);
    }
}); // FIXED MISSING CLOSING

export default Rewards;
