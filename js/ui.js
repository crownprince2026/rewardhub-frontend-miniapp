"use strict";
import Wallet from "./wallet.js";
import Tasks from "./tasks.js";
import Rewards from "./rewards.js"; // ADD THIS LINE
import Profile from "./profile.js";
import State from "./state.js";
import Utils from "./utils.js";

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

renderRewards: function() {
        // Activate the 4 sub-cards in the Rewards Grid
        const cards = [
            { id: "daily-bonus-card", target: "daily-bonus-screen", render: () => this.renderDailyBonus() },
            { id: "spin-wheel-card", target: "spin-wheel-screen", render: () => this.renderSpinWheel() },
            { id: "mystery-box-card", target: "mystery-box-screen", render: () => this.renderMysteryBox() },
            { id: "watch-ads-card", target: "watch-ads-screen", render: () => this.renderWatchAds() }
        ];

        cards.forEach(card => {
            const el = document.getElementById(card.id);
            if (el) {
                el.style.cursor = "pointer";
                el.onclick = () => {
                    if (this.showScreen(card.target)) {
                        card.render();
                    }
                };
            }
        });
    },

renderDailyBonus: function() {
        const container = document.getElementById("daily-bonus-container");
        if (!container) return;

        const streak = Rewards.getDailyStreak();
        const nextClaimTime = Rewards.getNextDailyBonusTime(); // This should be a timestamp from your backend
        const now = Date.now();
        const canClaim = now >= nextClaimTime;

        container.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <div style="font-size: 80px; margin-bottom:20px; filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.3));">🎁</div>
                <h2 style="color:white; margin:0; font-size:1.8rem;">Daily Bonus</h2>
                <p style="color:#94a3b8; margin:10px 0 25px 0;">Daily Reward: <b style="color:#10b981;">$0.001</b></p>
                
                <div style="background:#1e293b; padding:20px; border-radius:20px; margin-bottom:30px; border:1px solid #334155;">
                    <p style="margin:0; color:#94a3b8; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px;">Current Streak</p>
                    <h2 style="margin:5px 0 0 0; color:var(--primary); font-size:2rem;">${streak} Days</h2>
                </div>

                <button id="claim-daily-btn" 
                    ${!canClaim ? 'disabled style="background:#334155; color:#64748b; opacity:0.6;"' : 'style="background:#3b82f6; color:white;"'}
                    class="reward-submit-btn">
                    ${canClaim ? 'Claim Bonus' : 'Next Claim in: <span id="daily-timer">--:--:--</span>'}
                </button>
                
                <p style="margin-top:15px; font-size:0.75rem; color:#64748b;">* You must watch 1 ad to unlock the reward</p>
            </div>
        `;

        if (!canClaim) {
            this.startDailyCountdown(nextClaimTime);
        }

        const btn = document.getElementById("claim-daily-btn");
        if (canClaim && btn) {
            btn.onclick = () => this.handleRewardWithAd("daily");
        }
    },

    // --- NEW: COUNTDOWN TIMER ENGINE ---
    startDailyCountdown: function(endTime) {
        const timerEl = document.getElementById("daily-timer");
        if (!timerEl) return;

        const update = () => {
            const now = Date.now();
            const diff = endTime - now;

            if (diff <= 0) {
                this.renderDailyBonus(); // Refresh to enable button
                return;
            }

            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            timerEl.innerText = `${h}:${m}:${s}`;
        };

        update();
        if (this.dailyInterval) clearInterval(this.dailyInterval);
        this.dailyInterval = setInterval(update, 1000);
    },

    // --- NEW: AD-REWARD BRIDGE ---
    handleRewardWithAd: async function(type) {
        // 1. Show Ad Loading (Kept from your original logic)
        this.showLoading("Loading Advertisement...");

        // 2. Simulate Ad Play
        setTimeout(async () => {
            this.showLoading("Verifying Ad Watch...");
            
            let res;
            
            // 3. Process the specific Reward Type
            if (type === "daily") {
                res = await Rewards.claimDailyBonus();
            } 
            else if (type === "mystery_box") {
                res = await Rewards.openMysteryBox();
            } 
            else if (type === "spin") {
                // For the Spin Wheel, we show the animation BEFORE the result
                const wheel = document.getElementById("main-wheel");
                const randomDeg = Math.floor(5000 + Math.random() * 5000); 
                if(wheel) wheel.style.transform = `rotate(${randomDeg}deg)`;
                
                // Wait 4 seconds for the wheel to finish spinning
                await new Promise(resolve => setTimeout(resolve, 4000));
                res = await Rewards.spin();
            }

            this.hideLoading();

            // 4. Show Feedback (Kept and improved from your original)
            if (res && res.success) {
                const prizeName = res.prize ? `(${res.prize})` : "";
                this.toast(`$${res.reward} ${prizeName} and XP Earned!`, "success");
                
                // Refresh the specific screen you are on
                if (type === "daily") this.renderDailyBonus();
                if (type === "mystery_box") this.renderMysteryBox();
                if (type === "spin") this.renderSpinWheel();
                
                // Refresh dashboard balance in background
                this.renderDashboard(); 
            } else {
                alert(res ? res.message : "Reward processing failed.");
            }
        }, 3000); // 3-second simulated ad
    },

    renderSpinWheel: function() {
        const container = document.getElementById("spin-wheel-container");
        if (!container) return;

        const nextSpinTime = Rewards.getCooldown("spin");
        const canSpin = Date.now() >= nextSpinTime;

        // The 10 rewards you requested
        const rewardsList = [
            "$0.0001", "5 XP", "$0.0002", "Try Again", "$0.005", 
            "50 XP", "$0.01", "$1.00", "$0.05", "$0.10"
        ];

        // Generate the HTML for the labels inside the wheel
        const labelsHTML = rewardsList.map((text, i) => {
            const rotation = i * 36; // 360 / 10 items
            return `<div class="wheel-label" style="transform: rotate(${rotation}deg);">${text}</div>`;
        }).join('');

        container.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <h2 style="color:white; margin:0;">Lucky Wheel</h2>
                <p style="color:#94a3b8; font-size:0.85rem; margin:10px 0;">Spin to win Cash or XP rewards!</p>
                
                <div class="wheel-container">
                    <div class="wheel-pointer"></div>
                    <div class="wheel-center"></div>
                    <div id="main-wheel" class="wheel-main">
                        ${labelsHTML}
                    </div>
                </div>

                <button id="spin-btn" 
                    ${!canSpin ? 'disabled style="background:#334155; opacity:0.6;"' : 'style="background:#3b82f6;"'}
                    class="reward-submit-btn" style="margin-top:30px; width:100%; padding:18px; border-radius:15px; border:none; color:white; font-weight:bold; font-size:1.1rem;">
                    ${canSpin ? 'Spin Now' : 'Next Spin in: <span id="spin-timer">--:--</span>'}
                </button>
                <p style="margin-top:15px; font-size:0.75rem; color:#64748b;">* Watches 1 ad before spinning</p>
            </div>
        `;

        if (!canSpin) {
            this.startSpinCountdown(nextSpinTime);
        } else {
            document.getElementById("spin-btn").onclick = () => this.handleRewardWithAd("spin");
        }
    },

    renderMysteryBox: function() {
        const container = document.getElementById("mystery-box-container");
        if (!container) return;

        const nextOpenTime = Rewards.getCooldown("mystery_box");
        const now = Date.now();
        const canOpen = now >= nextOpenTime;

        container.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <div id="box-visual" style="font-size: 100px; margin: 30px 0; cursor:pointer; transition: transform 0.3s;">
                    ${canOpen ? '🎁' : '🔒'}
                </div>
                <h2 style="color:white; margin:0;">Mystery Box</h2>
                <p style="color:#94a3b8; margin:10px 0 30px 0;">Win up to <b style="color:#10b981;">$1.00</b> or <b style="color:#f59e0b;">50 XP</b></p>
                
                <button id="open-box-btn" 
                    ${!canOpen ? 'disabled style="background:#334155; color:#64748b; opacity:0.6;"' : 'style="background:#10b981; color:white;"'}
                    style="padding:18px 0; border-radius:15px; font-weight:bold; font-size:1.1rem; width:100%; border:none;">
                    ${canOpen ? 'Open Box' : 'Opens in: <span id="box-timer">--:--:--</span>'}
                </button>
                
                <p style="margin-top:15px; font-size:0.75rem; color:#64748b;">* Watch 1 ad to unlock the treasures inside</p>
            </div>
        `;

        if (!canOpen) {
            this.startBoxCountdown(nextOpenTime);
        }

        const btn = document.getElementById("open-box-btn");
        const box = document.getElementById("box-visual");
        
        if (canOpen && btn) {
            const openAction = () => this.handleRewardWithAd("mystery_box");
            btn.onclick = openAction;
            box.onclick = openAction;
            // Add a little wiggle animation to the available box
            box.style.animation = "bounce 2s infinite";
        }
    },

    startBoxCountdown: function(endTime) {
        const timerEl = document.getElementById("box-timer");
        if (!timerEl) return;
        const update = () => {
            const diff = endTime - Date.now();
            if (diff <= 0) { this.renderMysteryBox(); return; }
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            timerEl.innerText = `${h}:${m}:${s}`;
        };
        update();
        setInterval(update, 1000);
    },

    renderWatchAds: function() {
        const container = document.getElementById("ad-status-container");
        if (!container) return;
        // Professional "No Ads" response with Refresh button
        container.innerHTML = `
            <div style="margin-top:60px; text-align:center; padding:20px;">
                <div style="font-size: 60px; margin-bottom:20px;">📺</div>
                <h2 style="color:white; margin:0;">No Ads Available</h2>
                <p style="color:#94a3b8; margin:10px 0 25px 0;">We are preparing new video offers for you. Please wait a moment and try again.</p>
                <button onclick="location.reload()" style="background:#3b82f6; color:white; border:none; padding:15px 40px; border-radius:12px; font-weight:bold; width:100%;">Refresh Ads</button>
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
