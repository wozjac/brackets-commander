/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, brackets, define, document */
define(function(require, exports, module) {
    "use strict";

    var Mustache = brackets.getModule("thirdparty/mustache/mustache"),
        ProjectManager = brackets.getModule("project/ProjectManager");

    var Common = require("js/Common"),
        Executor = require("js/Executor"),
        XTerm = require("../node_modules/xterm/dist/xterm"),
        terminalInstanceHtml = require("text!../view/terminal-instance.html");

    require("../node_modules/xterm/dist/addons/fit/fit");

    function TerminalService() {
        this._id = "terminal-" + Common.generateId();
        this._terminalHtml = Mustache.render(terminalInstanceHtml, {
            "TERMINAL_ID": this._id
        });
        this._fileSystemPath = null;
        this._commandString = "";
        this._xterminal = null;
        this._lockedInput = false;
    }

    TerminalService.prototype.getId = function() {
        return this._id;
    };

    TerminalService.prototype.getHtml = function() {
        return this._terminalHtml;
    };

    TerminalService.prototype.getFileSystemPath = function() {
        return this._fileSystemPath;
    };

    TerminalService.prototype.setFileSystemPath = function(path) {
        this._fileSystemPath = path;
    };

    TerminalService.prototype.fit = function() {
        this._xterminal.fit();
    };

    TerminalService.prototype.write = function(data) {
        this._xterminal.write(data);
    };

    TerminalService.prototype.writePrompt = function() {
        this._xterminal.write("> ");
    };

    TerminalService.prototype.getLockedInput = function() {
        return this._lockedInput;
    };

    TerminalService.prototype.setLockedInput = function(locked) {
        this._lockedInput = locked;
    };

    TerminalService.prototype.open = function() {
        var terminalContainer = document.getElementById(this.getId());
        this._xterminal = new XTerm({
            cursorBlink: true
        });
        this._xterminal.open(terminalContainer);
        this._xterminal.write("> ");
        this._attachKeyPressed();
        this._attachStopCommand();

        this._xterminal.on("paste", function(data) {
            this._xterminal.write(data);
        });
    };

    TerminalService.prototype.close = function() {
        Executor.stopCommand(this.getId());
        this._xterminal.destroy();
    };

    TerminalService.prototype.setStopIconVisible = function(visible) {
        var stop = $("#bcomm-tab-" + this.getId() + " .bcomm-stop-icon");
        stop.css("visibility", visible ? "visible" : "hidden");
    };

    TerminalService.prototype._attachKeyPressed = function() {
        var that = this;

        this._xterminal.on("keydown", function(event) {
            if (event.ctrlKey && event.keyCode === 67) {
                that._stopCommand();
                return;
            }
        });

        this._xterminal.on("key", function(key, event) {
            if (that.getLockedInput() === true) {
                return;
            }

            if (that._fileSystemPath === null) {
                that._fileSystemPath = ProjectManager.getProjectRoot().fullPath;
            }

            var printable = (!event.altKey && !event.altGraphKey && !event.ctrlKey && !event.metaKey);

            switch (event.keyCode) {
                case 13:
                    that._handleEnter();
                    break;
                case 8:
                    that._handleBackspace();
                    break;
                case 38:
                case 40:
                    that._handleArrow(event.keyCode);
                    break;
                default:
                    if (printable) {
                        that._commandString += key;
                        that._xterminal.write(key);
                    }
            }
        });
    };

    TerminalService.prototype._attachStopCommand = function() {
        var that = this;
        var stop = $("#bcomm-tab-" + that.getId() + " .bcomm-stop-icon");
        stop.on("click", function() {
            that._stopCommand();
        });
    };

    TerminalService.prototype._stopCommand = function() {
        Executor.stopCommand(this.getId());
        this.setStopIconVisible(false);
        this.setLockedInput(false);
    };

    TerminalService.prototype._handleEnter = function() {
        this._xterminal.writeln("");
        if (this._commandString.length > 0) {
            Executor.runCommand(this._commandString.trim(), this.getId(), this.getFileSystemPath());
            this.setStopIconVisible(true);
        } else {
            this.writePrompt();
        }
        this._commandString = "";
    };

    TerminalService.prototype._handleBackspace = function() {
        // Do not delete the prompt
        if (this._xterminal.x > 2) {
            this._xterminal.write("\b \b");
            this._commandString = this._commandString.slice(0, -1);
        }
    };

    TerminalService.prototype._handleArrow = function(key) {
        var command;
        switch (key) {
            case 38:
                command = Executor.getCommandFromHistory("UP");
                break;
            case 40:
                command = Executor.getCommandFromHistory("DOWN");
                break;
        }

        if (command) {
            var cursorPosition = this._xterminal.x;
            for (var i = 0; i < cursorPosition - 2; i++) {
                this._xterminal.write("\b \b");
            }
            this._commandString = command;
            this._xterminal.write(command);
        }
    };

    TerminalService.prototype._handleCtrlC = function() {

    };

    module.exports = TerminalService;
});
