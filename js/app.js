"use strict";
import UI from "./ui.js";

const App = {
    start: function() {
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

document.addEventListener("DOMContentLoaded", () => App.start());
export default App;
