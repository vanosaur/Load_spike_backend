const { Queue } = require('bullmq');

// This creates a queue called 'ordersQueue' and connects to your local Redis Mac server
const ordersQueue = new Queue('ordersQueue', {
    connection: {
        host: '127.0.0.1',
        port: 6379
    }
});

module.exports = ordersQueue;