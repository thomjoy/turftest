/* */ 
var jsts = require("../../index");
var factory = new jsts.geom.GeometryFactory();
var show = require("./show");
function coord(x, y) {
  return new jsts.geom.Coordinate(x, y);
}
function linstr(coords) {
  return factory.createLineString(coords);
}
function linring(coords) {
  return factory.createLinearRing(coords);
}
function polygon(coords, holes) {
  return factory.createPolygon(linring(coords), holes);
}
var a = polygon([coord(0, 0), coord(0, 10), coord(10, 10), coord(10, 0), coord(0, 0)]);
var b = polygon([coord(5, 5), coord(10, 10), coord(5, 15), coord(0, 10), coord(5, 5)]);
var c = linstr([coord(3, 0), coord(3, 10)]);
show("a", a);
show("b", b);
show("c", c);
show("a.centroid", a.getCentroid());
show("b.centroid", b.getCentroid());
show("c.centroid", c.getCentroid());
show("a.dimension", a.getDimension());
show("b.dimension", b.getDimension());
show("c.dimension", c.getDimension());
show("a.type", a.getGeometryType());
show("b.type", b.getGeometryType());
show("c.type", c.getGeometryType());
show("a.length", a.getLength());
show("b.length", b.getLength());
show("c.length", c.getLength());
show("a.area", a.getArea());
show("b.area", b.getArea());
show("a.envelope", a.getEnvelope());
show("b.envelope", b.getEnvelope());
show("c.envelope", c.getEnvelope());
show("a.envelope.area", a.getEnvelope().getArea());
show("b.envelope.area", b.getEnvelope().getArea());
