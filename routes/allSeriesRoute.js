const express = require('express')
const router = express.Router();
const getAllSeries = require('../scripts/getAllSeries');

/// you will get a list of All series here
router.get('/', (req, res)=>{
    getAllSeries()
        .then(data => res.json(data))
})

module.exports = router