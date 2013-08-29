function Worker(workerFunction) {
    if (typeof workerFunction != 'function') {
        throw Error("Worker function should be function.");
    }
    this._workerFunction = workerFunction;
    this._taskParams = {};
    this._allParamsReceived = false;
    this._workingTaskId = null;
    this._started = false;

    var self = this;
    process.on('message', function(message) {
        if (message.type == 'task') {
            self._taskParams[message.id] = message.params;
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

Worker.prototype._run = function(callback) {
    if (this._workingTaskId) {
        return;
    }
    var self = this;
    if (Object.keys(this._taskParams).length > 0) {
        this._workingTaskId = Object.keys(this._taskParams)[0];
        this._workerFunction(this._taskParams[this._workingTaskId], function() {
            self._onTaskResult(self._workingTaskId, Array.prototype.slice.call(arguments, 0));
            delete self._taskParams[self._workingTaskId];
            self._workingTaskId = null;
            process.nextTick(self._run.bind(self));
        });
    } else {
        if (this._allParamsReceived) {
            return process.exit();
        }
    }
};

Worker.prototype._onTaskResult = function(taskId, results) {
    if (results[0]) {
        results[0] = results[0].message ? results[0].message : (results[0].toString ? results[0].toString() : results[0]);
    }
    process.send({
        type: 'results',
        taskId: taskId,
        results: results
    });
};

module.exports = Worker;