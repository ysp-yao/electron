### hello world - a basic electron project
#### hello world
```
hello-world/
├── web/                // 
    ├──css
    ├──js
    └──index.html
└── main.js             //
```

#### Steps
1. `npm init`,generate file package.json

2. add to package.json
```
  "devDependencies": {
    "electron": "^1.8.4",
  }
```

3. 
`npm install --save-dev babel-cli babel-preset-es2015`
`npm install --save-dev rimraf`

4. 创建`.babelrc`
```
{
  "presets": ["es2015"]
}
```

5. `package.json`

```
  "scripts": {
    "build": "rimraf ./dist && babel ./web/js --out-dir ./dist/js",
    "start": "npm run build && electron ."
  },

```

4. `npm start`