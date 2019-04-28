define((require, exports) => {
    "use strict";

    const PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        common = require("js/common"),
        prefs = PreferencesManager.getExtensionPrefs(common.prefs.PREFS_PREFIX);

    function initPreferences() {
        prefs.definePreference(common.prefs.SHELL_PATH, "string", "");
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
