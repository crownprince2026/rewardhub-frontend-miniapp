"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - ANIMATIONS MODULE
   CLEAN RECONSTRUCTION - PHASE 5 (ORCHESTRATION)
===================================================== */

import Settings from "./settings.js";
import State from "./state.js";
import UI from "./ui.js";
import Utils from "./utils.js";

const DEFAULT_DURATION = 300;
const DEFAULT_EASING = "ease";

const Animations = {
    initialized: false,
    enabled: true,
    running: new Set(),
    registry: new Map(),
    queue: [],
    defaults: { duration: DEFAULT_DURATION, easing: DEFAULT_EASING, delay: 0 }
};

/* --- REGISTRATION --- */
Animations.register = function (name, config = {}) {
    this.registry.set(name, {
        name,
        duration: config.duration ?? this.defaults.duration,
        easing: config.easing ?? this.defaults.easing,
        delay: config.delay ?? this.defaults.delay
    });
};

// Register all standard animations correctly
const animationList = ["fade", "slide", "scale", "bounce", "shake", "confetti", "spin", "toast", "modal", "bottom-sheet", "page", "reward"];
animationList.forEach(anim => Animations.register(anim));

/* --- CORE ENGINE --- */
Animations.play = async function (element, keyframes, options = {}) {
    if (!element || !this.isEnabled()) return;

    const animation = element.animate(keyframes, {
        duration: options.duration ?? this.defaults.duration,
        easing: options.easing ?? this.defaults.easing,
        delay: options.delay ?? this.defaults.delay,
        fill: "forwards"
    });

    this.running.add(animation);
    try {
        await animation.finished;
    } finally {
        this.running.delete(animation);
    }
};

/* --- TRANSITIONS --- */
Animations.fadeIn = async function (el, duration = 300) {
    await this.play(el, [{ opacity: 0 }, { opacity: 1 }], { duration });
};

Animations.fadeOut = async function (el, duration = 300) {
    await this.play(el, [{ opacity: 1 }, { opacity: 0 }], { duration });
};

Animations.slideUp = async function (el, duration = 300) {
    await this.play(el, [{ transform: "translateY(40px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], { duration });
};

/* --- REWARD EFFECTS --- */
Animations.spinWheel = async function (wheel, degrees = 3600, duration = 5000) {
    if (!wheel || !this.isEnabled()) return;
    await this.play(wheel, [
        { transform: "rotate(0deg)" },
        { transform: `rotate(${degrees}deg)` }
    ], { duration, easing: "cubic-bezier(0.17,0.67,0.18,1)" });
};

Animations.confetti = async function (element = document.body, duration = 2500) {
    if (!this.isEnabled()) return;
    element.classList.add("confetti-animation");
    await new Promise(resolve => setTimeout(resolve, duration));
    element.classList.remove("confetti-animation");
};

Animations.rewardClaim = async function (element) {
    await this.play(element, [
        { transform: "scale(0.8)", opacity: 0.5 },
        { transform: "scale(1.15)", opacity: 1 },
        { transform: "scale(1)" }
    ], { duration: 450 });
    await this.confetti();
};

/* --- MICRO-INTERACTIONS --- */
Animations.buttonPress = async function (el) {
    if (!el || !this.isEnabled()) return;
    await this.play(el, [{ transform: "scale(1)" }, { transform: "scale(.96)" }, { transform: "scale(1)" }], { duration: 150 });
};

/* --- SYSTEM --- */
Animations.isEnabled = function () {
    return this.enabled && Settings.getTheme() !== "low-performance";
};

Animations.detectReducedMotion = function () {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) this.enabled = false;
    media.addEventListener("change", event => {
        this.enabled = !event.matches;
    });
};

Animations.initialize = function () {
    if (this.initialized) return;
    this.detectReducedMotion();
    this.initialized = true;
    console.log("Animations Module Initialized.");
};

/* --- STARTUP --- */
window.addEventListener("DOMContentLoaded", () => {
    Animations.initialize();
});

export default Animations;
