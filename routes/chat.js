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

var nameSpace;
var currentRoom;

// parameter middleware that will run before the next routes
router.param('room', function(req, res, next, room) {
	console.log('Time: %d', Date.now());

	// add -private to the room
	// TODO: add guid (instead of private)to the room to make it unique
	currentRoom = room + '-private';

	var nameSpaceName = req.baseUrl;
	var server = req.client.server;

	if(!nameSpace) {
		/**
		 * Initialize SocketIO and create namespace
		 */
		nameSpace = io(server).of(nameSpaceName);
		nameSpace.on('connection', onSocketIOConnection);
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
 *
 * http://stackoverflow.com/a/10099325/408487
 */
function onSocketIOConnection(socket) {
	var nameSpace = this,
		room = currentRoom;

	// Join current room
	socket.join(room);

	socket.userName = 'My Username';

	console.log(nameSpace.server.engine.clientsCount);

	socket.on('chat message', function(data) {
		nameSpace.to(room).emit('chat message', {
			message: data.message,
			username: data.username,
			senderId: this.client.id
		});
	});

	socket.on('user joined', function(data) {
		var sockets = [];

		nameSpace.in(room).clients(function(error, clients){
			if (error) throw error;

			for (var i = 0, y = clients.lenght; i < y; i++) {
				var client =  nameSpace.in(room).connected[clients[i]];

				sockets.push({
					id: client.id,
					userName: client.userName
				});
			}

			socket.to(room).emit('user joined', {
				userName: socket.userName,
				message: 'joined',
				senderId: socket.client.id,
				connected: sockets
			});
		});

		/*var clients_in_the_room = nameSpace.in(room).connected;
		var sockets = [];

		console.log(clients_in_the_room);

		for (var clientId in clients_in_the_room ) {
			console.log('client: %s', clientId); //Seeing is believing
			var client_socket =  nameSpace.in(room).connected[clientId];

			sockets.push({
				id: client_socket.id,
				userName: client_socket.userName
			});
		}

		socket.to(room).emit('user joined', {
			userName: socket.userName,
			message: 'joined',
			senderId: this.client.id,
			connected: sockets
		});*/
	});

	// when the client emits 'typing', we broadcast it to others
	socket.on('typing', function () {
		// We emit to the room using the socket to emit only to 'other sockets'
		socket.to(room).emit('typing', {
			username: 'Tarabass'//socket.username
		});
	});

	// when the client emits 'stop typing', we broadcast it to others
	socket.on('stop typing', function () {
		// We emit to the room using the namespace to emit to 'all sockets'
		nameSpace.to(room).emit('stop typing', {
			username: 'Tarabass'//socket.username
		});
	});

	socket.on('disconnect', function() {
		console.log('user disconnected');
	});

	socket.on('error', function(error) {
		console.log(error);
	});
}

module.exports = router;