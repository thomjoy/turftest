export default (function() {
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