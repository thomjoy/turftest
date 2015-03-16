/* */ 
var test = require("tape");
var ss = require("../src/simple_statistics");
test('natural distribution and z-score', function(t) {
  test('normal table is exposed in the API', function(t) {
    t.equal(ss.standard_normal_table.length, 310);
    t.equal(ss.standard_normal_table[0], 0.5);
    t.end();
  });
  test('P(Z <= 0.4) is 0.6554', function(t) {
    t.equal(ss.cumulative_std_normal_probability(0.4), 0.6554);
    t.end();
  });
  test('P(Z <= -1.20) is 0.1151', function(t) {
    t.equal(ss.cumulative_std_normal_probability(-1.20), 0.1151);
    t.end();
  });
  test('P(X <= 82) when X ~ N (80, 25) is 0.6554', function(t) {
    t.equal(ss.cumulative_std_normal_probability(ss.z_score(82, 80, 5)), 0.6554);
    t.end();
  });
  test('P(X >= 90) when X ~ N (80, 25) is 0.0228', function(t) {
    t.equal(+(1 - ss.cumulative_std_normal_probability(ss.z_score(90, 80, 5))).toPrecision(5), 0.0228);
    t.end();
  });
  test('P(X <= 74) when X ~ N (80, 25) is 0.1151', function(t) {
    t.equal(ss.cumulative_std_normal_probability(ss.z_score(74, 80, 5)), 0.1151);
    t.end();
  });
  test('P(78 <= X <= 88) when X ~ N (80, 25) is 0.6006', function(t) {
    var prob88 = ss.cumulative_std_normal_probability(ss.z_score(88, 80, 5)),
        prob78 = ss.cumulative_std_normal_probability(ss.z_score(78, 80, 5));
    t.equal(+(prob88 - prob78).toPrecision(5), 0.6006);
    t.end();
  });
  t.end();
});
