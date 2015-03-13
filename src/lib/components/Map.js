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
  }

  setupMapHandlers() {
    let locationFoundHandler = (location) => {
      $('#app-startup').hide();

      if (this.positionMarker)
        this.map.removeLayer(this.positionMarker);

      this.positionMarker = createPosition(location.latlng);
      this.positionMarker.addTo(this.map);

      $('#map').removeClass('blur');
      $('#map').removeClass('init');
      $('.right').removeClass('init');
      $('.left').show();

      this.map.setView([location.latitude, location.longitude], 16);
      this.initMap(this.positionMarker.getLatLng());

      // render the radius / location info bar
      // React.render(<StopsWithinRadius numStops={0} />, document.getElementById('services-within-radius'));
      PubSub.publish('map::init::complete');
    };

    let locationErrorHandler = () => {
      $('#map').removeClass('blur');
      $('#geolocate').html('Position could not be found');
      $('#app-startup').hide().delay(1);

      $('#map').removeClass('blur');
      $('#map').removeClass('init');
      $('.right').removeClass('init');
      $('.left').show();

      var defaultPosition = [-33.865,151.209];
      this.positionMarker = createPosition(defaultPosition);
      this.positionMarker.addTo(this.map);
      this.map.setView(defaultPosition, 15);

      this.initMap(positionMarker.getLatLng());
    };

    this.map.on('locationfound', locationFoundHandler);
    this.map.on('locationerror', locationErrorHandler);
  }

  initMap(startingPosition) {

    let WALKING_DISTANCE = 0.25;
    this.radiusLayer = this.createRadiusLayer({lat: startingPosition.lat, lng: startingPosition.lng}, WALKING_DISTANCE);

    // event handlers
    this.positionMarker.on('drag', (evt) => {
      PubSub.publish('map::drag::start');

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

      //React.render(<CurrentSelectedStop name={"Dragging..."} distance={0} />, document.getElementById('stop-container'));
      //React.render(<StopsWithinRadius numStops={numStops} />, document.getElementById('services-within-radius'));
    });

    this.positionMarker.on('click', (evt) => {
      if (! this.map.hasLayer(this.radiusLayer))
        this.map.addLayer(this.radiusLayer);
      if (! this.map.hasLayer(this.nearestStopsLayer))
        this.map.addLayer(this.nearestStopsLayer);
    });
  }

  createRadiusLayer(aroundPoint, radiusInKm) {
    // the center of the radial, initially.
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

        this.nearestStopsLayer.eachLayer(function(_marker) {
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
            coordinates: [this.positionMarker.getLatLng().lng, this.positionMarker.getLatLng().lat]
          }
        };

        PubSub.publish('map.stop-selected', {
          selectedStop: feature.properties.stop_name,
          distanceFromUserPosition: turf.distance(featureMarker, marker.feature, 'kilometers')
        });

        //setSelectedStop(feature.properties);

        // Get routes from this stop
        //getRoutesFromStop(stopId, buildRoutesSelect);
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
}

export default new MyMap({mapDiv: 'map', proj: 'thomjoy1984.ldheb5dh'});