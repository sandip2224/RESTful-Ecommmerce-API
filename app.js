const express = require("express");
const colors = require("colors");
const path = require("path");
const rateLimit = require("express-rate-limit");
require("dotenv").config({ path: "./api/config/config.env" });

const orderModel = require("./api/models/Order");

const connectDB = require("./api/config/db");

const app = express();

// Connect to database
connectDB();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Mounting routes
app.use("/api/products", require("./api/routes/productRoute"));
app.use("/api/orders", require("./api/routes/orderRoute"));
app.use("/api/users", require("./api/routes/userRoute"));
app.use("/api/payments", require("./api/routes/paymentRoute"));

// const server = app.listen(process.env.PORT, console.log(`Server running on port ${process.env.PORT}`.green.bold))

// // Handle unhandled promise rejections
// process.on("unhandledRejection", (err, promise) => {
// 	console.log(`Error: ${err.message}`.red);
// 	server.close(() => process.exit(1));
// })

module.exports = app;
