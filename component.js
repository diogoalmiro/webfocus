/**
 * WebfocusComponent module.
 * @module component
 */
const express = require("express");
const debug = require("debug");
const warn = debug('webfocus:component:warning');
warn.enabled = true;
const path = require("path");
const { statSync } = require("fs");
const EventEmitter = require("events").EventEmitter;

const EMPTY = new Object();
/**
 * Class representing internal component Errors 
 */
class WebfocusComponentError extends Error {}

function isString(val){
    return typeof val === 'string' || val instanceof String;
}
/**
 * Class representing a component.
 * 
 */
class WebfocusComponent extends EventEmitter {
    
    /**
     * Creates an instance of WebfocusComponent.
     * dirname property will be set to the directory where the constructor was called.
     * @param {String} name - Display name of the component.
     * @param {String} description - Description.
     * @param {String} dirname - Current working directory of the component. (usually __dirname)
     */
    constructor(name="", description="Generic Component Description", dirname){
        super();
        if( !isString(name) ){
            throw new WebfocusComponentError("Name argument provided is not a string");
        }
        try{
            if( !statSync(dirname).isDirectory() ){
                throw new WebfocusComponentError("Dirname argument provided is not a valid directory");
            }
        }
        catch(e){
            throw new WebfocusComponentError(`Unable to check ${dirname}`, e);
        }
        this.name = name;
        this.urlname = name.replace(/\s+/g, '-').toLowerCase();
        this.app = express.Router();
        this.description = description;
        this.dirname = dirname;
        this.debug = debug(`webfocus:component:${name}`);
        this.once('configuration', (conf) => {
            debug("Defining configuration");
            const c = new Proxy(conf, {
                get(obj, prop){
                    return obj[prop];
                },
                set(obj, prop){
                    warn("Ignoring setting configuration property")
                    return obj[prop];
                }
            });
            this.__defineGetter__("configuration", function(){
                return c;
            })
            this.emit('configurationReady');
            this.on('configuration', _ => {
                warn("Ignoring setting configuration more than once");
            })
        })


    }
}

/**
 * Creates an WebfocusComponent. Hides the need to pass __dirname explicitaly.
 * @param {String} name - Name to crete the component.
 * @param {String} description - Description of the component.
 */
module.exports = function createComponent(name, description){
    // https://github.com/detrohutt/caller-dirname/blob/master/src/index.ts
    const _ = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;
    const dirname = path.dirname(new Error().stack.find(s => s.getFileName() != __filename).getFileName());
    Error.prepareStackTrace = _;
    return new WebfocusComponent(name, description, dirname);
}

module.exports.WebfocusComponent = WebfocusComponent;
module.exports.WebfocusComponentError = WebfocusComponentError;
