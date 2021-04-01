/**
 * WebfocusApp module.
 * @module app
 */
const express = require('express');
const path = require('path');
const debug = require('debug')('webfocus:app');
const WebfocusComponent = require("./component").WebfocusComponent;

/**
 * WebfocusAppError
 */
class WebfocusAppError extends Error{}

/**
 * Class that allows the registration of components (see @webfocus/component) and creates a server.
 * 
 * To start the sever call (.start) the server will listen on the .configuration.port, `8000` by default.
 */
class WebfocusApp {

    /**
     * Creates a Webfocus App Instance
     * 
     * Throws @WebfocusAppError when configuration object does not contain the port or the name values. 
     * @param {Object} [configuration] - Configuration Object, the default is the object {port:8000,name:"App Name"}
     */
    constructor(configuration={port: 8000, name: "App Name"}){
        debug("constructor");
        // Configuration checks
        if( !("port" in configuration) ){
            throw new WebfocusAppError(`Constructor requires an object with a "port" key`);
        }
        
        if( !Number.isSafeInteger(configuration.port) || configuration.port < 0 || configuration.port > 65535 ){
            throw new WebfocusAppError(`Invalid port value provided (${configuration.port})`);
        }

        if( !("name" in configuration) ){
            throw new WebfocusAppError(`Constructor requires an object with a "name" key`);
        }

        if( (typeof configuration.name !== 'string') && !(configuration.name instanceof String) ){
            throw new WebfocusAppError(`Invalid name value provided (${configuration.name})`);
        }

        // Class properties
        this.configuration = /*Object.freeze*/({
            components : [],
            ...configuration
        });
        this.components = {};
        this.started = false;

        // Express application
        let app = this.app = express();
        
        app.set('json spaces', 2);
        app.set('view engine', 'pug');
        app.set('views', path.join(__dirname,'views'))
        
        // Main express api middleware
        this.api = express.Router();
        // Enable JSON and HTTP-form-submit communication
        // Warning: Does *NOT* enable file uploading (multipart/form-data)
        //          use mutler (see https://github.com/expressjs/multer) on specific components.
        app.use("/api", [express.json({strict : false}), express.urlencoded({extended: true}), this.api])
        
        // Express initial handlers
        this.api.get("^/$", (req, res, next) => {
            debug("Route Api Handler")
            res.json(this.getAllComponentNames())
        })
        app.get('^/$', (req, res, next) => {
            debug("Route App Handler")
            res.render('layouts/index', this.pugObj({req}));
        })

    }

    /**
     * Creates an object 
     * @param {*} objs 
     */
    pugObj(objs){
        let obj = { ...objs };
        obj.configuration = this.configuration;
        return obj;
    }

    /**
     * Starts the WebfocusApp instance.
     * 
     * Throws an @WebfocusAppError when invoced more than once.
     */
    start(){
        debug("started")
        if( this.started ){
            throw new WebfocusAppError("Method start can only be called once on the same instance");
        } 
        this.started = true;
        
        // Last express handlers
        this.api.use((req, res, next) => {
            debug("Not Found Api Handler on %s %s", req.method, req.path);
            res.status(404).json({error: `API Endpoint ${req.path} not found.`})
        })

        this.api.use((err, req, res, next) => {
            debug("Error Api Handler on %s %s: %s", req.method, req.path, err.message);
            res.status(500).json({error: err.message, stack: err.stack})
        })

        // Serve static files under the static folder
        this.app.use(express.static(path.join(__dirname, 'static')));

        this.app.get("*", (req, res, next) => { // Not found handling
            debug("Not Found Handler (%s)", req.path);
            res.status(404).render('layouts/error', this.pugObj({req, error: `Not found ${req.path}`}));
        })

        this.app.all("*", (req, res, next) => { // Method Not Allowed handling
            res.status(400).render(`layouts/error`, this.pugObj({req, error: `Method not allowed (${req.method})`}));
        })
        
        this.app.use((err, req, res, next) => { // Internal error handling
            debug("Error Handler (%s)", req.path);
            res.status(500).render('layouts/error', this.pugObj({req, error:err.message, stack: err.stack}));
        })

        let server = this.app.listen(this.configuration.port, () => {
            debug("Server listenning on port %s", server.address().port);
        })
        return server;
    }
    
    registerComponent(component){
        if( !(component instanceof WebfocusComponent) ){
            throw new WebfocusAppError(`Trying to register something that is not a @webfocus/component component. (${component})`);
        }
        if( this.started ){
            throw new WebfocusAppError(`Trying to register components after webfocus application started.`);
        }
        if( component.urlname in this.components ){
            throw new WebfocusAppError(`Trying to register a component with the same url name as a component registered. (${component.urlname})`);
        }
        debug("Registering component \"%s\"", component.urlname);

        component.configuration = this.configuration;
        
        this.components[component.urlname] = component;
        this.configuration.components.push(component.urlname);
        this.api.use(`/${component.urlname}`, component.app);
        this.app.use(`/${component.urlname}`, express.static(component.dirname));
        this.app.get(`/${component.urlname}/:subpath(*)?`, (req, res, next) => {
            let subpath = path.join("/", req.params.subpath || "");
            if( subpath.endsWith("/") ){
                subpath += "index";
            }
            component.debug("Get handler (%s) %s", subpath, req.path);
            let pObj = this.pugObj({
                apibaseurl: `/api/${component.urlname}/`,
                componentbaseurl: `/${component.urlname}/`,
                req, 
                basedir: this.app.get('views')
            });
            res.render(path.join(component.dirname, subpath), pObj, (err, html) => {
                if( err ){
                    if( subpath == "/index" ){
                        component.debug("Error at - index.pug: %s", err.message )
                        next(err);
                    }
                    else if( err.message.indexOf("Failed to lookup") >= 0 ){
                        component.debug("Component specific view does not exit, using index.pug");
                        res.render(path.join(component.dirname, 'index'), pObj);
                    }
                    else{
                        component.debug("Error at - %s.pug: %s", subpath, err.message);
                        next(err);
                    }
                }
                else{
                    res.send(html);
                }
            })
        })
    }

    getComponent(urlname){
        let r = this.components[urlname];
        if( !r ){
            throw new WebfocusAppError(`Component "${urlname}" not regitered`);
        }
        return r;
    }

    getAllComponentNames(){
        return Object.keys(this.components);
    }
} 

module.exports = WebfocusApp;
module.exports.WebfocusAppError = WebfocusAppError;