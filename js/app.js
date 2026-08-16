"use strict";
import UI from "./ui.js";

const App = {
    start: async function() {
        console.log("App sequence starting...");
        
        // 1. Show Auth
        UI.openAuth();
        
        // 2. Wait 3 seconds -> Show Splash
        setTimeout(() => {
            UI.openSplash();
            
            // 3. Wait 3 seconds -> Show Dashboard
            setTimeout(() => {
                UI.openDashboard();
                UI.hideLoading();
            }, 3000);
            
        }, 3000);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    App.start();
});

export default App;
