const assert = require('assert');
const request = require('supertest');
const WebfocusApp = require('../app');
const WebfocusAppError = WebfocusApp.WebfocusAppError;
const createComponent_ = require('../component');

function failConstructor(obj){
	try{
		return new WebfocusApp(obj) && false;
	}
	catch(e){
		return e instanceof WebfocusAppError;
	}
}

function createComponent(){
	return createComponent_("Test Component", "Component used in the tests");
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
		let configuration = {port:8000, name: "Test", avalue: Math.random()};

		/*it('should be read-only', function(){
			let webfocusApp = new WebfocusApp(configuration);
			let old = webfocusApp.configuration.avalue;
			webfocusApp.configuration.avalue = -Math.random();
			assert(webfocusApp.configuration.avalue === old);
		})*/

		it('should contain an empty array of components', function(){
			let webfocusApp = new WebfocusApp(configuration);
			assert(
				Array.isArray(webfocusApp.configuration.components) &&
				webfocusApp.configuration.components.length == 0)
		})

		it('should be a superset of the recieved configuration', function(){
			let webfocusApp = new WebfocusApp(configuration);
			let pass = true;
			for(let key in configuration){
				pass = pass && key in webfocusApp.configuration && configuration[key] == webfocusApp.configuration[key];
			}
			assert(pass);
		})

		it('should save the component name', function(){
			let webfocusApp = new WebfocusApp(configuration);
			let component = createComponent();
			webfocusApp.registerComponent(component);
			assert(webfocusApp.configuration.components.findIndex(urlname => urlname == component.urlname) >= 0);
		})
	})

	describe("#... (other properties)", function(){
		let configuration = {port:0, name: "Test", avalue: Math.random()};
		it('should save a components dictionary', function(){
			let webfocusApp = new WebfocusApp(configuration);
			let component = createComponent();
			webfocusApp.registerComponent(component);
			assert(webfocusApp.components[component.urlname] == component);
		})

		describe("started status", function(){
			it('should not start', function(){
				let webfocusApp = new WebfocusApp();
				assert( !webfocusApp.started );
			})
			it('should start', function(){
				let webfocusApp = new WebfocusApp();
				let server = webfocusApp.start();
				assert( webfocusApp.started );

				server.close();
			})		
		})

		it("should define an express application", function(){
			let webfocusApp = new WebfocusApp();
			assert(webfocusApp.app);
		})

		it("should define an express middleware application", function(){
			let webfocusApp = new WebfocusApp();
			assert(webfocusApp.api);
		})
	})

	describe("#pubObj", function(){
		let configuration = {port:0, name: "Test", avalue: Math.random()};
		it("should contain the configuration", function(){
			let webfocusApp = new WebfocusApp(configuration);
			assert(webfocusApp.pugObj().configuration === webfocusApp.configuration);
		})

		it("should contain extra properties", function(){
			let properties = {a: "hello", b: "world"};
			let webfocusApp = new WebfocusApp(configuration);
			let obj = webfocusApp.pugObj(properties);
			let pass = true;
			for(let key in properties){
				pass = pass && key in obj && obj[key] === properties[key];
			}
			assert(pass);
		})
	})

	describe("#start", function(){

		it("should send json on the root", function(done){
			let configuration = { port: 0, name: "Test app" };
			let webfocusApp = new WebfocusApp(configuration);

			let server = webfocusApp.start();

			request(`http://localhost:${server.address().port}`)
				.get("/")
				.expect('Content-Type', /html/)
				.expect(200)
				.then(function(res){
					assert(res.text.match(configuration.name));
					server.close();
					done();
				})
		})

		it("should send json on the api", function(done){
			let configuration = { port: 0, name: "Test app" };
			let webfocusApp = new WebfocusApp(configuration);

			let server = webfocusApp.start();

			request(`http://localhost:${server.address().port}`)
				.get("/api/")
				.expect('Content-Type', /json/)
				.expect(200)
				.then(function(res){
					assert(Array.isArray(res.body) && res.body.length == 0)
					server.close();
					done();
				});
		})

	})

	describe("#... (methods)", function(){
		describe("registerComponent", function(){
			describe("without component", function(){
				it("should throw an error", function(){
					try{
						let webfocusApp = new WebfocusApp();
						webfocusApp.registerComponent();
						assert(false)
					}
					catch(e){
						assert(e instanceof WebfocusAppError)
					}
				})

				it("should throw an error", function(){
					try{
						let webfocusApp = new WebfocusApp();
						webfocusApp.registerComponent(0);
						assert(false)
					}
					catch(e){
						assert(e instanceof WebfocusAppError)
					}
				})
				it("should throw an error", function(){
					try{
						let webfocusApp = new WebfocusApp();
						webfocusApp.registerComponent({});
						assert(false)
					}
					catch(e){
						assert(e instanceof WebfocusAppError)
					}
				})
			})

			describe("with component", function(){
				it("should register component", function(){
					let webfocusApp = new WebfocusApp();
					let component = createComponent();
					webfocusApp.registerComponent(component);
					assert(webfocusApp.getComponent(component.urlname) === component);
				})

				it("should throw on repeated component", function(){
					let webfocusApp = new WebfocusApp();
					let component = createComponent();
					webfocusApp.registerComponent(component);
					try{
						webfocusApp.registerComponent(component);
						assert(false);
					}
					catch(e){
						assert(e instanceof WebfocusAppError);
					}
				})
			})

			describe("after application started", function(){
				it("should throw an error", function(){
					let webfocusApp = new WebfocusApp();
					let component = createComponent();
					let server = webfocusApp.start();
					try{
						webfocusApp.registerComponent(component);
						assert(false);
					}
					catch(e){
						assert(e instanceof WebfocusAppError);
					}
					finally{
						server.close();
					}
				})
			})
		})

		describe("getComponent", function(){
			it("should throw an error", function(){
				try{
					let webfocusApp = new WebfocusApp();
					webfocusApp.getComponent();
					assert(false);
				}
				catch(e){
					assert(e instanceof WebfocusAppError)
				}
			})
			it("should throw an error", function(){
				try{
					let webfocusApp = new WebfocusApp();
					webfocusApp.getComponent("");
					assert(false);
				}
				catch(e){
					assert(e instanceof WebfocusAppError)
				}
			})
			it("should return a component", function(){
				let webfocusApp = new WebfocusApp();
				let component = createComponent();
				webfocusApp.registerComponent(component)
				assert(webfocusApp.getComponent(component.urlname) === component)
			})
		})

		describe("getAllComponentNames", function(){
			it("should return an empty array", function(){
				let webfocusApp = new WebfocusApp();
				let a = webfocusApp.getAllComponentNames();
				assert(Array.isArray(a) && a.length == 0);
			})

			it("should contain the registered components' urlname", function(){
				let webfocusApp = new WebfocusApp();
				let component = createComponent();
				webfocusApp.registerComponent(component);
				assert(webfocusApp.getAllComponentNames().findIndex(urlname => urlname == component.urlname) >= 0);
			})
		})
	})
})
