/* */ 
var tag = require("./index");
var Benchmark = require("benchmark");
var fs = require("fs");
var points = JSON.parse(fs.readFileSync('./geojson/tagPoints.geojson'));
var polygons = JSON.parse(fs.readFileSync('./geojson/tagPolygons.geojson'));
var suite = new Benchmark.Suite('turf-tag');
suite.add('turf-tag', function() {
  tag(points, polygons, 'polyID', 'containingPolyID');
}).on('cycle', function(event) {
  console.log(String(event.target));
}).on('complete', function() {}).run();
