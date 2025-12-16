// bcdw-ui.js
// Defines the custom settings screen drawing and click handlers.

let Y_START = 150; 
let PREF_BUTTON_Y = 700;
let PREF_BUTTON_W = 300;
let PREF_BUTTON_H = 65;

function DiaperWetterSettingsDraw() {
    window.DrawText("BC Diaper Wetter Settings", 500, 50, "Black", "Gray");

    let Y = Y_START;

    // Status
    window.DrawText(`Status: ${diaperRunning ? 'RUNNING' : 'STOPPED'}`, 150, Y, "black", "white");
    window.DrawButton(550, Y - 30, 200, 50, diaperRunning ? "STOP" : "START", diaperRunning ? "Red" : "Green", "BCDW_ToggleRun");
    Y += 80;

    // Change Diaper
    window.DrawText("Manually Reset Diaper:", 150, Y, "black", "white");
    window.DrawButton(550, Y - 30, 200, 50, "Change Diaper", "LightBlue", "BCDW_Change");
    Y += 80;
    
    // --- Wet Chance ---
    window.DrawText(`Wet Chance: ${RoundToDecimal(wetChance).toFixed(1)}`, 150, Y, "black", "white");
    window.DrawButton(450, Y - 30, 50, 50, "-", "Silver", "BCDW_WetDown");
    window.DrawButton(600, Y - 30, 50, 50, "+", "Silver", "BCDW_WetUp");
    Y += 80;

    // --- Mess Chance ---
    window.DrawText(`Mess Chance: ${RoundToDecimal(messChance).toFixed(1)} (0.0 = Wet Only)`, 150, Y, "black", "white");
    window.DrawButton(450, Y - 30, 50, 50, "-", "Silver", "BCDW_MessDown");
    window.DrawButton(600, Y - 30, 50, 50, "+", "Silver", "BCDW_MessUp");
    Y += 80;

    // --- Base Timer ---
    window.DrawText(`Base Timer: ${diaperTimerBase} min`, 150, Y, "black", "white");
    window.DrawButton(400, Y - 30, 75, 50, "-5 min", "Silver", "BCDW_TimerDown");
    window.DrawButton(650, Y - 30, 75, 50, "+5 min", "Silver", "BCDW_TimerUp");
    Y += 80;

    window.DrawButton(900, 25, 60, 60, "", "White", "BCDW_Exit");
}

function DiaperWetterSettingsClick() {
    if (window.MouseIn(900, 25, 60, 60)) { window.CommonSetScreen("Room", "Preference"); return; }

    let Y = Y_START;

    // Status Toggle
    if (window.MouseIn(550, Y - 30, 200, 50)) { diaperRunning ? stopWetting() : diaperWetter({}); return; } Y += 80;
    // Change Diaper
    if (window.MouseIn(550, Y - 30, 200, 50)) { refreshDiaper({cdiaper: "both"}); return; } Y += 80;
    // Wet Chance
    if (window.MouseIn(600, Y - 30, 50, 50)) { wetChance = RoundToDecimal(window.Math.min(1.0, wetChance + 0.1)); return; }
    if (window.MouseIn(450, Y - 30, 50, 50)) { wetChance = RoundToDecimal(window.Math.max(messChance, wetChance - 0.1)); return; }
    Y += 80;
    // Mess Chance
    if (window.MouseIn(600, Y - 30, 50, 50)) { messChance = RoundToDecimal(window.Math.min(wetChance, messChance + 0.1)); return; }
    if (window.MouseIn(450, Y - 30, 50, 50)) { messChance = RoundToDecimal(window.Math.max(0.0, messChance - 0.1)); return; }
    Y += 80;
    // Base Timer
    if (window.MouseIn(650, Y - 30, 75, 50)) { diaperTimerBase = window.Math.min(60, diaperTimerBase + 5); return; }
    if (window.MouseIn(400, Y - 30, 75, 50)) { diaperTimerBase = window.Math.max(5, diaperTimerBase - 5); return; }
}

// Define the custom screen on the window
window.DiaperWetterSettings = {
    Load: () => { },
    Run: DiaperWetterSettingsDraw,
    Click: DiaperWetterSettingsClick
};
