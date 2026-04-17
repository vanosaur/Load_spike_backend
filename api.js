const express = require('express');
const ordersQueue = require('./queue');

const app = express();
app.use(express.json()); // Lets us read JSON data

app.post('/buy', async (req, res) => {
    // 1. Catch the data sent by the user
    const { userId, item, idempotencyKey } = req.body;

    // 2. Throw it into the Redis Waiting Room!
    // We name the job 'process-order'
    await ordersQueue.add('process-order', {
        userId,
        item,
        idempotencyKey
    });

    // 3. Instantly reply to the user (so they don't get a loading screen)
    res.status(202).json({
        message: "Order received! You are in the queue.",
        trackingKey: idempotencyKey
    });
});

app.listen(3000, () => {
    console.log('🚀 API Server is ALIVE on http://localhost:3000');
});