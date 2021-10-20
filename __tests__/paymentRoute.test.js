const app = require('../server')
const mongoose = require("mongoose")
const supertest = require("supertest")
const connectDB = require('../api/config/db')

const orderModel = require('../api/models/Order')
const paymentModel = require('../api/models/Payment')

beforeEach((done) => {
    mongoose.connect(process.env.MONGO_URI, () => done())
})

test("GET /api/payments", async () => {
    await supertest(app).get("/api/payments")
        .expect(200)
})

test("GET /api/payments/:paymentId", async () => {
    await supertest(app).get("/api/payments/616ef20bc68cd193efba4d9f")
        .expect(200)
})

test("POST /api/payments", async () => {
    const order = { "orderId": "616ee405e9c45071f44e5819" };

    await supertest(app).post("/api/payments")
        .send(order)
        .expect(400)
        .then(async (response) => {
            // Check the response
            expect(response.body.message).toBe('Invalid request! Payment already processed!!')
        })
})