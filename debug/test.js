var analyze = require('../analyze');
var fs = require('fs');

var filePath = process.argv[2];
if (!filePath)
  console.log("Usage example: node test.js just-right.png");
else {
  var b = fs.readFileSync(filePath, { encoding: 'binary' });
  var png = '' + b;
  analyze(png, function(err, data) {
    console.log(data);
  });
}
