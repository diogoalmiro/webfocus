# WebfocusComponent

The `WebfocusComponent` class allows you to create specific components for your `WebfocusApp` application.
It extends the behavior of [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter)

A component can be defined simillarly as a NPM package. 

The [`main` file](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#main) should export an instance of `WebfocusComponent`:

```javascript
const component = require("@webfocus/app/component")("Component Name", "Component Description");

// Define Server Side Behavior with component.app
// component.app.get("/", (req, res, next) => res.json(`Hello from ${component.name} API`))

module.exports = component;
```

## Simple Structure

Within the component folder there should be at least `index.js` or the main file in the `package.json`.

A webfocusApp will add the middleware `component.app` to handle `/api/${component.urlname}/` requests.

For `/${component.urlname}/:subpath(*)?` `GET` requests it will try to:
 1. Statically serve files from `component.componentFolder`
 2. Statically serve files from `component.dirname`
 3. Render `path.join(component.dirname, subpath)` allways with the `basedir` of `webfocusApp.app.get('views')`.
   1. If it fails render `path.join(component.dirname, 'index')`

**Caveat**: If no action is done to prevent it, by changing the `component.dirname`, the main file can be requested by an user when getting `/${component.urlname}/index.js` or the main file name.

Any `.pug` file has access to the following variables:

Variable | type | Content
--- | --- | ---
`component` | `WebfocusComponent` | Self
`apibaseurl` | `string` | `/api/${component.urlname}/`
`componentbaseurl` | `string` | `/${component.urlname}/`
`req` | `http.IncomingMensage` | Request
`basedir` | `string` | `webfocusApp.dirname` (used to be able to extend from `/layouts/main.pug`)
`configuration` | `object` | `webfocusApp.configuration`
`getComponent` | `function` | `webfocusApp.getComponent` (adapted to return only `{name, urlname, description}` of another component)

## `createComponent(name: string, description: string)`

This is the default export and it simply call the `WebfocusComponent` constructor using the current directory `new WebfocusComponent(name, description, __dirname)`.

To acces the `WebfocusComponent` class:  `require("@webfocus/app/component").WebfocusComponent`.

### WebfocusComponent properties

The properties can be extended and modified by the creator of an specific component. By default the construtor defines the following properties:

 - `name` from the constructor argument
 - `urlname` "kebab case" of `name`
 - `app` is the express middleware to handle `/api/${component.urlname}/` requests
 - `description` from the constructor argument
 - `debug` function to debug with the namespace `webfocus:component:${component.urlname}`
 - `componentFolder` path to a folder created (with the help of [appdata-path](https://www.npmjs.com/package/appdata-path)) `${require('appdata-path')('webfocus-component')}/${component.urlname}/`.
 - `dirname` from the constructor argument.
 - `configuration` read-only proxy object to webfocusApp.configuration (it is not ready until the event 'configuration' is emitted)