const express = require('express')
const router = express.Router();
const getGenre = require('../scripts/getGenre');

/// you will get a list of genre here
router.get('/', (req, res)=>{
    getGenre()
        .then(data => res.json(data))
})

/// you will get a list of movies from a selected genre here
router.get('/:cat', (req, res)=>{
    res.send(`list of movies in ${req.params.cat} genre`)
})

module.exports = router