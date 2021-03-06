/* */ 
var nearest = require("./index");
var Benchmark = require("benchmark");
var fs = require("fs");
var pt = JSON.parse(fs.readFileSync(__dirname + '/geojson/pt.geojson'));
var pts = JSON.parse(fs.readFileSync(__dirname + '/geojson/pts.geojson'));
var suite = new Benchmark.Suite('turf-nearest');
suite.add('turf-nearest', function() {
  nearest(pt, pts);
}).on('cycle', function(event) {
  console.log(String(event.target));
}).on('complete', function() {}).run();
