/* */ 
(function(process) {
  require("http").createServer(function(req, res) {
    var status = +req.url.substring(1);
    res.writeHead(status);
    res.end(status.toString());
  }).listen(+process.env.PORT);
})(require("process"));
