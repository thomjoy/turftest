/* */ 
var tin = require("turf-tin");
var inside = require("turf-inside");
var grid = require("turf-grid");
var extent = require("turf-extent");
var planepoint = require("turf-planepoint");
var featurecollection = require("turf-featurecollection");
var linestring = require("turf-linestring");
var square = require("turf-square");
var Conrec = require("./conrec");
module.exports = function(points, z, resolution, breaks, done) {
  var tinResult = tin(points, z);
  var extentBBox = extent(points);
  var squareBBox = square(extentBBox);
  var gridResult = grid(squareBBox, resolution);
  var data = [];
  for (var i = 0; i < gridResult.features.length; i++) {
    var pt = gridResult.features[i];
    for (var j = 0; j < tinResult.features.length; j++) {
      var triangle = tinResult.features[j];
      if (inside(pt, triangle)) {
        pt.properties = {};
        pt.properties[z] = planepoint(pt, triangle);
      }
    }
  }
  var depth = Math.sqrt(gridResult.features.length);
  for (var x = 0; x < depth; x++) {
    var xGroup = gridResult.features.slice(x * depth, (x + 1) * depth);
    var xFlat = [];
    xGroup.forEach(function(verticalPoint) {
      if (verticalPoint.properties) {
        xFlat.push(verticalPoint.properties[z]);
      } else {
        xFlat.push(0);
      }
    });
    data.push(xFlat);
  }
  var interval = (squareBBox[2] - squareBBox[0]) / depth;
  var xCoordinates = [];
  var yCoordinates = [];
  for (var x = 0; x < depth; x++) {
    xCoordinates.push(x * interval + squareBBox[0]);
    yCoordinates.push(x * interval + squareBBox[1]);
  }
  var c = new Conrec();
  c.contour(data, 0, resolution, 0, resolution, xCoordinates, yCoordinates, breaks.length, breaks);
  var contourList = c.contourList();
  var fc = featurecollection([]);
  contourList.forEach(function(c) {
    if (c.length > 2) {
      var polyCoordinates = [];
      c.forEach(function(coord) {
        polyCoordinates.push([coord.x, coord.y]);
      });
      var poly = linestring(polyCoordinates);
      poly.properties = {};
      poly.properties[z] = c.level;
      fc.features.push(poly);
    }
  });
  return fc;
};
