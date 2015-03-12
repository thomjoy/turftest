import React from 'react';

import AppStartUpSplash from 'lib/components/StartUpSplash.jsx!';
import LayersDisplay from 'lib/components/LayersDisplay.jsx!';
import StopsWithinRadius from 'lib/components/ServiceFilters.jsx!';
import CurrentSelectedStop from 'lib/components/CurrentSelectedStop.jsx!';
import Services from 'lib/components/Services.jsx!';


// data
import Layers from 'lib/components/Layers';
import MyMap from 'lib/components/Map';

console.log('application:', MyMap);

// map functions
console.log
var WALKING_DISTANCE = 0.25,
    icon = L.mapbox.marker.icon({
      "marker-color": "#8E8E8E",
      "title": "where are the stations?",
      "marker-symbol": "pitch",
      "marker-size": "small"
    });

var coloursArray = ['#d53e4f', '#fc8d59', '#fee08b', '#ffffbf', '#e6f598', '#99d594', '#3288bd'];

// Semantic U
//$('.menu .item').tab();
//$('.ui.dropdown').dropdown();

var selectedStop = {},
    setSelectedStop = function(stopProps) { selectedStop = stopProps; };

var positionMarker;           // user's position

// map layers
var stopsGeoJson,
    radiusLayer,
    shapeLayer,
    startEndRouteLayer,
    stopsOnRouteLayer,
    nearestStopsLayer;

var suburbLayerGroup = L.layerGroup();
var point;

// get the stops.json file from the server
function getStopsData() {
  $.ajax({url: 'http://127.0.0.1:3000/api/data/gtfs/stops.json'})
    .done(function(geojson) { stopsGeoJson = geojson; });
}

setTimeout(function() { getStopsData(); }, 1);

React.render(<AppStartUpSplash />, document.getElementById('app-startup'));