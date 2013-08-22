Forker = require('../index.js').Forker;

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

forker.finish(function() {
    console.log("All tasks finished!");
});
