"use strict";
import UI from "./ui.js";

const App = {
    start: function() {
        console.log("App Safe-Mode Start");
        
        // 1. Show Auth immediately - NO DATA LOADING YET
        UI.openAuth();

        // 2. Simple Sequence
        setTimeout(() => {
            console.log("Showing Splash");
            UI.openSplash();

            setTimeout(() => {
                console.log("Showing Dashboard");
                UI.openDashboard();
                UI.hideLoading();
                UI.initNavigation();
                
                // Remove the blue debug bar once we are successful
                const debug = document.getElementById('debug-check');
                if(debug) debug.style.display = 'none';

            }, 3000);
        }, 3000);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    try {
        App.start();
    } catch (e) {
        document.body.innerHTML += '<div style="color:red; background:white; position:fixed; top:50px; z-index:10001;">JS ERROR: ' + e.message + '</div>';
    }
});

export default App;
