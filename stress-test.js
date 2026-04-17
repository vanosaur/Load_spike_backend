// stress-test.js
console.log("🚀 Preparing to blast the API with 50 orders...");

async function runTest() {
    for (let i = 1; i <= 50; i++) {
        // We fire these off without waiting for them to finish!
        fetch('http://localhost:3000/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: `User_${i}`,
                item: "PS5",
                idempotencyKey: `order_900${i}` // Unique key for each!
            })
        }).catch(err => console.error("Request failed", err));
    }
    console.log("🏁 All 50 requests fired at the server in milliseconds!");
}

runTest();