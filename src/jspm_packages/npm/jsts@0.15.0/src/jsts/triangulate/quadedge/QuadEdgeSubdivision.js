/* */ 
(function(process) {
  jsts.triangulate.quadedge.QuadEdgeSubdivision = function(env, tolerance) {
    this.tolerance = tolerance;
    this.edgeCoincidenceTolerance = tolerance / jsts.triangulate.quadedge.QuadEdgeSubdivision.EDGE_COINCIDENCE_TOL_FACTOR;
    this.visitedKey = 0;
    this.quadEdges = [];
    this.startingEdge;
    this.tolerance;
    this.edgeCoincidenceTolerance;
    this.frameEnv;
    this.locator = null;
    this.seg = new jsts.geom.LineSegment();
    this.triEdges = new Array(3);
    this.frameVertex = new Array(3);
    this.createFrame(env);
    this.startingEdge = this.initSubdiv();
    this.locator = new jsts.triangulate.quadedge.LastFoundQuadEdgeLocator(this);
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.EDGE_COINCIDENCE_TOL_FACTOR = 1000;
  jsts.triangulate.quadedge.QuadEdgeSubdivision.getTriangleEdges = function(startQE, triEdge) {
    triEdge[0] = startQE;
    triEdge[1] = triEdge[0].lNext();
    triEdge[2] = triEdge[1].lNext();
    if (triEdge[2].lNext() != triEdge[0]) {
      throw new jsts.IllegalArgumentError('Edges do not form a triangle');
    }
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.createFrame = function(env) {
    var deltaX,
        deltaY,
        offset;
    deltaX = env.getWidth();
    deltaY = env.getHeight();
    offset = 0.0;
    if (deltaX > deltaY) {
      offset = deltaX * 10.0;
    } else {
      offset = deltaY * 10.0;
    }
    this.frameVertex[0] = new jsts.triangulate.quadedge.Vertex((env.getMaxX() + env.getMinX()) / 2.0, env.getMaxY() + offset);
    this.frameVertex[1] = new jsts.triangulate.quadedge.Vertex(env.getMinX() - offset, env.getMinY() - offset);
    this.frameVertex[2] = new jsts.triangulate.quadedge.Vertex(env.getMaxX() + offset, env.getMinY() - offset);
    this.frameEnv = new jsts.geom.Envelope(this.frameVertex[0].getCoordinate(), this.frameVertex[1].getCoordinate());
    this.frameEnv.expandToInclude(this.frameVertex[2].getCoordinate());
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.initSubdiv = function() {
    var ea,
        eb,
        ec;
    ea = this.makeEdge(this.frameVertex[0], this.frameVertex[1]);
    eb = this.makeEdge(this.frameVertex[1], this.frameVertex[2]);
    jsts.triangulate.quadedge.QuadEdge.splice(ea.sym(), eb);
    ec = this.makeEdge(this.frameVertex[2], this.frameVertex[0]);
    jsts.triangulate.quadedge.QuadEdge.splice(eb.sym(), ec);
    jsts.triangulate.quadedge.QuadEdge.splice(ec.sym(), ea);
    return ea;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.getTolerance = function() {
    return this.tolerance;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.getEnvelope = function() {
    return new jsts.geom.Envelope(this.frameEnv);
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.getEdges = function() {
    if (arguments.length > 0) {
      return this.getEdgesByFactory(arguments[0]);
    } else {
      return this.quadEdges;
    }
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.setLocator = function(locator) {
    this.locator = locator;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.makeEdge = function(o, d) {
    var q = jsts.triangulate.quadedge.QuadEdge.makeEdge(o, d);
    this.quadEdges.push(q);
    return q;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.connect = function(a, b) {
    var q = jsts.triangulate.quadedge.QuadEdge.connect(a, b);
    this.quadEdges.push(q);
    return q;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.delete_jsts = function(e) {
    jsts.triangulate.quadedge.QuadEdge.splice(e, e.oPrev());
    jsts.triangulate.quadedge.QuadEdge.splice(e.sym(), e.sym().oPrev());
    var eSym,
        eRot,
        eRotSym;
    e.eSym = e.sym();
    eRot = e.rot;
    eRotSym = e.rot.sym();
    var idx = this.quadEdges.indexOf(e);
    if (idx !== -1) {
      this.quadEdges.splice(idx, 1);
    }
    idx = this.quadEdges.indexOf(eSym);
    if (idx !== -1) {
      this.quadEdges.splice(idx, 1);
    }
    idx = this.quadEdges.indexOf(eRot);
    if (idx !== -1) {
      this.quadEdges.splice(idx, 1);
    }
    idx = this.quadEdges.indexOf(eRotSym);
    if (idx !== -1) {
      this.quadEdges.splice(idx, 1);
    }
    e.delete_jsts();
    eSym.delete_jsts();
    eRot.delete_jsts();
    eRotSym.delete_jsts();
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.locateFromEdge = function(v, startEdge) {
    var iter = 0,
        maxIter = this.quadEdges.length,
        e;
    e = startEdge;
    while (true) {
      iter++;
      if (iter > maxIter) {
        throw new jsts.error.LocateFailureError(e.toLineSegment());
      }
      if ((v.equals(e.orig())) || (v.equals(e.dest()))) {
        break;
      } else if (v.rightOf(e)) {
        e = e.sym();
      } else if (!v.rightOf(e.oNext())) {
        e = e.oNext();
      } else if (!v.rightOf(e.dPrev())) {
        e = e.dPrev();
      } else {
        break;
      }
    }
    return e;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.locate = function() {
    if (arguments.length === 1) {
      if (arguments[0] instanceof jsts.triangulate.quadedge.Vertex) {
        return this.locateByVertex(arguments[0]);
      } else {
        return this.locateByCoordinate(arguments[0]);
      }
    } else {
      return this.locateByCoordinates(arguments[0], arguments[1]);
    }
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.locateByVertex = function(v) {
    return this.locator.locate(v);
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.locateByCoordinate = function(p) {
    return this.locator.locate(new jsts.triangulate.quadedge.Vertex(p));
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.locateByCoordinates = function(p0, p1) {
    var e,
        base,
        locEdge;
    var e = this.locator.locate(new jsts.triangulate.quadedge.Vertex(p0));
    if (e === null) {
      return null;
    }
    base = e;
    if (e.dest().getCoordinate().equals2D(p0)) {
      base = e.sym();
    }
    locEdge = base;
    do {
      if (locEdge.dest().getCoordinate().equals2D(p1)) {
        return locEdge;
      }
      locEdge = locEdge.oNext();
    } while (locEdge != base);
    return null;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.insertSite = function(v) {
    var e,
        base,
        startEdge;
    e = this.locate(v);
    if ((v.equals(e.orig(), this.tolerance)) || (v.equals(e.dest(), this.tolerance))) {
      return e;
    }
    base = this.makeEdge(e.orig(), v);
    jsts.triangulate.quadedge.QuadEdge.splice(base, e);
    startEdge = base;
    do {
      base = this.connect(e, base.sym());
      e = base.oPrev();
    } while (e.lNext() != startEdge);
    return startEdge;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.isFrameEdge = function(e) {
    if (this.isFrameVertex(e.orig()) || this.isFrameVertex(e.dest())) {
      return true;
    }
    return false;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.isFrameBorderEdge = function(e) {
    var leftTri,
        rightTri,
        vLeftTriOther,
        vRightTriOther;
    leftTri = new Array(3);
    this.getTriangleEdges(e, leftTri);
    rightTri = new Array(3);
    this.getTriangleEdges(e.sym(), rightTri);
    vLeftTriOther = e.lNext().dest();
    if (this.isFrameVertex(vLeftTriOther)) {
      return true;
    }
    vRightTriOther = e.sym().lNext().dest();
    if (this.isFrameVertex(vRightTriOther)) {
      return true;
    }
    return false;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.isFrameVertex = function(v) {
    if (v.equals(this.frameVertex[0])) {
      return true;
    }
    if (v.equals(this.frameVertex[1])) {
      return true;
    }
    if (v.equals(this.frameVertex[2])) {
      return true;
    }
    return false;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.isOnEdge = function(e, p) {
    this.seg.setCoordinates(e.orig().getCoordinate(), e.dest().getCoordinate());
    var dist = this.seg.distance(p);
    return dist < this.edgeCoincidenceTolerance;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.isVertexOfEdge = function(e, v) {
    if ((v.equals(e.orig(), this.tolerance)) || (v.equals(e.dest(), this.tolerance))) {
      return true;
    }
    return false;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.getVertices = function(includeFrame) {
    var vertices = [],
        i,
        il,
        qe,
        v,
        vd;
    i = 0, il = this.quadEdges.length;
    for (i; i < il; i++) {
      qe = this.quadEdges[i];
      v = qe.orig();
      if (includeFrame || !this.isFrameVertex(v)) {
        vertices.push(v);
      }
      vd = qe.dest();
      if (includeFrame || !this.isFrameVertex(vd)) {
        vertices.push(vd);
      }
    }
    return vertices;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.getVertexUniqueEdges = function(includeFrame) {
    var edges,
        visitedVertices,
        i,
        il,
        qe,
        v,
        qd,
        vd;
    edges = [];
    visitedVertices = [];
    i = 0, il = this.quadEdges.length;
    for (i; i < il; i++) {
      qe = this.quadEdges[i];
      v = qe.orig();
      if (visitedVertices.indexOf(v) === -1) {
        visitedVertices.push(v);
        if (includeFrame || !this.isFrameVertex(v)) {
          edges.push(qe);
        }
      }
      qd = qe.sym();
      vd = qd.orig();
      if (visitedVertices.indexOf(vd) === -1) {
        visitedVertices.push(vd);
        if (includeFrame || !this.isFrameVertex(vd)) {
          edges.push(qd);
        }
      }
    }
    return edges;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.getPrimaryEdges = function(includeFrame) {
    this.visitedKey++;
    var edges,
        edgeStack,
        visitedEdges,
        edge,
        priQE;
    edges = [];
    edgeStack = [];
    edgeStack.push(this.startingEdge);
    visitedEdges = [];
    while (edgeStack.length > 0) {
      edge = edgeStack.pop();
      if (visitedEdges.indexOf(edge) === -1) {
        priQE = edge.getPrimary();
        if (includeFrame || !this.isFrameEdge(priQE)) {
          edges.push(priQE);
        }
        edgeStack.push(edge.oNext());
        edgeStack.push(edge.sym().oNext());
        visitedEdges.push(edge);
        visitedEdges.push(edge.sym());
      }
    }
    return edges;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.visitTriangles = function(triVisitor, includeFrame) {
    this.visitedKey++;
    var edgeStack,
        visitedEdges,
        edge,
        triEdges;
    edgeStack = [];
    edgeStack.push(this.startingEdge);
    visitedEdges = [];
    while (edgeStack.length > 0) {
      edge = edgeStack.pop();
      if (visitedEdges.indexOf(edge) === -1) {
        triEdges = this.fetchTriangleToVisit(edge, edgeStack, includeFrame, visitedEdges);
        if (triEdges !== null)
          triVisitor.visit(triEdges);
      }
    }
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.fetchTriangleToVisit = function(edge, edgeStack, includeFrame, visitedEdges) {
    var curr,
        edgeCount,
        isFrame,
        sym;
    curr = edge;
    edgeCount = 0;
    isFrame = false;
    do {
      this.triEdges[edgeCount] = curr;
      if (this.isFrameEdge(curr)) {
        isFrame = true;
      }
      sym = curr.sym();
      if (visitedEdges.indexOf(sym) === -1) {
        edgeStack.push(sym);
      }
      visitedEdges.push(curr);
      edgeCount++;
      curr = curr.lNext();
    } while (curr !== edge);
    if (isFrame && !includeFrame) {
      return null;
    }
    return this.triEdges;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.getTriangleEdges = function(includeFrame) {
    var visitor = new jsts.triangulate.quadedge.TriangleEdgesListVisitor();
    this.visitTriangles(visitor, includeFrame);
    return visitor.getTriangleEdges();
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.getTriangleVertices = function(includeFrame) {
    var visitor = new TriangleVertexListVisitor();
    this.visitTriangles(visitor, includeFrame);
    return visitor.getTriangleVertices();
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.getTriangleCoordinates = function(includeFrame) {
    var visitor = new jsts.triangulate.quadedge.TriangleCoordinatesVisitor();
    this.visitTriangles(visitor, includeFrame);
    return visitor.getTriangles();
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.getEdgesByFactory = function(geomFact) {
    var quadEdges,
        edges,
        i,
        il,
        qe,
        coords;
    quadEdges = this.getPrimaryEdges(false);
    edges = [];
    i = 0;
    il = quadEdges.length;
    for (i; i < il; i++) {
      qe = quadEdges[i];
      coords = [];
      coords[0] = (qe.orig().getCoordinate());
      coords[1] = (qe.dest().getCoordinate());
      edges[i] = geomFact.createLineString(coords);
    }
    return geomFact.createMultiLineString(edges);
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.getTriangles = function(geomFact) {
    var triPtsList,
        tris,
        triPt,
        i,
        il;
    triPtsList = this.getTriangleCoordinates(false);
    tris = new Array(triPtsList.length);
    i = 0, il = triPtsList.length;
    for (i; i < il; i++) {
      triPt = triPtsList[i];
      tris[i] = geomFact.createPolygon(geomFact.createLinearRing(triPt, null));
    }
    return geomFact.createGeometryCollection(tris);
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.getVoronoiDiagram = function(geomFact) {
    var vorCells = this.getVoronoiCellPolygons(geomFact);
    return geomFact.createGeometryCollection(vorCells);
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.getVoronoiCellPolygons = function(geomFact) {
    this.visitTriangles(new jsts.triangulate.quadedge.TriangleCircumcentreVisitor(), true);
    var cells,
        edges,
        i,
        il,
        qe;
    cells = [];
    edges = this.getVertexUniqueEdges(false);
    i = 0, il = edges.length;
    for (i; i < il; i++) {
      qe = edges[i];
      cells.push(this.getVoronoiCellPolygon(qe, geomFact));
    }
    return cells;
  };
  jsts.triangulate.quadedge.QuadEdgeSubdivision.prototype.getVoronoiCellPolygon = function(qe, geomFact) {
    var cellPts,
        startQe,
        cc,
        coordList,
        cellPoly,
        v;
    cellPts = [];
    startQE = qe;
    do {
      cc = qe.rot.orig().getCoordinate();
      cellPts.push(cc);
      qe = qe.oPrev();
    } while (qe !== startQE);
    coordList = new jsts.geom.CoordinateList([], false);
    coordList.add(cellPts, false);
    coordList.closeRing();
    if (coordList.size() < 4) {
      coordList.add(coordList.get(coordList.size() - 1), true);
    }
    cellPoly = geomFact.createPolygon(geomFact.createLinearRing(coordList.toArray()), null);
    v = startQE.orig();
    return cellPoly;
  };
  jsts.triangulate.quadedge.TriangleCircumcentreVisitor = function() {};
  jsts.triangulate.quadedge.TriangleCircumcentreVisitor.prototype.visit = function(triEdges) {
    var a,
        b,
        c,
        cc,
        ccVertex,
        i;
    a = triEdges[0].orig().getCoordinate();
    b = triEdges[1].orig().getCoordinate();
    c = triEdges[2].orig().getCoordinate();
    cc = jsts.geom.Triangle.circumcentre(a, b, c);
    ccVertex = new jsts.triangulate.quadedge.Vertex(cc);
    i = 0;
    for (i; i < 3; i++) {
      triEdges[i].rot.setOrig(ccVertex);
    }
  };
  jsts.triangulate.quadedge.TriangleEdgesListVisitor = function() {
    this.triList = [];
  };
  jsts.triangulate.quadedge.TriangleEdgesListVisitor.prototype.visit = function(triEdges) {
    var clone = triEdges.concat();
    this.triList.push(clone);
  };
  jsts.triangulate.quadedge.TriangleEdgesListVisitor.prototype.getTriangleEdges = function() {
    return this.triList;
  };
  jsts.triangulate.quadedge.TriangleVertexListVisitor = function() {
    this.triList = [];
  };
  jsts.triangulate.quadedge.TriangleVertexListVisitor.prototype.visit = function(triEdges) {
    var vertices = [];
    vertices.push(trieEdges[0].orig());
    vertices.push(trieEdges[1].orig());
    vertices.push(trieEdges[2].orig());
    this.triList.push(vertices);
  };
  jsts.triangulate.quadedge.TriangleVertexListVisitor.prototype.getTriangleVertices = function() {
    return this.triList;
  };
  jsts.triangulate.quadedge.TriangleCoordinatesVisitor = function() {
    this.coordList = new jsts.geom.CoordinateList([], false);
    this.triCoords = [];
  };
  jsts.triangulate.quadedge.TriangleCoordinatesVisitor.prototype.visit = function(triEdges) {
    this.coordList = new jsts.geom.CoordinateList([], false);
    var i = 0,
        v,
        pts;
    for (i; i < 3; i++) {
      v = triEdges[i].orig();
      this.coordList.add(v.getCoordinate());
    }
    if (this.coordList.size() > 0) {
      this.coordList.closeRing();
      pts = this.coordList.toArray();
      if (pts.length !== 4) {
        return ;
      }
      this.triCoords.push(pts);
    }
  };
  jsts.triangulate.quadedge.TriangleCoordinatesVisitor.prototype.getTriangles = function() {
    return this.triCoords;
  };
})(require("process"));
