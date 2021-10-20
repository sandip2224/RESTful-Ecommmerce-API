const app = require('../server')
const mongoose = require("mongoose")
const supertest = require("supertest")
const connectDB = require('../api/config/db')

const orderModel = require('../api/models/Order')

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

test("PATCH /api/orders/:orderId", async () => {
    const order = await orderModel.create({ "productId": "616da37e83c82f5e37fb513f", "quantity": 60 });
    const newOrder = { "productId": "616da37e83c82f5e37fb513f", "quantity": 61 };
    await supertest(app).patch("/api/orders/" + order.id)
        .send(newOrder)
        .expect(200)
        .then(async (response) => {
            // Check the response
            expect(response.body.message).toBe("Order updated successfully!!")

            // Check the data in the database
            const updatedOrder = await orderModel.findOne({ _id: response.body._id })
            expect(updatedOrder).toBeTruthy()
            expect(updatedOrder.quantity).toBe(newOrder.quantity)
        })
})

test("DELETE /api/orders/:id", async () => {
    const order = await orderModel.create({ "productId": "616da37e83c82f5e37fb513f", "quantity": 100 });

    await supertest(app)
        .delete("/api/orders/" + order.id)
        .expect(200)
        .then(async () => {
            expect(await orderModel.findOne({ _id: order.id })).toBeFalsy();
        });
});