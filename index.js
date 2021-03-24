const express = require('express');
const pug = require('pug');
const path = require('path');
const debug = require('debug')('webfocus:app');
const isComponent = require("@webfocus/component").isComponent;

class WebfocusAppError extends Error{}

class WebfocusApp {
    constructor(configuration={port: 8000, name: "Name not provided"}){
        this.configuration = {
            components : [],
            ...configuration
        };
        this.components = {};
        this.started = false;
        this.api = express.Router();
        let app = this.app = express();

        app.set('json spaces', 2);
        app.set('view engine', 'pug');
        app.set('views', path.join(__dirname,'views'))

        app.use('/api', express.json({strict : false}), this.api);

        this.api.get("^/$", (req, res, next) => {
            debug("Route Api Handler")
            res.json(this.getAllComponentNames())
        })
    }

    start(){
        if( this.started ) throw new WebfocusAppError("Method start can only be called once on the same instance");
        this.started = true;
        Object.freeze(this.configuration)
        this.pugObj = (objs) => {
            let obj = { ...objs };
            obj.configuration = this.configuration;
            return obj;
        }
        this.api.use((req, res, next) => {
            debug("Not Found Api Handler");
            res.status(404).json({error: `API Endpoint ${req.path} not found.`})
        })

        this.api.use((err, req, res, next) => {
            debug("Error Api Handler: %s", err.message);
            res.status(500).json({error: err.message})
        })

        this.app.use('^/$', (req, res, next) => {
            debug("Route App Handler")
            res.render('layouts/index', this.pugObj({req}));
        })
        
        this.app.use('^/:view([^\/]+)$', (req, res, next) => {
            debug("View Handler (%s)", req.params.view)
            try{
                let pugRouter = this.getComponentRouter(req.params.view);
                res.send(pugRouter(this.pugObj({req})));
            }
            catch(e){
                if( e instanceof WebfocusAppError ){                    
                    debug("    WebfocusAppError");
                    next();
                }
                else{
                    debug("    Unexpected Error: %s",e.message);
                    next(e);
                }
            }
        })
        this.app.use(express.static(path.join(__dirname, 'static')));

        this.app.use((req, res, next) => { // Not found handling
            debug("Not Found Handler (%s)", req.path);
            res.status(404).render('layouts/error', this.pugObj({req, error: `Not found ${req.path}`}));
        })
        
        this.app.use((err, req, res, next) => { // Internal error handling
            debug("Error Handler (%s)", req.path);
            res.status(500).render('layouts/error', this.pugObj({req, error:err.message}));
        })

        let server = this.app.listen(this.configuration.port, () => {
            debug("Server listenning on port %s", server.address().port);
        })
    }
    
    registerComponent(name, component){
        if( !isComponent(component) ){
            throw new WebfocusAppError(`Trying to register the component "${name}" that is not a @webfocus/component component.`)
        }
        component.setConfiguration(this.configuration);
        this.api.use(`/${name}`, component.app);
        let pugRouter = pug.compileFile(path.join(component.dirname, '/index.pug'), {basedir:this.app.get('views')})
        this.components[name] = pugRouter;
        this.configuration.components.push(name);
    }

    getComponentRouter(name){
        if( !name || typeof name !== 'string' || name.length == 0 ){
            throw new WebfocusAppError("Invalid argument \"name\" must be a string with length > 0");
        }
        let r = this.components[name];
        if( !r ){
            throw new WebfocusAppError(`Component \"${name}\"not regitered`);
        }
        return r;
    }

    getAllComponentNames(){
        return Object.keys(this.components);
    }
} 

module.exports = WebfocusApp;