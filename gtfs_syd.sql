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

SELECT *
FROM shapes 
WHERE shape_id = 157535;x

/* view for populating the 'arriving soon' tab */
SELECT t.route_id, t.service_id, t.trip_id, t.trip_headsign, t.direction_id 
FROM trips t
JOIN routes r ON r.route_id = t.route_id

CREATE TABLE calendar 
(service_id int, monday int, tuesday int, wednesday int, thursday int, friday int, saturday int, sunday int, start_date date, end_date date);
COPY calendar FROM '/Users/thomjoy/code/turftest/gtfs/calendar.txt' DELIMITER ',' CSV;

SELECT r.route_id, t.trip_id, t.service_id, t.shape_id, c.monday, c.tuesday, c.wednesday, c.thursday, c.friday, c.saturday, c.sunday
FROM trips t
JOIN routes r ON r.route_id = t.route_id
JOIN calendar c ON c.service_id = t.service_id
WHERE t.service_id IN (SELECT c1.service_id
FROM calendar c1
WHERE c1.wednesday = 1)

/* get service_id's that run on tuesday */
SELECT c.service_id
FROM calendar c
WHERE c.tuesday = 1

/* get recently arriving services from a stop */
SELECT st.trip_id, st.departure_time, t.route_id, t.shape_id, t.trip_headsign
FROM stop_times st
JOIN trips t ON t.trip_id = st.trip_id
JOIN calendar c ON c.service_id = t.service_id
WHERE st.stop_id = 200077
AND t.service_id IN (SELECT c1.service_id
FROM calendar c1
WHERE c1.wednesday = 1)
AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) <= (interval '5 minute') 
AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) > (interval '0 minute') 
ORDER BY st.departure_time ASC

SELECT date_trunc('minute', '14:30'::time without time zone) - date_trunc('minute', now()::time without time zone) < INTERVAL '5 minute'

SELECT DISTINCT t.trip_id, t.route_id, t.shape_id, st.stop_id, s.stop_name, st.stop_sequence, st.arrival_time, st.departure_time, s.stop_lat, s.stop_lon, c.wednesday, t.direction_id
FROM stop_times st
JOIN stops s ON s.stop_id = st.stop_id
JOIN trips t ON t.trip_id = st.trip_id
JOIN calendar c ON c.service_id = t.service_id
WHERE t.trip_id = '76466985_20150127_11954'
AND t.service_id IN (
	SELECT c1.service_id
	FROM calendar c1
	WHERE c1.wednesday = 1
	)
ORDER BY t.direction_id, st.stop_sequence;

SELECT st.trip_id, st.departure_time, t.route_id, t.shape_id, t.trip_headsign
FROM stop_times st
JOIN trips t ON t.trip_id = st.trip_id
JOIN calendar c ON c.service_id = t.service_id
WHERE st.stop_id = 202161
AND t.service_id IN (SELECT c1.service_id
FROM calendar c1
WHERE c1.monday = 1)
AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) <= (interval '5 minute') 
AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) > (interval '0 minute') 
ORDER BY st.departure_time ASC

/* find the nearest stop in a radius where there is a service departing in the next X minutes */
SELECT st.stop_id, s.stop_lat, s.stop_lon, st.departure_time
FROM stops s 
JOIN stop_times st ON st.stop_id = s.stop_id
JOIN trips t ON t.trip_id = st.trip_id
AND t.service_id IN (SELECT c1.service_id
FROM calendar c1
WHERE c1.monday = 1)
AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) <= (interval '5 minute') 
AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) > (interval '0 minute') 

/* update the stops table to use postgis geometry types */
CREATE EXTENSION postgis;
SELECT AddGeometryColumn ('stops', 'geom', 4326, 'POINT', 2);
UPDATE stops SET geom = ST_Setsrid(ST_Makepoint(stop_lon, stop_lat),4326);

/* find all stops around a point - where there is service leaving in X minutes */
SELECT s.stop_name, s.stop_lat, s.stop_lon, st.departure_time
	FROM stops s 
	JOIN stop_times st ON st.stop_id = s.stop_id
	JOIN trips t ON t.trip_id = st.trip_id
	WHERE t.service_id IN (
		SELECT c1.service_id
		FROM calendar c1
		WHERE c1.monday = 1
	)
	AND t.direction_id = 1
	AND ST_Distance_Sphere(geom, ST_MakePoint(151.22639894485471, -33.88468522118266)) <= ((10 / 0.62137) / 100) * 1609.34
	AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) <= (interval '10 minute') 
	AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) > (interval '0 minute') 
	
SELECT s.stop_id, s.stop_name, s.stop_lat, s.stop_lon, st.departure_time 
FROM stops s 
JOIN stop_times st ON st.stop_id = s.stop_id 
JOIN trips t ON t.trip_id = st.trip_id 
WHERE t.service_id IN (SELECT service_id FROM calendar WHERE tuesday = 1) 
AND t.direction_id = 1 
AND ST_Distance_Sphere(geom, ST_MakePoint(151.2263989448547,-33.88468522118266)) <= 0.4023367719716111 * 1609.34 
AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) <= (interval '5 minute') 
AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) > (interval '0 minute')
ORDER BY st.departure_time;

SELECT DISTINCT s.stop_id, s.stop_name, s.stop_lat, s.stop_lon, st.departure_time 
FROM stops s 
JOIN stop_times st ON st.stop_id = s.stop_id 
JOIN trips t ON t.trip_id = st.trip_id 
WHERE t.service_id IN (SELECT service_id FROM calendar WHERE tuesday = 1) 
AND t.direction_id = 0 
AND ST_Distance_Sphere(geom, ST_MakePoint(151.2714953, -33.8912064)) <= 0.402 * 1609.34 
AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) <= (interval '10 minute') 
AND date_trunc('minute', st.departure_time::time) - date_trunc('minute', now()::time) > (interval '0 minute');
