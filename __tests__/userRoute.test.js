const app = require('../server')
const mongoose = require("mongoose")
const supertest = require("supertest")
const connectDB = require('../api/config/db')

const userModel = require('../api/models/User')

beforeEach((done) => {
    mongoose.connect(process.env.MONGO_URI, () => done())
})

test("GET /api/users", async () => {
    await supertest(app).get("/api/users")
        .expect(200)
});

test("GET /api/users/:userId", async () => {
    await supertest(app).get("/api/users/616ce5ba5123010d3ce81587")
        .expect(200)
        .then(async (response) => {
            // Check the response
            expect(response.body.email).toBe('seller1@gmail.com')
            expect(response.body.level).toBe('seller')
        })
});

test("DELETE /api/user/:userId", async () => {
    const user = await userModel.create({ "email": "tester@gmail.com", "password": "tester", "level": "customer" })

    await supertest(app)
        .delete("/api/users/" + user.id)
        .expect(200)
        .then(async () => {
            expect(await userModel.findOne({ _id: user.id })).toBeFalsy();
        });
});