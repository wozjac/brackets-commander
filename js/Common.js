/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define */
define(function(require, exports) {
    "use strict";

    function generateId() {
        return Math.ceil(Math.random() * 100000);
    }

    exports.OPEN_TERMINAL_COMMAND_ID = "brackets-commander.openTerminal";
    exports.NODE_DOMAIN_NAME = "BracketsCommander";

    exports.generateId = generateId;
});
