"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB
   TELEGRAM MINI APP
   UTILS.JS
   PHASE 1F.1
   IMPORTS
   CONSTANTS
   HELPER FOUNDATION
===================================================== */

/* =====================================================
   CONSTANTS
===================================================== */

const APP_NAME = "Crown Prince Reward Hub";

const APP_VERSION = "1.0.0";

const DEFAULT_LOCALE = "en-US";

const DEFAULT_CURRENCY = "USD";

const DATE_FORMAT_OPTIONS = {

    year: "numeric",

    month: "short",

    day: "numeric",

    hour: "2-digit",

    minute: "2-digit"

};

/* =====================================================
   UTILS OBJECT
===================================================== */

const Utils = {

    version: APP_VERSION,

    locale: DEFAULT_LOCALE,

    currency: DEFAULT_CURRENCY,

    initialized: false

};

/* =====================================================
   INITIALIZATION
===================================================== */

Utils.initialize = function () {

    if (this.initialized) {

        return;

    }

    this.initialized = true;

    console.log(

        `${APP_NAME} Utilities ${APP_VERSION} initialized.`

    );

};

/* =====================================================
   TYPE HELPERS
===================================================== */

Utils.isNull = value =>

    value === null;


Utils.isUndefined = value =>

    value === undefined;


Utils.isString = value =>

    typeof value === "string";


Utils.isNumber = value =>

    typeof value === "number" &&

    !Number.isNaN(value);


Utils.isBoolean = value =>

    typeof value === "boolean";


Utils.isArray = value =>

    Array.isArray(value);


Utils.isObject = value =>

    value !== null &&

    typeof value === "object" &&

    !Array.isArray(value);


/* =====================================================
   EMPTY CHECKS
===================================================== */

Utils.isEmpty = function (value) {

    if (

        value === null ||

        value === undefined

    ) {

        return true;

    }

    if (

        typeof value === "string"

    ) {

        return value.trim() === "";

    }

    if (

        Array.isArray(value)

    ) {

        return value.length === 0;

    }

    if (

        this.isObject(value)

    ) {

        return Object.keys(value).length === 0;

    }

    return false;

};


/* =====================================================
   CLONE
===================================================== */

Utils.clone = function (value) {

    return structuredClone(value);

};


/* =====================================================
   END OF PHASE 1F.1
===================================================== */

/* =====================================================
   PHASE 1F.2
   FORMATTING UTILITIES
   CURRENCY
   DATES
   NUMBERS
   STRINGS
===================================================== */


/* =====================================================
   CURRENCY
===================================================== */

Utils.formatCurrency = function (

    amount,

    currency = this.currency,

    locale = this.locale

) {

    return new Intl.NumberFormat(

        locale,

        {

            style: "currency",

            currency

        }

    ).format(amount);

};


/* =====================================================
   NUMBERS
===================================================== */

Utils.formatNumber = function (

    number,

    decimals = 2,

    locale = this.locale

) {

    return Number(number).toLocaleString(

        locale,

        {

            minimumFractionDigits: decimals,

            maximumFractionDigits: decimals

        }

    );

};


Utils.formatInteger = function (

    number,

    locale = this.locale

) {

    return Number(number).toLocaleString(

        locale

    );

};


Utils.formatPercentage = function (

    value,

    decimals = 2

) {

    return `${Number(value).toFixed(decimals)}%`;

};


/* =====================================================
   DATES
===================================================== */

Utils.formatDate = function (

    date

) {

    return new Date(date).toLocaleDateString(

        this.locale,

        DATE_FORMAT_OPTIONS

    );

};


Utils.formatTime = function (

    date

) {

    return new Date(date).toLocaleTimeString(

        this.locale

    );

};


Utils.formatDateTime = function (

    date

) {

    return new Date(date).toLocaleString(

        this.locale,

        DATE_FORMAT_OPTIONS

    );

};


Utils.timeAgo = function (

    date

) {

    const seconds = Math.floor(

        (Date.now() - new Date(date)) / 1000

    );

    if (seconds < 60) {

        return "Just now";

    }

    if (seconds < 3600) {

        return `${Math.floor(seconds / 60)} min ago`;

    }

    if (seconds < 86400) {

        return `${Math.floor(seconds / 3600)} hrs ago`;

    }

    return `${Math.floor(seconds / 86400)} days ago`;

};


/* =====================================================
   STRINGS
===================================================== */

Utils.capitalize = function (

    text

) {

    if (!text) return "";

    return text.charAt(0).toUpperCase() +

        text.slice(1);

};


Utils.titleCase = function (

    text

) {

    return text

        .toLowerCase()

        .split(" ")

        .map(

            word =>

                this.capitalize(word)

        )

        .join(" ");

};


Utils.truncate = function (

    text,

    length = 50

) {

    if (

        text.length <= length

    ) {

        return text;

    }

    return text.substring(

        0,

        length

    ) + "...";

};


Utils.maskWallet = function (

    wallet

) {

    if (

        !wallet ||

        wallet.length < 10

    ) {

        return wallet;

    }

    return (

        wallet.substring(0, 6) +

        "..." +

        wallet.substring(wallet.length - 4)

    );

};


Utils.maskUsername = function (

    username

) {

    if (

        !username ||

        username.length < 4

    ) {

        return username;

    }

    return (

        username.substring(0, 2) +

        "***" +

        username.substring(

            username.length - 2

        )

    );

};


/* =====================================================
   END OF PHASE 1F.2
===================================================== */

/* =====================================================
   PHASE 1F.3
   VALIDATION UTILITIES
   EMAIL
   WALLET
   USERNAME
   URLS
   TELEGRAM
===================================================== */


/* =====================================================
   EMAIL
===================================================== */

Utils.isValidEmail = function (

    email

) {

    const pattern =

        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(email);

};


/* =====================================================
   WALLET
===================================================== */

Utils.isValidWallet = function (

    wallet

) {

    if (!wallet) {

        return false;

    }

    return /^0x[a-fA-F0-9]{40}$/.test(

        wallet.trim()

    );

};


/* =====================================================
   USERNAME
===================================================== */

Utils.isValidUsername = function (

    username

) {

    if (!username) {

        return false;

    }

    return /^[a-zA-Z0-9_]{3,32}$/.test(

        username

    );

};


/* =====================================================
   PASSWORD
===================================================== */

Utils.isStrongPassword = function (

    password

) {

    if (!password) {

        return false;

    }

    return password.length >= 8;

};


/* =====================================================
   URL
===================================================== */

Utils.isValidURL = function (

    url

) {

    try {

        new URL(url);

        return true;

    }

    catch {

        return false;

    }

};


/* =====================================================
   TELEGRAM USER ID
===================================================== */

Utils.isValidTelegramId = function (

    id

) {

    return /^\d+$/.test(

        String(id)

    );

};


/* =====================================================
   TELEGRAM USERNAME
===================================================== */

Utils.isValidTelegramUsername = function (

    username

) {

    if (!username) {

        return false;

    }

    return /^@?[a-zA-Z0-9_]{5,32}$/.test(

        username

    );

};


/* =====================================================
   NUMERIC
===================================================== */

Utils.isNumeric = function (

    value

) {

    return !isNaN(value) &&

        value !== "";

};


/* =====================================================
   POSITIVE NUMBER
===================================================== */

Utils.isPositiveNumber = function (

    value

) {

    return this.isNumeric(value) &&

        Number(value) > 0;

};


/* =====================================================
   REQUIRED VALUE
===================================================== */

Utils.isRequired = function (

    value

) {

    return !this.isEmpty(value);

};


/* =====================================================
   VALID JSON
===================================================== */

Utils.isJSON = function (

    value

) {

    try {

        JSON.parse(value);

        return true;

    }

    catch {

        return false;

    }

};


/* =====================================================
   END OF PHASE 1F.3
===================================================== */

/* =====================================================
   PHASE 1F.4
   GENERAL HELPERS
   DEBOUNCE
   THROTTLE
   UUID
   CLIPBOARD
   DOWNLOAD
   RANDOM
   STORAGE
===================================================== */


/* =====================================================
   DEBOUNCE
===================================================== */

Utils.debounce = function (

    callback,

    delay = 300

) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(

            () => callback(...args),

            delay

        );

    };

};


/* =====================================================
   THROTTLE
===================================================== */

Utils.throttle = function (

    callback,

    limit = 300

) {

    let waiting = false;

    return (...args) => {

        if (waiting) {

            return;

        }

        callback(...args);

        waiting = true;

        setTimeout(

            () => {

                waiting = false;

            },

            limit

        );

    };

};


/* =====================================================
   UUID
===================================================== */

Utils.uuid = function () {

    if (

        window.crypto?.randomUUID

    ) {

        return window.crypto.randomUUID();

    }

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"

        .replace(/[xy]/g, c => {

            const r =

                Math.random() * 16 | 0;

            const v =

                c === "x"

                    ? r

                    : (r & 0x3 | 0x8);

            return v.toString(16);

        });

};


/* =====================================================
   RANDOM HELPERS
===================================================== */

Utils.randomInt = function (

    min,

    max

) {

    return Math.floor(

        Math.random() *

        (max - min + 1)

    ) + min;

};


Utils.randomFloat = function (

    min,

    max,

    decimals = 2

) {

    return Number(

        (

            Math.random() *

            (max - min) +

            min

        ).toFixed(decimals)

    );

};


Utils.randomChoice = function (

    array

) {

    return array[

        this.randomInt(

            0,

            array.length - 1

        )

    ];

};


/* =====================================================
   CLIPBOARD
===================================================== */

Utils.copyToClipboard = async function (

    text

) {

    try {

        await navigator.clipboard.writeText(

            text

        );

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

};


/* =====================================================
   DOWNLOAD
===================================================== */

Utils.download = function (

    filename,

    content,

    type = "text/plain"

) {

    const blob = new Blob(

        [content],

        { type }

    );

    const url = URL.createObjectURL(

        blob

    );

    const link = document.createElement(

        "a"

    );

    link.href = url;

    link.download = filename;

    link.click();

    URL.revokeObjectURL(url);

};


/* =====================================================
   LOCAL STORAGE
===================================================== */

Utils.storage = {

    set(key, value) {

        localStorage.setItem(

            key,

            JSON.stringify(value)

        );

    },

    get(key, fallback = null) {

        try {

            const value =

                localStorage.getItem(key);

            return value

                ? JSON.parse(value)

                : fallback;

        }

        catch {

            return fallback;

        }

    },

    remove(key) {

        localStorage.removeItem(key);

    },

    clear() {

        localStorage.clear();

    }

};


/* =====================================================
   SESSION STORAGE
===================================================== */

Utils.session = {

    set(key, value) {

        sessionStorage.setItem(

            key,

            JSON.stringify(value)

        );

    },

    get(key, fallback = null) {

        try {

            const value =

                sessionStorage.getItem(key);

            return value

                ? JSON.parse(value)

                : fallback;

        }

        catch {

            return fallback;

        }

    },

    remove(key) {

        sessionStorage.removeItem(key);

    },

    clear() {

        sessionStorage.clear();

    }

};


/* =====================================================
   END OF PHASE 1F.4
===================================================== */

/* =====================================================
   PHASE 1F.5
   ERROR HANDLING
   PRODUCTION EXPORT
===================================================== */


/* =====================================================
   SAFE EXECUTION
===================================================== */

Utils.safe = async function (

    callback,

    fallback = null

) {

    try {

        return await callback();

    }

    catch (error) {

        console.error(error);

        return fallback;

    }

};


/* =====================================================
   ASSERT
===================================================== */

Utils.assert = function (

    condition,

    message = "Assertion failed."

) {

    if (!condition) {

        throw new Error(message);

    }

};


/* =====================================================
   LOGGING
===================================================== */

Utils.log = function (

    ...args

) {

    console.log(

        "[RewardHub]",

        ...args

    );

};


Utils.warn = function (

    ...args

) {

    console.warn(

        "[RewardHub]",

        ...args

    );

};


Utils.error = function (

    ...args

) {

    console.error(

        "[RewardHub]",

        ...args

    );

};


/* =====================================================
   ERROR HANDLER
===================================================== */

Utils.handleError = function (

    error,

    context = "Application"

) {

    console.error(

        `[${context}]`,

        error

    );

    return {

        success: false,

        message:

            error?.message ||

            "Unknown error.",

        error

    };

};


/* =====================================================
   APPLICATION INFORMATION
===================================================== */

Utils.info = function () {

    return {

        application: APP_NAME,

        version: APP_VERSION,

        locale: this.locale,

        currency: this.currency,

        initialized: this.initialized,

        userAgent: navigator.userAgent,

        platform: navigator.platform,

        language: navigator.language,

        online: navigator.onLine

    };

};


/* =====================================================
   RESET
===================================================== */

Utils.reset = function () {

    this.locale = DEFAULT_LOCALE;

    this.currency = DEFAULT_CURRENCY;

    this.initialized = false;

};


/* =====================================================
   INITIALIZE
===================================================== */

Utils.initialize();


/* =====================================================
   PRODUCTION EXPORT
===================================================== */



/* =====================================================
   END OF FILE
   frontend/js/utils.js
   CROWN PRINCE REWARD HUB
   PRODUCTION BUILD
===================================================== */


export default Utils;
