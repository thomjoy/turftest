/* */ 
var combine = require("./index");
var Benchmark = require("benchmark");
var fs = require("fs");
var point = require("turf-point");
var linestring = require("turf-linestring");
var polygon = require("turf-polygon");
var featurecollection = require("turf-featurecollection");
var pt1 = point(50, 51);
var pt2 = point(100, 101);
var l1 = linestring([[102.0, -10.0], [130.0, 4.0]]);
var l2 = linestring([[40.0, -20.0], [150.0, 18.0]]);
var p1 = polygon([[[20.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]]);
var p2 = polygon([[[30.0, 0.0], [102.0, 0.0], [103.0, 1.0]]]);
var suite = new Benchmark.Suite('turf-combine');
suite.add('turf-combine#point', function() {
  combine(featurecollection([pt1, pt2]));
}).add('turf-combine#line', function() {
  combine(featurecollection([l1, l2]));
}).add('turf-combine#polygon', function() {
  combine(featurecollection([p1, p2]));
}).on('cycle', function(event) {
  console.log(String(event.target));
}).on('complete', function() {}).run();
