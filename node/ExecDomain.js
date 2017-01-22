/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, node: true */
/*global*/

(function() {
    "use strict";

    var NODE_DOMAIN = "BracketsCommander",
        OUTPUT_DATA_EVENT = "outputData";

    var exec = require("child_process").exec,
        treekill = require("treekill");

    var _domainManager;

    function init(domainManager) {
        _domainManager = domainManager;

        if (!domainManager.hasDomain(NODE_DOMAIN)) {
            domainManager.registerDomain(NODE_DOMAIN, {
                major: 0,
                minor: 0
            });
        }

        domainManager.registerCommand(
            NODE_DOMAIN,
            "runCommand",
            runCommand,
            true
        );

        domainManager.registerCommand(
            NODE_DOMAIN,
            "killProcess",
            killProcess,
            false
        );

        domainManager.registerEvent(
            NODE_DOMAIN,
            OUTPUT_DATA_EVENT, [{
                name: "output",
                type: "object",
                description: "Output from command"
            }]);
    }

    function runCommand(command, terminalId, path, cb) {
        var options = {
            encoding: 'utf8'
        };

        if (path) {
            options.cwd = path;
        }

        var child = exec(command, options);

        var outputData = {
            command: command,
            processId: child.pid,
            terminalId: terminalId
        };

        //in case no output, sending PID to Executor
        _domainManager.emitEvent(NODE_DOMAIN, OUTPUT_DATA_EVENT, outputData);

        child.stdout.on("data", function(data) {
            outputData.output = data;
            outputData.source = "stdout";
            _domainManager.emitEvent(NODE_DOMAIN, OUTPUT_DATA_EVENT, outputData);
        });

        child.stderr.on("data", function(data) {
            outputData.output = data;
            outputData.source = "stderr";
            _domainManager.emitEvent(NODE_DOMAIN, OUTPUT_DATA_EVENT, outputData);
        });

        child.on("exit", function() {
            cb(null, outputData);
        });

        child.on("error", function(error) {
            outputData.error = error;
            cb(outputData);
        });
    }

    function killProcess(processId) {
        treekill(processId);
    }

    exports.init = init;
}());
