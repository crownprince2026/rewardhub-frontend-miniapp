"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB
   TELEGRAM MINI APP
   STATE.JS
   PHASE 1D.1
   IMPORTS
   CONSTANTS
   GLOBAL STATE
===================================================== */

import * as Utils from "./utils.js";

/* =====================================================
   STORAGE KEYS
===================================================== */

const STATE_KEY = "rewardhub_state";

const UI_STATE_KEY = "rewardhub_ui_state";

const CACHE_KEY = "rewardhub_cache";

const SETTINGS_KEY = "rewardhub_settings";

/* =====================================================
   DEFAULTS
===================================================== */

const DEFAULT_THEME = "dark";

const DEFAULT_LANGUAGE = "en";

const DEFAULT_PAGE = "dashboard";

/* =====================================================
   GLOBAL APPLICATION STATE
===================================================== */

const State = {

    initialized: false,

    loading: false,

    online: navigator.onLine,

    app: {

        name: "Crown Prince Reward Hub",

        version: "1.0.0",

        mode: "production"

    },

    user: null,

    session: null,

    settings: {},

    cache: {},

    ui: {

        currentPage: DEFAULT_PAGE,

        previousPage: null,

        theme: DEFAULT_THEME,

        language: DEFAULT_LANGUAGE,

        sidebarOpen: false,

        modalOpen: false,

        searchOpen: false,

        bottomSheetOpen: false,

        loadingOverlay: false

    },

    admin: {

        enabled: false,

        authenticated: false,

        permissions: []

    },

    statistics: {

        launchedAt: Date.now(),

        lastSync: null,

        totalRequests: 0,

        cacheHits: 0

    }

};

/* =====================================================
   BASIC HELPERS
===================================================== */

State.isInitialized = function () {

    return this.initialized;

};

State.isOnline = function () {

    return this.online;

};

State.isLoading = function () {

    return this.loading;

};

/* =====================================================
   END OF PHASE 1D.1
===================================================== */

/* =====================================================
   PHASE 1D.2
   USER STATE
   SESSION STATE
   CACHE
===================================================== */


/* =====================================================
   USER STATE
===================================================== */

State.setUser = function (user) {

    this.user = user || null;

};

State.getUser = function () {

    return this.user;

};

State.clearUser = function () {

    this.user = null;

};


/* =====================================================
   SESSION STATE
===================================================== */

State.setSession = function (session) {

    this.session = session || null;

};

State.getSession = function () {

    return this.session;

};

State.clearSession = function () {

    this.session = null;

};


/* =====================================================
   USER SETTINGS
===================================================== */

State.setSettings = function (settings) {

    this.settings = {

        ...this.settings,

        ...settings

    };

};

State.getSettings = function () {

    return this.settings;

};


/* =====================================================
   CACHE
===================================================== */

State.setCache = function (

    key,

    value

) {

    this.cache[key] = {

        value,

        updated: Date.now()

    };

};


State.getCache = function (

    key

) {

    if (!(key in this.cache)) {

        return null;

    }

    this.statistics.cacheHits++;

    return this.cache[key].value;

};


State.hasCache = function (

    key

) {

    return key in this.cache;

};


State.removeCache = function (

    key

) {

    delete this.cache[key];

};


State.clearCache = function () {

    this.cache = {};

};


/* =====================================================
   USER LOGIN STATE
===================================================== */

State.isLoggedIn = function () {

    return this.user !== null;

};


State.isAdmin = function () {

    return this.admin.authenticated;

};


/* =====================================================
   UPDATE LAST SYNC
===================================================== */

State.updateSyncTime = function () {

    this.statistics.lastSync =

        Date.now();

};


/* =====================================================
   END OF PHASE 1D.2
===================================================== */

/* =====================================================
   PHASE 1D.3
   NAVIGATION STATE
   UI STATE
   THEME MANAGEMENT
===================================================== */


/* =====================================================
   NAVIGATION
===================================================== */

State.setCurrentPage = function (page) {

    this.ui.previousPage = this.ui.currentPage;

    this.ui.currentPage = page;

};

State.getCurrentPage = function () {

    return this.ui.currentPage;

};

State.getPreviousPage = function () {

    return this.ui.previousPage;

};

State.goBack = function () {

    if (this.ui.previousPage) {

        const previous = this.ui.previousPage;

        this.ui.previousPage = this.ui.currentPage;

        this.ui.currentPage = previous;

    }

};


/* =====================================================
   UI STATE
===================================================== */

State.setLoading = function (loading) {

    this.loading = loading;

};

State.showLoadingOverlay = function () {

    this.ui.loadingOverlay = true;

};

State.hideLoadingOverlay = function () {

    this.ui.loadingOverlay = false;

};

State.openSidebar = function () {

    this.ui.sidebarOpen = true;

};

State.closeSidebar = function () {

    this.ui.sidebarOpen = false;

};

State.openModal = function () {

    this.ui.modalOpen = true;

};

State.closeModal = function () {

    this.ui.modalOpen = false;

};

State.openBottomSheet = function () {

    this.ui.bottomSheetOpen = true;

};

State.closeBottomSheet = function () {

    this.ui.bottomSheetOpen = false;

};

State.openSearch = function () {

    this.ui.searchOpen = true;

};

State.closeSearch = function () {

    this.ui.searchOpen = false;

};


/* =====================================================
   THEME MANAGEMENT
===================================================== */

State.setTheme = function (theme) {

    this.ui.theme = theme;

    document.documentElement.setAttribute(

        "data-theme",

        theme

    );

};

State.getTheme = function () {

    return this.ui.theme;

};

State.toggleTheme = function () {

    if (this.ui.theme === "dark") {

        this.setTheme("light");

    }

    else {

        this.setTheme("dark");

    }

};


/* =====================================================
   LANGUAGE
===================================================== */

State.setLanguage = function (language) {

    this.ui.language = language;

};

State.getLanguage = function () {

    return this.ui.language;

};


/* =====================================================
   UI RESET
===================================================== */

State.resetUI = function () {

    this.ui.sidebarOpen = false;

    this.ui.modalOpen = false;

    this.ui.searchOpen = false;

    this.ui.bottomSheetOpen = false;

    this.ui.loadingOverlay = false;

};


/* =====================================================
   END OF PHASE 1D.3
===================================================== */

/* =====================================================
   PHASE 1D.4
   PERSISTENCE
   SYNCHRONIZATION
   OBSERVERS
===================================================== */


/* =====================================================
   LOCAL STORAGE
===================================================== */

State.save = function () {

    try {

        localStorage.setItem(

            STATE_KEY,

            JSON.stringify({

                user: this.user,

                session: this.session,

                settings: this.settings,

                ui: this.ui,

                admin: this.admin,

                statistics: this.statistics

            })

        );

    }

    catch (error) {

        console.error(

            "Unable to save state.",

            error

        );

    }

};


State.load = function () {

    try {

        const saved = localStorage.getItem(

            STATE_KEY

        );

        if (!saved) {

            return false;

        }

        const state = JSON.parse(saved);

        this.user = state.user || null;

        this.session = state.session || null;

        this.settings = state.settings || {};

        this.ui = {

            ...this.ui,

            ...(state.ui || {})

        };

        this.admin = {

            ...this.admin,

            ...(state.admin || {})

        };

        this.statistics = {

            ...this.statistics,

            ...(state.statistics || {})

        };

        return true;

    }

    catch (error) {

        console.error(

            "Unable to load state.",

            error

        );

        return false;

    }

};


State.clearStorage = function () {

    localStorage.removeItem(

        STATE_KEY

    );

};


/* =====================================================
   SESSION STORAGE
===================================================== */

State.saveSession = function (

    key,

    value

) {

    sessionStorage.setItem(

        key,

        JSON.stringify(value)

    );

};


State.loadSession = function (

    key

) {

    const value = sessionStorage.getItem(

        key

    );

    return value

        ? JSON.parse(value)

        : null;

};


State.clearSessionStorage = function () {

    sessionStorage.clear();

};


/* =====================================================
   SYNCHRONIZATION
===================================================== */

State.sync = async function () {

    this.statistics.lastSync = Date.now();

    this.save();

};


State.autoSync = function (

    interval = 30000

) {

    setInterval(

        () => {

            this.sync();

        },

        interval

    );

};


/* =====================================================
   OBSERVERS
===================================================== */

State.observers = [];


State.subscribe = function (

    callback

) {

    this.observers.push(

        callback

    );

};


State.unsubscribe = function (

    callback

) {

    this.observers = this.observers.filter(

        observer => observer !== callback

    );

};


State.notify = function (

    event,

    payload = {}

) {

    this.observers.forEach(

        observer => {

            try {

                observer(

                    event,

                    payload

                );

            }

            catch (error) {

                console.error(error);

            }

        }

    );

};


/* =====================================================
   INITIALIZATION
===================================================== */

State.initialize = async function () {

    if (this.initialized) {

        return;

    }

    this.load();

    this.autoSync();

    this.initialized = true;

};


/* =====================================================
   END OF PHASE 1D.4
===================================================== */

/* =====================================================
   PHASE 1D.5
   RESET
   ERROR HANDLING
   PRODUCTION EXPORT
===================================================== */


/* =====================================================
   RESET STATE
===================================================== */

State.reset = function () {

    this.loading = false;

    this.online = navigator.onLine;

    this.user = null;

    this.session = null;

    this.settings = {};

    this.cache = {};

    this.ui = {

        currentPage: DEFAULT_PAGE,

        previousPage: null,

        theme: DEFAULT_THEME,

        language: DEFAULT_LANGUAGE,

        sidebarOpen: false,

        modalOpen: false,

        searchOpen: false,

        bottomSheetOpen: false,

        loadingOverlay: false

    };

    this.admin = {

        enabled: false,

        authenticated: false,

        permissions: []

    };

    this.statistics = {

        launchedAt: Date.now(),

        lastSync: null,

        totalRequests: 0,

        cacheHits: 0

    };

    this.observers = [];

    this.clearStorage();

    this.clearSessionStorage();

};


/* =====================================================
   ERROR HANDLER
===================================================== */

State.handleError = function (error) {

    console.error(

        "State Error:",

        error

    );

    return {

        success: false,

        error

    };

};


/* =====================================================
   APPLICATION STATUS
===================================================== */

State.status = function () {

    return {

        initialized: this.initialized,

        loading: this.loading,

        online: this.online,

        currentPage: this.ui.currentPage,

        theme: this.ui.theme,

        language: this.ui.language,

        loggedIn: this.isLoggedIn(),

        admin: this.isAdmin(),

        cacheItems: Object.keys(

            this.cache

        ).length,

        observers: this.observers.length,

        lastSync: this.statistics.lastSync

    };

};


/* =====================================================
   ONLINE / OFFLINE EVENTS
===================================================== */

window.addEventListener(

    "online",

    () => {

        State.online = true;

        State.notify(

            "network-online"

        );

    }

);

window.addEventListener(

    "offline",

    () => {

        State.online = false;

        State.notify(

            "network-offline"

        );

    }

);


/* =====================================================
   BEFORE UNLOAD
===================================================== */

window.addEventListener(

    "beforeunload",

    () => {

        State.save();

    }

);


/* =====================================================
   PRODUCTION EXPORT
===================================================== */

export default State;


/* =====================================================
   END OF FILE
   frontend/js/state.js
   CROWN PRINCE REWARD HUB
   PRODUCTION BUILD
===================================================== */
