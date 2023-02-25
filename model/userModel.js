
const mongoose = require("mongoose")

const adminUserSchema = mongoose.Schema({
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
  ban:{ 
    type: Boolean,
    default: false,
  },
  cart:{
    type:Array,
    default: []
  },

  address:{

    type:String,
    
  },
  wishlist:[{type:mongoose.Schema.Types.ObjectId, ref:"Wishlist"}],
  otp:String,

},
{
  timestamps:true,
}
);

module.exports = mongoose.model("User",adminUserSchema)