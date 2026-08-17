"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB
   TELEGRAM MINI APP
   WALLET.JS
   PHASE 4A.1
   IMPORTS
   CONSTANTS
   WALLET STATE
===================================================== */

import Api from "./api.js";
import State from "./state.js";
import Settings from "./settings.js";
import Utils from "./utils.js";

/* =====================================================
   CONSTANTS
===================================================== */

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

/* =====================================================
   WALLET STATE
===================================================== */

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
   GETTERS
===================================================== */

Wallet.getBalance = function () {

    return this.wallets.main;

};

Wallet.getWallets = function () {

    return this.wallets;

};

Wallet.getSummary = function () {

    return this.summary;

};

Wallet.getTransactions = function () {

    return this.transactions;

};

Wallet.getRecentTransactions = function () {

    return this.recentTransactions;

};

Wallet.getSelectedTransaction = function () {

    return this.selectedTransaction;

};

Wallet.getCurrency = function () {

    return this.currency;

};

/* =====================================================
   SETTERS
===================================================== */

Wallet.setLoading = function (

    value

) {

    this.loading = value;

};

Wallet.setSyncing = function (

    value

) {

    this.syncing = value;

};

Wallet.setProcessing = function (

    value

) {

    this.processing = value;

};

Wallet.setSelectedTransaction = function (

    transaction

) {

    this.selectedTransaction = transaction;

};

Wallet.setCurrency = function (

    currency

) {

    this.currency = currency;

};

Wallet.setActiveWallet = function (

    wallet

) {

    this.activeWallet = wallet;

};

/* =====================================================
   END OF PHASE 4A.1
===================================================== */

/* =====================================================
   PHASE 4A.2
   BALANCE MANAGEMENT
   AVAILABLE
   PENDING
   EARNED
   SPENT
===================================================== */


/* =====================================================
   LOAD WALLET BALANCE
===================================================== */

Wallet.loadBalance = async function () {

    try {

        this.setLoading(true);

        const response = await Api.getWalletBalance();

        if (!response.success) {

            throw new Error(

                response.message ||

                "Unable to load wallet."

            );

        }

        this.wallets = {

            ...this.wallets,

            ...(response.wallets || {})

        };

        this.updateSummary();

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
   SUMMARY
===================================================== */

Wallet.updateSummary = function () {

    this.summary.available =

        Number(this.wallets.main || 0);

    this.summary.pending =

        Number(this.wallets.pending || 0);

};


/* =====================================================
   CREDIT
===================================================== */

Wallet.credit = function (

    amount,

    wallet = WALLET_TYPES.MAIN

) {

    amount = Number(amount || 0);

    if (amount <= 0) {

        return false;

    }

    this.wallets[wallet] += amount;

    this.summary.earned += amount;

    this.updateSummary();

    State.user.balance =

        this.wallets.main;

    return true;

};


/* =====================================================
   DEBIT
===================================================== */

Wallet.debit = function (

    amount,

    wallet = WALLET_TYPES.MAIN

) {

    amount = Number(amount || 0);

    if (

        amount <= 0 ||

        this.wallets[wallet] < amount

    ) {

        return false;

    }

    this.wallets[wallet] -= amount;

    this.summary.spent += amount;

    this.updateSummary();

    State.user.balance =

        this.wallets.main;

    return true;

};


/* =====================================================
   PENDING
===================================================== */

Wallet.addPending = function (

    amount

) {

    amount = Number(amount || 0);

    this.wallets.pending += amount;

    this.updateSummary();

};


Wallet.releasePending = function (

    amount

) {

    amount = Number(amount || 0);

    this.wallets.pending = Math.max(

        0,

        this.wallets.pending - amount

    );

    this.wallets.main += amount;

    this.summary.earned += amount;

    this.updateSummary();

    State.user.balance =

        this.wallets.main;

};


/* =====================================================
   WITHDRAWN
===================================================== */

Wallet.recordWithdrawal = function (

    amount

) {

    amount = Number(amount || 0);

    this.summary.withdrawn += amount;

    this.summary.spent += amount;

    this.updateSummary();

};


/* =====================================================
   HELPERS
===================================================== */

Wallet.getAvailableBalance = function () {

    return this.summary.available;

};


Wallet.getPendingBalance = function () {

    return this.summary.pending;

};


Wallet.getEarnedBalance = function () {

    return this.summary.earned;

};


Wallet.getSpentBalance = function () {

    return this.summary.spent;

};


/* =====================================================
   END OF PHASE 4A.2
===================================================== */

/* =====================================================
   PHASE 4A.3
   TRANSACTIONS
   HISTORY
   FILTERING
   PAGINATION
===================================================== */


/* =====================================================
   LOAD TRANSACTIONS
===================================================== */

Wallet.loadTransactions = async function (

    refresh = false

) {

    try {

        this.setLoading(true);

        if (refresh) {

            this.page = 1;

            this.transactions = [];

        }

        const response = await Api.getTransactions({

            page: this.page,

            pageSize: this.pageSize,

            type: this.filters.type,

            status: this.filters.status,

            from: this.filters.from,

            to: this.filters.to

        });

        if (!response.success) {

            throw new Error(

                response.message ||

                "Unable to load transactions."

            );

        }

        const transactions =

            response.transactions || [];

        if (refresh) {

            this.transactions = transactions;

        } else {

            this.transactions.push(

                ...transactions

            );

        }

        this.totalTransactions =

            response.total ||

            this.transactions.length;

        this.hasMore =

            this.transactions.length <

            this.totalTransactions;

        this.recentTransactions =

            this.transactions.slice(0, 10);

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

        this.setLoading(false);

    }

};


/* =====================================================
   LOAD MORE
===================================================== */

Wallet.loadMoreTransactions = async function () {

    if (

        this.loading ||

        !this.hasMore

    ) {

        return false;

    }

    this.page++;

    return await this.loadTransactions(false);

};


/* =====================================================
   FILTERS
===================================================== */

Wallet.setFilter = function (

    key,

    value

) {

    this.filters[key] = value;

};


Wallet.resetFilters = function () {

    this.filters = {

        type: "all",

        status: "all",

        from: null,

        to: null

    };

};


/* =====================================================
   FILTER TRANSACTIONS
===================================================== */

Wallet.getFilteredTransactions = function () {

    return this.transactions.filter(

        transaction => {

            if (

                this.filters.type !== "all" &&

                transaction.type !==

                this.filters.type

            ) {

                return false;

            }

            if (

                this.filters.status !== "all" &&

                transaction.status !==

                this.filters.status

            ) {

                return false;

            }

            if (

                this.filters.from &&

                new Date(

                    transaction.createdAt

                ) <

                new Date(

                    this.filters.from

                )

            ) {

                return false;

            }

            if (

                this.filters.to &&

                new Date(

                    transaction.createdAt

                ) >

                new Date(

                    this.filters.to

                )

            ) {

                return false;

            }

            return true;

        }

    );

};


/* =====================================================
   FIND TRANSACTION
===================================================== */

Wallet.findTransaction = function (

    transactionId

) {

    return this.transactions.find(

        transaction =>

            transaction.id ===

            transactionId

    );

};


/* =====================================================
   SELECT TRANSACTION
===================================================== */

Wallet.selectTransaction = function (

    transactionId

) {

    const transaction =

        this.findTransaction(

            transactionId

        );

    if (

        transaction

    ) {

        this.setSelectedTransaction(

            transaction

        );

    }

    return transaction;

};


/* =====================================================
   ADD TRANSACTION
===================================================== */

Wallet.addTransaction = function (

    transaction

) {

    this.transactions.unshift(

        transaction

    );

    this.recentTransactions =

        this.transactions.slice(0, 10);

    this.totalTransactions++;

};


/* =====================================================
   END OF PHASE 4A.3
===================================================== */

/* =====================================================
   PHASE 4A.4
   WALLET SYNCHRONIZATION
   API
   CACHE
   REFRESH
===================================================== */


/* =====================================================
   CACHE
===================================================== */

Wallet.cacheKey = "rewardhub_wallet_cache";

Wallet.saveCache = function () {

    try {

        localStorage.setItem(

            this.cacheKey,

            JSON.stringify({

                wallets: this.wallets,

                summary: this.summary,

                transactions: this.transactions,

                recentTransactions: this.recentTransactions,

                totalTransactions: this.totalTransactions,

                timestamp: Date.now()

            })

        );

    }

    catch (error) {

        console.error(error);

    }

};


Wallet.loadCache = function () {

    try {

        const cache = localStorage.getItem(

            this.cacheKey

        );

        if (!cache) {

            return false;

        }

        const data = JSON.parse(cache);

        this.wallets = data.wallets || this.wallets;

        this.summary = data.summary || this.summary;

        this.transactions =

            data.transactions || [];

        this.recentTransactions =

            data.recentTransactions || [];

        this.totalTransactions =

            data.totalTransactions || 0;

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

};


Wallet.clearCache = function () {

    try {

        localStorage.removeItem(

            this.cacheKey

        );

    }

    catch (error) {

        console.error(error);

    }

};


/* =====================================================
   SYNCHRONIZATION
===================================================== */

Wallet.sync = async function () {

    try {

        this.setSyncing(true);

        await this.loadBalance();

        await this.loadTransactions(true);

        this.saveCache();

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
   REFRESH
===================================================== */

Wallet.refresh = async function () {

    this.clearCache();

    return await this.sync();

};


/* =====================================================
   AUTO REFRESH
===================================================== */

Wallet.startAutoRefresh = function (

    interval = 30000

) {

    if (

        this.refreshTimer

    ) {

        clearInterval(

            this.refreshTimer

        );

    }

    this.refreshTimer = setInterval(

        async () => {

            if (

                !this.loading &&

                !this.processing

            ) {

                await this.sync();

            }

        },

        interval

    );

};


Wallet.stopAutoRefresh = function () {

    if (

        this.refreshTimer

    ) {

        clearInterval(

            this.refreshTimer

        );

        this.refreshTimer = null;

    }

};


/* =====================================================
   CONNECTION CHECK
===================================================== */

Wallet.checkConnection = async function () {

    try {

        return await Api.ping();

    }

    catch (error) {

        return {

            success: false

        };

    }

};


/* =====================================================
   END OF PHASE 4A.4
===================================================== */

/* =====================================================
   PHASE 4A.5
   ERROR HANDLING
   PRODUCTION EXPORT
===================================================== */


/* =====================================================
   INITIALIZATION
===================================================== */

Wallet.initialize = async function () {

    if (

        this.initialized

    ) {

        return;

    }

    try {

        this.loadCache();

        await this.sync();

        this.startAutoRefresh();

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
   STATUS
===================================================== */

Wallet.status = function () {

    return {

        initialized:

            this.initialized,

        loading:

            this.loading,

        syncing:

            this.syncing,

        processing:

            this.processing,

        currency:

            this.currency,

        activeWallet:

            this.activeWallet,

        balance:

            this.wallets.main,

        pending:

            this.wallets.pending,

        transactions:

            this.transactions.length,

        totalTransactions:

            this.totalTransactions,

        hasMore:

            this.hasMore

    };

};


/* =====================================================
   RESET
===================================================== */

Wallet.reset = function () {

    this.stopAutoRefresh();

    this.loading = false;

    this.syncing = false;

    this.processing = false;

    this.initialized = false;

    this.currency = DEFAULT_CURRENCY;

    this.activeWallet = WALLET_TYPES.MAIN;

    this.wallets = {

        main: 0,

        bonus: 0,

        referral: 0,

        pending: 0

    };

    this.summary = {

        available: 0,

        pending: 0,

        earned: 0,

        spent: 0,

        withdrawn: 0

    };

    this.transactions = [];

    this.recentTransactions = [];

    this.selectedTransaction = null;

    this.page = 1;

    this.totalTransactions = 0;

    this.hasMore = true;

    this.clearCache();

};


/* =====================================================
   ERROR HANDLER
===================================================== */

Wallet.handleError = function (

    error,

    context = "Wallet"

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

            "Unknown wallet error.",

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

            await Wallet.initialize();

        }

        catch (error) {

            Wallet.handleError(

                error,

                "Startup"

            );

        }

    }

);


/* =====================================================
   PRODUCTION EXPORT
===================================================== */

export default Wallet;


/* =====================================================
   END OF FILE
   frontend/js/wallet.js
   CROWN PRINCE REWARD HUB
   PRODUCTION BUILD
===================================================== */

/* =====================================================
   PHASE 4B.1
   WITHDRAWAL METHODS
   SUPPORTED NETWORKS
===================================================== */


/* =====================================================
   WITHDRAWAL CONSTANTS
===================================================== */

const WITHDRAWAL_METHODS = {

    USDT_BEP20: "USDT_BEP20",

    USDT_TRC20: "USDT_TRC20",

    BINANCE_PAY: "BINANCE_PAY",

    PAYPAL: "PAYPAL",

    AIRTM: "AIRTM",

    PERFECT_MONEY: "PERFECT_MONEY",

    BANK: "BANK",

    MOBILE_MONEY: "MOBILE_MONEY"

};

const WITHDRAWAL_STATUS = {

    PENDING: "pending",

    APPROVED: "approved",

    PROCESSING: "processing",

    PAID: "paid",

    REJECTED: "rejected",

    CANCELLED: "cancelled"

};


/* =====================================================
   WITHDRAWAL STATE
===================================================== */

Wallet.withdrawals = [];

Wallet.withdrawalMethods = [];

Wallet.selectedMethod = null;


/* =====================================================
   LOAD METHODS
===================================================== */

Wallet.loadWithdrawalMethods = async function () {

    try {

        const response =

            await Api.getWithdrawalMethods();

        if (

            response.success

        ) {

            this.withdrawalMethods =

                response.methods || [];

        }

        return response;

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message:

                "Unable to load withdrawal methods."

        };

    }

};


/* =====================================================
   GETTERS
===================================================== */

Wallet.getWithdrawalMethods = function () {

    return this.withdrawalMethods;

};


Wallet.getWithdrawals = function () {

    return this.withdrawals;

};


Wallet.getSelectedMethod = function () {

    return this.selectedMethod;

};


/* =====================================================
   SELECT METHOD
===================================================== */

Wallet.selectWithdrawalMethod = function (

    method

) {

    this.selectedMethod = method;

};


/* =====================================================
   FIND METHOD
===================================================== */

Wallet.findWithdrawalMethod = function (

    methodId

) {

    return this.withdrawalMethods.find(

        method =>

            method.id === methodId ||

            method.code === methodId ||

            method.name === methodId

    );

};


/* =====================================================
   NETWORK SUPPORT
===================================================== */

Wallet.isMethodSupported = function (

    method

) {

    return Object.values(

        WITHDRAWAL_METHODS

    ).includes(method);

};


/* =====================================================
   DEFAULT METHOD
===================================================== */

Wallet.getDefaultWithdrawalMethod = function () {

    return (

        this.withdrawalMethods[0] ||

        null

    );

};


/* =====================================================
   END OF PHASE 4B.1
===================================================== */

/* =====================================================
   PHASE 4B.2
   CREATE WITHDRAWAL REQUEST
===================================================== */


/* =====================================================
   CREATE WITHDRAWAL
===================================================== */

Wallet.createWithdrawal = async function ({

    amount,

    method,

    walletAddress = "",

    accountName = "",

    accountNumber = "",

    note = ""

}) {

    try {

        this.setProcessing(true);

        const validation =

            await this.validateWithdrawal({

                amount,

                method,

                walletAddress,

                accountName,

                accountNumber

            });

        if (

            !validation.success

        ) {

            return validation;

        }

        const response =

            await Api.createWithdrawal({

                amount,

                method,

                walletAddress,

                accountName,

                accountNumber,

                note

            });

        if (

            !response.success

        ) {

            return response;

        }

        this.wallets.main -=

            Number(amount);

        this.wallets.pending +=

            Number(amount);

        this.recordWithdrawal(

            Number(amount)

        );

        const withdrawal = {

            id:

                response.withdrawalId,

            amount:

                Number(amount),

            method,

            walletAddress,

            accountName,

            accountNumber,

            note,

            status:

                WITHDRAWAL_STATUS.PENDING,

            createdAt:

                new Date().toISOString()

        };

        this.withdrawals.unshift(

            withdrawal

        );

        this.addTransaction({

            id:

                "WD-" +

                Date.now(),

            type:

                TRANSACTION_TYPES.WITHDRAWAL,

            amount:

                Number(amount),

            status:

                TRANSACTION_STATUS.PENDING,

            createdAt:

                withdrawal.createdAt,

            reference:

                response.withdrawalId

        });

        this.updateSummary();

        this.saveCache();

        return {

            success: true,

            withdrawal

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

        this.setProcessing(false);

    }

};


/* =====================================================
   CANCEL WITHDRAWAL
===================================================== */

Wallet.cancelWithdrawal = async function (

    withdrawalId

) {

    try {

        const response =

            await Api.cancelWithdrawal({

                withdrawalId

            });

        if (

            !response.success

        ) {

            return response;

        }

        const withdrawal =

            this.withdrawals.find(

                item =>

                    item.id ===

                    withdrawalId

            );

        if (

            withdrawal

        ) {

            withdrawal.status =

                WITHDRAWAL_STATUS.CANCELLED;

            this.wallets.pending -=

                withdrawal.amount;

            this.wallets.main +=

                withdrawal.amount;

            this.updateSummary();

        }

        this.saveCache();

        return response;

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
   ESTIMATE FEES
===================================================== */

Wallet.calculateWithdrawal = async function (

    amount,

    method

) {

    try {

        return await Api.calculateWithdrawal({

            amount,

            method

        });

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            fee: 0,

            receive: 0

        };

    }

};


/* =====================================================
   END OF PHASE 4B.2
===================================================== */

/* =====================================================
   PHASE 4B.3
   VALIDATION
   MINIMUM WITHDRAWAL
   WALLET ADDRESS
   BALANCE
   COOLDOWN
===================================================== */


/* =====================================================
   WITHDRAWAL VALIDATION
===================================================== */

Wallet.validateWithdrawal = async function ({

    amount,

    method,

    walletAddress = "",

    accountName = "",

    accountNumber = ""

}) {

    try {

        amount = Number(amount);

        const minimum =

            Settings.get(

                "minimumWithdrawal"

            ) || 1.00;

        if (

            Number.isNaN(amount) ||

            amount <= 0

        ) {

            return {

                success: false,

                message: "Invalid withdrawal amount."

            };

        }

        if (

            amount < minimum

        ) {

            return {

                success: false,

                message: `Minimum withdrawal is ${minimum} ${this.currency}.`

            };

        }

        if (

            this.wallets.main < amount

        ) {

            return {

                success: false,

                message: "Insufficient wallet balance."

            };

        }

        if (

            !this.isMethodSupported(method)

        ) {

            return {

                success: false,

                message: "Unsupported withdrawal method."

            };

        }

        const cooldown =

            await this.checkWithdrawalCooldown();

        if (

            !cooldown.success

        ) {

            return cooldown;

        }

        switch (method) {

            case WITHDRAWAL_METHODS.USDT_BEP20:

            case WITHDRAWAL_METHODS.USDT_TRC20:

                if (

                    !Utils.validateWalletAddress(

                        walletAddress

                    )

                ) {

                    return {

                        success: false,

                        message: "Invalid wallet address."

                    };

                }

                break;

            case WITHDRAWAL_METHODS.BINANCE_PAY:

            case WITHDRAWAL_METHODS.PAYPAL:

            case WITHDRAWAL_METHODS.AIRTM:

            case WITHDRAWAL_METHODS.PERFECT_MONEY:

                if (

                    !Utils.validateEmail(

                        walletAddress

                    )

                ) {

                    return {

                        success: false,

                        message: "Invalid email address."

                    };

                }

                break;

            case WITHDRAWAL_METHODS.BANK:

            case WITHDRAWAL_METHODS.MOBILE_MONEY:

                if (

                    !accountName ||

                    !accountNumber

                ) {

                    return {

                        success: false,

                        message: "Account details are required."

                    };

                }

                break;

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

};


/* =====================================================
   COOLDOWN CHECK
===================================================== */

Wallet.checkWithdrawalCooldown = async function () {

    try {

        return await Api.checkWithdrawalCooldown();

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message: "Unable to verify withdrawal cooldown."

        };

    }

};


/* =====================================================
   BALANCE CHECK
===================================================== */

Wallet.hasSufficientBalance = function (

    amount

) {

    return this.wallets.main >= Number(amount);

};


/* =====================================================
   MINIMUM WITHDRAWAL
===================================================== */

Wallet.getMinimumWithdrawal = function () {

    return (

        Settings.get(

            "minimumWithdrawal"

        ) || 1.00

    );

};


/* =====================================================
   END OF PHASE 4B.3
===================================================== */

/* =====================================================
   PHASE 4B.4
   WITHDRAWAL HISTORY
   STATUS TRACKING
===================================================== */


/* =====================================================
   LOAD WITHDRAWALS
===================================================== */

Wallet.loadWithdrawals = async function (

    refresh = true

) {

    try {

        this.setLoading(true);

        const response = await Api.getWithdrawals();

        if (!response.success) {

            throw new Error(

                response.message ||

                "Unable to load withdrawals."

            );

        }

        this.withdrawals =

            response.withdrawals || [];

        return {

            success: true,

            withdrawals:

                this.withdrawals

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

        this.setLoading(false);

    }

};


/* =====================================================
   GET WITHDRAWAL
===================================================== */

Wallet.getWithdrawal = function (

    withdrawalId

) {

    return this.withdrawals.find(

        withdrawal =>

            withdrawal.id ===

            withdrawalId

    ) || null;

};


/* =====================================================
   UPDATE STATUS
===================================================== */

Wallet.updateWithdrawalStatus = function (

    withdrawalId,

    status

) {

    const withdrawal =

        this.getWithdrawal(

            withdrawalId

        );

    if (!withdrawal) {

        return false;

    }

    withdrawal.status = status;

    withdrawal.updatedAt =

        new Date().toISOString();

    this.saveCache();

    return true;

};


/* =====================================================
   REFRESH STATUS
===================================================== */

Wallet.refreshWithdrawalStatus = async function (

    withdrawalId

) {

    try {

        const response =

            await Api.getWithdrawalStatus({

                withdrawalId

            });

        if (

            !response.success

        ) {

            return response;

        }

        this.updateWithdrawalStatus(

            withdrawalId,

            response.status

        );

        return response;

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
   REFRESH ALL
===================================================== */

Wallet.refreshAllWithdrawalStatuses = async function () {

    for (

        const withdrawal of

        this.withdrawals

    ) {

        if (

            withdrawal.status ===

                WITHDRAWAL_STATUS.PENDING ||

            withdrawal.status ===

                WITHDRAWAL_STATUS.PROCESSING ||

            withdrawal.status ===

                WITHDRAWAL_STATUS.APPROVED

        ) {

            await this.refreshWithdrawalStatus(

                withdrawal.id

            );

        }

    }

};


/* =====================================================
   FILTER HISTORY
===================================================== */

Wallet.getWithdrawalsByStatus = function (

    status

) {

    return this.withdrawals.filter(

        withdrawal =>

            withdrawal.status ===

            status

    );

};


/* =====================================================
   REMOVE HISTORY
===================================================== */

Wallet.clearWithdrawalHistory = function () {

    this.withdrawals = [];

    this.saveCache();

};


/* =====================================================
   END OF PHASE 4B.4
===================================================== */

/* =====================================================
   PHASE 4B.5
   ADMIN APPROVAL / REJECTION SUPPORT
===================================================== */


/* =====================================================
   APPROVE WITHDRAWAL
===================================================== */

Wallet.approveWithdrawal = async function (

    withdrawalId,

    note = ""

) {

    try {

        const response = await Api.approveWithdrawal({

            withdrawalId,

            note

        });

        if (!response.success) {

            return response;

        }

        const withdrawal = this.getWithdrawal(

            withdrawalId

        );

        if (withdrawal) {

            withdrawal.status =

                WITHDRAWAL_STATUS.APPROVED;

            withdrawal.adminNote = note;

            withdrawal.updatedAt =

                new Date().toISOString();

        }

        this.saveCache();

        return response;

    }

    catch (error) {

        return this.handleError(

            error,

            "Approve Withdrawal"

        );

    }

};


/* =====================================================
   REJECT WITHDRAWAL
===================================================== */

Wallet.rejectWithdrawal = async function (

    withdrawalId,

    reason = ""

) {

    try {

        const response = await Api.rejectWithdrawal({

            withdrawalId,

            reason

        });

        if (!response.success) {

            return response;

        }

        const withdrawal = this.getWithdrawal(

            withdrawalId

        );

        if (withdrawal) {

            withdrawal.status =

                WITHDRAWAL_STATUS.REJECTED;

            withdrawal.reason = reason;

            withdrawal.updatedAt =

                new Date().toISOString();

            this.wallets.pending -=

                withdrawal.amount;

            this.wallets.main +=

                withdrawal.amount;

            this.updateSummary();

        }

        this.saveCache();

        return response;

    }

    catch (error) {

        return this.handleError(

            error,

            "Reject Withdrawal"

        );

    }

};


/* =====================================================
   MARK AS PAID
===================================================== */

Wallet.markWithdrawalPaid = async function (

    withdrawalId,

    transactionHash = ""

) {

    try {

        const response = await Api.markWithdrawalPaid({

            withdrawalId,

            transactionHash

        });

        if (!response.success) {

            return response;

        }

        const withdrawal = this.getWithdrawal(

            withdrawalId

        );

        if (withdrawal) {

            withdrawal.status =

                WITHDRAWAL_STATUS.PAID;

            withdrawal.transactionHash =

                transactionHash;

            withdrawal.updatedAt =

                new Date().toISOString();

            this.wallets.pending -=

                withdrawal.amount;

            this.recordWithdrawal(

                withdrawal.amount

            );

            this.updateSummary();

        }

        this.saveCache();

        return response;

    }

    catch (error) {

        return this.handleError(

            error,

            "Mark Withdrawal Paid"

        );

    }

};


/* =====================================================
   ADMIN NOTES
===================================================== */

Wallet.updateWithdrawalNote = function (

    withdrawalId,

    note

) {

    const withdrawal = this.getWithdrawal(

        withdrawalId

    );

    if (!withdrawal) {

        return false;

    }

    withdrawal.adminNote = note;

    withdrawal.updatedAt =

        new Date().toISOString();

    this.saveCache();

    return true;

};


/* =====================================================
   ADMIN PENDING LIST
===================================================== */

Wallet.getPendingWithdrawals = function () {

    return this.withdrawals.filter(

        withdrawal =>

            withdrawal.status ===

            WITHDRAWAL_STATUS.PENDING

    );

};


/* =====================================================
   ADMIN STATISTICS
===================================================== */

Wallet.getWithdrawalStatistics = function () {

    return {

        total:

            this.withdrawals.length,

        pending:

            this.getWithdrawalsByStatus(

                WITHDRAWAL_STATUS.PENDING

            ).length,

        approved:

            this.getWithdrawalsByStatus(

                WITHDRAWAL_STATUS.APPROVED

            ).length,

        paid:

            this.getWithdrawalsByStatus(

                WITHDRAWAL_STATUS.PAID

            ).length,

        rejected:

            this.getWithdrawalsByStatus(

                WITHDRAWAL_STATUS.REJECTED

            ).length

    };

};


/* =====================================================
   END OF PHASE 4B.5
===================================================== */

/* =====================================================
   PHASE 4C.1
   REWARDS & EARNINGS
   DAILY BONUS EARNINGS
===================================================== */


/* =====================================================
   DAILY BONUS STATE
===================================================== */

Wallet.dailyBonus = {

    available: false,

    claimedToday: false,

    streak: 0,

    reward: 0,

    nextClaimAt: null,

    lastClaimAt: null

};


/* =====================================================
   LOAD DAILY BONUS
===================================================== */

Wallet.loadDailyBonus = async function () {

    try {

        const response = await Api.getDailyBonusStatus();

        if (!response.success) {

            return response;

        }

        this.dailyBonus = {

            ...this.dailyBonus,

            ...(response.dailyBonus || {})

        };

        return {

            success: true,

            dailyBonus: this.dailyBonus

        };

    }

    catch (error) {

        return this.handleError(

            error,

            "Load Daily Bonus"

        );

    }

};


/* =====================================================
   CLAIM DAILY BONUS
===================================================== */

Wallet.claimDailyBonus = async function () {

    try {

        if (

            this.dailyBonus.claimedToday

        ) {

            return {

                success: false,

                message:

                    "Daily bonus already claimed."

            };

        }

        const response = await Api.claimDailyBonus();

        if (!response.success) {

            return response;

        }

        const reward = Number(

            response.reward || 0

        );

        this.credit(reward);

        this.dailyBonus.claimedToday = true;

        this.dailyBonus.reward = reward;

        this.dailyBonus.streak =

            response.streak ||

            this.dailyBonus.streak + 1;

        this.dailyBonus.lastClaimAt =

            new Date().toISOString();

        this.dailyBonus.nextClaimAt =

            response.nextClaimAt || null;

        this.addTransaction({

            id:

                "DB-" + Date.now(),

            type:

                TRANSACTION_TYPES.DAILY_BONUS,

            amount:

                reward,

            status:

                TRANSACTION_STATUS.COMPLETED,

            createdAt:

                this.dailyBonus.lastClaimAt

        });

        this.saveCache();

        return {

            success: true,

            reward

        };

    }

    catch (error) {

        return this.handleError(

            error,

            "Claim Daily Bonus"

        );

    }

};


/* =====================================================
   DAILY BONUS HELPERS
===================================================== */

Wallet.canClaimDailyBonus = function () {

    return !this.dailyBonus.claimedToday;

};


Wallet.getDailyBonus = function () {

    return this.dailyBonus;

};


Wallet.getDailyBonusStreak = function () {

    return this.dailyBonus.streak;

};


Wallet.getNextDailyBonusTime = function () {

    return this.dailyBonus.nextClaimAt;

};


/* =====================================================
   RESET DAILY BONUS
===================================================== */

Wallet.resetDailyBonus = function () {

    this.dailyBonus = {

        available: false,

        claimedToday: false,

        streak: 0,

        reward: 0,

        nextClaimAt: null,

        lastClaimAt: null

    };

};


/* =====================================================
   END OF PHASE 4C.1
===================================================== */

/* =====================================================
   PHASE 4C.2
   TASK REWARDS
===================================================== */


/* =====================================================
   TASK REWARD STATE
===================================================== */

Wallet.taskRewards = {

    totalEarned: 0,

    totalTasksCompleted: 0,

    pendingRewards: 0,

    history: []

};


/* =====================================================
   LOAD TASK REWARDS
===================================================== */

Wallet.loadTaskRewards = async function () {

    try {

        const response = await Api.getTaskRewards();

        if (!response.success) {

            return response;

        }

        this.taskRewards = {

            ...this.taskRewards,

            ...(response.taskRewards || {})

        };

        return {

            success: true,

            taskRewards: this.taskRewards

        };

    }

    catch (error) {

        return this.handleError(

            error,

            "Load Task Rewards"

        );

    }

};


/* =====================================================
   CREDIT TASK REWARD
===================================================== */

Wallet.creditTaskReward = async function (

    taskId,

    amount,

    title = ""

) {

    try {

        amount = Number(amount || 0);

        if (amount <= 0) {

            return {

                success: false,

                message: "Invalid reward amount."

            };

        }

        this.credit(amount);

        this.taskRewards.totalEarned += amount;

        this.taskRewards.totalTasksCompleted++;

        this.taskRewards.history.unshift({

            taskId,

            title,

            amount,

            earnedAt: new Date().toISOString()

        });

        this.addTransaction({

            id: "TASK-" + Date.now(),

            type: TRANSACTION_TYPES.TASK_REWARD,

            amount,

            status: TRANSACTION_STATUS.COMPLETED,

            reference: taskId,

            description: title,

            createdAt: new Date().toISOString()

        });

        this.saveCache();

        return {

            success: true,

            reward: amount

        };

    }

    catch (error) {

        return this.handleError(

            error,

            "Credit Task Reward"

        );

    }

};


/* =====================================================
   PENDING TASK REWARD
===================================================== */

Wallet.addPendingTaskReward = function (

    amount

) {

    amount = Number(amount || 0);

    this.taskRewards.pendingRewards += amount;

    this.addPending(amount);

};


Wallet.releasePendingTaskReward = function (

    amount

) {

    amount = Number(amount || 0);

    this.taskRewards.pendingRewards = Math.max(

        0,

        this.taskRewards.pendingRewards - amount

    );

    this.releasePending(amount);

};


/* =====================================================
   HELPERS
===================================================== */

Wallet.getTaskRewards = function () {

    return this.taskRewards;

};


Wallet.getTaskRewardHistory = function () {

    return this.taskRewards.history;

};


Wallet.getTaskRewardTotal = function () {

    return this.taskRewards.totalEarned;

};


Wallet.getCompletedTasks = function () {

    return this.taskRewards.totalTasksCompleted;

};


/* =====================================================
   RESET TASK REWARDS
===================================================== */

Wallet.resetTaskRewards = function () {

    this.taskRewards = {

        totalEarned: 0,

        totalTasksCompleted: 0,

        pendingRewards: 0,

        history: []

    };

};


/* =====================================================
   END OF PHASE 4C.2
===================================================== */

/* =====================================================
   PHASE 4C.3
   REFERRAL COMMISSIONS
===================================================== */


/* =====================================================
   REFERRAL COMMISSION STATE
===================================================== */

Wallet.referrals = {

    totalReferrals: 0,

    activeReferrals: 0,

    totalCommission: 0,

    pendingCommission: 0,

    referralCode: "",

    referralLink: "",

    history: []

};


/* =====================================================
   LOAD REFERRAL DATA
===================================================== */

Wallet.loadReferralData = async function () {

    try {

        const response = await Api.getReferralData();

        if (!response.success) {

            return response;

        }

        this.referrals = {

            ...this.referrals,

            ...(response.referrals || {})

        };

        return {

            success: true,

            referrals: this.referrals

        };

    }

    catch (error) {

        return this.handleError(

            error,

            "Load Referral Data"

        );

    }

};


/* =====================================================
   CREDIT REFERRAL COMMISSION
===================================================== */

Wallet.creditReferralCommission = function (

    userId,

    username,

    amount

) {

    amount = Number(amount || 0);

    if (amount <= 0) {

        return {

            success: false,

            message: "Invalid commission."

        };

    }

    this.credit(

        amount,

        WALLET_TYPES.REFERRAL

    );

    this.referrals.totalCommission += amount;

    this.referrals.history.unshift({

        userId,

        username,

        amount,

        createdAt:

            new Date().toISOString()

    });

    this.addTransaction({

        id:

            "REF-" + Date.now(),

        type:

            TRANSACTION_TYPES.REFERRAL,

        amount,

        status:

            TRANSACTION_STATUS.COMPLETED,

        reference:

            userId,

        description:

            `Referral commission from ${username}`,

        createdAt:

            new Date().toISOString()

    });

    this.saveCache();

    return {

        success: true,

        reward: amount

    };

};


/* =====================================================
   PENDING COMMISSION
===================================================== */

Wallet.addPendingReferralCommission = function (

    amount

) {

    amount = Number(amount || 0);

    this.referrals.pendingCommission += amount;

    this.addPending(amount);

};


Wallet.releasePendingReferralCommission = function (

    amount

) {

    amount = Number(amount || 0);

    this.referrals.pendingCommission = Math.max(

        0,

        this.referrals.pendingCommission - amount

    );

    this.releasePending(amount);

};


/* =====================================================
   REFERRAL COUNTERS
===================================================== */

Wallet.incrementReferral = function (

    active = true

) {

    this.referrals.totalReferrals++;

    if (active) {

        this.referrals.activeReferrals++;

    }

};


Wallet.setReferralLink = function (

    code,

    link

) {

    this.referrals.referralCode = code;

    this.referrals.referralLink = link;

};


/* =====================================================
   HELPERS
===================================================== */

Wallet.getReferralData = function () {

    return this.referrals;

};


Wallet.getReferralHistory = function () {

    return this.referrals.history;

};


Wallet.getReferralCommission = function () {

    return this.referrals.totalCommission;

};


Wallet.getReferralLink = function () {

    return this.referrals.referralLink;

};


Wallet.getReferralCode = function () {

    return this.referrals.referralCode;

};


/* =====================================================
   RESET REFERRALS
===================================================== */

Wallet.resetReferralData = function () {

    this.referrals = {

        totalReferrals: 0,

        activeReferrals: 0,

        totalCommission: 0,

        pendingCommission: 0,

        referralCode: "",

        referralLink: "",

        history: []

    };

};


/* =====================================================
   END OF PHASE 4C.3
===================================================== */

/* =====================================================
   PHASE 4C.4
   SPIN WHEEL
   MYSTERY BOX
   AD REWARDS
===================================================== */


/* =====================================================
   BONUS REWARDS STATE
===================================================== */

Wallet.bonusRewards = {

    spinWheel: {

        totalSpins: 0,

        totalEarned: 0,

        history: []

    },

    mysteryBox: {

        opened: 0,

        totalEarned: 0,

        history: []

    },

    ads: {

        watched: 0,

        totalEarned: 0,

        history: []

    }

};


/* =====================================================
   SPIN WHEEL REWARD
===================================================== */

Wallet.creditSpinReward = function (

    amount,

    prize = ""

) {

    amount = Number(amount || 0);

    this.credit(amount);

    this.bonusRewards.spinWheel.totalSpins++;

    this.bonusRewards.spinWheel.totalEarned += amount;

    this.bonusRewards.spinWheel.history.unshift({

        prize,

        amount,

        createdAt: new Date().toISOString()

    });

    this.addTransaction({

        id: "SPIN-" + Date.now(),

        type: TRANSACTION_TYPES.SPIN_WHEEL,

        amount,

        status: TRANSACTION_STATUS.COMPLETED,

        description: prize,

        createdAt: new Date().toISOString()

    });

    this.saveCache();

    return {

        success: true,

        reward: amount

    };

};


/* =====================================================
   MYSTERY BOX REWARD
===================================================== */

Wallet.creditMysteryBoxReward = function (

    amount,

    rewardName = ""

) {

    amount = Number(amount || 0);

    this.credit(amount);

    this.bonusRewards.mysteryBox.opened++;

    this.bonusRewards.mysteryBox.totalEarned += amount;

    this.bonusRewards.mysteryBox.history.unshift({

        reward: rewardName,

        amount,

        createdAt: new Date().toISOString()

    });

    this.addTransaction({

        id: "BOX-" + Date.now(),

        type: TRANSACTION_TYPES.MYSTERY_BOX,

        amount,

        status: TRANSACTION_STATUS.COMPLETED,

        description: rewardName,

        createdAt: new Date().toISOString()

    });

    this.saveCache();

    return {

        success: true,

        reward: amount

    };

};


/* =====================================================
   AD REWARD
===================================================== */

Wallet.creditAdReward = function (

    amount,

    network = ""

) {

    amount = Number(amount || 0);

    this.credit(amount);

    this.bonusRewards.ads.watched++;

    this.bonusRewards.ads.totalEarned += amount;

    this.bonusRewards.ads.history.unshift({

        network,

        amount,

        createdAt: new Date().toISOString()

    });

    this.addTransaction({

        id: "AD-" + Date.now(),

        type: TRANSACTION_TYPES.WATCH_AD,

        amount,

        status: TRANSACTION_STATUS.COMPLETED,

        description: network,

        createdAt: new Date().toISOString()

    });

    this.saveCache();

    return {

        success: true,

        reward: amount

    };

};


/* =====================================================
   GETTERS
===================================================== */

Wallet.getBonusRewards = function () {

    return this.bonusRewards;

};


Wallet.getSpinHistory = function () {

    return this.bonusRewards.spinWheel.history;

};


Wallet.getMysteryBoxHistory = function () {

    return this.bonusRewards.mysteryBox.history;

};


Wallet.getAdRewardHistory = function () {

    return this.bonusRewards.ads.history;

};


/* =====================================================
   RESET BONUS REWARDS
===================================================== */

Wallet.resetBonusRewards = function () {

    this.bonusRewards = {

        spinWheel: {

            totalSpins: 0,

            totalEarned: 0,

            history: []

        },

        mysteryBox: {

            opened: 0,

            totalEarned: 0,

            history: []

        },

        ads: {

            watched: 0,

            totalEarned: 0,

            history: []

        }

    };

};


/* =====================================================
   END OF PHASE 4C.4
===================================================== */

/* =====================================================
   PHASE 4C.5
   BONUS MULTIPLIERS & PROMOTIONAL CAMPAIGNS
===================================================== */

/* =====================================================
   BONUS STATE
===================================================== */

Wallet.bonus = {

    multiplier: 1.0,

    activeCampaigns: [],

    campaignHistory: [],

    promoCodes: [],

    seasonalBonus: null,

    expiresAt: null

};


/* =====================================================
   LOAD CAMPAIGNS
===================================================== */

Wallet.loadCampaigns = async function () {

    try {

        const response = await Api.getBonusCampaigns();

        if (!response.success) {

            return response;

        }

        this.bonus.activeCampaigns =

            response.campaigns || [];

        this.bonus.multiplier =

            response.multiplier || 1;

        this.bonus.seasonalBonus =

            response.seasonalBonus || null;

        this.bonus.expiresAt =

            response.expiresAt || null;

        return response;

    }

    catch (error) {

        return this.handleError(

            error,

            "Load Campaigns"

        );

    }

};


/* =====================================================
   BONUS MULTIPLIER
===================================================== */

Wallet.applyBonusMultiplier = function (

    amount

) {

    amount = Number(amount || 0);

    return Number(

        (

            amount *

            this.bonus.multiplier

        ).toFixed(8)

    );

};


/* =====================================================
   PROMO CODE
===================================================== */

Wallet.redeemPromoCode = async function (

    code

) {

    try {

        const response = await Api.redeemPromoCode({

            code

        });

        if (!response.success) {

            return response;

        }

        const reward = Number(

            response.reward || 0

        );

        if (reward > 0) {

            this.credit(reward);

        }

        this.bonus.promoCodes.push({

            code,

            reward,

            redeemedAt:

                new Date().toISOString()

        });

        this.addTransaction({

            id:

                "PROMO-" +

                Date.now(),

            type:

                TRANSACTION_TYPES.PROMOTION,

            amount:

                reward,

            status:

                TRANSACTION_STATUS.COMPLETED,

            description:

                `Promo Code: ${code}`,

            createdAt:

                new Date().toISOString()

        });

        this.saveCache();

        return {

            success: true,

            reward

        };

    }

    catch (error) {

        return this.handleError(

            error,

            "Redeem Promo Code"

        );

    }

};


/* =====================================================
   ACTIVATE CAMPAIGN
===================================================== */

Wallet.activateCampaign = function (

    campaign

) {

    this.bonus.activeCampaigns.push(

        campaign

    );

};


/* =====================================================
   COMPLETE CAMPAIGN
===================================================== */

Wallet.completeCampaign = function (

    campaignId

) {

    const campaign =

        this.bonus.activeCampaigns.find(

            item =>

                item.id ===

                campaignId

        );

    if (!campaign) {

        return false;

    }

    this.bonus.campaignHistory.unshift({

        ...campaign,

        completedAt:

            new Date().toISOString()

    });

    this.bonus.activeCampaigns =

        this.bonus.activeCampaigns.filter(

            item =>

                item.id !==

                campaignId

        );

    return true;

};


/* =====================================================
   GETTERS
===================================================== */

Wallet.getBonusMultiplier = function () {

    return this.bonus.multiplier;

};


Wallet.getActiveCampaigns = function () {

    return this.bonus.activeCampaigns;

};


Wallet.getCampaignHistory = function () {

    return this.bonus.campaignHistory;

};


Wallet.getPromoCodes = function () {

    return this.bonus.promoCodes;

};


/* =====================================================
   RESET BONUS SYSTEM
===================================================== */

Wallet.resetBonusSystem = function () {

    this.bonus = {

        multiplier: 1,

        activeCampaigns: [],

        campaignHistory: [],

        promoCodes: [],

        seasonalBonus: null,

        expiresAt: null

    };

};


/* =====================================================
   END OF PHASE 4C.5
===================================================== */

/* =====================================================
   PHASE 4D.1
   WALLET CONTROL PANEL
   WALLET STATISTICS & ANALYTICS
===================================================== */


/* =====================================================
   WALLET ANALYTICS STATE
===================================================== */

Wallet.analytics = {

    lifetimeEarned: 0,

    lifetimeWithdrawn: 0,

    lifetimeSpent: 0,

    lifetimeBonuses: 0,

    lifetimeReferrals: 0,

    lifetimeAds: 0,

    lifetimeTasks: 0,

    averageDailyIncome: 0,

    averageWithdrawal: 0,

    highestSingleReward: 0,

    lastUpdated: null

};


/* =====================================================
   LOAD ANALYTICS
===================================================== */

Wallet.loadAnalytics = async function () {

    try {

        const response = await Api.getWalletAnalytics();

        if (!response.success) {

            return response;

        }

        this.analytics = {

            ...this.analytics,

            ...(response.analytics || {}),

            lastUpdated:

                new Date().toISOString()

        };

        return response;

    }

    catch (error) {

        return this.handleError(

            error,

            "Wallet Analytics"

        );

    }

};


/* =====================================================
   REFRESH ANALYTICS
===================================================== */

Wallet.refreshAnalytics = function () {

    this.analytics.lifetimeEarned =

        this.summary.earned;

    this.analytics.lifetimeWithdrawn =

        this.summary.withdrawn;

    this.analytics.lifetimeSpent =

        this.summary.spent;

    this.analytics.lifetimeTasks =

        this.taskRewards.totalEarned;

    this.analytics.lifetimeReferrals =

        this.referrals.totalCommission;

    this.analytics.lifetimeAds =

        this.bonusRewards.ads.totalEarned;

    this.analytics.lifetimeBonuses =

        this.dailyBonus.reward +

        this.bonusRewards.spinWheel.totalEarned +

        this.bonusRewards.mysteryBox.totalEarned;

    this.analytics.lastUpdated =

        new Date().toISOString();

};


/* =====================================================
   CALCULATE AVERAGES
===================================================== */

Wallet.calculateAnalytics = function () {

    const withdrawals =

        this.withdrawals.length || 1;

    const transactions =

        this.transactions.length || 1;

    this.analytics.averageWithdrawal =

        Number(

            (

                this.summary.withdrawn /

                withdrawals

            ).toFixed(8)

        );

    this.analytics.averageDailyIncome =

        Number(

            (

                this.summary.earned /

                Math.max(

                    1,

                    transactions

                )

            ).toFixed(8)

        );

    const highest =

        this.transactions.reduce(

            (max, tx) =>

                Math.max(

                    max,

                    Number(tx.amount || 0)

                ),

            0

        );

    this.analytics.highestSingleReward =

        highest;

};


/* =====================================================
   DASHBOARD
===================================================== */

Wallet.getDashboardStatistics = function () {

    this.refreshAnalytics();

    this.calculateAnalytics();

    return {

        balance:

            this.wallets.main,

        pending:

            this.wallets.pending,

        earned:

            this.summary.earned,

        withdrawn:

            this.summary.withdrawn,

        spent:

            this.summary.spent,

        tasks:

            this.taskRewards.totalTasksCompleted,

        referrals:

            this.referrals.totalReferrals,

        ads:

            this.bonusRewards.ads.watched,

        streak:

            this.dailyBonus.streak,

        analytics:

            this.analytics

    };

};


/* =====================================================
   EXPORT ANALYTICS
===================================================== */

Wallet.exportAnalytics = function () {

    return {

        wallet:

            this.wallets,

        summary:

            this.summary,

        analytics:

            this.analytics,

        generatedAt:

            new Date().toISOString()

    };

};


/* =====================================================
   END OF PHASE 4D.1
===================================================== */

/* =====================================================
   PHASE 4D.2
   EXPORT TRANSACTIONS
   CSV / PDF
===================================================== */


/* =====================================================
   EXPORT HELPERS
===================================================== */

Wallet.export = {

    lastExport: null,

    supportedFormats: [

        "csv",

        "pdf"

    ]

};


/* =====================================================
   EXPORT CSV
===================================================== */

Wallet.exportTransactionsCSV = function (

    filename = "wallet_transactions.csv"

) {

    try {

        const rows = [

            [

                "ID",

                "Type",

                "Amount",

                "Status",

                "Reference",

                "Description",

                "Created At"

            ]

        ];

        this.transactions.forEach(

            transaction => {

                rows.push([

                    transaction.id || "",

                    transaction.type || "",

                    transaction.amount || 0,

                    transaction.status || "",

                    transaction.reference || "",

                    transaction.description || "",

                    transaction.createdAt || ""

                ]);

            }

        );

        const csv = rows

            .map(

                row =>

                    row

                        .map(

                            value =>

                                `"${String(value).replace(/"/g, '""')}"`
                        )

                        .join(",")

            )

            .join("\n");

        Utils.download(

            csv,

            filename,

            "text/csv"

        );

        this.export.lastExport = {

            format: "csv",

            createdAt: new Date().toISOString()

        };

        return {

            success: true

        };

    }

    catch (error) {

        return this.handleError(

            error,

            "CSV Export"

        );

    }

};


/* =====================================================
   EXPORT PDF
===================================================== */

Wallet.exportTransactionsPDF = async function (

    filename = "wallet_transactions.pdf"

) {

    try {

        const response = await Api.exportTransactionsPDF({

            transactions:

                this.transactions,

            filename

        });

        if (!response.success) {

            return response;

        }

        this.export.lastExport = {

            format: "pdf",

            createdAt: new Date().toISOString()

        };

        return response;

    }

    catch (error) {

        return this.handleError(

            error,

            "PDF Export"

        );

    }

};


/* =====================================================
   GENERIC EXPORT
===================================================== */

Wallet.exportTransactions = async function (

    format = "csv"

) {

    format =

        format.toLowerCase();

    if (

        format === "csv"

    ) {

        return this.exportTransactionsCSV();

    }

    if (

        format === "pdf"

    ) {

        return await this.exportTransactionsPDF();

    }

    return {

        success: false,

        message:

            "Unsupported export format."

    };

};


/* =====================================================
   EXPORT HISTORY
===================================================== */

Wallet.getLastExport = function () {

    return this.export.lastExport;

};


Wallet.getSupportedExportFormats = function () {

    return this.export.supportedFormats;

};


/* =====================================================
   END OF PHASE 4D.2
===================================================== */

/* =====================================================
   PHASE 4D.3
   ADMIN WALLET CONTROLS
   CREDIT
   DEBIT
   FREEZE
   UNFREEZE
===================================================== */


/* =====================================================
   ADMIN STATE
===================================================== */

Wallet.admin = {

    frozen: false,

    frozenReason: "",

    frozenAt: null,

    frozenBy: null

};


/* =====================================================
   ADMIN CREDIT
===================================================== */

Wallet.adminCredit = async function (

    userId,

    amount,

    reason = ""

) {

    try {

        const response = await Api.adminCreditWallet({

            userId,

            amount,

            reason

        });

        if (!response.success) {

            return response;

        }

        if (

            State.user.id === userId

        ) {

            this.credit(amount);

        }

        return response;

    }

    catch (error) {

        return this.handleError(

            error,

            "Admin Credit"

        );

    }

};


/* =====================================================
   ADMIN DEBIT
===================================================== */

Wallet.adminDebit = async function (

    userId,

    amount,

    reason = ""

) {

    try {

        const response = await Api.adminDebitWallet({

            userId,

            amount,

            reason

        });

        if (!response.success) {

            return response;

        }

        if (

            State.user.id === userId

        ) {

            this.debit(amount);

        }

        return response;

    }

    catch (error) {

        return this.handleError(

            error,

            "Admin Debit"

        );

    }

};


/* =====================================================
   FREEZE WALLET
===================================================== */

Wallet.freeze = async function (

    userId,

    reason = ""

) {

    try {

        const response = await Api.freezeWallet({

            userId,

            reason

        });

        if (!response.success) {

            return response;

        }

        if (

            State.user.id === userId

        ) {

            this.admin.frozen = true;

            this.admin.frozenReason = reason;

            this.admin.frozenAt =

                new Date().toISOString();

        }

        return response;

    }

    catch (error) {

        return this.handleError(

            error,

            "Freeze Wallet"

        );

    }

};


/* =====================================================
   UNFREEZE WALLET
===================================================== */

Wallet.unfreeze = async function (

    userId

) {

    try {

        const response = await Api.unfreezeWallet({

            userId

        });

        if (!response.success) {

            return response;

        }

        if (

            State.user.id === userId

        ) {

            this.admin.frozen = false;

            this.admin.frozenReason = "";

            this.admin.frozenAt = null;

            this.admin.frozenBy = null;

        }

        return response;

    }

    catch (error) {

        return this.handleError(

            error,

            "Unfreeze Wallet"

        );

    }

};


/* =====================================================
   WALLET STATUS
===================================================== */

Wallet.isFrozen = function () {

    return this.admin.frozen;

};


Wallet.getFreezeInfo = function () {

    return this.admin;

};


/* =====================================================
   END OF PHASE 4D.3
===================================================== */

/* =====================================================
   PHASE 4D.4
   LIVE SYNCHRONIZATION WITH BACKEND
===================================================== */


/* =====================================================
   LIVE SYNC STATE
===================================================== */

Wallet.liveSync = {

    enabled: true,

    interval: 30000,

    timer: null,

    lastSync: null,

    reconnectAttempts: 0,

    maxReconnectAttempts: 10,

    online: true

};


/* =====================================================
   START LIVE SYNC
===================================================== */

Wallet.startLiveSync = function () {

    if (

        this.liveSync.timer ||

        !this.liveSync.enabled

    ) {

        return;

    }

    this.liveSync.timer = setInterval(

        async () => {

            if (

                this.processing ||

                this.loading

            ) {

                return;

            }

            await this.syncWithBackend();

        },

        this.liveSync.interval

    );

};


/* =====================================================
   STOP LIVE SYNC
===================================================== */

Wallet.stopLiveSync = function () {

    if (

        this.liveSync.timer

    ) {

        clearInterval(

            this.liveSync.timer

        );

        this.liveSync.timer = null;

    }

};


/* =====================================================
   SYNC WITH BACKEND
===================================================== */

Wallet.syncWithBackend = async function () {

    try {

        this.setSyncing(true);

        const response =

            await Api.syncWallet();

        if (!response.success) {

            throw new Error(

                response.message ||

                "Synchronization failed."

            );

        }

        if (response.wallets) {

            this.wallets = {

                ...this.wallets,

                ...response.wallets

            };

        }

        if (response.summary) {

            this.summary = {

                ...this.summary,

                ...response.summary

            };

        }

        if (

            Array.isArray(

                response.transactions

            )

        ) {

            this.transactions =

                response.transactions;

            this.recentTransactions =

                this.transactions.slice(

                    0,

                    10

                );
        }

        this.liveSync.lastSync =

            new Date().toISOString();

        this.liveSync.reconnectAttempts = 0;

        this.liveSync.online = true;

        this.updateSummary();

        this.saveCache();

        return {

            success: true

        };

    }

    catch (error) {

        this.liveSync.online = false;

        this.liveSync.reconnectAttempts++;

        console.error(error);

        return {

            success: false,

            message:

                error.message

        };

    }

    finally {

        this.setSyncing(false);

    }

};


/* =====================================================
   FORCE SYNC
===================================================== */

Wallet.forceSync = async function () {

    this.clearCache();

    return await this.syncWithBackend();

};


/* =====================================================
   CONNECTION STATUS
===================================================== */

Wallet.isOnline = function () {

    return this.liveSync.online;

};


Wallet.getLastSyncTime = function () {

    return this.liveSync.lastSync;

};


/* =====================================================
   AUTO START / STOP
===================================================== */

window.addEventListener(

    "online",

    () => {

        Wallet.liveSync.online = true;

        Wallet.syncWithBackend();

        Wallet.startLiveSync();

    }

);

window.addEventListener(

    "offline",

    () => {

        Wallet.liveSync.online = false;

        Wallet.stopLiveSync();

    }

);


/* =====================================================
   END OF PHASE 4D.4
===================================================== */

/* =====================================================
   PHASE 4D.5
   FINAL OPTIMIZATION
   PRODUCTION LOCK
===================================================== */


/* =====================================================
   PERFORMANCE OPTIMIZATION
===================================================== */

Wallet.optimize = function () {

    try {

        /* Keep only recent transactions in memory */
        const maxTransactions = 1000;

        if (

            this.transactions.length >

            maxTransactions

        ) {

            this.transactions =

                this.transactions.slice(

                    0,

                    maxTransactions

                );

        }

        /* Refresh recent list */
        this.recentTransactions =

            this.transactions.slice(

                0,

                10

            );

        /* Refresh analytics */
        this.refreshAnalytics();

        this.calculateAnalytics();

        /* Save optimized cache */
        this.saveCache();

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

};


/* =====================================================
   MEMORY CLEANUP
===================================================== */

Wallet.cleanup = function () {

    this.selectedTransaction = null;

    this.filters = {

        type: "all",

        status: "all",

        from: null,

        to: null

    };

};


/* =====================================================
   HEALTH CHECK
===================================================== */

Wallet.healthCheck = function () {

    return {

        initialized:

            this.initialized,

        online:

            this.liveSync.online,

        syncing:

            this.syncing,

        processing:

            this.processing,

        cached:

            !!localStorage.getItem(

                this.cacheKey

            ),

        transactions:

            this.transactions.length,

        withdrawals:

            this.withdrawals.length,

        balance:

            this.wallets.main,

        pending:

            this.wallets.pending,

        lastSync:

            this.liveSync.lastSync

    };

};


/* =====================================================
   SHUTDOWN
===================================================== */

Wallet.shutdown = function () {

    this.stopAutoRefresh();

    this.stopLiveSync();

    this.optimize();

};


/* =====================================================
   PRODUCTION LOCK
===================================================== */

Object.freeze(

    WITHDRAWAL_METHODS

);

Object.freeze(

    WITHDRAWAL_STATUS

);

Object.freeze(

    TRANSACTION_TYPES

);

Object.freeze(

    TRANSACTION_STATUS

);

Object.seal(

    Wallet

);


/* =====================================================
   FINAL INITIALIZATION
===================================================== */

window.addEventListener(

    "beforeunload",

    () => {

        Wallet.shutdown();

    }

);

window.addEventListener(

    "visibilitychange",

    () => {

        if (

            document.hidden

        ) {

            Wallet.optimize();

        }

    }

);


/* =====================================================
   PRODUCTION READY
===================================================== */

Wallet.production = {

    version: "1.0.0",

    build: "production",

    module: "wallet",

    locked: true,

    initialized: true

};


/* =====================================================
   END OF PHASE 4D.5
   WALLET MODULE COMPLETE
===================================================== */
