const express = require("express");
const debug = require("debug");

const EMPTY = new Object(); 

class WebfocusComponentError extends Error {}

class WebfocusComponent {
    #_configuration = EMPTY;
    #_onConfigurationReady = () => {};
    constructor(name, description, dirname){
        this.app = express.Router();
        this.name = name;
        this.description = description;
        this.dirname = dirname;
        this.debug = debug(`webfocus:component:${name}`)
        this.onConfigurationReady = (cb=()=>{}) => {this.#_onConfigurationReady = cb}
    }

    set configuration(configuration){
        if( this.#_configuration === EMPTY ){
            this.#_configuration = configuration;
            this.#_onConfigurationReady();
        }
        else{
            throw new WebfocusComponentError(`Attempting to override configuration object on component "${this.name}".`);
        }
    }

    get configuration(){
        let self = this;
        return new Proxy(EMPTY, {
            set: function(){
                throw new WebfocusComponentError(`Attempting to override value on ${self.name} component's configuration.`)
            },
            get: function(_, prop){
                if( self.#_configuration === EMPTY ){
                    throw new WebfocusComponentError(`Attempting to access configuration before its initialisation on ${self.name} component.`);
                }
                return self.#_configuration[prop];
            }
        })
    }
}

module.exports = function createComponent(name, description, dirname){
    return new WebfocusComponent(name, description, dirname);
}

module.exports.WebfocusComponent = WebfocusComponent;
module.exports.WebfocusComponentError = WebfocusComponentError;
