const express = require('express')
const app = express()
const router = express.Router;

/// require routes 
const homeRoute = require('./routes/homeRoute')
const genreRoute = require('./routes/genreRoute')
const allSeries = require('./routes/allSeries')

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`listening on port ${port}`)
});


/// use routes
app.use('/', homeRoute)
app.use('/genre', genreRoute)
app.use('/AllSeries', allSeries)

