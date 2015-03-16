import React from 'react';
import PubSub from 'pubsub-js';

import AppStartUpSplash from 'lib/components/StartUpSplash.jsx!';
import LayersDisplay from 'lib/components/LayersDisplay.jsx!';
import StopsWithinRadius from 'lib/components/ServiceFilters.jsx!';
import CurrentSelectedStop from 'lib/components/CurrentSelectedStop.jsx!';
import ServicesArrivingSoonTab from 'lib/components/Services.jsx!';

// data
import Layers from 'lib/components/Layers';
import MyMap from 'lib/components/Map';
import Stop from 'lib/components/Stop';

window.APP = {
  selectedStop: {},
};

// Semantic U
//$('.menu .item').tab();
//$('.ui.dropdown').dropdown();

// Get the map to add the shape layer


PubSub.subscribe('map.init-complete', (msg, data) => {
  // render our location sidebar item
  React.render(<StopsWithinRadius numStops={data.numStops} />,
    document.getElementById('services-within-radius'));
});

PubSub.subscribe('map.position-update', (msg, data) => {
  React.render(<CurrentSelectedStop name={"Dragging..."} distance={0} />,
    document.getElementById('stop-container'));
});

// When a stop on the map is clicked (selected), render the Selected Stop compontent in the sidebar
PubSub.subscribe('map.stop-selected', (msg, data) => {
   React.render(<CurrentSelectedStop name={data.selectedStop}
          distance={data.distanceFromUserPosition} />,
          document.getElementById('stop-container'));

   window.APP.selectedStop = new Stop(data);

   // Promise based sequence should go here.
   // 1. Get routes that leave from this selected stop within the minutes allowed
   // 2. Add to sidebar
   // 3. Fetch Shapes.
   $('#route-container').show();

   // 1. add Upcoming buses to the Sidebar
   getServicesInMinutes(window.APP.selectedStop.stopId, 5)
    .then(data => addArrivingSoonServicesToSidebar(data));
});

PubSub.subscribe('map.shape.added', (msg, layer) => {
  Layers.add(layer);
  React.render(<LayersDisplay data={Layers.all()} />, document.getElementById('layers-list'));
});

function getRoutesFromStop(stopId, cb) {
  $.ajax({
    url: 'http://127.0.0.1:3001/stops/' + stopId
  }).done(function(stopsResp) { cb(stopsResp); });
}

function addArrivingSoonServicesToSidebar(arrivingSoonData) {
  var arrivingSoon = $('#arriving-soon'),
      segment = $('.segment', '#arriving-soon-container'),
      arrivingSoonItems = [];

  segment.addClass('loading');

  function makeServiceInnerHtml(service) {
    var routeStr = '<div class="show-route" data-trip_id="' + service.trip_id + '">Show route</div>';
    return '<li class="service">' +
            '<div><strong class="bus-number">' + service.route_id.split('_')[1] + '</strong><div class="bus-headsign">' + service.trip_headsign + '</div></div>' +
            routeStr + '</li>';
  }

  if( ! Object.keys(arrivingSoonData).length ) {
    var html = '<li class="service-outer no-service">No Services ' +
                '<div id="find-later" class="later"> find later</div></li>';
    arrivingSoonItems.push(html);
  }
  else {
    for( var arrivalTimeInMinutes in arrivingSoonData ) {
      var grouped = arrivingSoonData[arrivalTimeInMinutes],
          arr = grouped[0].departure_time.split(':'),
          depTime = arr[0] + ':' + arr[1],
          serviceHtml = '<li class="service-outer"><div class="time-segment">Arrives in ' + arrivalTimeInMinutes + 'm (' + depTime + ')</div><ul>';

      grouped.forEach(function(service) { serviceHtml += makeServiceInnerHtml(service); });
      serviceHtml += '</ul></li>';
      arrivingSoonItems.push(serviceHtml);
    }
  }

  setTimeout(function() { segment.removeClass('loading'); }, 500);

  React.render(<ServicesArrivingSoonTab services={arrivingSoonData} />, document.getElementById('arriving-soon-container'));
}

function getServicesInMinutes(stopId, minutes) {
  return Promise.resolve($.ajax({
    url:'http://127.0.0.1:3001/stops/' + stopId + '/in/' + minutes
  }));
}


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