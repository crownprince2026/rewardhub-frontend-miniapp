"use strict";
import UI from "./ui.js";

const App = {
    start: function() {
        // 1. Start Sequence
        UI.openAuth();

        setTimeout(() => {
            UI.openSplash();

            setTimeout(() => {
                UI.openDashboard();
                UI.hideLoading();
                
                // 2. ACTIVATE BUTTONS
                // We initialize navigation once the dashboard is visible
                UI.initNavigation();
                console.log("All buttons are now active.");
            }, 3000);

        }, 3000);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    App.start();
});

export default App;
