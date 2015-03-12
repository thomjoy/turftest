/* */ 
(function(process) {
  jsts.index.chain.MonotoneChain = function(pts, start, end, context) {
    this.pts = pts;
    this.start = start;
    this.end = end;
    this.context = context;
  };
  jsts.index.chain.MonotoneChain.prototype.pts = null;
  jsts.index.chain.MonotoneChain.prototype.start = null;
  jsts.index.chain.MonotoneChain.prototype.end = null;
  jsts.index.chain.MonotoneChain.prototype.env = null;
  jsts.index.chain.MonotoneChain.prototype.context = null;
  jsts.index.chain.MonotoneChain.prototype.id = null;
  jsts.index.chain.MonotoneChain.prototype.setId = function(id) {
    this.id = id;
  };
  jsts.index.chain.MonotoneChain.prototype.getId = function() {
    return this.id;
  };
  jsts.index.chain.MonotoneChain.prototype.getContext = function() {
    return this.context;
  };
  jsts.index.chain.MonotoneChain.prototype.getEnvelope = function() {
    if (this.env == null) {
      var p0 = this.pts[this.start];
      var p1 = this.pts[this.end];
      this.env = new jsts.geom.Envelope(p0, p1);
    }
    return this.env;
  };
  jsts.index.chain.MonotoneChain.prototype.getStartIndex = function() {
    return this.start;
  };
  jsts.index.chain.MonotoneChain.prototype.getEndIndex = function() {
    return this.end;
  };
  jsts.index.chain.MonotoneChain.prototype.getLineSegment = function(index, ls) {
    ls.p0 = this.pts[index];
    ls.p1 = this.pts[index + 1];
  };
  jsts.index.chain.MonotoneChain.prototype.getCoordinates = function() {
    var coord = [];
    var index = 0;
    for (var i = this.start; i <= this.end; i++) {
      coord[index++] = this.pts[i];
    }
    return coord;
  };
  jsts.index.chain.MonotoneChain.prototype.select = function(searchEnv, mcs) {
    this.computeSelect2(searchEnv, this.start, this.end, mcs);
  };
  jsts.index.chain.MonotoneChain.prototype.computeSelect2 = function(searchEnv, start0, end0, mcs) {
    var p0 = this.pts[start0];
    var p1 = this.pts[end0];
    mcs.tempEnv1.init(p0, p1);
    if (end0 - start0 === 1) {
      mcs.select(this, start0);
      return ;
    }
    if (!searchEnv.intersects(mcs.tempEnv1))
      return ;
    var mid = parseInt((start0 + end0) / 2);
    if (start0 < mid) {
      this.computeSelect2(searchEnv, start0, mid, mcs);
    }
    if (mid < end0) {
      this.computeSelect2(searchEnv, mid, end0, mcs);
    }
  };
  jsts.index.chain.MonotoneChain.prototype.computeOverlaps = function(mc, mco) {
    if (arguments.length === 6) {
      return this.computeOverlaps2.apply(this, arguments);
    }
    this.computeOverlaps2(this.start, this.end, mc, mc.start, mc.end, mco);
  };
  jsts.index.chain.MonotoneChain.prototype.computeOverlaps2 = function(start0, end0, mc, start1, end1, mco) {
    var p00 = this.pts[start0];
    var p01 = this.pts[end0];
    var p10 = mc.pts[start1];
    var p11 = mc.pts[end1];
    if (end0 - start0 === 1 && end1 - start1 === 1) {
      mco.overlap(this, start0, mc, start1);
      return ;
    }
    mco.tempEnv1.init(p00, p01);
    mco.tempEnv2.init(p10, p11);
    if (!mco.tempEnv1.intersects(mco.tempEnv2))
      return ;
    var mid0 = parseInt((start0 + end0) / 2);
    var mid1 = parseInt((start1 + end1) / 2);
    if (start0 < mid0) {
      if (start1 < mid1)
        this.computeOverlaps2(start0, mid0, mc, start1, mid1, mco);
      if (mid1 < end1)
        this.computeOverlaps2(start0, mid0, mc, mid1, end1, mco);
    }
    if (mid0 < end0) {
      if (start1 < mid1)
        this.computeOverlaps2(mid0, end0, mc, start1, mid1, mco);
      if (mid1 < end1)
        this.computeOverlaps2(mid0, end0, mc, mid1, end1, mco);
    }
  };
})(require("process"));
