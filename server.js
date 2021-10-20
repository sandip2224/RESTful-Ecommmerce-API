const server = require('./app')
const connectDB = require('./api/config/db')

if (process.env.NODE_ENV !== 'test') {
    const live = server.listen(process.env.PORT, console.log(`Server running on port ${process.env.PORT}`.green.bold))
    // // Handle unhandled promise rejections
    process.on("unhandledRejection", (err, promise) => {
        console.log(`Error: ${err.message}`.red);
        live.close(() => process.exit(1));
    })
}

module.exports = server