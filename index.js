const express = require('express');
const pug = require('pug');
const debug = require('debug')('webfocus:app');
const packageJSON = require('./package.json');

class WebfocusAppError extends Error{}

class WebfocusApp {
    constructor(){
        this.components = {};
        this.api = express.Router();
        let app = this.app = express();

        app.set('json spaces', 2);
        app.set('view engine', 'pug');


        app.use('/api', express.json({strict : false}), this.api);

    }

    start(){
        this.pugObj = (req) => {
            let obj = { req };
            obj.configuration = packageJSON;
            obj.configuration.components = this.getAllComponentNames();
            return obj;
        }
        this.api.use((req, res, next) => {
            res.status(404).json({error: `API Endpoint ${req.path} not found.`})
        })

        this.api.use((err, req, res, next) => {
            res.status(500).json({error: err.message})
        })

        this.app.use('^/$', (req, res, next) => {
            res.render('layouts/index', this.pugObj(req));
        })
        
        this.app.use('/:view', (req, res, next) => {
            try{
                let pugRouter = this.getComponentRouter(req.params.view);
                let pugObj = this.pugObj(req);
                console.log(pugRouter)
                console.log(pugObj)
                res.send(pugRouter(pugObj))
            }
            catch(e){
                if( e instanceof WebfocusAppError ){                    
                    debug(req.params.view)
                    next();
                }
                else{
                    console.log(e.stack)
                    debug("ERROR %s",req.params.view)
                    next(e);
                }
            }
        })

        this.app.use(express.static('static'));

        this.app.use((req, res, next) => { // Not found handling
            res.status(404).render('layouts/error', this.pugObj({req, error: `Not found ${req.path}`}));
        })
        
        this.app.use((err, req, res, next) => { // Internal error handling
            res.status(500).render('layouts/error', this.pugObj({req, error:err}));
        })

        let server = this.app.listen(packageJSON.port, () => {
            debug("Server listenning on port %s", server.address().port);
        })
    }

    registerComponent(name, router){
        if( !name || typeof name !== 'string' || name.length == 0 ){
            throw new WebfocusAppError("Invalid argument \"name\" must be a string with length > 0");
        }
        if( !router ){
            throw new WebfocusAppError("Invalid argument \"router\" must be a express middleware");
        }
        if( name in this.components ){
            throw new WebfocusAppError("Component Already Registered");
        }
        this.api.use(name, router);
        let pugRouter = pug.compileFile(router.__dirname+'/index.pug', {basedir:this.app.get('views')})
        this.components[name] = pugRouter;
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

module.exports = new WebfocusApp();