"use strict";
import UI from "./ui.js";
import Api from "./api.js";
import Profile from "./profile.js";
import Wallet from "./wallet.js";
import Tasks from "./tasks.js";

const App = {
    start: async function() {
        console.log("App starting...");
        
        // 1. Show Auth immediately (No matter what)
        try {
            UI.openAuth();
        } catch(e) {
            console.error("UI OpenAuth failed", e);
        }

        // 2. Load Data Safely
        try {
            if (Api.initialize) await Api.initialize();
            
            // Use optional chaining so if .load doesn't exist yet, it doesn't crash
            if (Profile.load) await Profile.load().catch(e => console.log("Profile load skipped"));
            if (Wallet.sync) await Wallet.sync().catch(e => console.log("Wallet sync skipped"));
            if (Tasks.load) await Tasks.load().catch(e => console.log("Tasks load skipped"));
            
        } catch (error) {
            console.warn("Background data load encountered issues:", error);
        }

        // 3. Forced Sequence
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
    App.start().catch(err => console.error("CRITICAL BOOT ERROR:", err));
});

export default App;
