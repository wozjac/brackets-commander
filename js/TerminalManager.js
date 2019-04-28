define((require, exports, module) => {
    "use strict";

    const CommandManager = brackets.getModule("command/CommandManager"),
        WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        NodeDomain = brackets.getModule("utils/NodeDomain"),
        Mustache = brackets.getModule("thirdparty/mustache/mustache"),
        Terminal = require("js/Terminal"),
        common = require("js/common"),
        prefs = require("js/preferences"),
        strings = require("strings"),
        terminalTabHtml = require("text!../view/terminal-tab.html"),
        execDomain = new NodeDomain("BracketsCommander", ExtensionUtils.getModulePath(module, "../node/execDomain"));

    execDomain.on("outputData", _handleOutputDataFromPseudoterminal);

    const terminalInstances = {};

    let terminalCounter = 0,
        terminalPanel = null,
        terminalPanelVisible = false,
        activeTerminalId = null;

    initTerminalPanel();

    function initTerminalPanel() {
        const panelHtml = require("text!../view/terminal-panel.html");
        terminalPanel = WorkspaceManager.createBottomPanel("brackets-commander.terminal-panel", $(panelHtml), 130);

        $("#bcomm-panel .close").click(() => {
            hideTerminalPanel();
        });

        $("#bcomm-clear").click(() => {
            if (activeTerminalId) {
                try {
                    const terminal = terminalInstances[activeTerminalId];
                    terminal.clear();
                } catch (error) {
                    console.error(strings.PTY_NOT_EXIST.replace("$1", activeTerminalId));
                }
            }
        });

        $("#bcomm-panel").on("panelResizeEnd", () => {
            fitTerminals();
        });

        _attachAppendTerminal();
    }

    function showTerminalPanel() {
        terminalPanel.show();
        terminalPanelVisible = true;

        if (terminalCounter === 0) {
            _createTerminal(true);
        }

        fitTerminals();
    }

    function hideTerminalPanel() {
        terminalPanel.hide();
        terminalPanelVisible = false;
        CommandManager.get(common.OPEN_TERMINAL_COMMAND_ID).setChecked(false);
    }

    function getTerminalInstance(terminalId) {
        return terminalInstances[terminalId];
    }

    function _createTerminal(active) {
        _createPseudoTerminal()
            .done((pid) => {
                const terminal = new Terminal(pid);
                terminalCounter++;
                terminalInstances[terminal.getId()] = terminal;
                _insertTerminalToPanel(terminal, active);
                _attachCloseTerminal(terminal);
                _attachSelectTerminal(terminal);

                terminal.open();

                if (terminalPanelVisible === true) {
                    terminal.fit();
                }

                terminal.on("commandEntered", (event, pid, command) => {
                    _setTabTitle(pid, command);
                });
            })
            .fail((error) => {
                console.error(error);
            });
    }

    function _handleOutputDataFromPseudoterminal(event, pid, data) {
        if (data && data.length > 0) {
            const terminal = terminalInstances[pid];
            terminal.write(data);
        }
    }

    function _setTabTitle(pid, command) {
        let title = command.trim();

        if (!title || title.length === 0) {
            return;
        }

        if (title.length > 9) {
            title = `${title.substring(0, 7)}...`;
        }

        const $tabs = $("#bcomm-nav-tabs");
        const $tab = $tabs.find(`#bcomm-tab-${pid}-title`);
        $tab.text(title);
        $tab.prop("title", title);
    }

    function _removeTerminal(terminal) {
        terminal.close();
        const $tab = $(`#bcomm-tab-${terminal.getId()}`);
        $(`#${terminal.getId()}`).remove();

        if (activeTerminalId &&
            terminal.getId() === activeTerminalId &&
            terminalCounter > 1) {

            let $newActiveTab = $tab.prev();

            if ($newActiveTab.length === 0) {
                $newActiveTab = $tab.next();
            }

            _setActiveTerminal($newActiveTab);
        }

        $tab.remove();
        terminalCounter--;
    }

    function _insertTerminalToPanel(terminal, active) {
        const tabItemId = `bcomm-tab-${terminal.getId()}`;

        const $tab = $(Mustache.render(terminalTabHtml, {
            id: tabItemId,
            title: `Terminal ${terminalCounter}`
        }));

        if (active) {
            _setActiveTerminal($tab);
        }

        $tab.insertBefore("#bcomm-add-tab");
        $("#bcomm-terminals").append(terminal.getHtml());
    }

    function fitTerminals() {
        let terminal;

        for (const i in terminalInstances) {
            terminal = terminalInstances[i];
            if (terminal !== undefined) {
                terminal.fit();
            }
        }
    }

    function _attachCloseTerminal(terminal) {
        $("#bcomm-nav-tabs").on("click", `#bcomm-tab-${terminal.getId()} .bcomm-close`, () => {
            _removeTerminal(terminal);

            if (terminalCounter === 0) {
                activeTerminalId = null;
            }
        });
    }

    function _attachSelectTerminal(terminal) {
        $("#bcomm-nav-tabs").find(`#bcomm-tab-${terminal.getId()}-a`).on("shown", () => {
            $("#bcomm-terminals").children("div").hide();
            $(`#${terminal.getId()}`).show();
            activeTerminalId = terminal.getId();
        });
    }

    function _attachAppendTerminal() {
        $("#bcomm-add-tab").on("click", () => {
            $("#bcomm-nav-tabs li").removeClass("active");
            _createTerminal(true);
            $("#bcomm-terminals").children("div").hide();
        });
    }

    function _setActiveTerminal($tab) {
        $tab.addClass("active terminal-tab");
        activeTerminalId = parseInt($tab.prop("id").replace("bcomm-tab-", ""));
        $(`#${activeTerminalId}`).show();
    }

    function _createPseudoTerminal() {
        return execDomain.exec("createPseudoterminal", {
            shellPath: prefs.get(common.prefs.SHELL_PATH),
            cwd: common.getWorkingDirectory()
        });
    }

    exports.showTerminalPanel = showTerminalPanel;
    exports.hideTerminalPanel = hideTerminalPanel;
    exports.getTerminalInstance = getTerminalInstance;
    exports.fitTerminals = fitTerminals;
});
