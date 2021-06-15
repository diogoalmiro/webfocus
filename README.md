<p align="center">
    <img src="https://raw.githubusercontent.com/diogoalmiro/webfocus/main/static/favicon.svg" alt="Webfocus Logo" height="90">
</p>

# Webfocus

This module defines the WebfocusApp class to help in the creation of NodeJS servers using [express](https://expressjs.com/) and [Pug](https://pugjs.org/).

The main idea of this module is to enable the creation of independet components with the `WebfocusComponent` class [(see @webfocus/component)](https://www.npmjs.com/package/@webfocus/component) and the creation of applications with `WebfocusApp` class using said components.

Specifically, the `WebfocusApp` creates an express server internaly.
Allows you to register specific components to the server.
To use it `const WebfocusApp = require('@webfocus/app');`.
[More information of the WebfocusApp.](https://github.com/diogoalmiro/webfocus/blob/main/doc/webfocus-app.md)

## Getting Started

On your current project:

`npm install @webfocus/app`

Or use the initializer:

`npm init @webfocus/app`

The later will create a template WebfocusApp (the `package.json` and `index.js` files)

## Usage

```javascript
let WebfocusApp = require('@webfocus/app');

let webfocusApp = new WebfocusApp(options);

webfocusApp.registerComponent(webfocusComponentInstance1);
webfocusApp.registerComponent(webfocusComponentInstance2);
// ...
webfocusApp.registerComponent(webfocusComponentInstanceN);

webfocusApp.start();
```

In the [repository](https://github.com/webfocus-js/cypress-tests) we do end-to-end tests with cypress tests on an sample implementation.
