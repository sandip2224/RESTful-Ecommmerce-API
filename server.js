const server = require('./app')
const connectDB = require('./api/config/db')

server.listen(process.env.PORT, console.log(`Server running on port ${process.env.PORT}`.green.bold))

module.exports = server