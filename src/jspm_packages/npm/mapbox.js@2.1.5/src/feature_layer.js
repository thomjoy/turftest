/* */ 
'use strict';
var util = require("./util"),
    urlhelper = require("./url"),
    request = require("./request"),
    marker = require("./marker"),
    simplestyle = require("./simplestyle");
var FeatureLayer = L.FeatureGroup.extend({
  options: {
    filter: function() {
      return true;
    },
    sanitizer: require("sanitize-caja"),
    style: simplestyle.style,
    popupOptions: {closeButton: false}
  },
  initialize: function(_, options) {
    L.setOptions(this, options);
    this._layers = {};
    if (typeof _ === 'string') {
      util.idUrl(_, this);
    } else if (_ && typeof _ === 'object') {
      this.setGeoJSON(_);
    }
  },
  setGeoJSON: function(_) {
    this._geojson = _;
    this.clearLayers();
    this._initialize(_);
    return this;
  },
  getGeoJSON: function() {
    return this._geojson;
  },
  loadURL: function(url) {
    if (this._request && 'abort' in this._request)
      this._request.abort();
    this._request = request(url, L.bind(function(err, json) {
      this._request = null;
      if (err && err.type !== 'abort') {
        util.log('could not load features at ' + url);
        this.fire('error', {error: err});
      } else if (json) {
        this.setGeoJSON(json);
        this.fire('ready');
      }
    }, this));
    return this;
  },
  loadID: function(id) {
    return this.loadURL(urlhelper('/' + id + '/features.json', this.options.accessToken));
  },
  setFilter: function(_) {
    this.options.filter = _;
    if (this._geojson) {
      this.clearLayers();
      this._initialize(this._geojson);
    }
    return this;
  },
  getFilter: function() {
    return this.options.filter;
  },
  _initialize: function(json) {
    var features = L.Util.isArray(json) ? json : json.features,
        i,
        len;
    if (features) {
      for (i = 0, len = features.length; i < len; i++) {
        if (features[i].geometries || features[i].geometry || features[i].features) {
          this._initialize(features[i]);
        }
      }
    } else if (this.options.filter(json)) {
      var opts = {accessToken: this.options.accessToken},
          layer = L.GeoJSON.geometryToLayer(json, function(feature, latlon) {
            return marker.style(feature, latlon, opts);
          }),
          popupHtml = marker.createPopup(json, this.options.sanitizer);
      if ('setStyle' in layer) {
        layer.setStyle(simplestyle.style(json));
      }
      layer.feature = json;
      if (popupHtml) {
        layer.bindPopup(popupHtml, this.options.popupOptions);
      }
      this.addLayer(layer);
    }
  }
});
module.exports.FeatureLayer = FeatureLayer;
module.exports.featureLayer = function(_, options) {
  return new FeatureLayer(_, options);
};
