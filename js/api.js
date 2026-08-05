"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB
   TELEGRAM MINI APP
   API.JS
   PHASE 1B.1
   IMPORTS
   CONSTANTS
   API CONFIGURATION
===================================================== */


/* =====================================================
   API CONFIGURATION
===================================================== */

const API_VERSION = "v1";

const API_BASE_URL = "https://http--rewardhub-production-bot--7yrkypbyrrz6.code.run/api/v1";

const API_TIMEOUT = 30000;

const API_RETRY_COUNT = 3;

const API_RETRY_DELAY = 1500;

const DEFAULT_HEADERS = {

    "Content-Type": "application/json",

    "Accept": "application/json"

};

/* =====================================================
   API STATE
===================================================== */

const Api = {

    initialized: false,

    online: navigator.onLine,

    baseUrl: API_BASE_URL,

    version: API_VERSION,

    timeout: API_TIMEOUT,

    retryCount: API_RETRY_COUNT,

    retryDelay: API_RETRY_DELAY,

    token: null,

    sessionId: null,

    headers: {

        ...DEFAULT_HEADERS

    },

    requestQueue: [],

    pendingRequests: 0,

    cache: new Map(),

    statistics: {

        totalRequests: 0,

        successfulRequests: 0,

        failedRequests: 0

    }

};

/* =====================================================
   API ENDPOINTS
===================================================== */

const ENDPOINTS = {

    STATUS: "/",

    HEALTH: "/health",

    PROFILE: "/profile",

    LOGIN: "/login",

    LOGOUT: "/logout",

    SESSION: "/session",

    USERS: "/users",

    TASKS: "/tasks",

    REWARDS: "/rewards",

    WALLET: "/wallet",

    WITHDRAWALS: "/withdrawals",

    REFERRALS: "/referrals",

    SETTINGS: "/settings",

    NOTIFICATIONS: "/notifications",

    ANNOUNCEMENTS: "/announcements",

    ADMIN: "/admin"

};

/* =====================================================
   BUILD ENDPOINT URL
===================================================== */

function endpoint(path) {

    return `${Api.baseUrl}${path}`;

}

/* =====================================================
   END OF PHASE 1B.1
===================================================== */

/* =====================================================
   PHASE 1B.2
   HTTP CLIENT
   GET
   POST
   PUT
   DELETE
===================================================== */


/* =====================================================
   REQUEST
===================================================== */

async function request(

    method,

    path,

    data = null,

    options = {}

) {

    Api.statistics.totalRequests++;

    Api.pendingRequests++;

    try {

        const config = {

            method,

            headers: {

                ...Api.headers,

                ...(options.headers || {})

            },

            signal: AbortSignal.timeout(

                Api.timeout

            )

        };

        if (data !== null) {

            config.body = JSON.stringify(data);

        }

const response = await fetch(
    endpoint(path),
    config
);

console.log("API:", method, endpoint(path));

const text = await response.text();

console.log("Raw response:", text);

const json = text ? JSON.parse(text) : {};

        Api.pendingRequests--;

if (!response.ok) {

    Api.statistics.failedRequests++;

    console.error(
        "HTTP ERROR:",
        response.status,
        json
    );

    throw {
        status: response.status,
        data: json
    };

}

        Api.statistics.successfulRequests++;

        return json;

    }

    catch (error) {

        Api.pendingRequests--;

        throw error;

    }

}


/* =====================================================
   GET
===================================================== */

async function get(

    path,

    params = {}

) {

    const query = new URLSearchParams(

        params

    ).toString();

    const url = query

        ? `${path}?${query}`

        : path;

    return request(

        "GET",

        url

    );

}


/* =====================================================
   POST
===================================================== */

async function post(

    path,

    body = {}

) {

    return request(

        "POST",

        path,

        body

    );

}


/* =====================================================
   PUT
===================================================== */

async function put(

    path,

    body = {}

) {

    return request(

        "PUT",

        path,

        body

    );

}


/* =====================================================
   DELETE
===================================================== */

async function del(

    path,

    body = null

) {

    return request(

        "DELETE",

        path,

        body

    );

}


/* =====================================================
   PUBLIC API
===================================================== */

Api.get = get;

Api.post = post;

Api.put = put;

Api.delete = del;


/* =====================================================
   END OF PHASE 1B.2
===================================================== */

/* =====================================================
   PHASE 1B.3
   AUTHENTICATION HEADERS
   RETRIES
   REQUEST QUEUE
===================================================== */


/* =====================================================
   AUTHENTICATION
===================================================== */

Api.setToken = function (token) {

    Api.token = token;

    Api.headers.Authorization = `Bearer ${token}`;

};


Api.clearToken = function () {

    Api.token = null;

    delete Api.headers.Authorization;

};


Api.setSession = function (sessionId) {

    Api.sessionId = sessionId;

    Api.headers["X-Session-ID"] = sessionId;

};


Api.clearSession = function () {

    Api.sessionId = null;

    delete Api.headers["X-Session-ID"];

};


/* =====================================================
   RETRY DELAY
===================================================== */

function wait(milliseconds) {

    return new Promise(

        resolve => setTimeout(

            resolve,

            milliseconds

        )

    );

}


/* =====================================================
   REQUEST WITH RETRIES
===================================================== */

async function requestWithRetry(

    method,

    path,

    body = null,

    options = {}

) {

    let lastError = null;

    for (

        let attempt = 1;

        attempt <= Api.retryCount;

        attempt++

    ) {

        try {

            return await request(

                method,

                path,

                body,

                options

            );

        }

        catch (error) {

            lastError = error;

            if (

                attempt < Api.retryCount

            ) {

                console.warn(

                    `Retry ${attempt}/${Api.retryCount}`

                );

                await wait(

                    Api.retryDelay

                );

            }

        }

    }

    throw lastError;

}


/* =====================================================
   REQUEST QUEUE
===================================================== */

Api.enqueue = function (

    callback

) {

    Api.requestQueue.push(

        callback

    );

};


Api.clearQueue = function () {

    Api.requestQueue = [];

};


Api.processQueue = async function () {

    while (

        Api.requestQueue.length > 0

    ) {

        const task =

            Api.requestQueue.shift();

        try {

            await task();

        }

        catch (error) {

            console.error(

                "Queued request failed.",

                error

            );

        }

    }

};


/* =====================================================
   ONLINE / OFFLINE
===================================================== */

window.addEventListener(

    "online",

    async () => {

        Api.online = true;

        await Api.processQueue();

    }

);


window.addEventListener(

    "offline",

    () => {

        Api.online = false;

    }

);


/* =====================================================
   REPLACE REQUEST METHODS
===================================================== */

Api.get = (

    path,

    params = {}

) => {

    const query = new URLSearchParams(

        params

    ).toString();

    return requestWithRetry(

        "GET",

        query

            ? `${path}?${query}`

            : path

    );

};


Api.post = (

    path,

    body = {}

) => requestWithRetry(

    "POST",

    path,

    body

);


Api.put = (

    path,

    body = {}

) => requestWithRetry(

    "PUT",

    path,

    body

);


Api.delete = (

    path,

    body = null

) => requestWithRetry(

    "DELETE",

    path,

    body

);


/* =====================================================
   END OF PHASE 1B.3
===================================================== */

/* =====================================================
   PHASE 1B.4
   REWARD HUB API METHODS
===================================================== */


/* =====================================================
   USERS
===================================================== */

Api.profile = (userId) =>
    Api.get(
        ENDPOINTS.PROFILE,
        { user_id: userId }
    );

Api.user = {

    get(userId) {

        return Api.get(

            `${ENDPOINTS.USERS}/${userId}`

        );

    },

    search(query) {

        return Api.get(

            ENDPOINTS.USERS,

            { search: query }

        );

    },

    update(userId, data) {

        return Api.put(

            `${ENDPOINTS.USERS}/${userId}`,

            data

        );

    },

    ban(userId) {

        return Api.post(

            `${ENDPOINTS.USERS}/${userId}/ban`

        );

    },

    unban(userId) {

        return Api.post(

            `${ENDPOINTS.USERS}/${userId}/unban`

        );

    }

};


/* =====================================================
   WALLET
===================================================== */

Api.wallet = {

    balance() {

        return Api.get(

            ENDPOINTS.WALLET

        );

    },

    history() {

        return Api.get(

            `${ENDPOINTS.WALLET}/history`

        );

    },

    withdraw(data) {

        return Api.post(

            ENDPOINTS.WITHDRAWALS,

            data

        );

    },

    withdrawals() {

        return Api.get(

            ENDPOINTS.WITHDRAWALS

        );

    }

};


/* =====================================================
   TASKS
===================================================== */

Api.tasks = {

    list() {

        return Api.get(

            ENDPOINTS.TASKS

        );

    },

    details(taskId) {

        return Api.get(

            `${ENDPOINTS.TASKS}/${taskId}`

        );

    },

    complete(taskId, proof) {

        return Api.post(

            `${ENDPOINTS.TASKS}/${taskId}/complete`,

            proof

        );

    },

    history() {

        return Api.get(

            `${ENDPOINTS.TASKS}/history`

        );

    }

};


/* =====================================================
   REWARDS
===================================================== */

Api.rewards = {

    dailyBonus() {

        return Api.post(

            `${ENDPOINTS.REWARDS}/daily`

        );

    },

    spin() {

        return Api.post(

            `${ENDPOINTS.REWARDS}/spin`

        );

    },

    mysteryBox() {

        return Api.post(

            `${ENDPOINTS.REWARDS}/mystery`

        );

    },

    history() {

        return Api.get(

            `${ENDPOINTS.REWARDS}/history`

        );

    }

};


/* =====================================================
   SETTINGS
===================================================== */

Api.settings = {

    load() {

        return Api.get(

            ENDPOINTS.SETTINGS

        );

    },

    update(data) {

        return Api.put(

            ENDPOINTS.SETTINGS,

            data

        );

    }

};


/* =====================================================
   ADMIN
===================================================== */

Api.admin = {

    dashboard() {

        return Api.get(

            `${ENDPOINTS.ADMIN}/dashboard`

        );

    },

    statistics() {

        return Api.get(

            `${ENDPOINTS.ADMIN}/statistics`

        );

    },

    system() {

        return Api.get(

            `${ENDPOINTS.ADMIN}/system`

        );

    },

    maintenance(enabled) {

        return Api.post(

            `${ENDPOINTS.ADMIN}/maintenance`,

            {

                enabled

            }

        );

    }

};


/* =====================================================
   NOTIFICATIONS
===================================================== */

Api.notifications = {

    list() {

        return Api.get(

            ENDPOINTS.NOTIFICATIONS

        );

    },

    read(notificationId) {

        return Api.post(

            `${ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`

        );

    },

    announcements() {

        return Api.get(

            ENDPOINTS.ANNOUNCEMENTS

        );

    }

};


/* =====================================================
   END OF PHASE 1B.4
===================================================== */

/* =====================================================
   PHASE 1B.5
   ERROR HANDLING
   CACHE HELPERS
   PRODUCTION EXPORT
===================================================== */


/* =====================================================
   ERROR HANDLER
===================================================== */

Api.handleError = function (error) {

    console.error("API Error:", error);

    if (error?.status === 401) {

        console.warn("Authentication required.");

    }

    else if (error?.status === 403) {

        console.warn("Access denied.");

    }

    else if (error?.status === 404) {

        console.warn("Resource not found.");

    }

    else if (error?.status >= 500) {

        console.warn("Server error.");

    }

    return {

        success: false,

        error

    };

};


/* =====================================================
   CACHE HELPERS
===================================================== */

Api.cacheSet = function (

    key,

    value

) {

    Api.cache.set(

        key,

        {

            value,

            timestamp: Date.now()

        }

    );

};


Api.cacheGet = function (

    key

) {

    const item =

        Api.cache.get(key);

    if (!item) {

        return null;

    }

    return item.value;

};


Api.cacheHas = function (

    key

) {

    return Api.cache.has(key);

};


Api.cacheDelete = function (

    key

) {

    Api.cache.delete(key);

};


Api.cacheClear = function () {

    Api.cache.clear();

};


/* =====================================================
   INITIALIZE API
===================================================== */

Api.initialize = async function (

    app = null

) {

    if (Api.initialized) {

        return;

    }

    if (

        app?.session?.token

    ) {

        Api.setToken(

            app.session.token

        );

    }

    if (

        app?.session?.id

    ) {

        Api.setSession(

            app.session.id

        );

    }

    Api.initialized = true;

    console.log(

        "Reward Hub API initialized."

    );

};


/* =====================================================
   API STATUS
===================================================== */

Api.status = function () {

    return {

        initialized:

            Api.initialized,

        online:

            Api.online,

        version:

            Api.version,

        pendingRequests:

            Api.pendingRequests,

        totalRequests:

            Api.statistics.totalRequests,

        successfulRequests:

            Api.statistics.successfulRequests,

        failedRequests:

            Api.statistics.failedRequests,

        cacheItems:

            Api.cache.size

    };

};


/* =====================================================
   RESET API
===================================================== */

Api.reset = function () {

    Api.clearToken();

    Api.clearSession();

    Api.cacheClear();

    Api.requestQueue = [];

    Api.pendingRequests = 0;

    Api.statistics = {

        totalRequests: 0,

        successfulRequests: 0,

        failedRequests: 0

    };

};


/* =====================================================
   END OF FILE
   frontend/js/api.js
   CROWN PRINCE REWARD HUB
   PRODUCTION BUILD
===================================================== */

/* =====================================================
   PHASE 1B.4
   TELEGRAM AUTHENTICATION
===================================================== */

/* =====================================================
   LOGIN
===================================================== */

Api.login = async function () {

    if (!window.Telegram || !window.Telegram.WebApp) {

        throw new Error(
            "Telegram WebApp SDK unavailable."
        );

    }

    const initData = window.Telegram.WebApp.initData;

    if (!initData) {

        throw new Error(
            "Telegram initData is missing."
        );

    }

    const response = await post(
        ENDPOINTS.LOGIN,
        {
            initData: initData
        }
    );

    if (!response.success) {

        throw new Error(
            response.message || "Login failed."
        );

    }

    Api.setToken(response.session);

    return response.user;

};


/* =====================================================
   VERIFY SESSION
===================================================== */

Api.verifySession = async function () {

    return get(
        ENDPOINTS.SESSION
    );

};


/* =====================================================
   LOGOUT
===================================================== */

Api.logout = async function () {

    const response = await post(
        ENDPOINTS.LOGOUT,
        {}
    );

    Api.clearToken();

    Api.clearSession();

    return response;

};


/* =====================================================
   DASHBOARD
===================================================== */

Api.dashboard = async function (userId) {

    return get(
        "/dashboard",
        {
            user_id: userId
        }
    );

};

/* =====================================================
   PROFILE
===================================================== */

Api.profile = async function (userId) {

    return get(
        ENDPOINTS.PROFILE,
        {
            user_id: userId
        }
    );

};

/* =====================================================
   EXPORTS
===================================================== */

export { Api, ENDPOINTS };

export default Api;

/* =====================================================
   END OF FILE
===================================================== */
