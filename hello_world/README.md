### hello world - a basic electron project
1. init
'''
hello-world/
├── .vscode/            // debug in visual stduio code
    ├──launch.json
├── web/                // 
    ├──css
    ├──js
    └──index.html
└── main.js             //
'''

2. npm init - add to package.json
'''
  "devDependencies": {
    "electron": "~1.7.8"
  }
'''

3. npm install


### add robotjs
1. npm install --save-dev robotjs
2. npm rebuild --runtime=electron --target=1.7.12 --disturl=https://atom.io/download/atom-shell --abi=51
3. main.js
```
var robot = require("robotjs");

// Speed up the mouse.
robot.setMouseDelay(2);

var twoPI = Math.PI * 2.0;
var screenSize = robot.getScreenSize();
var height = (screenSize.height / 2) - 10;
var width = screenSize.width;

for (var x = 0; x < width; x++)
{
	y = height * Math.sin((twoPI * x) / width) + height;
	robot.moveMouse(x, y);
}
```