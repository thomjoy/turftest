/* */ 
(function(process) {
  jsts.index.chain.MonotoneChainOverlapAction = function() {
    this.tempEnv1 = new jsts.geom.Envelope();
    this.tempEnv2 = new jsts.geom.Envelope();
    this.overlapSeg1 = new jsts.geom.LineSegment();
    this.overlapSeg2 = new jsts.geom.LineSegment();
  };
  jsts.index.chain.MonotoneChainOverlapAction.prototype.tempEnv1 = null;
  jsts.index.chain.MonotoneChainOverlapAction.prototype.tempEnv2 = null;
  jsts.index.chain.MonotoneChainOverlapAction.prototype.overlapSeg1 = null;
  jsts.index.chain.MonotoneChainOverlapAction.prototype.overlapSeg2 = null;
  jsts.index.chain.MonotoneChainOverlapAction.prototype.overlap = function(mc1, start1, mc2, start2) {
    this.mc1.getLineSegment(start1, this.overlapSeg1);
    this.mc2.getLineSegment(start2, this.overlapSeg2);
    this.overlap2(this.overlapSeg1, this.overlapSeg2);
  };
  jsts.index.chain.MonotoneChainOverlapAction.prototype.overlap2 = function(seg1, seg2) {};
})(require("process"));
