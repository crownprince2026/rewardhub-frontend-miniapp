"use strict";

const UI = {
    showScreen: function(name) {
        console.log("Switching to:", name);
        
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });

        // Search for the element by ID
        // We will try name, name-screen, and data-screen
        const target = document.getElementById(name) || 
                       document.getElementById(name + "-screen") || 
                       document.querySelector(`[data-screen="${name}"]`);

        if (target) {
            target.style.display = 'block';
            target.classList.add('active');
            return true;
        } else {
            console.error("Missing Screen HTML for:", name);
            return false;
        }
    },

    openAuth: function() { return this.showScreen("auth"); },
    openSplash: function() { return this.showScreen("splash"); },
    openDashboard: function() { return this.showScreen("dashboard"); },
    hideLoading: function() {
        const loader = document.getElementById('loading-overlay');
        if(loader) loader.style.display = 'none';
    }
};

export default UI;
