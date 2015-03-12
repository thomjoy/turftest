/* */ 
(function(process) {
  var test = require("../../index");
  var path = require("path");
  test.createStream({objectMode: true}).on('data', function(row) {
    console.log(JSON.stringify(row));
  });
  process.argv.slice(2).forEach(function(file) {
    require(path.resolve(file));
  });
})(require("process"));
