import React from 'react'

let LayerDisplay = React.createClass({
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

export default React.createClass({
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
    var ids = Object.keys(this.props.data),
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