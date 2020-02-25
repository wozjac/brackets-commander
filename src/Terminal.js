define((require, exports, module) => {
    "use strict";

    const Mustache = brackets.getModule("thirdparty/mustache/mustache"),
        EventDispatcher = brackets.getModule("utils/EventDispatcher"),
        XTerm = require("../node/node_modules/xterm/lib/xterm"),
        NodeDomain = brackets.getModule("utils/NodeDomain"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        fit = require("../node/node_modules/xterm-addon-fit/lib/xterm-addon-fit"),
        strings = require("strings"),
        execDomain = new NodeDomain("BracketsCommander", ExtensionUtils.getModulePath(module, "../node/execDomain"));

    const terminalInstanceHtml = _readTerminalHtml();

    class Terminal {
        constructor(pid) {
            this._id = pid;

            this._terminalHtml = Mustache.render(terminalInstanceHtml, {
                "TERMINAL_ID": this._id
            });

            this._xterminal = null;
            this._fitAddon = new fit.FitAddon();
        }

        getId() {
            return this._id;
        }

        getHtml() {
            return this._terminalHtml;
        }

        fit() {
            if (this._xterminal) {
                this._fitAddon.fit();
                this._xterminal.refresh(0, this._xterminal.rows - 1);
                this._xterminal.scrollToBottom();

                execDomain.exec("resizePseudoterminal", this._id, this._xterminal.cols, this._xterminal.rows)
                    .fail((error) => {
                        this._handleExecDomainError(error, this._id);
                    });
            }
        }

        write(text) {
            if (this._xterminal) {
                this._xterminal.write(text);
            }
        }

        clear() {
            if (this._xterminal) {
                this._xterminal.clear();
            }
        }

        focus() {
            if (this._xterminal) {
                this._xterminal.focus();
            }
        }

        open() {
            const terminalContainer = document.getElementById(this.getId());

            this._xterminal = new XTerm.Terminal({
                cursorBlink: true,
                fontSize: 12,
                cols: 120
            });

            this._xterminal.loadAddon(this._fitAddon);
            this._xterminal.open(terminalContainer);
            this._xterminal.focus();

            this._xterminal.onData((data) => {
                execDomain.exec("writeToPseudoterminal", this._id, data)
                    .fail((error) => {
                        this._handleExecDomainError(error, this._id);
                    });
            });
        }

        close() {
            execDomain.exec("closePseudoterminal", this._id)
                .fail((error) => {
                    this._handleExecDomainError(error, this._id);
                });

            this._xterminal.dispose();
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

    function _readTerminalHtml() {
        let result = "";
        const path = `${ExtensionUtils.getModulePath(module)}view/terminal-instance.html`;

        jQuery.ajax({
            url: path,
            dataType: "text",
            async: false,
            success: (text) => {
                result = text;
            },
            error: (error) => {
                throw error;
            }
        });

        return result;
    }

    EventDispatcher.makeEventDispatcher(Terminal.prototype);
    module.exports = Terminal;
});
