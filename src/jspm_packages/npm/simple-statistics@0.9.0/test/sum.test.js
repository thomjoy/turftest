/* */ 
var test = require("tape");
var ss = require("../src/simple_statistics");
test('sum', function(t) {
  test('can get the sum of two numbers', function(t) {
    t.equal(ss.sum([1, 2]), 3);
    t.end();
  });
  test('the sum of no numbers is zero', function(t) {
    t.equal(ss.sum([]), 0);
    t.end();
  });
  t.end();
});
