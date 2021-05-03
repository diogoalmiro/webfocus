<p align="center">
    <img src="https://raw.githubusercontent.com/diogoalmiro/webfocus/main/static/favicon.svg" alt="Webfocus Logo" height="90">
</p>

# Webfocus

**WARNING**: This is an work in progress module, use a your own risk.

This module defines two simple classes to help in the creation of NodeJS servers.

The `WebfocusApp` creates an express server internaly.
Allows you to register specific components to the server.
To use it `const WebfocusApp = require('@webfocus/app');`.
[More information of WebfocusApp.](https://github.com/diogoalmiro/webfocus/blob/main/doc/webfocus-component.md)

The `WebfocusComponent` represents a specific component.
To create a new component `const webfocusComponentInstance = require('@webfocus/app/component')(name: String, description: String)`.
Or access the class with `const WebfocusComponent = require('@webfocus/app/component').WebfocusComponent` with the constructor `new WebfocusComponent(name: String, description: String, dirname: String);`.
[More information of WebfocusComponents.](https://github.com/diogoalmiro/webfocus/blob/main/doc/webfocus-component.md)

## Installation

`npm install @webfocus/app`

## Usage

### Simple Usage

```javascript
let WebfocusApp = require('@webfocus/app');

let webfocusApp = new WebfocusApp( );

webfocusApp.registerComponent(webfocusComponentInstance1);
webfocusApp.registerComponent(webfocusComponentInstance2);
// ...
webfocusApp.registerComponent(webfocusComponentInstanceN);

webfocusApp.start();
```
