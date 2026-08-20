"use strict";
import Wallet from "./wallet.js";
import Tasks from "./tasks.js";

const UI = {
    activeScreen: "auth-screen",

    showScreen: function(name) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => { s.style.display = 'none'; s.classList.remove('active'); });

        const target = document.getElementById(name) || document.getElementById(name + "-screen");
        if (target) {
            target.style.display = 'flex'; 
            target.classList.add('active');
            this.activeScreen = name;

            // SMART NAV: Hide on Auth/Splash, Show on others
            const nav = document.querySelector('.bottom-nav');
            if (name.includes('auth') || name.includes('splash')) {
                nav.classList.remove('visible');
            } else {
                nav.classList.add('visible');
            }
            return true;
        }
        return false;
    },

    renderDashboard: function() {
        const bal = document.getElementById("balance");
        if (bal) bal.innerText = "$" + Wallet.getAvailableBalance().toFixed(2);
    },

    renderTasks: function() {
        const container = document.getElementById("tasks-container");
        if (!container) return;
        
        const allTasks = Tasks.getTasks();
        if (!allTasks || allTasks.length === 0) {
            container.innerHTML = `
                <div style="margin-top:50px; text-align:center;">
                    <div style="font-size: 50px;">📋</div>
                    <h3 style="color:white;">No Tasks Available</h3>
                    <p style="color:#94a3b8;">Check back later for new rewards.</p>
                    <button onclick="location.reload()" style="background:#3b82f6; color:white; border:none; padding:12px 25px; border-radius:10px; margin-top:15px;">Refresh</button>
                </div>`;
            return;
        }
        // ... (Task loop if tasks exist)
    },

    renderWallet: function() {
        const summary = document.getElementById("wallet-summary");
        if (summary) {
            summary.innerHTML = `
                <div class="balance-card">
                    <p style="margin:0; opacity:0.8;">Wallet Balance</p>
                    <h1 style="font-size:2.8rem;">$${Wallet.getAvailableBalance().toFixed(2)}</h1>
                </div>`;
        }
    },

    initNavigation: function(callback) {
        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.onclick = () => {
                const target = btn.getAttribute('data-nav');
                if (this.showScreen(target) && callback) callback(target);
            };
        });
    },

    hideLoading: function() { 
        const loader = document.getElementById('loading-overlay');
        if(loader) loader.style.display = 'none';
    }
};

export default UI;
