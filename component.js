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
            throw new Error("Name argument provided is not a string");
        }
        try{
            if( !statSync(dirname).isDirectory() ){
                throw new Error("Dirname argument provided is not a valid directory");
            }
        }
        catch(e){
            throw new Error(`Unable to check ${dirname}`, e);
        }
        this.name = name;
        this.urlname = name.replace(/\s+/g, '-').toLowerCase();
        this.app = express.Router();
        this.description = description;
        this.dirname = dirname;
        this.debug = debug(`webfocus:component:${this.urlname}`);
        let config = EMPTY;
        this.configuration = new Proxy({}, {
            set: (obj, prop, value) => {
                warn("Trying to set read-only configuration");
                return config[prop]
            },
            get: (obj, prop) => {
                if(config === EMPTY) warn("Trying to read configuration before initialization");
                return config[prop]
            } 
        })
        this.once('configuration', (conf) => {
            this.debug("Defining configuration");
            config = conf;
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
