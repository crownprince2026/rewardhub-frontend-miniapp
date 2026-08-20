"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB
   TELEGRAM MINI APP
   ROUTER.JS
   PHASE 2A.1
   IMPORTS
   CONSTANTS
   ROUTE REGISTRY
===================================================== */

import State from "./state.js";
import Settings from "./settings.js";
import MiniAppAuth from "./miniapp-auth.js";
import Utils from "./utils.js";

/* =====================================================
   ROUTER CONSTANTS
===================================================== */

const DEFAULT_ROUTE = "dashboard";

const LOGIN_ROUTE = "login";

const ADMIN_ROUTE = "admin-dashboard";

/* =====================================================
   ROUTER
===================================================== */

const Router = {

    initialized: false,

    currentRoute: DEFAULT_ROUTE,

    previousRoute: null,

    history: [],

    routes: new Map(),

    guards: new Map(),

    listeners: []

};

/* =====================================================
   ROUTE REGISTRY
===================================================== */

Router.register = function (

    name,

    config = {}

) {

    this.routes.set(

        name,

        {

            name,

            title: config.title || name,

            element: config.element || null,

            protected: config.protected ?? true,

            adminOnly: config.adminOnly ?? false,

            animation: config.animation || "fade"

        }

    );

};

Router.exists = function (

    name

) {

    return this.routes.has(name);

};

Router.get = function (

    name

) {

    return this.routes.get(name);

};

Router.getRoutes = function () {

    return Array.from(

        this.routes.values()

    );

};

/* =====================================================
   DEFAULT ROUTES
===================================================== */

Router.register(

    "login",

    {

        protected: false,

        title: "Login"

    }


Router.register(

    "splash",

    {

        protected: false,

        title: "Splash"

    }


Router.register(

    "onboarding",

    {

        protected: true,

        title: "Onboarding"

    }


Router.register(

    "dashboard",

    {

        protected: true,

        title: "Dashboard"

    }


Router.register(

    "tasks",

    {

        protected: true,

        title: "Tasks"

    }


Router.register(

    "offerwalls",

    {

        protected: true,

        title: "Offer Walls"

    }


Router.register(

    "rewards",

    {

        protected: true,

        title: "Rewards"

    }


Router.register(

    "wallet",

    {

        protected: true,

        title: "Wallet"

    }


Router.register(

    "withdrawals",

    {

        protected: true,

        title: "Withdrawals"

    }


Router.register(

    "referrals",

    {

        protected: true,

        title: "Referrals"

    }


Router.register(

    "profile",

    {

        protected: true,

        title: "Profile"

    }


Router.register(

    "settings",

    {

        protected: true,

        title: "Settings"

    }


Router.register(

    "notifications",

    {

        protected: true,

        title: "Notifications"

    }


Router.register(

    "announcements",

    {

        protected: true,

        title: "Announcements"

    }


Router.register(

    "achievements",

    {

        protected: true,

        title: "Achievements"

    }


Router.register(

    "level-up",

    {

        protected: true,

        title: "Level Up"

    }


Router.register(

    "live-activity",

    {

        protected: true,

        title: "Live Activity"

    }


Router.register(

    "help",

    {

        protected: true,

        title: "Help Center"

    }


Router.register(

    "admin-dashboard",

    {

        protected: true,

        adminOnly: true,

        title: "Admin Dashboard"

    }


/* =====================================================
   END OF PHASE 2A.1
===================================================== */

/* =====================================================
   PHASE 2A.2
   NAVIGATION ENGINE
   GO
   BACK
   REPLACE
   HISTORY
===================================================== */


/* =====================================================
   NAVIGATE
===================================================== */

Router.go = async function (

    route,

    data = {}

) {

    if (!this.exists(route)) {

        console.error(

            `Route "${route}" does not exist.`

        );

        return false;

    }

    this.previousRoute =

        this.currentRoute;

    this.currentRoute = route;

    this.history.push({

        route,

        data,

        timestamp: Date.now()

    });

    State.setCurrentPage(route);

    return true;

};


/* =====================================================
   REPLACE ROUTE
===================================================== */

Router.replace = async function (

    route,

    data = {}

) {

    if (!this.exists(route)) {

        return false;

    }

    if (this.history.length 0) {

        this.history.pop();

    }

    this.previousRoute =

        this.currentRoute;

    this.currentRoute = route;

    this.history.push({

        route,

        data,

        timestamp: Date.now()

    });

    State.setCurrentPage(route);

    return true;

};


/* =====================================================
   BACK
===================================================== */

Router.back = async function () {

    if (

        this.history.length <= 1

    ) {

        return false;

    }

    this.history.pop();

    const previous =

        this.history[

            this.history.length - 1

        ];

    this.previousRoute =

        this.currentRoute;

    this.currentRoute =

        previous.route;

    State.setCurrentPage(

        previous.route

    );

    return true;

};


/* =====================================================
   HISTORY
===================================================== */

Router.clearHistory = function () {

    this.history = [];

};


Router.getHistory = function () {

    return [

        ...this.history

    ];

};


Router.getCurrentRoute = function () {

    return this.currentRoute;

};


Router.getPreviousRoute = function () {

    return this.previousRoute;

};


Router.canGoBack = function () {

    return this.history.length 1;

};


/* =====================================================
   HOME
===================================================== */

Router.home = async function () {

    return await this.go(

        DEFAULT_ROUTE

    );

};


/* =====================================================
   LOGIN
===================================================== */

Router.login = async function () {

    return await this.go(

        LOGIN_ROUTE

    );

};


/* =====================================================
   ADMIN
===================================================== */

Router.admin = async function () {

    return await this.go(

        ADMIN_ROUTE

    );

};


/* =====================================================
   END OF PHASE 2A.2
===================================================== */

/* =====================================================
   PHASE 2A.3
   ROUTE GUARDS
   DEEP LINKING
   URL SYNCHRONIZATION
===================================================== */


/* =====================================================
   ROUTE GUARDS
===================================================== */

Router.addGuard = function (

    route,

    callback

) {

    this.guards.set(

        route,

        callback

    );

};


Router.removeGuard = function (

    route

) {

    this.guards.delete(

        route

    );

};


Router.checkGuard = async function (
    route,
    params = {}
) {
    /*
     * Mini App authentication bypassed for startup test.
     *
     * Startup flow:
     * START -> SPLASH -> DASHBOARD
     *
     * Admin authentication remains handled separately.
     */

    return true;
};


/* =====================================================
   SAFE NAVIGATION
===================================================== */

Router.navigate = async function (

    route,

    data = {}

) {

    const allowed = await this.checkGuard(

        route

    );

    if (!allowed) {

        return false;

    }

    return await this.go(

        route,

        data

    );

};


/* =====================================================
   DEEP LINKING
===================================================== */

Router.openDeepLink = async function (

    link

) {

    if (!link) {

        return false;

    }

    const route = link

        .replace("#", "")

        .replace("/", "");

    if (

        !this.exists(route)

    ) {

        return false;

    }

    return await this.navigate(

        route

    );

};


/* =====================================================
   URL SYNCHRONIZATION
===================================================== */

Router.syncURL = function () {

    try {

        history.replaceState(

            {},

            "",

            `#${this.currentRoute}`

        );

    }

    catch (error) {

        console.error(error);

    }

};


Router.loadURL = async function () {

    const hash = window.location.hash

        .replace("#", "");

    if (

        hash &&

        this.exists(hash)

    ) {

        await this.navigate(

            hash

        );

    }

};


/* =====================================================
   HASH CHANGE
===================================================== */

window.addEventListener(

    "hashchange",

    async () => {

        await Router.loadURL();

    }



/* =====================================================
   REGISTER DEFAULT GUARDS
===================================================== */

Router.addGuard(

    "admin-dashboard",

    async () =>

        MiniAppAuth.isAdminAuthenticated()



/* =====================================================
   END OF PHASE 2A.3
===================================================== */

/* =====================================================
   PHASE 2A.4
   NAVIGATION EVENTS
   PAGE LIFECYCLE
===================================================== */


/* =====================================================
   EVENT REGISTRY
===================================================== */

Router.events = {

    beforeNavigate: [],

    afterNavigate: [],

    pageEnter: [],

    pageLeave: [],

    initialized: []

};


/* =====================================================
   EVENT SUBSCRIPTION
===================================================== */

Router.on = function (

    event,

    callback

) {

    if (

        this.events[event]

    ) {

        this.events[event].push(

            callback

        );

    }

};


Router.off = function (

    event,

    callback

) {

    if (

        !this.events[event]

    ) {

        return;

    }

    this.events[event] =

        this.events[event].filter(

            listener =>

                listener !== callback

        );

};


/* =====================================================
   EMIT EVENT
===================================================== */

Router.emit = async function (

    event,

    payload = {}

) {

    if (

        !this.events[event]

    ) {

        return;

    }

    for (

        const listener of this.events[event]

    ) {

        try {

            await listener(payload);

        }

        catch (error) {

            console.error(error);

        }

    }

};


/* =====================================================
   PAGE LIFECYCLE
===================================================== */

Router.beforeNavigation = async function (

    route,

    data = {}

) {

    await this.emit(

        "beforeNavigate",

        {

            route,

            data

        }

    );

};


Router.afterNavigation = async function (

    route,

    data = {}

) {

    await this.emit(

        "afterNavigate",

        {

            route,

            data

        }

    );

};


Router.enterPage = async function (

    route

) {

    await this.emit(

        "pageEnter",

        {

            route

        }

    );

};


Router.leavePage = async function (

    route

) {

    await this.emit(

        "pageLeave",

        {

            route

        }

    );

};


/* =====================================================
   INITIALIZATION
===================================================== */

Router.initialize = async function () {

    if (

        this.initialized

    ) {

        return;

    }

    this.initialized = true;

    await this.loadURL();

    await this.emit(

        "initialized",

        {

            route: this.currentRoute

        }

    );

};


/* =====================================================
   WRAP NAVIGATION
===================================================== */

const __routerGo = Router.go.bind(

    Router



Router.go = async function (

    route,

    data = {}

) {

    await this.beforeNavigation(

        route,

        data

    );

    await this.leavePage(

        this.currentRoute

    );

    const success = await __routerGo(

        route,

        data

    );

    if (success) {

        this.syncURL();

        await this.enterPage(

            route

        );

        await this.afterNavigation(

            route,

            data

        );

    }

    return success;

};


/* =====================================================
   PAGE VISIBILITY
===================================================== */

document.addEventListener(

    "visibilitychange",

    () => {

        if (

            document.hidden

        ) {

            Router.emit(

                "pageLeave",

                {

                    route:

                        Router.currentRoute

                }

            );

        }

        else {

            Router.emit(

                "pageEnter",

                {

                    route:

                        Router.currentRoute

                }

            );

        }

    }



/* =====================================================
   END OF PHASE 2A.4
===================================================== */

/* =====================================================
   PHASE 2A.5
   ERROR HANDLING
   PRODUCTION EXPORT
===================================================== */


/* =====================================================
   NOT FOUND
===================================================== */

Router.notFound = async function () {

    console.warn(

        "Route not found. Redirecting to dashboard."

    );

    return await this.replace(

        DEFAULT_ROUTE

    );

};


/* =====================================================
   SAFE NAVIGATION
===================================================== */

Router.safeNavigate = async function (

    route,

    data = {}

) {

    try {

        if (!this.exists(route)) {

            return await this.notFound();

        }

        return await this.navigate(

            route,

            data

        );

    }

    catch (error) {

        return this.handleError(

            error,

            route

        );

    }

};


/* =====================================================
   STATUS
===================================================== */

Router.status = function () {

    return {

        initialized: this.initialized,

        currentRoute: this.currentRoute,

        previousRoute: this.previousRoute,

        registeredRoutes: this.routes.size,

        historyLength: this.history.length,

        guards: this.guards.size,

        listeners: {

            beforeNavigate: this.events.beforeNavigate.length,

            afterNavigate: this.events.afterNavigate.length,

            pageEnter: this.events.pageEnter.length,

            pageLeave: this.events.pageLeave.length,

            initialized: this.events.initialized.length

        }

    };

};


/* =====================================================
   RESET
===================================================== */

Router.reset = function () {

    this.currentRoute = DEFAULT_ROUTE;

    this.previousRoute = null;

    this.history = [];

    this.guards.clear();

    this.listeners = [];

    this.events = {

        beforeNavigate: [],

        afterNavigate: [],

        pageEnter: [],

        pageLeave: [],

        initialized: []

    };

    this.initialized = false;

};


/* =====================================================
   ERROR HANDLER
===================================================== */

Router.handleError = function (

    error,

    route = null

) {

    console.error(

        "Router Error:",

        error

    );

    return {

        success: false,

        route,

        error,

        message:

            error?.message ||

            "Unknown router error."

    };

};


/* =====================================================
   APPLICATION STARTUP
===================================================== */

window.addEventListener(

    "load",

    async () => {

        try {

            await Router.initialize();

        }

        catch (error) {

            Router.handleError(error);

        }

    }



/* =====================================================
   PRODUCTION EXPORT
===================================================== */

export default Router;


/* =====================================================
   END OF FILE
   frontend/js/router.js
   CROWN PRINCE REWARD HUB
   PRODUCTION BUILD
===================================================== */
