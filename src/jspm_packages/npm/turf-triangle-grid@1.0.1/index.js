/* */ 
var featurecollection = require('turf-featurecollection');
var point = require('turf-point');
var polygon = require('turf-polygon');
var distance = require('turf-distance');

/**
 * Takes a bounding box and a cell depth and returns a {@link FeatureCollection} of {@link Polygon} features in a grid.
 *
 * @module turf/triangle-grid
 * @category interpolation
 * @param {Array<number>} extent extent in [minX, minY, maxX, maxY] order
 * @param {Number} cellWidth width of each cell
 * @param {String} units units to use for cellWidth
 * @return {FeatureCollection} grid as FeatureCollection with {@link Polygon} features
 * @example
 * var extent = [-77.3876953125,38.71980474264239,-76.9482421875,39.027718840211605];
 * var cellWidth = 10;
 * var units = 'miles';
 *
 * var triangleGrid = turf.triangleGrid(extent, cellWidth, units);
 *
 * //=triangleGrid
 */
module.exports = function (bbox, cell, units) {
  var fc = featurecollection([]);
  var xFraction = cell / (distance(point([bbox[0], bbox[1]]), point([bbox[2], bbox[1]]), units));
  var cellWidth = xFraction * (bbox[2] - bbox[0]);
  var yFraction = cell / (distance(point([bbox[0], bbox[1]]), point([bbox[0], bbox[3]]), units));
  var cellHeight = yFraction * (bbox[3] - bbox[1]);

  var xi = 0;
  var currentX = bbox[0];
  while (currentX <= bbox[2]) {
    var yi = 0;
    var currentY = bbox[1];
    while (currentY <= bbox[3]) {
      if(xi%2===0 && yi%2===0) {
        var cell1 = polygon([[
            [currentX, currentY],
            [currentX, currentY+cellHeight],
            [currentX+cellWidth, currentY],
            [currentX, currentY]
          ]]);
        fc.features.push(cell1);
        var cell2 = polygon([[
            [currentX, currentY+cellHeight],
            [currentX+cellWidth, currentY+cellHeight],
            [currentX+cellWidth, currentY],
            [currentX, currentY+cellHeight]
          ]]);
        fc.features.push(cell2);
      } else if(xi%2===0 && yi%2===1) {
        var cell1 = polygon([[
            [currentX, currentY],
            [currentX+cellWidth, currentY+cellHeight],
            [currentX+cellWidth, currentY],
            [currentX, currentY]
          ]]);
        fc.features.push(cell1);
        var cell2 = polygon([[
            [currentX, currentY],
            [currentX, currentY+cellHeight],
            [currentX+cellWidth, currentY+cellHeight],
            [currentX, currentY]
          ]]);
        fc.features.push(cell2);
      } else if(yi%2===0 && xi%2===1) {
        var cell1 = polygon([[
            [currentX, currentY],
            [currentX, currentY+cellHeight],
            [currentX+cellWidth, currentY+cellHeight],
            [currentX, currentY]
          ]]);
        fc.features.push(cell1);
        var cell2 = polygon([[
            [currentX, currentY],
            [currentX+cellWidth, currentY+cellHeight],
            [currentX+cellWidth, currentY],
            [currentX, currentY]
          ]]);
        fc.features.push(cell2);
      } else if(yi%2===1 && xi%2===1) {
        var cell1 = polygon([[
            [currentX, currentY],
            [currentX, currentY+cellHeight],
            [currentX+cellWidth, currentY],
            [currentX, currentY]
          ]]);
        fc.features.push(cell1);
        var cell2 = polygon([[
            [currentX, currentY+cellHeight],
            [currentX+cellWidth, currentY+cellHeight],
            [currentX+cellWidth, currentY],
            [currentX, currentY+cellHeight]
          ]]);
        fc.features.push(cell2);
      }
      currentY += cellHeight;
      yi++;
    }
    xi++;
    currentX += cellWidth;
  }
  return fc;
};

