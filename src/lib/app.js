/*function addSuburbToMap(geoJson) {
  var suburbLayer = L.mapbox.featureLayer();
  geoJson.properties = {
    "fill": "#B10001",
    "fill-opacity": 0.2,
    "stroke": "#B10001",
    "stroke-opacity": 0.8,
    "stroke-width": 1
  };
  suburbLayer.setGeoJSON(JSON.parse(geoJson));
  suburbLayerGroup.addLayer(suburbLayer);
  suburbLayerGroup.addTo(map);
}

function getBondi() {
  $.ajax({url: 'http://127.0.0.1:3001/suburb?name=bondi beach'})
    .done(addSuburbToMap);
}
setTimeout(function() { getBondi(); }, 1);
setTimeout(function() { getStopsData(); }, 1);*/

// Once we've got a position, zoom and center the map
// on it, and add a single marker.

/*function kickOff() {
  map.on('locationfound', function(e) {
    $('#app-startup').hide();
    if (positionMarker)
      map.removeLayer(positionMarker);

    positionMarker = createInitialPosition(e.latlng);
    positionMarker.addTo(map);

    $('#map').removeClass('blur');
    $('#map').removeClass('init');
    $('.right').removeClass('init');
    $('.left').show();

    var pos = [e.latitude, e.longitude];
    map.setView(pos, 16);

    initApp(positionMarker.getLatLng());

    // render the radius / location info bar
    React.render(<StopsWithinRadius numStops={0} />, document.getElementById('services-within-radius'));
  });

  // If the user chooses not to allow their location
  // to be shared, display an error message.
  map.on('locationerror', function() {
    $('#map').removeClass('blur');
    $('#geolocate').html('Position could not be found');
    $('#app-startup').hide().delay(1);

    $('#map').removeClass('blur');
    $('#map').removeClass('init');
    $('.right').removeClass('init');
    $('.left').show();

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
    var lat = this.getLatLng()['lat'],
        lon = this.getLatLng()['lng'];

    // clear the sidebar
    $('#route-info').empty();
    $('#route-container').hide();

    // reset the stop info while dragging
    React.render(<CurrentSelectedStopDisplay name={"Dragging..."} distance={0} />, document.getElementById('stop-container'));

    // global
    point = turf.point([lon, lat]);

    radialGeoJson = pointRadius(point, WALKING_DISTANCE, 'kilometers', 120);
    radialGeoJson.properties = radialStyle;
    radiusLayer.setGeoJSON(radialGeoJson);

    var numStops = showStopsWithinRadius();

    React.render(<StopsWithinRadius numStops={numStops} />,
      document.getElementById('services-within-radius'));
  });

  positionMarker.on('click', function(evt){
    if (! map.hasLayer(radiusLayer))
      map.addLayer(radiusLayer);
    if (! map.hasLayer(nearestStopsLayer))
      map.addLayer(nearestStopsLayer);
  });
}
*/



var shapeLayerCache = {};

function toggleShapeLayer(shapeId, action) {
  switch (action) {
    case 'show':
      if (shapeLayerCache[shapeId])
        map.addLayer(shapeLayerCache[shapeId]);
      break;
    case 'hide':
      map.removeLayer(shapeLayerCache[shapeId]);
      break;
  }
}

var lastColor = 0;
function addShapeLayer(shapeData, stopsData) {
  var nextColor = lastColor++ > (coloursArray.length - 1) ? 0 : lastColor
  var shapeColor = coloursArray[nextColor];
  lastColor = nextColor;

  var shapeId = shapeData.properties.shape_id.shape_id,
      routeLength = (turf.lineDistance(shapeData, 'kilometers')).toFixed(2),
      shapeStyle = {
        "color": shapeColor,
        "weight": 3,
        "opacity": 1
      },
      routeId = shapeData.properties.shape_id.route_id.split('_')[1],
      tripHeadSign = shapeData.properties.shape_id.trip_headsign;

  var layerGroup = L.layerGroup();
  var shapeLayerPopup = '<div>' + routeId + ' ' + tripHeadSign + '</div>' +
                        '<div>' + stopsData.length + ' stops in ' + routeLength + 'km</div>';

  if( ! shapeLayerCache[shapeId] ) {
    shapeLayer = L.geoJson(shapeData, {
      onEachFeature: function(feature, layer) {
        layer.setStyle(shapeStyle);

        layer.on({
          add: function() {
            map.fitBounds(shapeLayer.getBounds());
            layer.bindPopup(shapeLayerPopup);

            var circles = [],
                circleOptions = {
                  color: shapeColor,       // Stroke color
                  opacity: 1,             // Stroke opacity
                  weight: 2,              // Stroke weight
                  fillColor: '#fff',      // Fill color
                  fillOpacity: 1,         // Fill opacity
                  radius: 3
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
                  if( stopsData[idx].stop_id == selectedStop.stop_id )
                    geojson.properties.currentSelectedStop = true;

                  geojson.properties.stop_id = stopsData[idx].stop_id;
                  geojson.properties.title = '<div>' + routeId + ' ' + tripHeadSign + '</div>' +
                                             '<strong class="stop-name">' + stopsData[idx].stop_name + '</strong>' +
                                             '<div>Stop ' + (idx + 1) + ' of ' + (numStops + 1) + '</div>';

                  return geojson;
                });
              })()
            };

          // Stops, as indicated by circles on the shape
          stopsOnRouteLayer = L.geoJson(circlesGeoJson, {
            pointToLayer: function (feature, latlng) {
              if( feature.properties.startRoute )
                circleOptions.color = '#3cb371'; //mediumseagreen
              if( feature.properties.endRoute )
                circleOptions.color = '#cd5c5c'; //indianred
              if( feature.properties.currentSelectedStop )
                circleOptions.color = '#9370DB'; // mediumpurple
              if( ! (feature.properties.endRoute || feature.properties.startRoute || feature.properties.currentSelectedStop))
                circleOptions.color = shapeColor;

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
          })

          layerGroup.addLayer(stopsOnRouteLayer);
        },
        click: function(evt) {
          console.log('Clicked on shape');
          console.log(evt);
        },
        mouseover: function() {
          layer.openPopup();
        },
        mouseout: function() {
          layer.closePopup();
        }
      });
      }
    });
    layerGroup.addLayer(shapeLayer);
    shapeLayerCache[shapeId] = layerGroup;
  }
  else {
    console.log('Found shape layer ' + shapeId + ' in cache');
    layerGroup = shapeLayerCache[shapeId];
  }

  map.removeLayer(nearestStopsLayer);
  layerGroup.addTo(map);

  // messy
  var layer = {
    id: shapeId,
    color: shapeColor,
    name: tripHeadSign,
    route: routeId,
    layers: [shapeLayer, stopsOnRouteLayer],
    visibleOnMap: true
  };
  Layers.add(layer);

  React.render(<LayersList data={Layers.all()} />, document.getElementById('layers-list'));

  return shapeId;
}

function addNearestStopsLayer(nearestStopsGeoJson) {
  // clear previous
  if( nearestStopsLayer )
    map.removeLayer(nearestStopsLayer);

  if( !nearestStopsGeoJson.features )
    nearestStopsGeoJson = turf.featurecollection(nearestStopsGeoJson);

  if( nearestStopsGeoJson.features.length > 0 ) {
    nearestStopsGeoJson.features.forEach(formatMarkerFromFeature);

    var nearest = formatMarkerFromFeature(turf.nearest(point, nearestStopsGeoJson)),
        nearestdist = parseFloat(turf.distance(point, nearest, 'kilometers'));

    nearest.properties["marker-color"] = "093d7c";
    nearest.properties["title"] = '<strong class="stop-name">' + nearest.properties.stop_name +'</strong> <span class="stop-id">(' + nearest.properties.stop_id + ')</span>';
    nearest.properties["marker-size"] = "small";
    nearest.properties["marker-symbol"] = "bus";

    nearestStopsLayer = L.mapbox.featureLayer()
                        .setGeoJSON(turf.featurecollection([nearestStopsGeoJson, nearest]));

    nearestStopsLayer.eachLayer(function(marker) {
      // click on a marker within walking distance
      marker.on('click', markerClickHandler);
    });
    nearestStopsLayer.addTo(map);
  }
}

function formatMarkerFromFeature(feature){
  var popupContent = '<strong class="stop-name">' + feature.properties.stop_name + '</strong> <span class="stop-id">(' + feature.properties.stop_id + ')</span>';
  feature.properties["marker-color"] = "2775DB";
  feature.properties["title"] = popupContent;
  feature.properties["marker-size"] = "small";
  feature.properties["marker-symbol"] = "bus";
  return feature;
}

// main func
function showStopsWithinRadius(searchRadius) {
  var radius = searchRadius || WALKING_DISTANCE,
      stopsWithinRadius = turf.featurecollection(stopsGeoJson.features.filter(function(stop){
        if( turf.distance(stop, point, 'kilometers') <= radius ) return true;
      }));

  addNearestStopsLayer(stopsWithinRadius);
  return stopsWithinRadius.features.length;
}

function markerClickHandler(evt) {
  var marker = evt.target,
      feature = marker.feature,
      stopId = feature.properties.stop_id,
      _thismarker = evt,
      highLightedStopIcon = {
        "marker-color": "9370D8",
        "marker-size": "small",
        "marker-symbol": "bus",
      },
      standardIcon = {
        "marker-color": "2775DB",
        "marker-size": "small",
        "marker-symbol": "bus",
        "opacity": 0.5
      };

  setSelectedStop(feature.properties);

  nearestStopsLayer.eachLayer(function(_marker) {
    if(_marker._leaflet_id !== _thismarker._leaflet_id)
      _marker.setIcon(L.mapbox.marker.icon(standardIcon));
  });

  marker.setIcon(L.mapbox.marker.icon(highLightedStopIcon));
  marker.bindPopup(feature.properties.title, {minWidth: 220, maxWidth: 280, closeButton: true});
  //marker.openPopup();

  var featureMarker = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [positionMarker.getLatLng().lng, positionMarker.getLatLng().lat]
    }
  };

  React.render(<CurrentSelectedStopDisplay name={selectedStop.stop_name} distance={turf.distance(featureMarker, marker.feature, 'kilometers')} />, document.getElementById('stop-container'));

  // Get routes from this stop
  getRoutesFromStop(stopId, buildRoutesSelect);
}

function buildRoutesSelect(stopsResp) {
  var routesFromStop = stopsResp,
      allRoutesSelect = $('#route-select'),
      optionEls = [];

  routesFromStop.forEach(function(d) {
    var optionEl = $('<option class="fetch-shape" value="' + d.shape_id + '">' + d.route_short_name + ' - ' + d.route_long_name + '</option>');
    optionEls.push(optionEl);
  });

  // add the all routes select to the div
  $('#all-routes').html(allRoutesSelect.html(optionEls));
  $('#route-container').show();

  allRoutesSelect.on('change', function(evt) {
    var optionSelected = $('option:selected', this),
        shapeId = this.value;

    getStopsForShape({shape_id: shapeId}, addShapeWithStopsToMap);
  });

  // add Upcoming buses to the Sidebar
  getServicesInMinutes(selectedStop.stop_id, 5, addArrivingSoonServicesToSidebar);
}

function addShapeWithStopsToMap(stopsData) {
  // plot the shape, with stops
  getShapeData({shape_id: shapeId}, stopsData);

  var elData = '<div class="header" id="shape-meta">' + stopsData.length + ' stops in xx minutes (est)</div>';

  stopsData.forEach(function(s) {
    var highlightRow = $('#stop-name').text() === s.stop_name ? ' highlight' : '';
    elData += '<div class="stop-on-shape' + highlightRow + '" data-stop_id="' + s.stop_id + '"><strong>' + s.departure_time.substring(0, s.departure_time.length - 6) + '</strong> ' + s.stop_name + '</div>';
  });

  $('#shape-info h2').show();
  $('#shape-info').html(elData).show();
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

function getStopsForShape(opts, cb) {
  var endpoint = 'http://127.0.0.1:3001/trip?idType=';
  if(opts.shape_id)
    endpoint += 'shape_id&id=' + opts.shape_id;
  if(opts.trip_id)
    endpoint += 'trip_id&id=' + opts.trip_id;

  $.ajax({url: endpoint})
    .done(function(stops) { cb(stops); });
}

function getShapeData(opts, stopsData) {
  var endpoint = 'http://127.0.0.1:3001/shapes?idType=';
  if(opts.shape_id)
    endpoint += 'shape_id&id=' + opts.shape_id;
  if(opts.trip_id)
    endpoint += 'trip_id&id=' + opts.trip_id;

  return $.when($.ajax({url: endpoint}))
            .done(function(geojson) { addShapeLayer(geojson, stopsData); });
}

function getRoutesFromStop(stopId, cb) {
  $.ajax({
    url: 'http://127.0.0.1:3001/stops/' + stopId
  }).done(function(stopsResp) { cb(stopsResp); });
}

function getServicesInMinutes(stopId, minutes, cb) {
  $.ajax({
    url:'http://127.0.0.1:3001/stops/' + stopId + '/in/' + minutes
  }).done(function(services) { cb(services); });
}

//kickOff();