/*global define */
define((require, exports) => {
    "use strict";

    function generateId() {
        return Math.ceil(Math.random() * 100000);
    }

    exports.OPEN_TERMINAL_COMMAND_ID = "brackets-commander.openTerminal";
    exports.NODE_DOMAIN_NAME = "BracketsCommander";

    exports.generateId = generateId;
});
