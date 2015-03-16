/* */ 
(function(Buffer, process) {
  jsts.geom.Geometry = function(factory) {
    this.factory = factory;
  };
  jsts.geom.Geometry.prototype.envelope = null;
  jsts.geom.Geometry.prototype.factory = null;
  jsts.geom.Geometry.prototype.getGeometryType = function() {
    return 'Geometry';
  };
  jsts.geom.Geometry.hasNonEmptyElements = function(geometries) {
    var i;
    for (i = 0; i < geometries.length; i++) {
      if (!geometries[i].isEmpty()) {
        return true;
      }
    }
    return false;
  };
  jsts.geom.Geometry.hasNullElements = function(array) {
    var i;
    for (i = 0; i < array.length; i++) {
      if (array[i] === null) {
        return true;
      }
    }
    return false;
  };
  jsts.geom.Geometry.prototype.getFactory = function() {
    if (this.factory === null || this.factory === undefined) {
      this.factory = new jsts.geom.GeometryFactory();
    }
    return this.factory;
  };
  jsts.geom.Geometry.prototype.getNumGeometries = function() {
    return 1;
  };
  jsts.geom.Geometry.prototype.getGeometryN = function(n) {
    return this;
  };
  jsts.geom.Geometry.prototype.getPrecisionModel = function() {
    return this.getFactory().getPrecisionModel();
  };
  jsts.geom.Geometry.prototype.getCoordinate = function() {
    throw new jsts.error.AbstractMethodInvocationError();
  };
  jsts.geom.Geometry.prototype.getCoordinates = function() {
    throw new jsts.error.AbstractMethodInvocationError();
  };
  jsts.geom.Geometry.prototype.getNumPoints = function() {
    throw new jsts.error.AbstractMethodInvocationError();
  };
  jsts.geom.Geometry.prototype.isSimple = function() {
    this.checkNotGeometryCollection(this);
    var op = new jsts.operation.IsSimpleOp(this);
    return op.isSimple();
  };
  jsts.geom.Geometry.prototype.isValid = function() {
    var isValidOp = new jsts.operation.valid.IsValidOp(this);
    return isValidOp.isValid();
  };
  jsts.geom.Geometry.prototype.isEmpty = function() {
    throw new jsts.error.AbstractMethodInvocationError();
  };
  jsts.geom.Geometry.prototype.distance = function(g) {
    return jsts.operation.distance.DistanceOp.distance(this, g);
  };
  jsts.geom.Geometry.prototype.isWithinDistance = function(geom, distance) {
    var envDist = this.getEnvelopeInternal().distance(geom.getEnvelopeInternal());
    if (envDist > distance) {
      return false;
    }
    return DistanceOp.isWithinDistance(this, geom, distance);
  };
  jsts.geom.Geometry.prototype.isRectangle = function() {
    return false;
  };
  jsts.geom.Geometry.prototype.getArea = function() {
    return 0.0;
  };
  jsts.geom.Geometry.prototype.getLength = function() {
    return 0.0;
  };
  jsts.geom.Geometry.prototype.getCentroid = function() {
    if (this.isEmpty()) {
      return null;
    }
    var cent;
    var centPt = null;
    var dim = this.getDimension();
    if (dim === 0) {
      cent = new jsts.algorithm.CentroidPoint();
      cent.add(this);
      centPt = cent.getCentroid();
    } else if (dim === 1) {
      cent = new jsts.algorithm.CentroidLine();
      cent.add(this);
      centPt = cent.getCentroid();
    } else {
      cent = new jsts.algorithm.CentroidArea();
      cent.add(this);
      centPt = cent.getCentroid();
    }
    return this.createPointFromInternalCoord(centPt, this);
  };
  jsts.geom.Geometry.prototype.getInteriorPoint = function() {
    var intPt;
    var interiorPt = null;
    var dim = this.getDimension();
    if (dim === 0) {
      intPt = new jsts.algorithm.InteriorPointPoint(this);
      interiorPt = intPt.getInteriorPoint();
    } else if (dim === 1) {
      intPt = new jsts.algorithm.InteriorPointLine(this);
      interiorPt = intPt.getInteriorPoint();
    } else {
      intPt = new jsts.algorithm.InteriorPointArea(this);
      interiorPt = intPt.getInteriorPoint();
    }
    return this.createPointFromInternalCoord(interiorPt, this);
  };
  jsts.geom.Geometry.prototype.getDimension = function() {
    throw new jsts.error.AbstractMethodInvocationError();
  };
  jsts.geom.Geometry.prototype.getBoundary = function() {
    throw new jsts.error.AbstractMethodInvocationError();
  };
  jsts.geom.Geometry.prototype.getBoundaryDimension = function() {
    throw new jsts.error.AbstractMethodInvocationError();
  };
  jsts.geom.Geometry.prototype.getEnvelope = function() {
    return this.getFactory().toGeometry(this.getEnvelopeInternal());
  };
  jsts.geom.Geometry.prototype.getEnvelopeInternal = function() {
    if (this.envelope === null) {
      this.envelope = this.computeEnvelopeInternal();
    }
    return this.envelope;
  };
  jsts.geom.Geometry.prototype.disjoint = function(g) {
    return !this.intersects(g);
  };
  jsts.geom.Geometry.prototype.touches = function(g) {
    if (!this.getEnvelopeInternal().intersects(g.getEnvelopeInternal())) {
      return false;
    }
    return this.relate(g).isTouches(this.getDimension(), g.getDimension());
  };
  jsts.geom.Geometry.prototype.intersects = function(g) {
    if (!this.getEnvelopeInternal().intersects(g.getEnvelopeInternal())) {
      return false;
    }
    if (this.isRectangle()) {
      return jsts.operation.predicate.RectangleIntersects.intersects(this, g);
    }
    if (g.isRectangle()) {
      return jsts.operation.predicate.RectangleIntersects.intersects(g, this);
    }
    return this.relate(g).isIntersects();
  };
  jsts.geom.Geometry.prototype.crosses = function(g) {
    if (!this.getEnvelopeInternal().intersects(g.getEnvelopeInternal())) {
      return false;
    }
    return this.relate(g).isCrosses(this.getDimension(), g.getDimension());
  };
  jsts.geom.Geometry.prototype.within = function(g) {
    return g.contains(this);
  };
  jsts.geom.Geometry.prototype.contains = function(g) {
    if (!this.getEnvelopeInternal().contains(g.getEnvelopeInternal())) {
      return false;
    }
    if (this.isRectangle()) {
      return jsts.operation.predicate.RectangleContains.contains(this, g);
    }
    return this.relate(g).isContains();
  };
  jsts.geom.Geometry.prototype.overlaps = function(g) {
    if (!this.getEnvelopeInternal().intersects(g.getEnvelopeInternal())) {
      return false;
    }
    return this.relate(g).isOverlaps(this.getDimension(), g.getDimension());
  };
  jsts.geom.Geometry.prototype.covers = function(g) {
    if (!this.getEnvelopeInternal().covers(g.getEnvelopeInternal())) {
      return false;
    }
    if (this.isRectangle()) {
      return true;
    }
    return this.relate(g).isCovers();
  };
  jsts.geom.Geometry.prototype.coveredBy = function(g) {
    return g.covers(this);
  };
  jsts.geom.Geometry.prototype.relate = function(g, intersectionPattern) {
    if (arguments.length === 1) {
      return this.relate2.apply(this, arguments);
    }
    return this.relate2(g).matches(intersectionPattern);
  };
  jsts.geom.Geometry.prototype.relate2 = function(g) {
    this.checkNotGeometryCollection(this);
    this.checkNotGeometryCollection(g);
    return jsts.operation.relate.RelateOp.relate(this, g);
  };
  jsts.geom.Geometry.prototype.equalsTopo = function(g) {
    if (!this.getEnvelopeInternal().equals(g.getEnvelopeInternal())) {
      return false;
    }
    return this.relate(g).isEquals(this.getDimension(), g.getDimension());
  };
  jsts.geom.Geometry.prototype.equals = function(o) {
    if (o instanceof jsts.geom.Geometry || o instanceof jsts.geom.LinearRing || o instanceof jsts.geom.Polygon || o instanceof jsts.geom.GeometryCollection || o instanceof jsts.geom.MultiPoint || o instanceof jsts.geom.MultiLineString || o instanceof jsts.geom.MultiPolygon) {
      return this.equalsExact(o);
    }
    return false;
  };
  jsts.geom.Geometry.prototype.buffer = function(distance, quadrantSegments, endCapStyle) {
    var params = new jsts.operation.buffer.BufferParameters(quadrantSegments, endCapStyle);
    return jsts.operation.buffer.BufferOp.bufferOp2(this, distance, params);
  };
  jsts.geom.Geometry.prototype.convexHull = function() {
    return new jsts.algorithm.ConvexHull(this).getConvexHull();
  };
  jsts.geom.Geometry.prototype.intersection = function(other) {
    if (this.isEmpty()) {
      return this.getFactory().createGeometryCollection(null);
    }
    if (other.isEmpty()) {
      return this.getFactory().createGeometryCollection(null);
    }
    if (this.isGeometryCollection(this)) {
      var g2 = other;
    }
    this.checkNotGeometryCollection(this);
    this.checkNotGeometryCollection(other);
    return jsts.operation.overlay.snap.SnapIfNeededOverlayOp.overlayOp(this, other, jsts.operation.overlay.OverlayOp.INTERSECTION);
  };
  jsts.geom.Geometry.prototype.union = function(other) {
    if (arguments.length === 0) {
      return jsts.operation.union.UnaryUnionOp.union(this);
    }
    if (this.isEmpty()) {
      return other.clone();
    }
    if (other.isEmpty()) {
      return this.clone();
    }
    this.checkNotGeometryCollection(this);
    this.checkNotGeometryCollection(other);
    return jsts.operation.overlay.snap.SnapIfNeededOverlayOp.overlayOp(this, other, jsts.operation.overlay.OverlayOp.UNION);
  };
  jsts.geom.Geometry.prototype.difference = function(other) {
    if (this.isEmpty()) {
      return this.getFactory().createGeometryCollection(null);
    }
    if (other.isEmpty()) {
      return this.clone();
    }
    this.checkNotGeometryCollection(this);
    this.checkNotGeometryCollection(other);
    return jsts.operation.overlay.snap.SnapIfNeededOverlayOp.overlayOp(this, other, jsts.operation.overlay.OverlayOp.DIFFERENCE);
  };
  jsts.geom.Geometry.prototype.symDifference = function(other) {
    if (this.isEmpty()) {
      return other.clone();
    }
    if (other.isEmpty()) {
      return this.clone();
    }
    this.checkNotGeometryCollection(this);
    this.checkNotGeometryCollection(other);
    return jsts.operation.overlay.snap.SnapIfNeededOverlayOp.overlayOp(this, other, jsts.operation.overlay.OverlayOp.SYMDIFFERENCE);
  };
  jsts.geom.Geometry.prototype.equalsExact = function(other, tolerance) {
    throw new jsts.error.AbstractMethodInvocationError();
  };
  jsts.geom.Geometry.prototype.equalsNorm = function(g) {
    if (g === null || g === undefined)
      return false;
    return this.norm().equalsExact(g.norm());
  };
  jsts.geom.Geometry.prototype.apply = function(filter) {
    throw new jsts.error.AbstractMethodInvocationError();
  };
  jsts.geom.Geometry.prototype.clone = function() {
    throw new jsts.error.AbstractMethodInvocationError();
  };
  jsts.geom.Geometry.prototype.normalize = function() {
    throw new jsts.error.AbstractMethodInvocationError();
  };
  jsts.geom.Geometry.prototype.norm = function() {
    var copy = this.clone();
    copy.normalize();
    return copy;
  };
  jsts.geom.Geometry.prototype.compareTo = function(o) {
    var other = o;
    if (this.getClassSortIndex() !== other.getClassSortIndex()) {
      return this.getClassSortIndex() - other.getClassSortIndex();
    }
    if (this.isEmpty() && other.isEmpty()) {
      return 0;
    }
    if (this.isEmpty()) {
      return -1;
    }
    if (other.isEmpty()) {
      return 1;
    }
    return this.compareToSameClass(o);
  };
  jsts.geom.Geometry.prototype.isEquivalentClass = function(other) {
    if (this instanceof jsts.geom.Point && other instanceof jsts.geom.Point) {
      return true;
    } else if (this instanceof jsts.geom.LineString && (other instanceof jsts.geom.LineString | other instanceof jsts.geom.LinearRing)) {
      return true;
    } else if (this instanceof jsts.geom.LinearRing && (other instanceof jsts.geom.LineString | other instanceof jsts.geom.LinearRing)) {
      return true;
    } else if (this instanceof jsts.geom.Polygon && (other instanceof jsts.geom.Polygon)) {
      return true;
    } else if (this instanceof jsts.geom.MultiPoint && (other instanceof jsts.geom.MultiPoint)) {
      return true;
    } else if (this instanceof jsts.geom.MultiLineString && (other instanceof jsts.geom.MultiLineString)) {
      return true;
    } else if (this instanceof jsts.geom.MultiPolygon && (other instanceof jsts.geom.MultiPolygon)) {
      return true;
    } else if (this instanceof jsts.geom.GeometryCollection && (other instanceof jsts.geom.GeometryCollection)) {
      return true;
    }
    return false;
  };
  jsts.geom.Geometry.prototype.checkNotGeometryCollection = function(g) {
    if (g.isGeometryCollectionBase()) {
      throw new jsts.error.IllegalArgumentError('This method does not support GeometryCollection');
    }
  };
  jsts.geom.Geometry.prototype.isGeometryCollection = function() {
    return (this instanceof jsts.geom.GeometryCollection);
  };
  jsts.geom.Geometry.prototype.isGeometryCollectionBase = function() {
    return (this.CLASS_NAME === 'jsts.geom.GeometryCollection');
  };
  jsts.geom.Geometry.prototype.computeEnvelopeInternal = function() {
    throw new jsts.error.AbstractMethodInvocationError();
  };
  jsts.geom.Geometry.prototype.compareToSameClass = function(o) {
    throw new jsts.error.AbstractMethodInvocationError();
  };
  jsts.geom.Geometry.prototype.compare = function(a, b) {
    var i = a.iterator();
    var j = b.iterator();
    while (i.hasNext() && j.hasNext()) {
      var aElement = i.next();
      var bElement = j.next();
      var comparison = aElement.compareTo(bElement);
      if (comparison !== 0) {
        return comparison;
      }
    }
    if (i.hasNext()) {
      return 1;
    }
    if (j.hasNext()) {
      return -1;
    }
    return 0;
  };
  jsts.geom.Geometry.prototype.equal = function(a, b, tolerance) {
    if (tolerance === undefined || tolerance === null || tolerance === 0) {
      return a.equals(b);
    }
    return a.distance(b) <= tolerance;
  };
  jsts.geom.Geometry.prototype.getClassSortIndex = function() {
    var sortedClasses = [jsts.geom.Point, jsts.geom.MultiPoint, jsts.geom.LineString, jsts.geom.LinearRing, jsts.geom.MultiLineString, jsts.geom.Polygon, jsts.geom.MultiPolygon, jsts.geom.GeometryCollection];
    for (var i = 0; i < sortedClasses.length; i++) {
      if (this instanceof sortedClasses[i])
        return i;
    }
    jsts.util.Assert.shouldNeverReachHere('Class not supported: ' + this);
    return -1;
  };
  jsts.geom.Geometry.prototype.toString = function() {
    return new jsts.io.WKTWriter().write(this);
  };
  jsts.geom.Geometry.prototype.createPointFromInternalCoord = function(coord, exemplar) {
    exemplar.getPrecisionModel().makePrecise(coord);
    return exemplar.getFactory().createPoint(coord);
  };
})(require("buffer").Buffer, require("process"));
