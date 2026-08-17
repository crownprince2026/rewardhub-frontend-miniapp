"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB
   TELEGRAM MINI APP
   TASKS.JS
   PHASE 3A.1
   IMPORTS
   CONSTANTS
   TASK STATE
===================================================== */

import Api from "./api.js";
import State from "./state.js";
import Settings from "./settings.js";
import Utils from "./utils.js";

/* =====================================================
   CONSTANTS
===================================================== */

const TASK_STATUS = {

    AVAILABLE: "available",

    STARTED: "started",

    PENDING: "pending",

    COMPLETED: "completed",

    REJECTED: "rejected",

    EXPIRED: "expired"

};

const TASK_TYPES = {

    TELEGRAM: "telegram",

    TWITTER: "twitter",

    OFFERWALL: "offerwall",

    YOUTUBE: "youtube",

    WEBSITE: "website",

    APP: "app",

    SURVEY: "survey",

    VIDEO: "video",

    DAILY: "daily",

    SPECIAL: "special"

};

const DEFAULT_CATEGORY = "all";

const PAGE_SIZE = 20;

/* =====================================================
   TASK STATE
===================================================== */

const Tasks = {

    initialized: false,

    loading: false,

    syncing: false,

    verifying: false,

    currentTask: null,

    tasks: [],

    completedTasks: [],

    pendingTasks: [],

    rejectedTasks: [],

    categories: [],

    selectedCategory: DEFAULT_CATEGORY,

    searchQuery: "",

    page: 1,

    pageSize: PAGE_SIZE,

    totalTasks: 0,

    hasMore: true,

    filters: {

        category: DEFAULT_CATEGORY,

        status: TASK_STATUS.AVAILABLE,

        rewardMin: 0,

        rewardMax: null,

        advertiser: null,

        featured: false

    },

    statistics: {

        completed: 0,

        pending: 0,

        rejected: 0,

        earned: 0,

        available: 0

    }

};

/* =====================================================
   GETTERS
===================================================== */

Tasks.getTasks = function () {

    return this.tasks;

};

Tasks.getCompletedTasks = function () {

    return this.completedTasks;

};

Tasks.getPendingTasks = function () {

    return this.pendingTasks;

};

Tasks.getRejectedTasks = function () {

    return this.rejectedTasks;

};

Tasks.getCurrentTask = function () {

    return this.currentTask;

};

Tasks.getCategory = function () {

    return this.selectedCategory;

};

Tasks.getStatistics = function () {

    return this.statistics;

};

/* =====================================================
   SETTERS
===================================================== */

Tasks.setCurrentTask = function (

    task

) {

    this.currentTask = task;

};

Tasks.setCategory = function (

    category

) {

    this.selectedCategory = category;

};

Tasks.setSearchQuery = function (

    query

) {

    this.searchQuery = query;

};

Tasks.setLoading = function (

    value

) {

    this.loading = value;

};

Tasks.setSyncing = function (

    value

) {

    this.syncing = value;

};

Tasks.setVerifying = function (

    value

) {

    this.verifying = value;

};

/* =====================================================
   END OF PHASE 3A.1
===================================================== */

/* =====================================================
   PHASE 3A.2
   TASK LOADING
   CATEGORIES
   FILTERING
===================================================== */


/* =====================================================
   LOAD TASKS
===================================================== */

Tasks.loadTasks = async function (

    refresh = false

) {

    try {

        this.setLoading(true);

        if (refresh) {

            this.page = 1;

            this.tasks = [];

        }

        const response = await Api.getTasks({

            page: this.page,

            pageSize: this.pageSize,

            category: this.filters.category,

            status: this.filters.status,

            search: this.searchQuery

        });

        if (!response.success) {

            throw new Error(

                response.message ||

                "Failed to load tasks."

            );

        }

        const items = response.tasks || [];

        if (refresh) {

            this.tasks = items;

        } else {

            this.tasks.push(...items);

        }

        this.totalTasks =

            response.total ||

            this.tasks.length;

        this.hasMore =

            this.tasks.length <

            this.totalTasks;

        this.updateStatistics();

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

    finally {

        this.setLoading(false);

    }

};


/* =====================================================
   LOAD MORE
===================================================== */

Tasks.loadMore = async function () {

    if (

        !this.hasMore ||

        this.loading

    ) {

        return false;

    }

    this.page++;

    return await this.loadTasks();

};


/* =====================================================
   CATEGORIES
===================================================== */

Tasks.loadCategories = async function () {

    try {

        const response =

            await Api.getTaskCategories();

        if (

            response.success

        ) {

            this.categories =

                response.categories || [];

        }

    }

    catch (error) {

        console.error(error);

    }

};


Tasks.getCategories = function () {

    return this.categories;

};


/* =====================================================
   FILTERS
===================================================== */

Tasks.setFilter = function (

    key,

    value

) {

    this.filters[key] = value;

};


Tasks.resetFilters = function () {

    this.filters = {

        category: DEFAULT_CATEGORY,

        status: TASK_STATUS.AVAILABLE,

        rewardMin: 0,

        rewardMax: null,

        advertiser: null,

        featured: false

    };

};


/* =====================================================
   FILTER TASKS
===================================================== */

Tasks.filteredTasks = function () {

    return this.tasks.filter(

        task => {

            if (

                this.filters.category !==

                DEFAULT_CATEGORY &&

                task.category !==

                this.filters.category

            ) {

                return false;

            }

            if (

                this.filters.status &&

                task.status !==

                this.filters.status

            ) {

                return false;

            }

            if (

                this.filters.rewardMin &&

                task.reward <

                this.filters.rewardMin

            ) {

                return false;

            }

            if (

                this.filters.rewardMax &&

                task.reward >

                this.filters.rewardMax

            ) {

                return false;

            }

            if (

                this.filters.featured &&

                !task.featured

            ) {

                return false;

            }

            if (

                this.searchQuery

            ) {

                const text =

                    (

                        task.title +

                        " " +

                        task.description

                    ).toLowerCase();

                if (

                    !text.includes(

                        this.searchQuery

                        .toLowerCase()

                    )

                ) {

                    return false;

                }

            }

            return true;

        }

    );

};


/* =====================================================
   SEARCH
===================================================== */

Tasks.search = function (

    query

) {

    this.setSearchQuery(

        query

    );

    return this.filteredTasks();

};


/* =====================================================
   STATISTICS
===================================================== */

Tasks.updateStatistics = function () {

    this.statistics.available =

        this.tasks.filter(

            t =>

                t.status ===

                TASK_STATUS.AVAILABLE

        ).length;

    this.statistics.completed =

        this.tasks.filter(

            t =>

                t.status ===

                TASK_STATUS.COMPLETED

        ).length;

    this.statistics.pending =

        this.tasks.filter(

            t =>

                t.status ===

                TASK_STATUS.PENDING

        ).length;

    this.statistics.rejected =

        this.tasks.filter(

            t =>

                t.status ===

                TASK_STATUS.REJECTED

        ).length;

    this.statistics.earned =

        this.tasks

            .filter(

                t =>

                    t.status ===

                    TASK_STATUS.COMPLETED

            )

            .reduce(

                (

                    total,

                    task

                ) =>

                    total +

                    task.reward,

                0

            );

};


/* =====================================================
   END OF PHASE 3A.2
===================================================== */

/* =====================================================
   PHASE 3A.3
   TASK VERIFICATION
   TELEGRAM
   X (TWITTER)
   OFFER WALLS
   SCREENSHOTS
===================================================== */


/* =====================================================
   VERIFY TELEGRAM TASK
===================================================== */

Tasks.verifyTelegramTask = async function (

    taskId

) {

    this.setVerifying(true);

    try {

        const response = await Api.verifyTelegramTask({

            taskId

        });

        return response;

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message: "Telegram verification failed."

        };

    }

    finally {

        this.setVerifying(false);

    }

};


/* =====================================================
   VERIFY X (TWITTER) TASK
===================================================== */

Tasks.verifyTwitterTask = async function (

    taskId

) {

    this.setVerifying(true);

    try {

        const response = await Api.verifyTwitterTask({

            taskId

        });

        return response;

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message: "X verification failed."

        };

    }

    finally {

        this.setVerifying(false);

    }

};


/* =====================================================
   VERIFY OFFER WALL TASK
===================================================== */

Tasks.verifyOfferwallTask = async function (

    taskId,

    provider

) {

    this.setVerifying(true);

    try {

        const response = await Api.verifyOfferwallTask({

            taskId,

            provider

        });

        return response;

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message: "Offerwall verification failed."

        };

    }

    finally {

        this.setVerifying(false);

    }

};


/* =====================================================
   UPLOAD SCREENSHOT
===================================================== */

Tasks.uploadScreenshot = async function (

    taskId,

    file

) {

    this.setVerifying(true);

    try {

        const formData = new FormData();

        formData.append(

            "taskId",

            taskId

        );

        formData.append(

            "screenshot",

            file

        );

        const response = await Api.uploadTaskProof(

            formData

        );

        return response;

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message: "Screenshot upload failed."

        };

    }

    finally {

        this.setVerifying(false);

    }

};


/* =====================================================
   UNIVERSAL TASK VERIFIER
===================================================== */

Tasks.verifyTask = async function (

    task,

    payload = null

) {

    if (!task) {

        return {

            success: false,

            message: "Task not found."

        };

    }

    switch (

        task.type

    ) {

        case TASK_TYPES.TELEGRAM:

            return await this.verifyTelegramTask(

                task.id

            );

        case TASK_TYPES.TWITTER:

            return await this.verifyTwitterTask(

                task.id

            );

        case TASK_TYPES.OFFERWALL:

            return await this.verifyOfferwallTask(

                task.id,

                task.provider

            );

        default:

            if (payload instanceof File) {

                return await this.uploadScreenshot(

                    task.id,

                    payload

                );

            }

            return {

                success: false,

                message: "Unsupported verification type."

            };

    }

};


/* =====================================================
   OPEN TASK
===================================================== */

Tasks.openTask = function (

    task

) {

    this.setCurrentTask(

        task

    );

    if (

        task.link

    ) {

        window.open(

            task.link,

            "_blank"

        );

    }

};


/* =====================================================
   MARK AS PENDING
===================================================== */

Tasks.markPending = function (

    taskId

) {

    const task = this.tasks.find(

        t => t.id === taskId

    );

    if (!task) return;

    task.status =

        TASK_STATUS.PENDING;

    this.updateStatistics();

};


/* =====================================================
   END OF PHASE 3A.3
===================================================== */

/* =====================================================
   PHASE 3A.4
   TASK COMPLETION
   REWARDS
   ANTI-FRAUD
===================================================== */


/* =====================================================
   COMPLETE TASK
===================================================== */

Tasks.completeTask = async function (

    taskId

) {

    try {

        const task = this.tasks.find(

            t => t.id === taskId

        );

        if (!task) {

            throw new Error(

                "Task not found."

            );

        }

        const fraud = await this.checkFraud(

            task

        );

        if (!fraud.success) {

            return fraud;

        }

        const response = await Api.completeTask({

            taskId

        });

        if (!response.success) {

            return response;

        }

        task.status =

            TASK_STATUS.COMPLETED;

        task.completedAt =

            new Date().toISOString();

        task.rewardClaimed = true;

        this.completedTasks.push(

            task

        );

        this.statistics.completed++;

        this.statistics.available--;

        this.statistics.earned +=

            Number(task.reward || 0);

        State.user.balance +=

            Number(task.reward || 0);

        return {

            success: true,

            reward:

                task.reward,

            task

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

};


/* =====================================================
   CLAIM REWARD
===================================================== */

Tasks.claimReward = async function (

    taskId

) {

    try {

        const response =

            await Api.claimTaskReward({

                taskId

            });

        return response;

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            message:

                "Unable to claim reward."

        };

    }

};


/* =====================================================
   ANTI FRAUD
===================================================== */

Tasks.checkFraud = async function (

    task

) {

    try {

        if (

            task.status ===

            TASK_STATUS.COMPLETED

        ) {

            return {

                success: false,

                reason:

                    "Task already completed."

            };

        }

        if (

            task.status ===

            TASK_STATUS.PENDING

        ) {

            return {

                success: false,

                reason:

                    "Task awaiting review."

            };

        }

        if (

            task.expiresAt &&

            Date.now() >

            new Date(

                task.expiresAt

            ).getTime()

        ) {

            return {

                success: false,

                reason:

                    "Task expired."

            };

        }

        const response =

            await Api.checkTaskFraud({

                taskId: task.id

            });

        return response;

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            reason:

                "Fraud detection failed."

        };

    }

};


/* =====================================================
   REPORT TASK
===================================================== */

Tasks.reportTask = async function (

    taskId,

    reason

) {

    return await Api.reportTask({

        taskId,

        reason

    });

};


/* =====================================================
   CANCEL TASK
===================================================== */

Tasks.cancelTask = function (

    taskId

) {

    const task = this.tasks.find(

        t => t.id === taskId

    );

    if (!task) {

        return false;

    }

    task.status =

        TASK_STATUS.AVAILABLE;

    return true;

};


/* =====================================================
   AUTO REFRESH
===================================================== */

Tasks.autoRefresh = async function () {

    if (

        this.loading ||

        this.syncing

    ) {

        return;

    }

    await this.loadTasks(

        true

    );

};


/* =====================================================
   END OF PHASE 3A.4
===================================================== */

/* =====================================================
   PHASE 3A.5
   HISTORY
   SYNCHRONIZATION
   PRODUCTION EXPORT
===================================================== */


/* =====================================================
   HISTORY
===================================================== */

Tasks.getHistory = function (

    status = null

) {

    if (!status) {

        return [

            ...this.completedTasks,

            ...this.pendingTasks,

            ...this.rejectedTasks

        ];

    }

    switch (status) {

        case TASK_STATUS.COMPLETED:

            return this.completedTasks;

        case TASK_STATUS.PENDING:

            return this.pendingTasks;

        case TASK_STATUS.REJECTED:

            return this.rejectedTasks;

        default:

            return [];

    }

};


Tasks.clearHistory = function () {

    this.completedTasks = [];

    this.pendingTasks = [];

    this.rejectedTasks = [];

};


/* =====================================================
   SYNCHRONIZATION
===================================================== */

Tasks.sync = async function () {

    try {

        this.setSyncing(true);

        await this.loadCategories();

        await this.loadTasks(true);

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
   INITIALIZATION
===================================================== */

Tasks.initialize = async function () {

    if (

        this.initialized

    ) {

        return;

    }

    await this.sync();

    this.initialized = true;

};


/* =====================================================
   STATUS
===================================================== */

Tasks.status = function () {

    return {

        initialized: this.initialized,

        loading: this.loading,

        syncing: this.syncing,

        verifying: this.verifying,

        totalTasks: this.totalTasks,

        loadedTasks: this.tasks.length,

        completed: this.completedTasks.length,

        pending: this.pendingTasks.length,

        rejected: this.rejectedTasks.length,

        category: this.selectedCategory,

        page: this.page,

        hasMore: this.hasMore

    };

};


/* =====================================================
   RESET
===================================================== */

Tasks.reset = function () {

    this.loading = false;

    this.syncing = false;

    this.verifying = false;

    this.currentTask = null;

    this.tasks = [];

    this.completedTasks = [];

    this.pendingTasks = [];

    this.rejectedTasks = [];

    this.categories = [];

    this.selectedCategory = DEFAULT_CATEGORY;

    this.searchQuery = "";

    this.page = 1;

    this.totalTasks = 0;

    this.hasMore = true;

    this.initialized = false;

};


/* =====================================================
   ERROR HANDLER
===================================================== */

Tasks.handleError = function (

    error,

    context = "Tasks"

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

            "Unknown tasks error.",

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

            await Tasks.initialize();

        }

        catch (error) {

            Tasks.handleError(

                error,

                "Initialization"

            );

        }

    }

);


/* =====================================================
   PRODUCTION EXPORT
===================================================== */

export default Tasks;


/* =====================================================
   END OF FILE
   frontend/js/tasks.js
   CROWN PRINCE REWARD HUB
   PRODUCTION BUILD
===================================================== */

export default Tasks;

Tasks.load = Tasks.loadTasks;
