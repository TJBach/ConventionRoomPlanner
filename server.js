var express = require('express.io');
var http = require('http');
var mustache = require('mustache');
var socketio = require('socket.io');
var cons = require('consolidate');
var routes = require('./routes/index.js');

var app = express();
app.http().io()

var socketRoutes = require('./routes/socket.js')(app);

// assign the swig engine to .html files
app.engine("html", cons.mustache);

// set .html as the default extension
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname));
app.use(express.bodyParser());

// Setup your sessions.
app.use(express.cookieParser());
app.use(express.session({secret: '138a4226920b4b9dad0176f927675cb9'}));

//set socket io routes
app.io.route('chat', socketRoutes.chatRoutes);
app.io.route('convention', socketRoutes.conventionRoutes);

//set normal routes
app.post('/convention/create', routes.createConvetion);
app.post('/convention/delete', routes.deleteConvention);

app.get('/convention/:id', routes.findConvention);

app.get('/', routes.index);

//start
app.listen(3000);

