"use strict";
import Profile from "./profile.js";
import Wallet from "./wallet.js";

const UI = {
    activeScreen: "auth",

    showScreen: function(name) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => { s.style.display = 'none'; s.classList.remove('active'); });
        const target = document.getElementById(name) || document.getElementById(name + "-screen");

        if (target) {
            target.style.display = 'block';
            target.classList.add('active');
            this.activeScreen = name;
            this.loadScreenData(name);
            return true;
        }
        return false;
    },

    loadScreenData: function(name) {
        if (name === "dashboard") this.renderDashboard();
        if (name === "wallet") this.renderWallet();
        if (name === "rewards") this.renderRewards();
    },

    renderDashboard: function() {
        const stats = Profile.getStatistics();
        const balanceEl = document.getElementById("balance");
        if (balanceEl) balanceEl.innerText = `$${Wallet.getAvailableBalance().toFixed(2)}`;
        const earnedEl = document.getElementById("earned");
        if (earnedEl) earnedEl.innerText = `$${stats.totalEarned.toFixed(2)}`;
    },

    renderRewards: function() {
        // Find the Daily Bonus Card
        const dailyBtn = document.getElementById("daily-bonus-card");
        if (dailyBtn) {
            dailyBtn.onclick = async () => {
                const res = await Wallet.claimDailyBonus();
                if (res.success) {
                    alert(`Success! You earned $${res.reward}`);
                    this.renderDashboard(); // Refresh balance
                } else {
                    alert(res.message);
                }
            };
        }
    },

    renderWallet: function() {
        const container = document.getElementById("wallet-summary");
        if (container) {
            container.innerHTML = `
                <div style="background:linear-gradient(135deg, #1e293b, #0f172a); padding:20px; border-radius:15px; text-align:center;">
                    <h3 style="color:#94a3b8; font-size:0.9rem;">Available Balance</h3>
                    <h1 style="color:#10b981; font-size:2.5rem; margin:10px 0;">$${Wallet.getAvailableBalance().toFixed(2)}</h1>
                </div>
            `;
        }
    },

    initNavigation: function() {
        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.onclick = () => this.showScreen(btn.getAttribute('data-nav'));
        });
    },

    openAuth: function() { this.showScreen("auth"); },
    openSplash: function() { this.showScreen("splash"); },
    openDashboard: function() { this.showScreen("dashboard"); },
    hideLoading: function() { document.getElementById('loading-overlay').style.display = 'none'; }
};

export default UI;
