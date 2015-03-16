/* */ 
(function(process) {
  jsts.operation.union.CascadedPolygonUnion = function(polys) {
    this.inputPolys = polys;
  };
  jsts.operation.union.CascadedPolygonUnion.union = function(polys) {
    var op = new jsts.operation.union.CascadedPolygonUnion(polys);
    return op.union();
  };
  jsts.operation.union.CascadedPolygonUnion.prototype.inputPolys;
  jsts.operation.union.CascadedPolygonUnion.prototype.geomFactory = null;
  jsts.operation.union.CascadedPolygonUnion.prototype.STRTREE_NODE_CAPACITY = 4;
  jsts.operation.union.CascadedPolygonUnion.prototype.union = function() {
    if (this.inputPolys.length === 0) {
      return null;
    }
    this.geomFactory = this.inputPolys[0].getFactory();
    var index = new jsts.index.strtree.STRtree(this.STRTREE_NODE_CAPACITY);
    for (var i = 0,
        l = this.inputPolys.length; i < l; i++) {
      var item = this.inputPolys[i];
      index.insert(item.getEnvelopeInternal(), item);
    }
    var itemTree = index.itemsTree();
    var unionAll = this.unionTree(itemTree);
    return unionAll;
  };
  jsts.operation.union.CascadedPolygonUnion.prototype.unionTree = function(geomTree) {
    var geoms = this.reduceToGeometries(geomTree);
    var union = this.binaryUnion(geoms);
    return union;
  };
  jsts.operation.union.CascadedPolygonUnion.prototype.binaryUnion = function(geoms, start, end) {
    start = start || 0;
    end = end || geoms.length;
    if (end - start <= 1) {
      var g0 = this.getGeometry(geoms, start);
      return this.unionSafe(g0, null);
    } else if (end - start === 2) {
      return this.unionSafe(this.getGeometry(geoms, start), this.getGeometry(geoms, start + 1));
    } else {
      var mid = parseInt((end + start) / 2);
      var g0 = this.binaryUnion(geoms, start, mid);
      var g1 = this.binaryUnion(geoms, mid, end);
      return this.unionSafe(g0, g1);
    }
  };
  jsts.operation.union.CascadedPolygonUnion.prototype.getGeometry = function(list, index) {
    if (index >= list.length) {
      return null;
    }
    return list[index];
  };
  jsts.operation.union.CascadedPolygonUnion.prototype.reduceToGeometries = function(geomTree) {
    var geoms = [];
    for (var i = 0,
        l = geomTree.length; i < l; i++) {
      var o = geomTree[i],
          geom = null;
      if (o instanceof Array) {
        geom = this.unionTree(o);
      } else if (o instanceof jsts.geom.Geometry) {
        geom = o;
      }
      geoms.push(geom);
    }
    return geoms;
  };
  jsts.operation.union.CascadedPolygonUnion.prototype.unionSafe = function(g0, g1) {
    if (g0 === null && g1 === null) {
      return null;
    }
    if (g0 === null) {
      return g1.clone();
    }
    if (g1 === null) {
      return g0.clone();
    }
    return this.unionOptimized(g0, g1);
  };
  jsts.operation.union.CascadedPolygonUnion.prototype.unionOptimized = function(g0, g1) {
    var g0Env = g0.getEnvelopeInternal(),
        g1Env = g1.getEnvelopeInternal();
    if (!g0Env.intersects(g1Env)) {
      var combo = jsts.geom.util.GeometryCombiner.combine(g0, g1);
      return combo;
    }
    if (g0.getNumGeometries <= 1 && g1.getNumGeometries <= 1) {
      return this.unionActual(g0, g1);
    }
    var commonEnv = g0Env.intersection(g1Env);
    return this.unionUsingEnvelopeIntersection(g0, g1, commonEnv);
  };
  jsts.operation.union.CascadedPolygonUnion.prototype.unionUsingEnvelopeIntersection = function(g0, g1, common) {
    var disjointPolys = new javascript.util.ArrayList();
    var g0Int = this.extractByEnvelope(common, g0, disjointPolys);
    var g1Int = this.extractByEnvelope(common, g1, disjointPolys);
    var union = this.unionActual(g0Int, g1Int);
    disjointPolys.add(union);
    var overallUnion = jsts.geom.util.GeometryCombiner.combine(disjointPolys);
    return overallUnion;
  };
  jsts.operation.union.CascadedPolygonUnion.prototype.extractByEnvelope = function(env, geom, disjointGeoms) {
    var intersectingGeoms = new javascript.util.ArrayList();
    for (var i = 0; i < geom.getNumGeometries(); i++) {
      var elem = geom.getGeometryN(i);
      if (elem.getEnvelopeInternal().intersects(env)) {
        intersectingGeoms.add(elem);
      } else {
        disjointGeoms.add(elem);
      }
    }
    return this.geomFactory.buildGeometry(intersectingGeoms);
  };
  jsts.operation.union.CascadedPolygonUnion.prototype.unionActual = function(g0, g1) {
    return g0.union(g1);
  };
})(require("process"));
