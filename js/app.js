"use strict";
import UI from "./ui.js";
import Wallet from "./wallet.js";

const App = {
    start: async function() {
        // Force hide loader immediately to reveal Auth
        UI.hideLoading();
        UI.showScreen("auth-screen");

        // Load real wallet data in background
        Wallet.initialize().catch(() => console.log("Initializing..."));

        setTimeout(() => {
            UI.showScreen("splash-screen");

            setTimeout(() => {
                UI.showScreen("dashboard-screen");
                UI.initNavigation((screen) => {
                    const name = screen.replace('-screen', '');
                    if (name === 'wallet') UI.renderWallet();
                    if (name === 'dashboard') this.refreshDashboard();
                });

                this.refreshDashboard();
            }, 3000);
        }, 3000);
    },

    refreshDashboard: function() {
        UI.renderDashboard();
    }
};

document.addEventListener("DOMContentLoaded", () => App.start());
export default App;


