/* global define */
define((require, exports) => {
    "use strict";

    const ProjectManager = brackets.getModule("project/ProjectManager");

    function generateId() {
        return Math.ceil(Math.random() * 100000);
    }

    function getWorkingDirectory() {
        return ProjectManager.getProjectRoot().fullPath;
    }

    exports.OPEN_TERMINAL_COMMAND_ID = "brackets-commander.openTerminal";
    exports.NODE_DOMAIN_NAME = "BracketsCommander";

    exports.generateId = generateId;
    exports.getWorkingDirectory = getWorkingDirectory;

    exports.NODE_DOMAIN = "BracketsCommander";
    exports.OUTPUT_DATA_EVENT = "outputData";
});
