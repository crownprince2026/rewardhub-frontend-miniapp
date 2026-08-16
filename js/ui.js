"use strict";

const UI = {
    showScreen: function(screenId) {
        console.log("Attempting to show:", screenId);
        
        // Hide every element that has the class 'screen'
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });

        // Try to find the screen by ID (exact match)
        let target = document.getElementById(screenId);
        
        // If not found, try adding "-screen" suffix
        if (!target) target = document.getElementById(screenId + "-screen");

        if (target) {
            target.style.display = 'block';
            target.classList.add('active');
            console.log("Success: Showed", screenId);
        } else {
            console.error("CRITICAL: Screen not found in HTML:", screenId);
            // Fallback: Show the first screen available so the user sees SOMETHING
            if(screens[0]) screens[0].style.display = 'block';
        }
    },

    openAuth: function() { this.showScreen("auth-screen"); },
    openSplash: function() { this.showScreen("splash-screen"); },
    openDashboard: function() { this.showScreen("dashboard-screen"); },
    hideLoading: function() { 
        const loader = document.getElementById('loading-overlay');
        if(loader) loader.style.display = 'none';
    },
    initialize: function() { return Promise.resolve(); }
};

export default UI;
