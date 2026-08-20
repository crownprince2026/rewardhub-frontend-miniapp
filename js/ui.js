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

            const nav = document.querySelector('.bottom-nav');
            if (name.includes('auth') || name.includes('splash')) {
                nav?.classList.remove('visible');
            } else {
                nav?.classList.add('visible');
            }
            return true;
        }
        return false;
    },

    renderDashboard: function(data = {}) {
        const bal = document.getElementById("balance");
        if (bal) bal.innerText = "$" + (data.balance || 0).toFixed(2);
    },

    renderTasks: function() {
        const container = document.getElementById("tasks-container");
        if (container) container.innerHTML = '<p style="text-align:center; padding:20px;">Tasks module disconnected for repair.</p>';
    },

    renderWallet: function() {
        const summary = document.getElementById("wallet-summary");
        if (summary) summary.innerHTML = '<div class="balance-card"><h1>$0.00</h1><p>Wallet module disconnected</p></div>';
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
