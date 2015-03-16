import $ from 'jquery';
import turf from 'turf';
import _ from 'underscore';
import 'mapbox.js';
import PubSub from 'pubsub-js';

L.mapbox.accessToken = 'pk.eyJ1IjoidGhvbWpveTE5ODQiLCJhIjoiTGx2V3ZUVSJ9.pZlOrVUXu_aC1i0nTvpIpA';

function createPointRadius(pt, radius, units, resolution) {
  var ring = [],
      resMultiple = 360/resolution;

  for (var i  = 0; i < resolution; i++) {
    var spoke = turf.destination(pt, radius, i*resMultiple, units);
    ring.push(spoke.geometry.coordinates);
  }

  if ((ring[0][0] !== ring[ring.length-1][0]) && (ring[0][1] != ring[ring.length-1][1])) {
    ring.push([ring[0][0], ring[0][1]]);
  }

  return turf.polygon([ring]);
}

function createPosition(coords) {
  var icon = L.mapbox.marker.icon({
    "marker-color": "#8E8E8E",
    "title": "where are the stations?",
    "marker-symbol": "pitch",
    "marker-size": "small"
  });

  return L.marker(coords, {
    icon: icon,
    draggable: true,
    zIndexOffset:999
  });
}

var shapeLayerCache = {};

class MyMap {
  constructor(opts) {
    _.extend(this, opts);
    this.map = L.mapbox.map(this.mapDiv, this.proj);

    // TODO: use this.pont to replace point global
    this.userCurrentPosition = null;

    // L.Marker, representing users position
    this.positionMarker = null;

    //
    this.stopsGeoJson = {};

    // Map Layers
    this.nearestStopsLayer;
    this.radiusLayer;
    this.shapeLayer;
    this.startEndRouteLayer;   // remove
    this.stopsOnRouteLayer;
    this.nearestStopsLayer;

    // argh horrible
    this.setupMapHandlers();

    // wat
    this.radialStyle = {
      "fill": "#6baed6",
      "fill-opacity": 0.1,
      "stroke": "#3182bd",
      "stroke-width": 2,
      "stroke-opacity": 0.5
    };

    this.coloursArray = [
      '#d53e4f',
      '#fc8d59',
      '#fee08b',
      '#ffffbf',
      '#e6f598',
      '#99d594',
      '#3288bd'];
    this.lastColor = 0;

    // holds the circles (stops) + shape for a route
    // we map this to a Layer in the toggle Layer panel, to ensure we remove all compoonents of a route
    this.shapeLayerGroup = L.layerGroup();

    let shapeFetchedHandler = (msg, data) => {
      this.addShapeLayer(data.shapeData, data.stopsData);
    };

    let toggleShapeHandler = (msg, data) => {
      console.log(data);
      this.toggleShapeLayer(data.shapeId, data.action);
    };

    // this should be merged into one topic, where we only 'fetch' if we can't 'toggle'
    PubSub.subscribe('services.shape-fetched', shapeFetchedHandler);
    PubSub.subscribe('services.toggle-shape', toggleShapeHandler);
  }

  toggleShapeLayer(shapeId, action) {
    switch (action) {
      case 'show':
        if (shapeLayerCache[shapeId])
          this.map.addLayer(shapeLayerCache[shapeId]);
        break;
      case 'hide':
        this.map.removeLayer(shapeLayerCache[shapeId]);
        break;
    }
  }

  setupMapHandlers() {
    let locationFoundHandler = (location) => {
      $('#app-startup').hide();

      if (this.positionMarker)
        this.map.removeLayer(this.positionMarker);

      this.positionMarker = createPosition(location.latlng);
      this.positionMarker.addTo(this.map);

      $('#map').removeClass('blur').removeClass('init');
      $('.right').removeClass('init');
      $('.left').show();

      this.map.setView([location.latitude, location.longitude], 16);
      this.initMap(this.positionMarker.getLatLng());
    };

    let locationErrorHandler = () => {
      $('#map').removeClass('blur');
      $('#geolocate').html('Position could not be found');
      $('#app-startup').hide().delay(1);

      $('#map').removeClass('blur').removeClass('init');
      $('.right').removeClass('init');
      $('.left').show();

      var defaultPosition = [-33.865,151.209];
      this.positionMarker = createPosition(defaultPosition);
      this.positionMarker.addTo(this.map);
      this.map.setView(defaultPosition, 15);

      this.initMap(this.positionMarker.getLatLng());
    };

    this.map.on('locationfound', locationFoundHandler);
    this.map.on('locationerror', locationErrorHandler);
  }

  initMap(startingPosition) {
    let WALKING_DISTANCE = 0.25;
    this.radiusLayer = this.createRadiusLayer({lat: startingPosition.lat, lng: startingPosition.lng}, WALKING_DISTANCE);
    PubSub.publish('map.init-complete', {distance: 0, numStops: 0});

    // event handlers
    this.positionMarker.on('drag', (evt) => {
      var lat = evt.target.getLatLng()['lat'],
          lon = evt.target.getLatLng()['lng'];

      // clear the sidebar
      $('#route-info').empty();
      $('#route-container').hide();

      // reset the stop info while dragging
      this.userCurrentPosition = turf.point([lon, lat]);

      var radialGeoJson = createPointRadius(this.userCurrentPosition, WALKING_DISTANCE, 'kilometers', 120);
      radialGeoJson.properties = this.radialStyle;

      this.radiusLayer.setGeoJSON(radialGeoJson);
      var numStops = this.showStopsWithinRadius();
      PubSub.publish('map.position-update', {distance: 0, numStops: numStops});
    });

    this.positionMarker.on('click', (evt) => {
      if (! this.map.hasLayer(this.radiusLayer))
        this.map.addLayer(this.radiusLayer);
      if (! this.map.hasLayer(this.nearestStopsLayer))
        this.map.addLayer(this.nearestStopsLayer);
    });
  }

  createRadiusLayer(aroundPoint, radiusInKm) {
    this.userCurrentPosition = turf.point([aroundPoint.lng, aroundPoint.lat]);

    var radiusLayer = L.mapbox.featureLayer().addTo(this.map),
        radialGeoJson = createPointRadius(this.userCurrentPosition, radiusInKm, 'kilometers', 120);
    radialGeoJson.properties = this.radialStyle;

    radiusLayer.setGeoJSON(radialGeoJson, {
      onEachFeature: function(feature, layer) { }
    });

    radiusLayer.on('click', function(evt) { });
    return radiusLayer;
  }

  addNearestStopsLayer(nearestStopsGeoJson) {
    // clear previous
    if( this.nearestStopsLayer )
      this.map.removeLayer(this.nearestStopsLayer);

    if( !nearestStopsGeoJson.features )
      nearestStopsGeoJson = turf.featurecollection(nearestStopsGeoJson);

    var formatMarkerFromFeature = function(feature) {
      var popupContent = '<strong class="stop-name">' + feature.properties.stop_name + '</strong> <span class="stop-id">(' + feature.properties.stop_id + ')</span>';
      feature.properties["marker-color"] = "2775DB";
      feature.properties["title"] = popupContent;
      feature.properties["marker-size"] = "small";
      feature.properties["marker-symbol"] = "bus";
      return feature;
    };

    if( nearestStopsGeoJson.features.length > 0 ) {
      nearestStopsGeoJson.features.forEach(formatMarkerFromFeature);

      var nearest = formatMarkerFromFeature(turf.nearest(this.userCurrentPosition, nearestStopsGeoJson)),
          nearestdist = parseFloat(turf.distance(this.userCurrentPosition, nearest, 'kilometers'));

      nearest.properties["marker-color"] = "093d7c";
      nearest.properties["title"] = '<strong class="stop-name">' + nearest.properties.stop_name +'</strong> <span class="stop-id">(' + nearest.properties.stop_id + ')</span>';
      nearest.properties["marker-size"] = "small";
      nearest.properties["marker-symbol"] = "bus";

      this.nearestStopsLayer = L.mapbox.featureLayer()
                                .setGeoJSON(turf.featurecollection([nearestStopsGeoJson, nearest]));

      let markerClickHandler = (evt) => {
        var marker = evt.target,
            feature = marker.feature,
            stopId = feature.properties.stop_id,
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

        this.nearestStopsLayer.eachLayer(function(_marker) {
          //console.log(_marker._leaflet_id, marker._leaflet_id);
          if(_marker._leaflet_id !== marker._leaflet_id)
            _marker.setIcon(L.mapbox.marker.icon(standardIcon));
        });

        marker.setIcon(L.mapbox.marker.icon(highLightedStopIcon));
        marker.bindPopup(feature.properties.title, {minWidth: 220, maxWidth: 280, closeButton: true});
        marker.openPopup();

        var featureMarker = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [this.positionMarker.getLatLng().lng, this.positionMarker.getLatLng().lat]
          }
        };

        PubSub.publish('map.stop-selected', {
          stopId: stopId,
          selectedStop: feature.properties.stop_name,
          distanceFromUserPosition: turf.distance(featureMarker, marker.feature, 'kilometers')
        });
      };

      this.nearestStopsLayer.eachLayer(function(marker) {
        marker.on('click', markerClickHandler);
      });

      this.nearestStopsLayer.addTo(this.map);
    }
  }

  showStopsWithinRadius(searchRadius) {
    var WALKING_DISTANCE = 0.25;
    var radius = searchRadius || WALKING_DISTANCE,
        stopsWithinRadius = turf.featurecollection(window.stopsGeoJson.features.filter((stop) => {
          if( turf.distance(stop, this.userCurrentPosition, 'kilometers') <= radius ) return true;
        }));

    this.addNearestStopsLayer(stopsWithinRadius);
    return stopsWithinRadius.features.length;
  }

  addShapeLayer(shapeData, stopsData) {
    var nextColor = this.lastColor++ > (this.coloursArray.length - 1) ? 0 : this.lastColor,
        shapeColor = this.coloursArray[nextColor];

    this.lastColor = nextColor;

    var classCtx = this; // need this for nested event handlers
    var shapeId = shapeData.properties.shape_id.shape_id,
        routeLength = (turf.lineDistance(shapeData, 'kilometers')).toFixed(2),
        shapeStyle = {
          "color": shapeColor,
          "weight": 3,
          "opacity": 1
        },
        routeId = shapeData.properties.shape_id.route_id.split('_')[1],
        tripHeadSign = shapeData.properties.shape_id.trip_headsign,
        shapeLayerPopup = '<div>' + routeId + ' ' + tripHeadSign + '</div>' +
                          '<div>' + stopsData.length + ' stops in ' + routeLength + 'km</div>';

    if( ! shapeLayerCache[shapeId] ) {
      this.shapeLayer = L.geoJson(shapeData, {
        onEachFeature: function(feature, layer) {
          layer.setStyle(shapeStyle);
          layer.on({
            add: () => {
              classCtx.map.fitBounds(classCtx.shapeLayer.getBounds());
              layer.bindPopup(shapeLayerPopup);

              var circles = [],
                  circleOptions = {
                    color: shapeColor,        // Stroke color
                    opacity: 1,               // Stroke opacity
                    weight: 2,                // Stroke weight
                    fillColor: '#fff',        // Fill color
                    fillOpacity: 1,           // Fill opacity
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
                    if( stopsData[idx].stop_id == window.APP.selectedStop.stopId )
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
              this.stopsOnRouteLayer = L.geoJson(circlesGeoJson, {
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
              });

              classCtx.shapeLayerGroup.addLayer(classCtx.stopsOnRouteLayer);
            },
            click: function(evt) { console.log('Clicked on shape'); },
            mouseover: function() { layer.openPopup(); },
            mouseout: function() { layer.closePopup(); }
          });
        },

      });

      this.shapeLayerGroup.addLayer(this.shapeLayer);
      shapeLayerCache[shapeId] = this.shapeLayerGroup;
    }
    else {
      console.log('Found shape layer ' + shapeId + ' in cache');
      this.shapeLayerGroup = shapeLayerCache[shapeId];
    }

    this.map.removeLayer(this.nearestStopsLayer);
    this.shapeLayerGroup.addTo(this.map);

    console.log(this.shapeLayerGroup);

    // messy
    var layer = {
      id: shapeId,
      color: shapeColor,
      name: tripHeadSign,
      route: routeId,
      layers: [this.shapeLayer, this.stopsOnRouteLayer],
      visibleOnMap: true
    };

    PubSub.publish('map.shape.added', layer);
    return shapeId;
  }
}

export default new MyMap({mapDiv: 'map', proj: 'thomjoy1984.ldheb5dh'});