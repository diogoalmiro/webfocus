const request = require("supertest");
const assert = require("assert");
const WebfocusApp = require("../app");
const createComponent = require("../component");

const startValue = Math.random();

function testComponent(){
    let component = createComponent("Test Component", "Component used in mocha tests");
    let avalue = startValue;
    component.app.get("/", (req, res) => {
        res.json({avalue})
    })

    component.app.put("/", (req, res) => {
        avalue = req.body.avalue;
        res.json({avalue})
    })

    component.app.post("/", (req, res, next) => {
        next(new Error("Some random error"));
    })

    return component;
}
describe("Test application", function(){
    let configuration = { port: 0, name: "Test Application"};
    let webfocusApp = new WebfocusApp(configuration);
    let component = testComponent();
    webfocusApp.registerComponent(component);

    let server = webfocusApp.start();
    let baseurl = `http://localhost:${server.address().port}`;
    let apipath = `/api/${component.urlname}/`;

    let newValue = -Math.random();

    it("should read the api start value", function(done){
        request(baseurl)
            .get(apipath)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                assert(res.body.avalue == startValue)
                done()
            })
    })

    it("should update the api value", function(done){
        request(baseurl)
            .put(apipath)
            .send({avalue:newValue})
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res){
                assert(res.body.avalue == newValue);
                done();
            })
    })

    it("should persist new value", function(done){
        request(baseurl)
            .get(apipath)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                assert(res.body.avalue == newValue)
                done()
            })
    })

    it("should return 404 on not found api paths", function(done){
        request(baseurl)
            .del(apipath)
            .expect('Content-Type', /json/)
            .expect(404)
            .end(function(err, res){
                done()
            })  
    })

    it("should return 500 on errors", function(done){
        request(baseurl)
            .post(apipath)
            .expect('Content-Type', /json/)
            .expect(500)
            .end(function(err, res){
                assert("error" in res.body);
                done()
            })  
    })

    it("should return component pug files", function(done){
        request(baseurl)
            .get(`/${component.urlname}/`)
            .expect('Content-Type', /html/)
            .expect(200)
            .end(function(err, res){
                assert(res.text.match("Index test pug file"))
                done()
            })
    })

    it("should return static files", function(done){
        request(baseurl)
            .get(`/${component.urlname}/index.txt`)
            .expect('Content-Type', /text/)
            .expect(200)
            .end(function(err, res){
                assert(res.text.match("Index test txt file"))
                done()
            })
    })

    it("should return 404 not found component paths", function(done){
        request(baseurl)
            .get(`/${component.urlname}/random-big-name.css`)
            .expect('Content-Type', /text/)
            .expect(404)
            .end(function(err, res){
                done()
            })
    })
    after(function(){
        server.close();
    })
})