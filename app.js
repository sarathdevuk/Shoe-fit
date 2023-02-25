const express = require('express') 
require('dotenv').config()
const session=require('express-session')

const errorHandler = require('./middleware/errorHandler')
const userRoutes = require("./routes/userRoutes")
const adminRoutes = require("./routes/adminRoutes")
const {engine}= require("express-handlebars")
const path = require("path")

const morgan = require('morgan')
const dbconnect=require('./config/dbconnection')


 
const app = express()
dbconnect()//database
app.engine("hbs", engine({extname:".hbs"}))
app.set('view engine', 'hbs');

app.use(function(req, res, next) {

      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

app.use(session({
  secret: 'secret key',
  resave: false,
  saveUninitialized: true,
  
}))
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(morgan("dev"))
// app.use()
app.get('/sample', (req,res)=>{
 
  // res.render("landingPage")
  // res.render("admin/dash")
  // res.render("admin/userManagement")
  res.render("admin/editProduct")
  // res.render("admin/productManagement")
  // res.render("admin/updateProduct")
  // res.render("admin/profile")
  
})




app.use('/admin',adminRoutes)
app.use('/',userRoutes)



// app.use('/product',productRoutes)
app.use(errorHandler)

app.listen(3000,()=>{
  console.log("server running on http://localhost:3000")
})
  