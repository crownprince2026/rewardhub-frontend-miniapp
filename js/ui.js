"use strict";

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
            return true;
        }
        return false;
    },

    renderDashboard: function() {
        // IDs are already in HTML, CSS handles the look
    },

    renderTasks: function() {
        const container = document.getElementById("tasks-container");
        if (!container) return;
        container.innerHTML = `
            <div style="background:#1e293b; padding:15px; border-radius:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <div><h4 style="margin:0;">Join Telegram</h4><small style="color:#10b981;">+$0.10</small></div>
                <button style="background:#3b82f6; color:white; border:none; padding:8px 15px; border-radius:8px;">Start</button>
            </div>
            <div style="background:#1e293b; padding:15px; border-radius:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <div><h4 style="margin:0;">Follow on X</h4><small style="color:#10b981;">+$0.05</small></div>
                <button style="background:#3b82f6; color:white; border:none; padding:8px 15px; border-radius:8px;">Start</button>
            </div>
        `;
    },

    renderRewards: function() {
        // The buttons are already in HTML, we just ensure they look good
    },

    renderWallet: function() {
        const summary = document.getElementById("wallet-summary");
        const withdraw = document.getElementById("withdraw-button");
        if (summary) {
            summary.innerHTML = `<div class="balance-card" style="margin-bottom:20px;"><p style="margin:0; opacity:0.8;">Wallet Balance</p><h1>$0.00</h1></div>`;
        }
        if (withdraw) {
            withdraw.innerHTML = `<div style="background:#1e293b; padding:20px; border-radius:15px; border:1px solid #334155;">
                <h3 style="margin-top:0;">Withdraw</h3>
                <input type="text" placeholder="Wallet Address" style="width:100%; background:#0f172a; color:white; border:1px solid #334155; padding:12px; border-radius:8px; margin-bottom:15px;">
                <button style="width:100%; background:#10b981; color:white; padding:15px; border-radius:12px; font-weight:bold; border:none;">Submit Withdrawal</button>
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
