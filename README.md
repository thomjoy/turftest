# turftest
Playing around with turf.js

### TODO
- Given a current position and a destination:
 - provide routes that leave from your nearest stop
 - provide best/alternative routes
 -

### UI
- signify where the current stop is in the route (i.e stop 5/18 or maybe %age as total distance).
- double click to move the 'you' marker to anywhere on the map
- show all routes from a stop (different colour polylines?)
- add geocoding - i.e. move marker by typing an address
- can we get traffic data?
- given a location (say, from using the directions api) can we find the best bus stop?

- can we filter out stops in radius which are the end of a route?
- offload some of the turf compute into webworkers?
- whether or not you'd make it to the stop for the next bus, based on your distance from the stop? (confidence rating)

### Shapes
When a shape (with stops) is displayed on the map, show a panel with the shape information and a way to toggle it on/off.
Keep track of which layers are visible via the cache?