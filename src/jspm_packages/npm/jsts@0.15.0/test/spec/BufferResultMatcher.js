/* */ 
(function(Buffer) {
  BufferResultMatcher = function() {};
  BufferResultMatcher.prototype.isMatch = function(geom, distance, actualResult, expectedResult, tolerance) {
    return this.isBufferResultMatch(actualResult, expectedResult, distance);
  };
  BufferResultMatcher.MAX_RELATIVE_AREA_DIFFERENCE = 1.0E-3;
  BufferResultMatcher.MAX_HAUSDORFF_DISTANCE_FACTOR = 100;
  BufferResultMatcher.MIN_DISTANCE_TOLERANCE = 1.0e-8;
  BufferResultMatcher.prototype.isBufferResultMatch = function(actualBuffer, expectedBuffer, distance) {
    if (actualBuffer.isEmpty() && expectedBuffer.isEmpty())
      return true;
    if (!this.isSymDiffAreaInTolerance(actualBuffer, expectedBuffer))
      return false;
    if (!this.isBoundaryHausdorffDistanceInTolerance(actualBuffer, expectedBuffer, distance))
      return false;
    return true;
  };
  BufferResultMatcher.prototype.isSymDiffAreaInTolerance = function(actualBuffer, expectedBuffer) {
    var area = expectedBuffer.getArea();
    var diff = actualBuffer.symDifference(expectedBuffer);
    var areaDiff = diff.getArea();
    if (areaDiff <= 0.0)
      return true;
    var frac = Number.POSITIVE_INFINITY;
    if (area > 0.0)
      frac = areaDiff / area;
    return frac < BufferResultMatcher.MAX_RELATIVE_AREA_DIFFERENCE;
  };
  BufferResultMatcher.prototype.isBoundaryHausdorffDistanceInTolerance = function(actualBuffer, expectedBuffer, distance) {
    var actualBdy = actualBuffer.getBoundary();
    var expectedBdy = expectedBuffer.getBoundary();
    var haus = new jsts.algorithm.distance.DiscreteHausdorffDistance(actualBdy, expectedBdy);
    haus.setDensifyFraction(0.25);
    var maxDistanceFound = haus.orientedDistance();
    var expectedDistanceTol = Math.abs(distance) / BufferResultMatcher.MAX_HAUSDORFF_DISTANCE_FACTOR;
    if (expectedDistanceTol < BufferResultMatcher.MIN_DISTANCE_TOLERANCE)
      expectedDistanceTol = BufferResultMatcher.MIN_DISTANCE_TOLERANCE;
    if (maxDistanceFound > expectedDistanceTol)
      return false;
    return true;
  };
})(require("buffer").Buffer);
