/**
 * Created by Peter Rietveld (p.rietveld@live.com) on 17-3-2016.
 *
 * Any use of the code written here-in belongs to the developer and is
 * hereby the owner. If used, one must have strict approval by the
 * developer of the code written here-in. The developer may at anytime
 * change, modify, add, or delete any content contained within.
 *
 * Copyright (c) 2016 Strictly Internet
 */
/*var io = require('socket.io');

var SocketIO = function(server) {
	var _instance;

	function SocketIO(server) {
		if(!(this instanceof SocketIO)) return new SocketIO(server);

		this._instance = io(server);
		console.log(this._instance);
		console.log('constructor');
	}

	var someMethod = function() {
		//var me = this;
		console.log('someMethod called');
	}

	return {
		SocketIO: SocketIO,
		someMethod: someMethod
	};
};

module.exports = SocketIO;*/

/**
 * Module dependencies
 */
var io = require('socket.io');

/**
 * Module exports
 */

exports = module.exports = SocketIO;

var _instance;

/**
 * Constructor
 */
function SocketIO(opts) {
	if (!(this instanceof SocketIO)) {
		return new SocketIO(opts);
	}

	opts = opts || {};
	this.server = opts.server;
	this.nameSpace = opts.nameSpace || '';
	this.room = opts.room || '';

	this._instance = io(this.server);

	if(this.nameSpace && this.nameSpace.length > 0) {
		/**
		 * Initialize SocketIO and create namespace
		 */
		this.nameSpace = this.createNameSpace(this.nameSpace);
		//nameSpace.on('connection', onSocketIOConnection);
		console.log('namespace created');
	}
}

SocketIO.prototype.createNameSpace = function(nameSpace) {
	return this._instance.of(nameSpace);
};

SocketIO.prototype.someMethod = function() {
	//var me = this;
	console.log('someMethod called');
};