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

// Add some tasks
forker.addTask("task parameters", function(err, result1, result2) {
    console.log("Got task result:", err, result1, result2);
});

// Handle various errors
forker.on('error', function(err) {
    console.log("Got error:", err);
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
var worker = new Worker(function(parameters, callback) {
    setTimeout(function() {
        console.log("Worker got task:", task parameters);
        callback(null, "result 1", "result 2");
    }, 1000);
});

// Start processing tasks.
worker.start();
```

**NB!** Task parameters and results are transformed to strings due to interprocess communication limitations. If you want to pass objects either way, you should handle conversion to/from strings yourself.
