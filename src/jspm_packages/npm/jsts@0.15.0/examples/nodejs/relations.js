/* */ 
var jsts = require("../../index");
var reader = new jsts.io.WKTReader();
function booleanRelationToString(shape1, shape2, relationName) {
  var relationHolds = shape1[relationName](shape2);
  if (relationHolds) {
    return relationName + "s";
  } else {
    return "does not " + relationName;
  }
}
var reference = reader.read('POLYGON((0 0, 0 10, 10 10, 10 0, 0 0))');
var others = {};
others.internalPoint = reader.read("POINT(7 7)");
others.boundaryPoint = reader.read("POINT(10 5)");
others.externalPoint = reader.read("POINT(11 11)");
others.farawaySquare = reader.read('POLYGON((20 20, 20 30, 30 30, 30 20, 20 20))');
others.cornerSquare = reader.read('POLYGON((10 10, 10 30, 30 30, 30 10, 10 10))');
others.sideSquare = reader.read('POLYGON((10 0, 10 30, 30 30, 30 0, 10 0))');
others.overlappingSquare = reader.read('POLYGON((5 5, 5 20, 20 20, 20 5, 5 5))');
var relations = ["disjoint", "touches", "intersects", "within", "contains", "overlaps", "relate"];
for (var p in others) {
  console.log("\n" + p + "\n-----------------\n");
  var point = others[p];
  for (var r in relations) {
    var relation = relations[r];
    console.log("reference." + relation + "(" + p + ") = " + reference[relation](point));
    console.log(p + "." + relation + "(reference) = " + point[relation](reference));
  }
}
