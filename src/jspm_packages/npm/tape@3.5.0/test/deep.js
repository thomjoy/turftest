/* */ 
var test = require("../index");
test('deep strict equal', function(t) {
  t.notDeepEqual([{a: '3'}], [{a: 3}]);
  t.end();
});
