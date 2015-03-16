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
}*/

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

//kickOff();