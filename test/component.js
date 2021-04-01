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
        it("should throw error when reading before setting", function(){
            try{
                createComponent().configuration.avalue;
                assert(false);
            }
            catch(e){
                assert(e instanceof WebfocusComponentError);
            }
        })
        it("should throw error when setting more than once", function(){
            try{
                let component = createComponent();
                component.configuration = {avalue: Math.random()};
                component.configuration = {avalue: Math.random()};
                assert(false);
            }
            catch(e){
                assert(e instanceof WebfocusComponentError);
            }
        })
        it("should set the configuration", function(){
            let component = createComponent();
            let f = Math.random();
            component.configuration = {avalue:f}
            assert(component.configuration.avalue == f)
        })
        it("should set the configuration to read-only", function(){
            try{
                let component = createComponent();
                let f = Math.random();
                component.configuration = {avalue:f}
                component.configuration.avalue = -f;
                assert(component.configuration.avalue == f);
            }
            catch(e){
                assert(e instanceof WebfocusComponentError)
            }
        })
    })
    
})