"use strict";

const process = require("process"),
    NODE_DOMAIN = "BracketsCommander",
    OUTPUT_DATA_EVENT = "outputData",
    PTY_NOT_EXIST = 1;

let domainManager, PTY;

switch (process.platform) {
    case "win32":
        PTY = require("node-pty-win");
        break;
    case "darwin":
        PTY = require("node-pty-osx");
        break;
    default:
        PTY = require("node-pty-linux");
}

const pseudoTerminals = {},
    defaultShellPath = getDefaultShellPath(),
    shellArguments = getShellArguments();

function init(domainMgr) {
    domainManager = domainMgr;

    if (!domainMgr.hasDomain(NODE_DOMAIN)) {
        domainMgr.registerDomain(NODE_DOMAIN, {
            major: 0,
            minor: 1
        });
    }

    domainMgr.registerCommand(
        NODE_DOMAIN,
        "createPseudoterminal",
        createPseudoterminal,
        true,
        "Create a new PTY",
        [{
            name: "options",
            type: "object",
            description: "Options object"
        }],
        [{
            name: "pid",
            type: "number",
            description: "The id of the spawned PTY"
        }]
    );

    domainMgr.registerCommand(
        NODE_DOMAIN,
        "writeToPseudoterminal",
        writeToPseudoterminal,
        true,
        "Writes to a given pseudoterminal",
        [{
            name: "pid",
            type: "number",
            description: "The id of the pseudoterminal"
        }, {
            name: "text",
            type: "string",
            description: "Text to send to PTY"
        }],
        []
    );

    domainMgr.registerCommand(
        NODE_DOMAIN,
        "closePseudoterminal",
        closePseudoterminal,
        true,
        "Closes the pseudoterminal identified by PID",
        [{
            name: "pid",
            type: "number",
            description: "The id of the pseudoterminal"
        }],
        []
    );

    domainMgr.registerCommand(
        NODE_DOMAIN,
        "resizePseudoterminal",
        resizePseudoterminal,
        true,
        "Resizes the pseudoterminal identified by PID",
        [{
            name: "pid",
            type: "number",
            description: "The id of the pseudoterminal"
        }, {
            name: "columns",
            type: "number",
            description: "The number of columns"
        }, {
            name: "rows",
            type: "number",
            description: "The number of rows"
        }],
        []
    );

    domainMgr.registerEvent(
        NODE_DOMAIN,
        OUTPUT_DATA_EVENT, [{
            name: "pid",
            type: "number",
            description: "The id of the spawned PTY"
        }, {
            name: "text",
            type: "string",
            description: "Command ouptut string"
        }]);
}

function createPseudoterminal(options, callback) {
    const shellArgs = shellArguments.split(/\s+/g).filter((arg) => {
        arg;
    });

    if (!options.shellPath) {
        options.shellPath = defaultShellPath;
    }

    const pty = PTY.spawn(options.shellPath, shellArgs, {
        name: "xterm-color",
        env: process.env,
        cwd: options.cwd
    });

    pseudoTerminals[pty.pid] = pty;

    pty.on("data", (data) => {
        domainManager.emitEvent(NODE_DOMAIN, OUTPUT_DATA_EVENT, [pty.pid, data]);
    });

    callback(null, pty.pid);
}

function writeToPseudoterminal(pid, text) {
    try {
        const pty = pseudoTerminals[pid];
        pty.write(text);
    } catch (error) {
        throw new Error(PTY_NOT_EXIST);
    }
}

function closePseudoterminal(pid) {
    try {
        const pty = pseudoTerminals[pid];
        delete pseudoTerminals[pid];
        pty.destroy();
    } catch (error) {
        throw new Error(PTY_NOT_EXIST);
    }
}

function resizePseudoterminal(pid, columns, rows) {
    try {
        const pty = pseudoTerminals[pid];
        pty.resize(columns, rows);
    } catch (error) {
        throw new Error(PTY_NOT_EXIST);
    }
}

function getDefaultShellPath() {
    if (process.platform === "win32") {
        return process.env.COMSPEC || "cmd.exe";
    } else {
        return process.env.SHELL || "/bin/bash";
    }
}

function getShellArguments() {
    if (process.platform !== "win32" && process.env.SHELL === "/bin/bash") {
        return "--login";
    } else {
        return "";
    }
}

exports.init = init;
