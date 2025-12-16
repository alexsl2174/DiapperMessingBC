// ==UserScript==
// @name         BC Interractive Diaper
// @namespace    https://www.bondageprojects.com/
// @version      0.1.1
// @description  A simple script that will automatically make a baby use their diaper
// @author       Kyriann
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @match http://localhost:*/*
// @icon data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant none
// @run-at document-end
// ==/UserScript==

(function() {
    'use strict';

    let n = document.createElement("script");
    n.setAttribute("language", "JavaScript");
    n.setAttribute("crossorigin", "anonymous");

    n.setAttribute("src", "https://alexsl2174.github.io/DiapperMessingBC/BCInterractiveDiaper.js" + Date.now());
    document.head.appendChild(n);
})();
