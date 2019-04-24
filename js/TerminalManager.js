/*global define, $, brackets */
define((require, exports) => {
    "use strict";

    const CommandManager = brackets.getModule("command/CommandManager"),
        WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        TerminalService = require("js/TerminalService"),
        Common = require("js/Common");

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
        _createTerminal(true);
    }

    function showTerminalPanel() {
        terminalPanel.show();
        terminalPanelVisible = true;
        _fitTerminals();
    }

    function hideTerminalPanel() {
        terminalPanel.hide();
        terminalPanelVisible = false;
        CommandManager.get(Common.OPEN_TERMINAL_COMMAND_ID).setChecked(false);
    }

    function getTerminalInstance(terminalId) {
        return terminalInstances[terminalId];
    }

    function _createTerminal(active) {
        const terminal = new TerminalService();
        terminalCounter++;
        terminalInstances[terminal.getId()] = terminal;
        _insertTerminalToPanel(terminal, active);
        _attachCloseTerminal(terminal);
        terminal.open();
        if (terminalPanelVisible === true) {
            terminal.fit();
        }
        return terminal;
    }

    function _removeTerminal(terminal) {
        terminal.close();
        $(`#${terminal.getId()}`).remove();
        $(`#bcomm-tab-${terminal.getId()}`).remove();
        terminalCounter--;
    }

    function _insertTerminalToPanel(terminal, active) {
        const tabItemId = "bcomm-tab-" + terminal.getId();
        let tabItem = "<li id='" + tabItemId + "'";

        if (active) {
            tabItem += " class='active terminal-tab'>";
        } else {
            tabItem += ">";
        }

        tabItem += "<a id='" + tabItemId + "-close'" +
            "href='#'" +
            "class='close bcomm-tab-icon'>" +
            "&times;</a>";
        tabItem += "<a id='" + tabItemId + "-select'" +
            "href='#" + terminal.getId() +
            "' class='bcomm-tab-name'>" +
            "Terminal " + terminalCounter +
            "</a>" +
            "<a href='#'>" +
            "<span class='bcomm-stop-icon octicon octicon-primitive-square'>" +
            "</a></span></li>";

        $("#bcomm-append-item").before(tabItem);
        _attachSelectTerminal($("#" + tabItemId + "-select"));
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

    exports.showTerminalPanel = showTerminalPanel;
    exports.hideTerminalPanel = hideTerminalPanel;
    exports.getTerminalInstance = getTerminalInstance;
});
