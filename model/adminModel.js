
const mongoose = require("mongoose")

const adminSchema = mongoose.Schema({
  username: {
    type:String,
    required: [true,"please add the user name"]
  },
  email: {
    type:String,
    required: [true,"please add the user email"],
    unique:[true, "Email address already taken"] 
  },
  password: {
    type:String,
    required: [true,"please add the user name"],
  },
  
},
{
  timestamps:true,
}
);

module.exports = mongoose.model("Admin",adminSchema)