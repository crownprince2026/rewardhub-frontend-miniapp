"use strict";
import State from "./state.js";

const UI = {
    activeScreen: "auth",

    showScreen: function(name) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => { s.style.display = 'none'; s.classList.remove('active'); });

        const target = document.getElementById(name) || 
                       document.getElementById(name + "-screen") ||
                       document.querySelector(`[data-screen="${name}"]`);

        if (target) {
            target.style.display = 'block';
            target.classList.add('active');
            this.activeScreen = name;
            this.loadScreenData(name);
            window.scrollTo(0, 0);
            return true;
        }
        return false;
    },

    loadScreenData: function(name) {
        // We only render if the screen is active
        if (name === "dashboard") this.renderDashboard();
        if (name === "tasks") this.renderTasks();
        if (name === "wallet") this.renderWallet();
    },

    // REAL DATA RENDER: DASHBOARD
    renderDashboard: function() {
        const user = State.getUser();
        const balanceEl = document.getElementById("balance");
        const earnedEl = document.getElementById("earned");
        const referralEl = document.getElementById("referrals");

        if (user) {
            // These field names depend on what your API returns (e.g., user.balance)
            if (balanceEl) balanceEl.innerText = `$${user.balance || "0.00"}`;
            if (earnedEl) earnedEl.innerText = `$${user.total_earned || "0.00"}`;
            if (referralEl) referralEl.innerText = user.referral_count || "0";
        }
    },

    // Keep these as placeholders until we inspect their modules
    renderTasks: function() { console.log("Tasks module connection pending..."); },
    renderWallet: function() { console.log("Wallet module connection pending..."); },

    initNavigation: function() {
        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.addEventListener('click', () => this.showScreen(btn.getAttribute('data-nav')));
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
