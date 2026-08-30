"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - MASTER APP MODULE
   COMPLETE RECONSTRUCTION - PHASE 5 (FINAL)
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
        console.log("App Brain: Starting Startup Sequence...");
        
        // 1. Immediate Action: Show Auth Screen
        UI.hideLoading();
        UI.showScreen("auth-screen");

        // 2. Background Task: Initialize all Modules
        this.initializeModules().catch(e => console.error("Init Warning:", e));

        // 3. Timing Sequence (Auth -> Splash -> Dashboard)
        setTimeout(() => {
            UI.showScreen("splash-screen");

            setTimeout(async () => {
                // Determine starting screen (Admin or Dashboard)
                const startScreen = Auth.isAdmin() ? "dashboard-screen" : "dashboard-screen";
                UI.showScreen(startScreen);

                // 4. Activate Interactivity
                this.setupNavigation();
                this.refreshUI();
                
                console.log("App Brain: Startup Complete. System Live.");
            }, 3000);
        }, 3000);
    },

    // --- MODULE INITIALIZATION ---
    initializeModules: async function() {
        try {
            await Api.initialize();
            await State.initialize();
            
            // Parallel load for maximum speed
            await Promise.all([
                Auth.restoreSession(),
                Profile.initialize(),
                Wallet.initialize(),
                Tasks.loadTasks(),
                Rewards.initialize(),
                Ads.initialize(),
                Notifications.initialize()
            ]);

            if (Auth.isAdmin()) {
                await Admin.initialize();
            }

            this.initialized = true;
        } catch (error) {
            console.warn("Module Sync encounterd an issue, using offline cache.");
        }
    },

// --- NAVIGATION LOGIC ---
    setupNavigation: function() {
        UI.initNavigation((screenId) => {
            const name = screenId.replace("-screen", "");
            if (name === "dashboard") this.refreshUI();
            if (name === "wallet") UI.renderWallet();
            if (name === "tasks") UI.renderTasks();
            if (name === "profile") UI.renderProfile();
            if (name === "rewards") UI.renderRewards();
            if (name === "daily-bonus") UI.renderDailyBonus(); // Fixed position
        });
    },
            // Admin Panel Switch
            if (name === "admin-dashboard") {
                if (Auth.isAdmin()) {
                    Admin.loadDashboard();
                } else {
                    UI.toast("Access Denied: Admin Only", "error");
                    UI.showScreen("dashboard-screen");
                }
            }
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
