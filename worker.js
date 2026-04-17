const { Worker } = require('bullmq');

// This is our fake "Database" for right now. 
// We use it to remember which orders we've already completed.
const completedOrders = new Set();

console.log("👷 Worker is online. Waiting for jobs in the queue...");

// Create a worker that listens to our 'ordersQueue' in Redis
const worker = new Worker('ordersQueue', async (job) => {
    const { userId, item, idempotencyKey } = job.data;

    // --- HACKATHON WINNING FEATURE 1: IDEMPOTENCY ---
    // If a user clicked "Buy" 5 times, we drop the 2nd, 3rd, 4th, and 5th clicks.
    if (completedOrders.has(idempotencyKey)) {
        console.log(`🚨 [DUPLICATE CAUGHT] Order ${idempotencyKey} was already processed. Dropping it!`);
        return; // Exit immediately without charging the user
    }

    // --- THE ACTUAL PROCESSING ---
    console.log(`[PROCESSING] Charging user ${userId} for ${item}...`);
    
    // We use a timeout to simulate how long it takes to save to a real database (e.g., 1 second)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Save the key to our "Database" so we never process it again
    completedOrders.add(idempotencyKey);
    console.log(`✅ [SUCCESS] Order ${idempotencyKey} complete!\n`);

}, {
    connection: {
        host: '127.0.0.1',
        port: 6379
    },
    // --- HACKATHON WINNING FEATURE 2: BACKPRESSURE ---
    // No matter how many jobs are in the queue, only process 2 jobs per second max.
    // This protects our database from dying during a spike!
    limiter: {
        max: 2,
        duration: 1000
    }
});

// Just in case something breaks
worker.on('failed', (job, err) => {
    console.log(`❌ Job Failed: ${err.message}`);
});