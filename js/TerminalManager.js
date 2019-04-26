/*global define, $, brackets */
define((require, exports, module) => {
    "use strict";

    const CommandManager = brackets.getModule("command/CommandManager"),
        WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        NodeDomain = brackets.getModule("utils/NodeDomain"),
        Mustache = brackets.getModule("thirdparty/mustache/mustache"),
        Terminal = require("js/Terminal"),
        common = require("js/common"),
        strings = require("strings"),
        terminalTabHtml = require("text!../view/terminal-tab.html"),
        execDomain = new NodeDomain("BracketsCommander", ExtensionUtils.getModulePath(module, "../node/execDomain"));

    execDomain.on("outputData", _handleOutputDataFromPseudoterminal);

    const terminalInstances = {};

    let terminalCounter = 0,
        terminalPanel = null,
        terminalPanelVisible = false;

    initTerminalPanel();

    function initTerminalPanel() {
        const panelHtml = require("text!../view/terminal-panel.html");
        terminalPanel = WorkspaceManager.createBottomPanel("brackets-commander.terminal-panel", $(panelHtml), 130);

        $("#bcomm-panel .close").click(() => {
            hideTerminalPanel();
        });

        $("#bcomm-panel").on("panelResizeEnd", () => {
            _fitTerminals();
        });

        _attachAppendTerminal();
    }

    function showTerminalPanel() {
        terminalPanel.show();
        terminalPanelVisible = true;

        if (terminalCounter === 0) {
            _createTerminal(true);
        }

        //_fitTerminals();
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
                terminal.open();

                if (terminalPanelVisible === true) {
                    terminal.fit();
                }
            })
            .fail((error) => {
                console.log(error);
            });
    }

    function _handleOutputDataFromPseudoterminal(event, pid, data) {
        //if (data.terminalId in activeProcesses === false) {
        //    activeProcesses[data.terminalId] = {
        //        processId: data.processId
        //    };
        //}

        if (data && data.length > 0) {
            const terminal = terminalInstances[pid];
            terminal.write(data);
        }
    }

    function _removeTerminal(terminal) {
        terminal.close();
        $(`#${terminal.getId()}`).remove();
        $(`#bcomm-tab-${terminal.getId()}`).remove();
        terminalCounter--;
    }

    function _insertTerminalToPanel(terminal, active) {
        const tabItemId = `bcomm-tab-${terminal.getId()}`;

        const $tab = $(Mustache.render(terminalTabHtml, {
            id: tabItemId,
            title: `Terminal ${terminalCounter}`
        }));

        if (active) {
            $tab.addClass("active terminal-tab");
        }

        $tab.insertBefore("#bcomm-add-tab");

        //let tabItem = "<li id='" + tabItemId + "'";
        //
        //if (active) {
        //    tabItem += " class='active terminal-tab'>";
        //} else {
        //    tabItem += ">";
        //}
        //
        //tabItem += "<a id='" + tabItemId + "-close'" +
        //    "href='#'" +
        //    "class='close bcomm-tab-icon'>" +
        //    "&times;</a>";
        //tabItem += "<a id='" + tabItemId + "-select'" +
        //    "href='#" + terminal.getId() +
        //    "' class='bcomm-tab-name'>" +
        //    "Terminal " + terminalCounter +
        //    "</a>" +
        //    "<a href='#'>" +
        //    "<span class='bcomm-stop-icon octicon octicon-primitive-square'>" +
        //    "</a></span></li>";
        //
        //$("#bcomm-add-tab").before(tabItem);
        //_attachSelectTerminal($("#" + tabItemId + "-select"));
        $("#bcomm-terminals").append(terminal.getHtml());
    }

    function _fitTerminals() {
        let terminal;

        for (const i in terminalInstances) {
            terminal = terminalInstances[i];
            if (terminal !== undefined) {
                terminal.fit();
            }
        }
    }

    function _attachCloseTerminal(terminal) {
        $("#bcomm-tabs").on("click", "#bcomm-tab-" + terminal.getId() + " .close", () => {
            _removeTerminal(terminal);
            _setTerminalTabNames();

            if (terminalCounter > 0) {
                _setActiveTerminal(terminalCounter);
            }
        });
    }

    function _attachSelectTerminal($tabItem) {
        $tabItem.on("click", function () {
            $("#bcomm-tabs li").removeClass("active");
            $(this).parent().addClass("active");
            $("#bcomm-terminals").children("div").hide();
            const activeTab = $(this).attr("href");
            $(activeTab).show();
        });
    }

    function _attachAppendTerminal() {
        $("#bcomm-append-link").on("click", () => {
            $("#bcomm-tabs li").removeClass("active");
            const terminal = _createTerminal(true);
            $("#bcomm-terminals").children("div").hide();
            $("#" + terminal.getId()).show();
        });
    }

    function _setTerminalTabNames() {
        $("#bcomm-tabs").find(".bcomm-tab-name").each(function (index) {
            $(this).text("Terminal " + (++index));
        });
    }

    function _setActiveTerminal(terminalIndex) {
        $("#bcomm-tabs").find(".bcomm-tab-name").each(function (index) {
            if (++index === terminalIndex) {
                $(this).click();
            }
        });
    }

    function _createPseudoTerminal() {
        return execDomain.exec("createPseudoterminal", {
            cwd: common.getWorkingDirectory()
        });
    }

    exports.showTerminalPanel = showTerminalPanel;
    exports.hideTerminalPanel = hideTerminalPanel;
    exports.getTerminalInstance = getTerminalInstance;
});
