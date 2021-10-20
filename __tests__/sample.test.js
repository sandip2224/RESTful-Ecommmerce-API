const app = require('../server')
const mongoose = require("mongoose");
const supertest = require("supertest");
const connectDB = require('../api/config/db');

beforeEach((done) => {
    mongoose.connect(process.env.MONGO_URI, () => done())
})

it('Testing to see if Jest works', () => {
    expect(1).toBe(1)
})

test("GET /api/products", async () => {
    await supertest(app).get("/api/products")
        .expect(200)
});

test("GET /api/products/:productId", async () => {
    await supertest(app).get("/api/products/616da37e83c82f5e37fb513f")
        .expect(200)
});

test("GET /api/orders", async () => {
    await supertest(app).get("/api/orders")
        .expect(200)
});

test("GET /api/orders/:orderId", async () => {
    await supertest(app).get("/api/orders/616ee405e9c45071f44e5819")
        .expect(200)
});