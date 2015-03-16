/* */ 
(function(process) {
  jsts.noding.IntersectionFinderAdder = function(li) {
    this.li = li;
    this.interiorIntersections = new javascript.util.ArrayList();
  };
  jsts.noding.IntersectionFinderAdder.prototype = new jsts.noding.SegmentIntersector();
  jsts.noding.IntersectionFinderAdder.constructor = jsts.noding.IntersectionFinderAdder;
  jsts.noding.IntersectionFinderAdder.prototype.li = null;
  jsts.noding.IntersectionFinderAdder.prototype.interiorIntersections = null;
  jsts.noding.IntersectionFinderAdder.prototype.getInteriorIntersections = function() {
    return this.interiorIntersections;
  };
  jsts.noding.IntersectionFinderAdder.prototype.processIntersections = function(e0, segIndex0, e1, segIndex1) {
    if (e0 === e1 && segIndex0 === segIndex1)
      return ;
    var p00 = e0.getCoordinates()[segIndex0];
    var p01 = e0.getCoordinates()[segIndex0 + 1];
    var p10 = e1.getCoordinates()[segIndex1];
    var p11 = e1.getCoordinates()[segIndex1 + 1];
    this.li.computeIntersection(p00, p01, p10, p11);
    if (this.li.hasIntersection()) {
      if (this.li.isInteriorIntersection()) {
        for (var intIndex = 0; intIndex < this.li.getIntersectionNum(); intIndex++) {
          this.interiorIntersections.add(this.li.getIntersection(intIndex));
        }
        e0.addIntersections(this.li, segIndex0, 0);
        e1.addIntersections(this.li, segIndex1, 1);
      }
    }
  };
  jsts.noding.IntersectionFinderAdder.prototype.isDone = function() {
    return false;
  };
})(require("process"));
