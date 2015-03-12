/* */ 
global.extent = require("./index");
global.extent2 = require("./index-lazy-reduce");
var Benchmark = require("benchmark");
var fs = require("fs");
global.fc = require("./geojson/FeatureCollection");
global.pt = require("./geojson/Point");
global.line = require("./geojson/LineString");
global.poly = require("./geojson/Polygon");
global.multiLine = require("./geojson/MultiLineString");
global.multiPoly = require("./geojson/MultiPolygon");
var suite = new Benchmark.Suite('turf-extent');
suite.add('turf-extent#FeatureCollection', function() {
  global.extent(global.fc);
}).add('turf-extent2#FeatureCollection', function() {
  global.extent2(global.fc);
}).on('cycle', function(event) {
  console.log(String(event.target));
}).on('complete', function() {}).run();
