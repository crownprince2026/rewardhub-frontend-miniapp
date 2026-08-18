"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - UI MODULE
   CLEAN RECONSTRUCTION - BLOCK 1
===================================================== */

import Wallet from "./wallet.js";
import State from "./state.js";

const UI = {
    initialized: false,
    activeScreen: "auth",
    activeModal: null,
    loading: false,
    cache: {}
};

/* =====================================================
   DOM HELPERS (Keeping Original Architecture)
===================================================== */
UI.$ = (selector, parent = document) => parent.querySelector(selector);
UI.$$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
UI.byId = (id) => document.getElementById(id);

UI.addClass = (el, className) => el?.classList.add(className);
UI.removeClass = (el, className) => el?.classList.remove(className);
UI.html = (el, value) => { if (el) el.innerHTML = value; };
UI.text = (el, value) => { if (el) el.textContent = value; };

/* =====================================================
   SCREEN MANAGER
===================================================== */
UI.showScreen = function(name) {
    console.log("Switching Screen:", name);
    const screens = this.$$('.screen');
    
    // Hide all
    screens.forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
        s.setAttribute('hidden', 'true');
    });

    // Find Target (Check for id="name" or id="name-screen")
    const target = this.byId(name) || this.byId(name + "-screen");

    if (target) {
        target.style.display = 'block';
        target.classList.add('active');
        target.removeAttribute('hidden');
        this.activeScreen = name;
        window.scrollTo(0, 0);
        return true;
    }
    console.error("UI: Screen not found ->", name);
    return false;
};

/* =====================================================
   MODULE RENDERERS (Professional Design)
===================================================== */

UI.renderDashboard = function(data = {}) {
    const balanceEl = this.byId("balance");
    const earnedEl = this.byId("earned");
    const referralEl = this.byId("referrals");

    if (balanceEl) this.text(balanceEl, `$${(data.balance || 0).toFixed(2)}`);
    if (earnedEl) this.text(earnedEl, `$${(data.earned || 0).toFixed(2)}`);
    if (referralEl) this.text(referralEl, data.referrals || "0");
};

UI.renderWallet = function() {
    const summary = this.byId("wallet-summary");
    const withdrawBtnContainer = this.byId("withdraw-button");

    if (summary) {
        summary.innerHTML = `
            <div class="wallet-card" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 25px; border-radius: 20px; color: white; text-align: center; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                <p style="margin:0; opacity: 0.8; font-size: 0.9rem;">Available Balance</p>
                <h1 style="margin: 10px 0; font-size: 2.5rem;">$${Wallet.getAvailableBalance().toFixed(2)}</h1>
                <div style="display: flex; justify-content: space-around; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; margin-top: 10px;">
                    <div><small>Pending</small><br><b>$${Wallet.getPendingBalance().toFixed(2)}</b></div>
                    <div><small>Earned</small><br><b>$${Wallet.getEarnedBalance().toFixed(2)}</b></div>
                </div>
            </div>
        `;
    }

    if (withdrawBtnContainer) {
        withdrawBtnContainer.innerHTML = `
            <div style="background: #1e293b; padding: 20px; border-radius: 15px; border: 1px solid #334155;">
                <h3 style="color: white; margin-bottom: 15px;">Withdraw Funds</h3>
                <select id="wd-method" style="width: 100%; background: #0f172a; color: white; border: 1px solid #334155; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                    <option value="USDT_BEP20">USDT (BEP20)</option>
                    <option value="BINANCE_PAY">Binance Pay</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                </select>
                <input type="text" id="wd-address" placeholder="Wallet Address / Account" style="width: 100%; background: #0f172a; color: white; border: 1px solid #334155; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <input type="number" id="wd-amount" placeholder="Amount (Min $1.00)" style="width: 100%; background: #0f172a; color: white; border: 1px solid #334155; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
                <button id="submit-wd" style="width: 100%; background: #10b981; color: white; padding: 15px; border-radius: 12px; font-weight: bold; border: none;">Confirm Withdrawal</button>
            </div>
        `;
        const btn = this.byId("submit-wd");
        if (btn) btn.onclick = () => this.handleWithdrawal();
    }
};

UI.handleWithdrawal = async function() {
    const amount = this.byId("wd-amount")?.value;
    const method = this.byId("wd-method")?.value;
    const address = this.byId("wd-address")?.value;

    if (!amount || !address) return alert("Please fill all fields");

    UI.showLoading("Processing...");
    const res = await Wallet.requestWithdrawal({ amount, method, walletAddress: address });
    UI.hideLoading();

    if (res.success) {
        alert("Withdrawal Requested Successfully!");
        this.renderWallet();
    } else {
        alert(res.message || "Withdrawal failed");
    }
};

/* =====================================================
   GLOBAL COMPONENTS & NAVIGATION
===================================================== */
UI.initNavigation = function(callback) {
    this.$$('[data-nav]').forEach(btn => {
        btn.onclick = () => {
            const target = btn.getAttribute('data-nav');
            if (this.showScreen(target) && callback) callback(target);
        };
    });
};

UI.showLoading = function(msg = "Loading...") {
    const loader = this.byId("loading-overlay");
    const text = this.$(".loading-message", loader) || this.$(".loading-text", loader);
    if (text) text.textContent = msg;
    if (loader) {
        loader.style.display = "flex";
        loader.classList.remove("hidden");
    }
};

UI.hideLoading = function() {
    const loader = this.byId("loading-overlay");
    if (loader) {
        loader.style.display = "none";
        loader.classList.add("hidden");
    }
};

UI.openAuth = function() { this.showScreen("auth"); };
UI.openSplash = function() { this.showScreen("splash"); };
UI.openDashboard = function() { this.showScreen("dashboard"); };

export default UI;
