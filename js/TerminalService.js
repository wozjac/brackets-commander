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
        this._xterminal.writeln(data);
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
        this._xterminal = new XTerm();
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

        this._xterminal.on("key", function(key, ev) {
            if (that.getLockedInput() === true) {
                return;
            }
            if (that._fileSystemPath === null) {
                that._fileSystemPath = ProjectManager.getProjectRoot().fullPath;
            }
            var printable = (!ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey);
            if (ev.keyCode == 13) {
                that._xterminal.writeln("");
                if (that._commandString.length > 0) {
                    Executor.runCommand(that._commandString.trim(), that.getId(), that.getFileSystemPath());
                    that.setStopIconVisible(true);
                } else {
                    that.writePrompt();
                }
                that._commandString = "";
            } else if (ev.keyCode == 8) {
                // Do not delete the prompt
                if (that._xterminal.x > 2) {
                    that._xterminal.write("\b \b");
                    that._commandString = that._commandString.slice(0, -1);
                }
            } else if (printable) {
                that._commandString += key;
                that._xterminal.write(key);
            }
        });
    };

    TerminalService.prototype._attachStopCommand = function() {
        var that = this;
        var stop = $("#bcomm-tab-" + that.getId() + " .bcomm-stop-icon");
        stop.on("click", function() {
            Executor.stopCommand(that.getId());
            that.setStopIconVisible(false);
            that.setLockedInput(false);
        });
    };

    module.exports = TerminalService;
});
