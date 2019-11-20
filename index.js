const express = require('express')
const app = express()
const scraper = require('./scrap');

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(` listening on port ${port}`)
});

app.get('/[0-9]', (req, res)=>{
    res.send("hello")
})

app.get('/', (req, res)=>{
    
     scraper.loadMovies()
        .then(data => res.json(data))
});

app.get('/:label', (req, res)=>{
    
    scraper.listSeries(req.params.label)
        .then(data => res.json(data))
})