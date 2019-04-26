/*global brackets, define */
define((require, exports, module) => {
    "use strict";

    const NodeDomain = brackets.getModule("utils/NodeDomain"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        Common = require("js/Common"),
        TerminalManager = require("js/TerminalManager");

    const execDomain = new NodeDomain("BracketsCommander", ExtensionUtils.getModulePath(module, "../node/ExecDomain"));
    execDomain.on("outputData", handleDomainOutputData);

    const activeProcesses = {},
        commandHistory = [];

    let commandHistoryState = 0;

    function handleDomainOutputData(event, pid, data) {
        if (data.terminalId in activeProcesses === false) {
            activeProcesses[data.terminalId] = {
                processId: data.processId
            };
        }

        if (data.output && data.output.length > 0) {
            const terminal = TerminalManager.getTerminalInstance(data.terminalId);
            terminal.write(data.output.replace(/\n/g, "\r\n"));
        }
    }

    function runCommand(command, terminalId, path) {
        const terminal = TerminalManager.getTerminalInstance(terminalId);
        commandHistory.push(command);
        commandHistoryState = 0;
        terminal.setLockedInput(true);

        execDomain.exec("runCommand", command, terminalId, path)
            .done((data) => {
                delete activeProcesses[data.terminalId];
                terminal.writePrompt();
                terminal.setLockedInput(false);
                terminal.setStopIconVisible(false);
                processAfterCommand(terminal, data);
            })
            .fail((data) => {
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
            .done(() => {
                delete activeProcesses[processId];
            })
            .fail(() => {
                console.warn(`[BracketsCommander] Could not kill the process with ID ${processId}`);
            });
    }

    function processAfterCommand(terminal, commandData) {
        if (commandData.command.toLowerCase().startsWith("cd ") &&
            commandData.source !== "stderr") {
            handleChangeDirectory(terminal, commandData);
        }

        function handleChangeDirectory(terminal, commandData) {
            const tokens = commandData.command.split(" ");
            terminal.setFileSystemPath(tokens[tokens.length - 1]);
        }
    }

    function getCommandFromHistory(direction) {
        if (commandHistory.length > 0) {
            if (direction === "UP") {
                commandHistoryState += 1;
            } else {
                commandHistoryState += -1;
            }

            if (commandHistoryState > commandHistory.length) {
                commandHistoryState += -1;
            }

            if (commandHistoryState <= 0) {
                commandHistoryState += 1;
            }

            return commandHistory[commandHistory.length - commandHistoryState];
        } else {
            return "";
        }
    }

    function spawnPty() {
        return execDomain.exec("createPty", {
            cwd: Common.getWorkingDirectory()
        });
    }

    exports.getCommandFromHistory = getCommandFromHistory;
    exports.runCommand = runCommand;
    exports.spawnPty = spawnPty;
    exports.stopCommand = stopCommand;
});
