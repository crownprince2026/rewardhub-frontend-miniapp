"use strict";
import State from "./state.js";

const UI = {
    initialized: false,
    activeScreen: "auth",

    // Aggressive Screen Switcher
    showScreen: function(name) {
        console.log("UI: Switching to screen ->", name);
        
        // 1. Hide EVERY section with class 'screen'
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
            s.setAttribute('hidden', 'true');
        });

        // 2. Find target screen (by ID or data-screen)
        const target = document.getElementById(name + "-screen") || 
                       document.querySelector(`[data-screen="${name}"]`);

        if (target) {
            target.style.display = 'block';
            target.classList.add('active');
            target.removeAttribute('hidden');
            this.activeScreen = name;
            return true;
        } else {
            console.error("UI Error: Could not find screen:", name);
            // Emergency fallback to dashboard if splash/auth fail
            if(name !== 'dashboard') this.showScreen('dashboard');
            return false;
        }
    },

    hideLoading: function() {
        const loader = document.getElementById('loading-overlay');
        if (loader) loader.style.display = 'none';
    },

    initialize: async function() {
        this.initialized = true;
        console.log("UI System Initialized");
    }
};

export default UI;
