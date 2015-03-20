/* */ 
var type = require("./type");
var literals = {
  'number': Number,
  'string': String
};
module.exports = function hasProperty(name, obj) {
  var ot = type(obj);
  if (ot === 'null' || ot === 'undefined')
    return false;
  if (literals[ot] && typeof obj !== 'object')
    obj = new literals[ot](obj);
  return name in obj;
};
