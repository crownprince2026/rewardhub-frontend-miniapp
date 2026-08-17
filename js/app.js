"use strict";
import UI from "./ui.js";
import Api from "./api.js";
import Profile from "./profile.js";
import Wallet from "./wallet.js";
import Tasks from "./tasks.js";

const App = {
    start: async function() {
        console.log("Stage 1: App Start");
        UI.openAuth();

        this.loadAppData();

        setTimeout(() => {
            console.log("Stage 2: Splash");
            UI.openSplash();

            setTimeout(() => {
                console.log("Stage 3: Dashboard");
                UI.openDashboard();
                UI.hideLoading();

                UI.initNavigation((screen) => {
                    if (screen === 'tasks') UI.renderTasks(Tasks.getTasks());
                    if (screen === 'dashboard') this.refreshUI();
                });

                this.refreshUI();

                const debug = document.getElementById('debug-check');
                if(debug) debug.style.display = 'none';
            }, 3000);
        }, 3000);
    },

    loadAppData: async function() {
        try {
            await Api.initialize();
            if (Profile.load) await Profile.load().catch(() => {});
            if (Wallet.sync) await Wallet.sync().catch(() => {});
            if (Tasks.loadTasks) await Tasks.loadTasks().catch(() => {});
        } catch (e) {
            console.log("Background sync pending...");
        }
    },

    refreshUI: function() {
        const stats = (Profile.getStatistics) ? Profile.getStatistics() : { totalEarned: 0 };
        const balance = (Wallet.getAvailableBalance) ? Wallet.getAvailableBalance() : 0;
        UI.renderDashboard({
            balance: balance,
            earned: stats.totalEarned
        });
    }
};

document.addEventListener("DOMContentLoaded", () => App.start());
