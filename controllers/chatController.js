/**
 * Created by Peter Rietveld (p.rietveld@live.com) on 16-3-2016.
 *
 * Any use of the code written here-in belongs to the developer and is
 * hereby the owner. If used, one must have strict approval by the
 * developer of the code written here-in. The developer may at anytime
 * change, modify, add, or delete any content contained within.
 *
 * Copyright (c) 2016 Strictly Internet
 */
var io = require('socket.io');
//var socketio = require('../util/socketio');

var controller = function() {
	var nameSpace;
	var currentRoom;

	var allWhenRoomIsSet = function(req, res, next, room) {
		console.log('Time: %d', Date.now());

		// add -private to the room
		// TODO: add guid (instead of private)to the room to make it unique
		currentRoom = room + '-private';

		var nameSpaceName = req.baseUrl;
		var server = req.client.server;

		//var s = new socketio({
		//	server: req.client.server/*,
		//	nameSpace: nameSpaceName*/
		//});
		//s.someMethod();
		//s.nameSpace = s.createNameSpace(nameSpaceName);
		//s.nameSpace.on('connection', onSocketIOConnection);

		if(!nameSpace) {
			/**
			 * Initialize SocketIO and create namespace
			 */
			nameSpace = io(server).of(nameSpaceName);
			nameSpace.on('connection', onSocketIOConnection);
		}

		/*var a = new socketio(1);
		console.log('id of first instance: %s', a.id);
		var b = new socketio(2);
		console.log('id of second instance: %s', b.id);
		a.id = 10;
		console.log('id of first instance: %s', a.id);
		b.id = 11;
		console.log('id of second instance: %s', b.id);
		console.log('First instance: ', a);
		console.log('Second instance: ', b);*/

		next();
	};

	var showChatRoom = function(req, res, next) {
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
	};

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

		//console.log(nameSpace.server.engine.clientsCount);

		socket.on('chat message', function(data) {
			nameSpace.to(room).emit('chat message', {
				message: data.message,
				username: data.username,
				senderId: this.client.id
			});
		});

		socket.on('user joined', function(data) {
			getAllClients(nameSpace, room, function(sockets) {
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

	function getAllClients(nameSpace, room, callback) {
		if(typeof callback === 'function') {
			var connectedSockets = [];

			nameSpace.in(room).clients(function(error, clients){
				if (error) throw error;

				for (var i = 0, y = clients.length; i < y; i++) {
					var connectedSocket =  nameSpace.in(room).connected[clients[i]];

					connectedSockets.push({
						id: connectedSocket.id,
						userName: connectedSocket.userName
					});
				}

				callback(connectedSockets);
			});
		}
		else {
			throw new Error('No callback function provided');
		}
	}

	return {
		allWhenRoomIsSet: allWhenRoomIsSet,
		showChatRoom: showChatRoom
	}
};

module.exports = controller;
