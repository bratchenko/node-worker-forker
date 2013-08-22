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
