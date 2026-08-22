"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - UI MODULE
   CLEAN RECONSTRUCTION - PHASE 5 (ORCHESTRATION)
===================================================== */

import Wallet from "./wallet.js";
import Tasks from "./tasks.js";
import Profile from "./profile.js";
import Rewards from "./rewards.js";
import State from "./state.js";
import Utils from "./utils.js";

const UI = {
    activeScreen: "auth-screen",
    initialized: false
};

/* =====================================================
   SCREEN MANAGER
===================================================== */

UI.showScreen = function(name) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => { 
        s.style.display = 'none'; 
        s.classList.remove('active'); 
    });

    // Handle name format (supports both 'wallet' and 'wallet-screen')
    const targetId = name.endsWith('-screen') ? name : `${name}-screen`;
    const target = document.getElementById(targetId);

    if (target) {
        target.style.display = 'flex'; 
        target.classList.add('active');
        this.activeScreen = targetId;

        // Auto-show/hide Bottom Navigation
        const nav = document.querySelector('.bottom-nav');
        if (targetId.includes('auth') || targetId.includes('splash')) {
            nav?.classList.remove('visible');
        } else {
            nav?.classList.add('visible');
        }
        
        window.scrollTo(0, 0);
        return true;
    }
    console.error("UI Error: Screen not found ->", targetId);
    return false;
};

/* =====================================================
   MODULE RENDERERS (Professional Designs)
===================================================== */

// --- DASHBOARD ---
UI.renderDashboard = function() {
    const user = State.getUser();
    const stats = Profile.getStatistics();
    
    const balanceEl = document.getElementById("balance");
    const earnedEl = document.getElementById("earned");
    const referralEl = document.getElementById("referrals");

    if (balanceEl) balanceEl.innerText = Utils.formatCurrency(Wallet.getAvailableBalance());
    if (earnedEl) earnedEl.innerText = Utils.formatCurrency(stats.totalEarned || 0);
    if (referralEl) referralEl.innerText = stats.referrals || 0;
};

// --- TASKS ---
UI.renderTasks = function() {
    const container = document.getElementById("tasks-container");
    if (!container) return;

    const allTasks = Tasks.getTasks();
    if (!allTasks || allTasks.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px;">
                <h3 style="color:var(--text-dim);">No tasks available right now</h3>
                <button onclick="location.reload()" style="background:var(--primary); color:white; padding:10px 20px; border-radius:10px; border:none; margin-top:15px;">Refresh</button>
            </div>`;
        return;
    }

    container.innerHTML = allTasks.map(task => `
        <div class="reward-card" style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:12px; text-align:left;">
            <div>
                <h4 style="margin:0;">${task.title}</h4>
                <small style="color:var(--accent); font-weight:bold;">+${Utils.formatCurrency(task.reward)}</small>
            </div>
            <button style="background:var(--primary); color:white; border:none; padding:8px 15px; border-radius:8px; font-weight:bold;">Start</button>
        </div>
    `).join('');
};

// --- WALLET ---
UI.renderWallet = function() {
    const summary = document.getElementById("wallet-summary");
    const withdraw = document.getElementById("withdraw-button");

    if (summary) {
        summary.innerHTML = `
            <div class="balance-card">
                <p style="margin:0; opacity:0.8; font-size:0.9rem;">Available Balance</p>
                <h1>${Utils.formatCurrency(Wallet.getAvailableBalance())}</h1>
                <div style="display:flex; justify-content:space-around; margin-top:15px; border-top:1px solid rgba(255,255,255,0.2); padding-top:10px;">
                    <div><small>Pending</small><br><b>${Utils.formatCurrency(Wallet.getPendingBalance())}</b></div>
                    <div><small>Earned</small><br><b>${Utils.formatCurrency(Wallet.getEarnedBalance())}</b></div>
                </div>
            </div>`;
    }

    if (withdraw) {
        withdraw.innerHTML = `
            <div style="background:var(--surface); padding:20px; border-radius:16px; border:1px solid var(--surface-light);">
                <h3 style="margin-top:0;">Withdraw Funds</h3>
                <label style="font-size:0.8rem; color:var(--text-dim);">Method</label>
                <select id="wd-method"><option value="USDT">USDT (BEP20)</option><option value="BINANCE">Binance Pay</option></select>
                <label style="font-size:0.8rem; color:var(--text-dim); margin-top:15px; display:block;">Wallet Address</label>
                <input type="text" id="wd-address" placeholder="Enter address...">
                <button id="submit-wd" style="width:100%; background:var(--accent); color:white; padding:15px; border-radius:12px; font-weight:bold; border:none; margin-top:20px;">Request Withdrawal</button>
            </div>`;
        
        document.getElementById("submit-wd").onclick = () => this.handleWithdrawal();
    }
};

UI.handleWithdrawal = async function() {
    const amount = prompt("Enter amount to withdraw (Min $1.00):");
    const address = document.getElementById("wd-address").value;
    if (!amount || !address) return this.toast("Please fill all fields", "error");
    
    this.showLoading("Processing...");
    const res = await Wallet.requestWithdrawal({ amount, walletAddress: address, method: document.getElementById("wd-method").value });
    this.hideLoading();
    
    if (res.success) {
        this.toast("Withdrawal Requested!", "success");
        this.renderWallet();
    } else {
        alert(res.message);
    }
};

// --- PROFILE ---
UI.renderProfile = function() {
    const stats = Profile.getStatistics();
    const statsContainer = document.getElementById("profile-statistics");
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stats" style="margin-top:20px;">
                <div class="stat-card"><h4>Level</h4><span>${stats.level || 1}</span></div>
                <div class="stat-card"><h4>XP</h4><span>${stats.xp || 0}</span></div>
            </div>`;
    }
};

/* =====================================================
   GLOBAL COMPONENTS
===================================================== */

UI.toast = function(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.style.cssText = "background:#1e293b; color:white; padding:12px 20px; border-radius:10px; margin-top:10px; border-left:5px solid var(--primary); box-shadow:0 5px 15px rgba(0,0,0,0.3);";
    if (type === "success") toast.style.borderLeftColor = "var(--accent)";
    if (type === "error") toast.style.borderLeftColor = "red";
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

UI.showLoading = function(msg = "Loading...") {
    const loader = document.getElementById('loading-overlay');
    const text = loader?.querySelector('.loading-text');
    if (text) text.innerText = msg;
    if (loader) loader.style.display = 'flex';
};

UI.hideLoading = function() {
    const loader = document.getElementById('loading-overlay');
    if (loader) loader.style.display = 'none';
};

UI.initNavigation = function(callback) {
    document.querySelectorAll('[data-nav]').forEach(btn => {
        btn.onclick = () => {
            const target = btn.getAttribute('data-nav');
            if (this.showScreen(target) && callback) callback(target);
        };
    });
};

UI.openAuth = function() { this.showScreen("auth-screen"); };
UI.openSplash = function() { this.showScreen("splash-screen"); };
UI.openDashboard = function() { this.showScreen("dashboard-screen"); };

export default UI;
