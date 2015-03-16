/* */ 
'use strict';
var util = require("./util");
var TileLayer = L.TileLayer.extend({
  includes: [require("./load_tilejson")],
  options: {format: 'png'},
  formats: ['png', 'png32', 'png64', 'png128', 'png256', 'jpg70', 'jpg80', 'jpg90'],
  scalePrefix: '@2x.',
  initialize: function(_, options) {
    L.TileLayer.prototype.initialize.call(this, undefined, options);
    this._tilejson = {};
    if (options && options.format) {
      util.strict_oneof(options.format, this.formats);
    }
    this._loadTileJSON(_);
  },
  setFormat: function(_) {
    util.strict(_, 'string');
    this.options.format = _;
    this.redraw();
    return this;
  },
  setUrl: null,
  _setTileJSON: function(json) {
    util.strict(json, 'object');
    L.extend(this.options, {
      tiles: json.tiles,
      attribution: json.attribution,
      minZoom: json.minzoom || 0,
      maxZoom: json.maxzoom || 18,
      tms: json.scheme === 'tms',
      bounds: json.bounds && util.lbounds(json.bounds)
    });
    this._tilejson = json;
    this.redraw();
    return this;
  },
  getTileJSON: function() {
    return this._tilejson;
  },
  getTileUrl: function(tilePoint) {
    var tiles = this.options.tiles,
        index = Math.floor(Math.abs(tilePoint.x + tilePoint.y) % tiles.length),
        url = tiles[index];
    var templated = L.Util.template(url, tilePoint);
    if (!templated) {
      return templated;
    } else {
      return templated.replace('.png', (L.Browser.retina ? this.scalePrefix : '.') + this.options.format);
    }
  },
  _update: function() {
    if (this.options.tiles) {
      L.TileLayer.prototype._update.call(this);
    }
  }
});
module.exports.TileLayer = TileLayer;
module.exports.tileLayer = function(_, options) {
  return new TileLayer(_, options);
};
