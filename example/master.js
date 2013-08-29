Forker = require('../index.js').Forker;

// Create forker. Specify worker file.
var forker = new Forker(__dirname + "/worker.js");

// Spawn some worker processes.
forker.spawn(2);

// Add some tasks
forker.addTask(4, handleTaskResult);
forker.addTask(8, handleTaskResult);
forker.addTask(9, handleTaskResult);
forker.addTask(15, handleTaskResult);
forker.addTask(16, handleTaskResult);
forker.addTask(23, handleTaskResult);
forker.addTask(24, handleTaskResult);
forker.addTask(42, handleTaskResult);

function handleTaskResult(err, message) {
    if (err) {
        console.log(err);
    } else {
        console.log(message);
    }
}

// Handle various errors
forker.on('error', function(err) {
    console.log("Got error: ", err);
});

forker.finish(function() {
    console.log("All tasks finished!");
});
