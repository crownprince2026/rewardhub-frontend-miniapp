"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB - TASKS MODULE
   CLEAN RECONSTRUCTION - PHASE 4 (FEATURE MODULES)
===================================================== */

import Api from "./api.js";
import State from "./state.js";
import Settings from "./settings.js";
import Utils from "./utils.js";

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
    selectedCategory: "all",
    searchQuery: "",
    page: 1,
    pageSize: 20,
    totalTasks: 0,
    hasMore: true,
    filters: {
        category: "all",
        status: "available",
        rewardMin: 0,
        rewardMax: null,
        advertiser: null,
        featured: false
    },
    statistics: { completed: 0, pending: 0, rejected: 0, earned: 0, available: 0 }
};

/* --- GETTERS & SETTERS --- */
Tasks.getTasks = function () { return this.tasks; };
Tasks.getStatistics = function () { return this.statistics; };
Tasks.setLoading = function (v) { this.loading = v; };
Tasks.setVerifying = function (v) { this.verifying = v; };

/* --- LOAD TASKS --- */
Tasks.loadTasks = async function (refresh = false) {
    try {
        this.setLoading(true);
        if (refresh) { this.page = 1; this.tasks = []; }
        
        // Pass userId if available in State
        const user = State.getUser();
        const response = await Api.getTasks(user?.user_id);

        if (!response.success) throw new Error(response.message || "Failed to load tasks.");
        
        const items = response.data || []; // Matches reconstructed Backend 'data' field
        if (refresh) { this.tasks = items; } else { this.tasks.push(...items); }
        
        this.totalTasks = response.count || this.tasks.length;
        this.hasMore = this.tasks.length < this.totalTasks;
        this.updateStatistics();
        return true;
    } catch (error) { 
        console.error("Tasks Load Error:", error); 
        return false; 
    } finally { 
        this.setLoading(false); 
    }
};

Tasks.load = Tasks.loadTasks; // Alias for App.js

/* --- FILTERING & SEARCH --- */
Tasks.filteredTasks = function () {
    return this.tasks.filter(task => {
        if (this.filters.category !== "all" && task.category !== this.filters.category) return false;
        if (this.filters.status && task.status !== this.filters.status) return false;
        if (this.filters.rewardMin && task.reward < this.filters.rewardMin) return false;
        if (this.filters.rewardMax && task.reward > this.filters.rewardMax) return false; 
        if (this.searchQuery) {
            const text = (task.title + " " + (task.description || "")).toLowerCase();
            if (!text.includes(this.searchQuery.toLowerCase())) return false;
        }
        return true;
    });
};

/* --- STATISTICS --- */
Tasks.updateStatistics = function () {
    this.statistics.available = this.tasks.filter(t => t.status === TASK_STATUS.AVAILABLE).length;
    this.statistics.completed = this.tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
    this.statistics.pending = this.tasks.filter(t => t.status === TASK_STATUS.PENDING).length;
    this.statistics.earned = this.tasks.filter(t => t.status === TASK_STATUS.COMPLETED).reduce((sum, t) => sum + (t.reward || 0), 0);
};

/* --- VERIFICATION --- */
Tasks.verifyTelegramTask = async function (taskId) {
    try {
        this.setVerifying(true);
        return await Api.verifyTelegramTask(taskId);
    } catch (e) { return { success: false, message: "Verification failed" }; }
    finally { this.setVerifying(false); }
};

Tasks.verifyTwitterTask = async function (taskId) {
    try {
        this.setVerifying(true);
        return await Api.verifyTwitterTask(taskId);
    } catch (e) { return { success: false, message: "Verification failed" }; }
    finally { this.setVerifying(false); }
};

Tasks.verifyTask = async function (task) {
    if (!task) return { success: false, message: "No task" };
    if (task.type === "telegram") return await this.verifyTelegramTask(task.id);
    if (task.type === "twitter") return await this.verifyTwitterTask(task.id);
    return { success: false, message: "Unsupported verification type" };
};

export default Tasks;
