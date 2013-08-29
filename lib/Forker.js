var
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    fork = require('child_process').fork;

util.inherits(Forker, EventEmitter);
function Forker(path) {
    this._path = path;
    this._workers = [];
    this._taskCallbacks = {};
    this._lastTaskId = 0;
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

Forker.prototype.addTask = function(taskParams, callback) {
    if (this._workers.length === 0) {
        throw new Error("No workers spawned");
    }
    this._lastTaskId++;
    this._workers[this._lastTaskId % this._workers.length].send({type: 'task', id: this._lastTaskId, params: taskParams});
    if (callback) {
        this._taskCallbacks[this._lastTaskId] = callback;
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
        if (message.type == 'results' ) {
            self._onTaskResults(message.taskId, message.results);
        }
    });
    worker.on('error', function(err) {
        self.emit('error', err);
    });
};

Forker.prototype._onTaskResults = function(taskId, results) {
    if (results[0]) {
        results[0] = new Error(results[0]);
    }
    if (this._taskCallbacks[taskId]) {
        this._taskCallbacks[taskId].apply(this._taskCallbacks[taskId], results);
        delete this._taskCallbacks[taskId];
    } else {
        if (results[0]) {
            this.emit('error', results[0]);
        }
    }
}

module.exports = Forker
