/* */ 
var expect = require('chai').expect;
var PickNext = require(__dirname + '/../pick-next');

describe('Pick Next', function() {
  describe('#next', function() {
    it('correctly handles a simple array', function() {
      var colours = new PickNext({list: ['red', 'blue', 'green']});

      expect(colours.next()).to.equal('red');
      expect(colours.next()).to.equal('blue');
      expect(colours.next()).to.equal('green');
      expect(colours.next()).to.equal('red');
    });

    it('errors on bad lists that are too short', function() {
      expect(function() { new PickNext({list: []}) } ).to.throw('opts.list should be at least two elements in length');
      expect(function() { new PickNext({list: ['Thom']}) } ).to.throw('opts.list should be at least two elements in length');
    });

    it('correctly increments with values other than 1', function() {
      var colours = new PickNext({list: ['red', 'blue', 'green'], increment: 2});
      expect(colours.next()).to.equal('red');
      expect(colours.next()).to.equal('green');
      expect(colours.next()).to.equal('blue');
      expect(colours.next()).to.equal('red');

      var names = new PickNext({list: ['Thom', 'Matt', 'Ahmed', 'Ollie'], increment: 3});
      expect(names.next()).to.equal('Thom');
      expect(names.next()).to.equal('Ollie');
      expect(names.next()).to.equal('Ahmed');
      expect(names.next()).to.equal('Matt');
    });

    it('correctly rejects increments that are bigger than the list size', function() {
      expect(function() { colours = new PickNext({list: ['red', 'blue', 'green'], increment: 4}); })
        .to.throw('list cannot be smaller than the increment');
    });
  });
});