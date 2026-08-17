"use strict";
import UI from "./ui.js";
import Api from "./api.js";
import Profile from "./profile.js";
import Wallet from "./wallet.js";
import Tasks from "./tasks.js";

const App = {
    start: async function() {
        UI.openAuth();

        try {
            await Api.initialize();
            
            // Sync everything: Profile, Wallet, and now Tasks
            await Promise.all([
                Profile.load(),
                Wallet.sync(),
                Tasks.load() // We will ensure this exists in Phase 2
            ]);
            
            console.log("All App Data Synced.");
        } catch (error) {
            console.warn("Sync failed:", error);
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
