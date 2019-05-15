[![Build Status](https://travis-ci.com/wozjac/brackets-commander.svg?branch=master)](https://travis-ci.com/wozjac/brackets-commander)

Brackets Commander
==================
Brackets Commander is an extension for Brackets editor providing a tabbed terminal panel, connected to the chosen CLI (default cmd.exe on Windows platform).

![screenshot](https://www.mediafire.com/convkey/d784/bj2bgzzt5okwa9q6g.jpg)

Status
------
- testing on Windows platform
- working on Linux version

Requirements
------------
- Brackets 1.13
- Windows > 7 

Features
--------
- supports multiple terminals in tabs
- configurable CLI (default cmd.exe on Windows) 

Installation
------------
1. Download "wozjac.commander.zip" file from [Releases](https://github.com/wozjac/brackets-commander/releases)
2. Unzip to a folder "wozjac.commander"
3. Paste into the "user" extensions folder (in Brackets menu "Help" -> "Show extensions folder"), for example path on Windows: 
C:\Users\Myname\AppData\Roaming\Brackets\extensions\user

Usage
-----
- open via menu "View" -> "Show terminal panel"
- or via the icon in the toolbar ![icon](https://www.mediafire.com/convkey/988f/w3z9rkpyt60355v6g.jpg)
- or via your key binding -> see *Configuration*

Configuration
-------------

#### 1. CLI
To change the CLI create a [preference](https://github.com/adobe/brackets/wiki/How-to-Use-Brackets#preferences) option *bracketsCommander.shellPath* and put the path to your CLI.
For example, to change the CLI in the current project to Powershell create a .brackets.json file and put:  
```javascript
{  
    "bracketsCommander.shellPath": "C:\\Windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe"  
}
```

#### 2. Key binding
By default none key shortcut is assigned for opening the terminal panel. You can set your own: menu "Debug" -> "Open User Key Map", put your [key binding](https://github.com/adobe/brackets/wiki/User-Key-Bindings).
```javascript
{
    "documentation": "https://github.com/adobe/brackets/wiki/User-Key-Bindings",
    "overrides": {
        "Ctrl-Alt-y": "brackets-commander.openTerminal"
    }
}
```

License
-------
This extension is licensed under the [MIT license](http://opensource.org/licenses/MIT).

Author
------
Feel free to contact me: wozjac@zoho.com or via LinkedIn (https://www.linkedin.com/in/jacek-wznk).