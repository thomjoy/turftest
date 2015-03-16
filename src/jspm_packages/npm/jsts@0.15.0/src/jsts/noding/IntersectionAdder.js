/* */ 
(function(process) {
  jsts.noding.IntersectionAdder = function(li) {
    this.li = li;
  };
  jsts.noding.IntersectionAdder.prototype = new jsts.noding.SegmentIntersector();
  jsts.noding.IntersectionAdder.constructor = jsts.noding.IntersectionAdder;
  jsts.noding.IntersectionAdder.isAdjacentSegments = function(i1, i2) {
    return Math.abs(i1 - i2) === 1;
  };
  jsts.noding.IntersectionAdder.prototype._hasIntersection = false;
  jsts.noding.IntersectionAdder.prototype.hasProper = false;
  jsts.noding.IntersectionAdder.prototype.hasProperInterior = false;
  jsts.noding.IntersectionAdder.prototype.hasInterior = false;
  jsts.noding.IntersectionAdder.prototype.properIntersectionPoint = null;
  jsts.noding.IntersectionAdder.prototype.li = null;
  jsts.noding.IntersectionAdder.prototype.isSelfIntersection = null;
  jsts.noding.IntersectionAdder.prototype.numIntersections = 0;
  jsts.noding.IntersectionAdder.prototype.numInteriorIntersections = 0;
  jsts.noding.IntersectionAdder.prototype.numProperIntersections = 0;
  jsts.noding.IntersectionAdder.prototype.numTests = 0;
  jsts.noding.IntersectionAdder.prototype.getLineIntersector = function() {
    return this.li;
  };
  jsts.noding.IntersectionAdder.prototype.getProperIntersectionPoint = function() {
    return this.properIntersectionPoint;
  };
  jsts.noding.IntersectionAdder.prototype.hasIntersection = function() {
    return this._hasIntersection;
  };
  jsts.noding.IntersectionAdder.prototype.hasProperIntersection = function() {
    return this.hasProper;
  };
  jsts.noding.IntersectionAdder.prototype.hasProperInteriorIntersection = function() {
    return this.hasProperInterior;
  };
  jsts.noding.IntersectionAdder.prototype.hasInteriorIntersection = function() {
    return this.hasInterior;
  };
  jsts.noding.IntersectionAdder.prototype.isTrivialIntersection = function(e0, segIndex0, e1, segIndex1) {
    if (e0 == e1) {
      if (this.li.getIntersectionNum() == 1) {
        if (jsts.noding.IntersectionAdder.isAdjacentSegments(segIndex0, segIndex1))
          return true;
        if (e0.isClosed()) {
          var maxSegIndex = e0.size() - 1;
          if ((segIndex0 === 0 && segIndex1 === maxSegIndex) || (segIndex1 === 0 && segIndex0 === maxSegIndex)) {
            return true;
          }
        }
      }
    }
    return false;
  };
  jsts.noding.IntersectionAdder.prototype.processIntersections = function(e0, segIndex0, e1, segIndex1) {
    if (e0 === e1 && segIndex0 === segIndex1)
      return ;
    this.numTests++;
    var p00 = e0.getCoordinates()[segIndex0];
    var p01 = e0.getCoordinates()[segIndex0 + 1];
    var p10 = e1.getCoordinates()[segIndex1];
    var p11 = e1.getCoordinates()[segIndex1 + 1];
    this.li.computeIntersection(p00, p01, p10, p11);
    if (this.li.hasIntersection()) {
      this.numIntersections++;
      if (this.li.isInteriorIntersection()) {
        this.numInteriorIntersections++;
        this.hasInterior = true;
      }
      if (!this.isTrivialIntersection(e0, segIndex0, e1, segIndex1)) {
        this._hasIntersection = true;
        e0.addIntersections(this.li, segIndex0, 0);
        e1.addIntersections(this.li, segIndex1, 1);
        if (this.li.isProper()) {
          this.numProperIntersections++;
          this.hasProper = true;
          this.hasProperInterior = true;
        }
      }
    }
  };
  jsts.noding.IntersectionAdder.prototype.isDone = function() {
    return false;
  };
})(require("process"));
