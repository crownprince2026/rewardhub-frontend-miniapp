"use strict";

const UI = {
    activeScreen: "auth-screen",

    showScreen: function(name) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });

        // Try both name and name-screen
        const target = document.getElementById(name) || document.getElementById(name + "-screen");

        if (target) {
            target.style.display = 'flex'; 
            target.classList.add('active');
            this.activeScreen = name;
            return true;
        }
        return false;
    },

    renderDashboard: function() {
        const bal = document.getElementById("balance");
        if (bal) bal.innerText = "$0.00";
    },

    initNavigation: function() {
        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.onclick = () => {
                const target = btn.getAttribute('data-nav');
                this.showScreen(target);
            };
        });
    },

    openAuth: function() { this.showScreen("auth-screen"); },
    openSplash: function() { this.showScreen("splash-screen"); },
    openDashboard: function() { this.showScreen("dashboard-screen"); },
    hideLoading: function() { 
        const loader = document.getElementById('loading-overlay');
        if(loader) loader.style.display = 'none';
    }
};

export default UI;
