/* */ 
(function(process) {
  jsts.operation.buffer.RightmostEdgeFinder = function() {};
  jsts.operation.buffer.RightmostEdgeFinder.prototype.minIndex = -1;
  jsts.operation.buffer.RightmostEdgeFinder.prototype.minCoord = null;
  jsts.operation.buffer.RightmostEdgeFinder.prototype.minDe = null;
  jsts.operation.buffer.RightmostEdgeFinder.prototype.orientedDe = null;
  jsts.operation.buffer.RightmostEdgeFinder.prototype.getEdge = function() {
    return this.orientedDe;
  };
  jsts.operation.buffer.RightmostEdgeFinder.prototype.getCoordinate = function() {
    return this.minCoord;
  };
  jsts.operation.buffer.RightmostEdgeFinder.prototype.findEdge = function(dirEdgeList) {
    for (var i = dirEdgeList.iterator(); i.hasNext(); ) {
      var de = i.next();
      if (!de.isForward())
        continue;
      this.checkForRightmostCoordinate(de);
    }
    jsts.util.Assert.isTrue(this.minIndex !== 0 || this.minCoord.equals(this.minDe.getCoordinate()), 'inconsistency in rightmost processing');
    if (this.minIndex === 0) {
      this.findRightmostEdgeAtNode();
    } else {
      this.findRightmostEdgeAtVertex();
    }
    this.orientedDe = this.minDe;
    var rightmostSide = this.getRightmostSide(this.minDe, this.minIndex);
    if (rightmostSide == jsts.geomgraph.Position.LEFT) {
      this.orientedDe = this.minDe.getSym();
    }
  };
  jsts.operation.buffer.RightmostEdgeFinder.prototype.findRightmostEdgeAtNode = function() {
    var node = this.minDe.getNode();
    var star = node.getEdges();
    this.minDe = star.getRightmostEdge();
    if (!this.minDe.isForward()) {
      this.minDe = this.minDe.getSym();
      this.minIndex = this.minDe.getEdge().getCoordinates().length - 1;
    }
  };
  jsts.operation.buffer.RightmostEdgeFinder.prototype.findRightmostEdgeAtVertex = function() {
    var pts = this.minDe.getEdge().getCoordinates();
    jsts.util.Assert.isTrue(this.minIndex > 0 && this.minIndex < pts.length, 'rightmost point expected to be interior vertex of edge');
    var pPrev = pts[this.minIndex - 1];
    var pNext = pts[this.minIndex + 1];
    var orientation = jsts.algorithm.CGAlgorithms.computeOrientation(this.minCoord, pNext, pPrev);
    var usePrev = false;
    if (pPrev.y < this.minCoord.y && pNext.y < this.minCoord.y && orientation === jsts.algorithm.CGAlgorithms.COUNTERCLOCKWISE) {
      usePrev = true;
    } else if (pPrev.y > this.minCoord.y && pNext.y > this.minCoord.y && orientation === jsts.algorithm.CGAlgorithms.CLOCKWISE) {
      usePrev = true;
    }
    if (usePrev) {
      this.minIndex = this.minIndex - 1;
    }
  };
  jsts.operation.buffer.RightmostEdgeFinder.prototype.checkForRightmostCoordinate = function(de) {
    var coord = de.getEdge().getCoordinates();
    for (var i = 0; i < coord.length - 1; i++) {
      if (this.minCoord === null || coord[i].x > this.minCoord.x) {
        this.minDe = de;
        this.minIndex = i;
        this.minCoord = coord[i];
      }
    }
  };
  jsts.operation.buffer.RightmostEdgeFinder.prototype.getRightmostSide = function(de, index) {
    var side = this.getRightmostSideOfSegment(de, index);
    if (side < 0)
      side = this.getRightmostSideOfSegment(de, index - 1);
    if (side < 0) {
      this.minCoord = null;
      this.checkForRightmostCoordinate(de);
    }
    return side;
  };
  jsts.operation.buffer.RightmostEdgeFinder.prototype.getRightmostSideOfSegment = function(de, i) {
    var e = de.getEdge();
    var coord = e.getCoordinates();
    if (i < 0 || i + 1 >= coord.length)
      return -1;
    if (coord[i].y == coord[i + 1].y)
      return -1;
    var pos = jsts.geomgraph.Position.LEFT;
    if (coord[i].y < coord[i + 1].y)
      pos = jsts.geomgraph.Position.RIGHT;
    return pos;
  };
})(require("process"));
