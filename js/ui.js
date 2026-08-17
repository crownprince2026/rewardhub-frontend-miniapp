"use strict";
import Profile from "./profile.js";
import Wallet from "./wallet.js";
import Tasks from "./tasks.js";

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
        if (name === "tasks") this.renderTasks();
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

    renderTasks: function() {
        const container = document.getElementById("tasks-container");
        if (!container) return;

        const allTasks = Tasks.getTasks();
        
        if (allTasks.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#64748b; padding:20px;">No tasks available right now.</p>';
            return;
        }

        container.innerHTML = allTasks.map(task => `
            <div class="task-card" style="background:#1e293b; margin:10px; padding:15px; border-radius:12px; border:1px solid #334155;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h4 style="margin:0; color:white;">${task.title}</h4>
                        <small style="color:#10b981; font-weight:bold;">+ $${task.reward.toFixed(2)}</small>
                    </div>
                    <button class="task-btn" style="background:#3b82f6; color:white; border:none; padding:8px 15px; border-radius:8px;">View</button>
                </div>
            </div>
        `).join('');
    },

    renderRewards: function() {
        const dailyBtn = document.getElementById("daily-bonus-card");
        if (dailyBtn) {
            dailyBtn.onclick = async () => {
                const res = await Wallet.claimDailyBonus();
                if (res.success) { alert(`Success! Earned $${res.reward}`); this.renderDashboard(); }
                else { alert(res.message); }
            };
        }
    },

    renderWallet: function() {
        const container = document.getElementById("wallet-summary");
        if (container) {
            container.innerHTML = `<div style="background:#1e293b; padding:20px; border-radius:15px; text-align:center;">
                <h1 style="color:#10b981; font-size:2.5rem; margin:0;">$${Wallet.getAvailableBalance().toFixed(2)}</h1>
            </div>`;
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
