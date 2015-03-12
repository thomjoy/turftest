/* */ 
(function(process) {
  jsts.operation.valid.ConnectedInteriorTester = function(geomGraph) {
    this.geomGraph = geomGraph;
    this.geometryFactory = new jsts.geom.GeometryFactory();
    this.disconnectedRingcoord = null;
  };
  jsts.operation.valid.ConnectedInteriorTester.findDifferentPoint = function(coord, pt) {
    var i = 0,
        il = coord.length;
    for (i; i < il; i++) {
      if (!coord[i].equals(pt))
        return coord[i];
    }
    return null;
  };
  jsts.operation.valid.ConnectedInteriorTester.prototype.getCoordinate = function() {
    return this.disconnectedRingcoord;
  };
  jsts.operation.valid.ConnectedInteriorTester.prototype.isInteriorsConnected = function() {
    var splitEdges = new javascript.util.ArrayList();
    this.geomGraph.computeSplitEdges(splitEdges);
    var graph = new jsts.geomgraph.PlanarGraph(new jsts.operation.overlay.OverlayNodeFactory());
    graph.addEdges(splitEdges);
    this.setInteriorEdgesInResult(graph);
    graph.linkResultDirectedEdges();
    var edgeRings = this.buildEdgeRings(graph.getEdgeEnds());
    this.visitShellInteriors(this.geomGraph.getGeometry(), graph);
    return !this.hasUnvisitedShellEdge(edgeRings);
  };
  jsts.operation.valid.ConnectedInteriorTester.prototype.setInteriorEdgesInResult = function(graph) {
    var it = graph.getEdgeEnds().iterator(),
        de;
    while (it.hasNext()) {
      de = it.next();
      if (de.getLabel().getLocation(0, jsts.geomgraph.Position.RIGHT) == jsts.geom.Location.INTERIOR) {
        de.setInResult(true);
      }
    }
  };
  jsts.operation.valid.ConnectedInteriorTester.prototype.buildEdgeRings = function(dirEdges) {
    var edgeRings = new javascript.util.ArrayList();
    for (var it = dirEdges.iterator(); it.hasNext(); ) {
      var de = it.next();
      if (de.isInResult() && de.getEdgeRing() == null) {
        var er = new jsts.operation.overlay.MaximalEdgeRing(de, this.geometryFactory);
        er.linkDirectedEdgesForMinimalEdgeRings();
        var minEdgeRings = er.buildMinimalRings();
        var i = 0,
            il = minEdgeRings.length;
        for (i; i < il; i++) {
          edgeRings.add(minEdgeRings[i]);
        }
      }
    }
    return edgeRings;
  };
  jsts.operation.valid.ConnectedInteriorTester.prototype.visitShellInteriors = function(g, graph) {
    if (g instanceof jsts.geom.Polygon) {
      var p = g;
      this.visitInteriorRing(p.getExteriorRing(), graph);
    }
    if (g instanceof jsts.geom.MultiPolygon) {
      var mp = g;
      for (var i = 0; i < mp.getNumGeometries(); i++) {
        var p = mp.getGeometryN(i);
        this.visitInteriorRing(p.getExteriorRing(), graph);
      }
    }
  };
  jsts.operation.valid.ConnectedInteriorTester.prototype.visitInteriorRing = function(ring, graph) {
    var pts = ring.getCoordinates();
    var pt0 = pts[0];
    var pt1 = jsts.operation.valid.ConnectedInteriorTester.findDifferentPoint(pts, pt0);
    var e = graph.findEdgeInSameDirection(pt0, pt1);
    var de = graph.findEdgeEnd(e);
    var intDe = null;
    if (de.getLabel().getLocation(0, jsts.geomgraph.Position.RIGHT) == jsts.geom.Location.INTERIOR) {
      intDe = de;
    } else if (de.getSym().getLabel().getLocation(0, jsts.geomgraph.Position.RIGHT) == jsts.geom.Location.INTERIOR) {
      intDe = de.getSym();
    }
    this.visitLinkedDirectedEdges(intDe);
  };
  jsts.operation.valid.ConnectedInteriorTester.prototype.visitLinkedDirectedEdges = function(start) {
    var startDe = start;
    var de = start;
    do {
      de.setVisited(true);
      de = de.getNext();
    } while (de != startDe);
  };
  jsts.operation.valid.ConnectedInteriorTester.prototype.hasUnvisitedShellEdge = function(edgeRings) {
    for (var i = 0; i < edgeRings.size(); i++) {
      var er = edgeRings.get(i);
      if (er.isHole()) {
        continue;
      }
      var edges = er.getEdges();
      var de = edges[0];
      if (de.getLabel().getLocation(0, jsts.geomgraph.Position.RIGHT) != jsts.geom.Location.INTERIOR) {
        continue;
      }
      for (var j = 0; j < edges.length; j++) {
        de = edges[j];
        if (!de.isVisited()) {
          disconnectedRingcoord = de.getCoordinate();
          return true;
        }
      }
    }
    return false;
  };
})(require("process"));
