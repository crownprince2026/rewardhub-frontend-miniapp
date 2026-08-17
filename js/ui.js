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
        if (name === "profile") this.renderProfile();
    },

    renderDashboard: function() {
        const stats = Profile.getStatistics();
        const balanceEl = document.getElementById("balance");
        if (balanceEl) balanceEl.innerText = `$${Wallet.getAvailableBalance().toFixed(2)}`;
        
        const earnedEl = document.getElementById("earned");
        if (earnedEl) earnedEl.innerText = `$${stats.totalEarned.toFixed(2)}`;
    },

    renderWallet: function() {
        // 1. Render Balance Card
        const summaryContainer = document.getElementById("wallet-summary");
        if (summaryContainer) {
            summaryContainer.innerHTML = `
                <div style="background:linear-gradient(135deg, #1e293b, #0f172a); padding:20px; border-radius:15px; text-align:center; margin-bottom:20px;">
                    <h3 style="color:#94a3b8; font-size:0.9rem;">Available Balance</h3>
                    <h1 style="color:#10b981; font-size:2.5rem; margin:10px 0;">$${Wallet.getAvailableBalance().toFixed(2)}</h1>
                </div>
            `;
        }

        // 2. Render Transaction History
        const historyContainer = document.getElementById("wallet-history");
        if (historyContainer) {
            const txs = Wallet.getRecentTransactions();
            if (txs.length === 0) {
                historyContainer.innerHTML = '<p style="text-align:center; color:#64748b; padding:20px;">No transactions yet.</p>';
            } else {
                historyContainer.innerHTML = '<h3 style="padding:10px; color:white;">Recent Transactions</h3>' + 
                txs.map(tx => `
                    <div style="display:flex; justify-content:space-between; padding:15px; border-bottom:1px solid #1e293b;">
                        <div>
                            <div style="color:white; font-weight:bold;">${tx.type.replace('_', ' ')}</div>
                            <small style="color:#64748b;">${new Date(tx.createdAt).toLocaleDateString()}</small>
                        </div>
                        <div style="color:${tx.amount > 0 ? '#10b981' : '#ef4444'}; font-weight:bold;">
                            ${tx.amount > 0 ? '+' : ''}$${Math.abs(tx.amount).toFixed(2)}
                        </div>
                    </div>
                `).join('');
            }
        }
    },

    renderProfile: function() {
        const nameEl = document.querySelector(".profile-name");
        if (nameEl) nameEl.innerText = Profile.getDisplayName();
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
