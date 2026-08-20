"use strict";
import UI from "./ui.js";
import Wallet from "./wallet.js";
import Tasks from "./tasks.js";

const App = {
    start: async function() {
        UI.hideLoading();
        UI.showScreen("auth-screen");

        // Sync real data
        Wallet.initialize().catch(() => {});
        Tasks.loadTasks().catch(() => {});

        setTimeout(() => {
            UI.showScreen("splash-screen");

            setTimeout(() => {
                UI.showScreen("dashboard-screen");
                UI.initNavigation((screen) => {
                    const name = screen.replace('-screen', '');
                    if (name === 'wallet') UI.renderWallet();
                    if (name === 'tasks') UI.renderTasks();
                    if (name === 'dashboard') UI.renderDashboard();
                });
                UI.renderDashboard();
            }, 3000);
        }, 3000);
    }
};

document.addEventListener("DOMContentLoaded", () => App.start());
export default App;
