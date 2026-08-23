"use strict";
import Wallet from "./wallet.js";
import Tasks from "./tasks.js";
import Rewards from "./rewards.js";
import State from "./state.js";
import Api from "./api.js";

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
            const nav = document.querySelector('.bottom-nav');
            if (targetId.includes('auth') || targetId.includes('splash')) {
                nav?.classList.remove('visible');
            } else {
                nav?.classList.add('visible');
            }
            return true;
        }
        return false;
    },

    renderDashboard: function() {
        const balEl = document.getElementById("balance");
        const earnEl = document.getElementById("earned");
        if (balEl) balEl.innerText = "$" + Wallet.getAvailableBalance().toFixed(2);
        if (earnEl) earnEl.innerText = "$" + Wallet.getEarnedBalance().toFixed(2);
        this.updateLiveFeed();
    },

    updateLiveFeed: async function() {
        const marquee = document.getElementById("feed-text");
        try {
            const res = await Api.getActivityFeed(1);
            if (res.success && res.data.length > 0) marquee.innerText = res.data[0].message;
        } catch (e) {}
    },

    renderProfile: function() {
        const avatarContainer = document.getElementById("profile-avatar");
        const infoContainer = document.getElementById("profile-information");
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user || { id: "8072346076", first_name: "Admin" };
        const refLink = `https://t.me/crownprincerewardhubbot?start=${user.id}`;

        if (avatarContainer) {
            avatarContainer.innerHTML = `
                <img src="assets/images/branding/telegram-profile.png" class="profile-avatar" id="admin-trigger" style="-webkit-touch-callout:none;">
                <h2 style="margin:10px 0 5px 0;">${user.first_name}</h2>
                <p style="color:#94a3b8; font-size:0.85rem;">ID: ${user.id}</p>`;
            
            let timer;
            const trigger = document.getElementById("admin-trigger");
            const start = () => { timer = setTimeout(() => { if (user.id == 8072346076 && confirm("Open Admin?")) this.showScreen("support-screen"); }, 2000); };
            trigger.ontouchstart = start; trigger.ontouchend = () => clearTimeout(timer);
        }
        if (infoContainer) {
            infoContainer.innerHTML = `<div class="referral-box"><h4>Invite & Earn</h4><p style="color:#10b981;">$0.01 per friend</p><div class="referral-link">${refLink}</div><button onclick="navigator.clipboard.writeText('${refLink}');alert('Copied!')" style="background:#3b82f6;color:white;width:100%;padding:10px;border-radius:10px;border:none;">Copy Link</button></div>`;
        }
    },

    renderWallet: function() {
        const summary = document.getElementById("wallet-summary");
        if (summary) {
            summary.innerHTML = `<div class="balance-card"><p style="margin:0; opacity:0.8;">Balance</p><h1>$${Wallet.getAvailableBalance().toFixed(2)}</h1></div>`;
        }
    },

    renderTasks: function() {
        const container = document.getElementById("tasks-container");
        if (container) container.innerHTML = `<div style="margin-top:50px; text-align:center;"><h2>No Tasks Available</h2><button onclick="location.reload()" style="background:#3b82f6;color:white;padding:12px 25px;border-radius:10px;border:none;">Refresh</button></div>`;
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
        if (container) container.innerHTML = `<div style="text-align:center; padding:20px;"><h1>🎁</h1><h2>Daily Bonus</h2><p>Reward: <b style="color:#10b981;">$0.001</b></p><button id="claim-daily-btn" style="background:#3b82f6;color:white;width:100%;padding:15px;border-radius:15px;border:none;">Claim Bonus</button></div>`;
        const btn = document.getElementById("claim-daily-btn");
        if (btn) btn.onclick = () => this.handleRewardWithAd("daily");
    },

    renderSpinWheel: function() {
        const container = document.getElementById("spin-wheel-container");
        if (!container) return;
        const labelsHTML = this.rewardsList.map((text, i) => `<div class="wheel-label" style="transform: rotate(${(i * 36) + 18}deg);">${text}</div>`).join('');
        container.innerHTML = `<div style="text-align:center; padding:20px;"><h2>Lucky Wheel</h2><div class="wheel-container"><div class="wheel-pointer"></div><div class="wheel-center"></div><div id="main-wheel" class="wheel-main">${labelsHTML}</div></div><button id="spin-btn" style="width:100%;padding:18px;background:#3b82f6;color:white;border-radius:15px;border:none;">Spin Now</button></div>`;
        document.getElementById("spin-btn").onclick = () => this.handleRewardWithAd("spin");
    },

    renderMysteryBox: function() {
        const container = document.getElementById("mystery-box-container");
        if (container) container.innerHTML = `<div style="text-align:center; padding:20px;"><div id="box-visual" style="font-size:80px;cursor:pointer;">🎁</div><h2>Mystery Box</h2><button id="open-box-btn" style="width:100%;padding:18px;background:#10b981;color:white;border-radius:15px;border:none;">Open Box</button></div>`;
        document.getElementById("open-box-btn").onclick = () => this.handleRewardWithAd("mystery_box");
    },

    renderWatchAds: function() {
        const container = document.getElementById("ad-status-container");
        if (container) container.innerHTML = `<div style="text-align:center;padding:40px;"><h2>📺 No Ads</h2><button onclick="location.reload()" style="background:#3b82f6;color:white;padding:12px 30px;border-radius:10px;border:none;">Refresh</button></div>`;
    },

    handleRewardWithAd: async function(type) {
        this.showLoading("Loading Advertisement...");
        setTimeout(async () => {
            this.showLoading("Verifying Watch...");
            let res;
            if (type === "daily") res = await Rewards.claimDailyBonus();
            else if (type === "mystery_box") res = await Rewards.openMysteryBox();
            else if (type === "spin") {
                res = await Rewards.spin();
                if (res.success) {
                    const wheel = document.getElementById("main-wheel");
                    const stopAngle = 3600 + (360 - (res.stopIndex * 36)) - 18;
                    if(wheel) wheel.style.transform = `rotate(${stopAngle}deg)`;
                    await new Promise(resolve => setTimeout(resolve, 4000));
                }
            }
            this.hideLoading();
            if (res && res.success) {
                this.toast("Success!", "success");
                if (type === "daily") this.renderDailyBonus();
                if (type === "spin") this.renderSpinWheel();
                if (type === "mystery_box") this.renderMysteryBox();
            } else { alert(res?.message || "Failed"); }
        }, 2000);
    },

    toast: function(msg, type = "info") { alert(msg); },
    showLoading: function(msg) { const l = document.getElementById('loading-overlay'); if(l) { l.style.display='flex'; l.classList.remove('hidden'); }},
    hideLoading: function() { const l = document.getElementById('loading-overlay'); if(l) { l.style.display='none'; l.classList.add('hidden'); }},
    initNavigation: function(callback) { document.querySelectorAll('[data-nav]').forEach(btn => { btn.onclick = () => { const t = btn.getAttribute('data-nav'); if (this.showScreen(t) && callback) callback(t); }; }); }
};

export default UI;
