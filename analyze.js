var PNG = require('png-js');
var fs = require('fs');

var width = 640;
var rowlen = width * 4;

var minMatches = 8000;
var maxMatches = 82000;

function isMatch(r, g, b, a) {
  var z = r + g + b;
  var b_norm = b / z;
  return b_norm > 0.5;
}

module.exports = function detectBalloon(pngData, next) {
  var buffer = new Buffer(pngData, 'binary');
  var png = new PNG(buffer);
  png.decode(function(data) {
    var x_sum = 0;
    var y_sum = 0;
    var matches = 0;
    var height = data.length / rowlen;
    for (var i=0; i < data.length - 4; i += 4) {
      var x = Math.floor((i % rowlen) / 4);
      var y = Math.floor(i / rowlen);
      if (isMatch(data[i], data[i+1], data[i+2], data[i+3])) {
        x_sum += x;
        y_sum += y;
        matches += 1;
      }
    }
    var x_avg = x_sum / matches;
    var y_avg = y_sum / matches;
    var x_avg_rel = 1 - (2 * x_avg / width);
    var y_avg_rel = 1 - (2 * y_avg / height);
    
    next(null, {
      balloon: (matches > minMatches && matches < maxMatches),
      x: -x_avg_rel,
      y: y_avg_rel
    });
  });
};
