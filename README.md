<p align="center">
    <img src="https://raw.githubusercontent.com/diogoalmiro/webfocus/main/static/favicon.svg" alt="Webfocus Logo" height="90">
</p>

# Webfocus

**WARNING**: This is an work in progress module, use a your own risk.

This module defines two simple classes to help in the creation of NodeJS servers using [express](https://expressjs.com/) and [Pug](https://pugjs.org/).

The main idea of this module is to enable the creation of independet components with the `WebfocusComponent` class and the creation of servers `WebfocusApp`'s using them.

The `WebfocusApp` creates an express server internaly.
Allows you to register specific components to the server.
To use it `const WebfocusApp = require('@webfocus/app');`.
[More information of WebfocusApp.](https://github.com/diogoalmiro/webfocus/blob/main/doc/webfocus-app.md)

The `WebfocusComponent` represents a specific component.
To create a new component `const webfocusComponentInstance = require('@webfocus/app/component')(name: String, description: String)`.
Or access the class with `const WebfocusComponent = require('@webfocus/app/component').WebfocusComponent` with the constructor `new WebfocusComponent(name: String, description: String, dirname: String);`.
[More information of WebfocusComponent.](https://github.com/diogoalmiro/webfocus/blob/main/doc/webfocus-component.md)

## Installation

`npm install @webfocus/app`

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

In the [repository](https://github.com/diogoalmiro/webfocus-cypress-tests) we do end-to-end tests with cypress tests on an sample implementation.

## TODO
 
 - Create an WebfocusComponent addon to enable distribution of a heavy process
