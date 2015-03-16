/* */ 
(function(process) {
  jsts.operation.overlay.PolygonBuilder = function(geometryFactory) {
    this.shellList = [];
    this.geometryFactory = geometryFactory;
  };
  jsts.operation.overlay.PolygonBuilder.prototype.geometryFactory = null;
  jsts.operation.overlay.PolygonBuilder.prototype.shellList = null;
  jsts.operation.overlay.PolygonBuilder.prototype.add = function(graph) {
    if (arguments.length === 2) {
      this.add2.apply(this, arguments);
      return ;
    }
    this.add2(graph.getEdgeEnds(), graph.getNodes());
  };
  jsts.operation.overlay.PolygonBuilder.prototype.add2 = function(dirEdges, nodes) {
    jsts.geomgraph.PlanarGraph.linkResultDirectedEdges(nodes);
    var maxEdgeRings = this.buildMaximalEdgeRings(dirEdges);
    var freeHoleList = [];
    var edgeRings = this.buildMinimalEdgeRings(maxEdgeRings, this.shellList, freeHoleList);
    this.sortShellsAndHoles(edgeRings, this.shellList, freeHoleList);
    this.placeFreeHoles(this.shellList, freeHoleList);
  };
  jsts.operation.overlay.PolygonBuilder.prototype.getPolygons = function() {
    var resultPolyList = this.computePolygons(this.shellList);
    return resultPolyList;
  };
  jsts.operation.overlay.PolygonBuilder.prototype.buildMaximalEdgeRings = function(dirEdges) {
    var maxEdgeRings = [];
    for (var it = dirEdges.iterator(); it.hasNext(); ) {
      var de = it.next();
      if (de.isInResult() && de.getLabel().isArea()) {
        if (de.getEdgeRing() == null) {
          var er = new jsts.operation.overlay.MaximalEdgeRing(de, this.geometryFactory);
          maxEdgeRings.push(er);
          er.setInResult();
        }
      }
    }
    return maxEdgeRings;
  };
  jsts.operation.overlay.PolygonBuilder.prototype.buildMinimalEdgeRings = function(maxEdgeRings, shellList, freeHoleList) {
    var edgeRings = [];
    for (var i = 0; i < maxEdgeRings.length; i++) {
      var er = maxEdgeRings[i];
      if (er.getMaxNodeDegree() > 2) {
        er.linkDirectedEdgesForMinimalEdgeRings();
        var minEdgeRings = er.buildMinimalRings();
        var shell = this.findShell(minEdgeRings);
        if (shell !== null) {
          this.placePolygonHoles(shell, minEdgeRings);
          shellList.push(shell);
        } else {
          freeHoleList = freeHoleList.concat(minEdgeRings);
        }
      } else {
        edgeRings.push(er);
      }
    }
    return edgeRings;
  };
  jsts.operation.overlay.PolygonBuilder.prototype.findShell = function(minEdgeRings) {
    var shellCount = 0;
    var shell = null;
    for (var i = 0; i < minEdgeRings.length; i++) {
      var er = minEdgeRings[i];
      if (!er.isHole()) {
        shell = er;
        shellCount++;
      }
    }
    jsts.util.Assert.isTrue(shellCount <= 1, 'found two shells in MinimalEdgeRing list');
    return shell;
  };
  jsts.operation.overlay.PolygonBuilder.prototype.placePolygonHoles = function(shell, minEdgeRings) {
    for (var i = 0; i < minEdgeRings.length; i++) {
      var er = minEdgeRings[i];
      if (er.isHole()) {
        er.setShell(shell);
      }
    }
  };
  jsts.operation.overlay.PolygonBuilder.prototype.sortShellsAndHoles = function(edgeRings, shellList, freeHoleList) {
    for (var i = 0; i < edgeRings.length; i++) {
      var er = edgeRings[i];
      if (er.isHole()) {
        freeHoleList.push(er);
      } else {
        shellList.push(er);
      }
    }
  };
  jsts.operation.overlay.PolygonBuilder.prototype.placeFreeHoles = function(shellList, freeHoleList) {
    for (var i = 0; i < freeHoleList.length; i++) {
      var hole = freeHoleList[i];
      if (hole.getShell() == null) {
        var shell = this.findEdgeRingContaining(hole, shellList);
        if (shell === null)
          throw new jsts.error.TopologyError('unable to assign hole to a shell', hole.getCoordinate(0));
        hole.setShell(shell);
      }
    }
  };
  jsts.operation.overlay.PolygonBuilder.prototype.findEdgeRingContaining = function(testEr, shellList) {
    var testRing = testEr.getLinearRing();
    var testEnv = testRing.getEnvelopeInternal();
    var testPt = testRing.getCoordinateN(0);
    var minShell = null;
    var minEnv = null;
    for (var i = 0; i < shellList.length; i++) {
      var tryShell = shellList[i];
      var tryRing = tryShell.getLinearRing();
      var tryEnv = tryRing.getEnvelopeInternal();
      if (minShell !== null)
        minEnv = minShell.getLinearRing().getEnvelopeInternal();
      var isContained = false;
      if (tryEnv.contains(testEnv) && jsts.algorithm.CGAlgorithms.isPointInRing(testPt, tryRing.getCoordinates()))
        isContained = true;
      if (isContained) {
        if (minShell == null || minEnv.contains(tryEnv)) {
          minShell = tryShell;
        }
      }
    }
    return minShell;
  };
  jsts.operation.overlay.PolygonBuilder.prototype.computePolygons = function(shellList) {
    var resultPolyList = new javascript.util.ArrayList();
    for (var i = 0; i < shellList.length; i++) {
      var er = shellList[i];
      var poly = er.toPolygon(this.geometryFactory);
      resultPolyList.add(poly);
    }
    return resultPolyList;
  };
  jsts.operation.overlay.PolygonBuilder.prototype.containsPoint = function(p) {
    for (var i = 0; i < this.shellList.length; i++) {
      var er = this.shellList[i];
      if (er.containsPoint(p))
        return true;
    }
    return false;
  };
})(require("process"));
