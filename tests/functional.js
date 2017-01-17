"use strict";
var stream = require("stream");
var path = require("path");
var assert = require("assert");
describe("Functional tests", function() {
    var inputStream = new stream.Readable();
    var outStream = new stream.Writable();
    var output = [];
    outStream._write = function(chunk, encoding, done) {
        output.push(chunk.toString());
        done();
    };
    var SitemapStream = require(path.join("..", "src", "stream"));
    var sitemapStream = new SitemapStream();
    inputStream.pipe(sitemapStream)
        .pipe(outStream);
    it("Return at least one url", function(done) {
        sitemapStream.on("end", function() {
            assert(output.length > 0);
            assert.equal(output[0].substring(0, 4),
                "http");
            done();
        });
    });
    inputStream.push("https://www.google.com/work/sitemap.xml");
    inputStream.push("https://www.sitemaps.org/sitemap.xml");
    // emit input end
    inputStream.push(null);
});
