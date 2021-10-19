const assert = require('assert');
const request = require('supertest');
const WebfocusApp = require('../app');
let EventEmitter = require("events").EventEmitter

function createComponent(){
	// Fake stub component
	let c = new EventEmitter();
	c.urlname= "test-component";
	c.app = (req) => req.end();
	c.staticApp = (req) => req.end();
	return c;
}

describe("WebfocusApp", function(){
	describe("#constructor", function(){
		it("should return an webfocusApp instance on port 0",function(){
			const webfocusApp = new WebfocusApp();
			assert(
				webfocusApp instanceof WebfocusApp &&
				webfocusApp.configuration.port == 0);
		})
		it("should change the port property to 0", function(){
			const webfocusApp = new WebfocusApp({});
			assert(
				webfocusApp instanceof WebfocusApp &&
				webfocusApp.configuration.port == 0);
		})
		it("should change the port property to 0", function(){
			const webfocusApp = new WebfocusApp({port:-1});
			assert(
				webfocusApp instanceof WebfocusApp &&
				webfocusApp.configuration.port == 0);
		})
		it("should expect the port property to be integer", function(){
			const webfocusApp = new WebfocusApp({port: "something"});
			assert(
				webfocusApp instanceof WebfocusApp &&
				webfocusApp.configuration.port == 0);
		})
		it("should keep the port property", function(){
			const webfocusApp = new WebfocusApp({port:7000});
			assert(
				webfocusApp instanceof WebfocusApp &&
				webfocusApp.configuration.port == 7000);
		})
		
		it("should keep the name property", function(){
			let name = "Test app";
			const webfocusApp = new WebfocusApp({port:7000, name});
			assert(
				webfocusApp instanceof WebfocusApp &&
				webfocusApp.configuration.port === 7000 &&
				webfocusApp.configuration.name === name );
		})
	})

	describe("#configuration", function(){
		let configuration = {port:8000, name: "Test app", avalue: Math.random()};

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
		let configuration = {port:0, name: "Test app", avalue: Math.random()};
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
		let configuration = {port:0, name: "Test app", avalue: Math.random()};
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

		it("should send html on the root", function(done){
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

		it("should send fetch.js file", function(done){
			let configuration = { port: 0, name: "Test app" };
			let webfocusApp = new WebfocusApp(configuration);

			let server = webfocusApp.start();

			request(`http://localhost:${server.address().port}`)
				.get("/webfocus-static/js/fetch.js")
				//.expect('Content-Type', /javascript/)
				.expect(200)
				.then(function(res){
					assert(res.text.indexOf('requestJSON') != -1)
					server.close();
					done();

					console.log(res.text)
				})
		})
	})

	describe("#... (methods)", function(){
		describe("registerComponent", function(){
			context("without component", function(){
				it("should throw an error", function(){
					try{
						let webfocusApp = new WebfocusApp();
						webfocusApp.registerComponent();
						assert(false)
					}
					catch(e){
						assert(true)
					}
				})

				it("should throw an error", function(){
					try{
						let webfocusApp = new WebfocusApp();
						webfocusApp.registerComponent(0);
						assert(false)
					}
					catch(e){
						assert(true)
					}
				})
				it("should throw an error", function(){
					try{
						let webfocusApp = new WebfocusApp();
						webfocusApp.registerComponent({});
						assert(false)
					}
					catch(e){
						assert(true)
					}
				})
			})

			context("with component", function(){
				it("should register component", function(){
					let webfocusApp = new WebfocusApp();
					let component = createComponent();
					webfocusApp.registerComponent(component);
					assert(webfocusApp.getComponent(component.urlname) === component);
				})

				it("ignore repeated components", function(){
					let webfocusApp = new WebfocusApp();
					let component = createComponent();
					assert(
						webfocusApp.registerComponent(component) &&
						!webfocusApp.registerComponent(component));
				})
			})

			context("after application started", function(){
				it("should ignore component", function(){
					let webfocusApp = new WebfocusApp();
					let component = createComponent();
					let server = webfocusApp.start();
					assert(!webfocusApp.registerComponent(component));
					server.close();
				})
			})
		})

		describe("getComponent", function(){
			it("should be null", function(){
				let webfocusApp = new WebfocusApp();
				assert(webfocusApp.getComponent() === null);
			})
			it("should be null", function(){
				let webfocusApp = new WebfocusApp();
				assert(webfocusApp.getComponent("") === null);
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
