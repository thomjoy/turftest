/* */ 
var envelope = require("./index");
var Benchmark = require("benchmark");
var fs = require("fs");
var fixture = require("./geojson/fc");
var suite = new Benchmark.Suite('turf-envelope');
suite.add('turf-envelope', function() {
  envelope(fixture);
}).on('cycle', function(event) {
  console.log(String(event.target));
}).on('complete', function() {}).run();
