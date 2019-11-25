const express = require('express')
const router = express.Router();
const scraper = require('../scrap')

/// you will get a list of All series here
router.get('/', (req, res)=>{
    scraper.listAllSeries()
        .then(data => res.json(data))
})

module.exports = router