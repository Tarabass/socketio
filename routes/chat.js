//module.exports = function(server) {
//	var express = require('express'),
//		router = express.Router(),
//		io = require('socket.io');
//
//	// parameter middleware that will run before the next routes
//	router.param('room', function(req, res, next, room) {
//		console.log('Time: %d', Date.now());
//
//		// add -private to the room
//		// TODO: add guid (instead of private)to the room to make it unique
//		var modified = room + '-private';
//
//		// save name to the request
//		req.room = modified;
//
//		var nameSpace = req.baseUrl;
//		//console.log(req.app);
//		/*var chat = io(server).of(nameSpace); // TODO: server is undefined, we have to pass it through from www
//		 chat.on('connection', onSocketIOConnection);*/
//
//		//console.log(req.app);
//
//		next();
//	});
//
//	/* GET /chat */
//	router.get('/:room', function(req, res, next) {
//		// http://localhost:1234/chat/myroom
//		console.log('params.room', req.params.room); // 'myroom'
//		console.log('room', req.room); // 'myroom-private'
//		console.log('url', req.url); // '/myroom'
//
//		console.log('originalUrl', req.originalUrl); // '/chat/myroom'
//		console.log('baseUrl', req.baseUrl); // '/chat'
//		console.log('path', req.path); // '/myroom'
//
//		var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
//		console.log(fullUrl); // 'http://localhost:1234/chat/myroom'
//
//		res.send('respond with a resource');
//	});
//
//	/**
//	 * Event listener for socket.io "connection" event.
//	 */
//	function onSocketIOConnection(socket) {
//		var room = 'chatroom 1';
//
//		socket.join(room);
//
//		socket.on('chat message', function(message) {
//			console.log('message: ' + message);
//			console.log('room: ' + room);
//			chat.to(room).emit('chat message', room + ': ' + message);
//		});
//		socket.on('disconnect', function() {
//			console.log('user disconnected');
//		});
//	}
//
//	return router;
//};

var express = require('express');
var router = express.Router();
var io = require('socket.io');

var chat123;
var room123;

// parameter middleware that will run before the next routes
router.param('room', function(req, res, next, room) {
	console.log('Time: %d', Date.now());

	// add -private to the room
	// TODO: add guid (instead of private)to the room to make it unique
	var modified = room + '-private';

	// save name to the request
	req.room = modified;

	var nameSpace = req.baseUrl;
	var server = req.client.server;

	if(!chat123) {
		/**
		 * Initialize SocketIO and create namespace
		 */
		chat123 = io(server).of(nameSpace); // TODO: server is undefined, we have to pass it through from www
		chat123.on('connection', onSocketIOConnection);
	}
	room123 = modified;

	next();
});

/* GET /chat */
router.get('/:room', function(req, res, next) {
	// http://localhost:1234/chat/myroom
	console.log('params.room', req.params.room); // 'myroom'
	console.log('room', req.room); // 'myroom-private'
	console.log('url', req.url); // '/myroom'

	console.log('originalUrl', req.originalUrl); // '/chat/myroom'
	console.log('baseUrl', req.baseUrl); // '/chat'
	console.log('path', req.path); // '/myroom'

	var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	console.log(fullUrl); // 'http://localhost:1234/chat/myroom'

	res.render('chat', { title: 'Chat' });
});

/**
 * Event listener for socket.io "connection" event.
 */
function onSocketIOConnection(socket) {
	var room = room123;//'chatroom 1';

	socket.join(room);

	socket.on('chat message', function(message) {
		console.log('message: ' + message);
		console.log('room: ' + room);
		chat123.to(room).emit('chat message', room + ': ' + message);
	});
	socket.on('disconnect', function() {
		console.log('user disconnected');
	});
}

module.exports = router;