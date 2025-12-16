(function() {
    'use strict';

    // --- BCDW-TABLES.JS CONTENT ---
    const BCDWVari =
    {
        DiaperUseLevels: [["#808080", "#97916A", "#8B8D41"], ["#877C6C", "#7E774E"], ["#4C3017"]]
    };

    const BCDWCONST =
    {
        diaperDefaultValues: { messChance: .3, wetChance: .5, baseTimer: 30, regressionLevel: 0, desperationLevel: 0, messLevelInner: 0, wetLevelInner: 0, messLevelOuter: 0, wetLevelOuter: 0 }
    };

    // --- BCDIAPERWETTER.JS CORE STATE ---
    let diaperLoop = null;
    let diaperRunning = false;
    let messChance = BCDWCONST.diaperDefaultValues.messChance;
    let wetChance = BCDWCONST.diaperDefaultValues.wetChance;
    let diaperTimerBase = BCDWCONST.diaperDefaultValues.baseTimer;
    let diaperTimerModifier;
    let diaperTimer = 0;

    let MessLevelPanties = 0;
    let WetLevelPanties = 0;
    let MessLevelChastity = 0;
    let WetLevelChastity = 0;

    // --- CORE LOGIC FUNCTIONS ---

    function RoundToDecimal(num, decimalPlaces = 1) {
        const p = window.Math.pow(10, decimalPlaces);
        return window.Math.round(num * p) / p;
    }

    function checkForDiaper(slot) {
        const item = window.InventoryGet(window.Player, slot)?.Asset?.Name;
        return !!item && item.toLowerCase().includes("diaper");
    }
    
    // Placeholder functions for compatibility, ensuring no undefined errors
    function manageRegression(diaperTimerModifier = 1) { return diaperTimerModifier; }
    function manageDesperation(diaperTimerModifier = 1) { return diaperTimerModifier; }

    function changeDiaperColor(slot) {
        if (window.Player.MemberNumber === null) return;

        const currentItem = window.InventoryGet(window.Player, slot);
        if (!currentItem || !checkForDiaper(slot)) return;

        const messLevel = (slot === "ItemPelvis") ? MessLevelChastity : MessLevelPanties;
        const wetLevel = (slot === "ItemPelvis") ? WetLevelChastity : WetLevelPanties;
        const colorIndex = window.Math.max(0, wetLevel - messLevel);
        const newColor = BCDWVari.DiaperUseLevels[messLevel][colorIndex];
        
        let newProperties = currentItem.Property || {};
        let newAssetName = currentItem.Asset.Name;
        
        // Applying Visual Bulk/Thickness:
        if (messLevel > 0 || wetLevel > 0) {
            newProperties.TypeRecord = newProperties.TypeRecord || {};
            newProperties.TypeRecord.typed = (messLevel === 2 || wetLevel === 2) ? 2 : 1; 
            
            if (messLevel >= 1) {
                 newProperties.Effect = newProperties.Effect?.filter(e => e !== "Soiled") || [];
                 newProperties.Effect.push("Soiled");
            } else {
                 newProperties.Effect = newProperties.Effect?.filter(e => e !== "Soiled") || [];
            }
        } else {
            newProperties.TypeRecord = newProperties.TypeRecord || {};
            newProperties.TypeRecord.typed = 0; 
            newProperties.Effect = newProperties.Effect?.filter(e => e !== "Soiled") || [];
        }

        window.InventoryWear(
            window.Player,
            newAssetName,
            slot,
            [
                currentItem.Color[0], 
                newColor,            
                currentItem.Color[2], 
                currentItem.Color[3]
            ],
            currentItem.Difficulty,
            window.Player.MemberNumber,
            true, // Ensure properties are applied
            newProperties 
        );
    }

    function refreshDiaper({ cdiaper = "both", inWetLevelPanties = BCDWCONST.diaperDefaultValues.wetLevelInner, inMessLevelPanties = BCDWCONST.diaperDefaultValues.messLevelInner, inWetLevelChastity = BCDWCONST.diaperDefaultValues.wetLevelOuter, inMessLevelChastity = BCDWCONST.diaperDefaultValues.messLevelOuter } = {})
    {
        if (cdiaper === "both") { MessLevelPanties = inMessLevelPanties; WetLevelPanties = inWetLevelPanties; MessLevelChastity = inMessLevelChastity; WetLevelChastity = inWetLevelChastity; changeDiaperColor("ItemPelvis"); changeDiaperColor("Panties"); }
        else if (cdiaper === "chastity") { MessLevelChastity = inMessLevelChastity; WetLevelChastity = inWetLevelChastity; changeDiaperColor("ItemPelvis"); }
        else if (cdiaper === "panties") { MessLevelPanties = inMessLevelPanties; WetLevelPanties = inWetLevelPanties; changeDiaperColor("Panties"); }
        
        window.ChatRoomCharacterUpdate(window.Player);
    }

    function diaperWetter({ initMessChance = messChance, initWetChance = wetChance, baseTimer = diaperTimerBase } = {}) {
        refreshDiaper({ cdiaper: "both" });
        messChance = initMessChance; wetChance = initWetChance; diaperTimerBase = baseTimer;
        
        diaperTimerModifier = 1;
        diaperTimer = diaperTimerBase / diaperTimerModifier;
        
        diaperRunning = true; checkTick();
    }

    function stopWetting() { diaperRunning = false; window.clearTimeout(diaperLoop); }

    function diaperTick() {
        diaperTimerModifier = 1;
        diaperTimer = diaperTimerBase / diaperTimerModifier;

        let testMess = window.Math.random();
        if (testMess > 1 - messChance) {
            if (MessLevelPanties === 2 || !checkForDiaper("Panties")) {
                MessLevelChastity = (MessLevelChastity < 2) ? MessLevelChastity + 1 : MessLevelChastity;
                WetLevelChastity = (WetLevelChastity < MessLevelChastity) ? MessLevelChastity : WetLevelChastity;
            } else if (checkForDiaper("Panties")) {
                MessLevelPanties = MessLevelPanties + 1;
                WetLevelPanties = (WetLevelPanties < MessLevelPanties) ? MessLevelPanties : WetLevelPanties;
            }
        } else if (testMess > 1 - wetChance) {
            if (WetLevelPanties == 2 && !checkForDiaper("Panties")) {
                MessLevelChastity = window.Math.min(2, MessLevelChastity);
                WetLevelChastity = window.Math.min(2, WetLevelChastity + 1);
            } else { MessLevelPanties = window.Math.min(2, MessLevelPanties); WetLevelPanties = window.Math.min(2, WetLevelPanties + 1); }
        } else { return; }

        changeDiaperColor("ItemPelvis"); changeDiaperColor("Panties");
        window.ChatRoomCharacterUpdate(window.Player);
    }
    
    function checkTick() {
        if((checkForDiaper("ItemPelvis") || checkForDiaper("Panties")) && diaperRunning === true) {
            diaperLoop = window.setTimeout(checkTick, diaperTimer * 60 * 1000);
            diaperTick();
        } else { diaperRunning = false; }
    }


    // --- BCDW-UI.JS CONTENT (Settings Screen Definition) ---
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

        if (window.MouseIn(550, Y - 30, 200, 50)) { diaperRunning ? stopWetting() : diaperWetter({}); return; } Y += 80;
        if (window.MouseIn(550, Y - 30, 200, 50)) { refreshDiaper({cdiaper: "both"}); return; } Y += 80;
        if (window.MouseIn(600, Y - 30, 50, 50)) { wetChance = RoundToDecimal(window.Math.min(1.0, wetChance + 0.1)); return; }
        if (window.MouseIn(450, Y - 30, 50, 50)) { wetChance = RoundToDecimal(window.Math.max(messChance, wetChance - 0.1)); return; }
        Y += 80;
        if (window.MouseIn(600, Y - 30, 50, 50)) { messChance = RoundToDecimal(window.Math.min(wetChance, messChance + 0.1)); return; }
        if (window.MouseIn(450, Y - 30, 50, 50)) { messChance = RoundToDecimal(window.Math.max(0.0, messChance - 0.1)); return; }
        Y += 80;
        if (window.MouseIn(650, Y - 30, 75, 50)) { diaperTimerBase = window.Math.min(60, diaperTimerBase + 5); return; }
        if (window.MouseIn(400, Y - 30, 75, 50)) { diaperTimerBase = window.Math.max(5, diaperTimerBase - 5); return; }
    }

    // Define the custom screen on the window
    window.DiaperWetterSettings = {
        Load: () => { },
        Run: DiaperWetterSettingsDraw,
        Click: DiaperWetterSettingsClick
    };


    // --- BCDW-MAIN.JS CONTENT (Initialization & Hooks) ---
    
    // 1. Hook CommonDraw
    if (typeof window.CommonDraw === 'function' && !window.bcdw_original_CommonDraw) {
        window.bcdw_original_CommonDraw = window.CommonDraw;
        window.CommonDraw = function() {
            window.bcdw_original_CommonDraw.apply(this, arguments);

            if (window.CurrentScreen === "Preference" && window.PreferenceMessage === "") {
                window.DrawButton(125, PREF_BUTTON_Y, PREF_BUTTON_W, PREF_BUTTON_H, "Diaper Wetter Settings", "Cyan", "BCDW_OpenDiaperSettings");
            }
        };
    }

    // 2. Hook CommonClick
    if (typeof window.CommonClick === 'function' && !window.bcdw_original_CommonClick) {
        window.bcdw_original_CommonClick = window.CommonClick;
        window.CommonClick = function() {
            
            if (window.CurrentScreen === "Preference" && window.PreferenceMessage === "") {
                if (window.MouseIn(125, PREF_BUTTON_Y, PREF_BUTTON_W, PREF_BUTTON_H)) {
                    window.CommonSetScreen("Room", "DiaperWetterSettings");
                    return;
                }
            }

            if (window.CurrentScreen === "DiaperWetterSettings") {
                window.DiaperWetterSettings.Click();
                return;
            }
            
            window.bcdw_original_CommonClick.apply(this, arguments);
        };
    }
    
    // Start initial check loop
    window.setTimeout(() => {
        if (typeof checkTick === 'function' && !diaperRunning && typeof window.Player !== 'undefined') {
            checkTick();
        }
    }, 2000); 

})();
