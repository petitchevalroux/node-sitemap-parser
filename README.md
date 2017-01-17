# node-sitemap-parser
NodeJS sitemap parser using stream as input and output.

## Install
```
npm install --save "@petitchevalroux/sitemap-parser"
```

## Usage
```javascript
var stream = require("stream");
var process = require("process");
var inputStream = new stream.Readable();
var SitemapParser = require("@petitchevalroux/sitemap-parser");
var parser = new SitemapParser({
    "inStream": inputStream,
    "outStream": process.stdout
});
// error event is emitted if an error occured on parsing
parser.on("error", function (err) {
    console.log(err);
});
// end event is emitted when every sitemap are parsed
parser.on("end", function () {
    console.log("end");
});
inputStream.push('https://www.google.com/work/sitemap.xml');
inputStream.push('https://www.sitemaps.org/sitemap.xml');
// emit input end
inputStream.push(null);
```
