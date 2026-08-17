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
            await Profile.load();
            await Wallet.sync();
            // Load tasks but don't let it crash the app if it fails
            if (Tasks.load) await Tasks.load().catch(() => console.log("Tasks skipped"));
        } catch (e) { console.error("Load failed", e); }

        setTimeout(() => {
            UI.openSplash();
            setTimeout(() => {
                UI.openDashboard();
                UI.hideLoading();
                UI.initNavigation();
                
                // Manually trigger task render when needed
                const tasksBtn = document.querySelector('[data-nav="tasks"]');
                if (tasksBtn) {
                    tasksBtn.addEventListener('click', () => {
                        UI.renderTasks(Tasks.getTasks());
                    });
                }
            }, 3000);
        }, 3000);
    }
};

document.addEventListener("DOMContentLoaded", () => App.start());
