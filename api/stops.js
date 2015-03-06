// API
var express = require('express'),
    cors = require('cors'),
    _ = require('underscore'),
    stops = express(),

    // database
    pg = require('pg'),
    Cursor = require('pg-cursor'),
    connString = "postgres://thomjoy:@localhost/gtfs_syd",
    pgErrHandler = function(err) { return console.error(err); },

    // maps
    turf = require('turf'),

    // stops data from the fs
    data = require(__dirname + '/data/gtfs/stops.json'),
    API_DEFAULT_UNIT = 'kilometers',
    dayMap = {0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday'};

// set up middleware
stops.use(cors());

// end points
stops.route('/within/:distance/:latLng/')
  .get(function(req, res) {
    var unit = req.query.unit || API_DEFAULT_UNIT,
        latLng = req.latLng.split(','),
        distance = req.distance,
        withinRadius = turf.featurecollection(data.features.filter(function(stop){
          if (turf.distance(stop, turf.point(latLng.reverse()), unit) <= distance) return true;
        }));

    console.log('Found ' + withinRadius.features.length + ' in radius');
    res.json(withinRadius);
  });

// get routes from a given stop
stops.route('/stops/:stopid')
  .get(function(req, res) {
    var params = [req.params.stopid],
        query = "SELECT DISTINCT trips.route_id, routes.route_short_name, routes.route_long_name, trips.shape_id " +
        "FROM trips " +
        "JOIN routes on trips.route_id = routes.route_id " +
        "WHERE trip_id IN (SELECT DISTINCT trip_id FROM stop_times WHERE stop_id = $1) " +
        "ORDER BY trips.route_id ASC";

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
    var date = new Date(),
        dateQuery = " (SELECT service_id FROM calendar WHERE " + dayMap[date.getDay()] + " = 1)",
        params = [req.params.stopid],
        query = "SELECT DISTINCT st.trip_id, st.departure_time, t.route_id, t.shape_id, t.trip_headsign" +
        " FROM stop_times st" +
        " JOIN trips t ON t.trip_id = st.trip_id" +
        " JOIN calendar c ON c.service_id = t.service_id" +
        " WHERE st.stop_id = $1"+
        " AND t.service_id IN" + dateQuery +
        " AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) <= (interval '5 minute')" +
        " AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) > (interval '0 minute')" +
        " ORDER BY st.departure_time ASC";

    pg.connect(connString, function(err, client, done) {
      done();
      if( err ) pgErrHandler(err);

      client.query(query, params, function(err, trips) {
        if( err ) pgErrHandler(err);

        trips.rows.forEach(function(t) {
          var h = parseInt(date.getHours(), 10),
              m = parseInt(date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes(), 10),
              s = parseInt(date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds(), 10),
              dep_time = t.departure_time.split(':'),
              diff;

          // SOMETHING is removing an hour from the departure time, even though running the query directly works...
          if(dep_time !== 0) dep_time[0]++;

          // hours
          if (dep_time[0] == h && dep_time[1] !== m)
            diff = dep_time[1] - m;

          // if different hour
          if (dep_time[0] > h)
            diff = 60 - (dep_time[1] - m);

          t.departure_time = dep_time.join(':');
          t.departure_time_mins = diff;
        });

        res.json(_.groupBy(trips.rows, 'departure_time_mins'));
      });
    });
  });

stops.route('/shapes')
  .get(function(req, res) {
    var idType  = req.query.idType,
        id = req.query.id,
        params = [req.query.id],
        whereClause;

    if( idType === 'shape_id')
      whereClause = " WHERE s.shape_id = $1";
    if( idType == 'trip_id' )
      whereClause = " WHERE t.trip_id = $1";

    // this needs to be date/time aware
    var query = "SELECT * " +
        " FROM shapes s" +
        " JOIN trips t ON t.shape_id = s.shape_id" +
        whereClause;

    pg.connect(connString, function(err, client, done) {
      done();
      if( err ) pgErrHandler(err);

      client.query(query, params, function(err, shape) {
        if( err ) pgErrHandler(err);

        var shapes = shape.rows,
            shapeid = shapes[0],
            shape_id,
            shapeGeoJson = {
              type: "Feature",
              bbox: (function() {
                // get the coords of the first and last shape in the sequences
                var first = shapes[0],
                    last = shapes[shapes.length - 1];
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

        res.json(shapeGeoJson);
      });
    });
  });


stops.route('/trip')
  .get(function(req, res) {
    var idType  = req.query.idType,
        id = req.query.id,
        whereClause,
        date = new Date(),
        params = [id];

    if( idType === 'shape_id' )
      whereClause = " WHERE s.shape_id = $1";
    if( idType == 'trip_id' )
      whereClause = " WHERE t.trip_id = $1";

    var dateQuery = " (SELECT service_id FROM calendar WHERE " + dayMap[date.getDay()] + " = 1)",
        query = " SELECT DISTINCT t.trip_id, t.route_id, t.shape_id, st.stop_id, s.stop_name, st.stop_sequence, st.arrival_time, st.departure_time, s.stop_lat, s.stop_lon, t.direction_id" +
        " FROM stop_times st" +
        " JOIN stops s ON s.stop_id = st.stop_id" +
        " JOIN trips t ON t.trip_id = st.trip_id" +
        " JOIN calendar c ON c.service_id = t.service_id" +
        whereClause +
        " AND t.service_id IN " + dateQuery +
        " ORDER BY t.direction_id, st.stop_sequence;";

    pg.connect(connString, function(err, client, done) {
      done();
      if( err ) pgErrHandler(err);

      client.query(query, params, function(err, routeData) {
        if( err ) pgErrHandler(err);
        res.json(routeData.rows);
      });
    });
  });

stops.route('/nearest')
  .get(function(req, res) {
    var qs = req.query,
        date = new Date(),
        params = [qs.stop_lat,qs.stop_lon].map(function(n) { return (parseFloat(n, 10)).toFixed(7); }),
        kmToMiles = (parseFloat(qs.within_km, 10) * 0.62137),
        dateQuery = " (SELECT service_id FROM calendar WHERE " + dayMap[date.getDay()] + " = 1)",
        geomQuery = " AND ST_Distance_Sphere(geom, ST_MakePoint(" + params[1] + ", " + params[0] + ")) <= " + kmToMiles.toFixed(3) + " * 1609.34",
        query = "SELECT DISTINCT s.stop_id, s.stop_name, s.stop_lat, s.stop_lon, st.departure_time" +
        " FROM stops s" +
        " JOIN stop_times st ON st.stop_id = s.stop_id" +
        " JOIN trips t ON t.trip_id = st.trip_id" +
        " WHERE t.service_id IN" + dateQuery +
        " AND t.direction_id = " + parseInt(qs.direction_id, 10) +
        geomQuery +
        " AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) <= (interval '10 minute')" +
        " AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) > (interval '0 minute')";

    console.log('---------');
    console.log(query);
    console.log('---------');
    console.log(qs.within_km + 'km = ' + kmToMiles + 'miles');

    pg.connect(connString, function(err, client, done) {
      done();
      if( err ) pgErrHandler(err);

      client.query(query, [], function(err, stopsData) {
        if( err ) pgErrHandler(err);
        var data = _.groupBy(stopsData.rows, 'stop_id'),
            geoJson = [];

        var layerData = [];
        stopsData.rows.forEach(function(stop) {
          layerData.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [stop.stop_lon, stop.stop_lat]
            },
            properties: {
              "marker-size": "small",
              "marker-color": "2775DB",
              "marker-symbol": "bus",
              "stop_id": stop.stop_id,
              "stop_name": stop.stop_name
            }
          });
        });

        res.json({data: data, layer: layerData});
      });
    });
  });

stops.listen(3001);
console.log('Stops API listening on 3001');
console.log('Loading Data from: ' + __dirname + '/data/gtfs/stops.json');