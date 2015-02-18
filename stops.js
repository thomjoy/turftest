// API
var express = require('express');
var cors = require('cors');
var stops = express();

// database
var pg = require('pg');
var Cursor = require('pg-cursor');
var connString = "postgres://thomjoy:@localhost/gtfs_syd";
var pgErrHandler = function(err) { return console.error(err); };

// maps
var turf = require('turf');
// stops data from the fs
var data = require(__dirname + '/gtfs/stops.json');
var API_DEFAULT_UNIT = 'kilometers';

var _ = require('underscore');

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

stops.param('stopid', function(req, res, next, stopid) {
  if( stopid.match(/^\d+$/gi) ) {
    req.stopid = stopid;
    next();
  }
  else {
    next(new Error('Stop ID should be a numeric value'));
  }
});

stops.param('shapeid', function(req, res, next, shapeid) {
  if( shapeid.match(/^\d+$/gi) ) {
    req.shapeid = shapeid;
    next();
  }
  else {
    next(new Error('Shape ID should be a numeric value'));
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

stops.route('/stops/:stopid')
  .get(function(req, res) {
    console.log(req.stopid);
    var query = "SELECT DISTINCT trips.route_id, routes.route_short_name, routes.route_long_name, trips.shape_id " +
    "FROM trips " +
    "JOIN routes on trips.route_id = routes.route_id " +
    "WHERE trip_id IN (SELECT DISTINCT trip_id FROM stop_times WHERE stop_id = $1)";
    var params = [req.stopid];

    pg.connect(connString, function(err, client, done) {
      done();
      if( err ) pgErrHandler(err);

      client.query(query, params, function(err, trips) {
        if( err ) pgErrHandler(err);

        res.json(trips.rows);
      });
    });
  });

stops.route('/shapes/:shapeid')
  .get(function(req, res) {
    var shapeid = req.shapeid;
    console.log('Shape ID: ' + shapeid);

    var query = "SELECT * " +
    "FROM shapes " +
    "WHERE shape_id = $1";
    var params = [shapeid];

    pg.connect(connString, function(err, client, done) {
      done();
      if( err ) pgErrHandler(err);

      client.query(query, params, function(err, shape) {
        if( err ) pgErrHandler(err);

        var shapes = shape.rows;
        var shapeGeoJson = {
          type: "Feature",
          bbox: (function() {
            // get the coords of the first and last shape in the sequences
            var first = shapes[0];
            var last = shapes[shapes.length - 1];
            return [
              [first['shape_pt_lat'], first['shape_pt_lon']],
              [last['shape_pt_lat'], last['shape_pt_lon']]
            ];
          })(),
          geometry: {
            type: "LineString",
            coordinates: _.zip(_.pluck(shapes, 'shape_pt_lon'), _.pluck(shapes, 'shape_pt_lat'))
          },
          properties: {
            shape_id: shapeid
          }
        };

        res.send(JSON.stringify(shapeGeoJson));
      });
    });
  });

stops.listen(3001);
console.log('Stops API listening on 3001');