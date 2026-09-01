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

Rewards.claimDailyBonus = async function () {
    try {
        this.claiming = true;
        const response = await Api.claimDailyBonus({
            user_id: State.getUser()?.user_id,
            username: State.getUser()?.username
        });

        if (response.success) {
            const reward = Number(response.reward || 0);
            
            // 1. Update Global Balance
            if (State.user) {
                State.user.balance += reward;
            }

            // 2. Update Statistics
            this.statistics.totalEarned += reward;
            this.statistics.dailyBonusesClaimed++;
            
            // 3. SET EXACT 24 HOUR RESET (86400 Seconds)
            this.setCooldown("daily", 86400);
            
            // 4. Save to Local Cache (Prevents cheating by closing app)
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
Rewards.spin = async function () {
    try {
        if (!this.isAvailable("spin")) return { success: false, message: "Wait for cooldown." };

        // 1. Probability Weights (Out of 1000 for precision)
        // Indices: 0:$0.01, 1:5XP, 2:$0.02, 3:TryAgain, 4:$0.04, 5:50XP, 6:$0.03, 7:$1.00, 8:$0.05, 9:$0.10
        const weights = [
            { index: 0, weight: 100 }, // $0.01 (10%)
            { index: 1, weight: 150 }, // 5 XP (15%)
            { index: 2, weight: 100 }, // $0.02 (10%)
            { index: 3, weight: 200 }, // Try Again (20%)
            { index: 4, weight: 100 }, // $0.04 (10%)
            { index: 5, weight: 200 }, // 50 XP (20%)
            { index: 6, weight: 100 }, // $0.03 (10%)
            { index: 7, weight: 5   }, // $1.00 (0.5% - Very Rare)
            { index: 8, weight: 40  }, // $0.05 (4%)
            { index: 9, weight: 5   }  // $0.10 (0.5%)
        ];

        // 2. Pick a random index based on weights
        let totalWeight = weights.reduce((acc, w) => acc + w.weight, 0);
        let random = Math.floor(Math.random() * totalWeight);
        let selected = weights[0];

        for (let w of weights) {
            if (random < w.weight) {
                selected = w;
                break;
            }
            random -= w.weight;
        }

        // 3. Call Backend to verify and save (Passing the result we want)
        // Note: Real apps do this calculation on backend to prevent cheating, 
        // but for now we follow your frontend plan.
        const response = await Api.claimSpin({ index: selected.index });

        if (response.success) {
            this.setCooldown("spin", 3600);
            this.saveCache();
        }
        
        // We return the index so the UI knows where to stop the wheel
        return { ...response, stopIndex: selected.index };
    } catch (e) { return { success: false, message: e.message }; }
};

/* --- MYSTERY BOX (Professional Rebuild) --- */
Rewards.openMysteryBox = async function () {
    try {
        // 1. Check if 1 hour has passed
        if (!this.isAvailable("mystery_box")) {
            return { success: false, message: "Mystery Box cooldown active." };
        }

        this.claiming = true;
        const user = State.getUser();

        // 2. Call the Backend API
        const response = await Api.claimMysteryBox({
            user_id: user?.user_id,
            username: user?.username
        });

       if (response.success) {
            // Weighted Rewards Logic
            const random = Math.random() * 100;
            let reward = 0;
            let type = "xp";
            let label = "50 XP";

            if (random < 70) { type = "xp"; label = "50 XP"; reward = 50; } // 70% Chance
            else if (random < 85) { type = "cash"; reward = 0.001; label = "$0.001"; } // Rare
            else if (random < 93) { type = "cash"; reward = 0.005; label = "$0.005"; } // Rare
            else if (random < 97) { type = "cash"; reward = 0.05; label = "$0.05"; } // Very Rare
            else if (random < 99.5) { type = "cash"; reward = 0.9; label = "$0.90"; } // Very Very Rare
            else { type = "cash"; reward = 1.0; label = "$1.00"; } // Jackpot

            // Add "No Luck" chance (Optional overlay)
            if (random > 50 && random < 55) { label = "Oops, No Luck!"; reward = 0; }

            if (type === "cash" && State.user) State.user.balance += reward;
            if (type === "xp" && State.user) State.user.xp = (State.user.xp || 0) + reward;

            this.statistics.totalEarned += (type === "cash" ? reward : 0);
            this.setCooldown("mystery_box", 3600); // 1 Hour
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
