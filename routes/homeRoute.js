const express = require('express')
const router = express.Router();
const getLatest = require('../scripts/getLatest');

/// Get Home Route
router.get('/', (req, res)=>{
    getLatest()
        .then(data => res.json(data))
})

/// Get Route with numbers and redirect to home
router.get('/[0-9]', (req, res)=>{
    res.redirect('/')
})


module.exports = router