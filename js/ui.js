"use strict";
import Wallet from "./wallet.js";
import Tasks from "./tasks.js";
import Rewards from "./rewards.js";
import State from "./state.js";
import Api from "./api.js";
import Profile from "./profile.js";
import Auth from "./auth.js";
import Admin from "./admin.js";

const UI = {
    activeScreen: "auth-screen",
    // Unified Rewards List for both logic and visuals
    rewardsList: ["$0.01", "5 XP", "$0.02", "TRY", "$0.04", "50 XP", "$0.03", "$1.00", "$0.05", "$0.10"],

    showScreen: function(name) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => { s.style.display = 'none'; s.classList.remove('active'); });
        
        const targetId = name.endsWith('-screen') ? name : `${name}-screen`;
        const target = document.getElementById(targetId);
        
        if (target) {
            target.style.display = 'flex';
            target.classList.add('active');
            this.activeScreen = targetId;

            // --- PRECISION NAVIGATION SWITCH ---
            const userNav = document.getElementById('user-nav');
            const adminNav = document.getElementById('admin-nav');
            
            // 1. If it's an Admin screen (e.g., admin-dashboard-screen)
            if (targetId.startsWith('admin-')) {
                if(userNav) userNav.style.display = 'none';
                if(adminNav) adminNav.style.display = 'flex';
            } 
            // 2. If it's the Boot screens (Auth/Splash)
            else if (targetId === "auth-screen" || targetId === "splash-screen") {
                if(userNav) userNav.style.display = 'none';
                if(adminNav) adminNav.style.display = 'none';
            }
            // 3. Otherwise, it is a USER screen
            else {
                if(userNav) userNav.style.display = 'flex';
                if(adminNav) adminNav.style.display = 'none';
            }

            return true;
        }
        return false;
    },

    renderDashboard: function() {
        // 1. Update Balance and Stats
        const bal = document.getElementById("balance");
        const earn = document.getElementById("earned");
        const refs = document.getElementById("referrals");

        if (bal) bal.innerText = "$" + Wallet.getAvailableBalance().toFixed(2);
        if (earn) earn.innerText = "$" + Wallet.getEarnedBalance().toFixed(2);
        if (refs) refs.innerText = "0"; // Will connect to Profile module later

        // 2. Refresh Live Feed
        this.updateLiveFeed();
    },

    renderProfile: function() {
        const avatarContainer = document.getElementById("profile-avatar");
        const infoContainer = document.getElementById("profile-information");
        
        const tg = window.Telegram?.WebApp;
        // Identification Logic
        const user = tg?.initDataUnsafe?.user || { id: "8072346076", first_name: "Crown" }; 
        const stats = Profile.getStatistics();
        const tier = (Rewards.getStreakTier) ? Rewards.getStreakTier() : { name: "Amateur", class: "tier-amateur", ring: "ring-none" };
        const refLink = `https://t.me/crownprincerewardhubbot?start=${user.id}`;

        if (avatarContainer) {
            avatarContainer.innerHTML = `
                <div class="avatar-ring ${tier.ring}" id="admin-trigger" style="cursor:pointer; -webkit-touch-callout:none; user-select:none; margin-top:20px;">
                    <img src="assets/images/branding/telegram-profile.png" 
                         style="width:120px; height:120px; border-radius:50%; object-fit:cover; border: 4px solid transparent;">
                </div>
                <h2 style="margin:15px 0 5px 0;">${user.first_name}</h2>
                <p style="color:#94a3b8; font-size:0.85rem; margin:0;">ID: ${user.id}</p>
                <span class="tier-label ${tier.class}" style="margin-top:10px;">${tier.name}</span>
            `;

            // --- SECRET ADMIN SWITCH LOGIC ---
            let pressTimer;
            const trigger = document.getElementById("admin-trigger");
            
            const startPress = (e) => {
                pressTimer = setTimeout(() => {
                    // Check if you are the Admin
                    if (user.id == 8072346076) {
                        const pin = prompt("Admin PIN:");
                        if (pin === "123456") {
                            Auth.setAdminStatus(true); // <--- This fixes Access Denied
                            this.showScreen("admin-dashboard-screen");
                            this.renderAdminDashboard();
                        } else {
                            alert("Wrong PIN");
                        }
                    }
                }, 2000); // 2 Seconds
            };
            
            trigger.addEventListener('touchstart', startPress);
            trigger.addEventListener('touchend', () => clearTimeout(pressTimer));
            trigger.addEventListener('mousedown', startPress);
            trigger.addEventListener('mouseup', () => clearTimeout(pressTimer));
        }

        if (infoContainer) {
            infoContainer.innerHTML = `
                <div class="profile-card" style="margin-top:25px; border:1px solid #334155; padding:20px; border-radius:20px; background:var(--surface);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <span style="color:#94a3b8; font-size:0.8rem;">Current XP</span>
                        <span style="color:white; font-weight:bold;">${stats.xp || 0} XP</span>
                    </div>
                    <div class="xp-container" style="width:100%; height:8px; background:#0f172a; border-radius:10px; overflow:hidden;">
                        <div class="xp-fill" style="width:${(stats.xp || 0) % 100}%; height:100%; background:var(--primary);"></div>
                    </div>
                </div>
                
                <div class="profile-card" style="margin-top:15px; border:1px solid #334155; padding:20px; border-radius:20px; background:var(--surface);">
                    <h4 style="margin:0 0 10px 0;">Referral Link</h4>
                    <div style="background:#0f172a; padding:12px; border-radius:10px; font-family:monospace; font-size:0.75rem; color:var(--primary); word-break:break-all;">${refLink}</div>
                    <button onclick="navigator.clipboard.writeText('${refLink}'); alert('Link Copied!')" 
                            style="width:100%; background:var(--primary); color:white; border:none; padding:12px; border-radius:12px; margin-top:15px; font-weight:bold;">
                        Copy Link
                    </button>
                </div>
            `;
        }
    },

renderAdminDashboard: async function() {
        const statsContainer = document.getElementById("admin-stats-grid");
        const actionContainer = document.getElementById("admin-action-grid");
        if (!statsContainer || !actionContainer) return;

        // 1. Professional KPI Stats (Airtel/Momo Style)
        statsContainer.innerHTML = `
            <div class="stat-card" style="border-top:4px solid #3b82f6;">
                <small>Total Users</small><br><b style="font-size:1.4rem;">...</b>
            </div>
            <div class="stat-card" style="border-top:4px solid #10b981;">
                <small>Paid Out</small><br><b style="font-size:1.4rem;">$0.00</b>
            </div>
            <div class="stat-card" style="border-top:4px solid #f59e0b;">
                <small>New Tasks</small><br><b style="font-size:1.4rem;">0</b>
            </div>
            <div class="stat-card" style="border-top:4px solid #ef4444;">
                <small>Reports</small><br><b style="font-size:1.4rem;">0</b>
            </div>
        `;

        // 2. Main Admin Action Buttons
        actionContainer.innerHTML = `
            <div class="reward-card" onclick="UI.showScreen('admin-tasks-screen')">📝<br>Tasks/CPA</div>
            <div class="reward-card" onclick="UI.showScreen('admin-withdrawals-screen')">💸<br>Payouts</div>
            <div class="reward-card" onclick="UI.showScreen('admin-users-screen')">👥<br>Users</div>
            <div class="reward-card" onclick="UI.showScreen('admin-settings-screen')">📢<br>Broadcast</div>
            <div class="reward-card" onclick="UI.showScreen('admin-settings-screen')">⚙️<br>Setup</div>
        `;

        // Load real numbers from backend
        try {
            const data = await Api.get("/admin/dashboard");
            if(data.success) {
                // Update the cards with real numbers here later
            }
        } catch(e) {}
    },

renderAdminTasks: async function() {
        const container = document.getElementById("admin-tasks-content");
        if (!container) return;

        // Add a "Create New Task" button at the top
        container.innerHTML = `
            <div style="padding:15px;">
                <button onclick="UI.renderCreateTaskForm()" style="width:100%; background:var(--accent); color:white; border:none; padding:15px; border-radius:12px; font-weight:bold; margin-bottom:20px;">+ Create New Task</button>
            </div>
            <div id="admin-proofs-list"></div>
        `;
        
        // ... (rest of the logic to load pending proofs will go into the 'admin-proofs-list' div)
        this.renderAdminProofs(); 
    },

renderAdminProofs: async function() {
        const container = document.getElementById("admin-proofs-list");
        if (!container) return;
        
        const res = await Admin.loadPendingProofs();
        if (Admin.pendingTasks && Admin.pendingTasks.length > 0) {
             container.innerHTML = Admin.pendingTasks.map(proof => `
                <div style="background:#0f172a; padding:15px; border-radius:12px; margin-top:10px;">
                    <p style="margin:0;">User: ${proof.user_id}</p>
                    <img src="${proof.screenshot_url}" style="width:100%; border-radius:8px; margin:10px 0;">
                    <div style="display:flex; gap:10px;">
                        <button onclick="UI.handleProofAction('${proof.id}', 'approve')" style="flex:1; background:var(--accent); color:white; border:none; padding:10px; border-radius:8px;">Approve</button>
                        <button onclick="UI.handleProofAction('${proof.id}', 'reject')" style="flex:1; background:red; color:white; border:none; padding:10px; border-radius:8px;">Reject</button>
                    </div>
                </div>
             `).join('');
        } else {
            container.innerHTML = '<p style="text-align:center; color:var(--text-dim); padding:20px;">No pending proofs.</p>';
        }
    },

    renderCreateTaskForm: function() {
        const container = document.getElementById("admin-tasks-content");
        if (!container) return;

        container.innerHTML = `
            <div style="padding:20px; background:var(--surface); border-radius:24px; border:1px solid #334155; margin:15px;">
                <h3 style="color:white; margin:0 0 20px 0;">New Task Details</h3>
                
                <label style="color:var(--text-dim); font-size:0.8rem;">Task Type</label>
                <select id="task-type" class="form-input">
                    <option value="telegram">Telegram Channel</option>
                    <option value="twitter">X (Twitter) Follow</option>
                    <option value="app">App Installation</option>
                </select>

                <label style="color:var(--text-dim); font-size:0.8rem; margin-top:15px; display:block;">Task Title</label>
                <input type="text" id="task-title" class="form-input" placeholder="e.g. Join our Channel">

                <label style="color:var(--text-dim); font-size:0.8rem; margin-top:15px; display:block;">Reward Amount ($)</label>
                <input type="number" id="task-reward" class="form-input" placeholder="0.01" step="0.001">

                <label style="color:var(--text-dim); font-size:0.8rem; margin-top:15px; display:block;">Task Link</label>
                <input type="text" id="task-link" class="form-input" placeholder="https://t.me/...">

                <label style="color:var(--text-dim); font-size:0.8rem; margin-top:15px; display:block;">Total Slots</label>
                <input type="number" id="task-slots" class="form-input" placeholder="100">

                <div style="display:flex; gap:10px; margin-top:30px;">
                    <button onclick="UI.renderAdminTasks()" style="flex:1; background:#334155; color:white; border:none; padding:15px; border-radius:12px;">Cancel</button>
                    <button id="save-task-btn" style="flex:2; background:var(--primary); color:white; border:none; padding:15px; border-radius:12px; font-weight:bold;">Save Task</button>
                </div>
            </div>
        `;

        // Attach the save handler
        document.getElementById("save-task-btn").onclick = () => this.handleCreateTask();
    },

    handleCreateTask: async function() {
        const data = {
            user_id: State.getUser()?.user_id,
            type: document.getElementById("task-type").value,
            title: document.getElementById("task-title").value,
            reward: parseFloat(document.getElementById("task-reward").value) || 0,
            link: document.getElementById("task-link").value,
            slots: parseInt(document.getElementById("task-slots").value) || 0
        };

        if(!data.title || !data.link || isNaN(data.reward)) return alert("Please fill all required fields correctly.");

        this.showLoading("Saving Task...");
        const res = await Admin.createTask(data);
        this.hideLoading();

        if(res.success) {
            alert("Task Added Successfully!");
            this.renderAdminTasks(); // Refresh list
        } else {
            alert(res.message || "Failed to save task.");
        }
    },

    renderWallet: function() {
        const summary = document.getElementById("wallet-summary");
        const withdraw = document.getElementById("withdraw-button");
        
        if (summary) {
            summary.innerHTML = `
                <div class="balance-card" style="width:100%; box-sizing:border-box; margin-bottom:20px;">
                    <p style="margin:0; opacity:0.8; font-size:0.9rem;">Available Balance</p>
                    <h1 style="font-size:2.8rem; margin:10px 0;">$${Wallet.getAvailableBalance().toFixed(2)}</h1>
                    <div style="display:flex; justify-content:space-around; margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:15px;">
                        <div style="text-align:center;">
                            <small style="color:#94a3b8; display:block; margin-bottom:4px;">Pending</small>
                            <b style="color:#f59e0b; font-size:1.1rem;">$${Wallet.getPendingBalance().toFixed(2)}</b>
                        </div>
                        <div style="text-align:center;">
                            <small style="color:#94a3b8; display:block; margin-bottom:4px;">Total Earned</small>
                            <b style="color:#10b981; font-size:1.1rem;">$${Wallet.getEarnedBalance().toFixed(2)}</b>
                        </div>
                    </div>
                </div>`;
        }

        if (withdraw) {
            withdraw.innerHTML = `
                <div style="background:var(--surface); padding:25px; border-radius:24px; border:1px solid #334155; width:100%; box-sizing:border-box;">
                    <h3 style="margin:0 0 20px 0; color:white; text-align:center;">Withdraw Funds</h3>
                    
                    <label style="color:#94a3b8; font-size:0.8rem; margin-left:5px;">Withdrawal Method</label>
                    <select id="wd-method" class="form-input">
                        <option value="USDT_BEP20">USDT (BEP20)</option>
                        <option value="BINANCE_PAY">Binance Pay / ID</option>
                    </select>

                    <label style="color:#94a3b8; font-size:0.8rem; margin:15px 0 0 5px; display:block;">Wallet Address or Binance ID</label>
                    <input type="text" id="wd-address" class="form-input" placeholder="Enter your details...">

                    <label style="color:#94a3b8; font-size:0.8rem; margin:15px 0 0 5px; display:block;">Amount (Min: $${Wallet.getMinimumWithdrawal().toFixed(2)})</label>
                    <input type="number" id="wd-amount" class="form-input" placeholder="0.00">

                    <button id="submit-wd" 
                            style="width:100%; background:#10b981; color:white; padding:18px; border-radius:16px; font-weight:bold; border:none; font-size:1.1rem; margin-top:25px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);">
                        Submit Withdrawal
                    </button>
                    
                    <p style="text-align:center; color:#64748b; font-size:0.7rem; margin-top:15px;">* Payments are processed within 24 hours.</p>
                </div>`;
            
            document.getElementById("submit-wd").onclick = () => this.handleWithdrawal();
        }
    },

    renderTasks: async function() {
        const container = document.getElementById("tasks-container");
        if (!container) return;

        container.innerHTML = `<p style="text-align:center; padding:20px;">Loading tasks...</p>`;
        
        // Fetch real tasks from your Northflank backend
        const user = State.getUser();
        await Tasks.loadTasks(user?.user_id); 
        const allTasks = Tasks.getTasks();

        if (!allTasks || allTasks.length === 0) {
            container.innerHTML = `
                <div style="margin-top:60px; text-align:center; padding:20px;">
                    <div style="font-size: 64px; margin-bottom:20px;">📋</div>
                    <h2 style="color:white;">No Tasks Available</h2>
                    <p style="color:var(--text-dim);">Check back in a few hours!</p>
                    <button onclick="UI.renderTasks()" style="background:var(--primary); color:white; border:none; padding:12px 25px; border-radius:10px; margin-top:15px;">Refresh</button>
                </div>`;
            return;
        }

        container.innerHTML = allTasks.map(task => `
            <div style="background:var(--surface); padding:15px; border-radius:16px; margin-bottom:12px; border:1px solid #334155; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h4 style="margin:0;">${task.title}</h4>
                    <small style="color:var(--accent); font-weight:bold;">+$${(task.reward || 0).toFixed(2)}</small>
                </div>
                <button onclick="UI.showTaskDetails('${task.id}')" style="background:var(--primary); color:white; border:none; padding:8px 15px; border-radius:8px;">Start</button>
            </div>
        `).join('');
    },

    renderRewards: function() {
        const cards = [
            { id: "daily-bonus-card", target: "daily-bonus-screen", render: () => this.renderDailyBonus() },
            { id: "spin-wheel-card", target: "spin-wheel-screen", render: () => this.renderSpinWheel() },
            { id: "mystery-box-card", target: "mystery-box-screen", render: () => this.renderMysteryBox() },
            { id: "watch-ads-card", target: "watch-ads-screen", render: () => this.renderWatchAds() }
        ];
        cards.forEach(card => {
            const el = document.getElementById(card.id);
            if (el) el.onclick = () => { if (this.showScreen(card.target)) card.render(); };
        });
    },

    renderDailyBonus: function() {
        const container = document.getElementById("daily-bonus-container");
        if (!container) return;

        const streak = Rewards.getDailyStreak();
        const tier = Rewards.getStreakTier();
        const nextClaim = Rewards.getNextDailyBonusTime();
        const now = Date.now();
        const canClaim = now >= nextClaim;

        container.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <!-- Professional Tier Ring -->
                <div class="avatar-wrapper" style="margin-bottom:20px;">
                    <img src="assets/images/branding/official-logo.png" 
                         class="profile-avatar ${tier.ring}" 
                         style="width:110px; height:110px; border-radius:50%; padding:5px; background:#0f172a;">
                    <br>
                    <span class="tier-label ${tier.class}" style="margin-top:10px;">${tier.name}</span>
                </div>

                <h2 style="color:white; margin:0;">Daily Bonus</h2>
                <p style="color:#94a3b8; margin:10px 0;">Reward: <b style="color:#10b981; font-size:1.4rem;">$0.001</b></p>

                <!-- Streak Card -->
                <div style="background:var(--surface); padding:20px; border-radius:20px; margin-bottom:25px; border:1px solid #334155;">
                    <p style="margin:0; color:#94a3b8; font-size:0.75rem; text-transform:uppercase;">Daily Streak</p>
                    <h2 style="margin:5px 0 0 0; color:var(--primary); font-size:2rem;">${streak} Days</h2>
                </div>

                <!-- Interactive Button -->
                <button id="claim-daily-btn" 
                    ${!canClaim ? 'disabled class="reward-submit-btn btn-faint"' : 'class="reward-submit-btn" style="background:var(--primary); color:white;"'}
                    style="width:100%; padding:18px; border-radius:15px; font-weight:bold; font-size:1.1rem; border:none; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    ${canClaim ? 'Claim $0.001 Bonus' : 'Next Claim: <span id="db-timer">--:--:--</span>'}
                </button>
                
                <p style="margin-top:15px; font-size:0.7rem; color:#64748b;">* A 12-second advertisement will play</p>
            </div>
        `;

        if (!canClaim) {
            this.startDailyCountdown(nextClaim);
        } else {
            document.getElementById("claim-daily-btn").onclick = () => this.handleRewardWithAd("daily");
        }
    },

    // --- NEW: 12-SECOND AD FLOW ---
    handleDailyRewardFlow: function() {
        let secondsLeft = 12;
        this.showLoading(`Watching Ad... ${secondsLeft}s`);

        const adTimer = setInterval(async () => {
            secondsLeft--;
            if (secondsLeft > 0) {
                this.showLoading(`Watching Ad... ${secondsLeft}s`);
            } else {
                clearInterval(adTimer);
                this.showLoading("Processing Reward...");
                
                // Finalize Reward
                const res = await Rewards.claimDailyBonus();
                this.hideLoading();

                if (res.success) {
                    this.toast("Success! $0.001 Added", "success");
                    // Update Dashboard immediately
                    this.renderDashboard(); 
                    // Reset Daily screen to show countdown and faint button
                    this.renderDailyBonus(); 
                } else {
                    alert(res.message || "Failed to claim.");
                }
            }
        }, 1000);
    },

    // --- 23:59:59 TIMER ENGINE ---
    startDailyCountdown: function(endTime) {
        const timerEl = document.getElementById("db-timer");
        if (!timerEl) return;

        const update = () => {
            const diff = endTime - Date.now();
            if (diff <= 0) {
                clearInterval(it);
                this.renderDailyBonus(); // Re-enable button
                return;
            }
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            timerEl.innerText = `${h}:${m}:${s}`;
        };
        const it = setInterval(update, 1000);
        update();
    },

    renderMysteryBox: function() {
        const container = document.getElementById("mystery-box-container");
        const nextClaim = Rewards.getCooldown("mystery_box");
        const canClaim = Date.now() >= nextClaim;

        container.innerHTML = `
            <div style="text-align:center; padding:20px; position:relative;">
                <div id="fireworks" class="fireworks-overlay"></div>
                <div id="box-visual" class="${canClaim ? 'box-wiggle' : ''}" style="font-size:100px; margin-bottom:20px;">
                    ${canClaim ? '🎁' : '📦'}
                </div>
                <h3 style="color:white;">Mystery Box</h3>
                <p style="color:#94a3b8;">Win up to $1.00 or 50XP</p>
                <button id="open-box-btn" class="reward-submit-btn ${!canClaim ? 'btn-faint' : ''}" 
                        style="width:100%; padding:18px; border-radius:15px; margin-top:20px; font-weight:bold; background:#10b981;">
                    ${canClaim ? 'Open Box' : 'Next Box: <span id="box-timer"></span>'}
                </button>
            </div>`;

        if (!canClaim) this.startTimer("box-timer", nextClaim, () => this.renderMysteryBox());
        else document.getElementById("open-box-btn").onclick = () => this.handleRewardWithAd("mystery_box");
    },

    processFinalReward: async function(type) {
        this.showLoading("Verifying reward...");
        let res = (type === "daily") ? await Rewards.claimDailyBonus() : await Rewards.openMysteryBox();
        this.hideLoading();

        if (res.success) {
            if (type === "box") {
                document.getElementById("box-visual").innerHTML = "🎊";
                document.getElementById("fireworks").style.opacity = "1";
            }
            this.toast(`CONGRATULATIONS! You won ${res.reward}`, "success");
            setTimeout(() => {
                if (type === "daily") this.renderDailyBonus();
                else this.renderMysteryBox();
                this.renderDashboard();
            }, 3000);
        }
    },

    startTimer: function(id, expiry, callback) {
        const el = document.getElementById(id);
        const update = () => {
            const diff = expiry - Date.now();
            if (diff <= 0) { clearInterval(it); callback(); return; }
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            if (el) el.innerText = `${h}:${m}:${s}`;
        };
        const it = setInterval(update, 1000);
        update();
    },

    renderSpinWheel: function() {
        const container = document.getElementById("spin-wheel-container");
        if (!container) return;

        const nextSpin = Rewards.getCooldown("spin");
        const canSpin = Date.now() >= nextSpin;

        // The 10 rewards portions
        const rewardsList = ["$0.01", "5 XP", "$0.02", "TRY", "$0.04", "50 XP", "$0.03", "$1.00", "$0.05", "$0.10"];

        const labelsHTML = rewardsList.map((text, i) => {
            const rotation = (i * 36) + 18;
            return `<div class="wheel-label" style="transform: rotate(${rotation}deg);">${text}</div>`;
        }).join('');

        container.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <h2 style="margin:0 0 15px 0; color:white;">Lucky Wheel</h2>
                <div class="wheel-container">
                    <div class="wheel-pointer"></div>
                    <div class="wheel-center"></div>
                    <div id="main-wheel" class="wheel-main">
                        ${labelsHTML}
                    </div>
                </div>
                <button id="spin-btn" class="reward-submit-btn"
                        style="width:100%; padding:18px; border-radius:15px; border:none; color:white; font-weight:bold; font-size:1.1rem; margin-top:30px; background:${canSpin ? '#3b82f6' : '#334155'}">
                    ${canSpin ? 'Spin Now' : 'Wait Cooldown'}
                </button>
                <p style="margin-top:15px; font-size:0.7rem; color:var(--text-dim);">* Watch 1 ad before every spin</p>
            </div>`;

        // Safety check before assigning onclick
        const btn = document.getElementById("spin-btn");
        if (canSpin && btn) {
            btn.onclick = () => this.handleRewardWithAd("spin");
        }
    },

     renderWatchAds: function() {
        const container = document.getElementById("ad-status-container");
        if (!container) return;

        // 1. Create the HTML with a SINGLE clean button tag
        container.innerHTML = `
            <div style="text-align:center; padding:50px 20px;">
                <div style="font-size:60px; margin-bottom:20px;">📺</div>
                <h2 style="color:white; margin:0;">No Ads Available</h2>
                <p style="color:#94a3b8; line-height:1.6; margin-top:10px;">
                    We are preparing new ads for you.<br>Please come back in a few hours.
                </p>
                <button id="refresh-ads-btn"
                        style="background:#3b82f6; color:white; border:none; padding:15px 40px; border-radius:12px; margin-top:20px; font-weight:bold; cursor:pointer;">
                    Refresh Ads
                </button>
            </div>`;

        // 2. Attach the logic AFTER the HTML is placed in the DOM
        const btn = document.getElementById("refresh-ads-btn");
        if (btn) {
            btn.onclick = () => {
                this.showLoading("Checking for Ads...");
                setTimeout(() => {
                    this.hideLoading();
                    alert("No new ads available yet.");
                }, 2000);
            };
        }
    },

    handleRewardWithAd: async function(type) {
        const user = State.getUser();
        if (!user || !user.user_id) return alert("Error: Please restart the app to identify your account.");

        this.showLoading("Loading Advertisement...");
        setTimeout(async () => {
            this.showLoading("Verifying Watch...");
            let res;

            if (type === "daily") {
                res = await Rewards.claimDailyBonus(user.user_id);
            } else if (type === "mystery_box") {
                res = await Rewards.openMysteryBox(user.user_id);
            } else if (type === "spin") {
                res = await Rewards.spin(user.user_id);
                // Handle the spin wheel animation specifically
                if (res && res.success) {
                    const wheel = document.getElementById("main-wheel");
                    const stopAngle = 3600 + (360 - (res.stopIndex * 36)) - 18;
                    if(wheel) wheel.style.transform = `rotate(${stopAngle}deg)`;
                    await new Promise(resolve => setTimeout(resolve, 4000));
                }
            }

            this.hideLoading();

            if (res && res.success) {
                this.toast("Success! Reward Credited", "success");
                if (type === "daily") this.renderDailyBonus();
                if (type === "spin") this.renderSpinWheel();
                if (type === "mystery_box") this.renderMysteryBox();
                this.renderDashboard();
            } else {
                alert("Server Error: " + (res?.message || "Connection failed"));
            }
        }, 2000);
    },

    toast: function(msg, type = "info") { alert(msg); },
    showLoading: function(msg) { const l = document.getElementById('loading-overlay'); if(l) { l.style.display='flex'; l.classList.remove('hidden'); }},
    hideLoading: function() { const l = document.getElementById('loading-overlay'); if(l) { l.style.display='none'; l.classList.add('hidden'); }},
    initNavigation: function(callback) { document.querySelectorAll('[data-nav]').forEach(btn => { btn.onclick = () => { const t = btn.getAttribute('data-nav'); if (this.showScreen(t) && callback) callback(t); }; }); }
};

window.UI = UI;

export default UI;
