define((require, exports) => {
    "use strict";

    const PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        common = require("src/common"),
        prefs = PreferencesManager.getExtensionPrefs(common.prefs.PREFS_PREFIX);

    function initPreferences() {
        prefs.definePreference(common.prefs.SHELL_PATH, "string", "");
        prefs.definePreference(common.prefs.BACKGROUND_COLOR, "string", "#000000");
    }

    function get(key) {
        return prefs.get(key);
    }

    function onChange(preference, callback) {
        prefs.on("change", preference, callback);
    }

    exports.initPreferences = initPreferences;
    exports.onChange = onChange;
    exports.get = get;
});
