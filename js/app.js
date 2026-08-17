"use strict";
import UI from "./ui.js";

// We define a fake App object that does not use Wallet or Tasks yet
const App = {
    start: function() {
        console.log("Zero-Dependency Start");
        UI.openAuth();

        setTimeout(() => {
            UI.openSplash();
            setTimeout(() => {
                UI.openDashboard();
                UI.hideLoading();
                UI.initNavigation();
            }, 3000);
        }, 3000);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    App.start();
});
