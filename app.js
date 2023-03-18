const express = require('express')
require('dotenv').config()
const session = require('express-session')

const errorHandler = require('./middleware/errorHandler')
const userRoutes = require("./routes/userRoutes")
const adminRoutes = require("./routes/adminRoutes")
const { engine } = require("express-handlebars")
const path = require("path")
const hbs = require('handlebars')

const morgan = require('morgan')
const dbconnect = require('./config/dbconnection')
//to increment indexing
hbs.registerHelper('inc',function(value,options){
  return parseInt(value)+1;
});

hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});


const app = express()
dbconnect()//database
app.engine("hbs", engine({ extname: ".hbs" }))
app.set('view engine', 'hbs');

app.use(function (req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  next();
});

app.use(session({
  secret:'this.is_secretekeyy8q5',
  resave:false,
  cookie:{maxAge:1000*60*60*24},
  saveUninitialized:true,
     
}));
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(morgan("dev"))


// app.use()
app.get('/sample', (req, res) => {

  res.render("newChekout")
  // res.render("admin/categoryManagement")
  // res.render("admin/salesReport")
  // res.render("admin/dashboard")
  // res.render("test")
  


})



app.use('/admin', adminRoutes)
app.use('/', userRoutes)

app.use("*", (req,res)=>{
  res.status(404)
  throw new Error("Page not found")
})

// app.use('/product',productRoutes)
app.use(errorHandler)

app.listen(3000, () => {
  console.log("server running on http://localhost:3000")
})
