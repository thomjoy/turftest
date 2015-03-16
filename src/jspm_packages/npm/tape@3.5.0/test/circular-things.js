/* */ 
var tape = require("../index");
var tap = require("tap");
tap.test('circular test', function(assert) {
  var test = tape.createHarness({exit: false});
  var tc = tap.createConsumer();
  var rows = [];
  tc.on('data', function(r) {
    rows.push(r);
  });
  tc.on('end', function() {
    assert.same(rows, ["TAP version 13", "circular", {
      id: 1,
      ok: false,
      name: " should be equal",
      operator: "equal",
      expected: "{}",
      actual: '{ circular: [Circular] }'
    }, "tests 1", "pass  0", "fail  1"]);
    assert.end();
  });
  test.createStream().pipe(tc);
  test("circular", function(t) {
    t.plan(1);
    var circular = {};
    circular.circular = circular;
    t.equal(circular, {});
  });
});
