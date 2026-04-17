console.log("🚀 Preparing to blast the API with 50 orders...");

async function runTest() {
    for (let i = 1; i <= 50; i++) {
        fetch('http://localhost:3000/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: `User_${i}`,
                item: "PS5",
                // We add a timestamp to the key so you can run the test multiple times!
                idempotencyKey: `order_${Date.now()}_${i}` 
            })
        }).catch(err => console.error("Request failed", err));
    }
    console.log("🏁 All 50 requests fired at the server in milliseconds!");
}

runTest();