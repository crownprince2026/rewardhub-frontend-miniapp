
"use strict";
import Wallet from "./wallet.js";

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
        const bal = document.getElementById("balance");
        const earn = document.getElementById("earned");
        if (bal) bal.innerText = "$" + Wallet.getAvailableBalance().toFixed(2);
        if (earn) earn.innerText = "$" + Wallet.getEarnedBalance().toFixed(2);
    },
    renderWallet: function() {
        const summary = document.getElementById("wallet-summary");
        const withdraw = document.getElementById("withdraw-button");
        if (summary) {
            summary.innerHTML = `<div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);padding:25px;border-radius:20px;color:white;text-align:center;margin-bottom:20px;"><p style="margin:0;opacity:0.8;">Available Balance</p><h1 style="margin:10px 0;font-size:2.5rem;">$${Wallet.getAvailableBalance().toFixed(2)}</h1></div>`;
        }
        if (withdraw) {
            withdraw.innerHTML = `<div style="background:#1e293b;padding:20px;border-radius:15px;border:1px solid #334155;"><h3 style="color:white;margin-bottom:15px;">Withdraw</h3><select id="wd-method" style="width:100%;background:#0f172a;color:white;border:1px solid #334155;padding:12px;border-radius:8px;margin-bottom:15px;"><option value="USDT_BEP20">USDT (BEP20)</option><option value="BINANCE_PAY">Binance Pay</option></select><input type="text" id="wd-address" placeholder="Address" style="width:100%;background:#0f172a;color:white;border:1px solid #334155;padding:12px;border-radius:8px;margin-bottom:15px;"><input type="number" id="wd-amount" placeholder="Amount" style="width:100%;background:#0f172a;color:white;border:1px solid #334155;padding:12px;border-radius:8px;margin-bottom:20px;"><button id="submit-wd" style="width:100%;background:#10b981;color:white;padding:15px;border-radius:12px;font-weight:bold;border:none;">Confirm</button></div>`;
            document.getElementById("submit-wd").onclick = () => this.handleWithdrawal();
        }
    },
    handleWithdrawal: async function() {
        const amount = document.getElementById("wd-amount").value;
        const address = document.getElementById("wd-address").value;
        const method = document.getElementById("wd-method").value;
        if(!amount || !address) return alert("Fill all fields");
        const res = await Wallet.requestWithdrawal({ amount, method, walletAddress: address });
        alert(res.message || (res.success ? "Success!" : "Error"));
        if(res.success) this.renderWallet();
    },
    initNavigation: function(callback) {
        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.onclick = () => {
                const target = btn.getAttribute('data-nav');
                if (this.showScreen(target) && callback) callback(target);
            };
        });
    },
    openAuth: function() { this.showScreen("auth-screen"); },
    openSplash: function() { this.showScreen("splash-screen"); },
    openDashboard: function() { this.showScreen("dashboard-screen"); },
    hideLoading: function() {
        const loader = document.getElementById('loading-overlay');
        if(loader) loader.style.display = 'none';
    }
};
export default UI;

