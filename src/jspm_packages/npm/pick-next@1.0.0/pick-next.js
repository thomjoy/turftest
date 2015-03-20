/* */ 
var PickNext = function(opts) {

  if (opts.list.length < 2)
    throw new Error('opts.list should be at least two elements in length');
  if (opts.increment > opts.list.length)
    throw new Error('list cannot be smaller than the increment');

  // the list of things
  var list = opts.list,
      numberOfChoicesInList = list.length,

      // by defualt we want to just get the next thing
      incrementBy = opts.increment || 1,

      // keep track of where we are
      lastSelectedIndex = 0,

      // flag to simplify the api
      firstRun = true;

      increment = function(currentIndex) {
        var offset = (currentIndex + incrementBy) >= numberOfChoicesInList
                        ? Math.abs(numberOfChoicesInList - (currentIndex + incrementBy)) : (currentIndex + incrementBy);
        return offset;
      },

      getNext = function() {
        var nextIndex = increment(lastSelectedIndex);
        lastSelectedIndex = nextIndex;
        return list[nextIndex];
      };

  return {
    next: function() {
      if (firstRun) {
        firstRun = false;
        nextIndex = incrementBy;
        return list[0];
      }

      return getNext();
    }
  }
};

module.exports = PickNext;
