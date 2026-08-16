"use strict";

const UI = {
    activeScreen: "auth",

    showScreen: function(name) {
        console.log("Navigating to:", name);
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });

        // Handle both "name" and "name-screen" formats
        const target = document.getElementById(name) || 
                       document.getElementById(name + "-screen") ||
                       document.querySelector(`[data-screen="${name}"]`);

        if (target) {
            target.style.display = 'block';
            target.classList.add('active');
            this.activeScreen = name;
            
            // Auto-scroll to top when switching screens
            window.scrollTo(0, 0);
            return true;
        }
        console.error("Screen not found:", name);
        return false;
    },

    // This function connects the buttons to the screens
    initNavigation: function() {
        // 1. Bottom Nav Buttons
        const navButtons = document.querySelectorAll('[data-nav]');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetScreen = btn.getAttribute('data-nav');
                this.showScreen(targetScreen);
                
                // Visual feedback: highlight active button
                navButtons.forEach(b => b.style.opacity = "0.6");
                btn.style.opacity = "1";
            });
        });

        // 2. Specialized Dashboard Buttons (Daily Bonus, Spin Wheel, etc.)
        // We will target any card that should open a screen
        this.setupCardNavigation("daily-bonus-card", "daily-bonus");
        this.setupCardNavigation("spin-wheel-card", "spin-wheel");
        this.setupCardNavigation("mystery-box-card", "mystery-box");
        this.setupCardNavigation("watch-ads-card", "watch-ads");
    },

    setupCardNavigation: function(elementId, screenName) {
        const el = document.getElementById(elementId);
        if (el) {
            el.style.cursor = "pointer";
            el.onclick = () => this.showScreen(screenName);
        }
    },

    openAuth: function() { this.showScreen("auth"); },
    openSplash: function() { this.showScreen("splash"); },
    openDashboard: function() { this.showScreen("dashboard"); },
    hideLoading: function() {
        const loader = document.getElementById('loading-overlay');
        if(loader) loader.style.display = 'none';
    }
};

export default UI;
