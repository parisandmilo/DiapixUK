// var WebSocketServer = require('ws').Server;
var express = require('express');
var app = express();
var http = require('http');
var pg = require('pg');
var port = process.env.PORT || 5000
var conString = "process.env.DATABASE_URL";
var pg_client = new pg.Client(conString);
pg_client.connect();
var query = pg_client.query('LISTEN addedrecord');
var io = require('socket.io').listen(port);

app.use(express.static('www'));

// views is directory for all template files
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    next()
});

var server = http.createServer(app)
server.listen(port)

console.log("http server listening on %d", port)

io.sockets.on('connection', function (socket) {
    socket.emit('connected', { connected: true });

    socket.on('ready for data', function (data) {
        pg_client.on('notification', function(title) {
            socket.emit('update', { message: title });
        });
    });
});

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
})

//
// var wss = new WebSocketServer({server: server})
// console.log("websocket server created")
//
// wss.on("connection", function(ws) {
//   var id = setInterval(function() {
//     ws.send(JSON.stringify(new Date()), function() {  })
// }, 1000)
//
//   console.log("websocket connection open")
//
//   ws.on("close", function() {
//     console.log("websocket connection close")
//     clearInterval(id)
//   })
// })

// app.get('/', function(request, response) {
//   response.render('pages/index')
// });
// app.get('/', function(request, response) {
//   var result = ''
//   var times = process.env.TIMES || 5
//   for (i=0; i < times; i++)
//     result += cool();
//   response.send(result);
// });

// app.get('/cool', function(request, response) {
//   response.send(cool());
// });

// app.get('/db', function (request, response) {
//   pg.connect(process.env.DATABASE_URL, function(err, client, done) {
//     client.query('SELECT * FROM test_table', function(err, result) {
//       done();
//       if (err)
//        { console.error(err); response.send("Error " + err); }
//       else
//        { response.render('pages/db', {results: result.rows} ); }
//     });
//   });
// })

// app.listen(app.get('port'), function() {
//   console.log('Express server listening on port ', app.get('port'));
// });
