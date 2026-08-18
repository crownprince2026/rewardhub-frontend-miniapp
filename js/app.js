"use strict";
import UI from "./ui.js";

const App = {
    start: function() {
        console.log("App Started in Safe Mode");
        
        // 1. Show Auth
        UI.openAuth();

        setTimeout(() => {
            // 2. Show Splash
            UI.openSplash();

            setTimeout(() => {
                // 3. Show Dashboard
                UI.openDashboard();
                UI.hideLoading();
                UI.initNavigation();
                
                // Remove debug bar
                const debug = document.getElementById('debug-check');
                if(debug) debug.style.display = 'none';
            }, 3000);
        }, 3000);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    App.start();
});

export default App;
