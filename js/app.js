"use strict";
import UI from "./ui.js";
import Api from "./api.js";
import State from "./state.js";
import Profile from "./profile.js";
import Wallet from "./wallet.js";

const App = {
    start: async function() {
        UI.openAuth();

        // BACKGROUND DATA LOAD
        try {
            await Api.initialize();
            
            // Load both Profile and Wallet in parallel
            await Promise.all([
                Profile.load(),
                Wallet.loadBalance()
            ]);
            
            console.log("Real Financial Data Loaded.");
        } catch (error) {
            console.warn("Data load failed, showing zeros:", error);
        }

        // Timing Sequence
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
