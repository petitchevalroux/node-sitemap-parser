"use strict";
var stream = require("stream");
var path = require("path");
var assert = require("assert");
var sinon = require("sinon");
describe("Unit tests", function() {
    var toRestore = [];
    afterEach(function() {
        toRestore.forEach(function(r) {
            r.restore();
        });
    });
    var SitemapParser = require(path.join("..", "src", "parser"));
    it("Queue has the good concurrency", function(done) {
        var parser = new SitemapParser({
            "inStream": new stream.Readable(),
            "outStream": new stream.Writable(),
            "concurrency": 4
        });
        assert.equal(parser.queue.concurrency, 4);
        done();
    });

    it("Emit end when queue is idle and in stream emit end", function(
        done) {
        var inputStream = new stream.Readable();
        var parser = new SitemapParser({
            "inStream": inputStream,
            "outStream": new stream.Writable()
        });
        parser.on("end", function() {
            done();
        });
        inputStream.push(null);
    });

    it("Emit error when an error occured while parsing", function(done) {
        var inputStream = new stream.Readable();
        var parser = new SitemapParser({
            "inStream": inputStream,
            "outStream": new stream.Writable()
        });
        toRestore.push(sinon.stub(parser, "Sitemapper",
            function() {
                throw new Error("test error");
            }));
        parser.on("error", function(error) {
            assert(error instanceof Error);
            done();
        });
        inputStream.push(
            "https://www.google.com/work/sitemap.xml");
        inputStream.push(null);
    });
});
