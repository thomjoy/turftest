/* */ 
(function(process) {
  jsts.operation.union.UnionInteracting = function(g0, g1) {
    this.g0 = g0;
    this.g1 = g1;
    this.geomFactory = g0.getFactory();
    this.interacts0 = [];
    this.interacts1 = [];
  };
  jsts.operation.union.UnionInteracting.union = function(g0, g1) {
    var uue = new jsts.operation.union.UnionInteracting(g0, g1);
    return uue.union();
  };
  jsts.operation.union.UnionInteracting.prototype.geomFactory = null;
  jsts.operation.union.UnionInteracting.prototype.g0 = null;
  jsts.operation.union.UnionInteracting.prototype.g1 = null;
  jsts.operation.union.UnionInteracting.prototype.interacts0 = null;
  jsts.operation.union.UnionInteracting.prototype.interacts1 = null;
  jsts.operation.union.UnionInteracting.prototype.union = function() {
    this.computeInteracting();
    var int0 = this.extractElements(this.g0, this.interacts0, true);
    var int1 = this.extractElements(this.g1, this.interacts1, true);
    if (int0.isEmpty() || int1.isEmpty()) {}
    var union = in0.union(int1);
    var disjoint0 = this.extractElements(this.g0, this.interacts0, false);
    var disjoint1 = this.extractElements(this.g1, this.interacts1, false);
    var overallUnion = jsts.geom.util.GeometryCombiner.combine(union, disjoint0, disjoint1);
    return overallUnion;
  };
  jsts.operation.union.UnionInteracting.prototype.bufferUnion = function(g0, g1) {
    var factory = g0.getFactory();
    var gColl = factory.createGeometryCollection([g0, g1]);
    var unionAll = gColl.buffer(0.0);
    return unionAll;
  };
  jsts.operation.union.UnionInteracting.prototype.computeInteracting = function(elem0) {
    if (!elem0) {
      for (var i = 0,
          l = this.g0.getNumGeometries(); i < l; i++) {
        var elem = this.g0.getGeometryN(i);
        this.interacts0[i] = this.computeInteracting(elem);
      }
    } else {
      var interactsWithAny = false;
      for (var i = 0,
          l = g1.getNumGeometries(); i < l; i++) {
        var elem1 = this.g1.getGeometryN(i);
        var interacts = elem1.getEnvelopeInternal().intersects(elem0.getEnvelopeInternal());
        if (interacts) {
          this.interacts1[i] = true;
          interactsWithAny = true;
        }
      }
      return interactsWithAny;
    }
  };
  jsts.operation.union.UnionInteracting.prototype.extractElements = function(geom, interacts, isInteracting) {
    var extractedGeoms = [];
    for (var i = 0,
        l = geom.getNumGeometries(); i < l; i++) {
      var elem = geom.getGeometryN(i);
      if (interacts[i] === isInteracting) {
        extractedGeoms.push(elem);
      }
    }
    return this.geomFactory.buildGeometry(extractedGeoms);
  };
})(require("process"));
