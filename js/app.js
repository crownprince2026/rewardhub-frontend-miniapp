"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - APP MODULE
   CLEAN RECONSTRUCTION - BLOCK 1 (BRAIN)
===================================================== */

import UI from "./ui.js";
import Wallet from "./wallet.js";

const App = {
    start: async function() {
        console.log("Stage 1: Auth");
        UI.openAuth();

        // Start loading real wallet data in the background
        Wallet.initialize().catch(() => console.log("Wallet syncing..."));

        setTimeout(() => {
            console.log("Stage 2: Splash");
            UI.openSplash();

            setTimeout(() => {
                console.log("Stage 3: Dashboard");
                UI.openDashboard();
                UI.hideLoading();

                // Connect buttons to their drawing logic
                UI.initNavigation((screen) => {
                    if (screen === 'wallet') UI.renderWallet();
                    if (screen === 'dashboard') this.refreshDashboard();
                });

                // Draw initial balance on dashboard
                this.refreshDashboard();

                // Hide the blue debug bar if it exists
                const debug = document.getElementById('debug-check');
                if (debug) debug.style.display = 'none';

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

// Application Entry Point
document.addEventListener("DOMContentLoaded", () => {
    App.start();
});

export default App;
