# WebfocusApp

## Constructor `new WebfocusApp( configuration?: Object )`

Creates an instance of WebfocusApp.

The `configuration` object is optional and extends the values:

```javascript
{
    port: 0, 
    name: "Default Application Name",
    dirname: path.join(__dirname, 'views'),
    static: path.join(__dirname, 'static'),
    components: []
}
```

### Notes

 - If an invalid `port` is given it is changed to 0.
 Using `port == 0` will make the app listen to any available port. You can check the port after starting the server: `app.start().address().port`.

 - The value of `components` is always replaced by an empty array. It is later be filled with the `urlname` of the components regitered.

 - `dirname` is the location used by `express` to render `pug` files. For more information on customizing the PUG Files see [Section Custom PUG Files](#custom-PUG-Files).

 - `static` is the location used by `express` to send static files.

### Behavior

The constructor registers two handlers for http GET requests to:

 - `/` will use pug to render the file at `layouts/index.pug`.

 - `/api/` will return a json list with the `urlname`s registered in this application.
 It enables `application/json` and `application/x-www-form-urlencoded` http communication for subpaths of `/api/` (access to `req.body` on the component middleware).
 To upload files (`multipart/form-data`) you can use `mutler` or any other implementation on specific comonents.

 ## `webfocusApp#registerComponent(component : WebfocusComponent) : boolean`

 Returns false if the application has already started or if there exists an component with the same urlname registered.

 Registers he following handlers:

  - `/api/${component.urlname}` to use the `component.app` middleware.
  - `/${component.urlname}` to use the `component.staticApp` middleware and render pug files within `component.dirname`. It usually try to serve files staticaly from `component.dirname`.

Example, a component with the following structure

```
component/
    index.js
    file.txt
    file.pug
    index.pug
    subfolder/
        index.pug
        file.pug
        file.txt
```

Responds the following:

```
GET /component/ -> pug renders component/index.pug
GET /component/file.txt -> statically return component/file.txt
GET /component/file -> pug renders component/file.pug
GET /component/anotherfile.txt -> pug renders component/index.pug
GET /component/subfolder/ -> pug renders component/subfolder/index.pug
GET /component/subfolder/file -> pug renders component/subfolder/file.pug
GET /component/subfolder/file.txt -> statically return component/subfolder/file.txt
GET /component/subfolder/anotherfile.txt -> pug renders component/index.pug
GET /component/anothersubfolder/anotherfile.txt -> pug renders component/index.pug

GET /api/component/ -> check the app component middleware 
```

## `webfocusApp#getComponent(urlname : string) : WebfocusComponent`

Gets an `WebfocusComponent` given its urlname or null if it is not registered.

## `webfocusApp#getAllComponentNames() : string[]`

Gets all `WebfocusComponent`s urlnames registered.

## `webfocusApp#emit(name: string, ...obj) : void`

Emits `name` with `...obj` to all registered components.


## `webfocusApp#start() : http.Server`

Starts the server listening to the port specified in configuration.

It defines the final handlers for requests if there was an error or there was no handler for the request.

Method | Request Path | Response Status |  Sends
--- | --- | --- | ---
Any | `/api/*` | `404` or `500` | JSON: `{ error: string, stack?: string }`
Any | `*` | 200 | Files from `configuration.static` folder
GET | `*` | 404 | Render of `layouts/error.pug`
Any | `*` | 400 or 500 | Render of `layouts/error.pug`

## `webfocusApp#pugObj( obj : Object ) : Object`

**Used internally when rendering with pug.**

Creates an object to be used by pug when rendering any file.

It adds the the keys `configuration` and `getComponent` to the object recieved.

 - `configuration` is the webfocusApp configuration.

 - `getComponent(urlname : String) : {urlname: string, name: string, description: string}` (From a the `WebfocusComponent`)

Any render will have the `req` object, representing the express request. 

Error renders (`layouts/error.pug`) will also have a `error: string` and optionaly a `stack: string`.

Component specific renders will have the following keys:
 
 - `apibaseurl = "/api/${component.urlname}/"`
 - `componentbaseurl = "/${component.urlname}/"`
 - `component = component` (The specific `WebfocusComponent` instance)
 - `basedir = webfocusApp.configuration.dirname` (To enable component to `extends /layouts/main.pug`)

## Custom PUG Files

This framework requires you to create a folder `layouts` with the files: `index.pug`, `error.pug` and `main.pug` if you change the default `dirname` value for a custom HTML.
Specifically `main.pug` will be extended by the components registered to the application, this means that the file must define a space for be extended with `block main` and `block head` .
To mantain a consistent look through the pages you could also make index.pug and error.pug extend from main.pug (just like any other component)