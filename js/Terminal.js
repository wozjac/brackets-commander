/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, brackets, define */
define(function(require, exports, module) {
    "use strict";

    var Mustache = brackets.getModule("thirdparty/mustache/mustache"),
        ProjectManager = brackets.getModule("project/ProjectManager");

    var Common = require("js/Common"),
        Executor = require("js/Executor"),
        terminalInstanceHtml = require("text!../view/terminal-instance.html");

    function Terminal() {
        var _id = "terminal-" + Common.generateId(),
            _terminalHtml = Mustache.render(terminalInstanceHtml, {
                "TERMINAL_ID": _id
            }),
            _path = null,
            _$outputElement = null,
            _$commandInputElement = null,
            _$stopButton = null;

        this.getId = function() {
            return _id;
        };

        this.getHtml = function() {
            return _terminalHtml;
        };

        this.getOutputElement = function() {
            if (_$outputElement === null) {
                _$outputElement = $("#" + this.getId() + " div.bcomm-terminal-output");
            }
            return _$outputElement;
        };

        this.getCommandInputElement = function() {
            if (_$commandInputElement === null) {
                _$commandInputElement = $("#" + this.getId() + " input");
            }
            return _$commandInputElement;
        };

        this.getStopButtonElement = function() {
            if (_$stopButton === null) {
                _$stopButton = $("#" + this.getId() + " button");
            }
            return _$stopButton;
        };

        this.getPath = function() {
            return _path;
        };

        this.setPath = function(path) {
            _path = path;
        };

        attachEnterEvent(this);
        attachStopCommandEvent(this);
    }

    Terminal.prototype.appendToOutput = function(content, appendToPreTag) {
        var outputElement = this.getOutputElement(),
            that = this;
        if (outputElement.height() === 0) {
            this._setOutputHeight();
            $("#bcomm-panel").on("panelResizeEnd", function() {
                that._setOutputHeight();
            });
        }
        if (outputElement) {
            if (!appendToPreTag) {
                outputElement.append(content);
            } else {
                outputElement.find("pre").last().append(content);
            }
            outputElement.scrollTop(outputElement.prop("scrollHeight"));
        }
    };

    Terminal.prototype._setOutputHeight = function() {
        var topHeight = $("#bcomm-panel .toolbar").height(),
            tabHeight = $("#bcomm-tabs-wrapper").height(),
            commandInputHeight = $("#" + this.getId() + " .bcomm-terminal-command").height(),
            panelHeight = $("#bcomm-panel").height(),
            result = panelHeight - topHeight - tabHeight - commandInputHeight - 17;
        $("#" + this.getId() + " .bcomm-terminal-output").height(result);
    };

    Terminal.prototype.setCommandInputEnabled = function(enabled) {
        this.getCommandInputElement().attr("disabled", !enabled);
        this.getStopButtonElement().attr("disabled", enabled);
    };

    Terminal.prototype.close = function() {
        Executor.stopCommand(this.getId());
    };

    function attachEnterEvent(terminal) {
        $("#bcomm-panel").on("keyup", "#" + terminal.getId() + " input", function(event) {
            if (event.keyCode == 13) {
                var $inputField = $(this),
                    $stopButton = $("#" + terminal.getId() + " button");
                $stopButton.attr("disabled", false);
                $inputField.attr("disabled", true);
                var commandProvided = $inputField.val().trim();
                terminal.appendToOutput("<pre>" + Common.formatTerminalOutput(commandProvided) + "</pre>");
                $inputField.val("");
                Executor.runCommand(commandProvided, terminal);
            }
        });
    }

    function attachStopCommandEvent(terminal) {
        $("#bcomm-panel").on("click", "#" + terminal.getId() + " .bcomm-command-button", function() {
            Executor.stopCommand(terminal.getId());
        });
    }

    module.exports = Terminal;
});
