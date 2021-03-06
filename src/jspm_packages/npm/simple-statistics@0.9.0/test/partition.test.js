/* */ 
var test = require("tape");
var ss = require("../src/simple_statistics");
test('partition', function(t) {
  test('corner cases', function(t) {
    t.deepEqual(ss.partition([], 1), null);
    t.deepEqual(ss.partition([1], 1), [[1]]);
    t.deepEqual(ss.partition([1, 2], 1), [[1, 2]]);
    t.deepEqual(ss.partition([1, 2, 3], 1), [[1, 2, 3]]);
    t.end();
  });
  test('splits', function(t) {
    t.deepEqual(ss.partition([1, 2], 2), [[1], [2]]);
    t.deepEqual(ss.partition([1, 2, 3], 2), [[1, 2], [3]]);
    t.deepEqual(ss.partition([1, 2, 3, 4], 2), [[1, 2], [3, 4]]);
    t.deepEqual(ss.partition([1, 2, 3, 4, 5], 2), [[1, 2, 3], [4, 5]]);
    t.end();
  });
  test('triples', function(t) {
    t.deepEqual(ss.partition([1, 2], 3), [[1], [2]]);
    t.deepEqual(ss.partition([1, 2, 3], 3), [[1], [2], [3]]);
    t.deepEqual(ss.partition([1, 2, 3, 4, 5], 3), [[1, 2], [3, 4], [5]]);
    t.end();
  });
  t.end();
});
