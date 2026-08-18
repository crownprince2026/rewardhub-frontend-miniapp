"use strict";

const UI = {
    showScreen: function(name) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => { s.style.display = 'none'; s.classList.remove('active'); });
        const target = document.getElementById(name) || document.getElementById(name + "-screen");
        if (target) {
            target.style.display = 'flex';
            target.classList.add('active');
            return true;
        }
        return false;
    },
    renderDashboard: function() {
        const balanceEl = document.getElementById("balance");
        if (balanceEl) balanceEl.innerText = "$0.00";
    },
    initNavigation: function() {
        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.onclick = () => this.showScreen(btn.getAttribute('data-nav'));
        });
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
