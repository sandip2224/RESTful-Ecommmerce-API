const server = require('./app')
const connectDB = require('./api/config/db')

if (process.env.NODE_ENV !== 'test') {
    server.listen(process.env.PORT, console.log(`Server running on port ${process.env.PORT}`.green.bold))
}

module.exports = server