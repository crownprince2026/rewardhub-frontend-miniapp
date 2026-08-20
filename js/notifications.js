"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB
   TELEGRAM MINI APP
   NOTIFICATIONS.JS
   PHASE 5B.1
   IMPORTS
   CONSTANTS
   NOTIFICATION STATE
===================================================== */

import API from "./api.js";
import State from "./state.js";
import Settings from "./settings.js";
import UI from "./ui.js";
import Utils from "./utils.js";

/* =====================================================
   CONSTANTS
===================================================== */

const NOTIFICATION_TYPES = {

    INFO: "info",

    SUCCESS: "success",

    WARNING: "warning",

    ERROR: "error",

    REWARD: "reward",

    TASK: "task",

    WITHDRAWAL: "withdrawal",

    SYSTEM: "system",

    REFERRAL: "referral",

    PROMOTION: "promotion"

};

const NOTIFICATION_CHANNELS = {

    IN_APP: "in_app",

    TELEGRAM: "telegram",

    PUSH: "push",

    EMAIL: "email"

};

const NOTIFICATION_STATUS = {

    UNREAD: "unread",

    READ: "read",

    ARCHIVED: "archived"

};

const CACHE_KEY =

    "rewardhub_notifications_cache";

/* =====================================================
   NOTIFICATION STATE
===================================================== */

const Notifications = {

    initialized: false,

    loading: false,

    syncing: false,

    enabled: true,

    unreadCount: 0,

    notifications: [],

    preferences: {

        inApp: true,

        telegram: true,

        push: true,

        email: false,

        sound: true,

        vibration: true

    },

    filters: {

        type: "all",

        status: "all"

    },

    cacheTimestamp: null

};


/* =====================================================
   GETTERS
===================================================== */

Notifications.getNotifications = function () {

    return this.notifications;

};

Notifications.getUnreadCount = function () {

    return this.unreadCount;

};

Notifications.getPreferences = function () {

    return this.preferences;

};


/* =====================================================
   SETTERS
===================================================== */

Notifications.setLoading = function (

    value

) {

    this.loading = value;

};

Notifications.setSyncing = function (

    value

) {

    this.syncing = value;

};


/* =====================================================
   END OF PHASE 5B.1
===================================================== */

/* =====================================================
   PHASE 5B.2
   PUSH NOTIFICATIONS
   TELEGRAM NOTIFICATIONS
===================================================== */


/* =====================================================
   PUSH NOTIFICATIONS
===================================================== */

Notifications.enablePush = async function () {

    try {

        if (!("Notification" in window)) {

            return {

                success: false,

                message: "Push notifications are not supported."

            };

        }

        const permission =

            await Notification.requestPermission();

        if (permission !== "granted") {

            return {

                success: false,

                message: "Permission denied."

            };

        }

        this.preferences.push = true;

        return {

            success: true

        };

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message: error.message

        };

    }

};


Notifications.disablePush = function () {

    this.preferences.push = false;

};


Notifications.showPushNotification = function (

    title,

    options = {}

) {

    try {

        if (

            !this.preferences.push ||

            Notification.permission !== "granted"

        ) {

            return false;

        }

        const notification =

            new Notification(

                title,

                {

                    body:

                        options.body || "",

                    icon:

                        options.icon ||

                        "/assets/icons/icon-192.png",

                    badge:

                        options.badge ||

                        "/assets/icons/badge.png",

                    image:

                        options.image ||

                        undefined,

                    tag:

                        options.tag ||

                        "rewardhub",

                    silent:

                        !this.preferences.sound,

                    data:

                        options.data || {}

                }

            );

        notification.onclick = () => {

            window.focus();

            notification.close();

        };

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

};


/* =====================================================
   TELEGRAM NOTIFICATIONS
===================================================== */

Notifications.sendTelegramNotification = async function (

    payload = {}

) {

    try {

        if (

            !this.preferences.telegram

        ) {

            return {

                success: false,

                message:

                    "Telegram notifications disabled."

            };

        }

        return await API.sendTelegramNotification(

            payload

        );

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message:

                error.message

        };

    }

};


/* =====================================================
   UNIVERSAL NOTIFICATION
===================================================== */

Notifications.notify = async function (

    {

        title,

        message,

        type = NOTIFICATION_TYPES.INFO,

        telegram = false,

        push = true

    }

) {

    UI.toast(

        message,

        type

    );

    if (

        push

    ) {

        this.showPushNotification(

            title,

            {

                body:

                    message

            }

        );

    }

    if (

        telegram

    ) {

        await this.sendTelegramNotification({

            title,

            message,

            type

        });

    }

};


/* =====================================================
   END OF PHASE 5B.2
===================================================== */

/* =====================================================
   PHASE 5B.3
   IN-APP NOTIFICATION CENTER
===================================================== */


/* =====================================================
   LOAD NOTIFICATIONS
===================================================== */

Notifications.load = async function () {

    try {

        this.setLoading(true);

        const response =

            await API.getNotifications();

        if (

            !response.success

        ) {

            return response;

        }

        this.notifications =

            response.notifications || [];

        this.unreadCount =

            this.notifications.filter(

                item =>

                    item.status ===

                    NOTIFICATION_STATUS.UNREAD

            ).length;

        return response;

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message:

                error.message

        };

    }

    finally {

        this.setLoading(false);

    }

};


/* =====================================================
   ADD NOTIFICATION
===================================================== */

Notifications.add = function (

    notification

) {

    const item = {

        id:

            notification.id ||

            Utils.uuid(),

        title:

            notification.title ||

            "",

        message:

            notification.message ||

            "",

        type:

            notification.type ||

            NOTIFICATION_TYPES.INFO,

        status:

            NOTIFICATION_STATUS.UNREAD,

        createdAt:

            notification.createdAt ||

            new Date().toISOString(),

        data:

            notification.data || {}

    };

    this.notifications.unshift(

        item

    );

    this.unreadCount++;

    UI.toast(

        item.message,

        item.type

    );

    return item;

};


/* =====================================================
   MARK AS READ
===================================================== */

Notifications.markAsRead = function (

    id

) {

    const notification =

        this.notifications.find(

            item =>

                item.id === id

        );

    if (

        !notification

    ) {

        return false;

    }

    if (

        notification.status ===

        NOTIFICATION_STATUS.UNREAD

    ) {

        notification.status =

            NOTIFICATION_STATUS.READ;

        this.unreadCount = Math.max(

            0,

            this.unreadCount - 1

        );

    }

    return true;

};


/* =====================================================
   MARK ALL AS READ
===================================================== */

Notifications.markAllAsRead = function () {

    this.notifications.forEach(

        notification => {

            notification.status =

                NOTIFICATION_STATUS.READ;

        }

    );

    this.unreadCount = 0;

};


/* =====================================================
   DELETE NOTIFICATION
===================================================== */

Notifications.remove = function (

    id

) {

    this.notifications =

        this.notifications.filter(

            item =>

                item.id !== id

        );

    this.unreadCount =

        this.notifications.filter(

            item =>

                item.status ===

                NOTIFICATION_STATUS.UNREAD

        ).length;

};


/* =====================================================
   CLEAR ALL
===================================================== */

Notifications.clear = function () {

    this.notifications = [];

    this.unreadCount = 0;

};


/* =====================================================
   FILTERS
===================================================== */

Notifications.filter = function (

    {

        type = "all",

        status = "all"

    } = {}

) {

    return this.notifications.filter(

        notification => {

            if (

                type !== "all" &&

                notification.type !== type

            ) {

                return false;

            }

            if (

                status !== "all" &&

                notification.status !== status

            ) {

                return false;

            }

            return true;

        }

    );

};


/* =====================================================
   FIND
===================================================== */

Notifications.find = function (

    id

) {

    return (

        this.notifications.find(

            item =>

                item.id === id

        ) || null

    );

};


/* =====================================================
   END OF PHASE 5B.3
===================================================== */

/* =====================================================
   PHASE 5B.4
   NOTIFICATION PREFERENCES
   SYNCHRONIZATION
===================================================== */


/* =====================================================
   CACHE
===================================================== */

Notifications.saveCache = function () {

    try {

        const cache = {

            notifications:

                this.notifications,

            unreadCount:

                this.unreadCount,

            preferences:

                this.preferences,

            timestamp:

                Date.now()

        };

        localStorage.setItem(

            CACHE_KEY,

            JSON.stringify(cache)

        );

        this.cacheTimestamp =

            cache.timestamp;

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

};


Notifications.loadCache = function () {

    try {

        const cache =

            localStorage.getItem(

                CACHE_KEY

            );

        if (!cache) {

            return false;

        }

        const data = JSON.parse(

            cache

        );

        this.notifications =

            data.notifications || [];

        this.unreadCount =

            data.unreadCount || 0;

        this.preferences = {

            ...this.preferences,

            ...(data.preferences || {})

        };

        this.cacheTimestamp =

            data.timestamp || null;

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

};


Notifications.clearCache = function () {

    try {

        localStorage.removeItem(

            CACHE_KEY

        );

        this.cacheTimestamp =

            null;

    }

    catch (error) {

        console.error(error);

    }

};


/* =====================================================
   PREFERENCES
===================================================== */

Notifications.updatePreferences = async function (

    preferences = {}

) {

    try {

        this.preferences = {

            ...this.preferences,

            ...preferences

        };

        this.saveCache();

        return await API.updateNotificationPreferences({

            preferences:

                this.preferences

        });

    }

    catch (error) {

        return {

            success: false,

            message:

                error.message

        };

    }

};


Notifications.getPreference = function (

    key

) {

    return this.preferences[key];

};


Notifications.setPreference = function (

    key,

    value

) {

    this.preferences[key] = value;

    this.saveCache();

};


/* =====================================================
   SYNCHRONIZATION
===================================================== */

Notifications.sync = async function () {

    try {

        this.setSyncing(true);

        const response =

            await API.syncNotifications();

        if (!response.success) {

            return response;

        }

        if (

            Array.isArray(

                response.notifications

            )

        ) {

            this.notifications =

                response.notifications;

        }

        if (

            response.preferences

        ) {

            this.preferences = {

                ...this.preferences,

                ...response.preferences

            };

        }

        this.unreadCount =

            this.notifications.filter(

                item =>

                    item.status ===

                    NOTIFICATION_STATUS.UNREAD

            ).length;

        this.saveCache();

        return {

            success: true

        };

    }

    catch (error) {

        return {

            success: false,

            message:

                error.message

        };

    }

    finally {

        this.setSyncing(false);

    }

};


/* =====================================================
   AUTO SYNC
===================================================== */

Notifications.startAutoSync = function (

    interval = 30000

) {

    if (

        this.syncTimer

    ) {

        clearInterval(

            this.syncTimer

        );

    }

    this.syncTimer = setInterval(

        async () => {

            if (

                !this.loading

            ) {

                await this.sync();

            }

        },

        interval

    );

};


Notifications.stopAutoSync = function () {

    if (

        this.syncTimer

    ) {

        clearInterval(

            this.syncTimer

        );

        this.syncTimer = null;

    }

};


/* =====================================================
   END OF PHASE 5B.4
===================================================== */

/* =====================================================
   PHASE 5B.5
   PRODUCTION OPTIMIZATION
   EXPORT
===================================================== */


/* =====================================================
   INITIALIZATION
===================================================== */

Notifications.initialize = async function () {

    if (

        this.initialized

    ) {

        return;

    }

    try {

        this.loadCache();

        await this.sync();

        this.startAutoSync();

        this.initialized = true;

    }

    catch (error) {

        this.handleError(

            error,

            "Initialization"

        );

    }

};


/* =====================================================
   OPTIMIZATION
===================================================== */

Notifications.optimize = function () {

    const maxNotifications = 500;

    if (

        this.notifications.length

        maxNotifications

    ) {

        this.notifications =

            this.notifications.slice(

                0,

                maxNotifications

            );

    }

    this.saveCache();

};


/* =====================================================
   STATUS
===================================================== */

Notifications.status = function () {

    return {

        initialized:

            this.initialized,

        loading:

            this.loading,

        syncing:

            this.syncing,

        enabled:

            this.enabled,

        total:

            this.notifications.length,

        unread:

            this.unreadCount,

        lastSync:

            this.cacheTimestamp

    };

};


/* =====================================================
   ERROR HANDLER
===================================================== */

Notifications.handleError = function (

    error,

    context = "Notifications"

) {

    console.error(

        `[${context}]`,

        error

    );

    return {

        success: false,

        context,

        message:

            error?.message ||

            "Unknown notification error.",

        error

    };

};


/* =====================================================
   SHUTDOWN
===================================================== */

Notifications.shutdown = function () {

    this.stopAutoSync();

    this.optimize();

};


/* =====================================================
   STARTUP EVENTS
===================================================== */

window.addEventListener(

    "DOMContentLoaded",

    async () => {

        try {

            await Notifications.initialize();

        }

        catch (error) {

            Notifications.handleError(

                error,

                "Startup"

            );

        }

    }


window.addEventListener(

    "beforeunload",

    () => {

        Notifications.shutdown();

    }



/* =====================================================
   PRODUCTION LOCK
===================================================== */


    NOTIFICATION_TYPES



    NOTIFICATION_CHANNELS



    NOTIFICATION_STATUS



    Notifications



/* =====================================================
   PRODUCTION EXPORT
===================================================== */

export default Notifications;


/* =====================================================
   END OF FILE
   frontend/js/notifications.js
   CROWN PRINCE REWARD HUB
   PRODUCTION BUILD
===================================================== */
