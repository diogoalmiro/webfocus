# WebfocusApp

## Constructor new WebfocusApp( configuration?: Object )

Creates an instance of WebfocusApp.

The configuration will extend the following values:

```javascript
const DEFAULT_VALUES = {
    port: 0, 
    name: "Default Application Name",
    dirname: path.join(__dirname, 'views')
}
```

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