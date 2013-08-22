Worker Forker
==================

Simplifies spawning pool of worker processes and distributing tasks between them.

Installation
----------
`npm install worker-forker`


Usage
-------

In master process:
```javascript
Forker = require('worker-forker').Forker;

// Create forker. Specify worker file.
var forker = new Forker(__dirname + "/worker.js");

// Spawn some worker processes.
forker.spawn(require('os').cpus().length);

// Add some task parameters which would be evenly distributed between workers.
forker.addTasks([4, 8, 15, 16]);

// Add some more tasks
forker.addTask(23);
forker.addTask(42);

// Handle various errors
forker.on('error', function(err) {
    console.log("Got error", err);
});

// Wait until all tasks finished
forker.finish(function() {
    console.log("All tasks finished!");
});
```

In worker file (worker.js in this example):
```javascript
var Worker = require('../index.js').Worker;

// Init worker with function which executes tasks.
var worker = new Worker(function(taskParams, callback) {
    setTimeout(function() {
        console.log("Worker got task:", taskParams);
        callback();
    }, 1000);
});

// Start processing tasks.
worker.start();
```
