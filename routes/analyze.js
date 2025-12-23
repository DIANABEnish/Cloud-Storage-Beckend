const express = require('express')
const router = express.Router()
const {analyze} = require('../controllers/analyzeController')

//POST/api/analyze
router.post('/',analyze)

module.exports = router