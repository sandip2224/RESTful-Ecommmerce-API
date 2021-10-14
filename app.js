const express = require('express')
const colors = require('colors')
require('dotenv').config({ path: './api/config/config.env' })

const connectDB = require('./api/config/db')

const app = express()

// Connect to database
connectDB()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Mounting routes
app.use('/products', require('./api/routes/productRoute'))
app.use('/orders', require('./api/routes/orderRoute'))
app.use('/api/users', require('./api/routes/userRoute'))

const server = app.listen(process.env.PORT, console.log(`Server running on port ${process.env.PORT}`.green.bold))

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
	console.log(`Error: ${err.message}`.red);
	server.close(() => process.exit(1));
});