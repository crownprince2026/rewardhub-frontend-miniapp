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
            summary.innerHTML = `
                <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 25px; border-radius: 20px; color: white; text-align: center; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                    <p style="margin:0; opacity: 0.8; font-size: 0.9rem;">Available Balance</p>
                    <h1 style="margin: 10px 0; font-size: 2.5rem;">$${Wallet.getAvailableBalance().toFixed(2)}</h1>
                    <div style="display: flex; justify-content: space-around; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; margin-top: 10px;">
                        <div><small>Pending</small><br><b>$${Wallet.getPendingBalance().toFixed(2)}</b></div>
                        <div><small>Total Earned</small><br><b>$${Wallet.getEarnedBalance().toFixed(2)}</b></div>
                    </div>
                </div>`;
        }

        if (withdraw) {
            withdraw.innerHTML = `
                <div style="background: #1e293b; padding: 20px; border-radius: 15px; border: 1px solid #334155; margin-top: 10px;">
                    <h3 style="color: white; margin-bottom: 15px;">Withdraw Funds</h3>

                    <label style="color: #94a3b8; font-size: 0.8rem;">Method</label>
                    <select id="wd-method" style="width: 100%; background: #0f172a; color: white; border: 1px solid #334155; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                        <option value="USDT_BEP20">USDT (BEP20)</option>
                        <option value="BINANCE_PAY">Binance Pay</option>
                        <option value="MOBILE_MONEY">Mobile Money</option>
                    </select>

                    <label style="color: #94a3b8; font-size: 0.8rem;">Wallet Address / Number</label>
                    <input type="text" id="wd-address" placeholder="Enter details..." style="width: 100%; background: #0f172a; color: white; border: 1px solid #334155; padding: 12px; border-radius: 8px; margin-bottom: 15px;">

                    <label style="color: #94a3b8; font-size: 0.8rem;">Amount (Min $1.00)</label>
                    <input type="number" id="wd-amount" placeholder="0.00" style="width: 100%; background: #0f172a; color: white; border: 1px solid #334155; padding: 12px; border-radius: 8px; margin-bottom: 20px;">

                    <button id="submit-wd" style="width: 100%; background: #10b981; color: white; padding: 15px; border-radius: 12px; font-weight: bold; border: none;">Confirm Withdrawal</button>
                </div>`;

            document.getElementById("submit-wd").onclick = () => this.handleWithdrawal();
        }
    },

    handleWithdrawal: async function() {
        const amount = document.getElementById("wd-amount").value;
        const address = document.getElementById("wd-address").value;
        const method = document.getElementById("wd-method").value;

        if(!amount || !address) return alert("Please fill all fields");

        const res = await Wallet.requestWithdrawal({ amount, method, walletAddress: address });
        alert(res.message || (res.success ? "Success!" : "Failed"));
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

    hideLoading: function() {
        const loader = document.getElementById('loading-overlay');
        if(loader) loader.style.display = 'none';
    }
};

export default UI;

