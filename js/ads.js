"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB
   TELEGRAM MINI APP
   ADS.JS
   PHASE 3C.1
   IMPORTS
   CONSTANTS
   ADVERTISING STATE
===================================================== */

import API from "./api.js";
import State from "./state.js";
import Settings from "./settings.js";
import UI from "./ui.js";
import Utils from "./utils.js";

/* =====================================================
   CONSTANTS
===================================================== */

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

    NATIVE: "native",

    POPUNDER: "popunder"

};

const AD_STATUS = {

    READY: "ready",

    LOADING: "loading",

    SHOWING: "showing",

    COMPLETED: "completed",

    FAILED: "failed",

    CLOSED: "closed"

};

const DEFAULT_REWARD = 0;

/* =====================================================
   ADVERTISING STATE
===================================================== */

const Ads = {

    initialized: false,

    loading: false,

    showing: false,

    syncing: false,

    currentNetwork: AD_NETWORKS.MONETAG,

    currentAd: null,

    networks: [],

    rewardedQueue: [],

    history: [],

    statistics: {

        adsWatched: 0,

        rewardedAds: 0,

        interstitialAds: 0,

        bannerViews: 0,

        totalRewardEarned: 0,

        failedAds: 0

    },

    configuration: {

        rewardedEnabled: true,

        interstitialEnabled: true,

        bannerEnabled: true,

        popunderEnabled: false,

        cooldown: 30,

        maxAdsPerHour: 100

    }

};

/* =====================================================
   GETTERS
===================================================== */

Ads.getCurrentNetwork = function () {

    return this.currentNetwork;

};

Ads.getCurrentAd = function () {

    return this.currentAd;

};

Ads.getHistory = function () {

    return this.history;

};

Ads.getStatistics = function () {

    return this.statistics;

};

Ads.getConfiguration = function () {

    return this.configuration;

};

/* =====================================================
   SETTERS
===================================================== */

Ads.setLoading = function (

    value

) {

    this.loading = value;

};

Ads.setShowing = function (

    value

) {

    this.showing = value;

};

Ads.setSyncing = function (

    value

) {

    this.syncing = value;

};

Ads.setCurrentAd = function (

    ad

) {

    this.currentAd = ad;

};

Ads.setCurrentNetwork = function (

    network

) {

    this.currentNetwork = network;

};

/* =====================================================
   NETWORK HELPERS
===================================================== */

Ads.isNetworkSupported = function (

    network

) {

    return Object.values(

        AD_NETWORKS

    ).includes(network);

};

Ads.registerNetwork = function (

    network

) {

    if (

        !this.networks.includes(

            network

        )

    ) {

        this.networks.push(

            network

        );

    }

};

/* =====================================================
   END OF PHASE 3C.1
===================================================== */

/* =====================================================
   PHASE 3C.2
   MONETAG INTEGRATION
   REWARDED ADS
   INTERSTITIAL
   POPUNDER
   BANNER
===================================================== */


/* =====================================================
   MONETAG INITIALIZATION
===================================================== */

Ads.initializeMonetag = async function () {

    try {

        this.setCurrentNetwork(

            AD_NETWORKS.MONETAG

        );

        this.registerNetwork(

            AD_NETWORKS.MONETAG

        );

        return {

            success: true

        };

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message:

                "Failed to initialize Monetag."

        };

    }

};


/* =====================================================
   REWARDED AD
===================================================== */

Ads.showRewardedAd = async function (

    placement = "default"

) {

    try {

        this.setShowing(true);

        const response = await API.showRewardedAd({

            network: AD_NETWORKS.MONETAG,

            placement

        });

        if (!response.success) {

            return response;

        }

        this.statistics.adsWatched++;

        this.statistics.rewardedAds++;

        this.history.unshift({

            network: AD_NETWORKS.MONETAG,

            type: AD_TYPES.REWARDED,

            reward:

                response.reward || 0,

            createdAt:

                new Date().toISOString()

        });

        return response;

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message:

                "Rewarded ad failed."

        };

    }

    finally {

        this.setShowing(false);

    }

};


/* =====================================================
   INTERSTITIAL
===================================================== */

Ads.showInterstitial = async function (

    placement = "default"

) {

    try {

        this.setShowing(true);

        const response = await API.showInterstitial({

            network: AD_NETWORKS.MONETAG,

            placement

        });

        if (response.success) {

            this.statistics.adsWatched++;

            this.statistics.interstitialAds++;

            this.history.unshift({

                network:

                    AD_NETWORKS.MONETAG,

                type:

                    AD_TYPES.INTERSTITIAL,

                createdAt:

                    new Date().toISOString()

            });

        }

        return response;

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message:

                "Interstitial failed."

        };

    }

    finally {

        this.setShowing(false);

    }

};


/* =====================================================
   POPUNDER
===================================================== */

Ads.showPopunder = async function (

    placement = "default"

) {

    try {

        return await API.showPopunder({

            network: AD_NETWORKS.MONETAG,

            placement

        });

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message:

                "Popunder failed."

        };

    }

};


/* =====================================================
   BANNER
===================================================== */

Ads.loadBanner = async function (

    placement = "bottom"

) {

    try {

        const response = await API.loadBanner({

            network: AD_NETWORKS.MONETAG,

            placement

        });

        if (response.success) {

            this.statistics.bannerViews++;

        }

        return response;

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message:

                "Banner failed."

        };

    }

};


/* =====================================================
   HIDE BANNER
===================================================== */

Ads.hideBanner = async function () {

    try {

        return await API.hideBanner();

    }

    catch (error) {

        console.error(error);

        return {

            success: false

        };

    }

};


/* =====================================================
   PRELOAD ADS
===================================================== */

Ads.preloadAds = async function () {

    try {

        await API.preloadAds({

            network: AD_NETWORKS.MONETAG

        });

    }

    catch (error) {

        console.error(error);

    }

};


/* =====================================================
   END OF PHASE 3C.2
===================================================== */

/* =====================================================
   PHASE 3C.3
   FUTURE AD NETWORKS
   ADSTERRA
   UNITY ADS
   ADMOB
   APPLOVIN
   CUSTOM NETWORKS
===================================================== */


/* =====================================================
   GENERIC NETWORK INITIALIZER
===================================================== */

Ads.initializeNetwork = async function (

    network

) {

    try {

        if (

            !this.isNetworkSupported(

                network

            )

        ) {

            return {

                success: false,

                message:

                    "Unsupported ad network."

            };

        }

        this.registerNetwork(

            network

        );

        this.setCurrentNetwork(

            network

        );

        return await API.initializeAdNetwork({

            network

        });

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message:

                error.message

        };

    }

};


/* =====================================================
   REWARDED AD
===================================================== */

Ads.showRewarded = async function (

    network,

    placement = "default"

) {

    return await API.showRewardedAd({

        network,

        placement

    });

};


/* =====================================================
   INTERSTITIAL
===================================================== */

Ads.showInterstitialNetwork = async function (

    network,

    placement = "default"

) {

    return await API.showInterstitial({

        network,

        placement

    });

};


/* =====================================================
   BANNER
===================================================== */

Ads.showBannerNetwork = async function (

    network,

    placement = "bottom"

) {

    return await API.loadBanner({

        network,

        placement

    });

};


/* =====================================================
   NATIVE ADS
===================================================== */

Ads.showNativeAd = async function (

    network,

    placement = "feed"

) {

    return await API.showNativeAd({

        network,

        placement

    });

};


/* =====================================================
   NETWORK SHORTCUTS
===================================================== */

Ads.adsterra = {

    rewarded: placement =>

        Ads.showRewarded(

            AD_NETWORKS.ADSTERRA,

            placement

        ),

    interstitial: placement =>

        Ads.showInterstitialNetwork(

            AD_NETWORKS.ADSTERRA,

            placement

        ),

    banner: placement =>

        Ads.showBannerNetwork(

            AD_NETWORKS.ADSTERRA,

            placement

        )

};


Ads.unity = {

    rewarded: placement =>

        Ads.showRewarded(

            AD_NETWORKS.UNITY,

            placement

        ),

    interstitial: placement =>

        Ads.showInterstitialNetwork(

            AD_NETWORKS.UNITY,

            placement

        )

};


Ads.admob = {

    rewarded: placement =>

        Ads.showRewarded(

            AD_NETWORKS.ADMOB,

            placement

        ),

    interstitial: placement =>

        Ads.showInterstitialNetwork(

            AD_NETWORKS.ADMOB,

            placement

        ),

    banner: placement =>

        Ads.showBannerNetwork(

            AD_NETWORKS.ADMOB,

            placement

        )

};


Ads.facebook = {

    rewarded: placement =>

        Ads.showRewarded(


            placement

        ),

    interstitial: placement =>

        Ads.showInterstitialNetwork(


            placement

        ),

    banner: placement =>

        Ads.showBannerNetwork(


            placement

        ),

    native: placement =>

        Ads.showNativeAd(


            placement

        )

};


Ads.applovin = {

    rewarded: placement =>

        Ads.showRewarded(

            AD_NETWORKS.APPLOVIN,

            placement

        ),

    interstitial: placement =>

        Ads.showInterstitialNetwork(

            AD_NETWORKS.APPLOVIN,

            placement

        )

};


/* =====================================================
   CUSTOM NETWORK
===================================================== */

Ads.custom = async function (

    networkName,

    adType,

    placement = "default"

) {

    return await API.showCustomAd({

        network: networkName,

        type: adType,

        placement

    });

};


/* =====================================================
   END OF PHASE 3C.3
===================================================== */

/* =====================================================
   PHASE 3C.4
   REWARD VERIFICATION
   ANTI-ABUSE
   FREQUENCY LIMITS
   ANALYTICS
===================================================== */


/* =====================================================
   VERIFY AD REWARD
===================================================== */

Ads.verifyReward = async function (

    rewardToken,

    network = this.currentNetwork

) {

    try {

        const response = await API.verifyAdReward({

            network,

            rewardToken

        });

        if (!response.success) {

            return response;

        }

        const reward = Number(

            response.reward ||

            DEFAULT_REWARD

        );

        State.user.balance += reward;

        this.statistics.totalRewardEarned += reward;

        this.history.unshift({

            network,

            type: AD_TYPES.REWARDED,

            reward,

            verified: true,

            createdAt: new Date().toISOString()

        });

        return {

            success: true,

            reward

        };

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message: "Reward verification failed."

        };

    }

};


/* =====================================================
   ANTI ABUSE
===================================================== */

Ads.checkAbuse = async function (

    network,

    adType

) {

    try {

        return await API.checkAdAbuse({

            network,

            adType

        });

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            blocked: true,

            message: "Unable to validate ad request."

        };

    }

};


/* =====================================================
   FREQUENCY LIMITS
===================================================== */

Ads.canShowAd = function (

    adType

) {

    const hourAgo =

        Date.now() - 3600000;

    const recentAds = this.history.filter(

        ad =>

            new Date(

                ad.createdAt

            ).getTime()= hourAgo

    );

    if (

        recentAds.length=

        this.configuration.maxAdsPerHour

    ) {

        return false;

    }

    const lastAd = recentAds

        .filter(

            ad =>

                ad.type === adType

        )

        .pop();

    if (!lastAd) {

        return true;

    }

    const elapsed =

        (Date.now() -

        new Date(

            lastAd.createdAt

        ).getTime()) / 1000;

    return elapsed=

        this.configuration.cooldown;

};


/* =====================================================
   ANALYTICS
===================================================== */

Ads.trackEvent = async function (

    event,

    data = {}

) {

    try {

        return await API.trackAdEvent({

            event,

            network: this.currentNetwork,

            ...data

        });

    }

    catch (error) {

        console.error(error);

        return {

            success: false

        };

    }

};


Ads.getAnalytics = function () {

    return {

        network: this.currentNetwork,

        watched: this.statistics.adsWatched,

        rewarded: this.statistics.rewardedAds,

        interstitial:

            this.statistics.interstitialAds,

        banner:

            this.statistics.bannerViews,

        earned:

            this.statistics.totalRewardEarned,

        failed:

            this.statistics.failedAds,

        history:

            this.history.length

    };

};


/* =====================================================
   RECORD FAILURE
===================================================== */

Ads.recordFailure = function (

    network,

    adType

) {

    this.statistics.failedAds++;

    this.history.unshift({

        network,

        type: adType,

        status: AD_STATUS.FAILED,

        createdAt: new Date().toISOString()

    });

};


/* =====================================================
   END OF PHASE 3C.4
===================================================== */

/* =====================================================
   PHASE 3C.5
   PRODUCTION OPTIMIZATION
   SYNCHRONIZATION
   EXPORT
===================================================== */


/* =====================================================
   SYNCHRONIZE
===================================================== */

Ads.sync = async function () {

    try {

        this.setSyncing(true);

        const response = await API.getAdsState();

        if (!response.success) {

            throw new Error(

                response.message ||

                "Failed to synchronize ads."

            );

        }

        this.configuration = {

            ...this.configuration,

            ...(response.configuration || {})

        };

        this.statistics = {

            ...this.statistics,

            ...(response.statistics || {})

        };

        this.history =

            response.history || [];

        this.networks =

            response.networks || [];

        if (

            response.currentNetwork

        ) {

            this.currentNetwork =

                response.currentNetwork;

        }

        return {

            success: true

        };

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message: error.message

        };

    }

    finally {

        this.setSyncing(false);

    }

};


/* =====================================================
   PRELOAD
===================================================== */

Ads.preload = async function () {

    try {

        await this.preloadAds();

    }

    catch (error) {

        console.error(error);

    }

};


/* =====================================================
   STATUS
===================================================== */

Ads.status = function () {

    return {

        initialized: this.initialized,

        loading: this.loading,

        showing: this.showing,

        syncing: this.syncing,

        network: this.currentNetwork,

        registeredNetworks:

            this.networks.length,

        watched:

            this.statistics.adsWatched,

        earned:

            this.statistics.totalRewardEarned

    };

};


/* =====================================================
   RESET
===================================================== */

Ads.reset = function () {

    this.loading = false;

    this.showing = false;

    this.syncing = false;

    this.currentAd = null;

    this.history = [];

    this.rewardedQueue = [];

    this.statistics = {

        adsWatched: 0,

        rewardedAds: 0,

        interstitialAds: 0,

        bannerViews: 0,

        totalRewardEarned: 0,

        failedAds: 0

    };

    this.initialized = false;

};


/* =====================================================
   ERROR HANDLER
===================================================== */

Ads.handleError = function (

    error,

    context = "Ads"

) {

    console.error(

        `[${context}]`,

        error

    );

    return {

        success: false,

        context,

        message:

            error?.message ||

            "Unknown ads error.",

        error

    };

};


/* =====================================================
   INITIALIZE
===================================================== */

Ads.initialize = async function () {

    if (

        this.initialized

    ) {

        return;

    }

    try {

        await this.initializeMonetag();

        await this.sync();

        await this.preload();

        this.initialized = true;

    }

    catch (error) {

        this.handleError(

            error,

            "Initialization"

        );

    }

};


/* =====================================================
   STARTUP
===================================================== */

window.addEventListener(

    "DOMContentLoaded",

    async () => {

        await Ads.initialize();

    }



/* =====================================================
   PRODUCTION EXPORT
===================================================== */

export default Ads;


/* =====================================================
   END OF FILE
   frontend/js/ads.js
   CROWN PRINCE REWARD HUB
   PRODUCTION BUILD
===================================================== */o

