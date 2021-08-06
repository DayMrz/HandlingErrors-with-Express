const express = require('express');
const app = express();
const morgan = require('morgan');
const AppError = require("./AppError");

app.use(morgan('tiny'))
app.use((req, res, next) => {
    req.requestTime = Date.now();
    console.log(req.method, req.path);
    next()
})

const verifyPassword = (req, res, next) => {
    const { password } = req.query;
    if (password === 'Dabadirabada') {
        next()
    }
    // res.send('YOU NEED A PASSWORD')
    throw new AppError('Password Require', 401)
}

app.use('/error', (req, res) => {
    chickenfly()
})

app.use('/dogs', (req, res, next) => {
    console.log('Dogs are cute <3')
    next()
})


app.get('/', (req, res) => {
    console.log(`Request Date: ${req.requestTime}`)
    res.send('Home Page')
})

app.get('/dogs', (req, res) => {
    console.log(`Request Date: ${req.requestTime}`)
    res.send('Wof')
})

app.get('/secret', verifyPassword, (req, res) => {
    res.send('Pudding has three eyes and wants to kill Sanji at the weeding')
})

app.use('/admin', (req, res) => {
    throw new AppError('you are not an Admin', 403)
})

app.use((req, res) => {
    res.status(404).res.send('NOT FOUND! sowwy :(')
})

// app.use((err, req, res, next) => {
//     console.log('******************')
//     console.log('*********ERROR********')
//     console.log('******************')
//     console.log(err)
//     next(err)
// })

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something Went Wrong' } = err;
    res.status(status).send(message)
})

app.listen(3000, () => {
    console.log('App is running on localhost:3000')
})