const express = require('express')
const router = express.Router();
const scraper = require('../scrap');

/// this will get you a list of labels
router.get('/', (req,res)=>{
    res.send('this will get you a list of labels')
})

/// this will return a list of movies from that label
router.get('/:label', (req,res)=>{

    scraper.listSeries(req.params.label)
        .then(data => res.json(data))
})

module.exports = router