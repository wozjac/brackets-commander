/*global define, brackets*/
define((require, exports, module) => {
    "use strict";

    const CommandManager = brackets.getModule("command/CommandManager"),
        KeyBindingManager = brackets.getModule("command/KeyBindingManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        Menus = brackets.getModule("command/Menus"),
        terminalManager = require("js/TerminalManager"),
        Common = require("js/Common");

    ExtensionUtils.loadStyleSheet(module, "css/style.css");
    ExtensionUtils.loadStyleSheet(module, "node/node_modules/xterm/dist/xterm.css");
    ExtensionUtils.loadStyleSheet(module, "node/node_modules/xterm/dist/addons/fullscreen/fullscreen.css");

    CommandManager.register("Show terminal panel", Common.OPEN_TERMINAL_COMMAND_ID, handleOpenTerminalCommand);
    addCommandToMenu();

    function addCommandToMenu() {
        const menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        menu.addMenuDivider();
        menu.addMenuItem(Common.OPEN_TERMINAL_COMMAND_ID);
        KeyBindingManager.addBinding(Common.OPEN_TERMINAL_COMMAND_ID, {
            key: "Ctrl-Alt-T"
        });
    }

    function handleOpenTerminalCommand() {
        const showTerminalCommand = CommandManager.get(Common.OPEN_TERMINAL_COMMAND_ID);

        if (showTerminalCommand.getChecked() === true) {
            showTerminalCommand.setChecked(false);
            terminalManager.hideTerminalPanel();
        } else {
            showTerminalCommand.setChecked(true);
            terminalManager.showTerminalPanel();
        }
    }
});
