/* */ 
(function(process) {
  jsts.geom.util.LinearComponentExtracter = function(lines, isForcedToLineString) {
    this.lines = lines;
    this.isForcedToLineString = isForcedToLineString;
  };
  jsts.geom.util.LinearComponentExtracter.prototype = new jsts.geom.GeometryComponentFilter();
  jsts.geom.util.LinearComponentExtracter.prototype.lines = null;
  jsts.geom.util.LinearComponentExtracter.prototype.isForcedToLineString = false;
  jsts.geom.util.LinearComponentExtracter.getLines = function(geoms, lines) {
    if (arguments.length == 1) {
      return jsts.geom.util.LinearComponentExtracter.getLines5.apply(this, arguments);
    } else if (arguments.length == 2 && typeof lines === 'boolean') {
      return jsts.geom.util.LinearComponentExtracter.getLines6.apply(this, arguments);
    } else if (arguments.length == 2 && geoms instanceof jsts.geom.Geometry) {
      return jsts.geom.util.LinearComponentExtracter.getLines3.apply(this, arguments);
    } else if (arguments.length == 3 && geoms instanceof jsts.geom.Geometry) {
      return jsts.geom.util.LinearComponentExtracter.getLines4.apply(this, arguments);
    } else if (arguments.length == 3) {
      return jsts.geom.util.LinearComponentExtracter.getLines2.apply(this, arguments);
    }
    for (var i = 0; i < geoms.length; i++) {
      var g = geoms[i];
      jsts.geom.util.LinearComponentExtracter.getLines3(g, lines);
    }
    return lines;
  };
  jsts.geom.util.LinearComponentExtracter.getLines2 = function(geoms, lines, forceToLineString) {
    for (var i = 0; i < geoms.length; i++) {
      var g = geoms[i];
      jsts.geom.util.LinearComponentExtracter.getLines4(g, lines, forceToLineString);
    }
    return lines;
  };
  jsts.geom.util.LinearComponentExtracter.getLines3 = function(geom, lines) {
    if (geom instanceof LineString) {
      lines.add(geom);
    } else {
      geom.apply(new jsts.geom.util.LinearComponentExtracter(lines));
    }
    return lines;
  };
  jsts.geom.util.LinearComponentExtracter.getLines4 = function(geom, lines, forceToLineString) {
    geom.apply(new jsts.geom.util.LinearComponentExtracter(lines, forceToLineString));
    return lines;
  };
  jsts.geom.util.LinearComponentExtracter.getLines5 = function(geom) {
    return jsts.geom.util.LinearComponentExtracter.getLines6(geom, false);
  };
  jsts.geom.util.LinearComponentExtracter.getLines6 = function(geom, forceToLineString) {
    var lines = [];
    geom.apply(new jsts.geom.util.LinearComponentExtracter(lines, forceToLineString));
    return lines;
  };
  jsts.geom.util.LinearComponentExtracter.prototype.setForceToLineString = function(isForcedToLineString) {
    this.isForcedToLineString = isForcedToLineString;
  };
  jsts.geom.util.LinearComponentExtracter.prototype.filter = function(geom) {
    if (this.isForcedToLineString && geom instanceof jsts.geom.LinearRing) {
      var line = geom.getFactory().createLineString(geom.getCoordinateSequence());
      this.lines.push(line);
      return ;
    }
    if (geom instanceof jsts.geom.LineString || geom instanceof jsts.geom.LinearRing)
      this.lines.push(geom);
  };
})(require("process"));
