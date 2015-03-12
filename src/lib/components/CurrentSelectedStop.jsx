import React from 'react';

// Stop Display
export default React.createClass({
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