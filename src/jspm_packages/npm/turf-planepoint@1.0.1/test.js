/* */ 
var test = require("tape");
var fs = require("fs");
var planepoint = require("./index");
test('planepoint', function(t) {
  var triangle = JSON.parse(fs.readFileSync(__dirname + '/geojson/Triangle.geojson'));
  var point = {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [-75.3221, 39.529]
    }
  };
  var z = planepoint(point, triangle);
  t.ok(z, 'should return the z value of a point on a plane');
  t.end();
});
