"use strict";
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
    renderDashboard: function(data) {
        const balanceEl = document.getElementById("balance");
        const earnedEl = document.getElementById("earned");
        if (balanceEl) balanceEl.innerText = `$${(data.balance || 0).toFixed(2)}`;
        if (earnedEl) earnedEl.innerText = `$${(data.earned || 0).toFixed(2)}`;
    },
    renderWallet: function() {
        const summary = document.getElementById("wallet-summary");
        const form = document.getElementById("withdraw-button");
        if (summary) {
            summary.innerHTML = `
                <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 20px; border-radius: 15px; color: white; text-align: center; margin-bottom: 20px;">
                    <p style="margin:0; opacity: 0.8;">Available Balance</p>
                    <h1 style="margin: 5px 0;">$${Wallet.getAvailableBalance().toFixed(2)}</h1>
                </div>`;
        }
        if (form) {
            form.innerHTML = `
                <div style="background: #1e293b; padding: 15px; border-radius: 12px;">
                    <h3 style="color:white;">Withdraw</h3>
                    <select id="wd-method" style="width:100%; margin-bottom:10px; padding:10px; border-radius:8px;">
                        <option value="USDT_BEP20">USDT (BEP20)</option>
                        <option value="BINANCE_PAY">Binance Pay</option>
                    </select>
                    <input type="text" id="wd-address" placeholder="Wallet Address" style="width:100%; margin-bottom:10px; padding:10px; border-radius:8px;">
                    <input type="number" id="wd-amount" placeholder="Amount" style="width:100%; margin-bottom:15px; padding:10px; border-radius:8px;">
                    <button id="submit-wd" style="width:100%; background:#10b981; color:white; padding:12px; border-radius:10px; font-weight:bold; border:none;">Confirm</button>
                </div>`;
            document.getElementById("submit-wd").onclick = () => this.handleWithdrawal();
        }
    },
    handleWithdrawal: async function() {
        const amount = document.getElementById("wd-amount").value;
        const address = document.getElementById("wd-address").value;
        if(!amount || !address) return alert("Fill all fields");
        const res = await Wallet.requestWithdrawal({ amount, method: document.getElementById("wd-method").value, walletAddress: address });
        alert(res.message || (res.success ? "Success!" : "Failed"));
        if(res.success) this.renderWallet();
    },
    initNavigation: function(navCallback) {
        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.onclick = () => {
                const target = btn.getAttribute('data-nav');
                if (this.showScreen(target) && navCallback) navCallback(target);
            };
        });
    },
    openAuth: function() { this.showScreen("auth"); },
    openSplash: function() { this.showScreen("splash"); },
    openDashboard: function() { this.showScreen("dashboard"); },
    hideLoading: function() { const l = document.getElementById('loading-overlay'); if(l) l.style.display = 'none'; }
};
export default UI;
