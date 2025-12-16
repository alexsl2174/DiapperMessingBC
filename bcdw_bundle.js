// --- BCDW-INTEGRATION.JS CONTENT (Official Mod SDK Registration) ---
// (Place this at the bottom of your self-contained script)

function DiaperWetterPrefCall(func) {
    const settingsScreen = window.DiaperWetterSettings; 

    if (settingsScreen && typeof settingsScreen[func] === 'function') {
        settingsScreen[func](); 
        return true;
    }
    return false;
}

// ------------------------------------------------------------------
//  THE FIX: Wait for the Mod SDK function to exist
// ------------------------------------------------------------------

function tryRegisterMod() {
    // Check if the official registration function exists (provided by the Mod SDK)
    if (typeof window.PreferenceRegisterExtensionSetting === 'function') {
        
        // --- SUCCESS: REGISTER NOW ---
        window.PreferenceRegisterExtensionSetting({
            Identifier: 'BCDW',
            ButtonText: 'Diaper Wetter Settings',
            Image: 'Icons/Magic.png',
            
            // Link the SDK calls to our custom UI functions
            load: () => DiaperWetterPrefCall('Load'),
            run: () => DiaperWetterPrefCall('Run'),
            exit: () => DiaperWetterPrefCall('Exit'),
            click: () => DiaperWetterPrefCall('Click'),
        });
        
    } else {
        // --- FAILURE: TRY AGAIN LATER ---
        // If the function isn't ready yet, check again in 100 milliseconds.
        console.warn("BCDW: Waiting for PreferenceRegisterExtensionSetting (Mod SDK) to load...");
        window.setTimeout(tryRegisterMod, 100); 
    }
}

// Start the registration attempt loop
window.setTimeout(() => {
    tryRegisterMod(); 
    
    // Also start your game logic check loop after a delay
    if (typeof checkTick === 'function' && !diaperRunning && typeof window.Player !== 'undefined') {
        checkTick();
    }
}, 2000); 
// Note: You can remove the old setTimeout at the bottom of your original code now.
