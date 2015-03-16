/* */ 
var test = require("tape");
var turf = require("./index");
test('turf', function(t) {
  t.ok(turf, 'Initialized turf successfully');
  Object.keys(turf).forEach(function(module) {
    t.ok(turf[module], module);
    t.equal(typeof turf[module], 'function', module + ' is a function');
  });
  t.end();
});
