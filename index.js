var
	EventEmitter = require('events').EventEmitter,
	util = require('util'),
	fork = require('child_process').fork;

function Worker(workerFunction) {
	if (typeof workerFunction != 'function') {
		throw Error("Worker function should be function.");
	}
	this._workerFunction = workerFunction;
	this._taskParams = [];
	this._allParamsReceived = false;
	this._isWorking = false;
	this._started = false;

	var self = this;
	process.on('message', function(message) {
		if (message.type == 'task') {
			self._taskParams.push(message.params);
			if (self._started) {
				self._run();
			}
		} else if(message.type == 'end') {
			self._allParamsReceived = true;
			if (self._started) {
				self._run();
			}
		}
	});
}

Worker.prototype.start = function() {
	this._started = true;
	this._run();
};

Worker.prototype._run = function() {
	if (this._isWorking) {
		return;
	}
	var self = this;
	if (this._taskParams.length > 0) {
		this._isWorking = true;
		this._workerFunction(this._taskParams.shift(), function(err) {
			if (err) {
				process.send({type: 'error', 'error': err.message || (err.toString ? err.toString() : err)});
			}
			self._isWorking = false;
			process.nextTick(self._run.bind(self));
		});
	} else {
		if (this._allParamsReceived) {
			return process.exit();
		}
	}
};

util.inherits(Forker, EventEmitter);
function Forker(path) {
	this._path = path;
	this._workers = [];
	this._lastTaskedWorker = -1;
	this._finishCallback = null;

	EventEmitter.call(this);
}

Forker.prototype.spawn = function(workersCount) {
	for(var i = 0; i < workersCount; ++i) {
		var worker = fork(this._path);
		this._subscribeToWorker(worker);
		this._workers.push(worker);
	}
};

Forker.prototype.addTask = function(taskParams) {
	this.addTasks([taskParams]);
};

Forker.prototype.addTasks = function(tasksParams) {
	if (this._workers.length === 0) {
		throw new Error("No workers spawned");
	}
	for(var i = 0; i < tasksParams.length; ++i) {
		this._lastTaskedWorker++;
		if (this._lastTaskedWorker >= this._workers.length) {
			this._lastTaskedWorker = 0;
		}
		this._workers[this._lastTaskedWorker].send({type: 'task', params: tasksParams[i]});
	}
};

Forker.prototype.finish = function(callback) {
	if (this._workers.length === 0) {
		return callback();
	}
	for(var i = 0; i < this._workers.length; ++i) {
		this._workers[i].send({type: 'end'});
	}
	this._finishCallback = callback;
};

Forker.prototype._subscribeToWorker = function(worker) {
	var self = this;
	worker.on('exit', function(msg) {
		var idx = self._workers.indexOf(worker);
		if (idx != -1) {
			self._workers.splice(idx, 1);
		}
		if (self._workers.length === 0 && self._finishCallback) {
			return self._finishCallback();
		}
	});
	worker.on('message', function(message) {
		if( message.type == 'error' ) {
			self.emit('error', new Error(message.error));
		}
	});
	worker.on('error', function(err) {
		self.emit('error', err);
	});
};

module.exports.Forker = Forker;
module.exports.Worker = Worker;
