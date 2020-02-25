define((require, exports, module) => {
    "use strict";

    const CommandManager = brackets.getModule("command/CommandManager"),
        WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        NodeDomain = brackets.getModule("utils/NodeDomain"),
        Mustache = brackets.getModule("thirdparty/mustache/mustache"),
        Terminal = require("src/Terminal"),
        common = require("src/common"),
        toolbarButton = require("src/toolbarButton"),
        prefs = require("src/preferences"),
        strings = require("strings"),
        execDomain = new NodeDomain("BracketsCommander", ExtensionUtils.getModulePath(module, "../node/execDomain"));

    execDomain.on("outputData", _handleOutputDataFromPseudoterminal);

    const terminalTabHtml = _readHtmlTemplateFile("terminal-tab.html");

    const terminalInstances = {};

    let terminalCounter = 0,
        terminalPanel = null,
        terminalPanelVisible = false,
        activeTerminalId = null,
        toolbarButtonIcon = null;

    initTerminalPanel();

    function initTerminalPanel() {
        const panelHtml = _readHtmlTemplateFile("terminal-panel.html");
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
            fitActiveTerminal();
        });

        _attachAppendTerminal();
        toolbarButtonIcon = toolbarButton.create();

        toolbarButtonIcon.addOnClickHandler((isEnabled) => {
            if (isEnabled) {
                hideTerminalPanel();
            } else {
                showTerminalPanel();
            }
        });
    }

    function showTerminalPanel() {
        terminalPanel.show();
        terminalPanelVisible = true;
        toolbarButtonIcon.setEnabled(true);

        if (_getTerminalInstancesLength() === 0) {
            _createTerminal(true);
        }

        fitActiveTerminal();
    }

    function hideTerminalPanel() {
        terminalPanel.hide();
        terminalPanelVisible = false;
        toolbarButtonIcon.setEnabled(false);
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

    //TODO: add title event handler
    //function _setTabTitle(pid, command) {
    //    let title = command.trim();
    //
    //    if (!title || title.length === 0) {
    //        return;
    //    }
    //
    //    if (title.length > 9) {
    //        title = `${title.substring(0, 7)}...`;
    //    }
    //
    //    const $tabs = $("#bcomm-nav-tabs");
    //    const $tab = $tabs.find(`#bcomm-tab-${pid}-title`);
    //    $tab.text(title);
    //    $tab.prop("title", title);
    //}

    function _removeTerminal(terminal) {
        terminal.close();
        const $tab = $(`#bcomm-tab-${terminal.getId()}`);
        $(`#${terminal.getId()}`).remove();

        if (activeTerminalId &&
            terminal.getId() === activeTerminalId &&
            _getTerminalInstancesLength() > 1) {

            let $newActiveTab = $tab.prev();

            if ($newActiveTab.length === 0) {
                $newActiveTab = $tab.next();
            }

            _setActiveTerminal($newActiveTab);
        }

        $tab.remove();
        delete terminalInstances[terminal.getId()];

        if (_getTerminalInstancesLength() === 0) {
            terminalCounter = 0;
        }
    }

    function _insertTerminalToPanel(terminal, active) {
        const tabItemId = `bcomm-tab-${terminal.getId()}`;

        const $tab = $(Mustache.render(terminalTabHtml, {
            id: tabItemId,
            title: _getTerminalTitle()
        }));

        if (active) {
            _setActiveTerminal($tab);
        }

        $tab.insertBefore("#bcomm-add-tab");
        $("#bcomm-terminals").append(terminal.getHtml());
    }

    function fitActiveTerminal() {
        const terminal = terminalInstances[activeTerminalId];

        if (terminal) {
            terminal.fit();
        }
    }

    function _attachCloseTerminal(terminal) {
        $("#bcomm-nav-tabs").on("click", `#bcomm-tab-${terminal.getId()} .bcomm-close`, () => {
            _removeTerminal(terminal);

            if (_getTerminalInstancesLength() === 0) {
                activeTerminalId = null;
            }
        });
    }

    function _attachSelectTerminal(terminal) {
        $("#bcomm-nav-tabs").find(`#bcomm-tab-${terminal.getId()}-a`).on("shown", () => {
            $("#bcomm-terminals").children("div").hide();
            $(`#${terminal.getId()}`).show();
            activeTerminalId = terminal.getId();
            terminal.focus();
            fitActiveTerminal();
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
        terminalInstances[activeTerminalId].focus();
        $(`#${activeTerminalId}`).show();
    }

    function _createPseudoTerminal() {
        return execDomain.exec("createPseudoterminal", {
            shellPath: prefs.get(common.prefs.SHELL_PATH),
            cwd: common.getWorkingDirectory()
        });
    }

    function _getTerminalTitle() {
        return `Terminal ${terminalCounter}`;
    }

    function _getTerminalInstancesLength() {
        return Object.keys(terminalInstances).length;
    }

    function _readHtmlTemplateFile(filename) {
        let result = "";
        const path = `${ExtensionUtils.getModulePath(module)}view/${filename}`;

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

    exports.showTerminalPanel = showTerminalPanel;
    exports.hideTerminalPanel = hideTerminalPanel;
    exports.getTerminalInstance = getTerminalInstance;
    exports.fitActiveTerminal = fitActiveTerminal;
});
