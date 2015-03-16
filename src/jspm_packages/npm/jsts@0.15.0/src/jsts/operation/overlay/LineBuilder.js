/* */ 
(function(process) {
  (function() {
    var Assert = jsts.util.Assert;
    var ArrayList = javascript.util.ArrayList;
    var LineBuilder = function(op, geometryFactory, ptLocator) {
      this.lineEdgesList = new ArrayList();
      this.resultLineList = new ArrayList();
      this.op = op;
      this.geometryFactory = geometryFactory;
      this.ptLocator = ptLocator;
    };
    LineBuilder.prototype.op = null;
    LineBuilder.prototype.geometryFactory = null;
    LineBuilder.prototype.ptLocator = null;
    LineBuilder.prototype.lineEdgesList = null;
    LineBuilder.prototype.resultLineList = null;
    LineBuilder.prototype.build = function(opCode) {
      this.findCoveredLineEdges();
      this.collectLines(opCode);
      this.buildLines(opCode);
      return this.resultLineList;
    };
    LineBuilder.prototype.findCoveredLineEdges = function() {
      for (var nodeit = this.op.getGraph().getNodes().iterator(); nodeit.hasNext(); ) {
        var node = nodeit.next();
        node.getEdges().findCoveredLineEdges();
      }
      for (var it = this.op.getGraph().getEdgeEnds().iterator(); it.hasNext(); ) {
        var de = it.next();
        var e = de.getEdge();
        if (de.isLineEdge() && !e.isCoveredSet()) {
          var isCovered = this.op.isCoveredByA(de.getCoordinate());
          e.setCovered(isCovered);
        }
      }
    };
    LineBuilder.prototype.collectLines = function(opCode) {
      for (var it = this.op.getGraph().getEdgeEnds().iterator(); it.hasNext(); ) {
        var de = it.next();
        this.collectLineEdge(de, opCode, this.lineEdgesList);
        this.collectBoundaryTouchEdge(de, opCode, this.lineEdgesList);
      }
    };
    LineBuilder.prototype.collectLineEdge = function(de, opCode, edges) {
      var label = de.getLabel();
      var e = de.getEdge();
      if (de.isLineEdge()) {
        if (!de.isVisited() && jsts.operation.overlay.OverlayOp.isResultOfOp(label, opCode) && !e.isCovered()) {
          edges.add(e);
          de.setVisitedEdge(true);
        }
      }
    };
    LineBuilder.prototype.collectBoundaryTouchEdge = function(de, opCode, edges) {
      var label = de.getLabel();
      if (de.isLineEdge())
        return ;
      if (de.isVisited())
        return ;
      if (de.isInteriorAreaEdge())
        return ;
      if (de.getEdge().isInResult())
        return ;
      Assert.isTrue(!(de.isInResult() || de.getSym().isInResult()) || !de.getEdge().isInResult());
      if (jsts.operation.overlay.OverlayOp.isResultOfOp(label, opCode) && opCode === jsts.operation.overlay.OverlayOp.INTERSECTION) {
        edges.add(de.getEdge());
        de.setVisitedEdge(true);
      }
    };
    LineBuilder.prototype.buildLines = function(opCode) {
      for (var it = this.lineEdgesList.iterator(); it.hasNext(); ) {
        var e = it.next();
        var label = e.getLabel();
        var line = this.geometryFactory.createLineString(e.getCoordinates());
        this.resultLineList.add(line);
        e.setInResult(true);
      }
    };
    LineBuilder.prototype.labelIsolatedLines = function(edgesList) {
      for (var it = edgesList.iterator(); it.hasNext(); ) {
        var e = it.next();
        var label = e.getLabel();
        if (e.isIsolated()) {
          if (label.isNull(0))
            this.labelIsolatedLine(e, 0);
          else
            this.labelIsolatedLine(e, 1);
        }
      }
    };
    LineBuilder.prototype.labelIsolatedLine = function(e, targetIndex) {
      var loc = ptLocator.locate(e.getCoordinate(), op.getArgGeometry(targetIndex));
      e.getLabel().setLocation(targetIndex, loc);
    };
    jsts.operation.overlay.LineBuilder = LineBuilder;
  })();
})(require("process"));
