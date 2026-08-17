"use strict";
import UI from "./ui.js";
import Api from "./api.js";
import Profile from "./profile.js";
import Wallet from "./wallet.js";

const App = {
    start: async function() {
        console.log("Stage 1: App Start");
        UI.openAuth();

        // Start loading data in the background
        this.loadAppData();

        setTimeout(() => {
            console.log("Stage 2: Splash");
            UI.openSplash();

            setTimeout(() => {
                console.log("Stage 3: Dashboard");
                UI.openDashboard();
                UI.hideLoading();
                UI.initNavigation();
                
                // Refresh the dashboard with whatever data we loaded
                this.refreshUI();
            }, 3000);
        }, 3000);
    },

    loadAppData: async function() {
        try {
            await Api.initialize();
            // Try to load profile and wallet, but don't stop the app if they fail
            if (Profile.load) await Profile.load().catch(e => console.log("Profile wait"));
            if (Wallet.sync) await Wallet.sync().catch(e => console.log("Wallet wait"));
            console.log("Data background sync complete");
        } catch (e) {
            console.log("Network background error");
        }
    },

    refreshUI: function() {
        // Pass real data to the UI renderer
        const stats = (Profile.getStatistics) ? Profile.getStatistics() : { totalEarned: 0 };
        const balance = (Wallet.getAvailableBalance) ? Wallet.getAvailableBalance() : 0;
        
        UI.renderDashboard({
            balance: balance,
            earned: stats.totalEarned
        });
    }
};

document.addEventListener("DOMContentLoaded", () => App.start());
