"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - WALLET MODULE
   CLEAN RECONSTRUCTION - PHASE 4 (FEATURE MODULES)
===================================================== */

import Api from "./api.js";
import State from "./state.js";
import Settings from "./settings.js";
import Utils from "./utils.js";

const WALLET_TYPES = { MAIN: "main", BONUS: "bonus", REFERRAL: "referral", PENDING: "pending" };
const TRANSACTION_TYPES = {
    TASK_REWARD: "task_reward", DAILY_BONUS: "daily_bonus", REFERRAL: "referral",
    SPIN_WHEEL: "spin_wheel", MYSTERY_BOX: "mystery_box", WATCH_AD: "watch_ad",
    WITHDRAWAL: "withdrawal", PROMOTION: "promotion"
};
const TRANSACTION_STATUS = { PENDING: "pending", COMPLETED: "completed", FAILED: "failed" };

const Wallet = {
    initialized: false,
    loading: false,
    syncing: false,
    processing: false,
    activeWallet: WALLET_TYPES.MAIN,
    wallets: { main: 0, bonus: 0, referral: 0, pending: 0 },
    summary: { available: 0, pending: 0, earned: 0, spent: 0, withdrawn: 0 },
    transactions: [],
    recentTransactions: [],
    withdrawals: [],
    cacheKey: "rewardhub_wallet_cache",
    page: 1,
    pageSize: 20,
    totalTransactions: 0,
    hasMore: true,
    filters: { type: "all", status: "all", from: null, to: null }
};

/* --- GETTERS --- */
Wallet.getAvailableBalance = function () { return this.summary.available; };
Wallet.getPendingBalance = function () { return this.summary.pending; };
Wallet.getEarnedBalance = function () { return this.summary.earned; };
Wallet.getSpentBalance = function () { return this.summary.spent; };
Wallet.getRecentTransactions = function () { return this.recentTransactions; };
Wallet.getMinimumWithdrawal = function () { return Settings.getMinimumWithdrawal(); };

/* --- BALANCE MANAGEMENT --- */
Wallet.loadBalance = async function () {
    try {
        this.loading = true;
        const user = State.getUser();
        const response = await Api.getWalletBalance(user?.user_id);
        if (response.success && response.data) {
            this.wallets.main = response.data.balance || 0;
            this.wallets.pending = response.data.pending || 0;
            this.updateSummary();
        }
        return response;
    } catch (e) { return { success: false, message: e.message }; }
    finally { this.loading = false; }
};

Wallet.updateSummary = function () {
    this.summary.available = Number(this.wallets.main || 0);
    this.summary.pending = Number(this.wallets.pending || 0);
};

Wallet.credit = function (amount) {
    const val = Number(amount || 0);
    if (val <= 0) return false;
    this.wallets.main += val;
    this.summary.earned += val;
    this.updateSummary();
    const user = State.getUser();
    if (user) user.balance = this.wallets.main;
    return true;
};

/* --- TRANSACTION LOGIC --- */
Wallet.loadTransactions = async function (refresh = false) {
    try {
        if (refresh) { this.page = 1; this.transactions = []; }
        const user = State.getUser();
        const response = await Api.getTransactions(user?.user_id);
        if (response.success) {
            this.transactions = response.data || [];
            this.recentTransactions = this.transactions.slice(0, 10);
        }
        return response;
    } catch (e) { return { success: false, message: e.message }; }
};

Wallet.addTransaction = function (tx) {
    this.transactions.unshift(tx);
    this.recentTransactions = this.transactions.slice(0, 10);
};

/* --- WITHDRAWAL SYSTEM --- */
Wallet.requestWithdrawal = async function (data) {
    try {
        this.processing = true;
        const response = await Api.requestWithdrawal(data);
        if (response.success) {
            const amount = Number(data.amount);
            this.wallets.main -= amount;
            this.wallets.pending += amount;
            this.updateSummary();
            this.addTransaction({
                id: "WD-" + Date.now(),
                type: TRANSACTION_TYPES.WITHDRAWAL,
                amount: -amount,
                status: TRANSACTION_STATUS.PENDING,
                createdAt: new Date().toISOString()
            });
            this.saveCache();
        }
        return response;
    } catch (e) { return { success: false, message: e.message }; }
    finally { this.processing = false; }
};

/* --- REWARDS & BONUSES --- */
Wallet.claimDailyBonus = async function () {
    try {
        const response = await Api.claimDailyBonus({ user_id: State.getUser()?.user_id });
        if (response.success) {
            const reward = Number(response.reward || 0);
            this.credit(reward);
            this.addTransaction({
                id: "DB-" + Date.now(),
                type: TRANSACTION_TYPES.DAILY_BONUS,
                amount: reward,
                status: TRANSACTION_STATUS.COMPLETED,
                createdAt: new Date().toISOString()
            });
            this.saveCache();
        }
        return response;
    } catch (e) { return { success: false, message: e.message }; }
};

Wallet.redeemPromoCode = async function (code) {
    try {
        const response = await Api.post("/rewards/promo", { code, user_id: State.getUser()?.user_id });
        if (response.success) {
            const reward = Number(response.reward || 0);
            if (reward > 0) this.credit(reward); // FIXED operator
            this.saveCache();
        }
        return response;
    } catch (e) { return { success: false, message: e.message }; }
};

/* --- ADMIN CONTROLS --- */
Wallet.admin = { frozen: false, frozenReason: "" };
Wallet.freeze = async function (userId, reason = "") {
    const response = await Api.post("/admin/wallet/freeze", { userId, reason });
    if (response.success && State.getUser()?.user_id === userId) this.admin.frozen = true;
    return response;
};

/* --- SYNC & CACHE --- */
Wallet.saveCache = function () {
    try {
        localStorage.setItem(this.cacheKey, JSON.stringify({
            wallets: this.wallets,
            summary: this.summary,
            transactions: this.transactions,
            recentTransactions: this.recentTransactions,
            timestamp: Date.now()
        })); // FIXED missing closing paren
    } catch (e) { console.error(e); }
};

Wallet.loadCache = function () {
    try {
        const data = JSON.parse(localStorage.getItem(this.cacheKey));
        if (!data) return false;
        this.wallets = data.wallets;
        this.summary = data.summary;
        this.transactions = data.transactions || [];
        this.recentTransactions = data.recentTransactions || [];
        return true;
    } catch (e) { return false; }
};

Wallet.sync = async function () {
    try {
        this.syncing = true;
        await this.loadBalance();
        await this.loadTransactions(true);
        this.saveCache();
        return { success: true };
    } catch (e) { return { success: false }; }
    finally { this.syncing = false; }
};

Wallet.optimize = function () {
    if (this.transactions.length > 100) { // FIXED operator
        this.transactions = this.transactions.slice(0, 100);
    }
    this.saveCache();
};

Wallet.initialize = async function () {
    if (this.initialized) return;
    this.loadCache();
    await this.sync();
    this.initialized = true;
    console.log("Wallet Module Initialized.");
};

export default Wallet;
