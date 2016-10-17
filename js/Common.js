/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define */
define(function(require, exports) {
    "use strict";

    function generateId() {
        return Math.ceil(Math.random() * 100000);
    }

    function escapeHtml(string) {
        var tagsToReplace = {
            "&": '&amp;',
            "<": '&lt;',
            "\"": "&quot;",
            ">": '&gt;'
        };
        return string.replace(/[&<>"]/g, function(tag) {
            return tagsToReplace[tag] || tag;
        });
    }

    function formatTerminalOutput(output) {
        /* Remove color codes */
        var formattedOutput = output.replace(/\[\d+m/g, "");
        formattedOutput = escapeHtml(formattedOutput);
        return formattedOutput;
    }

    exports.OPEN_TERMINAL_COMMAND_ID = "brackets-commander.openTerminal";
    exports.NODE_DOMAIN_NAME = "BracketsCommander";

    exports.generateId = generateId;
    exports.escapeHtml = escapeHtml;
    exports.formatTerminalOutput = formatTerminalOutput;
});
