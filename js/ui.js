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

    // --- NEW: PROFESSIONAL PROFILE RENDERER ---
   renderProfile: function() {
        const avatarContainer = document.getElementById("profile-avatar");
        const infoContainer = document.getElementById("profile-information");
 
        const tg = window.Telegram?.WebApp;
        const user = tg?.initDataUnsafe?.user || { id: "8072346076", first_name: "Admin" }; // fallback for testing
        const refLink = `https://t.me/crownprincerewardhubbot?start=${user.id}`;

        if (avatarContainer) {
            avatarContainer.innerHTML = `
                <div class="avatar-wrapper" style="position:relative; display:inline-block;">
                    <img src="assets/images/branding/telegram-profile.png" 
                         class="profile-avatar" 
                         id="admin-trigger" 
                         oncontextmenu="return false;" 
                         style="-webkit-touch-callout: none;">
                </div>
                <h2 style="margin:10px 0 5px 0;">${user.first_name}</h2>
                <p style="color:#94a3b8; font-size:0.85rem; margin:0;">ID: ${user.id}</p>
            `;

            // IMPROVED ADMIN SWITCH (Touch Start/End logic)
            let timer;
            const trigger = document.getElementById("admin-trigger");
 
            const startPress = () => {
                timer = setTimeout(() => {
                    if (user.id == 8072346076) {
                        if(confirm("Enter Admin Panel?")) {
                            this.showScreen("support-screen"); // Using support as placeholder
                        }
                    }
                }, 2000);
            };
            const endPress = () => clearTimeout(timer);

            trigger.addEventListener('touchstart', startPress);
            trigger.addEventListener('touchend', endPress);
            trigger.addEventListener('mousedown', startPress);
            trigger.addEventListener('mouseup', endPress);
        }

        if (infoContainer) {
            infoContainer.innerHTML = `
                <div class="referral-box" style="background:var(--surface); padding:20px; border-radius:20px; margin-top:25px; border:1px solid #334155;">
                    <h4 style="margin:0; font-size:1.1rem;">Invite & Earn</h4>
                    <p style="color:#10b981; font-weight:bold; margin:5px 0;">Reward: $0.01 per friend</p>
                    <div class="referral-link" style="background:#0f172a; padding:12px; border-radius:10px; margin:15px 0; font-family:monospace; font-size:0.8rem; border:1px solid #1e293b; color:#3b82f6;">${refLink}</div>
                    <button onclick="navigator.clipboard.writeText('${refLink}'); alert('Link Copied!')" 
                            style="background:#3b82f6; color:white; border:none; padding:15px; border-radius:12px; width:100%; font-weight:bold; font-size:1rem;">
                        Copy Referral Link
                    </button>
                </div>
            `;
        }
    },

renderWallet: function() {
        const summary = document.getElementById("wallet-summary");
        const withdraw = document.getElementById("withdraw-button");
        
        if (summary) {
            summary.innerHTML = `
                <div class="balance-card" style="width:100%; box-sizing:border-box;">
                    <p style="margin:0; opacity:0.8; font-size:0.9rem;">Available Balance</p>
                    <h1 style="font-size:3rem; margin:10px 0;">$${Wallet.getAvailableBalance().toFixed(2)}</h1>
                    <div style="display:flex; justify-content:space-around; margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:15px;">
                        <div><small style="color:#94a3b8;">Pending</small><br><b>$${Wallet.getPendingBalance().toFixed(2)}</b></div>
                        <div><small style="color:#94a3b8;">Total Earned</small><br><b>$${Wallet.getEarnedBalance().toFixed(2)}</b></div>
                    </div>
                </div>`;
        }

        if (withdraw) {
            withdraw.innerHTML = `
                <div style="background:var(--surface); padding:20px; border-radius:20px; border:1px solid #334155; margin-top:20px;">
                    <h3 style="margin:0 0 20px 0; color:white;">Withdraw Funds</h3>
                    <select id="wd-method" style="width:100%; background:#0f172a; color:white; border:1px solid #334155; padding:15px; border-radius:12px; margin-bottom:15px;">
                        <option value="USDT_BEP20">USDT (BEP20)</option>
                        <option value="BINANCE_PAY">Binance Pay</option>
                    </select>
                    <input type="text" id="wd-address" placeholder="Wallet Address" style="width:100%; background:#0f172a; color:white; border:1px solid #334155; padding:15px; border-radius:12px; margin-bottom:15px; box-sizing:border-box;">
                    <input type="number" id="wd-amount" placeholder="Amount (Min $1.00)" style="width:100%; background:#0f172a; color:white; border:1px solid #334155; padding:15px; border-radius:12px; margin-bottom:20px; box-sizing:border-box;">
                    <button id="submit-wd" style="width:100%; background:#10b981; color:white; padding:16px; border-radius:15px; font-weight:bold; border:none; font-size:1.1rem;">Confirm Withdrawal</button>
                </div>`;
            document.getElementById("submit-wd").onclick = () => this.handleWithdrawal();
        }
    },

renderTasks: function() {
        const container = document.getElementById("tasks-container");
        if (!container) return;
        
        // In this phase, we show the professional empty state or the list
        container.innerHTML = `
            <div style="margin-top:50px; text-align:center; padding:20px;">
                <div style="font-size: 60px; margin-bottom:20px;">📋</div>
                <h2 style="color:white; margin:0;">No Tasks Available</h2>
                <p style="color:#94a3b8; margin:10px 0 25px 0;">We are preparing new rewards for you. Please check back in a few hours!</p>
                <button onclick="location.reload()" style="background:#3b82f6; color:white; border:none; padding:15px 40px; border-radius:12px; font-weight:bold;">Refresh List</button>
            </div>`;
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
