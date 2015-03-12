/* */ 
(function(process) {
  (function() {
    var GraphComponent = function() {};
    GraphComponent.setVisited = function(i, visited) {
      while (i.hasNext()) {
        var comp = i.next();
        comp.setVisited(visited);
      }
    };
    GraphComponent.setMarked = function(i, marked) {
      while (i.hasNext()) {
        var comp = i.next();
        comp.setMarked(marked);
      }
    };
    GraphComponent.getComponentWithVisitedState = function(i, visitedState) {
      while (i.hasNext()) {
        var comp = i.next();
        if (comp.isVisited() == visitedState)
          return comp;
      }
      return null;
    };
    GraphComponent.prototype._isMarked = false;
    GraphComponent.prototype._isVisited = false;
    GraphComponent.prototype.data;
    GraphComponent.prototype.isVisited = function() {
      return this._isVisited;
    };
    GraphComponent.prototype.setVisited = function(isVisited) {
      this._isVisited = isVisited;
    };
    GraphComponent.prototype.isMarked = function() {
      return this._isMarked;
    };
    GraphComponent.prototype.setMarked = function(isMarked) {
      this._isMarked = isMarked;
    };
    GraphComponent.prototype.setContext = function(data) {
      this.data = data;
    };
    GraphComponent.prototype.getContext = function() {
      return data;
    };
    GraphComponent.prototype.setData = function(data) {
      this.data = data;
    };
    GraphComponent.prototype.getData = function() {
      return data;
    };
    GraphComponent.prototype.isRemoved = function() {
      throw new jsts.error.AbstractMethodInvocationError();
    };
    jsts.planargraph.GraphComponent = GraphComponent;
  })();
})(require("process"));
