define((require, exports, module) => {
    "use strict";

    const CommandManager = brackets.getModule("command/CommandManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        Menus = brackets.getModule("command/Menus"),
        WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        AppInit = brackets.getModule("utils/AppInit"),
        terminalManager = require("src/terminalManager"),
        preferences = require("src/preferences"),
        common = require("src/common");

    ExtensionUtils.loadStyleSheet(module, "assets/style.css");
    ExtensionUtils.loadStyleSheet(module, "node/node_modules/xterm/css/xterm.css");

    CommandManager.register("Show terminal panel", common.OPEN_TERMINAL_COMMAND_ID, handleOpenTerminalCommand);
    WorkspaceManager.on(WorkspaceManager.EVENT_WORKSPACE_UPDATE_LAYOUT, handleWindowResize);
    addCommandToMenu();

    AppInit.appReady(() => {
        preferences.initPreferences();
    });

    function addCommandToMenu() {
        const menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        menu.addMenuDivider();
        menu.addMenuItem(common.OPEN_TERMINAL_COMMAND_ID);
    }

    function handleOpenTerminalCommand() {
        const showTerminalCommand = CommandManager.get(common.OPEN_TERMINAL_COMMAND_ID);

        if (showTerminalCommand.getChecked() === true) {
            showTerminalCommand.setChecked(false);
            terminalManager.hideTerminalPanel();
        } else {
            showTerminalCommand.setChecked(true);
            terminalManager.showTerminalPanel();
        }
    }

    function handleWindowResize() {
        setTimeout(() => {
            terminalManager.fitActiveTerminal();
        }, 500);
    }
});
