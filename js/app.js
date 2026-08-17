"use strict";
import UI from "./ui.js";
import Api from "./api.js";
import State from "./state.js";

const App = {
    start: async function() {
        // 1. Show Auth Screen (Visual)
        UI.openAuth();

        // 2. BACKGROUND DATA LOAD: Initialize API and Fetch Profile
        try {
            await Api.initialize(); // Uses current session if exists
            
            // If you have a user ID from Telegram, pass it here. 
            // For now, we try to fetch the "current" profile
            const profile = await Api.profile(); 
            State.setUser(profile);
            console.log("Real Data Loaded:", profile);
        } catch (error) {
            console.warn("Could not load real data, using defaults:", error);
        }

        // 3. Timing Sequence
        setTimeout(() => {
            UI.openSplash();

            setTimeout(() => {
                UI.openDashboard();
                UI.hideLoading();
                UI.initNavigation();
            }, 3000);

        }, 3000);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    App.start();
});

export default App;
