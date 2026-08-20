"use strict";
import UI from "./ui.js";

const App = {
    start: function() {
        UI.hideLoading();
        UI.showScreen("auth-screen");

        setTimeout(() => {
            UI.showScreen("splash-screen");

            setTimeout(() => {
                UI.showScreen("dashboard-screen");
                UI.initNavigation((screen) => {
                    const name = screen.replace("-screen", "");
                    if (name === "tasks") UI.renderTasks();
                    if (name === "wallet") UI.renderWallet();
                    if (name === "rewards") UI.renderRewards();
                    if (name === "dashboard") UI.renderDashboard();
                });
                UI.renderDashboard();
            }, 3000);
        }, 3000);
    }
};

document.addEventListener("DOMContentLoaded", () => App.start());
export default App;
