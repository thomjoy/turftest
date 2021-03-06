/* */ 
var jsts = require("../../index");
var show = require("./show");
var reader = new jsts.io.WKTReader();
var a = reader.read('POLYGON((0 0, 0 10, 10 10, 10 0, 0 0))');
var b = reader.read('POLYGON((5 5, 5 20, 20 20, 20 5, 5 5))');
var c = reader.read('POLYGON((15 15, 15 20, 20 20, 20 15, 15 15))');
var d = reader.read('POLYGON((5 5, 10 10, 5 15, 0 10, 5 5))');
show("a", a);
show("b", b);
show("c", c);
show("d", d);
console.log(a.intersects(b) ? "a intersects b" : "a does not intersect b");
var a_intersection_b = a.intersection(b);
show("a ^ b", a_intersection_b);
var e = reader.read('POLYGON((5 5, 5 10, 10 10, 10 5, 5 5))');
show("e", e);
show("a^b equalsExact e", a_intersection_b.equalsExact(e));
show("a^b equalsTopo  e", a_intersection_b.equalsTopo(e));
a_intersection_b = a_intersection_b.norm();
e = e.norm();
show("a^b normalized", a_intersection_b);
show("e normalized", e);
show("a^b normalized equalsExact e normalized", a_intersection_b.equalsExact(e));
console.log(a.intersects(c) ? "a intersects c" : "a does not intersect c");
show("a ^ c", a.intersection(c));
console.log(a.intersects(d) ? "a intersects d" : "a does not intersect d");
show("a ^ d", a.intersection(d));
show("a U b", a.union(b));
show("a U c", a.union(c));
show("a U d", a.union(d));
