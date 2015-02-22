SET TIME ZONE 'Australia/Sydney';

CREATE TABLE stops
(stop_id int, stop_code int, stop_name TEXT, stop_lat double precision, stop_lon double precision);

/* remove header rows when COPYING */
COPY stops FROM '/Users/thomjoy/code/turftest/gtfs/stops.txt' DELIMITER ',' CSV;

CREATE TABLE stop_times
(trip_id VARCHAR, arrival_time time with time zone, departure_time time with time zone, stop_id int, stop_sequence int);

COPY stop_times FROM '/Users/thomjoy/code/gtfs-utils/stop_times.txt' DELIMITER ',' CSV;

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
SELECT DISTINCT trips.route_id, routes.route_short_name, routes.route_long_name, trips.shape_id
FROM trips
JOIN routes on trips.route_id = routes.route_id
WHERE trip_id IN (SELECT DISTINCT trip_id FROM stop_times WHERE stop_id = 200076);

SELECT * FROM shapes WHERE shape_id = 157535;


SELECT st.trip_id, st.departure_time, t.route_id, now()
FROM stop_times st 
JOIN trips t ON t.trip_id = st.trip_id
WHERE st.stop_id = 200077
AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) <= (interval '5 minute') 
AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) > (interval '0 minute') 
ORDER BY st.departure_time ASC

SELECT date_trunc('minute', '14:30'::time without time zone) - date_trunc('minute', now()::time without time zone) < INTERVAL '5 minute'

SELECT st.stop_id, s.stop_name, st.arrival_time, st.departure_time
FROM stop_times st
JOIN stops s ON s.stop_id = st.stop_id
WHERE trip_id = (SELECT trip_id FROM trips WHERE shape_id = '156786' LIMIT 1)
ORDER BY st.stop_sequence;

SELECT greatest(-'1 hour'::interval, '1 hour'::interval);
