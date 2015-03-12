/* */ 
(function(process) {
  (function() {
    var PointLocator = jsts.algorithm.PointLocator;
    var Location = jsts.geom.Location;
    var EdgeList = jsts.geomgraph.EdgeList;
    var Label = jsts.geomgraph.Label;
    var PlanarGraph = jsts.geomgraph.PlanarGraph;
    var Position = jsts.geomgraph.Position;
    var EdgeNodingValidator = jsts.geomgraph.EdgeNodingValidator;
    var GeometryGraphOperation = jsts.operation.GeometryGraphOperation;
    var OverlayNodeFactory = jsts.operation.overlay.OverlayNodeFactory;
    var PolygonBuilder = jsts.operation.overlay.PolygonBuilder;
    var LineBuilder = jsts.operation.overlay.LineBuilder;
    var PointBuilder = jsts.operation.overlay.PointBuilder;
    var Assert = jsts.util.Assert;
    var ArrayList = javascript.util.ArrayList;
    jsts.operation.overlay.OverlayOp = function(g0, g1) {
      this.ptLocator = new PointLocator();
      this.edgeList = new EdgeList();
      this.resultPolyList = new ArrayList();
      this.resultLineList = new ArrayList();
      this.resultPointList = new ArrayList();
      GeometryGraphOperation.call(this, g0, g1);
      this.graph = new PlanarGraph(new OverlayNodeFactory());
      this.geomFact = g0.getFactory();
    };
    jsts.operation.overlay.OverlayOp.prototype = new GeometryGraphOperation();
    jsts.operation.overlay.OverlayOp.constructor = jsts.operation.overlay.OverlayOp;
    jsts.operation.overlay.OverlayOp.INTERSECTION = 1;
    jsts.operation.overlay.OverlayOp.UNION = 2;
    jsts.operation.overlay.OverlayOp.DIFFERENCE = 3;
    jsts.operation.overlay.OverlayOp.SYMDIFFERENCE = 4;
    jsts.operation.overlay.OverlayOp.overlayOp = function(geom0, geom1, opCode) {
      var gov = new jsts.operation.overlay.OverlayOp(geom0, geom1);
      var geomOv = gov.getResultGeometry(opCode);
      return geomOv;
    };
    jsts.operation.overlay.OverlayOp.isResultOfOp = function(label, opCode) {
      if (arguments.length === 3) {
        return jsts.operation.overlay.OverlayOp.isResultOfOp2.apply(this, arguments);
      }
      var loc0 = label.getLocation(0);
      var loc1 = label.getLocation(1);
      return jsts.operation.overlay.OverlayOp.isResultOfOp2(loc0, loc1, opCode);
    };
    jsts.operation.overlay.OverlayOp.isResultOfOp2 = function(loc0, loc1, opCode) {
      if (loc0 == Location.BOUNDARY)
        loc0 = Location.INTERIOR;
      if (loc1 == Location.BOUNDARY)
        loc1 = Location.INTERIOR;
      switch (opCode) {
        case jsts.operation.overlay.OverlayOp.INTERSECTION:
          return loc0 == Location.INTERIOR && loc1 == Location.INTERIOR;
        case jsts.operation.overlay.OverlayOp.UNION:
          return loc0 == Location.INTERIOR || loc1 == Location.INTERIOR;
        case jsts.operation.overlay.OverlayOp.DIFFERENCE:
          return loc0 == Location.INTERIOR && loc1 != Location.INTERIOR;
        case jsts.operation.overlay.OverlayOp.SYMDIFFERENCE:
          return (loc0 == Location.INTERIOR && loc1 != Location.INTERIOR) || (loc0 != Location.INTERIOR && loc1 == Location.INTERIOR);
      }
      return false;
    };
    jsts.operation.overlay.OverlayOp.prototype.ptLocator = null;
    jsts.operation.overlay.OverlayOp.prototype.geomFact = null;
    jsts.operation.overlay.OverlayOp.prototype.resultGeom = null;
    jsts.operation.overlay.OverlayOp.prototype.graph = null;
    jsts.operation.overlay.OverlayOp.prototype.edgeList = null;
    jsts.operation.overlay.OverlayOp.prototype.resultPolyList = null;
    jsts.operation.overlay.OverlayOp.prototype.resultLineList = null;
    jsts.operation.overlay.OverlayOp.prototype.resultPointList = null;
    jsts.operation.overlay.OverlayOp.prototype.getResultGeometry = function(funcCode) {
      this.computeOverlay(funcCode);
      return this.resultGeom;
    };
    jsts.operation.overlay.OverlayOp.prototype.getGraph = function() {
      return this.graph;
    };
    jsts.operation.overlay.OverlayOp.prototype.computeOverlay = function(opCode) {
      this.copyPoints(0);
      this.copyPoints(1);
      this.arg[0].computeSelfNodes(this.li, false);
      this.arg[1].computeSelfNodes(this.li, false);
      this.arg[0].computeEdgeIntersections(this.arg[1], this.li, true);
      var baseSplitEdges = new ArrayList();
      this.arg[0].computeSplitEdges(baseSplitEdges);
      this.arg[1].computeSplitEdges(baseSplitEdges);
      var splitEdges = baseSplitEdges;
      this.insertUniqueEdges(baseSplitEdges);
      this.computeLabelsFromDepths();
      this.replaceCollapsedEdges();
      EdgeNodingValidator.checkValid(this.edgeList.getEdges());
      this.graph.addEdges(this.edgeList.getEdges());
      this.computeLabelling();
      this.labelIncompleteNodes();
      this.findResultAreaEdges(opCode);
      this.cancelDuplicateResultEdges();
      var polyBuilder = new PolygonBuilder(this.geomFact);
      polyBuilder.add(this.graph);
      this.resultPolyList = polyBuilder.getPolygons();
      var lineBuilder = new LineBuilder(this, this.geomFact, this.ptLocator);
      this.resultLineList = lineBuilder.build(opCode);
      var pointBuilder = new PointBuilder(this, this.geomFact, this.ptLocator);
      this.resultPointList = pointBuilder.build(opCode);
      this.resultGeom = this.computeGeometry(this.resultPointList, this.resultLineList, this.resultPolyList, opCode);
    };
    jsts.operation.overlay.OverlayOp.prototype.insertUniqueEdges = function(edges) {
      for (var i = edges.iterator(); i.hasNext(); ) {
        var e = i.next();
        this.insertUniqueEdge(e);
      }
    };
    jsts.operation.overlay.OverlayOp.prototype.insertUniqueEdge = function(e) {
      var existingEdge = this.edgeList.findEqualEdge(e);
      if (existingEdge !== null) {
        var existingLabel = existingEdge.getLabel();
        var labelToMerge = e.getLabel();
        if (!existingEdge.isPointwiseEqual(e)) {
          labelToMerge = new Label(e.getLabel());
          labelToMerge.flip();
        }
        var depth = existingEdge.getDepth();
        if (depth.isNull()) {
          depth.add(existingLabel);
        }
        depth.add(labelToMerge);
        existingLabel.merge(labelToMerge);
      } else {
        this.edgeList.add(e);
      }
    };
    jsts.operation.overlay.OverlayOp.prototype.computeLabelsFromDepths = function() {
      for (var it = this.edgeList.iterator(); it.hasNext(); ) {
        var e = it.next();
        var lbl = e.getLabel();
        var depth = e.getDepth();
        if (!depth.isNull()) {
          depth.normalize();
          for (var i = 0; i < 2; i++) {
            if (!lbl.isNull(i) && lbl.isArea() && !depth.isNull(i)) {
              if (depth.getDelta(i) == 0) {
                lbl.toLine(i);
              } else {
                Assert.isTrue(!depth.isNull(i, Position.LEFT), 'depth of LEFT side has not been initialized');
                lbl.setLocation(i, Position.LEFT, depth.getLocation(i, Position.LEFT));
                Assert.isTrue(!depth.isNull(i, Position.RIGHT), 'depth of RIGHT side has not been initialized');
                lbl.setLocation(i, Position.RIGHT, depth.getLocation(i, Position.RIGHT));
              }
            }
          }
        }
      }
    };
    jsts.operation.overlay.OverlayOp.prototype.replaceCollapsedEdges = function() {
      var newEdges = new ArrayList();
      for (var it = this.edgeList.iterator(); it.hasNext(); ) {
        var e = it.next();
        if (e.isCollapsed()) {
          it.remove();
          newEdges.add(e.getCollapsedEdge());
        }
      }
      this.edgeList.addAll(newEdges);
    };
    jsts.operation.overlay.OverlayOp.prototype.copyPoints = function(argIndex) {
      for (var i = this.arg[argIndex].getNodeIterator(); i.hasNext(); ) {
        var graphNode = i.next();
        var newNode = this.graph.addNode(graphNode.getCoordinate());
        newNode.setLabel(argIndex, graphNode.getLabel().getLocation(argIndex));
      }
    };
    jsts.operation.overlay.OverlayOp.prototype.computeLabelling = function() {
      for (var nodeit = this.graph.getNodes().iterator(); nodeit.hasNext(); ) {
        var node = nodeit.next();
        node.getEdges().computeLabelling(this.arg);
      }
      this.mergeSymLabels();
      this.updateNodeLabelling();
    };
    jsts.operation.overlay.OverlayOp.prototype.mergeSymLabels = function() {
      for (var nodeit = this.graph.getNodes().iterator(); nodeit.hasNext(); ) {
        var node = nodeit.next();
        node.getEdges().mergeSymLabels();
      }
    };
    jsts.operation.overlay.OverlayOp.prototype.updateNodeLabelling = function() {
      for (var nodeit = this.graph.getNodes().iterator(); nodeit.hasNext(); ) {
        var node = nodeit.next();
        var lbl = node.getEdges().getLabel();
        node.getLabel().merge(lbl);
      }
    };
    jsts.operation.overlay.OverlayOp.prototype.labelIncompleteNodes = function() {
      var nodeCount = 0;
      for (var ni = this.graph.getNodes().iterator(); ni.hasNext(); ) {
        var n = ni.next();
        var label = n.getLabel();
        if (n.isIsolated()) {
          nodeCount++;
          if (label.isNull(0))
            this.labelIncompleteNode(n, 0);
          else
            this.labelIncompleteNode(n, 1);
        }
        n.getEdges().updateLabelling(label);
      }
    };
    jsts.operation.overlay.OverlayOp.prototype.labelIncompleteNode = function(n, targetIndex) {
      var loc = this.ptLocator.locate(n.getCoordinate(), this.arg[targetIndex].getGeometry());
      n.getLabel().setLocation(targetIndex, loc);
    };
    jsts.operation.overlay.OverlayOp.prototype.findResultAreaEdges = function(opCode) {
      for (var it = this.graph.getEdgeEnds().iterator(); it.hasNext(); ) {
        var de = it.next();
        var label = de.getLabel();
        if (label.isArea() && !de.isInteriorAreaEdge() && jsts.operation.overlay.OverlayOp.isResultOfOp(label.getLocation(0, Position.RIGHT), label.getLocation(1, Position.RIGHT), opCode)) {
          de.setInResult(true);
        }
      }
    };
    jsts.operation.overlay.OverlayOp.prototype.cancelDuplicateResultEdges = function() {
      for (var it = this.graph.getEdgeEnds().iterator(); it.hasNext(); ) {
        var de = it.next();
        var sym = de.getSym();
        if (de.isInResult() && sym.isInResult()) {
          de.setInResult(false);
          sym.setInResult(false);
        }
      }
    };
    jsts.operation.overlay.OverlayOp.prototype.isCoveredByLA = function(coord) {
      if (this.isCovered(coord, this.resultLineList))
        return true;
      if (this.isCovered(coord, this.resultPolyList))
        return true;
      return false;
    };
    jsts.operation.overlay.OverlayOp.prototype.isCoveredByA = function(coord) {
      if (this.isCovered(coord, this.resultPolyList))
        return true;
      return false;
    };
    jsts.operation.overlay.OverlayOp.prototype.isCovered = function(coord, geomList) {
      for (var it = geomList.iterator(); it.hasNext(); ) {
        var geom = it.next();
        var loc = this.ptLocator.locate(coord, geom);
        if (loc != Location.EXTERIOR)
          return true;
      }
      return false;
    };
    jsts.operation.overlay.OverlayOp.prototype.computeGeometry = function(resultPointList, resultLineList, resultPolyList, opcode) {
      var geomList = new ArrayList();
      geomList.addAll(resultPointList);
      geomList.addAll(resultLineList);
      geomList.addAll(resultPolyList);
      return this.geomFact.buildGeometry(geomList);
    };
    jsts.operation.overlay.OverlayOp.prototype.createEmptyResult = function(opCode) {
      var result = null;
      switch (resultDimension(opCode, this.arg[0].getGeometry(), this.arg[1].getGeometry())) {
        case -1:
          result = geomFact.createGeometryCollection();
          break;
        case 0:
          result = geomFact.createPoint(null);
          break;
        case 1:
          result = geomFact.createLineString(null);
          break;
        case 2:
          result = geomFact.createPolygon(null, null);
          break;
      }
      return result;
    };
    jsts.operation.overlay.OverlayOp.prototype.resultDimension = function(opCode, g0, g1) {
      var dim0 = g0.getDimension();
      var dim1 = g1.getDimension();
      var resultDimension = -1;
      switch (opCode) {
        case jsts.operation.overlay.OverlayOp.INTERSECTION:
          resultDimension = Math.min(dim0, dim1);
          break;
        case jsts.operation.overlay.OverlayOp.UNION:
          resultDimension = Math.max(dim0, dim1);
          break;
        case jsts.operation.overlay.OverlayOp.DIFFERENCE:
          resultDimension = dim0;
          break;
        case jsts.operation.overlay.OverlayOp.SYMDIFFERENCE:
          resultDimension = Math.max(dim0, dim1);
          break;
      }
      return resultDimension;
    };
  })();
})(require("process"));
