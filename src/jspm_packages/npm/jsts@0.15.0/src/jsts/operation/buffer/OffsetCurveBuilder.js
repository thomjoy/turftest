/* */ 
(function(Buffer) {
  jsts.operation.buffer.OffsetCurveBuilder = function(precisionModel, bufParams) {
    this.precisionModel = precisionModel;
    this.bufParams = bufParams;
  };
  jsts.operation.buffer.OffsetCurveBuilder.prototype.distance = 0.0;
  jsts.operation.buffer.OffsetCurveBuilder.prototype.precisionModel = null;
  jsts.operation.buffer.OffsetCurveBuilder.prototype.bufParams = null;
  jsts.operation.buffer.OffsetCurveBuilder.prototype.getBufferParameters = function() {
    return this.bufParams;
  };
  jsts.operation.buffer.OffsetCurveBuilder.prototype.getLineCurve = function(inputPts, distance) {
    this.distance = distance;
    if (this.distance < 0.0 && !this.bufParams.isSingleSided())
      return null;
    if (this.distance == 0.0)
      return null;
    var posDistance = Math.abs(this.distance);
    var segGen = this.getSegGen(posDistance);
    if (inputPts.length <= 1) {
      this.computePointCurve(inputPts[0], segGen);
    } else {
      if (this.bufParams.isSingleSided()) {
        var isRightSide = distance < 0.0;
        this.computeSingleSidedBufferCurve(inputPts, isRightSide, segGen);
      } else
        this.computeLineBufferCurve(inputPts, segGen);
    }
    var lineCoord = segGen.getCoordinates();
    return lineCoord;
  };
  jsts.operation.buffer.OffsetCurveBuilder.prototype.getRingCurve = function(inputPts, side, distance) {
    this.distance = distance;
    if (inputPts.length <= 2)
      return this.getLineCurve(inputPts, distance);
    if (this.distance == 0.0) {
      return jsts.operation.buffer.OffsetCurveBuilder.copyCoordinates(inputPts);
    }
    var segGen = this.getSegGen(this.distance);
    this.computeRingBufferCurve(inputPts, side, segGen);
    return segGen.getCoordinates();
  };
  jsts.operation.buffer.OffsetCurveBuilder.prototype.getOffsetCurve = function(inputPts, distance) {
    this.distance = distance;
    if (this.distance === 0.0)
      return null;
    var isRightSide = this.distance < 0.0;
    var posDistance = Math.abs(this.distance);
    var segGen = this.getSegGen(posDistance);
    if (inputPts.length <= 1) {
      this.computePointCurve(inputPts[0], segGen);
    } else {
      this.computeOffsetCurve(inputPts, isRightSide, segGen);
    }
    var curvePts = segGen.getCoordinates();
    if (isRightSide)
      curvePts.reverse();
    return curvePts;
  };
  jsts.operation.buffer.OffsetCurveBuilder.copyCoordinates = function(pts) {
    var copy = [];
    for (var i = 0; i < pts.length; i++) {
      copy.push(pts[i].clone());
    }
    return copy;
  };
  jsts.operation.buffer.OffsetCurveBuilder.prototype.getSegGen = function(distance) {
    return new jsts.operation.buffer.OffsetSegmentGenerator(this.precisionModel, this.bufParams, distance);
  };
  jsts.operation.buffer.OffsetCurveBuilder.SIMPLIFY_FACTOR = 100.0;
  jsts.operation.buffer.OffsetCurveBuilder.simplifyTolerance = function(bufDistance) {
    return bufDistance / jsts.operation.buffer.OffsetCurveBuilder.SIMPLIFY_FACTOR;
  };
  jsts.operation.buffer.OffsetCurveBuilder.prototype.computePointCurve = function(pt, segGen) {
    switch (this.bufParams.getEndCapStyle()) {
      case jsts.operation.buffer.BufferParameters.CAP_ROUND:
        segGen.createCircle(pt);
        break;
      case jsts.operation.buffer.BufferParameters.CAP_SQUARE:
        segGen.createSquare(pt);
        break;
    }
  };
  jsts.operation.buffer.OffsetCurveBuilder.prototype.computeLineBufferCurve = function(inputPts, segGen) {
    var distTol = jsts.operation.buffer.OffsetCurveBuilder.simplifyTolerance(this.distance);
    var simp1 = jsts.operation.buffer.BufferInputLineSimplifier.simplify(inputPts, distTol);
    var n1 = simp1.length - 1;
    segGen.initSideSegments(simp1[0], simp1[1], jsts.geomgraph.Position.LEFT);
    for (var i = 2; i <= n1; i++) {
      segGen.addNextSegment(simp1[i], true);
    }
    segGen.addLastSegment();
    segGen.addLineEndCap(simp1[n1 - 1], simp1[n1]);
    var simp2 = jsts.operation.buffer.BufferInputLineSimplifier.simplify(inputPts, -distTol);
    var n2 = simp2.length - 1;
    segGen.initSideSegments(simp2[n2], simp2[n2 - 1], jsts.geomgraph.Position.LEFT);
    for (var i = n2 - 2; i >= 0; i--) {
      segGen.addNextSegment(simp2[i], true);
    }
    segGen.addLastSegment();
    segGen.addLineEndCap(simp2[1], simp2[0]);
    segGen.closeRing();
  };
  jsts.operation.buffer.OffsetCurveBuilder.prototype.computeSingleSidedBufferCurve = function(inputPts, isRightSide, segGen) {
    var distTol = jsts.operation.buffer.OffsetCurveBuilder.simplifyTolerance(this.distance);
    if (isRightSide) {
      segGen.addSegments(inputPts, true);
      var simp2 = jsts.operation.buffer.BufferInputLineSimplifier.simplify(inputPts, -distTol);
      var n2 = simp2.length - 1;
      segGen.initSideSegments(simp2[n2], simp2[n2 - 1], jsts.geomgraph.Position.LEFT);
      segGen.addFirstSegment();
      for (var i = n2 - 2; i >= 0; i--) {
        segGen.addNextSegment(simp2[i], true);
      }
    } else {
      segGen.addSegments(inputPts, false);
      var simp1 = jsts.operation.buffer.BufferInputLineSimplifier.simplify(inputPts, distTol);
      var n1 = simp1.length - 1;
      segGen.initSideSegments(simp1[0], simp1[1], jsts.geomgraph.Position.LEFT);
      segGen.addFirstSegment();
      for (var i = 2; i <= n1; i++) {
        segGen.addNextSegment(simp1[i], true);
      }
    }
    segGen.addLastSegment();
    segGen.closeRing();
  };
  jsts.operation.buffer.OffsetCurveBuilder.prototype.computeOffsetCurve = function(inputPts, isRightSide, segGen) {
    var distTol = jsts.operation.buffer.OffsetCurveBuilder.simplifyTolerance(this.distance);
    if (isRightSide) {
      var simp2 = jsts.operation.buffer.BufferInputLineSimplifier.simplify(inputPts, -distTol);
      var n2 = simp2.length - 1;
      segGen.initSideSegments(simp2[n2], simp2[n2 - 1], jsts.geomgraph.Position.LEFT);
      segGen.addFirstSegment();
      for (var i = n2 - 2; i >= 0; i--) {
        segGen.addNextSegment(simp2[i], true);
      }
    } else {
      var simp1 = jsts.operation.buffer.BufferInputLineSimplifier.simplify(inputPts, distTol);
      var n1 = simp1.length - 1;
      segGen.initSideSegments(simp1[0], simp1[1], jsts.geomgraph.Position.LEFT);
      segGen.addFirstSegment();
      for (var i = 2; i <= n1; i++) {
        segGen.addNextSegment(simp1[i], true);
      }
    }
    segGen.addLastSegment();
  };
  jsts.operation.buffer.OffsetCurveBuilder.prototype.computeRingBufferCurve = function(inputPts, side, segGen) {
    var distTol = jsts.operation.buffer.OffsetCurveBuilder.simplifyTolerance(this.distance);
    if (side === jsts.geomgraph.Position.RIGHT)
      distTol = -distTol;
    var simp = jsts.operation.buffer.BufferInputLineSimplifier.simplify(inputPts, distTol);
    var n = simp.length - 1;
    segGen.initSideSegments(simp[n - 1], simp[0], side);
    for (var i = 1; i <= n; i++) {
      var addStartPoint = i !== 1;
      segGen.addNextSegment(simp[i], addStartPoint);
    }
    segGen.closeRing();
  };
})(require("buffer").Buffer);
