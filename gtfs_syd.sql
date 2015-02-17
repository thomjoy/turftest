CREATE TABLE stops
(stop_id int, stop_code int, stop_name TEXT, stop_lat double precision, stop_lon double precision);

/* remove header rows when COPYING */
COPY stops FROM '/Users/thomjoy/code/turftest/gtfs/stops.txt' DELIMITER ',' CSV;

CREATE TABLE stop_times
(trip_id VARCHAR, arrival_time TEXT, departure_time TEXT, stop_id int, stop_sequence int);

COPY stop_times FROM '/Users/thomjoy/code/turftest/gtfs/stop_times.txt' DELIMITER ',' CSV;

CREATE TABLE trips
(route_id VARCHAR, service_id int, trip_id VARCHAR,trip_headsign VARCHAR, shape_id int,
wheelchair_accessible int, direction_id int);

COPY trips FROM '/Users/thomjoy/code/turftest/gtfs/trips.txt' DELIMITER ',' CSV;

CREATE TABLE routes 
(route_id VARCHAR, agency_id int, route_short_name VARCHAR, route_long_name VARCHAR, route_type int);

COPY routes FROM '/Users/thomjoy/code/turftest/gtfs/routes.txt' DELIMITER ',' CSV;

CREATE TABLE shapes
(shape_id int, shape_pt_lat double precision, shape_pt_lon double precision, shape_pt_sequence int);

COPY shapes FROM '/Users/thomjoy/code/turftest/gtfs/shapes.txt' DELIMITER ',' CSV;

SELECT stop_times.stop_id, count(stop_times.stop_id)
FROM stop_times
GROUP BY stop_times.stop_id
ORDER BY count(stop_times.stop_id) DESC

/* Get services from a stop */
SELECT trip_id FROM stop_times WHERE stop_id = "212762';