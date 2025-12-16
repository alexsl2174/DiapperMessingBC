// Global State (must be declared without const/let/var if intended to be global for easy cross-file use)
// For simplicity in a single hosted file, we rely on the anonymous function scope.

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


function RoundToDecimal(num, decimalPlaces = 1) {
    const p = window.Math.pow(10, decimalPlaces);
    return window.Math.round(num * p) / p;
}

function checkForDiaper(slot) {
    const item = window.InventoryGet(window.Player, slot)?.Asset?.Name;
    return !!item && item.toLowerCase().includes("diaper");
}

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
        
        // Example for "stained" or "soiled" visual:
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
            MessLevelChastity = window.Math.min(2, MessLevelChastity); // Ensure mess is at least wet if outer is full
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
