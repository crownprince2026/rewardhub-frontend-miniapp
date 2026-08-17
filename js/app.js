"use strict";
import UI from "./ui.js";
import Profile from "./profile.js";
import Wallet from "./wallet.js";
import Tasks from "./tasks.js";
import Api from "./api.js";

const App = {
    start: async function() {
        UI.openAuth();
        
        try {
            await Api.initialize();
            await Profile.load();
            await Wallet.sync();
            await Tasks.load();
        } catch (e) { console.warn("Background load skipped", e); }

        setTimeout(() => {
            UI.openSplash();
            setTimeout(() => {
                UI.openDashboard();
                UI.hideLoading();
                
                // Pass real data to UI
                UI.renderDashboard({
                    balance: Wallet.getAvailableBalance(),
                    earned: Profile.getStatistics().totalEarned
                });

                // Initialize Nav and pass a callback to update data when screens change
                UI.initNavigation((screen) => {
                    if(screen === 'tasks') UI.renderTasks(Tasks.getTasks());
                    if(screen === 'dashboard') UI.renderDashboard({
                        balance: Wallet.getAvailableBalance(),
                        earned: Profile.getStatistics().totalEarned
                    });
                });

                const debug = document.getElementById('debug-check');
                if(debug) debug.style.display = 'none';
            }, 3000);
        }, 3000);
    }
};

document.addEventListener("DOMContentLoaded", () => App.start());
