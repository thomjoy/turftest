/* */ 
var test = require("../index");
test('plan should be optional', function(t) {
  t.pass('no plan here');
  t.end();
});
test('no plan async', function(t) {
  setTimeout(function() {
    t.pass('ok');
    t.end();
  }, 100);
});
