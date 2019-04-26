/*global define, brackets*/
define((require, exports, module) => {
    "use strict";

    const CommandManager = brackets.getModule("command/CommandManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        Menus = brackets.getModule("command/Menus"),
        terminalManager = require("js/terminalManager"),
        common = require("js/common");

    ExtensionUtils.loadStyleSheet(module, "css/style.css");
    ExtensionUtils.loadStyleSheet(module, "node/node_modules/xterm/dist/xterm.css");
    ExtensionUtils.loadStyleSheet(module, "node/node_modules/xterm/dist/addons/fullscreen/fullscreen.css");

    CommandManager.register("Show terminal panel", common.OPEN_TERMINAL_COMMAND_ID, handleOpenTerminalCommand);
    addCommandToMenu();

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
});
