
"use strict";
import UI from "./ui.js";
import Wallet from "./wallet.js";

const App = {
    start: async function() {
        UI.openAuth();
        Wallet.initialize().catch(e => console.log("Initializing..."));
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

