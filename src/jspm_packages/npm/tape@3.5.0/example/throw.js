/* */ 
var falafel = require("falafel");
var test = require("../index");
test('throw', function(t) {
  t.plan(2);
  setTimeout(function() {
    throw new Error('doom');
  }, 100);
});
