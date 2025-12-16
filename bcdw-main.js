// bcdw-main.js
// The main entry point to initialize the mod and apply hooks.

// --- UNIVERSAL HOOKING LOGIC ---

// 1. Hook CommonDraw
if (typeof window.CommonDraw === 'function' && !window.bcdw_original_CommonDraw) {
    window.bcdw_original_CommonDraw = window.CommonDraw;
    window.CommonDraw = function() {
        window.bcdw_original_CommonDraw.apply(this, arguments);

        // Draw the button only on the main Preference screen
        if (window.CurrentScreen === "Preference" && window.PreferenceMessage === "") {
            window.DrawButton(125, PREF_BUTTON_Y, PREF_BUTTON_W, PREF_BUTTON_H, "Diaper Wetter Settings", "Cyan", "BCDW_OpenDiaperSettings");
        }
    };
}

// 2. Hook CommonClick
if (typeof window.CommonClick === 'function' && !window.bcdw_original_CommonClick) {
    window.bcdw_original_CommonClick = window.CommonClick;
    window.CommonClick = function() {
        
        // If we are on the main Preference page, check for our custom button click
        if (window.CurrentScreen === "Preference" && window.PreferenceMessage === "") {
            if (window.MouseIn(125, PREF_BUTTON_Y, PREF_BUTTON_W, PREF_BUTTON_H)) {
                window.CommonSetScreen("Room", "DiaperWetterSettings");
                return;
            }
        }

        // If we are on our custom screen, pass the click to its handler and prevent other clicks
        if (window.CurrentScreen === "DiaperWetterSettings") {
            window.DiaperWetterSettings.Click();
            return;
        }
        
        window.bcdw_original_CommonClick.apply(this, arguments);
    };
}

// Start initial check loop
window.setTimeout(() => {
    // Only proceed if the Player object is available
    if (typeof window.checkTick === 'function' && !diaperRunning && typeof window.Player !== 'undefined') {
        window.checkTick();
    }
}, 2000);
