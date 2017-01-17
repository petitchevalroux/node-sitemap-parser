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
    var SitemapParser = require(path.join("..", "src", "parser"));
    var parser = new SitemapParser({
        "inStream": inputStream,
        "outStream": outStream
    });
    it("Return at least one url", function(done) {
        parser.on("end", function() {
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
