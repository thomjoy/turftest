/* */ 
var linestring = require("turf-linestring");
var Spline = require("./spline");
module.exports = function(line, resolution, sharpness) {
  var lineOut = linestring([]);
  lineOut.properties = line.properties;
  var pts = line.geometry.coordinates.map(function(pt) {
    return {
      x: pt[0],
      y: pt[1]
    };
  });
  var spline = new Spline({
    points: pts,
    duration: resolution,
    sharpness: sharpness
  });
  for (var i = 0; i < spline.duration; i += 10) {
    var pos = spline.pos(i);
    if (Math.floor(i / 100) % 2 === 0) {
      lineOut.geometry.coordinates.push([pos.x, pos.y]);
    }
  }
  return lineOut;
};
