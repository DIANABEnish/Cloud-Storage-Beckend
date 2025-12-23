const express = require('express')
const cors = require('cors')
require ('dotenv').config


const app = express()

//middleware
app.use(cors()) //allows communication with the frontend side
app.use(express.json()) //allows recive and read request from the JSON

//routes
app.get('/', (req,res)=>{
  res.json({message: 'Cloud Optimizer API is running!'})
})

const analyzeRoutes = require('./routes/analyze')
app.use('/api/analyze', analyzeRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>{
  console.log(`Server running ob port ${PORT}`)
})

