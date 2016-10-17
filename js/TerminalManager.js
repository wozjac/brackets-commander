/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */
define(function(require, exports) {
    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager"),
        WorkspaceManager = brackets.getModule("view/WorkspaceManager");

    var Terminal = require("js/Terminal"),
        Common = require("js/Common");

    var terminalInstances = {},
        terminalCounter = 0,
        terminalPanel = null;

    initTerminalPanel();

    function initTerminalPanel() {
        var panelHtml = require("text!../view/terminal-panel.html");
        terminalPanel = WorkspaceManager.createBottomPanel("brackets-commander.terminal-panel", $(panelHtml), 130);

        $("#bcomm-panel .close").click(function() {
            terminalPanel.hide();
            CommandManager.get(Common.OPEN_TERMINAL_COMMAND_ID).setChecked(false);
        });

        _attachAppendTerminal();
        _createTerminal(true);
    }

    function showTerminalPanel() {
        terminalPanel.show();
    }

    function hideTerminalPanel() {
        terminalPanel.hide();
    }

    function getTerminalInstance(terminalId) {
        return terminalInstances[terminalId];
    }

    function _createTerminal(active) {
        var terminal = new Terminal();
        terminalCounter++;
        terminalInstances[terminal.getId()] = terminal;
        _insertTerminalToPanel(terminal, active);
        _attachCloseTerminal(terminal);
        return terminal;
    }

    function _removeTerminal(terminal) {
        terminal.close();
        $("#" + terminal.getId()).remove();
        $("#bcomm-tab-" + terminal.getId()).remove();
        terminalCounter--;
    }

    function _insertTerminalToPanel(terminal, active) {
        var tabItemId = "bcomm-tab-" + terminal.getId();
        var tabItem = "<li id='" + tabItemId + "'";
        if (active) {
            tabItem += " class='active'>";
        } else {
            tabItem += ">";
        }
        tabItem += "<a href='#' class='close bcomm-tab-icon'>&times;</a>" +
            "<a href='#" + terminal.getId() + "' class='bcomm-tab-name'>Terminal " + terminalCounter + "</a></li>";

        $("#bcomm-append-item").before(tabItem);
        _attachSelectTerminal($("#" + tabItemId + " .bcomm-tab-name"));
        $("#bcomm-terminals").append(terminal.getHtml());
    }

    function _attachCloseTerminal(terminal) {
        $("#bcomm-tabs").on("click", "#bcomm-tab-" + terminal.getId() + " .close", function() {
            _removeTerminal(terminal);
            _setTerminalTabNames();
        });
    }

    function _attachSelectTerminal($tabItem) {
        $tabItem.on("click", function() {
            $("#bcomm-tabs li").removeClass("active");
            $(this).parent().addClass("active");
            $("#bcomm-terminals").children("div").hide();
            var activeTab = $(this).attr("href");
            $(activeTab).show();
        });
    }

    function _attachAppendTerminal() {
        $("#bcomm-append-link").on("click", function() {
            $("#bcomm-tabs li").removeClass("active");
            var terminal = _createTerminal(true);
            $("#bcomm-terminals").children("div").hide();
            $("#" + terminal.getId()).show();
        });
    }

    function _setTerminalTabNames() {
        $("#bcomm-tabs").find(".bcomm-tab-name").each(function(index) {
            $(this).text("Terminal " + (++index));
        });
    }

    exports.showTerminalPanel = showTerminalPanel;
    exports.hideTerminalPanel = hideTerminalPanel;
    exports.getTerminalInstance = getTerminalInstance;

    showTerminalPanel();
});
