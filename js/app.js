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
                UI.initNavigation((name) => {
                    if (name.includes("wallet")) UI.renderWallet();
                    if (name.includes("tasks")) UI.renderTasks();
                });
                UI.renderDashboard();
            }, 3000);
        }, 3000);
    }
};

document.addEventListener("DOMContentLoaded", () => App.start());
export default App;
