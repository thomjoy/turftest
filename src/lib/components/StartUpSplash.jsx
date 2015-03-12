// app-startup-splash.js
import React from 'react';
import MyMap from 'lib/components/Map';

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
      MyMap.map.locate();
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

export default React.createClass({
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

