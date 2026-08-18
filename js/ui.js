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
        if (!summary) return;

        summary.innerHTML = `
            <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 25px; border-radius: 20px; color: white; text-align: center; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                <p style="margin:0; opacity: 0.8; font-size: 0.9rem;">Available Balance</p>
                <h1 style="margin: 10px 0; font-size: 2.5rem;">$${Wallet.getAvailableBalance().toFixed(2)}</h1>
                <div style="display: flex; justify-content: space-around; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; margin-top: 10px;">
                    <div><small>Pending</small><br><b>$${Wallet.getPendingBalance().toFixed(2)}</b></div>
                    <div><small>Withdrawn</small><br><b>$${Wallet.getSpentBalance().toFixed(2)}</b></div>
                </div>
            </div>
        `;

        const formContainer = document.getElementById("withdraw-button");
        if (formContainer) {
            formContainer.innerHTML = `
                <div style="background: #1e293b; padding: 20px; border-radius: 15px; border: 1px solid #334155;">
                    <h3 style="color: white; margin-bottom: 15px;">Withdraw Funds</h3>
                    <label style="color: #94a3b8; font-size: 0.8rem;">Select Method</label>
                    <select id="wd-method" style="width: 100%; background: #0f172a; color: white; border: 1px solid #334155; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                        <option value="USDT_BEP20">USDT (BEP20)</option>
                        <option value="BINANCE_PAY">Binance Pay</option>
                        <option value="MOBILE_MONEY">Mobile Money</option>
                    </select>
                    <input type="text" id="wd-address" placeholder="Wallet Address..." style="width: 100%; background: #0f172a; color: white; border: 1px solid #334155; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                    <input type="number" id="wd-amount" placeholder="Amount..." style="width: 100%; background: #0f172a; color: white; border: 1px solid #334155; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
                    <button id="submit-wd" style="width: 100%; background: #10b981; color: white; padding: 15px; border-radius: 12px; font-weight: bold; border: none;">Confirm Withdrawal</button>
                </div>
            `;
            document.getElementById("submit-wd").onclick = () => this.handleWithdrawal();
        }
    },

    handleWithdrawal: async function() {
        const amount = document.getElementById("wd-amount").value;
        const method = document.getElementById("wd-method").value;
        const address = document.getElementById("wd-address").value;
        if(!amount || !address) return alert("Please fill all fields");
        const res = await Wallet.requestWithdrawal({ amount, method, walletAddress: address });
        if(res.success) {
            alert("Withdrawal Requested!");
            this.renderWallet();
        } else {
            alert(res.message);
        }
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
