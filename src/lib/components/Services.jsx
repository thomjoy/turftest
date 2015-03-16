import React from 'react';
import $ from 'jquery';
import PubSub from 'pubsub-js';

function getStopsForShape(opts, cb) {
  var endpoint = 'http://127.0.0.1:3001/trip?idType=';
  if(opts.shape_id)
    endpoint += 'shape_id&id=' + opts.shape_id;
  if(opts.trip_id)
    endpoint += 'trip_id&id=' + opts.trip_id;

  return Promise.resolve($.ajax({url: endpoint}));
}

function getShapeData(opts, stopsData) {
  var endpoint = 'http://127.0.0.1:3001/shapes?idType=';
  if(opts.shape_id)
    endpoint += 'shape_id&id=' + opts.shape_id;
  if(opts.trip_id)
    endpoint += 'trip_id&id=' + opts.trip_id;

  return Promise.resolve($.ajax({url: endpoint}));
  //.done(function(geojson) { addShapeLayer(geojson, stopsData); });
}

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

      // Fetch the shape from the API
        getStopsForShape({trip_id: this.props.tripId})
          .then(stopsData => {
            getShapeData({trip_id: this.props.tripId}, stopsData)
              .then(shapeData => {
                this.setState({shapeId: shapeData.properties.shape_id.shape_id});
                this.setState({routeFetched: true});
                PubSub.publish('services.shape-fetched', {shapeData: shapeData, stopsData: stopsData});
              });
          });
    }
    else {
      PubSub.publish('services.toggle-shape', {
        shapeId: this.state.shapeId,
        action: (this.state.routeShowingOnMap ? 'hide' : 'show')
      });
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

export default React.createClass({
  render: function() {
    var p = this.props.services,
        serviceGroups = (Object.keys(p)).map(function(key) {
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