const express = require('express')
const router = express.Router();

router.get('/:movie', (req,res)=>{
    res.send(`you searched for ${req.params.movie} movie`)
})

module.exports = router