"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - ADS MODULE
   CLEAN RECONSTRUCTION - PHASE 4 (FEATURE MODULES)
===================================================== */

import Api from "./api.js";
import State from "./state.js";
import Settings from "./settings.js";
import UI from "./ui.js";
import Utils from "./utils.js";

const AD_NETWORKS = {
    MONETAG: "monetag",
    ADSTERRA: "adsterra",
    ADMOB: "admob",
    UNITY: "unity",
    APPLOVIN: "applovin",
    CUSTOM: "custom"
};

const AD_TYPES = {
    REWARDED: "rewarded",
    INTERSTITIAL: "interstitial",
    BANNER: "banner",
    POPUNDER: "popunder"
};

const Ads = {
    initialized: false,
    loading: false,
    showing: false,
    syncing: false,
    currentNetwork: AD_NETWORKS.MONETAG,
    history: [],
    statistics: {
        adsWatched: 0,
        rewardedAds: 0,
        totalRewardEarned: 0,
        failedAds: 0
    },
    configuration: {
        rewardedEnabled: true,
        cooldown: 30,
        maxAdsPerHour: 100
    }
};

/* --- INITIALIZATION --- */
Ads.initialize = async function () {
    if (this.initialized) return;
    try {
        await this.sync();
        this.initialized = true;
        console.log("Ads Module Initialized.");
    } catch (error) {
        console.error("Ads Init Error:", error);
    }
};

/* --- CORE AD LOGIC --- */
Ads.showRewardedAd = async function (placement = "default") {
    if (!this.canShowAd(AD_TYPES.REWARDED)) {
        alert("Please wait before watching another ad.");
        return { success: false };
    }

    try {
        this.showing = true;
        // In a real app, this calls the network SDK (e.g. Monetag)
        // Here we call your Backend to track the intent
        const response = await Api.claimWatchAd({
            user_id: State.getUser()?.user_id,
            placement: placement,
            ad_completed: true // Simplified for reconstruction
        });

        if (response.success) {
            this.statistics.adsWatched++;
            this.statistics.rewardedAds++;
            this.history.unshift({
                type: AD_TYPES.REWARDED,
                reward: response.reward || 0,
                createdAt: new Date().toISOString()
            });
        }
        return response;
    } catch (error) {
        this.statistics.failedAds++;
        return { success: false, message: "Ad failed to load." };
    } finally {
        this.showing = false;
    }
};

/* --- FREQUENCY LIMITS --- */
Ads.canShowAd = function (adType) {
    const hourAgo = Date.now() - 3600000;
    const recentAds = this.history.filter(ad => new Date(ad.createdAt).getTime() >= hourAgo);

    if (recentAds.length >= this.configuration.maxAdsPerHour) return false;

    const lastAd = recentAds.filter(ad => ad.type === adType).pop();
    if (!lastAd) return true;

    const elapsed = (Date.now() - new Date(lastAd.createdAt).getTime()) / 1000;
    return elapsed >= this.configuration.cooldown;
};

/* --- SYNCHRONIZATION --- */
Ads.sync = async function () {
    try {
        this.syncing = true;
        const response = await Api.get("/settings"); // Synced with backend settings
        if (response.success && response.data) {
            this.configuration.rewardedEnabled = response.data.watch_ads_enabled !== false;
        }
        return { success: true };
    } catch (error) {
        return { success: false };
    } finally {
        this.syncing = false;
    }
};

/* --- NETWORK SHORTCUTS (Architecture Preservation) --- */
Ads.adsterra = {
    rewarded: () => Ads.showRewardedAd("adsterra")
};
Ads.monetag = {
    rewarded: () => Ads.showRewardedAd("monetag")
};

/* --- EVENTS --- */
window.addEventListener("DOMContentLoaded", async () => {
    await Ads.initialize();
});

export default Ads;
