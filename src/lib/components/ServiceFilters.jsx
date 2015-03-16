import React from 'react';
import $ from 'jquery';

/*var FilterServicesButton = React.createClass({
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

// Service
var ServiceDisplay = React.createClass({
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

    window.map.removeLayer(window.radiusLayer);
    window.createRadiusLayer({lat: pos.lat, lng: pos.lng}, distanceFilter);

    // search again with the new radius
    if (window.WALKING_DISTANCE !== distanceFilter)
      window.WALKING_DISTANCE = distanceFilter;

    var numStops = window.showStopsWithinRadius(WALKING_DISTANCE);
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
    var pos = window.positionMarker.getLatLng(),
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
      window.addNearestStopsLayer(data.layer);
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
});*/

export default React.createClass({
  render: function() {
    return(<div>Testing</div>);
  }
})