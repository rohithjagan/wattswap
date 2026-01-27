// Trading Engine Test Script
// This script tests the complete trading flow

const BASE_URL = 'http://localhost:5000/api';

// Store tokens
let sellerToken: string;
let buyerToken: string;
let sellerId: string;
let buyerId: string;

// Register and login as Seller
const setupSeller = async () => {
    console.log('\n=== Setting up SELLER ===');

    // Register
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Seller User',
            email: `seller_${Date.now()}@test.com`,
            password: 'password123'
        })
    });

    const sellerData = await registerRes.json();
    sellerToken = sellerData.token;
    sellerId = sellerData._id;

    console.log(`✅ Seller registered: ${sellerId}`);
    return sellerData;
};

// Register and login as Buyer
const setupBuyer = async () => {
    console.log('\n=== Setting up BUYER ===');

    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Buyer User',
            email: `buyer_${Date.now()}@test.com`,
            password: 'password123'
        })
    });

    const buyerData = await registerRes.json();
    buyerToken = buyerData.token;
    buyerId = buyerData._id;

    console.log(`✅ Buyer registered: ${buyerId}`);
    return buyerData;
};

// Seller creates a SELL order
const createSellOrder = async () => {
    console.log('\n=== Creating SELL Order (Seller has surplus energy) ===');

    const res = await fetch(`${BASE_URL}/trades/order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sellerToken}`
        },
        body: JSON.stringify({
            type: 'SELL',
            quantity: 5.0,
            pricePerUnit: 3.50
        })
    });

    const order = await res.json();
    console.log(`✅ SELL Order Created:`, order);
    return order;
};

// Buyer creates a BUY order that matches
const createBuyOrder = async () => {
    console.log('\n=== Creating BUY Order (should match with SELL) ===');

    const res = await fetch(`${BASE_URL}/trades/order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${buyerToken}`
        },
        body: JSON.stringify({
            type: 'BUY',
            quantity: 3.0,
            pricePerUnit: 4.00  // Willing to pay up to ₹4/kWh
        })
    });

    const order = await res.json();
    console.log(`✅ BUY Order Created:`, order);

    if (order.order.status === 'COMPLETED') {
        console.log('🎉 Trade was MATCHED and EXECUTED!');
    }

    return order;
};

// View trade history
const viewTradeHistory = async (token: string, label: string) => {
    console.log(`\n=== ${label} Trade History ===`);

    const res = await fetch(`${BASE_URL}/trades/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const trades = await res.json();
    console.log(`📊 Total trades: ${trades.length}`);
    trades.forEach((trade: any) => {
        console.log(`   - ${trade.quantity} kWh @ ₹${trade.pricePerUnit} = ₹${trade.totalAmount}`);
    });
};

// Run the test
const runTest = async () => {
    try {
        console.log('🧪 Starting Trading Engine Test...\n');

        await setupSeller();
        await setupBuyer();

        await createSellOrder();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s

        await createBuyOrder();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s

        await viewTradeHistory(sellerToken, 'SELLER');
        await viewTradeHistory(buyerToken, 'BUYER');

        console.log('\n✅ Test completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
};

runTest();
