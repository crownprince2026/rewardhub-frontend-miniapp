"use strict";

const UI = {
    activeScreen: "auth",

    showScreen: function(name) {
        console.log("Navigating to:", name);
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });

        const target = document.getElementById(name) || 
                       document.getElementById(name + "-screen") ||
                       document.querySelector(`[data-screen="${name}"]`);

        if (target) {
            target.style.display = 'block';
            target.classList.add('active');
            this.activeScreen = name;
            
            // NEW: Trigger data loading based on screen name
            this.loadScreenData(name);
            
            window.scrollTo(0, 0);
            return true;
        }
        return false;
    },

    // This function decides what data to show on each screen
    loadScreenData: function(name) {
        if (name === "tasks" || name === "tasks-screen") {
            this.renderTasks();
        } else if (name === "dashboard") {
            this.renderDashboard();
        } else if (name === "wallet") {
            this.renderWallet();
        }
    },

    // RENDER TASKS
    renderTasks: function() {
        const container = document.getElementById("tasks-container");
        if (!container) return;

        const tasks = [
            { id: 1, title: "Join Telegram Channel", reward: "$0.10", icon: "📢" },
            { id: 2, title: "Follow on X (Twitter)", reward: "$0.05", icon: "🐦" },
            { id: 3, title: "Watch 30s Video Ad", reward: "$0.02", icon: "📺" },
            { id: 4, title: "Invite 1 Friend", reward: "$0.50", icon: "👥" }
        ];

        container.innerHTML = tasks.map(task => `
            <div class="task-card" style="background:#1e293b; margin:10px; padding:15px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:1.5rem;">${task.icon}</span>
                    <div>
                        <h4 style="margin:0; color:white;">${task.title}</h4>
                        <small style="color:#94a3b8;">Reward: ${task.reward}</small>
                    </div>
                </div>
                <button onclick="alert('Task Started!')" style="background:#3b82f6; color:white; border:none; padding:8px 15px; border-radius:8px;">Start</button>
            </div>
        `).join('');
    },

    // RENDER DASHBOARD (Balance & Stats)
    renderDashboard: function() {
        const balanceEl = document.getElementById("balance");
        if (balanceEl) balanceEl.innerText = "$12.50"; // Mock Balance
        
        const earnedEl = document.getElementById("earned");
        if (earnedEl) earnedEl.innerText = "$45.00";
    },

    // RENDER WALLET
    renderWallet: function() {
        const container = document.getElementById("wallet-summary");
        if (!container) return;
        container.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <h2 style="color:#94a3b8;">Available Balance</h2>
                <h1 style="font-size:3rem; color:#10b981;">$12.50</h1>
                <button style="width:100%; background:#3b82f6; color:white; padding:15px; border-radius:12px; font-weight:bold; margin-top:10px;">Withdraw Funds</button>
            </div>
        `;
    },

    initNavigation: function() {
        const navButtons = document.querySelectorAll('[data-nav]');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetScreen = btn.getAttribute('data-nav');
                this.showScreen(targetScreen);
                navButtons.forEach(b => b.style.opacity = "0.6");
                btn.style.opacity = "1";
            });
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
