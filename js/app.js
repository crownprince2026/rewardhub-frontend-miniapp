"use strict";
import UI from "./ui.js";
import Wallet from "./wallet.js";

const App = {
    start: async function() {
        UI.openAuth();
        
        // Initialize wallet in background
        Wallet.initialize().catch(e => console.log("Offline mode"));

        setTimeout(() => {
            UI.openSplash();
            setTimeout(() => {
                UI.openDashboard();
                UI.hideLoading();

                UI.initNavigation((screen) => {
                    if (screen === 'wallet') UI.renderWallet();
                    if (screen === 'dashboard') this.refreshDashboard();
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
