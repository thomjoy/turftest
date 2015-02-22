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

stops.param('minutes', function(req, res, next, minutes) {
  if( minutes.match(/^\d+$/gi) ) {
    req.minutes = minutes;
    next();
  }
  else {
    next(new Error('minutes should be a numeric value'));
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

// get routes from a given stop
stops.route('/stops/:stopid')
  .get(function(req, res) {
    var query = "SELECT DISTINCT trips.route_id, routes.route_short_name, routes.route_long_name, trips.shape_id " +
    "FROM trips " +
    "JOIN routes on trips.route_id = routes.route_id " +
    "WHERE trip_id IN (SELECT DISTINCT trip_id FROM stop_times WHERE stop_id = $1) " +
    "ORDER BY trips.route_id ASC";
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

stops.route('/stops/:stopid/in/:minutes')
  .get(function(req, res) {
    var query = "SELECT DISTINCT st.trip_id, st.departure_time, t.route_id" +
    " FROM stop_times st" +
    " JOIN trips t ON t.trip_id = st.trip_id" +
    " WHERE st.stop_id = $1" +
    " AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) <= (interval '5 minute')" +
    " AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) > (interval '0 minute')" +
    " ORDER BY st.departure_time ASC";
    var params = [req.stopid];

    console.log("Stop ID: " + req.stopid);
    console.log("Minutes: " + req.minutes);

    pg.connect(connString, function(err, client, done) {
      done();
      if( err ) pgErrHandler(err);

      client.query(query, params, function(err, trips) {
        if( err ) pgErrHandler(err);

        trips.rows.forEach(function(t) {
          var date = new Date();
          var h = parseInt(date.getHours(), 10);
          var m = parseInt(date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes(), 10);
          var s = parseInt(date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds(), 10);
          var dep_time = t.departure_time.split(':');
          var diff;

          console.log('h: ' + h);
          console.log('m: ' + m);
          console.log('s: ' + s);
          console.log("dep_time: " + dep_time);

          // SOMETHING is removing an hour from the departure time, even though running the query directly works...
          if(dep_time !== 0) dep_time[0]++;

          // hours
          if (dep_time[0] == h && dep_time[1] !== m)
            diff = dep_time[1] - m;

          // if different hour
          if (dep_time[0] > h)
            diff = 60 - (dep_time[1] - m);

          //console.log("DIFF: " + diff + " minutes");

          t.departure_time = dep_time.join(':');
          t.departure_time_mins = diff;
        });

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

// this will sometimes be wrong, as shape != route != trip (can be fewer/more stops etc...)
// for now though, it's fine
stops.route('/stops/along/:shapeid')
  .get(function(req, res) {
    var shapeid = req.shapeid;
    var query = 'SELECT st.stop_id, s.stop_name, st.arrival_time, st.departure_time' +
    ' FROM stop_times st' +
    ' JOIN stops s ON s.stop_id = st.stop_id' +
    ' WHERE trip_id = (SELECT trip_id FROM trips WHERE shape_id = $1 LIMIT 1)' +
    ' ORDER BY st.stop_sequence;';
    var params = [shapeid];

    pg.connect(connString, function(err, client, done) {
      done();
      if( err ) pgErrHandler(err);

      client.query(query, params, function(err, routeData) {
        if( err ) pgErrHandler(err);

        routeData.rows.forEach(function(r) {
          console.log(r);
        });

        res.json(routeData.rows);
      });
    });
  });

stops.listen(3001);
console.log('Stops API listening on 3001');