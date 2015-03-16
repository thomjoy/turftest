/* */ 
(function(process) {
  "use strict";
  module.exports = incrementalConvexHull;
  var orient = require("robust-orientation");
  var compareCell = require("simplicial-complex").compareCells;
  function compareInt(a, b) {
    return a - b;
  }
  function Simplex(vertices, adjacent, boundary) {
    this.vertices = vertices;
    this.adjacent = adjacent;
    this.boundary = boundary;
    this.lastVisited = -1;
  }
  Simplex.prototype.flip = function() {
    var t = this.vertices[0];
    this.vertices[0] = this.vertices[1];
    this.vertices[1] = t;
    var u = this.adjacent[0];
    this.adjacent[0] = this.adjacent[1];
    this.adjacent[1] = u;
  };
  function GlueFacet(vertices, cell, index) {
    this.vertices = vertices;
    this.cell = cell;
    this.index = index;
  }
  function compareGlue(a, b) {
    return compareCell(a.vertices, b.vertices);
  }
  function bakeOrient(d) {
    var code = ["function orient(){var tuple=this.tuple;return test("];
    for (var i = 0; i <= d; ++i) {
      if (i > 0) {
        code.push(",");
      }
      code.push("tuple[", i, "]");
    }
    code.push(")}return orient");
    var proc = new Function("test", code.join(""));
    var test = orient[d + 1];
    if (!test) {
      test = orient;
    }
    return proc(test);
  }
  var BAKED = [];
  function Triangulation(dimension, vertices, simplices) {
    this.dimension = dimension;
    this.vertices = vertices;
    this.simplices = simplices;
    this.interior = simplices.filter(function(c) {
      return !c.boundary;
    });
    this.tuple = new Array(dimension + 1);
    for (var i = 0; i <= dimension; ++i) {
      this.tuple[i] = this.vertices[i];
    }
    var o = BAKED[dimension];
    if (!o) {
      o = BAKED[dimension] = bakeOrient(dimension);
    }
    this.orient = o;
  }
  var proto = Triangulation.prototype;
  proto.handleBoundaryDegeneracy = function(cell, point) {
    var d = this.dimension;
    var n = this.vertices.length - 1;
    var tuple = this.tuple;
    var verts = this.vertices;
    var toVisit = [cell];
    cell.lastVisited = -n;
    while (toVisit.length > 0) {
      cell = toVisit.pop();
      var cellVerts = cell.vertices;
      var cellAdj = cell.adjacent;
      for (var i = 0; i <= d; ++i) {
        var neighbor = cellAdj[i];
        if (!neighbor.boundary || neighbor.lastVisited <= -n) {
          continue;
        }
        var nv = neighbor.vertices;
        for (var j = 0; j <= d; ++j) {
          var vv = nv[j];
          if (vv < 0) {
            tuple[j] = point;
          } else {
            tuple[j] = verts[vv];
          }
        }
        var o = this.orient();
        if (o > 0) {
          return neighbor;
        }
        neighbor.lastVisited = -n;
        if (o === 0) {
          toVisit.push(neighbor);
        }
      }
    }
    return null;
  };
  proto.walk = function(point, random) {
    var n = this.vertices.length - 1;
    var d = this.dimension;
    var verts = this.vertices;
    var tuple = this.tuple;
    var initIndex = random ? (this.interior.length * Math.random()) | 0 : (this.interior.length - 1);
    var cell = this.interior[initIndex];
    outerLoop: while (!cell.boundary) {
      var cellVerts = cell.vertices;
      var cellAdj = cell.adjacent;
      for (var i = 0; i <= d; ++i) {
        tuple[i] = verts[cellVerts[i]];
      }
      cell.lastVisited = n;
      for (var i = 0; i <= d; ++i) {
        var neighbor = cellAdj[i];
        if (neighbor.lastVisited >= n) {
          continue;
        }
        var prev = tuple[i];
        tuple[i] = point;
        var o = this.orient();
        tuple[i] = prev;
        if (o < 0) {
          cell = neighbor;
          continue outerLoop;
        } else {
          if (!neighbor.boundary) {
            neighbor.lastVisited = n;
          } else {
            neighbor.lastVisited = -n;
          }
        }
      }
      return ;
    }
    return cell;
  };
  proto.addPeaks = function(point, cell) {
    var n = this.vertices.length - 1;
    var d = this.dimension;
    var verts = this.vertices;
    var tuple = this.tuple;
    var interior = this.interior;
    var simplices = this.simplices;
    var tovisit = [cell];
    cell.lastVisited = n;
    cell.vertices[cell.vertices.indexOf(-1)] = n;
    cell.boundary = false;
    interior.push(cell);
    var glueFacets = [];
    while (tovisit.length > 0) {
      var cell = tovisit.pop();
      var cellVerts = cell.vertices;
      var cellAdj = cell.adjacent;
      var indexOfN = cellVerts.indexOf(n);
      if (indexOfN < 0) {
        continue;
      }
      for (var i = 0; i <= d; ++i) {
        if (i === indexOfN) {
          continue;
        }
        var neighbor = cellAdj[i];
        if (!neighbor.boundary || neighbor.lastVisited >= n) {
          continue;
        }
        var nv = neighbor.vertices;
        if (neighbor.lastVisited !== -n) {
          var indexOfNeg1 = 0;
          for (var j = 0; j <= d; ++j) {
            if (nv[j] < 0) {
              indexOfNeg1 = j;
              tuple[j] = point;
            } else {
              tuple[j] = verts[nv[j]];
            }
          }
          var o = this.orient();
          if (o > 0) {
            nv[indexOfNeg1] = n;
            neighbor.boundary = false;
            interior.push(neighbor);
            tovisit.push(neighbor);
            neighbor.lastVisited = n;
            continue;
          } else {
            neighbor.lastVisited = -n;
          }
        }
        var na = neighbor.adjacent;
        var vverts = cellVerts.slice();
        var vadj = cellAdj.slice();
        var ncell = new Simplex(vverts, vadj, true);
        simplices.push(ncell);
        var opposite = na.indexOf(cell);
        if (opposite < 0) {
          continue;
        }
        na[opposite] = ncell;
        vadj[indexOfN] = neighbor;
        vverts[i] = -1;
        vadj[i] = cell;
        cellAdj[i] = ncell;
        ncell.flip();
        for (var j = 0; j <= d; ++j) {
          var uu = vverts[j];
          if (uu < 0 || uu === n) {
            continue;
          }
          var nface = new Array(d - 1);
          var nptr = 0;
          for (var k = 0; k <= d; ++k) {
            var vv = vverts[k];
            if (vv < 0 || k === j) {
              continue;
            }
            nface[nptr++] = vv;
          }
          glueFacets.push(new GlueFacet(nface, ncell, j));
        }
      }
    }
    glueFacets.sort(compareGlue);
    for (var i = 0; i + 1 < glueFacets.length; i += 2) {
      var a = glueFacets[i];
      var b = glueFacets[i + 1];
      var ai = a.index;
      var bi = b.index;
      if (ai < 0 || bi < 0) {
        continue;
      }
      a.cell.adjacent[a.index] = b.cell;
      b.cell.adjacent[b.index] = a.cell;
    }
  };
  proto.insert = function(point, random) {
    var verts = this.vertices;
    verts.push(point);
    var cell = this.walk(point, random);
    if (!cell) {
      return ;
    }
    var d = this.dimension;
    var tuple = this.tuple;
    for (var i = 0; i <= d; ++i) {
      var vv = cell.vertices[i];
      if (vv < 0) {
        tuple[i] = point;
      } else {
        tuple[i] = verts[vv];
      }
    }
    var o = this.orient(tuple);
    if (o < 0) {
      return ;
    } else if (o === 0) {
      cell = this.handleBoundaryDegeneracy(cell, point);
      if (!cell) {
        return ;
      }
    }
    this.addPeaks(point, cell);
  };
  proto.boundary = function() {
    var d = this.dimension;
    var boundary = [];
    var cells = this.simplices;
    var nc = cells.length;
    for (var i = 0; i < nc; ++i) {
      var c = cells[i];
      if (c.boundary) {
        var bcell = new Array(d);
        var cv = c.vertices;
        var ptr = 0;
        var parity = 0;
        for (var j = 0; j <= d; ++j) {
          if (cv[j] >= 0) {
            bcell[ptr++] = cv[j];
          } else {
            parity = j & 1;
          }
        }
        if (parity === (d & 1)) {
          var t = bcell[0];
          bcell[0] = bcell[1];
          bcell[1] = t;
        }
        boundary.push(bcell);
      }
    }
    return boundary;
  };
  function incrementalConvexHull(points, randomSearch) {
    var n = points.length;
    if (n === 0) {
      throw new Error("Must have at least d+1 points");
    }
    var d = points[0].length;
    if (n <= d) {
      throw new Error("Must input at least d+1 points");
    }
    var initialSimplex = points.slice(0, d + 1);
    var o = orient.apply(void 0, initialSimplex);
    if (o === 0) {
      throw new Error("Input not in general position");
    }
    var initialCoords = new Array(d + 1);
    for (var i = 0; i <= d; ++i) {
      initialCoords[i] = i;
    }
    if (o < 0) {
      initialCoords[0] = 1;
      initialCoords[1] = 0;
    }
    var initialCell = new Simplex(initialCoords, new Array(d + 1), false);
    var boundary = initialCell.adjacent;
    var list = new Array(d + 2);
    for (var i = 0; i <= d; ++i) {
      var verts = initialCoords.slice();
      for (var j = 0; j <= d; ++j) {
        if (j === i) {
          verts[j] = -1;
        }
      }
      var t = verts[0];
      verts[0] = verts[1];
      verts[1] = t;
      var cell = new Simplex(verts, new Array(d + 1), true);
      boundary[i] = cell;
      list[i] = cell;
    }
    list[d + 1] = initialCell;
    for (var i = 0; i <= d; ++i) {
      var verts = boundary[i].vertices;
      var adj = boundary[i].adjacent;
      for (var j = 0; j <= d; ++j) {
        var v = verts[j];
        if (v < 0) {
          adj[j] = initialCell;
          continue;
        }
        for (var k = 0; k <= d; ++k) {
          if (boundary[k].vertices.indexOf(v) < 0) {
            adj[j] = boundary[k];
          }
        }
      }
    }
    var triangles = new Triangulation(d, initialSimplex, list);
    var useRandom = !!randomSearch;
    for (var i = d + 1; i < n; ++i) {
      triangles.insert(points[i], useRandom);
    }
    return triangles.boundary();
  }
})(require("process"));
