[![Build Status](https://travis-ci.com/wozjac/brackets-commander.svg?branch=master)](https://travis-ci.com/wozjac/brackets-commander)

Brackets Commander
==================
Brackets Commander is an extension for Brackets editor providing a tabbed terminal panel, connected to a chosen shell (default cmd.exe on Windows platform).

![screenshot](http://public_repo.vipserv.org/images/commander/bg_cmd.png)

Requirements
------------
- Brackets => 1.14
- Windows (7 or above) x64 
- Linux x64 (tested on Linux Ubuntu 18.04.2 and Debian 9.7)
- Mac OS X (tested on Mojave 10.14.5) 

Features
--------
- supports multiple terminals in tabs
- configurable CLI (default cmd.exe on Windows, bash on Linux) 

Installation
------------
- Download "wozjac.commander.zip" file from [Releases](https://github.com/wozjac/brackets-commander/releases)
- Drag the zip file into Extension Manager's installation area  
OR  
- Unzip the file  
- Paste into the "user" extensions folder (in Brackets menu "Help" -> "Show extensions folder"), for example path on Windows: 
C:\Users\Myname\AppData\Roaming\Brackets\extensions\user  
OR
- Paste the link to "wozjac.commander.zip" file from https://github.com/wozjac/brackets-commander/releases into Extension Manager's installation area

In case of error about the extension initialization just restart Brackets.  

Usage
-----
- open via menu "View" -> "Show terminal panel"
- or via the icon in the toolbar ![icon](http://public_repo.vipserv.org/images/commander/icon.png)
- or via your key binding -> see *Configuration*

Configuration
-------------

#### 1. CLI
To change the shell put a [preference](https://github.com/adobe/brackets/wiki/How-to-Use-Brackets#preferences) option *bracketsCommander.shellPath* and put the path to your CLI.
For example, to change the CLI in the current project to Powershell create a .brackets.json file and put:  
```javascript
{  
    "bracketsCommander.shellPath": "C:\\Windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe"  
}
```
#### 2. Terminal background color
To change the shell put *bracketsCommander.backgroundColor* option and put the color as hex value, prefixed with #.
Example:  
```javascript
{  
    "bracketsCommander.backgroundColor": "#012456"  
}
```

#### 3. Key binding
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
Feel free to contact me:   
- wozjac@zoho.com  
- Twitter (https://twitter.com/jacekwoz)  
- LinkedIn (https://www.linkedin.com/in/jacek-wznk).
