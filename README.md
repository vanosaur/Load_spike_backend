# 🌪️ Load Spike Management System

> **Built for the Zero To One Hackathon**
> **Core Problem:** Create a system that handles load spikes without dropping or duplicating work.

## 🎯 Overview
This project is a resilient backend architecture designed to act as a "Shock Absorber" during massive traffic spikes (e.g., Flash Sales, Ticket Drops). Instead of routing massive concurrent traffic directly to a fragile database, the system buffers requests in a high-speed Redis queue and processes them at a safe, controlled rate.

## ✨ Core Features & Hackathon Rubric Mapping

* **Component Separation (Architecture & Design):** The system is strictly decoupled. The `api.js` (Receiver) operates completely independently of the `worker.js` (Processor). If the database goes down, the API stays online and continues accepting orders.
* **Backpressure (Implementation Depth):** The worker is configured with a strict speed limit (`2 jobs per second`). Even if 10,000 requests hit the API in a single millisecond, the worker will calmly process them at a safe rate, preventing database connection timeouts.
* **Idempotency (Correctness / No Duplicated Work):** Every request includes an `idempotencyKey`. The system checks the database before processing to ensure no user is accidentally charged twice if they spam the "Buy" button.
* **Persistence:** Uses SQLite to ensure processed orders are saved permanently to disk (`orders.db`).

## 🏗️ Architecture

1. **User / Load Tester** ➡️ Sends HTTP POST requests.
2. **Express.js API** ➡️ The "Bouncer". Instantly accepts the request, validates it, assigns it to the queue, and responds `202 Accepted` in milliseconds.
3. **Redis / BullMQ** ➡️ The "Waiting Room". Extremely fast in-memory message broker that holds the pending jobs.
4. **Worker (Node.js)** ➡️ The "Cashier". Pulls jobs from Redis safely, respects rate limits, checks for duplicates, and handles database writes.
5. **SQLite Database** ➡️ The "Vault". Permanent storage for successful orders.

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v16 or higher)
* **Redis** running locally on port `6379`.
  * *Mac:* `brew install redis && brew services start redis`

### Installation
1. Clone the repository and navigate into the project folder.
2. Install the required dependencies:
   \`\`\`bash
   npm install
   \`\`\`

## 🎮 How to Run & Demo

To see the system in action, you will need 3 separate terminal windows.

**Terminal 1: Start the API Gateway**
\`\`\`bash
node api.js
\`\`\`

**Terminal 2: Start the Background Worker**
\`\`\`bash
node worker.js
\`\`\`
*(Notice that the `orders.db` SQLite file is automatically generated when the worker starts).*

**Terminal 3: Trigger the Load Spike (The Killer Demo)**
\`\`\`bash
node stress-test.js
\`\`\`
*This script will fire 50 concurrent requests at the API in under 10 milliseconds. Watch Terminal 1 accept them instantly without crashing, while Terminal 2 safely processes them two-by-two over the next 25 seconds.*

## 📂 Project Structure

* `api.js` - The Express web server.
* `worker.js` - The BullMQ background processor.
* `queue.js` - The shared Redis connection configuration.
* `db.js` - SQLite database initialization and schema setup.
* `stress-test.js` - The automated load-generation script for demos.
* `orders.db` - (Auto-generated) The SQLite database file.

## 🛠️ Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Queue / Message Broker:** BullMQ + Redis
* **Database:** SQLite3
