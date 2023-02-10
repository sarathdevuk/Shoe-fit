const mongoose = require("mongoose")

function dbconnect(){
  mongoose.set('strictQuery',false);
  mongoose.connect(process.env.dbconnect)
  .then(()=> console.log("connected"))
  .catch(err => {
   console.log(`Error : ${err}`)
  })
}

module.exports = dbconnect;
 