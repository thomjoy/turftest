/* */ 
(function(Buffer) {
  jsts.operation.buffer.BufferOp = function(g, bufParams) {
    this.argGeom = g;
    this.bufParams = bufParams ? bufParams : new jsts.operation.buffer.BufferParameters();
  };
  jsts.operation.buffer.BufferOp.MAX_PRECISION_DIGITS = 12;
  jsts.operation.buffer.BufferOp.precisionScaleFactor = function(g, distance, maxPrecisionDigits) {
    var env = g.getEnvelopeInternal();
    var envSize = Math.max(env.getHeight(), env.getWidth());
    var expandByDistance = distance > 0.0 ? distance : 0.0;
    var bufEnvSize = envSize + 2 * expandByDistance;
    var bufEnvLog10 = (Math.log(bufEnvSize) / Math.log(10) + 1.0);
    var minUnitLog10 = bufEnvLog10 - maxPrecisionDigits;
    var scaleFactor = Math.pow(10.0, -minUnitLog10);
    return scaleFactor;
  };
  jsts.operation.buffer.BufferOp.bufferOp = function(g, distance) {
    if (arguments.length > 2) {
      return jsts.operation.buffer.BufferOp.bufferOp2.apply(this, arguments);
    }
    var gBuf = new jsts.operation.buffer.BufferOp(g);
    var geomBuf = gBuf.getResultGeometry(distance);
    return geomBuf;
  };
  jsts.operation.buffer.BufferOp.bufferOp2 = function(g, distance, params) {
    if (arguments.length > 3) {
      return jsts.operation.buffer.BufferOp.bufferOp3.apply(this, arguments);
    }
    var bufOp = new jsts.operation.buffer.BufferOp(g, params);
    var geomBuf = bufOp.getResultGeometry(distance);
    return geomBuf;
  };
  jsts.operation.buffer.BufferOp.bufferOp3 = function(g, distance, quadrantSegments) {
    if (arguments.length > 4) {
      return jsts.operation.buffer.BufferOp.bufferOp4.apply(this, arguments);
    }
    var bufOp = new jsts.operation.buffer.BufferOp(g);
    bufOp.setQuadrantSegments(quadrantSegments);
    var geomBuf = bufOp.getResultGeometry(distance);
    return geomBuf;
  };
  jsts.operation.buffer.BufferOp.bufferOp4 = function(g, distance, quadrantSegments, endCapStyle) {
    var bufOp = new jsts.operation.buffer.BufferOp(g);
    bufOp.setQuadrantSegments(quadrantSegments);
    bufOp.setEndCapStyle(endCapStyle);
    var geomBuf = bufOp.getResultGeometry(distance);
    return geomBuf;
  };
  jsts.operation.buffer.BufferOp.prototype.argGeom = null;
  jsts.operation.buffer.BufferOp.prototype.distance = null;
  jsts.operation.buffer.BufferOp.prototype.bufParams = null;
  jsts.operation.buffer.BufferOp.prototype.resultGeometry = null;
  jsts.operation.buffer.BufferOp.prototype.setEndCapStyle = function(endCapStyle) {
    this.bufParams.setEndCapStyle(endCapStyle);
  };
  jsts.operation.buffer.BufferOp.prototype.setQuadrantSegments = function(quadrantSegments) {
    this.bufParams.setQuadrantSegments(quadrantSegments);
  };
  jsts.operation.buffer.BufferOp.prototype.getResultGeometry = function(dist) {
    this.distance = dist;
    this.computeGeometry();
    return this.resultGeometry;
  };
  jsts.operation.buffer.BufferOp.prototype.computeGeometry = function() {
    this.bufferOriginalPrecision();
    if (this.resultGeometry !== null) {
      return ;
    }
    var argPM = this.argGeom.getPrecisionModel();
    if (argPM.getType() === jsts.geom.PrecisionModel.FIXED) {
      this.bufferFixedPrecision(argPM);
    } else {
      this.bufferReducedPrecision();
    }
  };
  jsts.operation.buffer.BufferOp.prototype.bufferReducedPrecision = function() {
    var precDigits;
    var saveException = null;
    for (precDigits = jsts.operation.buffer.BufferOp.MAX_PRECISION_DIGITS; precDigits >= 0; precDigits--) {
      try {
        this.bufferReducedPrecision2(precDigits);
      } catch (ex) {
        saveException = ex;
      }
      if (this.resultGeometry !== null) {
        return ;
      }
    }
    throw saveException;
  };
  jsts.operation.buffer.BufferOp.prototype.bufferOriginalPrecision = function() {
    try {
      var bufBuilder = new jsts.operation.buffer.BufferBuilder(this.bufParams);
      this.resultGeometry = bufBuilder.buffer(this.argGeom, this.distance);
    } catch (e) {}
  };
  jsts.operation.buffer.BufferOp.prototype.bufferReducedPrecision2 = function(precisionDigits) {
    var sizeBasedScaleFactor = jsts.operation.buffer.BufferOp.precisionScaleFactor(this.argGeom, this.distance, precisionDigits);
    var fixedPM = new jsts.geom.PrecisionModel(sizeBasedScaleFactor);
    this.bufferFixedPrecision(fixedPM);
  };
  jsts.operation.buffer.BufferOp.prototype.bufferFixedPrecision = function(fixedPM) {
    var noder = new jsts.noding.ScaledNoder(new jsts.noding.snapround.MCIndexSnapRounder(new jsts.geom.PrecisionModel(1.0)), fixedPM.getScale());
    var bufBuilder = new jsts.operation.buffer.BufferBuilder(this.bufParams);
    bufBuilder.setWorkingPrecisionModel(fixedPM);
    bufBuilder.setNoder(noder);
    this.resultGeometry = bufBuilder.buffer(this.argGeom, this.distance);
  };
})(require("buffer").Buffer);
