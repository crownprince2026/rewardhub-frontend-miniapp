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
        const user = tg?.initDataUnsafe?.user || { id: "0000", first_name: "User" };
        const refLink = `https://t.me/crownprincerewardhubbot?start=${user.id}`;

        if (avatarContainer) {
            avatarContainer.innerHTML = `
                <img src="assets/images/branding/telegram-profile.png" class="profile-avatar" id="admin-trigger" alt="Avatar">
                <h2 style="margin:0;">${user.first_name}</h2>
                <p style="color:#94a3b8; font-size:0.8rem;">ID: ${user.id}</p>
            `;

            // SECRET ADMIN SWITCH: Long press (2 seconds)
            let pressTimer;
            const trigger = document.getElementById("admin-trigger");
            
            trigger.onmousedown = () => {
                pressTimer = window.setTimeout(() => {
                    if (user.id == 8072346076) {
                        alert("Admin Identity Verified. Opening Panel...");
                        this.showScreen("support-screen"); // We will use support for now as a placeholder
                    }
                }, 2000);
            };
            trigger.onmouseup = () => clearTimeout(pressTimer);
        }

        if (infoContainer) {
            infoContainer.innerHTML = `
                <div class="referral-box">
                    <h4 style="margin:0;">👥 Referral Program</h4>
                    <p style="font-size:0.75rem; color:#94a3b8; margin:5px 0;">Earn $0.01 for every friend you invite!</p>
                    <div class="referral-link">${refLink}</div>
                    <button onclick="navigator.clipboard.writeText('${refLink}'); alert('Copied!')" style="background:var(--primary); color:white; border:none; padding:10px; border-radius:8px; width:100%; font-weight:bold;">Copy Link</button>
                </div>
            `;
        }
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
