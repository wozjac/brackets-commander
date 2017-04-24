/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global brackets, define */
define(function(require, exports, module) {
    "use strict";

    var NodeDomain = brackets.getModule("utils/NodeDomain"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

    var TerminalManager = require("js/TerminalManager");

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
            terminal.write(data.output);
        }
    }

    function runCommand(command, terminalId, path) {
        var terminal = TerminalManager.getTerminalInstance(terminalId);
        terminal.setLockedInput(true);
        execDomain.exec("runCommand", command, terminalId, path)
            .done(function(data) {
                delete activeProcesses[data.terminalId];
                terminal.writePrompt();
                terminal.setLockedInput(false);
                terminal.setStopIconVisible(false);
                processAfterCommand(terminal, data);
            })
            .fail(function(data) {
                delete activeProcesses[data.terminalId];
                terminal.writePrompt();
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

    function processAfterCommand(terminal, commandData) {
        if (commandData.command.toLowerCase().startsWith("cd ") &&
            commandData.source !== "stderr") {
            handleChangeDirectory(terminal, commandData);
        }

        function handleChangeDirectory(terminal, commandData) {
            var tokens = commandData.command.split(" ");
            terminal.setFileSystemPath(tokens[tokens.length - 1]);
        }
    }

    exports.runCommand = runCommand;
    exports.stopCommand = stopCommand;
});
