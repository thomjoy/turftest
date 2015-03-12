/* */ 
var test = require("tape");
var ss = require("../src/simple_statistics");
test('cumulative_std_normal_probability', function(t) {
  test('wikipedia test example works', function(t) {
    for (var i = 0; i < ss.standard_normal_table.length; i++) {
      t.equal(ss.cumulative_std_normal_probability(0.4), 0.6554);
    }
    t.end();
  });
  t.end();
});
