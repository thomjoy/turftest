var connect = require('connect');
var serveStatic = require('serve-static');
var cors = require('cors');
var app = connect();

app.use(cors());

app.use(serveStatic('.', {
  'index': ['index.html'],
  'setHeaders': function(res, path) {
    if(path.indexOf('.json') !== -1) {
      res.setHeader('Content-Type', 'application/json');
    }
  }
}));

app.listen(3000);
console.log('Server started on port 3000');