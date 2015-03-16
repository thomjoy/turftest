/* */ 
(function(process) {
  var resumer = require("../index");
  createStream().pipe(process.stdout);
  function createStream() {
    var stream = resumer();
    stream.queue('beep boop\n');
    return stream;
  }
})(require("process"));
