# WebfocusApp

## Constructor `new WebfocusApp( configuration?: Object )`

Creates an instance of WebfocusApp.

The configuration is optional and extends the following values:

```javascript
{
    port: 0, 
    name: "Default Application Name",
    dirname: path.join(__dirname, 'views'),
    static: path.join(__dirname, 'static'),
}
```

If an invalid `port` is given it is changed to 0.
Using `port == 0` will make the app listen to any available port. You can check the port after starting the server: `app.start().address().port`.

If any of the following keys are defined in the configuration they **will be ignored**:

<details>
  <summary><code>app-directory</code></summary>

   Will contain the path to a folder created (with the help of [appdata-path](https://www.npmjs.com/package/appdata-path)) `${require('appdata-path')('webfocus-app')}/${configuration.name}/`.
</details>

<details>
  <summary><code>components</code></summary>

  Will contain the `urlname`s of components registered in this instance. 
</details>

The constructor registers two handlers for the http GET requests `/` and `/api/`.

 - `/` will use pug to render the file at `${configuration.dirname}/layouts/index.pug`.

 - `/api/` will return a json list with the `urlname`s registered in this instance.
 It enables `application/json` and `application/x-www-form-urlencoded` http communication for subpaths of `/api/` (access to `req.body` on the component middleware).
 To upload files (`multipart/form-data`) use `mutler` on specific comonents.

 ## `webfocusApp#registerComponent(component : WebfocusComponent) : boolean`

 Returns false if the application has already started or if there exists an component with the same urlname registered.

 Registers he following handlers:

  - `/api/${component.urlname}` to use the component.app middleware.
  - `/${component.urlname}` for GET requests to serve statically the files in `component.componentFolder` and `component.dirname` or render the files within `component.dirname` with pug.

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
 
 - Makes `/api/` return 404 or 500 (if `next` was called with an error).
 - Tries to send files statically from `configuration.static` folder.
 - Returns 404 for GET requests and make pug render 'layouts/error.pug'.
 - Returns 400 for other method requests and makes pug render 'layouts/error.pug'.
 - Returns 500 if an error occured and makes pug render 'layouts/error.pug'.
