const express = require('express')
const dotenv = require('dotenv').config()

const userRoutes = require('./routes/userRoutes')
const studyGroupRoutes = require('./routes/studyGroupRoutes')
const studyGroupContentRoutes = require('./routes/studyGroupContentRoutes')
const studyGroupParticipantRoutes = require("./routes/studyGroupParticipantRoutes");

const {handleError} = require('./middlewares/errorMiddlewares')

const connectMongoDB = require('./config/mongoDBConfig')

connectMongoDB()

const PORT = process.env.PORT || 5000
const app = express()

// global middleware - executed for every request-response cycle (For POST & PUT HTTP requests)
app.use(express.json()) 
// extended: true ---> It uses qs to parse URL encoded data (can parse any data)
// extended: false ---> It uses querystring to parse URL encoded data 
//                      (Can parse string and array)
app.use(express.urlencoded({extended: true}))

 
app.use('/api/users', userRoutes)
app.use('/api/study-groups', studyGroupRoutes)
app.use('/study-groups/contents', studyGroupContentRoutes)
app.use("/study-groups/participants", studyGroupParticipantRoutes);

// It overrides default express error handler (throw new Error([message]))
app.use(handleError)

app.listen(PORT, () => console.log(`App started on port ${PORT}`))