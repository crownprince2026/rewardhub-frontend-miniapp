"use strict";
import UI from "./ui_v2.js";
import Wallet from "./wallet_v2.js";

const App = {
    start: async function() {
        // Stage 1: Auth
        UI.openAuth();

        // Load data in background
        Wallet.initialize().catch(() => {});

        setTimeout(() => {
            // Stage 2: Splash
            UI.openSplash();

            setTimeout(() => {
                // Stage 3: Dashboard
                UI.openDashboard();
                UI.hideLoading();

                UI.initNavigation((name) => {
                    if (name === 'wallet') UI.renderWallet();
                    if (name === 'dashboard') this.refreshDashboard();
                });

                this.refreshDashboard();
            }, 3000);
        }, 3000);
    },

    refreshDashboard: function() {
        UI.renderDashboard({
            balance: Wallet.getAvailableBalance(),
            earned: Wallet.getEarnedBalance()
        });
    }
};

document.addEventListener("DOMContentLoaded", () => App.start());
export default App;
