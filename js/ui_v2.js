"use strict";
import Wallet from "./wallet_v2.js";

const UI = {
    activeScreen: "auth",

    // This function is the "Brain" of the visuals
    showScreen: function(name) {
        // Log progress to the blue bar
        const debug = document.getElementById('debug-check');
        if(debug) debug.innerText = "LOG: Showing " + name;

        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });

        // Search for the screen using 3 different methods to be 100% sure
        const target = document.getElementById(name) || 
                       document.getElementById(name + "-screen") || 
                       document.querySelector(`[data-screen="${name}"]`);

        if (target) {
            // Use FLEX so the logos stay centered!
            target.style.display = 'flex'; 
            target.classList.add('active');
            this.activeScreen = name;
            return true;
        }
        
        if(debug) debug.innerText = "ERR: Screen not found: " + name;
        return false;
    },

    renderDashboard: function(data) {
        const balanceEl = document.getElementById("balance");
        const earnedEl = document.getElementById("earned");
        if (balanceEl) balanceEl.innerText = `$${(data.balance || 0).toFixed(2)}`;
        if (earnedEl) earnedEl.innerText = `$${(data.earned || 0).toFixed(2)}`;
    },

    renderWallet: function() {
        const summary = document.getElementById("wallet-summary");
        if (summary) {
            summary.innerHTML = `
                <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 25px; border-radius: 20px; color: white; text-align: center;">
                    <p style="margin:0; opacity: 0.8;">Available Balance</p>
                    <h1 style="margin: 10px 0; font-size: 2.5rem;">$${Wallet.getAvailableBalance().toFixed(2)}</h1>
                </div>`;
        }
    },

    initNavigation: function(callback) {
        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.onclick = () => {
                const target = btn.getAttribute('data-nav').replace('-screen', '');
                if (this.showScreen(target) && callback) callback(target);
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
