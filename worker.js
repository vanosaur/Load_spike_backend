const { Worker } = require('bullmq');
const initDB = require('./db');

async function startWorker() {
    const db = await initDB();
    console.log("🗄️ SQLite Database connected!");
    console.log("👷 Worker is online. Waiting for jobs in the queue...");

    const worker = new Worker('ordersQueue', async (job) => {
        const { userId, item, idempotencyKey } = job.data;

        // --- IDEMPOTENCY CHECK (No Duplicates) ---
        const existingOrder = await db.get(
            `SELECT * FROM orders WHERE idempotency_key = ?`, [idempotencyKey]
        );
        if (existingOrder) {
            console.log(`🚨 [DUPLICATE] Order ${idempotencyKey} already exists. Dropping!`);
            return; 
        }

        console.log(`[PROCESSING] Saving ${item} for user ${userId}...`);

        // --- CHAOS SIMULATION (Fake 20% Crash Rate) ---
        if (Math.random() < 0.20) {
            console.log(`💥 [CRASH] Database connection violently dropped for ${idempotencyKey}!`);
            throw new Error("DATABASE_OFFLINE");
        }
        
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // --- PERMANENT SAVE ---
        await db.run(
            `INSERT INTO orders (user_id, item, idempotency_key, status) VALUES (?, ?, ?, ?)`,
            [userId, item, idempotencyKey, "COMPLETED"]
        );

        console.log(`✅ [SUCCESS] Order ${idempotencyKey} saved to SQLite permanently!\n`);

    }, {
        connection: { host: '127.0.0.1', port: 6379 },
        limiter: { max: 2, duration: 1000 } // Backpressure / Speed Limit
    });

    worker.on('failed', (job, err) => console.log(`❌ Job Failed: ${err.message}`));
}

startWorker();