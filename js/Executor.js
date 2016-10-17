/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, brackets, define */
define(function(require, exports, module) {
    "use strict";

    var NodeDomain = brackets.getModule("utils/NodeDomain"),
        ProjectManager = brackets.getModule("project/ProjectManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

    var TerminalManager = require("js/TerminalManager"),
        Common = require("js/Common");

    var execDomain = new NodeDomain("BracketsCommander", ExtensionUtils.getModulePath(module, "../node/ExecDomain"));
    execDomain.on("outputData", handleDomainOutputData);

    var activeProcesses = {};

    function handleDomainOutputData(event, data) {
        if (data.terminalId in activeProcesses === false) {
            activeProcesses[data.terminalId] = {
                processId: data.processId
            };
        }

        if (data.output && data.output.length > 0) {
            var terminal = TerminalManager.getTerminalInstance(data.terminalId);
            terminal.appendToOutput("\n" + Common.formatTerminalOutput(data.output), true);
        }
    }

    function runCommand(command, terminal) {
        var projectPath = ProjectManager.getProjectRoot().fullPath;

        execDomain.exec("runCommand", command, terminal.getId(), projectPath)
            .done(function(data) {
                delete activeProcesses[data.terminalId];
                terminal.setCommandInputEnabled(true);
            })
            .fail(function(data) {
                delete activeProcesses[data.terminalId];
                terminal.setCommandInputEnabled(true);
            });
    }

    function stopCommand(terminalId) {
        if (terminalId in activeProcesses === true) {
            killProcess(activeProcesses[terminalId].processId);
        }
    }

    function killProcess(processId) {
        execDomain.exec("killProcess", processId)
            .done(function() {
                delete activeProcesses[processId];
            })
            .fail(function() {
                console.warn("[BracketsCommander] Could not kill the process with ID " + processId);
            });
    }

    exports.runCommand = runCommand;
    exports.stopCommand = stopCommand;
});
