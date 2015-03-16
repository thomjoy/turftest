/* */ 
(function(process) {
  (function() {
    var ArrayList = javascript.util.ArrayList;
    var GeometryComponentFilter = jsts.geom.GeometryComponentFilter;
    var LineString = jsts.geom.LineString;
    var EdgeRing = jsts.operation.polygonize.EdgeRing;
    var PolygonizeGraph = jsts.operation.polygonize.PolygonizeGraph;
    var Polygonizer = function() {
      var that = this;
      var LineStringAdder = function() {};
      LineStringAdder.prototype = new GeometryComponentFilter();
      LineStringAdder.prototype.filter = function(g) {
        if (g instanceof LineString)
          that.add(g);
      };
      this.lineStringAdder = new LineStringAdder();
      this.dangles = new ArrayList();
      this.cutEdges = new ArrayList();
      this.invalidRingLines = new ArrayList();
    };
    Polygonizer.prototype.lineStringAdder = null;
    Polygonizer.prototype.graph = null;
    Polygonizer.prototype.dangles = null;
    Polygonizer.prototype.cutEdges = null;
    Polygonizer.prototype.invalidRingLines = null;
    Polygonizer.prototype.holeList = null;
    Polygonizer.prototype.shellList = null;
    Polygonizer.prototype.polyList = null;
    Polygonizer.prototype.add = function(geomList) {
      if (geomList instanceof jsts.geom.LineString) {
        return this.add3(geomList);
      } else if (geomList instanceof jsts.geom.Geometry) {
        return this.add2(geomList);
      }
      for (var i = geomList.iterator(); i.hasNext(); ) {
        var geometry = i.next();
        this.add2(geometry);
      }
    };
    Polygonizer.prototype.add2 = function(g) {
      g.apply(this.lineStringAdder);
    };
    Polygonizer.prototype.add3 = function(line) {
      if (this.graph == null)
        this.graph = new PolygonizeGraph(line.getFactory());
      this.graph.addEdge(line);
    };
    Polygonizer.prototype.getPolygons = function() {
      this.polygonize();
      return this.polyList;
    };
    Polygonizer.prototype.getDangles = function() {
      this.polygonize();
      return this.dangles;
    };
    Polygonizer.prototype.getCutEdges = function() {
      this.polygonize();
      return this.cutEdges;
    };
    Polygonizer.prototype.getInvalidRingLines = function() {
      this.polygonize();
      return this.invalidRingLines;
    };
    Polygonizer.prototype.polygonize = function() {
      if (this.polyList != null)
        return ;
      this.polyList = new ArrayList();
      if (this.graph == null)
        return ;
      this.dangles = this.graph.deleteDangles();
      this.cutEdges = this.graph.deleteCutEdges();
      var edgeRingList = this.graph.getEdgeRings();
      var validEdgeRingList = new ArrayList();
      this.invalidRingLines = new ArrayList();
      this.findValidRings(edgeRingList, validEdgeRingList, this.invalidRingLines);
      this.findShellsAndHoles(validEdgeRingList);
      Polygonizer.assignHolesToShells(this.holeList, this.shellList);
      this.polyList = new ArrayList();
      for (var i = this.shellList.iterator(); i.hasNext(); ) {
        var er = i.next();
        this.polyList.add(er.getPolygon());
      }
    };
    Polygonizer.prototype.findValidRings = function(edgeRingList, validEdgeRingList, invalidRingList) {
      for (var i = edgeRingList.iterator(); i.hasNext(); ) {
        var er = i.next();
        if (er.isValid())
          validEdgeRingList.add(er);
        else
          invalidRingList.add(er.getLineString());
      }
    };
    Polygonizer.prototype.findShellsAndHoles = function(edgeRingList) {
      this.holeList = new ArrayList();
      this.shellList = new ArrayList();
      for (var i = edgeRingList.iterator(); i.hasNext(); ) {
        var er = i.next();
        if (er.isHole())
          this.holeList.add(er);
        else
          this.shellList.add(er);
      }
    };
    Polygonizer.assignHolesToShells = function(holeList, shellList) {
      for (var i = holeList.iterator(); i.hasNext(); ) {
        var holeER = i.next();
        Polygonizer.assignHoleToShell(holeER, shellList);
      }
    };
    Polygonizer.assignHoleToShell = function(holeER, shellList) {
      var shell = EdgeRing.findEdgeRingContaining(holeER, shellList);
      if (shell != null)
        shell.addHole(holeER.getRing());
    };
    jsts.operation.polygonize.Polygonizer = Polygonizer;
  })();
})(require("process"));
