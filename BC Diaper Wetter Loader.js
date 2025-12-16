// ==UserScript==
// @name         BC Diaper Wetter Loader (Final SDK Fix)
// @namespace    https://www.bondageprojects.com/
// @version      1.0.3
// @description  Loads the mod with permissions to access the Mod SDK.
// @author       Arctic Line / Coding Partner
// @match        https://bondageprojects.elementfx.com/*
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://bondage-europe.com/*
// @match        https://www.bondage-europe.com/*
// @match        http://localhost:*/*
// @run-at       document-end
// @grant        unsafeWindow  
// ==/UserScript==

(function() {
    'use strict';
    
    var script = unsafeWindow.document.createElement("script");
    
    // **USING THE SHORTER, MORE RELIABLE RAW URL**
    script.src = "https://raw.githubusercontent.com/alexsl2174/DiapperMessingBC/main/bcdw_bundle.js"; 
    
    unsafeWindow.document.head.appendChild(script);
})();
