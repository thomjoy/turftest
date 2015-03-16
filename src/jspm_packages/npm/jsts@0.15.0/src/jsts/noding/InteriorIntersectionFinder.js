/* */ 
(function(process) {
  (function() {
    var SegmentIntersector = jsts.noding.SegmentIntersector;
    var ArrayList = javascript.util.ArrayList;
    jsts.noding.InteriorIntersectionFinder = function(li) {
      this.li = li;
      this.intersections = new ArrayList();
      this.interiorIntersection = null;
    };
    jsts.noding.InteriorIntersectionFinder.prototype = new SegmentIntersector();
    jsts.noding.InteriorIntersectionFinder.constructor = jsts.noding.InteriorIntersectionFinder;
    jsts.noding.InteriorIntersectionFinder.prototype.findAllIntersections = false;
    jsts.noding.InteriorIntersectionFinder.prototype.isCheckEndSegmentsOnly = false;
    jsts.noding.InteriorIntersectionFinder.prototype.li = null;
    jsts.noding.InteriorIntersectionFinder.prototype.interiorIntersection = null;
    jsts.noding.InteriorIntersectionFinder.prototype.intSegments = null;
    jsts.noding.InteriorIntersectionFinder.prototype.intersections = null;
    jsts.noding.InteriorIntersectionFinder.prototype.setFindAllIntersections = function(findAllIntersections) {
      this.findAllIntersections = findAllIntersections;
    };
    jsts.noding.InteriorIntersectionFinder.prototype.getIntersections = function() {
      return intersections;
    };
    jsts.noding.InteriorIntersectionFinder.prototype.setCheckEndSegmentsOnly = function(isCheckEndSegmentsOnly) {
      this.isCheckEndSegmentsOnly = isCheckEndSegmentsOnly;
    };
    jsts.noding.InteriorIntersectionFinder.prototype.hasIntersection = function() {
      return this.interiorIntersection != null;
    };
    jsts.noding.InteriorIntersectionFinder.prototype.getInteriorIntersection = function() {
      return this.interiorIntersection;
    };
    jsts.noding.InteriorIntersectionFinder.prototype.getIntersectionSegments = function() {
      return this.intSegments;
    };
    jsts.noding.InteriorIntersectionFinder.prototype.processIntersections = function(e0, segIndex0, e1, segIndex1) {
      if (this.hasIntersection())
        return ;
      if (e0 == e1 && segIndex0 == segIndex1)
        return ;
      if (this.isCheckEndSegmentsOnly) {
        var isEndSegPresent = this.isEndSegment(e0, segIndex0) || isEndSegment(e1, segIndex1);
        if (!isEndSegPresent)
          return ;
      }
      var p00 = e0.getCoordinates()[segIndex0];
      var p01 = e0.getCoordinates()[segIndex0 + 1];
      var p10 = e1.getCoordinates()[segIndex1];
      var p11 = e1.getCoordinates()[segIndex1 + 1];
      this.li.computeIntersection(p00, p01, p10, p11);
      if (this.li.hasIntersection()) {
        if (this.li.isInteriorIntersection()) {
          this.intSegments = [];
          this.intSegments[0] = p00;
          this.intSegments[1] = p01;
          this.intSegments[2] = p10;
          this.intSegments[3] = p11;
          this.interiorIntersection = this.li.getIntersection(0);
          this.intersections.add(this.interiorIntersection);
        }
      }
    };
    jsts.noding.InteriorIntersectionFinder.prototype.isEndSegment = function(segStr, index) {
      if (index == 0)
        return true;
      if (index >= segStr.size() - 2)
        return true;
      return false;
    };
    jsts.noding.InteriorIntersectionFinder.prototype.isDone = function() {
      if (this.findAllIntersections)
        return false;
      return this.interiorIntersection != null;
    };
  })();
})(require("process"));
