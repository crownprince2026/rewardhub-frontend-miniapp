"use strict";
import UI from "./ui.js";
import Api from "./api.js";
import Profile from "./profile.js";
import Wallet from "./wallet.js";

const App = {
    start: async function() {
        UI.openAuth();

        try {
            await Api.initialize();
            
            // Sync all financial and profile data
            await Promise.all([
                Profile.load(),
                Wallet.sync() 
            ]);
            
            console.log("App Data Fully Synced.");
        } catch (error) {
            console.warn("Sync failed, using cache:", error);
            Wallet.loadCache();
        }

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
