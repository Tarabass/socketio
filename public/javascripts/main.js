/**
 * Created by Peter Rietveld (p.rietveld@live.com) on 3-3-2016.
 *
 * Any use of the code written here-in belongs to the developer and is
 * hereby the owner. If used, one must have strict approval by the
 * developer of the code written here-in. The developer may at anytime
 * change, modify, add, or delete any content contained within.
 *
 * Copyright (c) 2016 Strictly Internet
 */
var socket = io.connect('http://127.0.0.1:1234/chat');

var TYPING_TIMER_LENGTH = 400; // ms
var typing = false;
var lastTypingTime;

$(document).ready(function() {
	var $inputMessage = $('#m');

	$('form').submit(function(){
		var message = $inputMessage.val();

		socket.emit('chat message', {
			message: message,
			username: 'Tarabass',
			socket: this.id
		});

		$inputMessage.val('');

		return false;
	});

	$inputMessage.on('input', function() {
		updateTyping();
	});

	// Updates the typing event
	function updateTyping () {
		//if (connected) {
		if (!typing) {
			typing = true;
			socket.emit('typing');
		}

		lastTypingTime = (new Date()).getTime();

		setTimeout(function () {
			var typingTimer = (new Date()).getTime();
			var timeDiff = typingTimer - lastTypingTime;

			if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
				socket.emit('stop typing');
				typing = false;
			}
		}, TYPING_TIMER_LENGTH);
		//}
	}

	function scrollToBottom() {
		//$(".messages").prop({ scrollTop: $(".messages").prop("scrollHeight") });
		$('.messages').scrollTop($('.messages').prop("scrollHeight"));
	}

	// Whenever the server emits 'typing', show the typing message
	socket.on('typing', function (data) {
		$('#typingmessage').fadeIn(function() {
			$(this).text(data.username + ' is typing...');
		});
	});

	// Whenever the server emits 'stop typing', kill the typing message
	socket.on('stop typing', function (data) {
		$('#typingmessage').fadeOut();
	});

	socket.on('chat message', function(data) {
		var $message = $('<li/>'),
			$bubble = $('<div class="bubble"/>'),
			$bubbleContent = $('<div class="bubbleContent"/>');

		$bubbleContent.html(data.username + '<hr>' + data.message);
		$bubble.append($bubbleContent);
		$message.append($bubble);

		$message.addClass(data.senderId === this.id ? 'right' : 'left');

		$('#messages').append($message);

		scrollToBottom();
	});

	socket.on('user joined', function(data) {
		var $message = $('<li class="user-joined"/>');

		$message.text(data.userName + ' ' + data.message);

		$('#messages').append($message);

		scrollToBottom();

		for (var i = 0; i < data.connected.length; i++) {
			//console.log('client: %s', clientId); //Seeing is believing
			//var client_socket =  nameSpace.in(room).connected[clientId];//Do whatever you want with this
			//console.log(client_socket);
			var client = data.connected[i];
			$('#users').append($('<li/>').prop({ id: client.id }).text(client.userName));
		}
	});

	socket.on('connect', function () {
		socket.emit('user joined', {
			username: 'Tarabass'
		});
	});
});