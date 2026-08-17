"use strict";
import Profile from "./profile.js";

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
        if (name === "dashboard") this.renderDashboard();
        if (name === "tasks") this.renderTasks();
        if (name === "wallet") this.renderWallet();
        if (name === "profile") this.renderProfile();
    },

    // REAL DATA: DASHBOARD (Connecting to Profile.js)
    renderDashboard: function() {
        const stats = Profile.getStatistics();
        const balanceEl = document.getElementById("balance");
        const earnedEl = document.getElementById("earned");
        const referralEl = document.getElementById("referrals");

        // Profile.js stores 'totalEarned' in statistics
        if (earnedEl) earnedEl.innerText = `$${stats.totalEarned.toFixed(2)}`;
        if (referralEl) referralEl.innerText = stats.referrals;
        
        // Balance usually comes from the Wallet module (next step)
        // For now, we use earned minus withdrawn if available
        if (balanceEl) {
            const currentBalance = stats.totalEarned - stats.totalWithdrawn;
            balanceEl.innerText = `$${currentBalance.toFixed(2)}`;
        }
    },

    renderProfile: function() {
        const profile = Profile.getProfile();
        const stats = Profile.getStatistics();
        const nameEl = document.querySelector(".profile-name");
        const idEl = document.querySelector(".profile-id");

        if (nameEl) nameEl.innerText = Profile.getDisplayName();
        if (idEl) idEl.innerText = `ID: ${profile.telegramId || 'N/A'}`;
    },

    renderTasks: function() { console.log("Tasks module pending..."); },
    renderWallet: function() { console.log("Wallet module pending..."); },

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
