/* */ 
'use strict';
var fs = require("fs");
var pako = require("../index");
var data = new Uint8Array(fs.readFileSync(__dirname + '/samples/lorem_1mb.txt'));
var deflated = pako.deflate(data, {level: 6});
for (var i = 0; i < 200; i++) {
  pako.inflate(deflated, {to: 'string'});
}
