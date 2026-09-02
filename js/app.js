"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - MASTER APP MODULE
   COMPLETE RECONSTRUCTION - FINAL SYNC
===================================================== */

import UI from "./ui.js";
import Api from "./api.js";
import State from "./state.js";
import Auth from "./auth.js";
import Profile from "./profile.js";
import Wallet from "./wallet.js";
import Tasks from "./tasks.js";
import Rewards from "./rewards.js";
import Ads from "./ads.js";
import Notifications from "./notifications.js";
import Admin from "./admin.js";
import Utils from "./utils.js";

const App = {
    initialized: false,

    // --- STARTUP SEQUENCE ---
    start: async function() {
        UI.hideLoading();
        UI.showScreen("auth-screen");

        const tg = window.Telegram?.WebApp;
        const tgUser = tg?.initDataUnsafe?.user;

        if (tgUser) {
            // Hard Anchor: Save to both State AND LocalStorage
            const uid = tgUser.id;
            localStorage.setItem("active_user_id", uid);
            State.setUser({ user_id: uid, username: tgUser.username || tgUser.first_name });
            
            console.log("Identity Locked:", uid);
            await this.initializeModules(uid);
        } else {
            // For testing in browser
            const backupId = localStorage.getItem("active_user_id") || 8072346076;
            await this.initializeModules(backupId);
        }

        setTimeout(() => {
            UI.showScreen("splash-screen");
            setTimeout(() => {
                UI.showScreen("dashboard-screen");
                UI.initNavigation((screen) => {
                    const name = screen.replace("-screen", "");
                    if (name === "wallet") UI.renderWallet();
                    if (name === "tasks") UI.renderTasks();
                    if (name === "profile") UI.renderProfile();
                    if (name === "dashboard") this.refreshUI();
                });
                this.refreshUI();
            }, 3000);
        }, 3000);
    },

    // --- MODULE INITIALIZATION ---
    initializeModules: async function(userId) {
        try {
            await Api.initialize();
            await State.initialize();
            
            // Sync all data from Northflank using the identified user ID
            await Promise.all([
                Auth.restoreSession(),
                Profile.initialize(),
                Wallet.loadBalance(userId),
                Tasks.loadTasks(userId),
                Rewards.initialize(),
                Ads.initialize(),
                Notifications.initialize()
            ]);

            if (Auth.isAdmin()) {
                await Admin.initialize();
            }

            this.initialized = true;
        } catch (error) {
            console.warn("Background load skipped, using cache.");
        }
    },

    // --- NAVIGATION LOGIC ---
    setupNavigation: function() {
        UI.initNavigation((screenId) => {
            const name = screenId.replace("-screen", "");
            console.log("Navigating to module:", name);

            // Trigger specific module renderers
            if (name === "dashboard") this.refreshUI();
            if (name === "wallet") UI.renderWallet();
            if (name === "tasks") UI.renderTasks();
            if (name === "profile") UI.renderProfile();
            if (name === "rewards") UI.renderRewards();
            if (name === "daily-bonus") UI.renderDailyBonus();

            // Admin Panel Screen Logic
            if (name === "admin-dashboard") {
                if (Auth.isAdmin()) {
                    UI.renderAdminDashboard();
                    Admin.loadDashboard();
                } else {
                    UI.toast("Access Denied: Admin Only", "error");
                    UI.showScreen("dashboard-screen");
                }
            }
            if (name === "admin-tasks") UI.renderAdminTasks();
        });
    },

    // --- GLOBAL UI REFRESH ---
    refreshUI: function() {
        UI.renderDashboard({
            balance: Wallet.getAvailableBalance(),
            earned: Wallet.getEarnedBalance(),
            referrals: Profile.getStatistics().referrals
        });
    }
};

/* --- APPLICATION ENTRY POINT --- */
document.addEventListener("DOMContentLoaded", () => {
    App.start();
});

export default App;
