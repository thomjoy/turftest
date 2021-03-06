/* */ 
(function(global) {
  "use strict";
  var PubSub = global.PubSub || require("../src/pubsub"),
      assert = buster.assert;
  buster.testCase("Bug 9, publish method", {
    "should notify all subscribers in a hierarchy": function(done) {
      var subscriber1 = this.spy(),
          subscriber2 = this.spy(),
          subscriber3 = this.spy(),
          clock = this.useFakeTimers();
      PubSub.subscribe('a.b.c', subscriber1);
      PubSub.subscribe('a.b', subscriber2);
      PubSub.subscribe('a', subscriber3);
      PubSub.publish('a.b.c.d');
      clock.tick(1);
      assert(subscriber1.calledOnce);
      assert(subscriber2.calledOnce);
      assert(subscriber3.calledOnce);
      done();
      clock.restore();
    },
    "should notify individual subscribers, even when there are no subscribers further up": function(done) {
      var rootTopic = 'a.b.c',
          subscriber = this.spy(),
          clock = this.useFakeTimers();
      PubSub.subscribe(rootTopic, subscriber);
      PubSub.publish(rootTopic + '.d');
      clock.tick(1);
      assert(subscriber.calledOnce);
      done();
      clock.restore();
    }
  });
}(this));
