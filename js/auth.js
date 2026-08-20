"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB
   TELEGRAM MINI APP
   AUTH.JS
   PHASE 1C.1
   IMPORTS
   CONSTANTS
   AUTHENTICATION STATE
===================================================== */

import Api from "./api.js";
import * as State from "./state.js";
import * as Settings from "./settings.js";
import * as Utils from "./utils.js";

/* =====================================================
   TELEGRAM WEBAPP
===================================================== */

const TelegramApp = window.Telegram?.WebApp ?? null;

/* =====================================================
   AUTHENTICATION CONSTANTS
===================================================== */

const SESSION_KEY = "rewardhub_session";

const USER_KEY = "rewardhub_user";

const ADMIN_KEY = "rewardhub_admin";

const SESSION_TIMEOUT = 86400000;


/* =====================================================
   AUTHENTICATION STATE
===================================================== */

const Auth = {

    initialized: false,

    authenticated: false,

    adminAuthenticated: false,

    loading: false,

    telegram: TelegramApp,

    user: null,

    session: null,

    token: null,

    refreshToken: null,

    expiresAt: null,

    permissions: [],

    lastActivity: null,

    loginMethod: "telegram"

};

/* =====================================================
   AUTHENTICATION STATUS
===================================================== */

Auth.isAuthenticated = function () {

    return this.authenticated;

};

Auth.isAdmin = function () {

    return this.adminAuthenticated;

};

Auth.isSessionExpired = function () {

    if (!this.expiresAt) {

        return true;

    }

    return Date.now()= this.expiresAt;

};

Auth.requiresRefresh = function () {

    if (!this.expiresAt) {

        return false;

    }

    return (

        this.expiresAt - Date.now()


};

/* =====================================================
   END OF PHASE 1C.1
===================================================== */

/* =====================================================
   PHASE 1C.2
   TELEGRAM AUTHENTICATION
   LOGIN
===================================================== */


/* =====================================================
   INITIALIZE AUTH MODULE
===================================================== */

Auth.initialize = async function () {

    if (this.initialized) {

        return;

    }

    if (this.telegram) {

        this.telegram.ready();

        this.telegram.expand();

    }

    this.initialized = true;

    console.log("Authentication module initialized.");

};


/* =====================================================
   TELEGRAM LOGIN
===================================================== */

Auth.authenticate = async function () {

    this.loading = true;

    try {

        if (!this.telegram) {

            throw new Error(

                "Telegram WebApp SDK unavailable."

            );

        }

        const initData =

            this.telegram.initData || "";

        const initDataUnsafe =

            this.telegram.initDataUnsafe || {};

        const response = await Api.post(

            "/login",

            {

                init_data: initData,

                init_data_unsafe: initDataUnsafe

            }

        );

        if (!response.success) {

            throw new Error(

                response.message ||

                "Authentication failed."

            );

        }

        this.authenticated = true;

        this.user = response.user;

        this.session = response.session;

        this.token = response.token;

        this.refreshToken =

            response.refresh_token || null;

        this.expiresAt =

            response.expires_at || null;

        this.lastActivity = Date.now();

        Api.setToken(this.token);

        if (this.session?.id) {

            Api.setSession(

                this.session.id

            );

        }

        State.setUser(this.user);

        this.saveSession();

        this.loading = false;

        return true;

    }

    catch (error) {

        console.error(error);

        this.loading = false;

        return false;

    }

};


/* =====================================================
   LOGIN
===================================================== */

Auth.login = async function () {

    return await this.authenticate();

};


/* =====================================================
   CURRENT USER
===================================================== */

Auth.getCurrentUser = function () {

    return this.user;

};


/* =====================================================
   CURRENT SESSION
===================================================== */

Auth.getSession = function () {

    return this.session;

};


/* =====================================================
   UPDATE LAST ACTIVITY
===================================================== */

Auth.touch = function () {

    this.lastActivity = Date.now();

};


/* =====================================================
   END OF PHASE 1C.2
===================================================== */

/* =====================================================
   PHASE 1C.3
   SESSION MANAGEMENT
   AUTO LOGIN
===================================================== */


/* =====================================================
   SAVE SESSION
===================================================== */

Auth.saveSession = function () {

    const sessionData = {

        user: this.user,

        session: this.session,

        token: this.token,

        refreshToken: this.refreshToken,

        expiresAt: this.expiresAt,

        permissions: this.permissions,

        lastActivity: this.lastActivity

    };

    localStorage.setItem(

        SESSION_KEY,

        JSON.stringify(sessionData)

    );

};


/* =====================================================
   RESTORE SESSION
===================================================== */

Auth.restoreSession = async function () {

    try {

        const stored = localStorage.getItem(

            SESSION_KEY

        );

        if (!stored) {

            return false;

        }

        const sessionData = JSON.parse(stored);

        this.user = sessionData.user;

        this.session = sessionData.session;

        this.token = sessionData.token;

        this.refreshToken =

            sessionData.refreshToken;

        this.expiresAt =

            sessionData.expiresAt;

        this.permissions =

            sessionData.permissions || [];

        this.lastActivity =

            sessionData.lastActivity;

        if (this.isSessionExpired()) {

            this.clearSession();

            return false;

        }

        Api.setToken(this.token);

        if (this.session?.id) {

            Api.setSession(

                this.session.id

            );

        }

        State.setUser(this.user);

        this.authenticated = true;

        return true;

    }

    catch (error) {

        console.error(error);

        this.clearSession();

        return false;

    }

};


/* =====================================================
   CLEAR SESSION
===================================================== */

Auth.clearSession = function () {

    this.authenticated = false;

    this.user = null;

    this.session = null;

    this.token = null;

    this.refreshToken = null;

    this.expiresAt = null;

    this.permissions = [];

    this.lastActivity = null;

    Api.clearToken();

    Api.clearSession();

    localStorage.removeItem(

        SESSION_KEY

    );

};


/* =====================================================
   AUTO LOGIN
===================================================== */

Auth.autoLogin = async function () {

    const restored =

        await this.restoreSession();

    if (restored) {

        return true;

    }

    return await this.login();

};


/* =====================================================
   SESSION VALIDATION
===================================================== */

Auth.validateSession = function () {

    if (!this.authenticated) {

        return false;

    }

    if (this.isSessionExpired()) {

        this.clearSession();

        return false;

    }

    return true;

};


/* =====================================================
===================================================== */

Auth.refresh = async function () {

    if (!this.requiresRefresh()) {

        return true;

    }

    try {

        const response = await Api.post(

            "/session/refresh",

            {

                refresh_token:

                    this.refreshToken

            }

        );

        this.token = response.token;

        this.refreshToken =

            response.refresh_token;

        this.expiresAt =

            response.expires_at;

        Api.setToken(this.token);

        this.saveSession();

        return true;

    }

    catch (error) {

        console.error(error);

        this.clearSession();

        return false;

    }

};


/* =====================================================
   END OF PHASE 1C.3
===================================================== */

/* =====================================================
   PHASE 1C.4
   ADMIN AUTHENTICATION
   PERMISSION SYSTEM
===================================================== */


/* =====================================================
   ADMIN LOGIN
===================================================== */

Auth.authenticateAdmin = async function () {

    try {

        const response = await Api.post(

            "/admin/login",

            {

                token: this.token

            }

        );

        if (!response.success) {

            return false;

        }

        this.adminAuthenticated = true;

        this.permissions =

            response.permissions || [];

        this.saveSession();

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

};


/* =====================================================
   ADMIN LOGOUT
===================================================== */

Auth.logoutAdmin = function () {

    this.adminAuthenticated = false;

    this.permissions = [];

    this.saveSession();

};


/* =====================================================
   PERMISSION CHECK
===================================================== */

Auth.hasPermission = function (

    permission

) {

    if (!this.adminAuthenticated) {

        return false;

    }

    return this.permissions.includes(

        permission

    );

};


/* =====================================================
   MULTIPLE PERMISSIONS
===================================================== */

Auth.hasAnyPermission = function (

    permissions = []

) {

    if (!this.adminAuthenticated) {

        return false;

    }

    return permissions.some(

        permission =>

            this.permissions.includes(

                permission

            )

    );

};


Auth.hasAllPermissions = function (

    permissions = []

) {

    if (!this.adminAuthenticated) {

        return false;

    }

    return permissions.every(

        permission =>

            this.permissions.includes(

                permission

            )

    );

};


/* =====================================================
   ADMIN STATUS
===================================================== */

Auth.isAdminAuthenticated = function () {

    return this.adminAuthenticated;

};


Auth.getPermissions = function () {

    return [

        ...this.permissions

    ];

};


/* =====================================================
   ROLE CHECKS
===================================================== */

Auth.isSuperAdmin = function () {

    return this.hasPermission(

        "super_admin"

    );

};


Auth.isModerator = function () {

    return this.hasPermission(

        "moderator"

    );

};


Auth.isSupport = function () {

    return this.hasPermission(

        "support"

    );

};


/* =====================================================
   ADMIN ACCESS GUARD
===================================================== */

Auth.requireAdmin = function (

    permission = null

) {

    if (

        !this.adminAuthenticated

    ) {

        throw new Error(

            "Administrator authentication required."

        );

    }

    if (

        permission &&

        !this.hasPermission(permission)

    ) {

        throw new Error(

            "Permission denied."

        );

    }

    return true;

};


/* =====================================================
   END OF PHASE 1C.4
===================================================== */

/* =====================================================
   PHASE 1C.5
   LOGOUT
   ERROR HANDLING
   PRODUCTION EXPORT
===================================================== */


/* =====================================================
   LOGOUT
===================================================== */

Auth.logout = async function () {

    try {

        if (this.token) {

            await Api.post(

                "/logout",

                {

                    session: this.session?.id

                }

            );

        }

    }

    catch (error) {

        console.error(

            "Logout request failed.",

            error

        );

    }

    finally {

        this.clearSession();

    }

};


/* =====================================================
   AUTH STATUS
===================================================== */

Auth.status = function () {

    return {

        initialized: this.initialized,

        authenticated: this.authenticated,

        adminAuthenticated: this.adminAuthenticated,

        sessionValid: this.validateSession(),

        tokenAvailable: !!this.token,

        refreshRequired: this.requiresRefresh(),

        expiresAt: this.expiresAt,

        lastActivity: this.lastActivity,

        permissions: [

            ...this.permissions

        ]

    };

};


/* =====================================================
   ERROR HANDLER
===================================================== */

Auth.handleError = function (

    error

) {

    console.error(

        "Authentication Error:",

        error

    );

    if (

        error?.status === 401

    ) {

        this.clearSession();

    }

    if (

        error?.status === 403

    ) {

        console.warn(

            "Permission denied."

        );

    }

    return {

        success: false,

        error

    };

};


/* =====================================================
   RESET
===================================================== */

Auth.reset = function () {

    this.initialized = false;

    this.authenticated = false;

    this.adminAuthenticated = false;

    this.loading = false;

    this.user = null;

    this.session = null;

    this.token = null;

    this.refreshToken = null;

    this.expiresAt = null;

    this.permissions = [];

    this.lastActivity = null;

    Api.clearToken();

    Api.clearSession();

    localStorage.removeItem(

        SESSION_KEY

    );

};


/* =====================================================
   PRODUCTION EXPORT
===================================================== */

export default Auth;


/* =====================================================
   END OF FILE
   frontend/js/auth.js
   CROWN PRINCE REWARD HUB
   PRODUCTION BUILD
===================================================== */
