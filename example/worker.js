var Worker = require('../index.js').Worker;

// Init worker with function which executes tasks.
var worker = new Worker(function(number, callback) {
    setTimeout(function() {
        if ( [4, 8, 15, 16, 23, 42].indexOf(number) == -1 ) {
            return callback(new Error("Wrong number: " + number));
        } else {
            return callback(null, "Got number: " + number);
        }
    }, 1000);
});

// Start processing tasks.
worker.start();
