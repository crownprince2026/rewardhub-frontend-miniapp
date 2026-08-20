"use strict";
import UI from "./ui.js";

const App = {
    start: function() {
        // Hide loader and show Auth immediately
        UI.hideLoading();
        UI.showScreen("auth-screen");

        setTimeout(() => {
            UI.showScreen("splash-screen");

            setTimeout(() => {
                UI.showScreen("dashboard-screen");
                UI.initNavigation();
                UI.renderDashboard();
            }, 3000);
        }, 3000);
    }
};

document.addEventListener("DOMContentLoaded", () => App.start());
export default App;
