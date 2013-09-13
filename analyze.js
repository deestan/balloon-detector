var PNG = require('png-js');
var fs = require('fs');
var rgb2hsl = require('color-convert').rgb2hsl;

var width = 640;
var rowlen = width * 4;
var hue = 214;
var hueMin = 214 - 5;
var hueMax = 214 + 5;

var minMatches = 1500;
var maxMatches = 25000;

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

      var hsl = rgb2hsl(data[i], data[i+1], data[i+2]);
      if (hsl[0] > hueMin && hsl[0] < hueMax && hsl[1] > 50 && hsl[2] > 20) {
        x_sum += x;
        y_sum += y;
        matches += 1;
      }
    }
    
    if (!matches)
      return next(null, { balloon: false, x: 0, y: 0 });
    
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
