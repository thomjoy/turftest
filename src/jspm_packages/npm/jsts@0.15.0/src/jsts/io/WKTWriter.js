/* */ 
(function(process) {
  jsts.io.WKTWriter = function() {
    this.parser = new jsts.io.WKTParser(this.geometryFactory);
  };
  jsts.io.WKTWriter.prototype.write = function(geometry) {
    var wkt = this.parser.write(geometry);
    return wkt;
  };
  jsts.io.WKTWriter.toLineString = function(p0, p1) {
    if (arguments.length !== 2) {
      throw new jsts.error.NotImplementedError();
    }
    return 'LINESTRING ( ' + p0.x + ' ' + p0.y + ', ' + p1.x + ' ' + p1.y + ' )';
  };
})(require("process"));
