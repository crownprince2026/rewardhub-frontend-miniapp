"use strict";
import UI from "./ui.js";
import Wallet from "./wallet.js";

const App = {
    start: async function() {
        // 1. Force hide any loader and show Auth immediately
        document.getElementById("loading-overlay").style.display = "none";
        UI.showScreen("auth-screen");

        // 2. Load wallet in background (don't let it block the UI)
        Wallet.initialize().catch(() => console.log("Syncing..."));

        // 3. The Professional Sequence
        setTimeout(() => {
            UI.showScreen("splash-screen");

            setTimeout(() => {
                UI.showScreen("dashboard-screen");
                UI.initNavigation((screen) => {
                    const name = screen.replace("-screen", "");
                    if (name === "wallet") UI.renderWallet();
                    if (name === "dashboard") this.refreshDashboard();
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
