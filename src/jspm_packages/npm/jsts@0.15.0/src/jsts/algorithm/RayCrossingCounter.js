/* */ 
(function(process) {
  jsts.algorithm.RayCrossingCounter = function(p) {
    this.p = p;
  };
  jsts.algorithm.RayCrossingCounter.locatePointInRing = function(p, ring) {
    var counter = new jsts.algorithm.RayCrossingCounter(p);
    for (var i = 1; i < ring.length; i++) {
      var p1 = ring[i];
      var p2 = ring[i - 1];
      counter.countSegment(p1, p2);
      if (counter.isOnSegment())
        return counter.getLocation();
    }
    return counter.getLocation();
  };
  jsts.algorithm.RayCrossingCounter.prototype.p = null;
  jsts.algorithm.RayCrossingCounter.prototype.crossingCount = 0;
  jsts.algorithm.RayCrossingCounter.prototype.isPointOnSegment = false;
  jsts.algorithm.RayCrossingCounter.prototype.countSegment = function(p1, p2) {
    if (p1.x < this.p.x && p2.x < this.p.x)
      return ;
    if (this.p.x == p2.x && this.p.y === p2.y) {
      this.isPointOnSegment = true;
      return ;
    }
    if (p1.y === this.p.y && p2.y === this.p.y) {
      var minx = p1.x;
      var maxx = p2.x;
      if (minx > maxx) {
        minx = p2.x;
        maxx = p1.x;
      }
      if (this.p.x >= minx && this.p.x <= maxx) {
        this.isPointOnSegment = true;
      }
      return ;
    }
    if (((p1.y > this.p.y) && (p2.y <= this.p.y)) || ((p2.y > this.p.y) && (p1.y <= this.p.y))) {
      var x1 = p1.x - this.p.x;
      var y1 = p1.y - this.p.y;
      var x2 = p2.x - this.p.x;
      var y2 = p2.y - this.p.y;
      var xIntSign = jsts.algorithm.RobustDeterminant.signOfDet2x2(x1, y1, x2, y2);
      if (xIntSign === 0.0) {
        this.isPointOnSegment = true;
        return ;
      }
      if (y2 < y1)
        xIntSign = -xIntSign;
      if (xIntSign > 0.0) {
        this.crossingCount++;
      }
    }
  };
  jsts.algorithm.RayCrossingCounter.prototype.isOnSegment = function() {
    return jsts.geom.isPointOnSegment;
  };
  jsts.algorithm.RayCrossingCounter.prototype.getLocation = function() {
    if (this.isPointOnSegment)
      return jsts.geom.Location.BOUNDARY;
    if ((this.crossingCount % 2) === 1) {
      return jsts.geom.Location.INTERIOR;
    }
    return jsts.geom.Location.EXTERIOR;
  };
  jsts.algorithm.RayCrossingCounter.prototype.isPointInPolygon = function() {
    return this.getLocation() !== jsts.geom.Location.EXTERIOR;
  };
})(require("process"));
