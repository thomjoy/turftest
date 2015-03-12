/* */ 
var test = require("tape");
var ss = require("../src/simple_statistics");
function rnd(x) {
  return Math.round(x * 1000) / 1000;
}
test('standard_deviation', function(t) {
  test('can get the standard deviation of an example on wikipedia', function(t) {
    t.equal(rnd(ss.standard_deviation([2, 4, 4, 4, 5, 5, 7, 9])), 2);
    t.end();
  });
  test('can get the standard deviation of 1-3', function(t) {
    t.equal(rnd(ss.standard_deviation([1, 2, 3])), 0.816);
    t.end();
  });
  test('zero-length array corner case', function(t) {
    t.equal(rnd(ss.standard_deviation([])), 0);
    t.end();
  });
  test('can get the standard deviation of 1-10', function(t) {
    t.equal(rnd(ss.standard_deviation([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])), 3.162);
    t.end();
  });
  test('the standard deviation of one number is zero', function(t) {
    t.equal(rnd(ss.standard_deviation([1])), 0);
    t.end();
  });
  t.end();
});
