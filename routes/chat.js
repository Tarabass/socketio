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

var currentNameSpace;
var currentRoom;

// parameter middleware that will run before the next routes
router.param('room', function(req, res, next, room) {
	console.log('Time: %d', Date.now());

	// add -private to the room
	// TODO: add guid (instead of private)to the room to make it unique
	currentRoom = room + '-private';

	var nameSpace = req.baseUrl;
	var server = req.client.server;

	if(!currentNameSpace) {
		/**
		 * Initialize SocketIO and create namespace
		 */
		currentNameSpace = io(server).of(nameSpace);
		currentNameSpace.on('connection', onSocketIOConnection);
	}

	next();
});

/* GET /chat */
router.get('/:room', function(req, res, next) {
	//// http://localhost:1234/chat/myroom
	//console.log('params.room', req.params.room); // 'myroom'
	//console.log('url', req.url); // '/myroom'
	//
	//console.log('originalUrl', req.originalUrl); // '/chat/myroom'
	//console.log('baseUrl', req.baseUrl); // '/chat'
	//console.log('path', req.path); // '/myroom'
	//
	//var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	//console.log(fullUrl); // 'http://localhost:1234/chat/myroom'

	res.render('chat', { title: currentRoom });
});

/**
 * Event listener for socket.io "connection" event.
 */
function onSocketIOConnection(socket) {
	// Join current room
	socket.join(currentRoom);

	socket.on('chat message', function(data) {
		currentNameSpace.to(currentRoom).emit('chat message', {
			message: data.message,
			username: data.username
		});
	});

	socket.on('disconnect', function() {
		console.log('user disconnected');
	});
}

module.exports = router;