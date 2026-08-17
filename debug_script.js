window.onerror = function(msg, url, line) {
    const debug = document.getElementById('debug-check');
    if(debug) debug.innerHTML = "ERR: " + msg + " L:" + line;
    debug.style.background = "red";
};
console.log = function(msg) {
    const debug = document.getElementById('debug-check');
    if(debug) debug.innerHTML = "LOG: " + msg;
};
