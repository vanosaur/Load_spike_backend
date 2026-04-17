const { Queue } = require('bullmq');

const ordersQueue = new Queue('ordersQueue', {
    connection: {
        host: '127.0.0.1',
        port: 6379
    }
});

module.exports = ordersQueue;