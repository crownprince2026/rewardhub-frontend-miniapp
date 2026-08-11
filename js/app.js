"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB
   TELEGRAM MINI APP
   APP.JS
   PHASE 1A.1
   IMPORTS
   CONSTANTS
   GLOBAL APPLICATION OBJECT
===================================================== */

import * as API from "./api.js";
import MiniAppAuth from "./miniapp-auth.js";
import * as State from "./state.js";
import * as Settings from "./settings.js";
import * as Router from "./router.js";
import * as UI from "./ui.js";
import * as Admin from "./admin.js";
import * as Rewards from "./rewards.js";
import * as Wallet from "./wallet.js";
import * as Tasks from "./tasks.js";
import * as Profile from "./profile.js";
import * as Notifications from "./notifications.js";
import * as Ads from "./ads.js";
import * as Animations from "./animations.js";
import * as Utils from "./utils.js";

/* =====================================================
   TELEGRAM WEBAPP
===================================================== */

const TelegramApp = window.Telegram?.WebApp ?? null;

/* =====================================================
   APPLICATION CONSTANTS
===================================================== */

const APP_NAME = "Crown Prince Reward Hub";

const APP_VERSION = "1.0.0";

const API_VERSION = "v1";

const APP_MODE = "production";

const START_PAGE = "loading";

const DEFAULT_THEME = "dark";

const SESSION_STORAGE_KEY = "rewardhub_session";

const SETTINGS_CACHE_KEY = "rewardhub_settings";

const USER_CACHE_KEY = "rewardhub_user";

const ADMIN_CACHE_KEY = "rewardhub_admin";

/* =====================================================
   GLOBAL APPLICATION OBJECT
===================================================== */

const App = {

    initialized: false,

    authenticated: false,

    online: navigator.onLine,

    loading: true,

    currentPage: START_PAGE,

    previousPage: null,

    currentTheme: DEFAULT_THEME,

    telegram: TelegramApp,

    user: null,

    session: null,

    settings: {},

    notifications: [],

    cache: {},

    admin: {

        enabled: false,

        authenticated: false,

        permissions: []

    },

    modules: {

        api: API,

        auth: MiniAppAuth,

        state: State,

        settings: Settings,

        router: Router,

        ui: UI,

        admin: Admin,

        rewards: Rewards,

        wallet: Wallet,

        tasks: Tasks,

        profile: Profile,

        notifications: Notifications,

        ads: Ads,

        animations: Animations,

        utils: Utils

    }

};

/* =====================================================
   MAKE APP GLOBALLY AVAILABLE
===================================================== */

window.RewardHub = App;

/* =====================================================
   END OF PHASE 1A.1
===================================================== */

/* =====================================================
   PHASE 1A.2
   INITIALIZATION
   STARTUP LIFECYCLE
===================================================== */

/* =====================================================
   INITIALIZE APPLICATION
===================================================== */

App.initialize = async function () {

    if (this.initialized) {

        return;

    }

    try {

        console.log(`${APP_NAME} ${APP_VERSION} starting...`);

        if (this.telegram) {

            this.telegram.ready();

            this.telegram.expand();

            this.telegram.enableClosingConfirmation();

        }

        await this.modules.state.initialize(this);

        await this.modules.settings.initialize(this);

        await this.modules.api.initialize(this);

        await this.modules.auth.initialize(this);

        await this.modules.router.initialize(this);

        await this.modules.ui.initialize(this);

        await this.modules.animations.initialize(this);

        await this.modules.notifications.initialize(this);

        await this.modules.profile.initialize(this);

        await this.modules.wallet.initialize(this);

        await this.modules.tasks.initialize(this);

        await this.modules.rewards.initialize(this);

        await this.modules.ads.initialize(this);

        await this.modules.admin.initialize(this);

        this.initialized = true;

        console.log("Application initialized.");

    }

    catch (error) {

        console.error("Initialization failed.", error);

        this.modules.ui.showFatalError(error);

    }

};


/* =====================================================
   START APPLICATION
===================================================== */

App.start = async function () {

    try {

        // Use the application's single loading/splash route.
        // Do not create a second global loading overlay.
        await this.initialize();

        // Mini App authentication bypassed for startup test.
        // Flow: START -> SPLASH -> DASHBOARD.
        // await this.modules.auth.restoreSession();

        await this.modules.settings.load();

        await this.modules.router.launch();

        this.loading = false;

        console.log("Application started successfully.");

    }

    catch (error) {

        console.error("Startup failed.", error);

        this.modules.ui.showFatalError(error);

    }

};


/* =====================================================
   RESTART APPLICATION
===================================================== */

App.restart = async function () {

    console.log("Restarting application...");

    this.loading = true;

    this.initialized = false;

    await this.start();

};


/* =====================================================
   SHUTDOWN
===================================================== */

App.shutdown = function () {

    console.log("Application shutting down...");

    this.loading = false;

};


/* =====================================================
   APPLICATION STATUS
===================================================== */

App.isReady = function () {

    return this.initialized;

};

App.isOnline = function () {

    return this.online;

};

App.isAuthenticated = function () {

    return this.authenticated;

};


/* =====================================================
   END OF PHASE 1A.2
===================================================== */

/* =====================================================
   PHASE 1A.3
   AUTHENTICATION
   LAUNCH FLOW
===================================================== */


/* =====================================================
   AUTHENTICATE USER
===================================================== */

App.authenticate = async function () {

    try {

        this.modules.ui.updateLoading("Authenticating...");

        const authenticated =
            await this.modules.auth.authenticate();

        if (!authenticated) {

            throw new Error("Authentication failed.");

        }

        this.authenticated = true;

        this.user =
            await this.modules.auth.getCurrentUser();

        this.session =
            await this.modules.auth.getSession();

        this.modules.state.setUser(this.user);

        return true;

    }

    catch (error) {

        console.error(error);

        this.modules.ui.showError(
            "Authentication failed."
        );

        return false;

    }

};


/* =====================================================
   LOAD SETTINGS
===================================================== */

App.loadSettings = async function () {

    this.modules.ui.updateLoading(
        "Loading settings..."
    );

    this.settings =
        await this.modules.settings.load();

};


/* =====================================================
   LOAD USER DATA
===================================================== */

App.loadUserData = async function () {

    this.modules.ui.updateLoading(
        "Loading profile..."
    );

    await this.modules.wallet.load();

    await this.modules.tasks.load();

    await this.modules.rewards.load();

    await this.modules.profile.load();

    await this.modules.notifications.load();

};


/* =====================================================
   LAUNCH FLOW
===================================================== */

App.launch = async function () {

    try {

        this.modules.ui.showLoading();

        const authenticated =
            await this.authenticate();

        if (!authenticated) {

            return;

        }

        await this.loadSettings();

        await this.loadUserData();

        const firstLaunch =
            this.modules.settings.isFirstLaunch();

        if (firstLaunch) {

            this.modules.router.go(
                "onboarding"
            );

        }

        else {

            this.modules.router.go(
                "dashboard"
            );

        }

        this.modules.ui.hideLoading();

    }

    catch (error) {

        console.error(error);

        this.modules.ui.showFatalError(error);

    }

};


/* =====================================================
   LOGOUT
===================================================== */

App.logout = async function () {

    await this.modules.auth.logout();

    this.authenticated = false;

    this.user = null;

    this.session = null;

    this.modules.router.go("login");

};


/* =====================================================
   SWITCH MODE
===================================================== */

App.switchMode = async function (mode) {

    if (mode === "admin") {

        const allowed =
            await this.modules.admin.authenticate();

        if (!allowed) {

            return;

        }

        this.admin.enabled = true;

        this.modules.router.go(
            "admin-dashboard"
        );

        return;

    }

    this.admin.enabled = false;

    this.modules.router.go(
        "dashboard"

    );

};


/* =====================================================
   END OF PHASE 1A.3
===================================================== */

/* =====================================================
   PHASE 1A.4
   EVENT LISTENERS
   ERROR HANDLING
   SHUTDOWN
   PRODUCTION EXPORT
===================================================== */


/* =====================================================
   NETWORK EVENTS
===================================================== */

window.addEventListener("online", () => {

    App.online = true;

    App.modules.ui.hideOfflineScreen();

    App.modules.notifications.info(
        "Internet connection restored."
    );

});

window.addEventListener("offline", () => {

    App.online = false;

    App.modules.ui.showOfflineScreen();

    App.modules.notifications.warning(
        "You are currently offline."
    );

});


/* =====================================================
   PAGE VISIBILITY
===================================================== */

document.addEventListener("visibilitychange", () => {

    if (document.hidden) {

        console.log("Application paused.");

        return;

    }

    console.log("Application resumed.");

});


/* =====================================================
   WINDOW EVENTS
===================================================== */

window.addEventListener("beforeunload", () => {

    App.shutdown();

});


window.addEventListener("resize", () => {

    App.modules.ui.updateLayout();

});


/* =====================================================
   GLOBAL ERROR HANDLER
===================================================== */

window.addEventListener("error", (event) => {

    console.error("Application Error:", event.error);

    App.modules.ui.showError(

        "An unexpected error occurred."

    );

});


/* =====================================================
   UNHANDLED PROMISES
===================================================== */

window.addEventListener(

    "unhandledrejection",

    (event) => {

        console.error(

            "Unhandled Promise:",

            event.reason

        );

        App.modules.ui.showError(

            "Background operation failed."

        );

    }

);


/* =====================================================
   TELEGRAM EVENTS
===================================================== */

if (TelegramApp) {

    TelegramApp.onEvent(

        "themeChanged",

        () => {

            App.currentTheme =

                TelegramApp.colorScheme;

            App.modules.ui.applyTheme(

                App.currentTheme

            );

        }

    );

    TelegramApp.onEvent(

        "viewportChanged",

        () => {

            App.modules.ui.updateLayout();

        }

    );

}


/* =====================================================
   APPLICATION BOOTSTRAP
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await App.start();

    }

);


/* =====================================================
   PRODUCTION EXPORT
===================================================== */

export default App;


/* =====================================================
   END OF FILE
   frontend/js/app.js
   CROWN PRINCE REWARD HUB
   PRODUCTION BUILD
===================================================== */
