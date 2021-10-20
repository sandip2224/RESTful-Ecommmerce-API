const app = require('../server')
const mongoose = require("mongoose");
const supertest = require("supertest");
const connectDB = require('../api/config/db');

beforeEach((done) => {
    mongoose.connect(process.env.MONGO_URI, () => done())
})

test("GET /api/orders", async () => {
    await supertest(app).get("/api/orders")
        .expect(200)
});

test("GET /api/orders/:orderId", async () => {
    await supertest(app).get("/api/orders/616ee405e9c45071f44e5819")
        .expect(200)
});

test("POST /api/orders", async () => {
    const order = { "productId": "616da37e83c82f5e37fb513f", "quantity": 50 };

    await supertest(app).post("/api/orders")
        .send(order)
        .expect(201)
        .then(async (response) => {
            // Check the response
            expect(response.body.message).toBe('Order created successfully!')
        })
})