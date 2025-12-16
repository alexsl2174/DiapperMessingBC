// ==UserScript==
// @name         BC Diaper Wetter Loader
// @namespace    https://www.bondageprojects.com/
// @version      0.3.5
// @description  Loads the official BC Diaper Wetter Mod bundle from GitHub.
// @author       Arctic Line / Coding Partner
// @match        https://bondageprojects.elementfx.com/*
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://bondage-europe.com/*
// @match        https://www.bondage-europe.com/*
// @match        http://localhost:*/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var script = document.createElement("script");
    
    // ⚠️ IMPORTANT: REPLACE THIS URL with the raw link to the full mod code hosted on GitHub.
    script.src = "https://raw.githubusercontent.com/alexsl2174/DiapperMessingBC/refs/heads/main/bcdw_bundle.js";
    
    document.head.appendChild(script);
})();
