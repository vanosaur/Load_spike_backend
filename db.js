const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function initDB() {
    const db = await open({
        filename: './orders.db',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            item TEXT,
            idempotency_key TEXT UNIQUE,
            status TEXT
        )
    `);

    return db;
}

module.exports = initDB;