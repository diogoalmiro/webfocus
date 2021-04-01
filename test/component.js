const assert = require('assert');
const request = require('supertest');
const createComponent = require('../component');
const {WebfocusComponent, WebfocusComponentError} = createComponent;

describe("WebfocusComponent", function(){

    describe("createComponent", function(){
        it("should create an WebfocusComponent instance", function(){
            let component = createComponent();
            assert(component instanceof WebfocusComponent);
        })
        it("should define dirname automatically", function(){
            let component = createComponent();
            assert(component.dirname === __dirname);
        })

        it("should throw error", function(){
            try{
                createComponent(null);
                assert(false);
            }
            catch(e){
                assert(e instanceof WebfocusComponentError)
            }
        })
    })

    describe("configuration", function(){
        it("should be undefined before setting", function(){
            assert( createComponent().configuration === undefined );
        })
        it("should set the configuration", function(){
            let component = createComponent();
            let f = Math.random();
            component.emit('configuration',{avalue:f});
            assert(component.configuration.avalue == f);
        })
        it("should ignore setting more than once", function(){
            let component = createComponent();
            let f = Math.random();
            component.emit('configuration',{avalue:f});
            component.emit('configuration',{avalue:-f});

        })
        it("should set the configuration to read-only", function(){
        
            let component = createComponent();
            let f = Math.random();
            component.emit('configuration', {avalue:f})
            component.configuration.avalue = -f;
            assert(component.configuration.avalue == f);
        
        })
    })
    
})