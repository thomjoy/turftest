var express = require('express');
var cors = require('cors');
var stops = express();

var turf = require('turf');

// stops data from the fs
var data = require(__dirname + '/gtfs/stops.json');

var API_DEFAULT_UNIT = 'kilometers';

// set up middleware
stops.use(cors());

// validation
stops.param('distance', function(req, res, next, distance) {
  if( distance.match(/^\d+(\.\d+)?$/gi) ) {
    req.distance = distance;
    next();
  }
  else {
    next(new Error('Distance should be a numeric value'));
  }
});

stops.param('unit', function(req, res, next, unit) {
  if( unit !== 'km' && unit !== 'miles' ) {
    next(new Error('unit should be either "km" or "miles"'));
  }
  else {
    req.unit = unit;
    next();
  }
});

stops.param('latLng', function(req, res, next, latLng) {
  if( latLng.match(/^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/) ) {
    req.latLng = latLng;
    next();
  }
  else {
    next(new Error('latLng should be of the form: 123.45,678.90'));
  }
});

// end points
stops.route('/within/:distance/:latLng/')
  .get(function(req, res) {
    var unit = req.query.unit || API_DEFAULT_UNIT;
    var latLng = req.latLng.split(',');
    var distance = req.distance;

    console.log('distance: ' + distance);
    console.log('latLng: ' + latLng);
    console.log('unit: ' + unit);

    var withinRadius = turf.featurecollection(data.features.filter(function(stop){
      if (turf.distance(stop, turf.point(latLng.reverse()), unit) <= distance) return true;
    }));

    console.log('Found ' + withinRadius.features.length + ' in radius');
    res.json(withinRadius);
  });

stops.listen(3001);
console.log('Stops API listening on 3001');