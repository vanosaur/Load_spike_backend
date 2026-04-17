const express = require('express');
const path = require('path');
const ordersQueue = require('./queue');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const app = express();
app.use(express.json());

// --- 1. SET UP THE DASHBOARD (The "Wow" Factor) ---
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
    queues: [new BullMQAdapter(ordersQueue)],
    serverAdapter: serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

// --- 2. SERVE THE FRONTEND ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- 3. THE API ENDPOINTS ---
app.post('/buy', async (req, res) => {
    const { userId, item, idempotencyKey } = req.body;
    if (!userId || !item || !idempotencyKey) {
        return res.status(400).json({ error: "Missing data." });
    }

    const job = await ordersQueue.add('process-order', {
        userId, item, idempotencyKey
    }, {
        attempts: 3, 
        backoff: { type: 'fixed', delay: 3000 } 
    });

    res.status(202).json({ jobId: job.id, trackingKey: idempotencyKey });
});

app.get('/status/:jobId', async (req, res) => {
    const job = await ordersQueue.getJob(req.params.jobId);
    if (!job) return res.status(404).json({ error: "Not found" });
    const state = await job.getState();
    res.json({ status: state });
});

app.listen(3000, () => {
    console.log('🚀 API: http://localhost:3000');
    console.log('📊 DASHBOARD: http://localhost:3000/admin/queues');
});