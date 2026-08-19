"use strict";
import UI from "./ui.js";
import Wallet from "./wallet.js";

const App = {
    start: async function() {
        UI.openAuth();
        
        // Load data in the background
        Wallet.initialize().catch(e => console.log("Offline mode"));

        setTimeout(() => {
            UI.openSplash();

            setTimeout(() => {
                UI.openDashboard();
                UI.hideLoading();

                // Connect buttons and tell UI what to draw on each screen
                UI.initNavigation((screen) => {
                    const name = screen.replace('-screen', '');
                    if (name === 'wallet') UI.renderWallet();
                    if (name === 'dashboard') UI.renderDashboard();
                });

                UI.renderDashboard();
                
                const debug = document.getElementById('debug-check');
                if(debug) debug.style.display = 'none';
            }, 3000);
        }, 3000);
    }
};

document.addEventListener("DOMContentLoaded", () => App.start());
export default App;
