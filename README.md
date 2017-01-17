# node-sitemap-parser
NodeJS sitemap parser using a duplex stream.

## Install
```
npm install --save "@petitchevalroux/sitemap-parser"
```

## Usage
```javascript
var stream = require("stream");
var process = require("process");
var inputStream = new stream.Readable();
var SitemapStream = require("@petitchevalroux/sitemap-parser");
var sitemapStream = new SitemapStream();
// error event is emitted if an error occured on parsing
sitemapStream.on("error", function (err) {
    console.log(err);
});
// end event is emitted when all sitemaps are parsed
sitemapStream.on("end", function () {
    console.log("end");
});
inputStream.pipe(sitemapStream).pipe(process.stdout);
inputStream.push('https://www.google.com/work/sitemap.xml');
inputStream.push('https://www.sitemaps.org/sitemap.xml');
// emit input end
inputStream.push(null);
```
