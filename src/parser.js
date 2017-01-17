"use strict";
var util = require("util");
var EventEmitter = require("events");
var Error = require("@petitchevalroux/error");
var Promise = require("bluebird");

var Parser = function(options) {
    this.concurrency = options.concurrency ? options.concurrency : 2;
    this.Sitemapper = require("sitemapper");
    this.async = require("async");
    this.inStream = options.inStream;
    this.outStream = options.outStream;
    var self = this;
    this.queue = self.async.queue(
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
    self.inStream.on("data", function(data) {
        self.queue.push(Buffer.isBuffer(data) ? data.toString() :
            data);
    });
    self.inStream.on("end", function() {
        if (self.queue.idle()) {
            self.emit("end");
        } else {
            self.queue.drain = function() {
                self.emit("end");
            };
        }
    });
};

/**
 * Parse a sitemap
 * @param {string} url
 * @returns {Promise}
 */
Parser.prototype.parse = function(url) {
    try {
        var self = this;
        var sitemap = new self.Sitemapper();
        return sitemap.fetch(url)
            .then(function(result) {
                result.sites.forEach(function(url) {
                    self.outStream.write(url);
                });
                return result.sites.length;
            });
    } catch (err) {
        return new Promise(function(resolve, reject) {
            reject(err);
        });
    }
};

util.inherits(Parser, EventEmitter);
module.exports = Parser;
