/* */ 
(function(process) {
  (function() {
    jsts.io.GeoJSONWriter = function() {
      this.parser = new jsts.io.GeoJSONParser(this.geometryFactory);
    };
    jsts.io.GeoJSONWriter.prototype.write = function(geometry) {
      var geoJson = this.parser.write(geometry);
      return geoJson;
    };
  })();
})(require("process"));
