"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB
   TELEGRAM MINI APP
   SETTINGS.JS
   PHASE 1E.1
   IMPORTS
   CONSTANTS
   DEFAULT SETTINGS
===================================================== */

import Api from "./api.js";
import State from "./state.js";
import * as Utils from "./utils.js";

/* =====================================================
   STORAGE
===================================================== */

const SETTINGS_STORAGE_KEY = "rewardhub_settings";

/* =====================================================
   DEFAULT SETTINGS
===================================================== */

const DEFAULT_SETTINGS = {

    appearance: {

        theme: "dark",

        language: "en",

        animations: true,

        compactMode: false,

        hapticFeedback: true

    },

    notifications: {

        enabled: true,

        announcements: true,

        rewards: true,

        withdrawals: true,

        referrals: true,

        maintenance: true,

        sound: true,

        vibration: true

    },

    rewards: {

        autoClaimDailyBonus: false,

        autoOpenMysteryBox: false,

        spinAnimations: true

    },

    ads: {

        personalized: true,

        preferredNetwork: "auto",

        rewardedAds: true

    },

    wallet: {

        currency: "USD",

        hideBalance: false,

        defaultWithdrawalMethod: "USDT"

    },

    privacy: {

        showProfile: true,

        showLeaderboard: true,

        analytics: true

    },

    developer: {

        debug: false,

        verboseLogging: false

    }

};

/* =====================================================
   SETTINGS STATE
===================================================== */

const Settings = {

    initialized: false,

    loaded: false,

    values: structuredClone(DEFAULT_SETTINGS),

    defaults: structuredClone(DEFAULT_SETTINGS),

    lastUpdated: null,

    version: "1.0.0"

};

/* =====================================================
   BASIC STATUS
===================================================== */

Settings.isInitialized = function () {

    return this.initialized;

};

Settings.isLoaded = function () {

    return this.loaded;

};

Settings.getAll = function () {

    return this.values;

};

Settings.getDefaults = function () {

    return this.defaults;

};

/* =====================================================
   END OF PHASE 1E.1
===================================================== */

/* =====================================================
   PHASE 1E.2
   USER PREFERENCES
   THEME
   LANGUAGE
   NOTIFICATIONS
===================================================== */


/* =====================================================
   THEME
===================================================== */

Settings.setTheme = function (theme) {

    this.values.appearance.theme = theme;

    document.documentElement.setAttribute(

        "data-theme",

        theme

    );

    State.setTheme(theme);

};


Settings.getTheme = function () {

    return this.values.appearance.theme;

};


Settings.toggleTheme = function () {

    this.setTheme(

        this.getTheme() === "dark"

            ? "light"

            : "dark"

    );

};


/* =====================================================
   LANGUAGE
===================================================== */

Settings.setLanguage = function (

    language

) {

    this.values.appearance.language =

        language;

};


Settings.getLanguage = function () {

    return this.values.appearance.language;

};


/* =====================================================
   ANIMATIONS
===================================================== */

Settings.enableAnimations = function (

    enabled = true

) {

    this.values.appearance.animations =

        enabled;

};


Settings.animationsEnabled = function () {

    return this.values.appearance.animations;

};


/* =====================================================
   HAPTIC FEEDBACK
===================================================== */

Settings.enableHaptics = function (

    enabled = true

) {

    this.values.appearance.hapticFeedback =

        enabled;

};


Settings.hapticsEnabled = function () {

    return this.values.appearance.hapticFeedback;

};


/* =====================================================
   NOTIFICATIONS
===================================================== */

Settings.notificationsEnabled = function () {

    return this.values.notifications.enabled;

};


Settings.enableNotifications = function (

    enabled = true

) {

    this.values.notifications.enabled =

        enabled;

};


Settings.setNotification = function (

    type,

    enabled

) {

    if (

        this.values.notifications.hasOwnProperty(

            type

        )

    ) {

        this.values.notifications[type] =

            enabled;

    }

};


Settings.notificationEnabled = function (

    type

) {

    return !!this.values.notifications[type];

};


/* =====================================================
   BALANCE VISIBILITY
===================================================== */

Settings.hideBalance = function (

    hidden = true

) {

    this.values.wallet.hideBalance =

        hidden;

};


Settings.balanceHidden = function () {

    return this.values.wallet.hideBalance;

};


/* =====================================================
   END OF PHASE 1E.2
===================================================== */

/* =====================================================
   PHASE 1E.3
   REWARD HUB CONFIGURATION
   WITHDRAWAL LIMITS
   ADS
   REWARDS
   TELEGRAM SETTINGS
===================================================== */


/* =====================================================
   SYSTEM CONFIGURATION
===================================================== */

Settings.system = {

    minimumWithdrawal: 1.00,

    referralReward: 0.01,

    dailyBonus: 0.0001,

    spinEnabled: true,

    mysteryBoxEnabled: true,

    watchAdsEnabled: true,

    maintenanceMode: false,

    registrationEnabled: true

};


/* =====================================================
   WITHDRAWALS
===================================================== */

Settings.setMinimumWithdrawal = function (

    amount

) {

    this.system.minimumWithdrawal =

        Number(amount);

};


Settings.getMinimumWithdrawal = function () {

    return this.system.minimumWithdrawal;

};


/* =====================================================
   REFERRAL REWARD
===================================================== */

Settings.setReferralReward = function (

    amount

) {

    this.system.referralReward =

        Number(amount);

};


Settings.getReferralReward = function () {

    return this.system.referralReward;

};


/* =====================================================
   DAILY BONUS
===================================================== */

Settings.setDailyBonus = function (

    amount

) {

    this.system.dailyBonus =

        Number(amount);

};


Settings.getDailyBonus = function () {

    return this.system.dailyBonus;

};


/* =====================================================
   ADS
===================================================== */

Settings.ads = {

    activeNetwork: "monetag",

    rewardPerView: 0.001,

    providers: {

        monetag: {

            enabled: true,

            placementId: ""

        },

        adsterra: {

            enabled: false,

            placementId: ""

        },

        admaven: {

            enabled: false,

            placementId: ""

        },

        aads: {

            enabled: false,

            placementId: ""

        }

    }

};


Settings.enableAdProvider = function (

    provider,

    enabled

) {

    if (

        this.ads.providers[provider]

    ) {

        this.ads.providers[provider].enabled =

            enabled;

    }

};


Settings.setAdPlacement = function (

    provider,

    placementId

) {

    if (

        this.ads.providers[provider]

    ) {

        this.ads.providers[provider].placementId =

            placementId;

    }

};


Settings.getActiveAdProvider = function () {

    return this.ads.activeNetwork;

};


/* =====================================================
   TELEGRAM
===================================================== */

Settings.telegram = {

    useHapticFeedback: true,

    expandOnLaunch: true,

    confirmClosing: true,

    adaptiveTheme: true

};


Settings.enableTelegramHaptics = function (

    enabled

) {

    this.telegram.useHapticFeedback =

        enabled;

};


Settings.enableAdaptiveTheme = function (

    enabled

) {

    this.telegram.adaptiveTheme =

        enabled;

};


/* =====================================================
   MAINTENANCE
===================================================== */

Settings.enableMaintenance = function (

    enabled

) {

    this.system.maintenanceMode =

        enabled;

};


Settings.isMaintenanceMode = function () {

    return this.system.maintenanceMode;

};


/* =====================================================
   REGISTRATION
===================================================== */

Settings.enableRegistration = function (

    enabled

) {

    this.system.registrationEnabled =

        enabled;

};


Settings.registrationEnabled = function () {

    return this.system.registrationEnabled;

};


/* =====================================================
   END OF PHASE 1E.3
===================================================== */

/* =====================================================
   PHASE 1E.4
   ADMIN SETTINGS PANEL
   PERSISTENCE
   SYNCHRONIZATION
===================================================== */


/* =====================================================
   LOAD SETTINGS
===================================================== */

Settings.load = async function () {

    try {

        const local = localStorage.getItem(

            SETTINGS_STORAGE_KEY

        );

        if (local) {

            this.values = {

                ...this.defaults,

                ...JSON.parse(local)

            };

        }

        this.loaded = true;

        this.lastUpdated = Date.now();

        return true;

    }

    catch (error) {

        console.error(

            "Failed to load settings.",

            error

        );

        return false;

    }

};


/* =====================================================
   SAVE SETTINGS
===================================================== */

Settings.save = async function () {

    try {

        localStorage.setItem(

            SETTINGS_STORAGE_KEY,

            JSON.stringify(this.values)

        );

        this.lastUpdated = Date.now();

        return true;

    }

    catch (error) {

        console.error(

            "Failed to save settings.",

            error

        );

        return false;

    }

};


/* =====================================================
   RESET USER SETTINGS
===================================================== */

Settings.resetUserSettings = function () {

    this.values = structuredClone(

        this.defaults

    );

};


/* =====================================================
   ADMIN PANEL
===================================================== */

Settings.admin = {

    editing: false,

    lastEditor: null,

    allowRuntimeEditing: true,

    synchronized: false

};


Settings.enableEditing = function (

    enabled = true

) {

    this.admin.editing = enabled;

};


Settings.isEditing = function () {

    return this.admin.editing;

};


Settings.setEditor = function (

    username

) {

    this.admin.lastEditor = username;

};


Settings.getEditor = function () {

    return this.admin.lastEditor;

};


/* =====================================================
   SERVER SYNCHRONIZATION
===================================================== */

Settings.syncFromServer = async function () {

    try {

        const response = await Api.settings.load();

        if (response) {

            this.values = {

                ...this.values,

                ...response

            };

        }

        this.admin.synchronized = true;

        this.lastUpdated = Date.now();

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

};


Settings.syncToServer = async function () {

    try {

        await Api.settings.update(

            this.values

        );

        this.admin.synchronized = true;

        this.lastUpdated = Date.now();

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

};


/* =====================================================
   AUTO SAVE
===================================================== */

Settings.enableAutoSave = function (

    interval = 30000

) {

    setInterval(

        () => {

            this.save();

        },

        interval

    );

};


/* =====================================================
   INITIALIZATION
===================================================== */

Settings.initialize = async function () {

    if (this.initialized) {

        return;

    }

    await this.load();

    this.enableAutoSave();

    this.initialized = true;

};


/* =====================================================
   END OF PHASE 1E.4
===================================================== */

/* =====================================================
   PHASE 1E.5
   RESET
   VALIDATION
   ERROR HANDLING
   PRODUCTION EXPORT
===================================================== */


/* =====================================================
   RESET SETTINGS
===================================================== */

Settings.reset = function () {

    this.values = structuredClone(

        this.defaults

    );

    this.loaded = false;

    this.lastUpdated = null;

    this.admin = {

        editing: false,

        lastEditor: null,

        allowRuntimeEditing: true,

        synchronized: false

    };

    localStorage.removeItem(

        SETTINGS_STORAGE_KEY

    );

};


/* =====================================================
   VALIDATION
===================================================== */

Settings.validate = function () {

    const errors = [];

    if (

        this.system.minimumWithdrawal < 0

    ) {

        errors.push(

            "Minimum withdrawal cannot be negative."

        );

    }

    if (

        this.system.referralReward < 0

    ) {

        errors.push(

            "Referral reward cannot be negative."

        );

    }

    if (

        this.system.dailyBonus < 0

    ) {

        errors.push(

            "Daily bonus cannot be negative."

        );

    }

    if (

        !["dark", "light"].includes(

            this.values.appearance.theme

        )

    ) {

        errors.push(

            "Invalid theme."

        );

    }

    if (

        !this.values.wallet.currency

    ) {

        errors.push(

            "Wallet currency is required."

        );

    }

    return {

        valid:

            errors.length === 0,

        errors

    };

};


/* =====================================================
   ERROR HANDLER
===================================================== */

Settings.handleError = function (

    error

) {

    console.error(

        "Settings Error:",

        error

    );

    return {

        success: false,

        error

    };

};


/* =====================================================
   STATUS
===================================================== */

Settings.status = function () {

    return {

        initialized:

            this.initialized,

        loaded:

            this.loaded,

        lastUpdated:

            this.lastUpdated,

        synchronized:

            this.admin.synchronized,

        editing:

            this.admin.editing,

        theme:

            this.getTheme(),

        language:

            this.getLanguage(),

        notifications:

            this.notificationsEnabled(),

        maintenance:

            this.isMaintenanceMode()

    };

};


/* =====================================================
   BEFORE UNLOAD
===================================================== */

window.addEventListener(

    "beforeunload",

    () => {

        Settings.save();

    }

);


/* =====================================================
   PRODUCTION EXPORT
===================================================== */



/* =====================================================
   END OF FILE
   frontend/js/settings.js
   CROWN PRINCE REWARD HUB
   PRODUCTION BUILD
===================================================== */


export default Settings;
