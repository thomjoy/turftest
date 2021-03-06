/* */ 
(function(Buffer) {
  'use strict';
  var zlib = require("zlib");
  exports.async = true;
  exports.run = function(data, level, callback) {
    var zlibStream = zlib.createInflate({});
    var buffers = [],
        nread = 0;
    zlibStream.on('error', function(err) {
      zlibStream.removeAllListeners();
      zlibStream = null;
      callback(err);
    });
    zlibStream.on('data', function(chunk) {
      buffers.push(chunk);
      nread += chunk.length;
    });
    zlibStream.on('end', function() {
      zlibStream.removeAllListeners();
      zlibStream = null;
      var buffer = Buffer.concat(buffers);
      callback(null);
    });
    zlibStream.write(data.deflateBuffer);
    zlibStream.end();
  };
})(require("buffer").Buffer);
