var express = require('express');
var http = require('http');
var mustache = require('mustache');
var socketio = require('socket.io');
var cons = require('consolidate');

var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);

// assign the swig engine to .html files
app.engine("html", cons.mustache);

// set .html as the default extension
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname));

app.get('/', function(req, res){
    res.render('index', {
        locals: {
            title: 'Welcome'
        }
    });
});

io.sockets.on('connection', function (socket) {
    //our other events...
    socket.on('setPseudo', function (data) {
        socket.set('pseudo', data);
    });

    socket.on('message', function (message) {
        socket.get('pseudo', function (error, name) {
            var data = { 'message' : message, pseudo : name };
            socket.broadcast.emit('message', data);
            console.log("user " + name + " send this : " + message);
        })
    });
});

server.listen(3000);

