"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB
   TELEGRAM MINI APP
   ANIMATIONS.JS
   PHASE 2C.1
   IMPORTS
   ANIMATION REGISTRY
===================================================== */

import Settings from "./settings.js";
import State from "./state.js";
import UI from "./ui.js";
import Utils from "./utils.js";

/* =====================================================
   ANIMATION CONSTANTS
===================================================== */

const DEFAULT_DURATION = 300;

const DEFAULT_EASING = "ease";

const DEFAULT_DELAY = 0;

/* =====================================================
   ANIMATION REGISTRY
===================================================== */

const Animations = {

    initialized: false,

    enabled: true,

    running: new Set(),

    registry: new Map(),

    queue: [],

    defaults: {

        duration: DEFAULT_DURATION,

        easing: DEFAULT_EASING,

        delay: DEFAULT_DELAY

    }

};

/* =====================================================
   REGISTER
===================================================== */

Animations.register = function (

    name,

    config = {}

) {

    this.registry.set(

        name,

        {

            name,

            duration:

                config.duration ??

                this.defaults.duration,

            easing:

                config.easing ??

                this.defaults.easing,

            delay:

                config.delay ??

                this.defaults.delay

        }

    );

};

/* =====================================================
   GETTERS
===================================================== */

Animations.exists = function (

    name

) {

    return this.registry.has(name);

};


Animations.get = function (

    name

) {

    return this.registry.get(name);

};


Animations.list = function () {

    return Array.from(

        this.registry.values()

    );

};


/* =====================================================
   ENABLE / DISABLE
===================================================== */

Animations.enable = function () {

    this.enabled = true;

};


Animations.disable = function () {

    this.enabled = false;

};


Animations.isEnabled = function () {

    return this.enabled &&

        Settings.animationsEnabled();

};


/* =====================================================
   DEFAULT ANIMATIONS
===================================================== */

Animations.register(

    "fade"

);

Animations.register(

    "slide"

);

Animations.register(

    "scale"

);

Animations.register(

    "bounce"

);

Animations.register(

    "shake"

);

Animations.register(

    "confetti"

);

Animations.register(

    "spin"

);

Animations.register(

    "toast"

);

Animations.register(

    "modal"

);

Animations.register(

    "bottom-sheet"

);

Animations.register(

    "page"

);

Animations.register(

    "reward"

);

/* =====================================================
   END OF PHASE 2C.1
===================================================== */

/* =====================================================
   PHASE 2C.2
   PAGE TRANSITIONS
   FADE
   SLIDE
   SCALE
===================================================== */


/* =====================================================
   INTERNAL ANIMATION ENGINE
===================================================== */

Animations.play = async function (

    element,

    keyframes,

    options = {}

) {

    if (

        !element ||

        !this.isEnabled()

    ) {

        return;

    }

    const animation = element.animate(

        keyframes,

        {

            duration:

                options.duration ??

                this.defaults.duration,

            easing:

                options.easing ??

                this.defaults.easing,

            delay:

                options.delay ??

                this.defaults.delay,

            fill: "forwards"

        }

    );

    this.running.add(animation);

    try {

        await animation.finished;

    }

    finally {

        this.running.delete(animation);

    }

};


/* =====================================================
   FADE
===================================================== */

Animations.fadeIn = async function (

    element,

    duration = 300

) {

    await this.play(

        element,

        [

            {

                opacity: 0

            },

            {

                opacity: 1

            }

        ],

        {

            duration

        }

    );

};


Animations.fadeOut = async function (

    element,

    duration = 300

) {

    await this.play(

        element,

        [

            {

                opacity: 1

            },

            {

                opacity: 0

            }

        ],

        {

            duration

        }

    );

};


/* =====================================================
   SLIDE
===================================================== */

Animations.slideUp = async function (

    element,

    duration = 300

) {

    await this.play(

        element,

        [

            {

                transform:

                    "translateY(40px)",

                opacity: 0

            },

            {

                transform:

                    "translateY(0)",

                opacity: 1

            }

        ],

        {

            duration

        }

    );

};


Animations.slideDown = async function (

    element,

    duration = 300

) {

    await this.play(

        element,

        [

            {

                transform:

                    "translateY(-40px)",

                opacity: 0

            },

            {

                transform:

                    "translateY(0)",

                opacity: 1

            }

        ],

        {

            duration

        }

    );

};


/* =====================================================
   SCALE
===================================================== */

Animations.scaleIn = async function (

    element,

    duration = 250

) {

    await this.play(

        element,

        [

            {

                transform:

                    "scale(.85)",

                opacity: 0

            },

            {

                transform:

                    "scale(1)",

                opacity: 1

            }

        ],

        {

            duration

        }

    );

};


Animations.scaleOut = async function (

    element,

    duration = 250

) {

    await this.play(

        element,

        [

            {

                transform:

                    "scale(1)",

                opacity: 1

            },

            {

                transform:

                    "scale(.85)",

                opacity: 0

            }

        ],

        {

            duration

        }

    );

};


/* =====================================================
   PAGE TRANSITION
===================================================== */

Animations.pageTransition = async function (

    currentPage,

    nextPage,

    effect = "fade"

) {

    if (

        currentPage

    ) {

        switch (effect) {

            case "slide":

                await this.slideUp(

                    currentPage

                );

                break;

            case "scale":

                await this.scaleOut(

                    currentPage

                );

                break;

            default:

                await this.fadeOut(

                    currentPage

                );

        }

    }

    if (

        nextPage

    ) {

        switch (effect) {

            case "slide":

                await this.slideDown(

                    nextPage

                );

                break;

            case "scale":

                await this.scaleIn(

                    nextPage

                );

                break;

            default:

                await this.fadeIn(

                    nextPage

                );

        }

    }

};


/* =====================================================
   END OF PHASE 2C.2
===================================================== */

/* =====================================================
   PHASE 2C.3
   REWARD ANIMATIONS
   CONFETTI
   SPIN WHEEL
   SUCCESS
   ERROR
===================================================== */


/* =====================================================
   CONFETTI
===================================================== */

Animations.confetti = async function (

    element = document.body,

    duration = 2500

) {

    if (

        !this.isEnabled()

    ) {

        return;

    }

    element.classList.add(

        "confetti-animation"

    );

    await new Promise(

        resolve =>

            setTimeout(

                resolve,

                duration

            )

    );

    element.classList.remove(

        "confetti-animation"

    );

};


/* =====================================================
   SPIN WHEEL
===================================================== */

Animations.spinWheel = async function (

    wheel,

    degrees = 3600,

    duration = 5000

) {

    if (

        !wheel ||

        !this.isEnabled()

    ) {

        return;

    }

    await this.play(

        wheel,

        [

            {

                transform:

                    "rotate(0deg)"

            },

            {

                transform:

                    `rotate(${degrees}deg)`

            }

        ],

        {

            duration,

            easing:

                "cubic-bezier(0.17,0.67,0.18,1)"

        }

    );

};


/* =====================================================
   SUCCESS
===================================================== */

Animations.success = async function (

    element

) {

    if (

        !element ||

        !this.isEnabled()

    ) {

        return;

    }

    await this.play(

        element,

        [

            {

                transform:

                    "scale(0.8)",

                opacity: 0.5

            },

            {

                transform:

                    "scale(1.15)",

                opacity: 1

            },

            {

                transform:

                    "scale(1)"

            }

        ],

        {

            duration: 450,

            easing: "ease-out"

        }

    );

};


/* =====================================================
   ERROR
===================================================== */

Animations.error = async function (

    element

) {

    if (

        !element ||

        !this.isEnabled()

    ) {

        return;

    }

    await this.play(

        element,

        [

            {

                transform:

                    "translateX(0)"

            },

            {

                transform:

                    "translateX(-8px)"

            },

            {

                transform:

                    "translateX(8px)"

            },

            {

                transform:

                    "translateX(-8px)"

            },

            {

                transform:

                    "translateX(8px)"

            },

            {

                transform:

                    "translateX(0)"

            }

        ],

        {

            duration: 500

        }

    );

};


/* =====================================================
   REWARD CLAIM
===================================================== */

Animations.rewardClaim = async function (

    element

) {

    await this.success(

        element

    );

    await this.confetti();

};


/* =====================================================
   MYSTERY BOX
===================================================== */

Animations.mysteryBox = async function (

    element

) {

    if (

        !element ||

        !this.isEnabled()

    ) {

        return;

    }

    await this.play(

        element,

        [

            {

                transform:

                    "scale(1) rotate(0deg)"

            },

            {

                transform:

                    "scale(1.08) rotate(-6deg)"

            },

            {

                transform:

                    "scale(1.08) rotate(6deg)"

            },

            {

                transform:

                    "scale(1) rotate(0deg)"

            }

        ],

        {

            duration: 900

        }

    );

};


/* =====================================================
   DAILY BONUS
===================================================== */

Animations.dailyBonus = async function (

    element

) {

    await this.success(

        element

    );

};


/* =====================================================
   WATCH AD REWARD
===================================================== */

Animations.adReward = async function (

    element

) {

    await this.success(

        element

    );

};


/* =====================================================
   END OF PHASE 2C.3
===================================================== */

/* =====================================================
   PHASE 2C.4
   SKELETON LOADERS
   PULL-TO-REFRESH
   MICRO-INTERACTIONS
===================================================== */


/* =====================================================
   SKELETON LOADER
===================================================== */

Animations.showSkeleton = function (

    selector = ".skeleton"

) {

    document

        .querySelectorAll(selector)

        .forEach(element => {

            element.hidden = false;

            element.classList.add(

                "skeleton-loading"

            );

        });

};


Animations.hideSkeleton = function (

    selector = ".skeleton"

) {

    document

        .querySelectorAll(selector)

        .forEach(element => {

            element.classList.remove(

                "skeleton-loading"

            );

            element.hidden = true;

        });

};


/* =====================================================
   PULL TO REFRESH
===================================================== */

Animations.pullToRefresh = async function (

    callback = null

) {

    if (

        !this.isEnabled()

    ) {

        if (callback) {

            await callback();

        }

        return;

    }

    document.body.classList.add(

        "refreshing"

    );

    try {

        if (callback) {

            await callback();

        }

    }

    finally {

        setTimeout(() => {

            document.body.classList.remove(

                "refreshing"

            );

        }, 600);

    }

};


/* =====================================================
   BUTTON PRESS
===================================================== */

Animations.buttonPress = async function (

    element

) {

    if (

        !element ||

        !this.isEnabled()

    ) {

        return;

    }

    await this.play(

        element,

        [

            {

                transform: "scale(1)"

            },

            {

                transform: "scale(.96)"

            },

            {

                transform: "scale(1)"

            }

        ],

        {

            duration: 150

        }

    );

};


/* =====================================================
   CARD HOVER
===================================================== */

Animations.cardHover = async function (

    element

) {

    if (

        !element ||

        !this.isEnabled()

    ) {

        return;

    }

    await this.play(

        element,

        [

            {

                transform:

                    "translateY(0)"

            },

            {

                transform:

                    "translateY(-4px)"

            }

        ],

        {

            duration: 180

        }

    );

};


/* =====================================================
   ICON POP
===================================================== */

Animations.iconPop = async function (

    element

) {

    if (

        !element ||

        !this.isEnabled()

    ) {

        return;

    }

    await this.play(

        element,

        [

            {

                transform:

                    "scale(1)"

            },

            {

                transform:

                    "scale(1.25)"

            },

            {

                transform:

                    "scale(1)"

            }

        ],

        {

            duration: 220

        }

    );

};


/* =====================================================
   SHAKE
===================================================== */

Animations.shake = async function (

    element

) {

    if (

        !element ||

        !this.isEnabled()

    ) {

        return;

    }

    await this.error(

        element

    );

};


/* =====================================================
   PULSE
===================================================== */

Animations.pulse = async function (

    element

) {

    if (

        !element ||

        !this.isEnabled()

    ) {

        return;

    }

    await this.play(

        element,

        [

            {

                transform:

                    "scale(1)"

            },

            {

                transform:

                    "scale(1.05)"

            },

            {

                transform:

                    "scale(1)"

            }

        ],

        {

            duration: 600

        }

    );

};


/* =====================================================
   BADGE UPDATE
===================================================== */

Animations.badgeUpdate = async function (

    element

) {

    await this.iconPop(

        element

    );

};


/* =====================================================
   END OF PHASE 2C.4
===================================================== */

/* =====================================================
   PHASE 2C.5
   ANIMATION CONTROLLER
   PERFORMANCE OPTIMIZATION
   PRODUCTION EXPORT
===================================================== */


/* =====================================================
   STOP ALL ANIMATIONS
===================================================== */

Animations.stopAll = function () {

    this.running.forEach(animation => {

        try {

            animation.cancel();

        }

        catch (_) {}

    });

    this.running.clear();

};


/* =====================================================
   PAUSE / RESUME
===================================================== */

Animations.pauseAll = function () {

    this.running.forEach(animation => {

        try {

            animation.pause();

        }

        catch (_) {}

    });

};


Animations.resumeAll = function () {

    this.running.forEach(animation => {

        try {

            animation.play();

        }

        catch (_) {}

    });

};


/* =====================================================
   PERFORMANCE MODE
===================================================== */

Animations.enablePerformanceMode = function () {

    this.disable();

    document.documentElement.classList.add(

        "reduced-motion"

    );

};


Animations.disablePerformanceMode = function () {

    this.enable();

    document.documentElement.classList.remove(

        "reduced-motion"

    );

};


/* =====================================================
   SYSTEM REDUCED MOTION
===================================================== */

Animations.detectReducedMotion = function () {

    const media = window.matchMedia(

        "(prefers-reduced-motion: reduce)"

    );

    if (media.matches) {

        this.enablePerformanceMode();

    }

    media.addEventListener(

        "change",

        event => {

            if (event.matches) {

                this.enablePerformanceMode();

            }

            else {

                this.disablePerformanceMode();

            }

        }

    );

};


/* =====================================================
   QUEUE
===================================================== */

Animations.enqueue = function (

    callback

) {

    this.queue.push(callback);

};


Animations.runQueue = async function () {

    while (

        this.queue.length

    ) {

        const callback =

            this.queue.shift();

        try {

            await callback();

        }

        catch (error) {

            console.error(error);

        }

    }

};


/* =====================================================
   STATUS
===================================================== */

Animations.status = function () {

    return {

        initialized:

            this.initialized,

        enabled:

            this.enabled,

        registered:

            this.registry.size,

        running:

            this.running.size,

        queued:

            this.queue.length

    };

};


/* =====================================================
   RESET
===================================================== */

Animations.reset = function () {

    this.stopAll();

    this.queue = [];

    this.enabled = true;

};


/* =====================================================
   INITIALIZATION
===================================================== */

Animations.initialize = function () {

    if (

        this.initialized

    ) {

        return;

    }

    this.detectReducedMotion();

    this.initialized = true;

};


/* =====================================================
   STARTUP
===================================================== */

window.addEventListener(

    "DOMContentLoaded",

    () => {

        Animations.initialize();

    }

);


/* =====================================================
   PRODUCTION EXPORT
===================================================== */

export default Animations;


/* =====================================================
   END OF FILE
   frontend/js/animations.js
   CROWN PRINCE REWARD HUB
   PRODUCTION BUILD
===================================================== */
