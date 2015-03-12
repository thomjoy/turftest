// app.js
var WALKING_DISTANCE = 0.25;

L.mapbox.accessToken = 'pk.eyJ1IjoidGhvbWpveTE5ODQiLCJhIjoiTGx2V3ZUVSJ9.pZlOrVUXu_aC1i0nTvpIpA';

var map = L.mapbox.map('map', 'thomjoy1984.ldheb5dh'),
    icon = L.mapbox.marker.icon({
      "marker-color": "#8E8E8E",
      "title": "where are the stations?",
      "marker-symbol": "pitch",
      "marker-size": "small"
    });

var geoCoder = L.mapbox.geocoder('mapbox.places');
map.addControl(
  L.mapbox.geocoderControl('mapbox.places', {})
    .on('found',function(e) { console.group('Found'); console.log(e); })
    .on('select',function(e) { console.group('Select'); console.log(e); })
);

var AppStartUpSplash = React.createClass({
  render: function() {
    return(
      <div className="ui">
        <h4 className="ui header">NSW Transport Explorer</h4>
        <div className="ui segment">
          <p>An exploration of the TDX Data provided by the NSW Transit authority</p>
          <p>Hit the location button to begin</p>
        </div>
       <GeoLocateButton />
      </div>
    );
  }
});

//var coloursArray = ['#2e9df7', '#4facf8', '#0d8ef6', '#6fbcfa', '#087bd9', '#0769b8'];
var coloursArray = [
'#d53e4f',
'#fc8d59',
'#fee08b',
'#ffffbf',
'#e6f598',
'#99d594',
'#3288bd']

var Layers = (function() {
  var _layers = {};

  return {
    all: function() {
      return _layers;
    },
    add: function(layer) {
      _layers[layer.id] = layer;
    },
    remove: function() {
      _layers[layer.id] = null;
    }
  }
})();

var LayerDisplay = React.createClass({
  getInitialState: function() {
    return { visibleOnMap: this.props.layerData.visibleOnMap }
  },

  render: function() {
    var liClassName = this.state.visibleOnMap ? '' : 'noshow',
        liString = this.props.layerData.route + " - " + this.props.layerData.name;

    return (
      <li className={liClassName} onClick={this.props.onClick.bind(null,this)}>
        <span className="shapeColor" style={style}></span>
        {liString}
      </li>
    );
  }
});

var LayersList = React.createClass({
  toggleLayerOnMap: function(component, event) {
    var layers = component.props.layerData.layers,
        layerShouldBeVisible = !component.state.visibleOnMap;

    component.setState({visibleOnMap: layerShouldBeVisible}, function() {
      layers.forEach(function(layer) {
        layerShouldBeVisible ? map.addLayer(layer) : map.removeLayer(layer);
      });
    }.bind(this));
  },
  render: function() {
    var ids = Object.keys(this.props.data);
        layers = ids.map(function(id) {
          return <LayerDisplay onClick={this.toggleLayerOnMap} key={id} layerData={this.props.data[id]} />;
        }.bind(this));

    return(
      <ul>
        {layers}
      </ul>
    );
  }
});

React.render(<LayersList data={Layers.all()} />, document.getElementById('layers-list'));

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

React.render(<AppStartUpSplash />, document.getElementById('app-startup'));

var FilterServicesButton = React.createClass({
  render: function() {
    return (
      <div id="filter-services" onClick={this.props.onClick.bind(null, this)} className="ui button mini blue">{this.props.text}</div>
    );
  }
});

var FilterServicesCheckbox = React.createClass({
  render: function() {
    return(
      <div className="filter filter-direction">
        <input id="direction_id" name="direction_id" type="checkbox" value={this.props.value} onClick={this.props.onClick.bind(null, this)} />
        <label>Towards CBD</label>
      </div>
    );
  }
});

// Select
var DistanceFromCurrentPositionSelect = React.createClass({
  render: function() {
    return(
      <select id="distance-filter" onChange={this.props.onChange.bind(null, this)}>
        <option value="0.25">250m</option>
        <option value="0.5">500m</option>
        <option value="1">1km</option>
      </select>
    );
  }
});

// Select
var ArrivalTimeInMinutesFilter = React.createClass({
  render: function() {
    return(
      <div className="filter filter-time">
        <label>Only show stops with buses arriving in:</label>
        <select id="arrival-time-filter" onChange={this.props.onChange.bind(null, this)}>
          <option value="5">5 mins</option>
          <option value="10">10 mins</option>
          <option value="15">15 mins</option>
        </select>
      </div>
    );
  }
});

var StopsWithinRadius = React.createClass({
  getInitialState: function() {
    return {
      numStops: 0,
      distanceFilter: 0.25,
      minutesFilter: 5,
      directionIdFilter: 1,
      filterPanelShowing: false,
      filtering: false
    }
  },

  componentDidMount: function() {
    this.updateDistanceFilter();
    this.updateArrivalTime();
    this.updateDirectionFilter();
  },

  updateDistanceFilter: function(component, event) {
    var pos = positionMarker.getLatLng(),
        distanceFilter = parseFloat($('#distance-filter option:selected').val(), 10);

    this.setState({distanceFilter: distanceFilter});

    map.removeLayer(radiusLayer);
    createRadiusLayer({lat: pos.lat, lng: pos.lng}, distanceFilter);

    // search again with the new radius
    if (WALKING_DISTANCE !== distanceFilter)
      WALKING_DISTANCE = distanceFilter;

    var numStops = showStopsWithinRadius(WALKING_DISTANCE);
    this.setProps({numStops: numStops});
  },

  updateArrivalTime: function(component, event) {
    var withinTimeInMinutes = $('#arrival-time-filter option:selected').val();
    this.setState({minutesFilter: withinTimeInMinutes});
  },

  updateDirectionFilter: function(component, event) {
    var directionId = $('#direction_id').is(':checked') ? 0 : 1;
    this.setState({directionFilter: directionId});
  },

  filterServices: function() {
    var pos = positionMarker.getLatLng(),
        ctx = this;

    $.ajax({
      url: 'http://localhost:3001/filter',
      data: {
        stop_lat: pos.lat,
        stop_lon: pos.lng,
        within_km: this.state.distanceFilter,
        direction_id: this.state.directionFilter,
        within_minutes: this.state.minutesFilter
      },
      beforeSend: function() {
        this.setState({filtering: true});
      }.bind(ctx)
    })
    .done(function(data) {
      this.setState({filtering: false});
      addNearestStopsLayer(data.layer);
    }.bind(ctx));
  },

  toggleFilterPanel: function() {
    this.setState({filterPanelShowing: !this.state.filterPanelShowing});
  },

  render: function() {
    var format = function(num) {
          switch (num) {
            case 0:
              return 'No stops';
            case 1:
              return '1 stop';
            default:
              return num + ' stops';
          }
        },
        numStops = format(this.props.numStops);

    return(
      <div id="near-me" className="ui">
        <div id="stops-nearby">{numStops} within <DistanceFromCurrentPositionSelect onChange={this.updateDistanceFilter} /> of you
          <div className="toggle-filters" onClick={this.toggleFilterPanel} className="">{this.state.filterPanelShowing ? '- hide filters' : '+ show filters'}</div>
        </div>
        <div id="stops-filters" className={this.state.filterPanelShowing ? '' : 'hidden'}>
          <ArrivalTimeInMinutesFilter onChange={this.updateArrivalTime} />
          <FilterServicesCheckbox value={0} onClick={this.updateDirectionFilter} />
          <FilterServicesButton ref="filterButton" text={this.state.filtering ? "Filtering..." : "Apply Filter"} onClick={this.filterServices} />
        </div>
      </div>
    )
  }
});


// Arriving Soon Tab
var ServicesArrivingSoonTab = React.createClass({
  render: function() {
    var p = this.props.services;

    var serviceGroups = (Object.keys(p)).map(function(key) {
      var intKey = parseInt(key, 10),
          serviceGroup = p[intKey];
      return <ServiceGroup key={intKey} minutes={intKey} services={serviceGroup} />
    });

    return (
      <div id="arriving-soon" className="ui segment basic">
        {serviceGroups}
      </div>
    );
  }
});

var ServiceGroup = React.createClass({
  render: function() {
    var arrivalTime = this.props.minutes == 1 ? this.props.minutes + " minute" : this.props.minutes + " minutes";
    var services = this.props.services.map(function(service) {
      return <Service key={service.trip_id} data={service} />
    });

    return(
      <div className="grouped-service-container">
        <h5>Arriving in {arrivalTime}</h5>
        {services}
      </div>
    );
  }
});

var Service = React.createClass({
  render: function() {
    return(
      <div className="service">
          <div className="service-desc">
            <strong className="bus-number">{this.props.data.route_id.split('_')[1]}</strong>
            <div className="bus-headsign">{this.props.data.trip_headsign}</div>
          </div>
          <ServiceActions tripId={this.props.data.trip_id} />
        </div>
    );
  }
});

var ServiceActions = React.createClass({
  render: function() {
    return (
      <div className="service-actions">
        <ToggleRouteOnMap tripId={this.props.tripId} />
      </div>
    );
  }
});

var ToggleRouteOnMap = React.createClass({
  getInitialState: function() {
    return {
      routeShowingOnMap: false,
      routeFetched: false,
      shapeId: null
    }
  },

  handleClick: function() {
    var ctx = this;
    if (! this.state.routeFetched) {
      getStopsForShape({trip_id: this.props.tripId}, function(stopsData) {
        $.when(getShapeData({trip_id: this.props.tripId}, stopsData)).done(function(shapeData) {
          this.setState({shapeId: shapeData.properties.shape_id.shape_id});
          this.setState({routeFetched: true});
        }.bind(ctx));
      }.bind(ctx));
    }
    else {
      toggleShapeLayer(this.state.shapeId, (this.state.routeShowingOnMap ? 'hide' : 'show'));
    }

    this.setState({routeShowingOnMap: !this.state.routeShowingOnMap});
  },

  render: function() {
    var label = this.state.routeShowingOnMap ? 'Hide route' : 'Show route';
    return(
      <div>
        <div className="show-route active" onClick={this.handleClick} data-trip_id={this.props.tripId}>{label}</div>
        <div className="route-length"></div>
      </div>
    );
  }
});

// Stop Display
var CurrentSelectedStopDisplay = React.createClass({
  render: function() {
    var distance = (this.props.distance * 1000).toPrecision(3);
    return(
      <div>
        <h2 id="stop-name">{this.props.name}</h2>
        <p id="stop-distance">{distance}m from your position</p>
      </div>
    );
  }
});
React.render(<CurrentSelectedStopDisplay name={"Select a Stop"} distance={0} />, document.getElementById('stop-container'));

// App starts here
var liveTrafficUrl = 'http://livetraffic.rta.nsw.gov.au/traffic/hazards/incident.json';

// Semantic U
$('.menu .item').tab();
$('.ui.dropdown').dropdown();

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

// get the stops.json file from the server
function getStopsData() {
  $.ajax({url: 'http://127.0.0.1:3000/api/data/gtfs/stops.json'})
    .done(function(geojson) { stopsGeoJson = geojson; });
}

function addSuburbToMap(geoJson) {
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

setTimeout(function() { getBondi(); getStopsData(); }, 1);

// Once we've got a position, zoom and center the map
// on it, and add a single marker.
function kickOff() {
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

  for (var i  = 0; i < resolution; i++) {
    var spoke = turf.destination(pt, radius, i*resMultiple, units);
    ring.push(spoke.geometry.coordinates);
  }

  if ((ring[0][0] !== ring[ring.length-1][0]) && (ring[0][1] != ring[ring.length-1][1])) {
    ring.push([ring[0][0], ring[0][1]]);
  }

  return turf.polygon([ring]);
}

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

kickOff();