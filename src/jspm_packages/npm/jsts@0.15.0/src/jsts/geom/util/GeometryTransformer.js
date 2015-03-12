/* */ 
(function(process) {
  (function() {
    var ArrayList = javascript.util.ArrayList;
    var GeometryTransformer = function() {};
    GeometryTransformer.prototype.inputGeom = null;
    GeometryTransformer.prototype.factory = null;
    GeometryTransformer.prototype.pruneEmptyGeometry = true;
    GeometryTransformer.prototype.preserveGeometryCollectionType = true;
    GeometryTransformer.prototype.preserveCollections = false;
    GeometryTransformer.prototype.reserveType = false;
    GeometryTransformer.prototype.getInputGeometry = function() {
      return this.inputGeom;
    };
    GeometryTransformer.prototype.transform = function(inputGeom) {
      this.inputGeom = inputGeom;
      this.factory = inputGeom.getFactory();
      if (inputGeom instanceof jsts.geom.Point)
        return this.transformPoint(inputGeom, null);
      if (inputGeom instanceof jsts.geom.MultiPoint)
        return this.transformMultiPoint(inputGeom, null);
      if (inputGeom instanceof jsts.geom.LinearRing)
        return this.transformLinearRing(inputGeom, null);
      if (inputGeom instanceof jsts.geom.LineString)
        return this.transformLineString(inputGeom, null);
      if (inputGeom instanceof jsts.geom.MultiLineString)
        return this.transformMultiLineString(inputGeom, null);
      if (inputGeom instanceof jsts.geom.Polygon)
        return this.transformPolygon(inputGeom, null);
      if (inputGeom instanceof jsts.geom.MultiPolygon)
        return this.transformMultiPolygon(inputGeom, null);
      if (inputGeom instanceof jsts.geom.GeometryCollection)
        return this.transformGeometryCollection(inputGeom, null);
      throw new jsts.error.IllegalArgumentException('Unknown Geometry subtype: ' + inputGeom.getClass().getName());
    };
    GeometryTransformer.prototype.createCoordinateSequence = function(coords) {
      return this.factory.getCoordinateSequenceFactory().create(coords);
    };
    GeometryTransformer.prototype.copy = function(seq) {
      return seq.clone();
    };
    GeometryTransformer.prototype.transformCoordinates = function(coords, parent) {
      return this.copy(coords);
    };
    GeometryTransformer.prototype.transformPoint = function(geom, parent) {
      return this.factory.createPoint(this.transformCoordinates(geom.getCoordinateSequence(), geom));
    };
    GeometryTransformer.prototype.transformMultiPoint = function(geom, parent) {
      var transGeomList = new ArrayList();
      for (var i = 0; i < geom.getNumGeometries(); i++) {
        var transformGeom = this.transformPoint(geom.getGeometryN(i), geom);
        if (transformGeom == null)
          continue;
        if (transformGeom.isEmpty())
          continue;
        transGeomList.add(transformGeom);
      }
      return this.factory.buildGeometry(transGeomList);
    };
    GeometryTransformer.prototype.transformLinearRing = function(geom, parent) {
      var seq = this.transformCoordinates(geom.getCoordinateSequence(), geom);
      var seqSize = seq.length;
      if (seqSize > 0 && seqSize < 4 && !this.preserveType)
        return this.factory.createLineString(seq);
      return this.factory.createLinearRing(seq);
    };
    GeometryTransformer.prototype.transformLineString = function(geom, parent) {
      return this.factory.createLineString(this.transformCoordinates(geom.getCoordinateSequence(), geom));
    };
    GeometryTransformer.prototype.transformMultiLineString = function(geom, parent) {
      var transGeomList = new ArrayList();
      for (var i = 0; i < geom.getNumGeometries(); i++) {
        var transformGeom = this.transformLineString(geom.getGeometryN(i), geom);
        if (transformGeom == null)
          continue;
        if (transformGeom.isEmpty())
          continue;
        transGeomList.add(transformGeom);
      }
      return this.factory.buildGeometry(transGeomList);
    };
    GeometryTransformer.prototype.transformPolygon = function(geom, parent) {
      var isAllValidLinearRings = true;
      var shell = this.transformLinearRing(geom.getExteriorRing(), geom);
      if (shell == null || !(shell instanceof jsts.geom.LinearRing) || shell.isEmpty())
        isAllValidLinearRings = false;
      var holes = new ArrayList();
      for (var i = 0; i < geom.getNumInteriorRing(); i++) {
        var hole = this.transformLinearRing(geom.getInteriorRingN(i), geom);
        if (hole == null || hole.isEmpty()) {
          continue;
        }
        if (!(hole instanceof jsts.geom.LinearRing))
          isAllValidLinearRings = false;
        holes.add(hole);
      }
      if (isAllValidLinearRings)
        return this.factory.createPolygon(shell, holes.toArray());
      else {
        var components = new ArrayList();
        if (shell != null)
          components.add(shell);
        components.addAll(holes);
        return this.factory.buildGeometry(components);
      }
    };
    GeometryTransformer.prototype.transformMultiPolygon = function(geom, parent) {
      var transGeomList = new ArrayList();
      for (var i = 0; i < geom.getNumGeometries(); i++) {
        var transformGeom = this.transformPolygon(geom.getGeometryN(i), geom);
        if (transformGeom == null)
          continue;
        if (transformGeom.isEmpty())
          continue;
        transGeomList.add(transformGeom);
      }
      return this.factory.buildGeometry(transGeomList);
    };
    GeometryTransformer.prototype.transformGeometryCollection = function(geom, parent) {
      var transGeomList = new ArrayList();
      for (var i = 0; i < geom.getNumGeometries(); i++) {
        var transformGeom = this.transform(geom.getGeometryN(i));
        if (transformGeom == null)
          continue;
        if (this.pruneEmptyGeometry && transformGeom.isEmpty())
          continue;
        transGeomList.add(transformGeom);
      }
      if (this.preserveGeometryCollectionType)
        return this.factory.createGeometryCollection(GeometryFactory.toGeometryArray(transGeomList));
      return this.factory.buildGeometry(transGeomList);
    };
    jsts.geom.util.GeometryTransformer = GeometryTransformer;
  })();
})(require("process"));
