/* ==========================================
   CROWN PRINCE REWARD HUB
   MINI APP ENGINE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initSplash();

    initNavigation();

    animateBalance(0.000,0.237);

    startActivityFeed();

    welcomeToast("👑 Welcome to Crown Prince Reward Hub");

    cardEffects();

});


/* ==========================================
   SPLASH SCREEN
========================================== */

function initSplash(){

    const splash=document.getElementById("splash");

    const app=document.getElementById("app");

    setTimeout(()=>{

        splash.classList.add("hide");

        app.classList.remove("hidden");

    },2500);

}


/* ==========================================
   BALANCE ANIMATION
========================================== */

function animateBalance(start,end){

    const balance=document.getElementById("balance");

    if(!balance) return;

    let current=start;

    const step=(end-start)/100;

    const timer=setInterval(()=>{

        current+=step;

        balance.innerHTML="$"+current.toFixed(3);

        if(current>=end){

            balance.innerHTML="$"+end.toFixed(3);

            clearInterval(timer);

        }

    },20);

}


/* ==========================================
   FLOATING TOAST
========================================== */

function welcomeToast(message){

    const toast=document.createElement("div");

    toast.className="toast";

    toast.innerHTML=message;

    document.body.appendChild(toast);

    setTimeout(()=>{

        toast.classList.add("show");

    },300);

    setTimeout(()=>{

        toast.classList.remove("show");

    },3500);

}


/* ==========================================
   LIVE ACTIVITY FEED
========================================== */

const activities=[

"🎁 Alice claimed Daily Bonus",

"🎡 Grace won $0.05 on Spin Wheel",

"👥 Michael invited a friend",

"💸 Sarah withdrew $5.00",

"🎯 Denis completed Offer Wall",

"💰 Kevin earned $0.21",

"🎁 Mystery Box rewarded $0.03",

"📸 Task approved",

"🔥 CPA Offer completed"

];

function startActivityFeed(){

    const feed=document.getElementById("activity-feed");

    if(!feed) return;

    let i=0;

    setInterval(()=>{

        const card=document.createElement("div");

        card.className="activity-card";

        card.innerHTML=`

        <div class="activity-avatar">👑</div>

        <div class="activity-info">

        <div class="activity-name">${activities[i]}</div>

        <div class="activity-action">Just now</div>

        </div>

        `;

        feed.prepend(card);

        if(feed.children.length>6){

            feed.removeChild(feed.lastChild);

        }

        i++;

        if(i>=activities.length){

            i=0;

        }

    },5000);

}


/* ==========================================
   NAVIGATION
========================================== */

function initNavigation(){

document.querySelectorAll(".nav-item").forEach(item=>{

item.addEventListener("click",()=>{

document.querySelectorAll(".nav-item").forEach(n=>{

n.classList.remove("active");

});

item.classList.add("active");

});

});

}


/* ==========================================
   PREMIUM CARD EFFECT
========================================== */

function cardEffects(){

document.querySelectorAll(".quick-card").forEach(card=>{

card.addEventListener("touchstart",()=>{

card.style.transform="scale(.96)";

});

card.addEventListener("touchend",()=>{

card.style.transform="scale(1)";

});

});

}


/* ==========================================
   FUTURE FEATURES
========================================== */

// Live database updates
// Telegram WebApp SDK
// SQLite API
// Rewarded Ads
// Spin Wheel Engine
// Mystery Box Engine
// Wallet API
// CPA Offers
// Admin Dashboard
// Analytics
