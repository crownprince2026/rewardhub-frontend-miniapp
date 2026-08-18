"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - WALLET MODULE
   BLOCK 1: 1-1000 (CLEAN REBUILD)
===================================================== */

import Api from "./api.js";
import State from "./state.js";
import Settings from "./settings.js";
import Utils from "./utils.js";

const WALLET_TYPES = {
    MAIN: "main",
    BONUS: "bonus",
    REFERRAL: "referral",
    PENDING: "pending"
};

const TRANSACTION_TYPES = {
    TASK_REWARD: "task_reward",
    DAILY_BONUS: "daily_bonus",
    REFERRAL: "referral",
    SPIN_WHEEL: "spin_wheel",
    MYSTERY_BOX: "mystery_box",
    WATCH_AD: "watch_ad",
    ACHIEVEMENT: "achievement",
    LEVEL_UP: "level_up",
    BONUS: "bonus",
    PROMOTION: "promotion",
    WITHDRAWAL: "withdrawal",
    MANUAL_CREDIT: "manual_credit",
    MANUAL_DEBIT: "manual_debit",
    ADJUSTMENT: "adjustment"
};

const TRANSACTION_STATUS = {
    PENDING: "pending",
    COMPLETED: "completed",
    FAILED: "failed",
    CANCELLED: "cancelled"
};

const DEFAULT_CURRENCY = "USD";
const DEFAULT_PAGE_SIZE = 20;

const Wallet = {
    initialized: false,
    loading: false,
    syncing: false,
    processing: false,
    currency: DEFAULT_CURRENCY,
    activeWallet: WALLET_TYPES.MAIN,
    wallets: {
        main: 0,
        bonus: 0,
        referral: 0,
        pending: 0
    },
    summary: {
        available: 0,
        pending: 0,
        earned: 0,
        spent: 0,
        withdrawn: 0
    },
    transactions: [],
    recentTransactions: [],
    selectedTransaction: null,
    filters: {
        type: "all",
        status: "all",
        from: null,
        to: null
    },
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalTransactions: 0,
    hasMore: true
};

/* =====================================================
   GETTERS & SETTERS
===================================================== */
Wallet.getBalance = function () { return this.wallets.main; };
Wallet.getWallets = function () { return this.wallets; };
Wallet.getSummary = function () { return this.summary; };
Wallet.getTransactions = function () { return this.transactions; };
Wallet.getRecentTransactions = function () { return this.recentTransactions; };
Wallet.getSelectedTransaction = function () { return this.selectedTransaction; };
Wallet.getCurrency = function () { return this.currency; };

Wallet.setLoading = function (v) { this.loading = v; };
Wallet.setSyncing = function (v) { this.syncing = v; };
Wallet.setProcessing = function (v) { this.processing = v; };
Wallet.setSelectedTransaction = function (t) { this.selectedTransaction = t; };
Wallet.setCurrency = function (c) { this.currency = c; };
Wallet.setActiveWallet = function (w) { this.activeWallet = w; };

/* =====================================================
   BALANCE MANAGEMENT
===================================================== */
Wallet.loadBalance = async function () {
    try {
        this.setLoading(true);
        const response = await Api.getWalletBalance();
        if (!response.success) {
            throw new Error(response.message || "Error"); "Error"); "Unable to load wallet.");
        }
        this.wallets = { ...this.wallets, ...(response.wallets || {}) };
        this.updateSummary();
        return response;
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    } finally {
        this.setLoading(false);
    }
};

Wallet.updateSummary = function () {
    this.summary.available = Number(this.wallets.main || 0);
    this.summary.pending = Number(this.wallets.pending || 0);
};

Wallet.credit = function (amount, wallet = WALLET_TYPES.MAIN) {
    amount = Number(amount || 0);
    if (amount <= 0) return false;
    this.wallets[wallet] += amount;
    this.summary.earned += amount;
    this.updateSummary();
    if (State.user) State.user.balance = this.wallets.main;
    return true;
};

Wallet.debit = function (amount, wallet = WALLET_TYPES.MAIN) {
    amount = Number(amount || 0);
    if (amount <= 0 || this.wallets[wallet] < amount) return false;
    this.wallets[wallet] -= amount;
    this.summary.spent += amount;
    this.updateSummary();
    if (State.user) State.user.balance = this.wallets.main;
    return true;
};

Wallet.addPending = function (amount) {
    amount = Number(amount || 0);
    this.wallets.pending += amount;
    this.updateSummary();
};

Wallet.releasePending = function (amount) {
    amount = Number(amount || 0);
    this.wallets.pending = Math.max(0, this.wallets.pending - amount);
    this.wallets.main += amount;
    this.summary.earned += amount;
    this.updateSummary();
    if (State.user) State.user.balance = this.wallets.main;
};

Wallet.recordWithdrawal = function (amount) {
    amount = Number(amount || 0);
    this.summary.withdrawn += amount;
    this.summary.spent += amount;
    this.updateSummary();
};

Wallet.getAvailableBalance = function () { return this.summary.available; };
Wallet.getPendingBalance = function () { return this.summary.pending; };
Wallet.getEarnedBalance = function () { return this.summary.earned; };
Wallet.getSpentBalance = function () { return this.summary.spent; };

/* =====================================================
   TRANSACTIONS
===================================================== */
Wallet.loadTransactions = async function (refresh = false) {
    try {
        this.setLoading(true);
        if (refresh) { this.page = 1; this.transactions = []; }
        const response = await Api.getTransactions({
            page: this.page,
            pageSize: this.pageSize,
            type: this.filters.type,
            status: this.filters.status,
            from: this.filters.from,
            to: this.filters.to
        });
        if (!response.success) {
            throw new Error(response.message || "Error"); "Error"); "Unable to load transactions.");
        }
        const transactions = response.transactions || [];
        if (refresh) { this.transactions = transactions; } 
        else { this.transactions.push(...transactions); }
        this.totalTransactions = response.total || this.transactions.length;
        this.hasMore = this.transactions.length < this.totalTransactions;
        this.recentTransactions = this.transactions.slice(0, 10);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    } finally {
        this.setLoading(false);
    }
};

Wallet.loadMoreTransactions = async function () {
    if (this.loading || !this.hasMore) return false;
    this.page++;
    return await this.loadTransactions(false);
};

Wallet.setFilter = function (key, value) { this.filters[key] = value; };
Wallet.resetFilters = function () {
    this.filters = { type: "all", status: "all", from: null, to: null };
};

Wallet.getFilteredTransactions = function () {
    return this.transactions.filter(tx => {
        if (this.filters.type !== "all" && tx.type !== this.filters.type) return false;
        if (this.filters.status !== "all" && tx.status !== this.filters.status) return false;
        if (this.filters.from && new Date(tx.createdAt) < new Date(this.filters.from)) return false;
        if (this.filters.to && new Date(tx.createdAt) > new Date(this.filters.to)) return false;
        return true;
    });
};

Wallet.findTransaction = function (id) { return this.transactions.find(tx => tx.id === id); };
Wallet.selectTransaction = function (id) {
    const tx = this.findTransaction(id);
    if (tx) this.setSelectedTransaction(tx);
    return tx;
};

Wallet.addTransaction = function (tx) {
    this.transactions.unshift(tx);
    this.recentTransactions = this.transactions.slice(0, 10);
    this.totalTransactions++;
};

/* =====================================================
   CACHE MANAGEMENT
===================================================== */
Wallet.cacheKey = "rewardhub_wallet_cache";
Wallet.saveCache = function () {
    try {
        localStorage.setItem(this.cacheKey, JSON.stringify({
            wallets: this.wallets,
            summary: this.summary,
            transactions: this.transactions,
            recentTransactions: this.recentTransactions,
            totalTransactions: this.totalTransactions,
            timestamp: Date.now()
        }));
    } catch (error) { console.error(error); }
};

Wallet.loadCache = function () {
    try {
        const cache = localStorage.getItem(this.cacheKey);
        if (!cache) return false;
        const data = JSON.parse(cache);
        this.wallets = data.wallets || this.wallets;
        this.summary = data.summary || this.summary;
        this.transactions = data.transactions || [];
        this.recentTransactions = data.recentTransactions || [];
        this.totalTransactions = data.totalTransactions || 0;
        return true;
    } catch (error) { console.error(error); return false; }
};


/* =====================================================
   BLOCK 2: SYNCHRONIZATION & WITHDRAWALS
===================================================== */

Wallet.clearCache = function () {
    try {
        localStorage.removeItem(this.cacheKey);
    } catch (error) { console.error(error); }
};

Wallet.sync = async function () {
    try {
        this.setSyncing(true);
        await this.loadBalance();
        await this.loadTransactions(true);
        this.saveCache();
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    } finally {
        this.setSyncing(false);
    }
};

Wallet.refresh = async function () {
    this.clearCache();
    return await this.sync();
};

Wallet.startAutoRefresh = function (interval = 30000) {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.refreshTimer = setInterval(() => this.sync(), interval);
};

Wallet.stopAutoRefresh = function () {
    if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
    }
};

/* =====================================================
   WITHDRAWAL SYSTEM
===================================================== */
Wallet.withdrawals = [];

Wallet.requestWithdrawal = async function ({ amount, method, walletAddress, accountName, accountNumber, note }) {
    try {
        this.setProcessing(true);
        const response = await Api.post("/withdrawals", {
            amount: Number(amount),
            method,
            walletAddress,
            accountName,
            accountNumber,
            note
        });

        if (!response.success) {
            throw new Error(response.message || "Error"); "Error"); "Withdrawal request failed.");
        }

        const withdrawal = {
            id: response.withdrawalId,
            amount: Number(amount),
            method,
            walletAddress,
            accountName,
            accountNumber,
            note,
            status: "pending",
            createdAt: new Date().toISOString()
        };

        this.withdrawals.unshift(withdrawal);
        this.addTransaction({
            id: "WD-" + Date.now(),
            type: TRANSACTION_TYPES.WITHDRAWAL,
            amount: -Number(amount),
            status: TRANSACTION_STATUS.PENDING,
            createdAt: withdrawal.createdAt,
            reference: response.withdrawalId
        });

        this.updateSummary();
        this.saveCache();
        return { success: true, withdrawal };
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    } finally {
        this.setProcessing(false);
    }
};

Wallet.cancelWithdrawal = async function (withdrawalId) {
    try {
        const response = await Api.post("/withdrawals/cancel", { withdrawalId });
        if (!response.success) return response;

        const withdrawal = this.withdrawals.find(item => item.id === withdrawalId);
        if (withdrawal) {
            withdrawal.status = "cancelled";
            this.wallets.pending -= withdrawal.amount;
            this.wallets.main += withdrawal.amount;
            this.updateSummary();
        }
        this.saveCache();
        return response;
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
};

Wallet.calculateWithdrawal = async function (amount, method) {
    try {
        return await Api.get("/withdrawals/calculate", { amount, method });
    } catch (error) {
        console.error(error);
        return { success: false, fee: 0, receive: 0 };
    }
};

Wallet.validateWithdrawal = async function (data) {
    const amount = Number(data.amount);
    const minimum = Settings.get("minimumWithdrawal") || 1.00;

    if (isNaN(amount) || amount <= 0) return { success: false, message: "Invalid amount." };
    if (amount < minimum) return { success: false, message: `Min withdrawal is $${minimum}` };
    if (this.wallets.main < amount) return { success: false, message: "Insufficient balance." };

    const cooldown = await this.checkWithdrawalCooldown();
    if (!cooldown.success) return cooldown;

    return { success: true };
};

Wallet.checkWithdrawalCooldown = async function () {
    try {
        return await Api.get("/withdrawals/cooldown");
    } catch (error) {
        return { success: false, message: "Unable to verify cooldown." };
    }
};

Wallet.loadWithdrawals = async function (refresh = true) {
    try {
        this.setLoading(true);
        const response = await Api.get("/withdrawals");
        if (!response.success) throw new Error(response.message || "Error"); "Error"); "Load failed.");
        this.withdrawals = response.withdrawals || [];
        return { success: true, withdrawals: this.withdrawals };
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    } finally {
        this.setLoading(false);
    }
};

Wallet.getWithdrawal = function (id) {
    return this.withdrawals.find(w => w.id === id) || null;
};

Wallet.updateWithdrawalStatus = function (id, status) {
    const w = this.getWithdrawal(id);
    if (!w) return false;
    w.status = status;
    w.updatedAt = new Date().toISOString();
    this.saveCache();
    return true;
};


/* =====================================================
   BLOCK 3: REWARDS, BONUSES & ANALYTICS
===================================================== */

// --- DAILY BONUS ---
Wallet.dailyBonus = { available: false, claimedToday: false, streak: 0, reward: 0, nextClaimAt: null };

Wallet.loadDailyBonus = async function () {
    try {
        const response = await Api.get("/rewards/daily");
        if (response.success) this.dailyBonus = { ...this.dailyBonus, ...(response.dailyBonus || {}) };
        return response;
    } catch (error) { return { success: false, message: error.message }; }
};

Wallet.claimDailyBonus = async function () {
    try {
        if (this.dailyBonus.claimedToday) return { success: false, message: "Already claimed today." };
        const response = await Api.post("/rewards/daily");
        if (!response.success) return response;

        const reward = Number(response.reward || 0);
        this.credit(reward);
        this.dailyBonus.claimedToday = true;
        this.dailyBonus.streak = response.streak || this.dailyBonus.streak + 1;
        this.addTransaction({
            id: "DB-" + Date.now(),
            type: TRANSACTION_TYPES.DAILY_BONUS,
            amount: reward,
            status: "completed",
            createdAt: new Date().toISOString()
        });
        this.saveCache();
        return { success: true, reward };
    } catch (error) { return { success: false, message: error.message }; }
};

// --- BONUS REWARDS (Spin, Box, Ads) ---
Wallet.bonusRewards = {
    spinWheel: { totalSpins: 0, totalEarned: 0, history: [] },
    mysteryBox: { opened: 0, totalEarned: 0, history: [] },
    ads: { watched: 0, totalEarned: 0, history: [] }
};

Wallet.creditSpinReward = function (amount, prize = "") {
    amount = Number(amount || 0);
    this.credit(amount);
    this.bonusRewards.spinWheel.totalSpins++;
    this.bonusRewards.spinWheel.totalEarned += amount;
    this.addTransaction({
        id: "SPIN-" + Date.now(),
        type: TRANSACTION_TYPES.SPIN_WHEEL,
        amount: amount,
        status: "completed",
        description: prize,
        createdAt: new Date().toISOString()
    });
    this.saveCache();
    return { success: true, reward: amount };
};

Wallet.creditMysteryBoxReward = function (amount, rewardName = "") {
    amount = Number(amount || 0);
    this.credit(amount);
    this.bonusRewards.mysteryBox.opened++;
    this.bonusRewards.mysteryBox.totalEarned += amount;
    this.addTransaction({
        id: "BOX-" + Date.now(),
        type: TRANSACTION_TYPES.MYSTERY_BOX,
        amount: amount,
        status: "completed",
        description: rewardName,
        createdAt: new Date().toISOString()
    });
    this.saveCache();
    return { success: true, reward: amount };
};

Wallet.creditAdReward = function (amount, network = "") {
    amount = Number(amount || 0);
    this.credit(amount);
    this.bonusRewards.ads.watched++;
    this.bonusRewards.ads.totalEarned += amount;
    this.addTransaction({
        id: "AD-" + Date.now(),
        type: TRANSACTION_TYPES.WATCH_AD,
        amount: amount,
        status: "completed",
        description: network,
        createdAt: new Date().toISOString()
    });
    this.saveCache();
    return { success: true, reward: amount };
};

// --- PROMOTIONS ---
Wallet.bonus = { multiplier: 1.0, activeCampaigns: [], promoCodes: [] };

Wallet.redeemPromoCode = async function (code) {
    try {
        const response = await Api.post("/rewards/promo", { code });
        if (!response.success) return response;
        const reward = Number(response.reward || 0);
        if (reward > 0) this.credit(reward);
        this.addTransaction({
            id: "PROMO-" + Date.now(),
            type: TRANSACTION_TYPES.PROMOTION,
            amount: reward,
            status: "completed",
            description: `Promo: ${code}`,
            createdAt: new Date().toISOString()
        });
        this.saveCache();
        return { success: true, reward };
    } catch (error) { return { success: false, message: error.message }; }
};

// --- ANALYTICS ---
Wallet.analytics = { lifetimeEarned: 0, lifetimeWithdrawn: 0, lifetimeTasks: 0, averageDailyIncome: 0 };

Wallet.loadAnalytics = async function () {
    try {
        const response = await Api.get("/wallet/analytics");
        if (response.success) this.analytics = { ...this.analytics, ...(response.analytics || {}) };
        return response;
    } catch (error) { return { success: false, message: error.message }; }
};

Wallet.getDashboardStatistics = function () {
    return {
        balance: this.wallets.main,
        pending: this.wallets.pending,
        earned: this.summary.earned,
        withdrawn: this.summary.withdrawn,
        tasks: this.bonusRewards.ads.watched, // Placeholder for completed tasks
        streak: this.dailyBonus.streak
    };
};

// --- EXPORT SYSTEM ---
Wallet.exportTransactionsCSV = function () {
    try {
        let csv = "ID,Type,Amount,Status,Date\n";
        this.transactions.forEach(tx => {
            csv += `${tx.id},${tx.type},${tx.amount},${tx.status},${tx.createdAt}\n`;
        });
        Utils.download(csv, "transactions.csv", "text/csv");
        return { success: true };
    } catch (error) { return { success: false, message: error.message }; }
};

/* =====================================================
   BLOCK 4: ADMIN CONTROLS, LIVE SYNC & FINAL EXPORT
===================================================== */

// --- ADMIN CONTROLS (For your future Admin Panel) ---
Wallet.admin = { frozen: false, frozenReason: "", frozenAt: null };

Wallet.adminCredit = async function (userId, amount, reason = "") {
    try {
        const response = await Api.post("/admin/wallet/credit", { userId, amount, reason });
        if (response.success && State.user && State.user.id === userId) this.credit(amount);
        return response;
    } catch (error) { return { success: false, message: error.message }; }
};

Wallet.adminDebit = async function (userId, amount, reason = "") {
    try {
        const response = await Api.post("/admin/wallet/debit", { userId, amount, reason });
        if (response.success && State.user && State.user.id === userId) this.debit(amount);
        return response;
    } catch (error) { return { success: false, message: error.message }; }
};

Wallet.freeze = async function (userId, reason = "") {
    try {
        const response = await Api.post("/admin/wallet/freeze", { userId, reason });
        if (response.success && State.user && State.user.id === userId) {
            this.admin.frozen = true;
            this.admin.frozenReason = reason;
        }
        return response;
    } catch (error) { return { success: false, message: error.message }; }
};

Wallet.unfreeze = async function (userId) {
    try {
        const response = await Api.post("/admin/wallet/unfreeze", { userId });
        if (response.success && State.user && State.user.id === userId) {
            this.admin.frozen = false;
        }
        return response;
    } catch (error) { return { success: false, message: error.message }; }
};

// --- LIVE SYNCHRONIZATION (Keep data fresh) ---
Wallet.liveSync = { enabled: true, interval: 30000, timer: null };

Wallet.startLiveSync = function () {
    if (this.liveSync.timer) return;
    this.liveSync.timer = setInterval(async () => {
        if (!this.loading && navigator.onLine) await this.sync();
    }, this.liveSync.interval);
};

Wallet.stopLiveSync = function () {
    if (this.liveSync.timer) {
        clearInterval(this.liveSync.timer);
        this.liveSync.timer = null;
    }
};

// --- PERFORMANCE OPTIMIZATION ---
Wallet.optimize = function () {
    if (this.transactions.length > 100) {
        this.transactions = this.transactions.slice(0, 100);
    }
    this.saveCache();
};

// --- INITIALIZATION ---
Wallet.initialize = async function () {
    if (this.initialized) return;
    this.loadCache();
    await this.sync();
    this.startLiveSync();
    this.initialized = true;
    console.log("Wallet Module Initialized");
};

// --- FINAL EXPORT ---
export default Wallet;
