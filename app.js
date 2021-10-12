const express = require('express')
const colors = require('colors')
const swaggerUI = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')
require('dotenv').config({ path: './api/config/config.env' })

const connectDB = require('./api/config/db')

const app = express()

// Connect to database
connectDB()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Ecommerce API",
			version: "1.0.0",
			description: "Web API with JWT Authentication"
		}
	},
	servers: [
		{
			url: 'http://localhost:3000'
		}
	],
	apis: ['./api/routes/*.js']
}

const specs = swaggerJsDoc(options)

// Mounting routes
app.use('/products', require('./api/routes/productRoute'))
app.use('/', require('./api/routes/userRoute'))
app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs))

const server = app.listen(process.env.PORT, console.log(`Server running on port ${process.env.PORT}`.green.bold))

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
	console.log(`Error: ${err.message}`.red);
	server.close(() => process.exit(1));
});