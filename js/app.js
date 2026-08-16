"use strict";

import * as API from "./api.js";
import MiniAppAuth from "./miniapp-auth.js";
import * as State from "./state.js";
import * as Settings from "./settings.js";
import * as Router from "./router.js";
import UI from "./ui.js"; // Changed to default import to match ui.js export
import * as Admin from "./admin.js";
import * as Rewards from "./rewards.js";
import * as Wallet from "./wallet.js";
import * as Tasks from "./tasks.js";
import * as Profile from "./profile.js";
import * as Notifications from "./notifications.js";
import * as Ads from "./ads.js";
import * as Animations from "./animations.js";
import * as Utils from "./utils.js";

const App = {
    initialized: false,
    modules: { api: API, auth: MiniAppAuth, state: State, settings: Settings, router: Router, ui: UI, admin: Admin, rewards: Rewards, wallet: Wallet, tasks: Tasks, profile: Profile, notifications: Notifications, ads: Ads, animations: Animations, utils: Utils }
};

App.initialize = async function () {
    try {
        const TelegramApp = window.Telegram?.WebApp;
        if (TelegramApp) {
            TelegramApp.ready();
            TelegramApp.expand();
        }
        // Run all module initializations
        await Promise.all([
            this.modules.state.initialize(this),
            this.modules.settings.initialize(this),
            this.modules.api.initialize(this),
            this.modules.auth.initialize(this),
            this.modules.ui.initialize(this)
        ]);
        this.initialized = true;
    } catch (e) {
        console.error("Background Init Error:", e);
    }
};

App.start = async function () {
    console.log("App Starting Sequence...");

    // 1. Show AUTH SCREEN immediately
    UI.showScreen("auth");

    // 2. Start initialization in the BACKGROUND (don't 'await' it yet)
    this.initialize();

    // 3. WAIT 3 SECONDS -> Show SPLASH
    setTimeout(() => {
        UI.showScreen("splash");
        
        // 4. WAIT 3 MORE SECONDS -> Show DASHBOARD
        setTimeout(() => {
            UI.showScreen("dashboard");
            UI.hideLoading();
            console.log("App Sequence Complete: Dashboard Live.");
        }, 3000);

    }, 3000);
};

// Start when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    App.start();
});

export default App;
