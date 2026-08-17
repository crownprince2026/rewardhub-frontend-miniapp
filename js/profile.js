"use strict";

/* =====================================================
   CROWN PRINCE REWARD HUB
   TELEGRAM MINI APP
   PROFILE.JS
   PHASE 5A.1
   IMPORTS
   CONSTANTS
   PROFILE STATE
===================================================== */

import Api from "./api.js";
import State from "./state.js";
import Settings from "./settings.js";
import Utils from "./utils.js";

/* =====================================================
   CONSTANTS
===================================================== */

const PROFILE_STATUS = {

    ACTIVE: "active",

    INACTIVE: "inactive",

    SUSPENDED: "suspended",

    BANNED: "banned"

};

const GENDER = {

    MALE: "male",

    FEMALE: "female",

    OTHER: "other",

    PREFER_NOT_TO_SAY: "prefer_not_to_say"

};

const AVATAR_TYPES = {

    TELEGRAM: "telegram",

    UPLOAD: "upload",

    DEFAULT: "default"

};

const CACHE_KEY = "rewardhub_profile_cache";

/* =====================================================
   PROFILE STATE
===================================================== */

const Profile = {

    initialized: false,

    loading: false,

    saving: false,

    syncing: false,

    profile: {

        id: null,

        telegramId: null,

        username: "",

        firstName: "",

        lastName: "",

        displayName: "",

        email: "",

        phone: "",

        gender: GENDER.PREFER_NOT_TO_SAY,

        bio: "",

        avatar: "",

        avatarType: AVATAR_TYPES.DEFAULT,

        language: "en",

        country: "",

        timezone: "",

        joinedAt: null,

        lastActive: null,

        status: PROFILE_STATUS.ACTIVE

    },

    statistics: {

        referrals: 0,

        completedTasks: 0,

        totalEarned: 0,

        totalWithdrawn: 0,

        level: 1,

        xp: 0

    },

    preferences: {

        showEmail: false,

        showPhone: false,

        showCountry: true,

        publicProfile: false

    },

    cacheTimestamp: null

};


/* =====================================================
   GETTERS
===================================================== */

Profile.getProfile = function () {

    return this.profile;

};

Profile.getStatistics = function () {

    return this.statistics;

};

Profile.getPreferences = function () {

    return this.preferences;

};


/* =====================================================
   SETTERS
===================================================== */

Profile.setLoading = function (

    value

) {

    this.loading = value;

};

Profile.setSaving = function (

    value

) {

    this.saving = value;

};

Profile.setSyncing = function (

    value

) {

    this.syncing = value;

};


/* =====================================================
   END OF PHASE 5A.1
===================================================== */

/* =====================================================
   PHASE 5A.2
   USER PROFILE MANAGEMENT
===================================================== */


/* =====================================================
   LOAD PROFILE
===================================================== */

Profile.load = async function () {

    try {

        this.setLoading(true);

        const response =

            await Api.getProfile();

        if (

            !response.success

        ) {

            return response;

        }

        this.profile = {

            ...this.profile,

            ...(response.profile || {})

        };

        this.statistics = {

            ...this.statistics,

            ...(response.statistics || {})

        };

        this.preferences = {

            ...this.preferences,

            ...(response.preferences || {})

        };

        return {

            success: true,

            profile: this.profile

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
   SAVE PROFILE
===================================================== */

Profile.save = async function () {

    try {

        this.setSaving(true);

        const response =

            await Api.updateProfile({

                profile:

                    this.profile,

                preferences:

                    this.preferences

            });

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

    finally {

        this.setSaving(false);

    }

};


/* =====================================================
   UPDATE FIELD
===================================================== */

Profile.updateField = function (

    field,

    value

) {

    if (

        Object.prototype.hasOwnProperty.call(

            this.profile,

            field

        )

    ) {

        this.profile[field] = value;

    }

};


/* =====================================================
   UPDATE MULTIPLE FIELDS
===================================================== */

Profile.update = function (

    data = {}

) {

    this.profile = {

        ...this.profile,

        ...data

    };

};


/* =====================================================
   UPDATE PREFERENCES
===================================================== */

Profile.updatePreferences = function (

    data = {}

) {

    this.preferences = {

        ...this.preferences,

        ...data

    };

};


/* =====================================================
   UPDATE STATISTICS
===================================================== */

Profile.updateStatistics = function (

    data = {}

) {

    this.statistics = {

        ...this.statistics,

        ...data

    };

};


/* =====================================================
   REFRESH
===================================================== */

Profile.refresh = async function () {

    return await this.load();

};


/* =====================================================
   RESET
===================================================== */

Profile.reset = function () {

    this.profile = {

        id: null,

        telegramId: null,

        username: "",

        firstName: "",

        lastName: "",

        displayName: "",

        email: "",

        phone: "",

        gender:

            GENDER.PREFER_NOT_TO_SAY,

        bio: "",

        avatar: "",

        avatarType:

            AVATAR_TYPES.DEFAULT,

        language: "en",

        country: "",

        timezone: "",

        joinedAt: null,

        lastActive: null,

        status:

            PROFILE_STATUS.ACTIVE

    };

};


/* =====================================================
   END OF PHASE 5A.2
===================================================== */

/* =====================================================
   PHASE 5A.3
   AVATAR
   USERNAME
   ACCOUNT SETTINGS
===================================================== */


/* =====================================================
   AVATAR MANAGEMENT
===================================================== */

Profile.setAvatar = async function (

    file

) {

    try {

        this.setSaving(true);

        const response = await Api.uploadAvatar({

            file

        });

        if (!response.success) {

            return response;

        }

        this.profile.avatar =

            response.avatar ||

            "";

        this.profile.avatarType =

            AVATAR_TYPES.UPLOAD;

        return {

            success: true,

            avatar:

                this.profile.avatar

        };

    }

    catch (error) {

        return {

            success: false,

            message:

                error.message

        };

    }

    finally {

        this.setSaving(false);

    }

};


Profile.removeAvatar = async function () {

    try {

        const response =

            await Api.removeAvatar();

        if (

            !response.success

        ) {

            return response;

        }

        this.profile.avatar = "";

        this.profile.avatarType =

            AVATAR_TYPES.DEFAULT;

        return response;

    }

    catch (error) {

        return {

            success: false,

            message:

                error.message

        };

    }

};


Profile.useTelegramAvatar = function (

    url

) {

    this.profile.avatar =

        url || "";

    this.profile.avatarType =

        AVATAR_TYPES.TELEGRAM;

};


/* =====================================================
   USERNAME
===================================================== */

Profile.changeUsername = async function (

    username

) {

    try {

        const response =

            await Api.changeUsername({

                username

            });

        if (

            response.success

        ) {

            this.profile.username =

                username;

        }

        return response;

    }

    catch (error) {

        return {

            success: false,

            message:

                error.message

        };

    }

};


/* =====================================================
   ACCOUNT SETTINGS
===================================================== */

Profile.updateAccountSettings = function (

    settings = {}

) {

    this.preferences = {

        ...this.preferences,

        ...settings

    };

};


Profile.getAccountSettings = function () {

    return this.preferences;

};


/* =====================================================
   DISPLAY NAME
===================================================== */

Profile.getDisplayName = function () {

    return (

        this.profile.displayName ||

        this.profile.firstName ||

        this.profile.username ||

        "User"

    );

};


/* =====================================================
   PROFILE COMPLETENESS
===================================================== */

Profile.getCompletion = function () {

    const fields = [

        "firstName",

        "lastName",

        "username",

        "email",

        "country",

        "bio",

        "avatar"

    ];

    let completed = 0;

    fields.forEach(field => {

        if (

            this.profile[field]

        ) {

            completed++;

        }

    });

    return Math.round(

        (

            completed /

            fields.length

        ) * 100

    );

};


/* =====================================================
   END OF PHASE 5A.3
===================================================== */

/* =====================================================
   PHASE 5A.4
   PROFILE SYNCHRONIZATION
   CACHE
===================================================== */


/* =====================================================
   CACHE MANAGEMENT
===================================================== */

Profile.saveCache = function () {

    try {

        const cache = {

            profile:

                this.profile,

            statistics:

                this.statistics,

            preferences:

                this.preferences,

            timestamp:

                Date.now()

        };

        localStorage.setItem(

            CACHE_KEY,

            JSON.stringify(cache)

        );

        this.cacheTimestamp =

            cache.timestamp;

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

};


Profile.loadCache = function () {

    try {

        const cache =

            localStorage.getItem(

                CACHE_KEY

            );

        if (!cache) {

            return false;

        }

        const data = JSON.parse(

            cache

        );

        this.profile = {

            ...this.profile,

            ...(data.profile || {})

        };

        this.statistics = {

            ...this.statistics,

            ...(data.statistics || {})

        };

        this.preferences = {

            ...this.preferences,

            ...(data.preferences || {})

        };

        this.cacheTimestamp =

            data.timestamp ||

            null;

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

};


Profile.clearCache = function () {

    try {

        localStorage.removeItem(

            CACHE_KEY

        );

        this.cacheTimestamp =

            null;

    }

    catch (error) {

        console.error(error);

    }

};


/* =====================================================
   SYNCHRONIZATION
===================================================== */

Profile.sync = async function () {

    try {

        this.setSyncing(true);

        const response =

            await Api.syncProfile();

        if (!response.success) {

            return response;

        }

        this.profile = {

            ...this.profile,

            ...(response.profile || {})

        };

        this.statistics = {

            ...this.statistics,

            ...(response.statistics || {})

        };

        this.preferences = {

            ...this.preferences,

            ...(response.preferences || {})

        };

        this.saveCache();

        return {

            success: true

        };

    }

    catch (error) {

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
   FORCE REFRESH
===================================================== */

Profile.forceRefresh = async function () {

    this.clearCache();

    return await this.sync();

};


/* =====================================================
   AUTO SYNC
===================================================== */

Profile.startAutoSync = function (

    interval = 60000

) {

    if (

        this.syncTimer

    ) {

        clearInterval(

            this.syncTimer

        );

    }

    this.syncTimer = setInterval(

        async () => {

            if (

                !this.loading &&

                !this.saving

            ) {

                await this.sync();

            }

        },

        interval

    );

};


Profile.stopAutoSync = function () {

    if (

        this.syncTimer

    ) {

        clearInterval(

            this.syncTimer

        );

        this.syncTimer = null;

    }

};


/* =====================================================
   END OF PHASE 5A.4
===================================================== */

/* =====================================================
   PHASE 5A.5
   ERROR HANDLING
   PRODUCTION EXPORT
===================================================== */


/* =====================================================
   INITIALIZATION
===================================================== */

Profile.initialize = async function () {

    if (

        this.initialized

    ) {

        return;

    }

    try {

        this.loadCache();

        await this.sync();

        this.startAutoSync();

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

Profile.status = function () {

    return {

        initialized:

            this.initialized,

        loading:

            this.loading,

        saving:

            this.saving,

        syncing:

            this.syncing,

        username:

            this.profile.username,

        profileCompletion:

            this.getCompletion(),

        lastSync:

            this.cacheTimestamp

    };

};


/* =====================================================
   ERROR HANDLER
===================================================== */

Profile.handleError = function (

    error,

    context = "Profile"

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

            "Unknown profile error.",

        error

    };

};


/* =====================================================
   SHUTDOWN
===================================================== */

Profile.shutdown = function () {

    this.stopAutoSync();

    this.saveCache();

};


/* =====================================================
   STARTUP EVENTS
===================================================== */

window.addEventListener(

    "DOMContentLoaded",

    async () => {

        try {

            await Profile.initialize();

        }

        catch (error) {

            Profile.handleError(

                error,

                "Startup"

            );

        }

    }


window.addEventListener(

    "beforeunload",

    () => {

        Profile.shutdown();

    }



/* =====================================================
   PRODUCTION LOCK
===================================================== */


    PROFILE_STATUS



    GENDER



    AVATAR_TYPES



    Profile



/* =====================================================
   PRODUCTION EXPORT
===================================================== */



/* =====================================================
   END OF FILE
   frontend/js/profile.js
   CROWN PRINCE REWARD HUB
   PRODUCTION BUILD
===================================================== */


export default Profile;
