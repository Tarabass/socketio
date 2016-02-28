var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	var rooms = [{
		Link: 'chat/room1',
		Text: 'Room 1'
	}, {
		Link: 'chat/room2',
		Text: 'Room 2'
	}];

	res.render('index', {
		title: 'Socket.IO chat',
		rooms: rooms
	});
});

module.exports = router;