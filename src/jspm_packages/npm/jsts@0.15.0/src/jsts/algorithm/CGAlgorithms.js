/* */ 
(function(process) {
  jsts.algorithm.CGAlgorithms = function() {};
  jsts.algorithm.CGAlgorithms.CLOCKWISE = -1;
  jsts.algorithm.CGAlgorithms.RIGHT = jsts.algorithm.CGAlgorithms.CLOCKWISE;
  jsts.algorithm.CGAlgorithms.COUNTERCLOCKWISE = 1;
  jsts.algorithm.CGAlgorithms.LEFT = jsts.algorithm.CGAlgorithms.COUNTERCLOCKWISE;
  jsts.algorithm.CGAlgorithms.COLLINEAR = 0;
  jsts.algorithm.CGAlgorithms.STRAIGHT = jsts.algorithm.CGAlgorithms.COLLINEAR;
  jsts.algorithm.CGAlgorithms.orientationIndex = function(p1, p2, q) {
    var dx1,
        dy1,
        dx2,
        dy2;
    dx1 = p2.x - p1.x;
    dy1 = p2.y - p1.y;
    dx2 = q.x - p2.x;
    dy2 = q.y - p2.y;
    return jsts.algorithm.RobustDeterminant.signOfDet2x2(dx1, dy1, dx2, dy2);
  };
  jsts.algorithm.CGAlgorithms.isPointInRing = function(p, ring) {
    return jsts.algorithm.CGAlgorithms.locatePointInRing(p, ring) !== jsts.geom.Location.EXTERIOR;
  };
  jsts.algorithm.CGAlgorithms.locatePointInRing = function(p, ring) {
    return jsts.algorithm.RayCrossingCounter.locatePointInRing(p, ring);
  };
  jsts.algorithm.CGAlgorithms.isOnLine = function(p, pt) {
    var lineIntersector,
        i,
        il,
        p0,
        p1;
    lineIntersector = new jsts.algorithm.RobustLineIntersector();
    for (i = 1, il = pt.length; i < il; i++) {
      p0 = pt[i - 1];
      p1 = pt[i];
      lineIntersector.computeIntersection(p, p0, p1);
      if (lineIntersector.hasIntersection()) {
        return true;
      }
    }
    return false;
  };
  jsts.algorithm.CGAlgorithms.isCCW = function(ring) {
    var nPts,
        hiPt,
        hiIndex,
        p,
        iPrev,
        iNext,
        prev,
        next,
        i,
        disc,
        isCCW;
    nPts = ring.length - 1;
    if (nPts < 3) {
      throw new jsts.IllegalArgumentError('Ring has fewer than 3 points, so orientation cannot be determined');
    }
    hiPt = ring[0];
    hiIndex = 0;
    i = 1;
    for (i; i <= nPts; i++) {
      p = ring[i];
      if (p.y > hiPt.y) {
        hiPt = p;
        hiIndex = i;
      }
    }
    iPrev = hiIndex;
    do {
      iPrev = iPrev - 1;
      if (iPrev < 0) {
        iPrev = nPts;
      }
    } while (ring[iPrev].equals2D(hiPt) && iPrev !== hiIndex);
    iNext = hiIndex;
    do {
      iNext = (iNext + 1) % nPts;
    } while (ring[iNext].equals2D(hiPt) && iNext !== hiIndex);
    prev = ring[iPrev];
    next = ring[iNext];
    if (prev.equals2D(hiPt) || next.equals2D(hiPt) || prev.equals2D(next)) {
      return false;
    }
    disc = jsts.algorithm.CGAlgorithms.computeOrientation(prev, hiPt, next);
    isCCW = false;
    if (disc === 0) {
      isCCW = (prev.x > next.x);
    } else {
      isCCW = (disc > 0);
    }
    return isCCW;
  };
  jsts.algorithm.CGAlgorithms.computeOrientation = function(p1, p2, q) {
    return jsts.algorithm.CGAlgorithms.orientationIndex(p1, p2, q);
  };
  jsts.algorithm.CGAlgorithms.distancePointLine = function(p, A, B) {
    if (!(A instanceof jsts.geom.Coordinate)) {
      jsts.algorithm.CGAlgorithms.distancePointLine2.apply(this, arguments);
    }
    if (A.x === B.x && A.y === B.y) {
      return p.distance(A);
    }
    var r,
        s;
    r = ((p.x - A.x) * (B.x - A.x) + (p.y - A.y) * (B.y - A.y)) / ((B.x - A.x) * (B.x - A.x) + (B.y - A.y) * (B.y - A.y));
    if (r <= 0.0) {
      return p.distance(A);
    }
    if (r >= 1.0) {
      return p.distance(B);
    }
    s = ((A.y - p.y) * (B.x - A.x) - (A.x - p.x) * (B.y - A.y)) / ((B.x - A.x) * (B.x - A.x) + (B.y - A.y) * (B.y - A.y));
    return Math.abs(s) * Math.sqrt(((B.x - A.x) * (B.x - A.x) + (B.y - A.y) * (B.y - A.y)));
  };
  jsts.algorithm.CGAlgorithms.distancePointLinePerpendicular = function(p, A, B) {
    var s = ((A.y - p.y) * (B.x - A.x) - (A.x - p.x) * (B.y - A.y)) / ((B.x - A.x) * (B.x - A.x) + (B.y - A.y) * (B.y - A.y));
    return Math.abs(s) * Math.sqrt(((B.x - A.x) * (B.x - A.x) + (B.y - A.y) * (B.y - A.y)));
  };
  jsts.algorithm.CGAlgorithms.distancePointLine2 = function(p, line) {
    var minDistance,
        i,
        il,
        dist;
    if (line.length === 0) {
      throw new jsts.error.IllegalArgumentError('Line array must contain at least one vertex');
    }
    minDistance = p.distance(line[0]);
    for (i = 0, il = line.length - 1; i < il; i++) {
      dist = jsts.algorithm.CGAlgorithms.distancePointLine(p, line[i], line[i + 1]);
      if (dist < minDistance) {
        minDistance = dist;
      }
    }
    return minDistance;
  };
  jsts.algorithm.CGAlgorithms.distanceLineLine = function(A, B, C, D) {
    if (A.equals(B)) {
      return jsts.algorithm.CGAlgorithms.distancePointLine(A, C, D);
    }
    if (C.equals(D)) {
      return jsts.algorithm.CGAlgorithms.distancePointLine(D, A, B);
    }
    var r_top,
        r_bot,
        s_top,
        s_bot,
        s,
        r;
    r_top = (A.y - C.y) * (D.x - C.x) - (A.x - C.x) * (D.y - C.y);
    r_bot = (B.x - A.x) * (D.y - C.y) - (B.y - A.y) * (D.x - C.x);
    s_top = (A.y - C.y) * (B.x - A.x) - (A.x - C.x) * (B.y - A.y);
    s_bot = (B.x - A.x) * (D.y - C.y) - (B.y - A.y) * (D.x - C.x);
    if ((r_bot === 0) || (s_bot === 0)) {
      return Math.min(jsts.algorithm.CGAlgorithms.distancePointLine(A, C, D), Math.min(jsts.algorithm.CGAlgorithms.distancePointLine(B, C, D), Math.min(jsts.algorithm.CGAlgorithms.distancePointLine(C, A, B), jsts.algorithm.CGAlgorithms.distancePointLine(D, A, B))));
    }
    s = s_top / s_bot;
    r = r_top / r_bot;
    if ((r < 0) || (r > 1) || (s < 0) || (s > 1)) {
      return Math.min(jsts.algorithm.CGAlgorithms.distancePointLine(A, C, D), Math.min(jsts.algorithm.CGAlgorithms.distancePointLine(B, C, D), Math.min(jsts.algorithm.CGAlgorithms.distancePointLine(C, A, B), jsts.algorithm.CGAlgorithms.distancePointLine(D, A, B))));
    }
    return 0.0;
  };
  jsts.algorithm.CGAlgorithms.signedArea = function(ring) {
    if (ring.length < 3) {
      return 0.0;
    }
    var sum,
        i,
        il,
        bx,
        by,
        cx,
        cy;
    sum = 0.0;
    for (i = 0, il = ring.length - 1; i < il; i++) {
      bx = ring[i].x;
      by = ring[i].y;
      cx = ring[i + 1].x;
      cy = ring[i + 1].y;
      sum += (bx + cx) * (cy - by);
    }
    return -sum / 2.0;
  };
  jsts.algorithm.CGAlgorithms.signedArea = function(ring) {
    var n,
        sum,
        p,
        bx,
        by,
        i,
        cx,
        cy;
    n = ring.length;
    if (n < 3) {
      return 0.0;
    }
    sum = 0.0;
    p = ring[0];
    bx = p.x;
    by = p.y;
    for (i = 1; i < n; i++) {
      p = ring[i];
      cx = p.x;
      cy = p.y;
      sum += (bx + cx) * (cy - by);
      bx = cx;
      by = cy;
    }
    return -sum / 2.0;
  };
  jsts.algorithm.CGAlgorithms.computeLength = function(pts) {
    var n = pts.length,
        len,
        x0,
        y0,
        x1,
        y1,
        dx,
        dy,
        p,
        i,
        il;
    if (n <= 1) {
      return 0.0;
    }
    len = 0.0;
    p = pts[0];
    x0 = p.x;
    y0 = p.y;
    i = 1, il = n;
    for (i; i < n; i++) {
      p = pts[i];
      x1 = p.x;
      y1 = p.y;
      dx = x1 - x0;
      dy = y1 - y0;
      len += Math.sqrt(dx * dx + dy * dy);
      x0 = x1;
      y0 = y1;
    }
    return len;
  };
  jsts.algorithm.CGAlgorithms.length = function() {};
})(require("process"));
