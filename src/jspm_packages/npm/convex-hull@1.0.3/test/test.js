/* */ 
'use strict';
var tape = require("tape");
var hull = require("../ch");
tape('convex-hull', function(t) {
  t.same(hull([[0, 0], [1, 0], [2, 0]]), []);
  t.same(hull([[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 0], [2, 3, 0]]), []);
  console.log(hull([[0, 0, 0], [0, 1, 0], [1, 0, 0], [0.5, 0.5, 0], [1, 1, 0], [0.5, 0.5, 1]]));
  t.end();
});
