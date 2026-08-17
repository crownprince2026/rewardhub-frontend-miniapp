"use strict";
import Profile from "./profile.js";
import Wallet from "./wallet.js";

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

    renderDashboard: function() {
        const stats = Profile.getStatistics();
        const available = Wallet.getAvailableBalance();
        const pending = Wallet.getPendingBalance();

        const balanceEl = document.getElementById("balance");
        const earnedEl = document.getElementById("earned");
        const referralEl = document.getElementById("referrals");

        // Update main balance
        if (balanceEl) balanceEl.innerText = `$${available.toFixed(2)}`;
        
        // Show pending money if there is any
        if (pending > 0) {
            if (balanceEl) balanceEl.innerHTML += `<br><small style="font-size:0.8rem; color:#facc15;">Pending: $${pending.toFixed(2)}</small>`;
        }

        if (earnedEl) earnedEl.innerText = `$${stats.totalEarned.toFixed(2)}`;
        if (referralEl) referralEl.innerText = stats.referrals;
    },

    renderWallet: function() {
        const container = document.getElementById("wallet-summary");
        if (container) {
            container.innerHTML = `
                <div class="wallet-card" style="background:linear-gradient(135deg, #1e293b, #0f172a); padding:25px; border-radius:20px; text-align:center; border: 1px solid #334155;">
                    <h3 style="color:#94a3b8; margin:0;">Available Balance</h3>
                    <h1 style="font-size:3rem; color:#10b981; margin:10px 0;">$${Wallet.getAvailableBalance().toFixed(2)}</h1>
                    <p style="color:#64748b;">Pending: $${Wallet.getPendingBalance().toFixed(2)}</p>
                    <button id="withdraw-now-btn" style="width:100%; background:#3b82f6; color:white; padding:15px; border-radius:12px; font-weight:bold; border:none; margin-top:10px;">Withdraw Funds</button>
                </div>
            `;
        }
    },

    renderProfile: function() {
        const profile = Profile.getProfile();
        const nameEl = document.querySelector(".profile-name");
        const idEl = document.querySelector(".profile-id");
        if (nameEl) nameEl.innerText = Profile.getDisplayName();
        if (idEl) idEl.innerText = `ID: ${profile.telegramId || 'N/A'}`;
    },

    renderTasks: function() { console.log("Tasks module pending..."); },

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
