/* */ 
(function(Buffer, process) {
  jsts.operation.buffer.BufferBuilder = function(bufParams) {
    this.bufParams = bufParams;
    this.edgeList = new jsts.geomgraph.EdgeList();
  };
  jsts.operation.buffer.BufferBuilder.depthDelta = function(label) {
    var lLoc = label.getLocation(0, jsts.geomgraph.Position.LEFT);
    var rLoc = label.getLocation(0, jsts.geomgraph.Position.RIGHT);
    if (lLoc === jsts.geom.Location.INTERIOR && rLoc === jsts.geom.Location.EXTERIOR)
      return 1;
    else if (lLoc === jsts.geom.Location.EXTERIOR && rLoc === jsts.geom.Location.INTERIOR)
      return -1;
    return 0;
  };
  jsts.operation.buffer.BufferBuilder.prototype.bufParams = null;
  jsts.operation.buffer.BufferBuilder.prototype.workingPrecisionModel = null;
  jsts.operation.buffer.BufferBuilder.prototype.workingNoder = null;
  jsts.operation.buffer.BufferBuilder.prototype.geomFact = null;
  jsts.operation.buffer.BufferBuilder.prototype.graph = null;
  jsts.operation.buffer.BufferBuilder.prototype.edgeList = null;
  jsts.operation.buffer.BufferBuilder.prototype.setWorkingPrecisionModel = function(pm) {
    this.workingPrecisionModel = pm;
  };
  jsts.operation.buffer.BufferBuilder.prototype.setNoder = function(noder) {
    this.workingNoder = noder;
  };
  jsts.operation.buffer.BufferBuilder.prototype.buffer = function(g, distance) {
    var precisionModel = this.workingPrecisionModel;
    if (precisionModel === null)
      precisionModel = g.getPrecisionModel();
    this.geomFact = g.getFactory();
    var curveBuilder = new jsts.operation.buffer.OffsetCurveBuilder(precisionModel, this.bufParams);
    var curveSetBuilder = new jsts.operation.buffer.OffsetCurveSetBuilder(g, distance, curveBuilder);
    var bufferSegStrList = curveSetBuilder.getCurves();
    if (bufferSegStrList.size() <= 0) {
      return this.createEmptyResultGeometry();
    }
    this.computeNodedEdges(bufferSegStrList, precisionModel);
    this.graph = new jsts.geomgraph.PlanarGraph(new jsts.operation.overlay.OverlayNodeFactory());
    this.graph.addEdges(this.edgeList.getEdges());
    var subgraphList = this.createSubgraphs(this.graph);
    var polyBuilder = new jsts.operation.overlay.PolygonBuilder(this.geomFact);
    this.buildSubgraphs(subgraphList, polyBuilder);
    var resultPolyList = polyBuilder.getPolygons();
    if (resultPolyList.size() <= 0) {
      return this.createEmptyResultGeometry();
    }
    var resultGeom = this.geomFact.buildGeometry(resultPolyList);
    return resultGeom;
  };
  jsts.operation.buffer.BufferBuilder.prototype.getNoder = function(precisionModel) {
    if (this.workingNoder !== null)
      return this.workingNoder;
    var noder = new jsts.noding.MCIndexNoder();
    var li = new jsts.algorithm.RobustLineIntersector();
    li.setPrecisionModel(precisionModel);
    noder.setSegmentIntersector(new jsts.noding.IntersectionAdder(li));
    return noder;
  };
  jsts.operation.buffer.BufferBuilder.prototype.computeNodedEdges = function(bufferSegStrList, precisionModel) {
    var noder = this.getNoder(precisionModel);
    noder.computeNodes(bufferSegStrList);
    var nodedSegStrings = noder.getNodedSubstrings();
    for (var i = nodedSegStrings.iterator(); i.hasNext(); ) {
      var segStr = i.next();
      var oldLabel = segStr.getData();
      var edge = new jsts.geomgraph.Edge(segStr.getCoordinates(), new jsts.geomgraph.Label(oldLabel));
      this.insertUniqueEdge(edge);
    }
  };
  jsts.operation.buffer.BufferBuilder.prototype.insertUniqueEdge = function(e) {
    var existingEdge = this.edgeList.findEqualEdge(e);
    if (existingEdge != null) {
      var existingLabel = existingEdge.getLabel();
      var labelToMerge = e.getLabel();
      if (!existingEdge.isPointwiseEqual(e)) {
        labelToMerge = new jsts.geomgraph.Label(e.getLabel());
        labelToMerge.flip();
      }
      existingLabel.merge(labelToMerge);
      var mergeDelta = jsts.operation.buffer.BufferBuilder.depthDelta(labelToMerge);
      var existingDelta = existingEdge.getDepthDelta();
      var newDelta = existingDelta + mergeDelta;
      existingEdge.setDepthDelta(newDelta);
    } else {
      this.edgeList.add(e);
      e.setDepthDelta(jsts.operation.buffer.BufferBuilder.depthDelta(e.getLabel()));
    }
  };
  jsts.operation.buffer.BufferBuilder.prototype.createSubgraphs = function(graph) {
    var subgraphList = [];
    for (var i = graph.getNodes().iterator(); i.hasNext(); ) {
      var node = i.next();
      if (!node.isVisited()) {
        var subgraph = new jsts.operation.buffer.BufferSubgraph();
        subgraph.create(node);
        subgraphList.push(subgraph);
      }
    }
    var compare = function(a, b) {
      return a.compareTo(b);
    };
    subgraphList.sort(compare);
    subgraphList.reverse();
    return subgraphList;
  };
  jsts.operation.buffer.BufferBuilder.prototype.buildSubgraphs = function(subgraphList, polyBuilder) {
    var processedGraphs = [];
    for (var i = 0; i < subgraphList.length; i++) {
      var subgraph = subgraphList[i];
      var p = subgraph.getRightmostCoordinate();
      var locater = new jsts.operation.buffer.SubgraphDepthLocater(processedGraphs);
      var outsideDepth = locater.getDepth(p);
      subgraph.computeDepth(outsideDepth);
      subgraph.findResultEdges();
      processedGraphs.push(subgraph);
      polyBuilder.add(subgraph.getDirectedEdges(), subgraph.getNodes());
    }
  };
  jsts.operation.buffer.BufferBuilder.convertSegStrings = function(it) {
    var fact = new jsts.geom.GeometryFactory();
    var lines = new javascript.util.ArrayList();
    while (it.hasNext()) {
      var ss = it.next();
      var line = fact.createLineString(ss.getCoordinates());
      lines.add(line);
    }
    return fact.buildGeometry(lines);
  };
  jsts.operation.buffer.BufferBuilder.prototype.createEmptyResultGeometry = function() {
    var emptyGeom = this.geomFact.createPolygon(null, null);
    return emptyGeom;
  };
})(require("buffer").Buffer, require("process"));
