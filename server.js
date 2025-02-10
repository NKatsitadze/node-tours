const dotenv = require('dotenv') // dependency to help us declare environmental variables
const mongoose = require('mongoose')

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
    console.log(err.name, err.message)
    process.exit(1)
})

dotenv.config({path: 'config.env'}) // environmental variables are here
const app = require('./app')

const DB = process.env.DATABASE.replace( // database token from mongo
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
)

mongoose.connect(DB, { // connect to database before starting server
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then((con) => {
    console.log("DB connection successful")
})

const server = app.listen(process.env.PORT, () => {
    console.log(`App running on port ${process.env.PORT}...`)
  })
  
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...')
    console.log(err.name, err.message)
    server.close(() => {
        process.exit(1)
    })
})