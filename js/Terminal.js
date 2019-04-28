define((require, exports, module) => {
    "use strict";

    const Mustache = brackets.getModule("thirdparty/mustache/mustache"),
        EventDispatcher = brackets.getModule("utils/EventDispatcher"),
        XTerm = require("../node/node_modules/xterm/dist/xterm"),
        NodeDomain = brackets.getModule("utils/NodeDomain"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        terminalInstanceHtml = require("text!../view/terminal-instance.html"),
        fit = require("../node/node_modules/xterm/dist/addons/fit/fit"),
        strings = require("strings"),
        execDomain = new NodeDomain("BracketsCommander", ExtensionUtils.getModulePath(module, "../node/execDomain"));

    XTerm.applyAddon(fit);

    class Terminal {
        constructor(pid) {
            this._id = pid;
            this._commandString = "";

            this._terminalHtml = Mustache.render(terminalInstanceHtml, {
                "TERMINAL_ID": this._id
            });

            this._xterminal = null;
        }

        getId() {
            return this._id;
        }

        getHtml() {
            return this._terminalHtml;
        }

        fit() {
            if (this._xterminal) {
                this._xterminal.fit();
                this._xterminal.refresh(0, this._xterminal.rows - 1);

                execDomain.exec("resizePseudoterminal", this._id, this._xterminal.cols, this._xterminal.rows)
                    .fail((error) => {
                        this._handleExecDomainError(error, this._id);
                    });
            }
        }

        write(text) {
            this._xterminal.write(text);
        }

        clear() {
            this._xterminal.clear();
        }

        open() {
            const terminalContainer = document.getElementById(this.getId());

            this._xterminal = new XTerm({
                cursorBlink: true,
                fontSize: 12
            });

            this._xterminal.open(terminalContainer);
            this._xterminal.focus();

            this._xterminal.on("data", (data) => {
                this._commandString += data;

                execDomain.exec("writeToPseudoterminal", this._id, data)
                    .fail((error) => {
                        this._handleExecDomainError(error, this._id);
                    });
            });

            this._xterminal.on("keydown", (event) => {
                if (event.keyCode === 13) {
                    this.trigger("commandEntered", this._id, this._commandString);
                    this._commandString = "";
                }
            });
        }

        close() {
            execDomain.exec("closePseudoterminal", this._id)
                .fail((error) => {
                    this._handleExecDomainError(error, this._id);
                });

            this._xterminal.destroy();
        }

        _handleExecDomainError(error, terminalId) {
            let message;

            switch (error) {
                case "1":
                    message = strings.PTY_NOT_EXIST.replace("$1", terminalId);
                    break;
                default:
            }

            console.error(message);
            console.trace();
        }
    }

    EventDispatcher.makeEventDispatcher(Terminal.prototype);
    module.exports = Terminal;
});
