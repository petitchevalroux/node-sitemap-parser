"use strict";
var stream = require("stream");
var path = require("path");
var assert = require("assert");
var sinon = require("sinon");
describe("Stream tests", function() {
    var toRestore = [];
    afterEach(function() {
        toRestore.forEach(function(r) {
            r.restore();
        });
    });
    var SitemapStream = require(path.join("..", "src", "stream"));
    it("Queue has the good concurrency", function(done) {
        var s = new SitemapStream({
            "concurrency": 4
        });
        assert.equal(s.queue.concurrency, 4);
        done();
    });
    it("Emit error when an error occured while parsing", function(done) {
        var inputStream = new stream.Readable();
        var s = new SitemapStream();
        toRestore.push(sinon.stub(s, "Sitemapper",
            function() {
                throw new Error("test error");
            }));
        s.on("error", function(error) {
            assert(error instanceof Error);
            done();
        });
        inputStream.pipe(s)
            .pipe(new stream.Writable());
        inputStream.push(
            "https://www.google.com/work/sitemap.xml");
        inputStream.push(null);
    });

    it("Return an instance of stream without new", function(done) {
        var s = SitemapStream();
        assert(s instanceof SitemapStream);
        done();
    });

});
