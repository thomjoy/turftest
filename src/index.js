var connect = require('connect'),
    serveStatic = require('serve-static'),
    cors = require('cors'),
    app = connect();

app.use(cors());

app.use(serveStatic('.', {
  'index': ['src/index.html'],
  'setHeaders': function(res, path) {
    if(path.indexOf('.json') !== -1) {
      res.setHeader('Content-Type', 'application/json');
    }
  }
}));

app.listen(3000);
console.log('Server started on port 3000');