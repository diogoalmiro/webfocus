const { fail } = require('assert');
const assert = require('assert');
const request = require('supertest');
const WebfocusApp = require("../app");
const WebfocusAppError = WebfocusApp.WebfocusAppError;

function failConstructor(obj){
	try{
		return new WebfocusApp(obj) && false;
	}
	catch(e){
		return e instanceof WebfocusAppError;
	}
}

describe("WebfocusApp", function(){
	describe("#constructor", function(){
		describe("without parameters", function(){
			it("should return an webfocusApp instance",function(){
				const webfocusApp = new WebfocusApp();
				assert(webfocusApp instanceof WebfocusApp);
			})
		})
		describe("with parameters", function(){
			it("should expect the port property", function(){
				assert(failConstructor({}))
			})
			it("should expect the port property to be positive", function(){
				assert(failConstructor({port:-1}))
			})
			it("should expect the port property to be integer", function(){
				assert(failConstructor({port:"hello"}))
			})
			it("should expect the name property", function(){
				assert(failConstructor({port:7000}))
			})
			it("should expect the name property", function(){
				assert(failConstructor({port:7000,name: new Object()}))
			})
			it("should return an webfocusApp instance", function(){
				const webfocusApp = new WebfocusApp({port:7000,name:"Test"});
				assert(webfocusApp instanceof WebfocusApp);	
			})
		})
	})

	describe("#configuration", function(){
		let configuration = {port:8000, name: "Test", avalue: Math.random()}

		it('should be read-only', function(){
			let webfocusApp = new WebfocusApp(configuration);
			let old = webfocusApp.configuration.avalue;
			webfocusApp.configuration.avalue = -Math.random();
			assert(webfocusApp.configuration.avalue === old);
		})

		it('should contain a Array components', function(){
			let webfocusApp = new WebfocusApp();
			assert(Array.isArray(webfocusApp.configuration.components))
		})
	})

})
