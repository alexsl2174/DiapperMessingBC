(function() {
    'use strict';

    // ====================================================================
    // 1. Core State and Constants
    // ====================================================================

    const BCDWVari =
    {
        DiaperUseLevels: [["#808080", "#97916A", "#8B8D41"], ["#877C6C", "#7E774E"], ["#4C3017"]]
    };

    const BCDWCONST =
    {
        diaperDefaultValues: { messChance: .3, wetChance: .5, baseTimer: 30, regressionLevel: 0, desperationLevel: 0, messLevelInner: 0, wetLevelInner: 0, messLevelOuter: 0, wetLevelOuter: 0 }
    };

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

    // ====================================================================
    // 2. Core Logic Functions
    // ====================================================================

    function RoundToDecimal(num, decimalPlaces = 1) {
        const p = window.Math.pow(10, decimalPlaces);
        return window.Math.round(num * p) / p;
    }

    function checkForDiaper(slot) {
        const item = window.InventoryGet(window.Player, slot)?.Asset?.Name;
        return !!item && item.toLowerCase().includes("diaper");
    }
    
    function changeDiaperColor(slot) {
        if (!window.Player || window.Player.MemberNumber === null) return;
        const currentItem = window.InventoryGet(window.Player, slot);
        if (!currentItem || !checkForDiaper(slot)) return;

        const messLevel = (slot === "ItemPelvis") ? MessLevelChastity : MessLevelPanties;
        const wetLevel = (slot === "ItemPelvis") ? WetLevelChastity : WetLevelPanties;
        const colorIndex = window.Math.max(0, wetLevel - messLevel);
        const newColor = BCDWVari.DiaperUseLevels[messLevel][colorIndex];
        
        let newProperties = currentItem.Property || {};
        let newAssetName = currentItem.Asset.Name;
        
        // Applying Visual Bulk/Thickness and Soiling (The "Prettier" Fix)
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

        window.InventoryWear(window.Player, newAssetName, slot, [currentItem.Color[0], newColor, currentItem.Color[2], currentItem.Color[3]], currentItem.Difficulty, window.Player.MemberNumber, true, newProperties );
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
        
        let diaperTimerModifier = 1;
        diaperTimer = diaperTimerBase / diaperTimerModifier;
        
        diaperRunning = true; checkTick();
    }

    function stopWetting() { diaperRunning = false; window.clearTimeout(diaperLoop); }

    function diaperTick() {
        let diaperTimerModifier = 1;
        diaperTimer = diaperTimerBase / diaperTimerModifier;

        let testMess = window.Math.random();
        if (testMess > 1 - messChance) {
            if (MessLevelPanties === 2 || !checkForDiaper("Panties")) { MessLevelChastity = window.Math.min(2, MessLevelChastity + 1); WetLevelChastity = window.Math.max(WetLevelChastity, MessLevelChastity); } 
            else if (checkForDiaper("Panties")) { MessLevelPanties = window.Math.min(2, MessLevelPanties + 1); WetLevelPanties = window.Math.max(WetLevelPanties, MessLevelPanties); }
        } else if (testMess > 1 - wetChance) {
            if (WetLevelPanties == 2 && !checkForDiaper("Panties")) { WetLevelChastity = window.Math.min(2, WetLevelChastity + 1); } 
            else { WetLevelPanties = window.Math.min(2, WetLevelPanties + 1); }
        } else { return; }

        changeDiaperColor("ItemPelvis"); changeDiaperColor("Panties");
        window.ChatRoomCharacterUpdate(window.Player);
    }
    
    function checkTick() {
        if(window.Player && (checkForDiaper("ItemPelvis") || checkForDiaper("Panties")) && diaperRunning === true) {
            diaperLoop = window.setTimeout(checkTick, diaperTimer * 60 * 1000);
            diaperTick();
        } else { diaperRunning = false; }
    }


    // ====================================================================
    // 3. UI/Settings Screen Definition (Exposed Globally)
    // ====================================================================
    
    let Y_START = 150; 
    let PREF_BUTTON_Y = 700;
    let PREF_BUTTON_W = 300;
    let PREF_BUTTON_H = 65;

    // --- Draw Function (BCDW_Run) ---
    // This function must be exposed globally under a unique name for the SDK to call it via PreferenceRegisterExtensionSetting.
    window.PreferenceSubscreenBCDWRun = function() {
        window.DrawText("BC Diaper Wetter Settings", 500, 50, "Black", "Gray");
        let Y = Y_START;

        window.DrawText(`Status: ${diaperRunning ? 'RUNNING' : 'STOPPED'}`, 150, Y, "black", "white");
        window.DrawButton(550, Y - 30, 200, 50, diaperRunning ? "STOP" : "START", diaperRunning ? "Red" : "Green", "BCDW_ToggleRun");
        Y += 80;

        window.DrawText("Manually Reset Diaper:", 150, Y, "black", "white");
        window.DrawButton(550, Y - 30, 200, 50, "Change Diaper", "LightBlue", "BCDW_Change");
        Y += 80;
        
        window.DrawText(`Wet Chance: ${RoundToDecimal(wetChance).toFixed(1)}`, 150, Y, "black", "white");
        window.DrawButton(450, Y - 30, 50, 50, "-", "Silver", "BCDW_WetDown");
        window.DrawButton(600, Y - 30, 50, 50, "+", "Silver", "BCDW_WetUp");
        Y += 80;

        window.DrawText(`Mess Chance: ${RoundToDecimal(messChance).toFixed(1)} (0.0 = Wet Only)`, 150, Y, "black", "white");
        window.DrawButton(450, Y - 30, 50, 50, "-", "Silver", "BCDW_MessDown");
        window.DrawButton(600, Y - 30, 50, 50, "+", "Silver", "BCDW_MessUp");
        Y += 80;

        window.DrawText(`Base Timer: ${diaperTimerBase} min`, 150, Y, "black", "white");
        window.DrawButton(400, Y - 30, 75, 50, "-5 min", "Silver", "BCDW_TimerDown");
        window.DrawButton(650, Y - 30, 75, 50, "+5 min", "Silver", "BCDW_TimerUp");
        Y += 80;

        window.DrawButton(900, 25, 60, 60, "", "White", "BCDW_Exit");
    }

    // --- Click Function (BCDW_Click) ---
    // This function must be exposed globally under a unique name for the SDK to call it.
    window.PreferenceSubscreenBCDWClick = function() {
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
    
    // --- Load Function (BCDW_Load) ---
    window.PreferenceSubscreenBCDWLoad = function() { /* No complex load logic needed */ };

    // --- Exit Function (BCDW_Exit) ---
    window.PreferenceSubscreenBCDWExit = function() { window.CommonSetScreen("Room", "Preference"); };


    // ====================================================================
    // 4. Mod SDK Integration (The Final, Stable Fix)
    // ====================================================================

    function registerModWithSDK() {
        // CRITICAL CHECK: Wait for the SDK to be fully defined.
        if (typeof window.bcModSDK === 'undefined' || typeof window.PreferenceRegisterExtensionSetting === 'undefined') {
            // Poll again briefly. (The definitive fix for the Load Order problem)
            window.setTimeout(registerModWithSDK, 50);
            return;
        }

        try {
            // 1. Register the mod with the SDK (Required)
            const modApi = window.bcModSDK.registerMod({
                name: 'BCDiaperWetter',
                fullName: 'BC Diaper Wetter',
                version: '1.0.0', 
            });

            // 2. Register the Settings Button, linking to the global functions we defined above.
            window.PreferenceRegisterExtensionSetting({
                Identifier: 'BCDW',
                ButtonText: 'Diaper Wetter Settings',
                Image: 'Icons/Magic.png',
                
                // We link directly to the exposed global functions (WCE/BCAR pattern)
                load: window.PreferenceSubscreenBCDWLoad,
                run: window.PreferenceSubscreenBCDWRun,
                exit: window.PreferenceSubscreenBCDWExit,
                click: window.PreferenceSubscreenBCDWClick,
            });
            
            console.log("BC Diaper Wetter Mod successfully registered in Extensions.");

        } catch (error) {
            console.error("BCDW: Error during mod registration:", error);
        }
        
        // 3. Start game logic after registration is done
        window.setTimeout(() => {
            if (typeof checkTick === 'function' && !diaperRunning && typeof window.Player !== 'undefined') {
                checkTick(); 
            }
        }, 2000); 
    }

    // Start the deferred registration process
    window.setTimeout(registerModWithSDK, 50); 

})();
