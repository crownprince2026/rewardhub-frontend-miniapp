"use strict";
import UI from "./ui.js";
import Profile from "./profile.js";
import Wallet from "./wallet.js";
import Api from "./api.js";
// import Tasks from "./tasks.js"; // Temporarily disabled to prevent crash

const App = {
    start: async function() {
        UI.openAuth();
        
        try {
            await Api.initialize();
            await Profile.load();
            await Wallet.sync();
            // await Tasks.load(); // Disabled
        } catch (e) { console.warn("Background load skipped", e); }

        setTimeout(() => {
            UI.openSplash();
            setTimeout(() => {
                UI.openDashboard();
                UI.hideLoading();
                
                UI.renderDashboard({
                    balance: Wallet.getAvailableBalance(),
                    earned: Profile.getStatistics().totalEarned
                });

                UI.initNavigation((screen) => {
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
