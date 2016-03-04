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
var socket = io.connect('http://localhost:1234/chat');

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
	});

	socket.on('connect', function () {
		socket.emit('chat message', {
			message: 'User joined the room!',
			username: 'Tarabass'
		});
	});
});