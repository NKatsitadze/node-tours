const express = require('express')
const morgan = require('morgan') // dependency which logs request method/url/status/
                                // res[content-length]/response-time ms')

const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const rateLimit = require('express-rate-limit')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const app = express()

const tourRouter = require('./routes/tourRoutes') // here are functions which we declared on specific url paths & http requests
const userRouter = require('./routes/userRoutes') //

app.use(helmet()) // set security http headers, recommended to use in the beginning

if(process.env.NODE_ENV === 'development') app.use(morgan('dev')) 
    // NODE_ENV is environmental variable that we declared in config.env or during script start,
    // depending on this we can run script, for example node 'path of file' --NODE_ENV=development.


const limiter = rateLimit({
    max: 100, // limits to 100 requests in 1 hour
    windowMs: 60 * 60 * 1000, // 1hour in miliseconds
    message: 'Too many requests from this IP, please try again after 1 hour'
})
app.use('/api', limiter) // will affect every part of this app which starts at /api

app.use(express.json( { limit: '10kb' } )) // built in middleware which binds request body (sent by client) to req.body
// app.use(express.static(`${__dirname}/public`)) // files in public folder are not reachable for client


// Data sanitization agains NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// prevent parameter pollution, for example duplicated fields
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}))

app.use((req,res,next) => { // one of common middlewares, never forget to trigger next() at the end
    req.requestTime = new Date().toISOString()
    next()
})

app.use('/api/v1/tours', tourRouter) // routers are binded to this path
app.use('/api/v1/users', userRouter) //

app.all('*', (req, res, next) => {
    // const err = new Error(`Could not find ${req.originalUrl} on server`)
    // err.status = 'fail'
    // err.statusCode = 404

    // This middleware function was created to hand all errors which may be
    // caused by incorrect navigations
    // if we pass argument to next function, express will know automatically
    // that error happened and will go to global error handler middleware below
    // next(err)
    // in this case if below global error handler was somewhere else,
    // express would still find it

    next(new AppError(`Could not find ${req.originalUrl} on server`, 404))
})


// if we use 4th argument in middleware function, express will know that this 
// function handles global errors like below
// app.use((err,req,res,next) => {
//     err.statusCode = err.statusCode || 500
//     err.status = err.status || 'error'

//     res.status(err.statusCode).json({
//         status: err.status,
//         message: err.message
//     })
// })
app.use(globalErrorHandler)

module.exports = app
