"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB
   TELEGRAM MINI APP
   REWARDS.JS
   PHASE 3B.1
   IMPORTS
   CONSTANTS
   REWARD STATE
===================================================== */

import API from "./api.js";
import State from "./state.js";
import Settings from "./settings.js";
import UI from "./ui.js";
import Utils from "./utils.js";

/* =====================================================
   CONSTANTS
===================================================== */

const REWARD_TYPES = {

    DAILY: "daily",

    TASK: "task",

    REFERRAL: "referral",

    SPIN: "spin",

    MYSTERY_BOX: "mystery_box",

    WATCH_AD: "watch_ad",

    ACHIEVEMENT: "achievement",

    LEVEL_UP: "level_up",

    BONUS: "bonus",

    PROMOTION: "promotion"

};

const REWARD_STATUS = {

    AVAILABLE: "available",

    CLAIMED: "claimed",

    PENDING: "pending",

    EXPIRED: "expired"

};

const DEFAULT_COOLDOWN = 86400;

/* =====================================================
   REWARD STATE
===================================================== */

const Rewards = {

    initialized: false,

    loading: false,

    syncing: false,

    claiming: false,

    currentReward: null,

    rewards: [],

    history: [],

    dailyBonus: null,

    spinWheel: null,

    mysteryBox: null,

    cooldowns: {},

    statistics: {

        totalEarned: 0,

        totalClaimed: 0,

        pendingRewards: 0,

        availableRewards: 0,

        spinsToday: 0,

        mysteryBoxesOpened: 0,

        dailyBonusesClaimed: 0

    }

};

/* =====================================================
   GETTERS
===================================================== */

Rewards.getRewards = function () {

    return this.rewards;

};

Rewards.getHistory = function () {

    return this.history;

};

Rewards.getCurrentReward = function () {

    return this.currentReward;

};

Rewards.getStatistics = function () {

    return this.statistics;

};

Rewards.getDailyBonus = function () {

    return this.dailyBonus;

};

Rewards.getSpinWheel = function () {

    return this.spinWheel;

};

Rewards.getMysteryBox = function () {

    return this.mysteryBox;

};

/* =====================================================
   SETTERS
===================================================== */

Rewards.setCurrentReward = function (

    reward

) {

    this.currentReward = reward;

};

Rewards.setLoading = function (

    value

) {

    this.loading = value;

};

Rewards.setSyncing = function (

    value

) {

    this.syncing = value;

};

Rewards.setClaiming = function (

    value

) {

    this.claiming = value;

};

/* =====================================================
   COOLDOWNS
===================================================== */

Rewards.setCooldown = function (

    type,

    seconds = DEFAULT_COOLDOWN

) {

    this.cooldowns[type] =

        Date.now() +

        (seconds * 1000);

};

Rewards.getCooldown = function (

    type

) {

    return this.cooldowns[type] || 0;

};

Rewards.isAvailable = function (

    type

) {

    return Date.now() >=

        this.getCooldown(type);

};

/* =====================================================
   END OF PHASE 3B.1
===================================================== */

/* =====================================================
   PHASE 3B.2
   DAILY BONUS SYSTEM
===================================================== */


/* =====================================================
   LOAD DAILY BONUS
===================================================== */

Rewards.loadDailyBonus = async function () {

    try {

        this.setLoading(true);

        const response = await API.getDailyBonus();

        if (!response.success) {

            throw new Error(

                response.message ||

                "Unable to load daily bonus."

            );

        }

        this.dailyBonus = response.dailyBonus;

        return response;

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message: error.message

        };

    }

    finally {

        this.setLoading(false);

    }

};


/* =====================================================
   CHECK ELIGIBILITY
===================================================== */

Rewards.canClaimDailyBonus = function () {

    if (!this.dailyBonus) {

        return false;

    }

    if (

        this.dailyBonus.claimed

    ) {

        return false;

    }

    return this.isAvailable(

        REWARD_TYPES.DAILY

    );

};


/* =====================================================
   CLAIM DAILY BONUS
===================================================== */

Rewards.claimDailyBonus = async function () {

    try {

        if (

            !this.canClaimDailyBonus()

        ) {

            return {

                success: false,

                message:

                    "Daily bonus is not available."

            };

        }

        this.setClaiming(true);

        const response = await API.claimDailyBonus();

        if (!response.success) {

            return response;

        }

        this.dailyBonus.claimed = true;

        this.dailyBonus.claimedAt =

            new Date().toISOString();

        this.setCooldown(

            REWARD_TYPES.DAILY,

            response.cooldown ||

            DEFAULT_COOLDOWN

        );

        const reward = Number(

            response.reward || 0

        );

        State.user.balance += reward;

        this.statistics.totalEarned += reward;

        this.statistics.totalClaimed++;

        this.statistics.dailyBonusesClaimed++;

        this.history.unshift({

            type: REWARD_TYPES.DAILY,

            reward,

            claimedAt:

                this.dailyBonus.claimedAt

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

            message:

                error.message

        };

    }

    finally {

        this.setClaiming(false);

    }

};


/* =====================================================
   BONUS STREAK
===================================================== */

Rewards.getDailyStreak = function () {

    return this.dailyBonus?.streak || 0;

};


Rewards.getNextDailyBonusTime = function () {

    return this.getCooldown(

        REWARD_TYPES.DAILY

    );

};


/* =====================================================
   RESET DAILY BONUS
===================================================== */

Rewards.resetDailyBonus = function () {

    this.dailyBonus = null;

    delete this.cooldowns[

        REWARD_TYPES.DAILY

    ];

};


/* =====================================================
   END OF PHASE 3B.2
===================================================== */

/* =====================================================
   PHASE 3B.3
   SPIN WHEEL
   MYSTERY BOX
   LUCKY DRAW
===================================================== */


/* =====================================================
   LOAD SPIN WHEEL
===================================================== */

Rewards.loadSpinWheel = async function () {

    try {

        const response = await API.getSpinWheel();

        if (response.success) {

            this.spinWheel = response.spinWheel;

        }

        return response;

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message: "Unable to load Spin Wheel."

        };

    }

};


/* =====================================================
   SPIN WHEEL
===================================================== */

Rewards.spin = async function () {

    try {

        if (

            !this.isAvailable(

                REWARD_TYPES.SPIN

            )

        ) {

            return {

                success: false,

                message: "Spin cooldown active."

            };

        }

        this.setClaiming(true);

        const response = await API.spinWheel();

        if (!response.success) {

            return response;

        }

        const reward = Number(

            response.reward || 0

        );

        State.user.balance += reward;

        this.statistics.totalEarned += reward;

        this.statistics.totalClaimed++;

        this.statistics.spinsToday++;

        this.setCooldown(

            REWARD_TYPES.SPIN,

            response.cooldown || 3600

        );

        this.history.unshift({

            type: REWARD_TYPES.SPIN,

            reward,

            claimedAt:

                new Date().toISOString()

        });

        return {

            success: true,

            reward,

            prize:

                response.prize

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

        this.setClaiming(false);

    }

};


/* =====================================================
   LOAD MYSTERY BOX
===================================================== */

Rewards.loadMysteryBox = async function () {

    try {

        const response = await API.getMysteryBox();

        if (response.success) {

            this.mysteryBox = response.mysteryBox;

        }

        return response;

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message: "Unable to load Mystery Box."

        };

    }

};


/* =====================================================
   OPEN MYSTERY BOX
===================================================== */

Rewards.openMysteryBox = async function () {

    try {

        if (

            !this.isAvailable(

                REWARD_TYPES.MYSTERY_BOX

            )

        ) {

            return {

                success: false,

                message: "Mystery Box cooldown active."

            };

        }

        this.setClaiming(true);

        const response = await API.openMysteryBox();

        if (!response.success) {

            return response;

        }

        const reward = Number(

            response.reward || 0

        );

        State.user.balance += reward;

        this.statistics.totalEarned += reward;

        this.statistics.totalClaimed++;

        this.statistics.mysteryBoxesOpened++;

        this.setCooldown(

            REWARD_TYPES.MYSTERY_BOX,

            response.cooldown || 86400

        );

        this.history.unshift({

            type:

                REWARD_TYPES.MYSTERY_BOX,

            reward,

            claimedAt:

                new Date().toISOString()

        });

        return {

            success: true,

            reward,

            prize:

                response.prize

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

        this.setClaiming(false);

    }

};


/* =====================================================
   LUCKY DRAW
===================================================== */

Rewards.enterLuckyDraw = async function () {

    try {

        return await API.enterLuckyDraw();

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message: "Unable to join Lucky Draw."

        };

    }

};


Rewards.getLuckyDrawStatus = async function () {

    try {

        return await API.getLuckyDrawStatus();

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message: "Unable to retrieve Lucky Draw status."

        };

    }

};


/* =====================================================
   END OF PHASE 3B.3
===================================================== */

/* =====================================================
   PHASE 3B.4
   ACHIEVEMENT REWARDS
   LEVEL UP REWARDS
   REFERRAL BONUSES
===================================================== */


/* =====================================================
   ACHIEVEMENT REWARDS
===================================================== */

Rewards.claimAchievementReward = async function (

    achievementId

) {

    try {

        this.setClaiming(true);

        const response = await API.claimAchievementReward({

            achievementId

        });

        if (!response.success) {

            return response;

        }

        const reward = Number(

            response.reward || 0

        );

        State.user.balance += reward;

        this.statistics.totalEarned += reward;

        this.statistics.totalClaimed++;

        this.history.unshift({

            type: REWARD_TYPES.ACHIEVEMENT,

            reward,

            achievementId,

            claimedAt: new Date().toISOString()

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

            message: error.message

        };

    }

    finally {

        this.setClaiming(false);

    }

};


/* =====================================================
   LEVEL UP REWARDS
===================================================== */

Rewards.claimLevelReward = async function (

    level

) {

    try {

        this.setClaiming(true);

        const response = await API.claimLevelReward({

            level

        });

        if (!response.success) {

            return response;

        }

        const reward = Number(

            response.reward || 0

        );

        State.user.balance += reward;

        this.statistics.totalEarned += reward;

        this.statistics.totalClaimed++;

        this.history.unshift({

            type: REWARD_TYPES.LEVEL_UP,

            reward,

            level,

            claimedAt: new Date().toISOString()

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

            message: error.message

        };

    }

    finally {

        this.setClaiming(false);

    }

};


/* =====================================================
   REFERRAL BONUS
===================================================== */

Rewards.claimReferralBonus = async function () {

    try {

        this.setClaiming(true);

        const response = await API.claimReferralBonus();

        if (!response.success) {

            return response;

        }

        const reward = Number(

            response.reward || 0

        );

        State.user.balance += reward;

        this.statistics.totalEarned += reward;

        this.statistics.totalClaimed++;

        this.history.unshift({

            type: REWARD_TYPES.REFERRAL,

            reward,

            claimedAt: new Date().toISOString()

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

            message: error.message

        };

    }

    finally {

        this.setClaiming(false);

    }

};


/* =====================================================
   BONUS REWARDS
===================================================== */

Rewards.claimBonusReward = async function (

    bonusId

) {

    try {

        const response = await API.claimBonusReward({

            bonusId

        });

        if (!response.success) {

            return response;

        }

        const reward = Number(

            response.reward || 0

        );

        State.user.balance += reward;

        this.statistics.totalEarned += reward;

        this.statistics.totalClaimed++;

        this.history.unshift({

            type: REWARD_TYPES.BONUS,

            reward,

            bonusId,

            claimedAt: new Date().toISOString()

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

            message: error.message

        };

    }

};


/* =====================================================
   PROMOTIONAL REWARDS
===================================================== */

Rewards.claimPromotionReward = async function (

    promotionId

) {

    return await API.claimPromotionReward({

        promotionId

    });

};


/* =====================================================
   END OF PHASE 3B.4
===================================================== */o

/* =====================================================
   PHASE 3B.5
   REWARD SYNCHRONIZATION
   COOLDOWNS
   PRODUCTION EXPORT
===================================================== */


/* =====================================================
   SYNCHRONIZATION
===================================================== */

Rewards.sync = async function () {

    try {

        this.setSyncing(true);

        const response = await API.getRewards();

        if (!response.success) {

            throw new Error(

                response.message ||

                "Unable to synchronize rewards."

            );

        }

        this.rewards = response.rewards || [];

        this.history = response.history || [];

        this.statistics = {

            ...this.statistics,

            ...(response.statistics || {})

        };

        await this.loadDailyBonus();

        await this.loadSpinWheel();

        await this.loadMysteryBox();

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
   COOLDOWNS
===================================================== */

Rewards.updateCooldowns = function () {

    const now = Date.now();

    Object.keys(this.cooldowns).forEach(type => {

        if (this.cooldowns[type] <= now) {

            delete this.cooldowns[type];

        }

    });

};


Rewards.getRemainingCooldown = function (

    type

) {

    const expires = this.getCooldown(type);

    if (!expires) return 0;

    return Math.max(

        0,

        Math.floor(

            (expires - Date.now()) / 1000

        )

    );

};


Rewards.startCooldownTimer = function () {

    if (this.cooldownTimer) {

        clearInterval(this.cooldownTimer);

    }

    this.cooldownTimer = setInterval(() => {

        this.updateCooldowns();

    }, 1000);

};


/* =====================================================
   INITIALIZATION
===================================================== */

Rewards.initialize = async function () {

    if (

        this.initialized

    ) {

        return;

    }

    await this.sync();

    this.startCooldownTimer();

    this.initialized = true;

};


/* =====================================================
   STATUS
===================================================== */

Rewards.status = function () {

    return {

        initialized: this.initialized,

        loading: this.loading,

        syncing: this.syncing,

        claiming: this.claiming,

        rewards: this.rewards.length,

        history: this.history.length,

        statistics: this.statistics,

        cooldowns: this.cooldowns

    };

};


/* =====================================================
   RESET
===================================================== */

Rewards.reset = function () {

    this.loading = false;

    this.syncing = false;

    this.claiming = false;

    this.currentReward = null;

    this.rewards = [];

    this.history = [];

    this.dailyBonus = null;

    this.spinWheel = null;

    this.mysteryBox = null;

    this.cooldowns = {};

    this.statistics = {

        totalEarned: 0,

        totalClaimed: 0,

        pendingRewards: 0,

        availableRewards: 0,

        spinsToday: 0,

        mysteryBoxesOpened: 0,

        dailyBonusesClaimed: 0

    };

    this.initialized = false;

    if (this.cooldownTimer) {

        clearInterval(this.cooldownTimer);

        this.cooldownTimer = null;

    }

};


/* =====================================================
   ERROR HANDLER
===================================================== */

Rewards.handleError = function (

    error,

    context = "Rewards"

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

            "Unknown rewards error.",

        error

    };

};


/* =====================================================
   STARTUP
===================================================== */

window.addEventListener(

    "DOMContentLoaded",

    async () => {

        try {

            await Rewards.initialize();

        }

        catch (error) {

            Rewards.handleError(

                error,

                "Initialization"

            );

        }

    }

);


/* =====================================================
   PRODUCTION EXPORT
===================================================== */

export default Rewards;


/* =====================================================
   END OF FILE
   frontend/js/rewards.js
   CROWN PRINCE REWARD HUB
   PRODUCTION BUILD
===================================================== */
