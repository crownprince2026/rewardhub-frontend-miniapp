"use strict";

const UI = {
    activeScreen: "auth",

    showScreen: function(name) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => { s.style.display = 'none'; s.classList.remove('active'); });
        const target = document.getElementById(name) || document.getElementById(name + "-screen");

        if (target) {
            target.style.display = 'flex';
            target.classList.add('active');
            this.activeScreen = name;
            return true;
        }
        return false;
    },

    renderDashboard: function(data) {
        const balanceEl = document.getElementById("balance");
        const earnedEl = document.getElementById("earned");
        if (balanceEl && data.balance !== undefined) balanceEl.innerText = `$${data.balance.toFixed(2)}`;
        if (earnedEl && data.earned !== undefined) earnedEl.innerText = `$${data.earned.toFixed(2)}`;
    },

    renderTasks: function(tasksArray) {
        const container = document.getElementById("tasks-container");
        if (!container) return;
        if (!tasksArray || tasksArray.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#94a3b8; padding:20px;">No tasks available.</p>';
            return;
        }
        container.innerHTML = tasksArray.map(task => `
            <div class="task-card" style="background:#1e293b; margin:10px; padding:15px; border-radius:12px; border:1px solid #334155; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h4 style="margin:0; color:white;">${task.title}</h4>
                    <small style="color:#10b981;">+$${(task.reward || 0).toFixed(2)}</small>
                </div>
                <button style="background:#3b82f6; color:white; border:none; padding:8px 15px; border-radius:8px;">View</button>
            </div>
        `).join('');
    },

    initNavigation: function(navCallback) {
        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.onclick = () => {
                const target = btn.getAttribute('data-nav');
                if (this.showScreen(target)) {
                    if (navCallback) navCallback(target);
                }
            };
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
