"use strict";
import UI from "./ui.js";
import Wallet from "./wallet.js";

const App = {
    start: async function() {
        // 1. IMMEDIATE ACTION: Kill the loader and show Auth
        const loader = document.getElementById("loading-overlay");
        if(loader) loader.style.display = "none";
        UI.showScreen("auth-screen");

        console.log("App Force-Started");

        // 2. Background Sync
        Wallet.initialize().catch(() => {});

        // 3. The Sequence
        setTimeout(() => {
            UI.showScreen("splash-screen");
            setTimeout(() => {
                UI.showScreen("dashboard-screen");
                UI.initNavigation((screen) => {
                    const name = screen.replace("-screen", "");
                    if (name === "wallet") UI.renderWallet();
                    if (name === "dashboard") UI.renderDashboard();
                });
                UI.renderDashboard();
            }, 3000);
        }, 3000);
    }
};

document.addEventListener("DOMContentLoaded", () => App.start());
export default App;
