/* */ 
(function(Buffer, process) {
  jsts.operation.buffer.BufferSubgraph = function() {
    this.dirEdgeList = new javascript.util.ArrayList();
    this.nodes = new javascript.util.ArrayList();
    this.finder = new jsts.operation.buffer.RightmostEdgeFinder();
  };
  jsts.operation.buffer.BufferSubgraph.prototype.finder = null;
  jsts.operation.buffer.BufferSubgraph.prototype.dirEdgeList = null;
  jsts.operation.buffer.BufferSubgraph.prototype.nodes = null;
  jsts.operation.buffer.BufferSubgraph.prototype.rightMostCoord = null;
  jsts.operation.buffer.BufferSubgraph.prototype.env = null;
  jsts.operation.buffer.BufferSubgraph.prototype.getDirectedEdges = function() {
    return this.dirEdgeList;
  };
  jsts.operation.buffer.BufferSubgraph.prototype.getNodes = function() {
    return this.nodes;
  };
  jsts.operation.buffer.BufferSubgraph.prototype.getEnvelope = function() {
    if (this.env === null) {
      var edgeEnv = new jsts.geom.Envelope();
      for (var it = this.dirEdgeList.iterator(); it.hasNext(); ) {
        var dirEdge = it.next();
        var pts = dirEdge.getEdge().getCoordinates();
        for (var j = 0; j < pts.length - 1; j++) {
          edgeEnv.expandToInclude(pts[j]);
        }
      }
      this.env = edgeEnv;
    }
    return this.env;
  };
  jsts.operation.buffer.BufferSubgraph.prototype.getRightmostCoordinate = function() {
    return this.rightMostCoord;
  };
  jsts.operation.buffer.BufferSubgraph.prototype.create = function(node) {
    this.addReachable(node);
    this.finder.findEdge(this.dirEdgeList);
    this.rightMostCoord = this.finder.getCoordinate();
  };
  jsts.operation.buffer.BufferSubgraph.prototype.addReachable = function(startNode) {
    var nodeStack = [];
    nodeStack.push(startNode);
    while (nodeStack.length !== 0) {
      var node = nodeStack.pop();
      this.add(node, nodeStack);
    }
  };
  jsts.operation.buffer.BufferSubgraph.prototype.add = function(node, nodeStack) {
    node.setVisited(true);
    this.nodes.add(node);
    for (var i = node.getEdges().iterator(); i.hasNext(); ) {
      var de = i.next();
      this.dirEdgeList.add(de);
      var sym = de.getSym();
      var symNode = sym.getNode();
      if (!symNode.isVisited())
        nodeStack.push(symNode);
    }
  };
  jsts.operation.buffer.BufferSubgraph.prototype.clearVisitedEdges = function() {
    for (var it = this.dirEdgeList.iterator(); it.hasNext(); ) {
      var de = it.next();
      de.setVisited(false);
    }
  };
  jsts.operation.buffer.BufferSubgraph.prototype.computeDepth = function(outsideDepth) {
    this.clearVisitedEdges();
    var de = this.finder.getEdge();
    var n = de.getNode();
    var label = de.getLabel();
    de.setEdgeDepths(jsts.geomgraph.Position.RIGHT, outsideDepth);
    this.copySymDepths(de);
    this.computeDepths(de);
  };
  jsts.operation.buffer.BufferSubgraph.prototype.computeDepths = function(startEdge) {
    var nodesVisited = [];
    var nodeQueue = [];
    var startNode = startEdge.getNode();
    nodeQueue.push(startNode);
    nodesVisited.push(startNode);
    startEdge.setVisited(true);
    while (nodeQueue.length !== 0) {
      var n = nodeQueue.shift();
      nodesVisited.push(n);
      this.computeNodeDepth(n);
      for (var i = n.getEdges().iterator(); i.hasNext(); ) {
        var de = i.next();
        var sym = de.getSym();
        if (sym.isVisited())
          continue;
        var adjNode = sym.getNode();
        if (nodesVisited.indexOf(adjNode) === -1) {
          nodeQueue.push(adjNode);
          nodesVisited.push(adjNode);
        }
      }
    }
  };
  jsts.operation.buffer.BufferSubgraph.prototype.computeNodeDepth = function(n) {
    var startEdge = null;
    for (var i = n.getEdges().iterator(); i.hasNext(); ) {
      var de = i.next();
      if (de.isVisited() || de.getSym().isVisited()) {
        startEdge = de;
        break;
      }
    }
    if (startEdge == null)
      throw new jsts.error.TopologyError('unable to find edge to compute depths at ' + n.getCoordinate());
    n.getEdges().computeDepths(startEdge);
    for (var i = n.getEdges().iterator(); i.hasNext(); ) {
      var de = i.next();
      de.setVisited(true);
      this.copySymDepths(de);
    }
  };
  jsts.operation.buffer.BufferSubgraph.prototype.copySymDepths = function(de) {
    var sym = de.getSym();
    sym.setDepth(jsts.geomgraph.Position.LEFT, de.getDepth(jsts.geomgraph.Position.RIGHT));
    sym.setDepth(jsts.geomgraph.Position.RIGHT, de.getDepth(jsts.geomgraph.Position.LEFT));
  };
  jsts.operation.buffer.BufferSubgraph.prototype.findResultEdges = function() {
    for (var it = this.dirEdgeList.iterator(); it.hasNext(); ) {
      var de = it.next();
      if (de.getDepth(jsts.geomgraph.Position.RIGHT) >= 1 && de.getDepth(jsts.geomgraph.Position.LEFT) <= 0 && !de.isInteriorAreaEdge()) {
        de.setInResult(true);
      }
    }
  };
  jsts.operation.buffer.BufferSubgraph.prototype.compareTo = function(o) {
    var graph = o;
    if (this.rightMostCoord.x < graph.rightMostCoord.x) {
      return -1;
    }
    if (this.rightMostCoord.x > graph.rightMostCoord.x) {
      return 1;
    }
    return 0;
  };
})(require("buffer").Buffer, require("process"));
