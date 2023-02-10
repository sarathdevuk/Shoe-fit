const express = require('express') 
require('dotenv').config()
const session=require('express-session')

const errorHandler = require('./middleware/errorHandler')
const userRoutes = require("./routes/userRoutes")
const adminRoutes = require("./routes/adminRoutes")
const morgan = require('morgan')
const dbconnect=require('./config/dbconnection')

 
const app = express()
dbconnect()

app.use(session({
  secret: 'secret key',
  resave: false,
  saveUninitialized: true,
  
}))

app.use(express.json())
app.use(morgan("dev"))
// app.use()
app.use('/user',userRoutes)
app.use('/admin',adminRoutes)


// app.use('/product',productRoutes)
app.use(errorHandler)

app.listen(3000,()=>{
  console.log("server running")
})
  