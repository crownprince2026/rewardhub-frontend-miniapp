"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB
   TELEGRAM MINI APP
   UI.JS
   PHASE 2B.1
   IMPORTS
   UI STATE
   DOM HELPERS
===================================================== */

import State from "./state.js";
import Router from "./router.js";
import Settings from "./settings.js";
import Utils from "./utils.js";

/* =====================================================
   UI
===================================================== */

const UI = {

    initialized: false,

    activeScreen: "splash",

    activeModal: null,

    activeBottomSheet: null,

    activeToast: null,

    loading: false,

    searching: false,

    refreshing: false,

    elements: {},

    cache: {}

};

/* =====================================================
   DOM HELPERS
===================================================== */

UI.$ = function (

    selector,

    parent = document

) {

    return parent.querySelector(

        selector

    );

};


UI.$$ = function (

    selector,

    parent = document

) {

    return Array.from(

        parent.querySelectorAll(

            selector

        )

    );

};


UI.byId = function (

    id

) {

    return document.getElementById(

        id

    );

};


UI.create = function (

    tag,

    className = ""

) {

    const element =

        document.createElement(tag);

    if (className) {

        element.className = className;

    }

    return element;

};


/* =====================================================
   CLASS HELPERS
===================================================== */

UI.addClass = function (

    element,

    className

) {

    if (!element) return;

    element.classList.add(

        className

    );

};


UI.removeClass = function (

    element,

    className

) {

    if (!element) return;

    element.classList.remove(

        className

    );

};


UI.toggleClass = function (

    element,

    className

) {

    if (!element) return;

    element.classList.toggle(

        className

    );

};


UI.hasClass = function (

    element,

    className

) {

    if (!element) return false;

    return element.classList.contains(

        className

    );

};


/* =====================================================
   VISIBILITY
===================================================== */

UI.show = function (

    element

) {

    if (!element) return;

    element.hidden = false;

};


UI.hide = function (

    element

) {

    if (!element) return;

    element.hidden = true;

};


UI.toggle = function (

    element,

    visible

) {

    if (!element) return;

    element.hidden = !visible;

};


/* =====================================================
   CONTENT
===================================================== */

UI.text = function (

    element,

    value

) {

    if (!element) return;

    element.textContent = value;

};


UI.html = function (

    element,

    value

) {

    if (!element) return;

    element.innerHTML = value;

};


/* =====================================================
   ATTRIBUTES
===================================================== */

UI.attr = function (

    element,

    name,

    value

) {

    if (!element) return;

    element.setAttribute(

        name,

        value

    );

};


UI.removeAttr = function (

    element,

    name

) {

    if (!element) return;

    element.removeAttribute(

        name

    );

};


/* =====================================================
   CACHE
===================================================== */

UI.cacheElement = function (

    key,

    selector

) {

    const element = this.$(

        selector

    );

    if (element) {

        this.cache[key] = element;

    }

    return element;

};


UI.getCached = function (

    key

) {

    return this.cache[key] || null;

};


/* =====================================================
   END OF PHASE 2B.1
===================================================== */

/* =====================================================
   PHASE 2B.2
   SCREEN MANAGER
   SHOW / HIDE SECTIONS
===================================================== */


/* =====================================================
   SCREENS
===================================================== */

UI.getScreens = function () {

    return this.$$("[data-screen]");

};


UI.getScreen = function (

    name

) {

    return this.$(

        `[data-screen="${name}"]`

    );

};


/* =====================================================
   HIDE ALL SCREENS
===================================================== */

UI.hideAllScreens = function () {

    this.getScreens().forEach(

        screen => {

            screen.classList.remove(

                "active"

            );

            screen.hidden = true;

        }

    );

};


/* =====================================================
   SHOW SCREEN
===================================================== */

UI.showScreen = function (

    name

) {

    const screen = this.getScreen(

        name

    );

    if (!screen) {

        console.warn(

            `Screen "${name}" not found.`

        );

        return false;

    }

    this.hideAllScreens();

    screen.hidden = false;

    screen.classList.add(

        "active"

    );

    this.activeScreen = name;

    State.setCurrentPage(

        name

    );

    return true;

};


/* =====================================================
   SWITCH SCREEN
===================================================== */

UI.switchScreen = async function (

    name

) {

    const success = this.showScreen(

        name

    );

    if (!success) {

        return false;

    }

    await Router.safeNavigate(

        name

    );

    return true;

};


/* =====================================================
   CURRENT SCREEN
===================================================== */

UI.currentScreen = function () {

    return this.activeScreen;

};


/* =====================================================
   REFRESH CURRENT SCREEN
===================================================== */

UI.refreshScreen = function () {

    return this.showScreen(

        this.activeScreen

    );

};


/* =====================================================
   DASHBOARD
===================================================== */

UI.openDashboard = function () {

    return this.switchScreen(

        "dashboard"

    );

};


/* =====================================================
   LOGIN
===================================================== */

UI.openLogin = function () {

    return this.switchScreen(

        "login"

    );

};


/* =====================================================
   PROFILE
===================================================== */

UI.openProfile = function () {

    return this.switchScreen(

        "profile"

    );

};


/* =====================================================
   SETTINGS
===================================================== */

UI.openSettings = function () {

    return this.switchScreen(

        "settings"

    );

};


/* =====================================================
   ADMIN
===================================================== */

UI.openAdmin = function () {

    return this.switchScreen(

        "admin-dashboard"

    );

};


/* =====================================================
   END OF PHASE 2B.2
===================================================== */

/* =====================================================
   PHASE 2B.3
   GLOBAL COMPONENTS
   LOADING
   TOAST
   MODAL
   BOTTOM SHEET
   SEARCH
===================================================== */


/* =====================================================
   LOADING OVERLAY
===================================================== */

UI.showLoading = function (

    message = "Loading..."

) {

    this.loading = true;

    const overlay = this.byId(

        "loading-overlay"

    );

    if (!overlay) return;

    overlay.hidden = false;

    overlay.classList.add("active");

    const text = overlay.querySelector(

        ".loading-text"

    );

    if (text) {

        text.textContent = message;

    }

};


UI.hideLoading = function () {

    this.loading = false;

    const overlay = this.byId(

        "loading-overlay"

    );

    if (!overlay) return;

    overlay.hidden = true;

    overlay.classList.remove("active");

};


/* =====================================================
   TOAST
===================================================== */

UI.showToast = function (

    message,

    type = "info",

    duration = 3000

) {

    const toast = this.byId("toast");

    if (!toast) return;

    toast.className = `toast ${type}`;

    toast.textContent = message;

    toast.hidden = false;

    toast.classList.add("show");

    this.activeToast = toast;

    setTimeout(() => {

        this.hideToast();

    }, duration);

};


UI.hideToast = function () {

    if (!this.activeToast) return;

    this.activeToast.classList.remove(

        "show"

    );

    this.activeToast.hidden = true;

    this.activeToast = null;

};


/* =====================================================
   MODAL
===================================================== */

UI.openModal = function (

    id

) {

    const modal = this.byId(id);

    if (!modal) return;

    modal.hidden = false;

    modal.classList.add("active");

    this.activeModal = modal;

};


UI.closeModal = function () {

    if (!this.activeModal) return;

    this.activeModal.classList.remove(

        "active"

    );

    this.activeModal.hidden = true;

    this.activeModal = null;

};


/* =====================================================
   BOTTOM SHEET
===================================================== */

UI.openBottomSheet = function (

    id

) {

    const sheet = this.byId(id);

    if (!sheet) return;

    sheet.hidden = false;

    sheet.classList.add("active");

    this.activeBottomSheet = sheet;

};


UI.closeBottomSheet = function () {

    if (!this.activeBottomSheet) return;

    this.activeBottomSheet.classList.remove(

        "active"

    );

    this.activeBottomSheet.hidden = true;

    this.activeBottomSheet = null;

};


/* =====================================================
   SEARCH
===================================================== */

UI.openSearch = function () {

    const overlay = this.byId(

        "search-overlay"

    );

    if (!overlay) return;

    overlay.hidden = false;

    overlay.classList.add("active");

    this.searching = true;

    const input = overlay.querySelector(

        "input"

    );

    if (input) {

        input.focus();

    }

};


UI.closeSearch = function () {

    const overlay = this.byId(

        "search-overlay"

    );

    if (!overlay) return;

    overlay.classList.remove(

        "active"

    );

    overlay.hidden = true;

    this.searching = false;

};


UI.filterSearch = function (

    selector,

    keyword

) {

    const items = this.$$(selector);

    const query = keyword.toLowerCase();

    items.forEach(item => {

        const visible = item.textContent

            .toLowerCase()

            .includes(query);

        item.hidden = !visible;

    });

};


/* =====================================================
   END OF PHASE 2B.3
===================================================== */

/* =====================================================
   PHASE 2B.4
   THEME MANAGER
   RESPONSIVE LAYOUT
   TELEGRAM SAFE AREA
===================================================== */


/* =====================================================
   THEME
===================================================== */

UI.applyTheme = function (

    theme = Settings.getTheme()

) {

    document.documentElement.setAttribute(

        "data-theme",

        theme

    );

    this.theme = theme;

};


UI.toggleTheme = function () {

    const theme =

        document.documentElement.getAttribute(

            "data-theme"

        ) === "dark"

            ? "light"

            : "dark";

    Settings.setTheme(theme);

    this.applyTheme(theme);

};


/* =====================================================
   RESPONSIVE LAYOUT
===================================================== */

UI.updateViewport = function () {

    document.documentElement.style.setProperty(

        "--app-height",

        `${window.innerHeight}px`

    );

    document.documentElement.style.setProperty(

        "--app-width",

        `${window.innerWidth}px`

    );

};


UI.getBreakpoint = function () {

    const width = window.innerWidth;

    if (width < 576) return "mobile";

    if (width < 992) return "tablet";

    return "desktop";

};


UI.updateBreakpoint = function () {

    document.body.dataset.breakpoint =

        this.getBreakpoint();

};


/* =====================================================
   TELEGRAM SAFE AREA
===================================================== */

UI.applyTelegramSafeArea = function () {

    if (

        window.Telegram?.WebApp

    ) {

        const app =

            window.Telegram.WebApp;

        app.ready();

        app.expand();

        document.documentElement.style.setProperty(

            "--tg-safe-top",

            "env(safe-area-inset-top)"

        );

        document.documentElement.style.setProperty(

            "--tg-safe-bottom",

            "env(safe-area-inset-bottom)"

        );

        document.documentElement.style.setProperty(

            "--tg-safe-left",

            "env(safe-area-inset-left)"

        );

        document.documentElement.style.setProperty(

            "--tg-safe-right",

            "env(safe-area-inset-right)"

        );

    }

};


/* =====================================================
   RESIZE
===================================================== */

UI.refreshLayout = function () {

    this.updateViewport();

    this.updateBreakpoint();

};


window.addEventListener(

    "resize",

    () => {

        UI.refreshLayout();

    }

);

window.addEventListener(

    "orientationchange",

    () => {

        UI.refreshLayout();

    }

);


/* =====================================================
   INITIALIZE
===================================================== */

UI.initializeLayout = function () {

    this.applyTheme();

    this.refreshLayout();

    this.applyTelegramSafeArea();

};


/* =====================================================
   END OF PHASE 2B.4
===================================================== */

/* =====================================================
   PHASE 2B.5
   ERROR HANDLING
   PRODUCTION EXPORT
===================================================== */


/* =====================================================
   UI STATUS
===================================================== */

UI.status = function () {

    return {

        initialized: this.initialized,

        activeScreen: this.activeScreen,

        activeModal: this.activeModal?.id || null,

        activeBottomSheet: this.activeBottomSheet?.id || null,

        activeToast: !!this.activeToast,

        loading: this.loading,

        searching: this.searching,

        refreshing: this.refreshing,

        cachedElements: Object.keys(

            this.cache

        ).length,

        breakpoint:

            document.body.dataset.breakpoint ||

            "mobile"

    };

};


/* =====================================================
   ERROR HANDLER
===================================================== */

UI.handleError = function (

    error,

    context = "UI"

) {

    console.error(

        `[${context}]`,

        error

    );

    try {

        this.hideLoading();

    }

    catch (_) {}

    try {

        this.showToast(

            "Something went wrong.",

            "error"

        );

    }

    catch (_) {}

    return {

        success: false,

        context,

        message:

            error?.message ||

            "Unknown UI error.",

        error

    };

};


/* =====================================================
   RESET UI
===================================================== */

UI.reset = function () {

    this.hideLoading();

    this.closeToast?.();

    this.closeModal();

    this.closeBottomSheet();

    this.closeSearch();

    this.activeScreen = "splash";

    this.activeModal = null;

    this.activeBottomSheet = null;

    this.activeToast = null;

    this.loading = false;

    this.searching = false;

    this.refreshing = false;

};


/* =====================================================
   INITIALIZE
===================================================== */

UI.initialize = async function () {

    if (

        this.initialized

    ) {

        return;

    }

    try {

        this.initializeLayout();

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
   APPLICATION STARTUP
===================================================== */

window.addEventListener(

    "DOMContentLoaded",

    async () => {

        await UI.initialize();

    }

);


/* =====================================================
   PRODUCTION EXPORT
===================================================== */

export default UI;


/* =====================================================
   END OF FILE
   frontend/js/ui.js
   CROWN PRINCE REWARD HUB
   PRODUCTION BUILD
===================================================== */
