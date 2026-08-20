"use strict";
import UI from "./ui.js";
import Wallet from "./wallet.js";

const App = {
    start: async function() {
        UI.openAuth();
        Wallet.initialize().catch(() => {});
        setTimeout(() => {
            UI.openSplash();
            setTimeout(() => {
                UI.openDashboard();
                UI.hideLoading();
                UI.initNavigation((screen) => {
                    const name = screen.replace('-screen', '');
                    if (name === 'wallet') UI.renderWallet();
                    if (name === 'dashboard') this.refreshDashboard();
                });
                this.refreshDashboard();
                const debug = document.getElementById('debug-check');
                if(debug) debug.style.display = 'none';
            }, 3000);
        }, 3000);
    },
    refreshDashboard: function() {
        UI.renderDashboard({
            balance: Wallet.getAvailableBalance(),
            earned: Wallet.getEarnedBalance()
        });
    }
};
document.addEventListener("DOMContentLoaded", () => App.start());
export default App;
