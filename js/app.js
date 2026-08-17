"use strict";
import UI from "./ui.js";

const App = {
    start: function() {
        console.log("Stage 1: App Start");
        UI.openAuth();

        setTimeout(() => {
            console.log("Stage 2: Splash");
            UI.openSplash();

            setTimeout(() => {
                console.log("Stage 3: Dashboard");
                UI.openDashboard();
                UI.hideLoading();
                UI.initNavigation();
            }, 3000);
        }, 3000);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Ready");
    App.start();
});
