import React from 'react';
import $ from 'jquery';
import PubSub from 'pubsub-js';

var FilterServicesButton = React.createClass({
  render: function() {
    return (
      <div id="filter-services" onClick={this.props.onClick.bind(null, this)} className="ui button mini blue">{this.props.text}</div>
    );
  }
});

var FilterServicesCheckbox = React.createClass({
  render: function() {
    return (
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
    return (
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
    return (
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
export default React.createClass({
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
    this.updateArrivalTime();
    this.updateDirectionFilter();
  },

  updateDistanceFilter: function(component, event) {
    var distanceFilter = parseFloat($('#distance-filter option:selected').val(), 10);
    this.setState({distanceFilter: distanceFilter});
    //debugger;

    PubSub.publish('filters.radius-changed', {radius: distanceFilter})
    PubSub.subscribe('services.update-num-stops-in-radius', (msg, data) => {
      this.setProps({numStops: data.numStops});
    });
  },

  updateArrivalTime: function(component, event) {
    var withinTimeInMinutes = $('#arrival-time-filter option:selected').val();
    this.setState({minutesFilter: withinTimeInMinutes});
  },

  updateDirectionFilter: function(component, event) {
    var directionId = $('#direction_id').is(':checked') ? 0 : 1;
    this.setState({directionIdFilter: directionId});
  },

  filterServices: function() {
    var ctx = this;

    $.ajax({
      url: 'http://localhost:3001/filter',
      data: {
        stop_lat: window.APP.currentUserPosition.lat,
        stop_lon: window.APP.currentUserPosition.lng,
        within_km: this.state.distanceFilter,
        direction_id: this.state.directionIdFilter,
        within_minutes: this.state.minutesFilter
      },
      beforeSend: function() { ctx.setState({filtering: true}); }
    }).done(function(filtered) {
      ctx.setState({filtering: false});
      PubSub.publish('services.filtered', filtered);
    });
  },

  toggleFilterPanel: function() {
    this.setState({filterPanelShowing: !this.state.filterPanelShowing});
  },

  render: function() {
    var formatFn = function(num) {
          switch (num) {
            case 0:
              return 'No stops';
            case 1:
              return '1 stop';
            default:
              return num + ' stops';
          }
        },
        numStops = formatFn(this.props.numStops);

    return (<div id="near-me" className="ui">
        <div id="stops-nearby">{numStops} within <DistanceFromCurrentPositionSelect onChange={this.updateDistanceFilter} /> of you
          <div className="toggle-filters" onClick={this.toggleFilterPanel}>{this.state.filterPanelShowing ? '- hide filters' : '+ show filters'}</div>
        </div>
        <div id="stops-filters" className={this.state.filterPanelShowing ? '' : 'hidden'}>
          <ArrivalTimeInMinutesFilter onChange={this.updateArrivalTime} />
          <FilterServicesCheckbox value={0} onClick={this.updateDirectionFilter} />
          <FilterServicesButton ref="filterButton" onClick={this.filterServices} text={this.state.filtering ? "Filtering..." : "Apply Filter"} />
        </div>
      </div>);
  }
});
