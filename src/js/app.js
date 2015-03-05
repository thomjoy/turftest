// app.js
L.mapbox.accessToken = 'pk.eyJ1IjoidGhvbWpveTE5ODQiLCJhIjoiTGx2V3ZUVSJ9.pZlOrVUXu_aC1i0nTvpIpA';
var map = L.mapbox.map('map', 'thomjoy1984.igjcb5m0'),
    icon = L.mapbox.marker.icon({
      "marker-color": "#8E8E8E",
      "title": "where are the stations?",
      "marker-symbol": "pitch",
      "marker-size": "small"
    });

// React Components
var GeoLocateButton = React.createClass({
  getInitialState: function() {
    return { content: "Locate Me!" };
  },
  getLocation: function(evt) {
    if( ! navigator.geolocation ) {
       this.setState({content: 'Geolocation is not available'});
    }
    else {
      this.setState({content: 'Locating...'});
      map.locate();
    }
  },
  render: function() {
    return(
      <div id="geolocate"
        onClick={this.getLocation}
        className="ui button green">{this.state.content}</div>
    );
  }
});

React.render(<GeoLocateButton />, document.getElementById('overlay'));

// Button
var GetServicesButton = React.createClass({
  getInitialState: function() {
    return {
      content: 'Find Services'
    }
  },
  getServices: function() {
    var pos = positionMarker.getLatLng(),
        withinKm = $('#distance option:selected').val(),
        directionId = $('#direction_id').is(':checked') ? 1 : 0;

    $.ajax({
      url: 'http://localhost:3001/nearest',
      data: {
        stop_lat: pos.lat,
        stop_lon: pos.lng,
        within_km: withinKm,
        direction_id: directionId
      }
    }).done(function(data) {
      nearestStopsLayer.setGeoJSON(data.layer);
    });
  },
  render: function() {
    return (<div id="find-services" onClick={this.getServices} className="ui button mini blue">{this.state.content}</div>);
  }
});

// Select
var DistanceFromCurrentPositionSelect = React.createClass({
  render: function() {
    return(
      <select id="distance">
        <option value="0.25">250m</option>
        <option value="0.5">500m</option>
        <option value="1">1km</option>
      </select>)
  }
});

var FindServicesArrivingSoon = React.createClass({
  render: function() {
    return(
      <div id="near-me" className="ui hover-util">
        <h6 className="ui header">Show me stops near me that have a bus leaving soon</h6>
        <DistanceFromCurrentPositionSelect />
        <GetServicesButton />
      </div>
    )
  }
});

React.render(<FindServicesArrivingSoon />, document.body);

$('#distance').on('change', function() {
   var pos = positionMarker.getLatLng(),
      withinKm = $('#distance option:selected').val();

  map.removeLayer(radiusLayer);
  createRadiusLayer({lat: pos.lat, lng: pos.lng}, withinKm);
});

// App starts here
var liveTrafficUrl = 'http://livetraffic.rta.nsw.gov.au/traffic/hazards/incident.json';

$('.menu .item').tab();
$('.ui.dropdown').dropdown();

var CURRENT_STOP_ID,
    WALKING_DISTANCE = 0.25,  // in km
    positionMarker;           // user's position

// map layers
var stopsGeoJson,
    radiusLayer,
    shapeLayer,
    startEndRouteLayer,
    stopsOnRouteLayer,
    nearestStopsLayer;

// center of the radial
var point,
    radialStyle = {
      "fill": "#6baed6",
      "fill-opacity": 0.1,
      "stroke": "#3182bd",
      "stroke-width": 2,
      "stroke-opacity": 0.5
    };

function createInitialPosition(coords) {
  return L.marker(coords, {
    icon: icon,
    draggable: true,
    zIndexOffset:999
  });
}

// Once we've got a position, zoom and center the map
// on it, and add a single marker.
function kickOff() {
  map.on('locationfound', function(e) {
    debugger;
    $('#overlay').hide();
    if (positionMarker)
      map.removeLayer(positionMarker);

    console.log(e);
    positionMarker = createInitialPosition(e.latlng);
    positionMarker.addTo(map);

    $('#map').removeClass('blur');
    $('#map').removeClass('init');
    $('.right').removeClass('init');
    $('.left').show();

    var pos = [e.latitude, e.longitude];
    map.setView(pos, 16);

    initApp(positionMarker.getLatLng());
  });

  // If the user chooses not to allow their location
  // to be shared, display an error message.
  map.on('locationerror', function() {
    $('#map').removeClass('blur');
    geolocate.innerHTML = 'Position could not be found';
    if (positionMarker)
      map.removeLayer(positionMarker);

    var defaultPos = [-33.865,151.209];
    positionMarker = createInitialPosition(defaultPos);
    positionMarker.addTo(map);
    map.setView(defaultPos, 15);

    initApp(positionMarker.getLatLng());
  });
}

function initApp(pos) {
  createRadiusLayer({lat: pos.lat, lng: pos.lng}, WALKING_DISTANCE);

  // event handlers
  positionMarker.on('drag', function(evt) {
    var lat = this.getLatLng()['lat'];
    var lon = this.getLatLng()['lng'];

    // clear the sidebar
    $('#route-info').empty();
    $('#stop-container').hide();
    $('#route-container').hide();

    // global
    point = turf.point([lon, lat]);

    radialGeoJson = pointRadius(point, WALKING_DISTANCE, 'kilometers', 120);
    radialGeoJson.properties = radialStyle;
    radiusLayer.setGeoJSON(radialGeoJson);

    calcStopsInRadius();
  });

  positionMarker.on('click', function(evt){
    if (! map.hasLayer(radiusLayer))
      map.addLayer(radiusLayer);
    if (! map.hasLayer(nearestStopsLayer))
      map.addLayer(nearestStopsLayer);
  });

  // kick everything else off
  getStopsData();
}

function createRadiusLayer(aroundPoint, radiusInKm) {
  // the center of the radial, initially.
  point = turf.point([aroundPoint.lng, aroundPoint.lat]);

  // radius
  radiusLayer = L.mapbox.featureLayer().addTo(map);
  radialGeoJson = pointRadius(point, radiusInKm, 'kilometers', 120);
  radialGeoJson.properties = radialStyle;
  radiusLayer.setGeoJSON(radialGeoJson, {
    onEachFeature: function(feature, layer) { }
  });
  radiusLayer.on('click', function(evt) { });
}

// some utility functions
function pointRadius(pt, radius, units, resolution) {
  var ring = [],
      resMultiple = 360/resolution;

  for(var i  = 0; i < resolution; i++) {
    var spoke = turf.destination(pt, radius, i*resMultiple, units);
    ring.push(spoke.geometry.coordinates);
  }

  if((ring[0][0] !== ring[ring.length-1][0]) && (ring[0][1] != ring[ring.length-1][1])) {
    ring.push([ring[0][0], ring[0][1]]);
  }

  return turf.polygon([ring]);
}

function addShapeLayer(shapeData, stopsData) {
  var routeLength = (turf.lineDistance(shapeData, 'kilometers')).toFixed(2),
      myStyle = {
        "color": "#2775DB",
        "weight": 3,
        "opacity": 1
      };

  $('.route-length').html(stopsData.length + ' stops in ' + routeLength + 'km');

  // clear previous layers
  if( shapeLayer )
    map.removeLayer(shapeLayer);
  if( startEndRouteLayer )
    map.removeLayer(startEndRouteLayer);
  if( stopsOnRouteLayer )
    map.removeLayer(stopsOnRouteLayer);

  shapeLayer = L.geoJson(shapeData, {
    onEachFeature: function(feature, layer) {
      layer.setStyle(myStyle);

      layer.on({
        add: function() {
          map.fitBounds(shapeLayer.getBounds());

          var circles = [],
              circleOptions = {
                color: '#2775DB',       // Stroke color
                opacity: 1,             // Stroke opacity
                weight: 3,              // Stroke weight
                fillColor: '#fff',      // Fill color
                fillOpacity: 1,         // Fill opacity
                radius: 4
              },
              numStops = (stopsData.length - 1);

          // plot stops on shape as circles
          stopsData.forEach(function(stop) {
            circles.push(L.circleMarker([stop.stop_lat, stop.stop_lon], circleOptions));
          });

          var circlesGeoJson = {
            type: "FeatureCollection",
            features: (function() {
              return circles.map(function(circle, idx) {
                var geojson = circle.toGeoJSON();

                if( idx === 0 )
                  geojson.properties.startRoute = true;
                if( idx === numStops )
                  geojson.properties.endRoute = true;
                if( stopsData[idx].stop_id == CURRENT_STOP_ID )
                  geojson.properties.currentSelectedStop = true;

                geojson.properties.stop_id = stopsData[idx].stop_id;
                geojson.properties.title = '<strong class="stop-name">' + stopsData[idx].stop_name + '</strong>' +
                                           '<div>Stop ' + (idx + 1) + ' of ' + (numStops + 1) + '</div>';

                return geojson;
              });
            })()
          };

        stopsOnRouteLayer = L.geoJson(circlesGeoJson, {
          pointToLayer: function (feature, latlng) {
            if( feature.properties.startRoute )
              circleOptions.color = '#3cb371'; //mediumseagreen
            if( feature.properties.endRoute )
              circleOptions.color = '#cd5c5c'; //indianred
            if( feature.properties.currentSelectedStop )
              circleOptions.color = '#9370DB'; // mediumpurple
            if( ! (feature.properties.endRoute || feature.properties.startRoute || feature.properties.currentSelectedStop))
              circleOptions.color = '#2775DB';

            return L.circleMarker(latlng, circleOptions);
          },
          onEachFeature: function(feature, layer) {
            layer.bindPopup(feature.properties.title);

            layer.on('mouseover', function(evt) {
              var stopId = feature.properties.stop_id;
              $('#shape-info .stop-on-shape').filter(function() {
                return $(this).data('stop_id') == stopId;
              }).addClass('match-stop');
              layer.openPopup();
            });

            layer.on('mouseout', function(evt) {
               $('.match-stop').removeClass('match-stop');
            });
          }
        }).addTo(map);
      },
      click: function(evt) {
        console.log('Clicked on shape');
        console.log(evt);
      }
    });
  }
});

// might be able to remove
function generateMarkerGeoJson(coords) {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [coords[0], coords[1]]
    },
    properties: {
      "marker-size": "small",
      "marker-color": "2775DB",
      "marker-symbol": "bus"
    }
  };
}

  map.removeLayer(nearestStopsLayer);
  shapeLayer.addTo(map);
}

// main func
function calcStopsInRadius() {
  // clear previous
  if( nearestStopsLayer )
    map.removeLayer(nearestStopsLayer);

  var withinRadius = turf.featurecollection(stopsGeoJson.features.filter(function(stop){
    if( turf.distance(stop, point, 'kilometers') <= WALKING_DISTANCE ) return true;
  }));

  if( withinRadius.features.length > 0 ) {
    $('#stops-nearby')
      .html('<span id="num-stops">' + withinRadius.features.length + ' </span> stops within <span id="walking-distance">' + WALKING_DISTANCE + 'km</span>');

    $('#location-info').slideDown();

    withinRadius.features.forEach(function(feature){
        var popupContent = '<strong class="stop-name">' + feature.properties.stop_name + '</strong> <span class="stop-id">(' + feature.properties.stop_id + ')</span>';
        feature.properties["marker-color"] = "2775DB";
        feature.properties["title"] = popupContent;
        feature.properties["marker-size"] = "small";
        feature.properties["marker-symbol"] = "bus";
    });

    var nearest = turf.nearest(point, withinRadius),
        nearestdist = parseFloat(turf.distance(point, nearest, 'kilometers'));

    nearest.properties["marker-color"] = "093d7c";
    nearest.properties["title"] = '<strong class="stop-name">' + nearest.properties.stop_name +'</strong> <span class="stop-id">(' + nearest.properties.stop_id + ')</span>';
    nearest.properties["marker-size"] = "small";
    nearest.properties["marker-symbol"] = "bus";

    nearestStopsLayer = L.mapbox.featureLayer()
                        .setGeoJSON(turf.featurecollection([withinRadius, nearest]));

    nearestStopsLayer.eachLayer(function(marker) {
      var feature = marker.feature,
          stopId = feature.properties.stop_id,
          stopName = feature.properties.stop_name;

      // click on a marker within walking distance
      marker.on('click', function(e) {
        var highLightedStopIcon = {
          "marker-color": "9370D8",
          "marker-size": "small",
          "marker-symbol": "bus",
        };

        var standardIcon = {
          "marker-color": "2775DB",
          "marker-size": "small",
          "marker-symbol": "bus",
          "opacity": 0.5
        };

        CURRENT_STOP_ID = stopId;
        var _thismarker = marker;
        nearestStopsLayer.eachLayer(function(_marker) {
          if(_marker._leaflet_id !== _thismarker._leaflet_id)
            _marker.setIcon(L.mapbox.marker.icon(standardIcon));
        });

        marker.setIcon(L.mapbox.marker.icon(highLightedStopIcon));
        marker.bindPopup(feature.properties.title, {minWidth: 220, maxWidth: 280, closeButton: true});
        marker.openPopup();

        var featureMarker = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [positionMarker.getLatLng().lng, positionMarker.getLatLng().lat]
          }
        };

        var distance = turf.distance(featureMarker, marker.feature, 'kilometers');
        $('#stop-distance').html((distance * 1000).toPrecision(3) + 'm from your position');

        // Get routes from this stop
        var prm = xhr({url: 'http://127.0.0.1:3001/stops/' + stopId}).done(function(stopsResp) {
          var routesFromStop = JSON.parse(stopsResp),
              allRoutesSelect = $('#route-select'),
              optionEls = [];

          $('#stop-name').html(stopName);
          $('#stop-container').show();

          routesFromStop.forEach(function(d) {
            //console.log(d);
            var optionEl = $('<option class="fetch-shape" value="' + d.shape_id + '">' + d.route_short_name + ' - ' + d.route_long_name + '</option>');
            optionEls.push(optionEl);
          });

          // add the all routes select to the div
          $('#all-routes').html(allRoutesSelect.html(optionEls));
          $('#route-container').show();

          allRoutesSelect.on('change', function(evt) {
            var optionSelected = $('option:selected', this),
                shapeId = this.value;

            getStopsForShape({shape_id: shapeId}, function(stopsData) {
              // plot the shape, with stops
              getShapeData({shape_id: shapeId}, stopsData);

              var elData = '<div class="header" id="shape-meta">' + stopsData.length + ' stops in xx minutes (est)</div>';

              stopsData.forEach(function(s) {
                var highlightRow = $('#stop-name').text() === s.stop_name ? ' highlight' : '';
                elData += '<div class="stop-on-shape' + highlightRow + '" data-stop_id="' + s.stop_id + '"><strong>' + s.departure_time.substring(0, s.departure_time.length - 6) + '</strong> ' + s.stop_name + '</div>';
              });

              $('#shape-info h2').show();
              $('#shape-info').html(elData).show();
            });
          });

          // add Upcoming buses to the Sidebar
          getServicesInMinutes(stopId, 5, function(arrivingSoonData) {
            var arrivingSoon = $('#arriving-soon'),
                segment = $('.segment', '#arriving-soon-container'),
                arrivingSoonItems = [];

            segment.addClass('loading');

            function makeHtml(service, html) {
                var str = '<div class="show-route" data-trip_id="' + service.trip_id + '">Show route</div>';
                html += '<li class="service">' +
                        '<div><strong class="bus-number">' + service.route_id.split('_')[1] + '</strong><div class="bus-headsign">' + service.trip_headsign + '</div></div>' +
                        str + '</li>';
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
                    depTime = arr[0] + ':' + arr[1];

                var htmlItem = '<li class="service-outer">' +
                          '<div class="time-segment">Arrives in ' + arrivalTimeInMinutes + 'm (' + depTime + ')</div>' +
                          '<ul>';
                grouped.forEach(function(service) { makeHtml(service, htmlItem); });
                htmlItem += '</ul></li>';
                arrivingSoonItems.push(htmlItem);
              }
            }

            setTimeout(function() { segment.removeClass('loading'); }, 500);
            arrivingSoon.html(arrivingSoonItems);

            $('.show-route').on('click', function(evt) {
              var tripId = $(this).data('trip_id');

              $(this).toggleClass('active');
              $(this).html($(this).hasClass('active') ? 'hide route' : 'show route');

              if ($(this).hasClass('active')) {
                $('.route-length').remove();
                $(this).append($('<div class="route-length"></div>'));
              }

              getStopsForShape({trip_id: tripId}, function(stopsData) {
                // plot the shape, with stops
                getShapeData({trip_id: tripId}, stopsData);
              });
            });
          });
        });
      });
    });
    nearestStopsLayer.addTo(map);
  }
}

// get the stops.json file from the server
function getStopsData() {
  $.ajax({url:'http://127.0.0.1:3000/api/data/gtfs/stops.json'})
    .done(function(geojson) {
      stopsGeoJson = JSON.parse(geojson);
      calcStopsInRadius();
    });
}

function getStopsForShape(opts, cb) {
  var endpoint = 'http://127.0.0.1:3001/trip?idType=';
  if(opts.shape_id)
    endpoint += 'shape_id&id=' + opts.shape_id;
  if(opts.trip_id)
    endpoint += 'trip_id&id=' + opts.trip_id;

  $.ajax({url: endpoint})
    .done(function(stops) {
      cb(JSON.parse(stops));
    });
}

function getShapeData(opts, stopsData) {
  var endpoint = 'http://127.0.0.1:3001/shapes?idType=';
  if(opts.shape_id)
    endpoint += 'shape_id&id=' + opts.shape_id;
  if(opts.trip_id)
    endpoint += 'trip_id&id=' + opts.trip_id;

  $.ajax({url: endpoint})
    .done(function(geojson) {
      addShapeLayer(JSON.parse(geojson), stopsData);
    });
}

function getServicesInMinutes(stopId, minutes, cb) {
  $.ajax({
    url:'http://127.0.0.1:3001/stops/' + stopId + '/in/' + minutes
  }).done(function(services) {
    cb(JSON.parse(services));
  });
}

kickOff();