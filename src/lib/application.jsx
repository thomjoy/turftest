import React from 'react';
import PubSub from 'pubsub-js';

import AppStartUpSplash from 'lib/components/StartUpSplash.jsx!';
import LayersDisplay from 'lib/components/LayersDisplay.jsx!';
import StopsWithinRadius from 'lib/components/ServiceFilters.jsx!';
import CurrentSelectedStop from 'lib/components/CurrentSelectedStop.jsx!';
import Services from 'lib/components/Services.jsx!';

// data
import Layers from 'lib/components/Layers';
import MyMap from 'lib/components/Map';

// Semantic U
//$('.menu .item').tab();
//$('.ui.dropdown').dropdown();

PubSub.subscribe('map.init-complete', (msg, data) => {

});

// When a stop on the map is clicked (selected), render the Selected Stop compontent in the sidebar
PubSub.subscribe('map.stop-selected', (msg, data) => {
   React.render(<CurrentSelectedStop name={data.selectedStop}
          distance={data.distanceFromUserPosition} />,
          document.getElementById('stop-container'));
});

// map functions
var WALKING_DISTANCE = 0.25,
    icon = L.mapbox.marker.icon({
      "marker-color": "#8E8E8E",
      "title": "where are the stations?",
      "marker-symbol": "pitch",
      "marker-size": "small"
    }),
    coloursArray = ['#d53e4f', '#fc8d59', '#fee08b', '#ffffbf', '#e6f598', '#99d594', '#3288bd'];

var selectedStop = {},
    setSelectedStop = (stopProps) => { selectedStop = stopProps; },
    suburbLayerGroup = L.layerGroup();

// get the stops.json file from the server
function getStopsData() {
  $.ajax({url: 'http://127.0.0.1:3000/api/data/gtfs/stops.json'})
    .done(function(geojson) { window.stopsGeoJson = geojson; });
}

getStopsData();

React.render(<AppStartUpSplash />, document.getElementById('app-startup'));