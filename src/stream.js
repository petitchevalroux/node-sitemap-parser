"use strict";
var stream = require("stream");
var util = require("util");
var Duplex = stream.Duplex;
var Promise = require("bluebird");

function SitemapStream(options) {
    if (!(this instanceof SitemapStream)) {
        return new SitemapStream(options);
    }
    options = options || {};
    this.concurrency = options.concurrency ? options.concurrency : 2;
    this.Sitemapper = require("sitemapper");
    this.async = require("async");
    delete options.concurrency;
    Duplex.call(this, options);
    var self = this;
    self.queue = self.async.queue(
        function(sitemap, callback) {
            self.parse(sitemap)
                .then(function() {
                    callback();
                    return;
                })
                .catch(function(err) {
                    self.emit("error", new Error(
                        "Error parsing sitemap: %s",
                        sitemap, err));
                    callback(err);
                });
        },
        self.concurrency
    );
    this.urls = [];
}

/**
 * Call when sitemap are push in input 
 * @param {mixed} chunk
 * @param {type} enc
 * @param {type} cb
 * @returns {undefined}
 */
SitemapStream.prototype._write = function(chunk, enc, cb) {
    this.queue.push(typeof chunk === "string" ? chunk : chunk.toString());
    cb();
};

/**
 * Read urls extracted from sitemap
 * @returns {undefined}
 */
SitemapStream.prototype._read = function() {
    // We have nothing to read
    if (!this.urls.length) {
        // Nothing is processing, we end
        if (this.queue.idle()) {
            this.push(null);
        } else {
            // Something is processing, we push a new read at the end of the
            // event loop 
            var self = this;
            setImmediate(function() {
                self._read();
            });
        }
    } else {
        var stop = false;
        while (this.urls.length > 0 && !stop) {
            var chunk = this.urls.shift();
            stop = !this.push(chunk);
        }
    }
};

/**
 * Parse a sitemap
 * @param {string} url
 * @returns {Promise}
 */
SitemapStream.prototype.parse = function(url) {
    try {
        var self = this;
        var sitemap = new self.Sitemapper();
        return sitemap.fetch(url)
            .then(function(result) {
                result.sites.forEach(function(url) {
                    self.urls.push(url);
                });
                return result.sites.length;
            });
    } catch (err) {
        return new Promise(function(resolve, reject) {
            reject(err);
        });
    }
};

util.inherits(SitemapStream, Duplex);
module.exports = SitemapStream;
