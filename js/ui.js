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
            return true;
        }
        return false;
    },

    // We now accept the "tasks" array as a parameter
    renderTasks: function(tasksArray) {
        const container = document.getElementById("tasks-container");
        if (!container || !tasksArray) return;

        if (tasksArray.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#64748b; padding:20px;">No tasks available.</p>';
            return;
        }

        container.innerHTML = tasksArray.map(task => `
            <div class="task-card" style="background:#1e293b; margin:10px; padding:15px; border-radius:12px; border:1px solid #334155;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div><h4 style="margin:0; color:white;">${task.title}</h4></div>
                    <button style="background:#3b82f6; color:white; border:none; padding:8px 15px; border-radius:8px;">View</button>
                </div>
            </div>
        `).join('');
    },

    renderDashboard: function() {
        const stats = Profile.getStatistics();
        const balanceEl = document.getElementById("balance");
        if (balanceEl) balanceEl.innerText = `$${Wallet.getAvailableBalance().toFixed(2)}`;
    },

    initNavigation: function() {
        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.onclick = () => {
                const target = btn.getAttribute('data-nav');
                this.showScreen(target);
                // We will handle data loading in app.js
            };
        });
    },

    openAuth: function() { this.showScreen("auth"); },
    openSplash: function() { this.showScreen("splash"); },
    openDashboard: function() { this.showScreen("dashboard"); },
    hideLoading: function() { document.getElementById('loading-overlay').style.display = 'none'; }
};

export default UI;
