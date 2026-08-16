"use strict";
import UI from "./ui.js";

const App = {
    start: function() {
        console.log("Sequence Started: 1. Auth");
        
        // 1. Force Auth Screen
        UI.openAuth();

        // 2. Wait 3 seconds then show Splash
        setTimeout(() => {
            console.log("Sequence: 2. Splash");
            UI.openSplash();

            // 3. Wait 3 more seconds then show Dashboard
            setTimeout(() => {
                console.log("Sequence: 3. Dashboard");
                UI.openDashboard();
                UI.hideLoading();
            }, 3000);

        }, 3000);
    }
};

// Only one entry point
document.addEventListener("DOMContentLoaded", () => {
    App.start();
});

export default App;
