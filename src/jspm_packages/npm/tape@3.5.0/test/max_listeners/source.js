/* */ 
var test = require("../../index");
for (var i = 0; i < 11; i++) {
  test(function(t) {
    t.end();
  });
}
