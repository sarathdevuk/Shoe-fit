
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
  phone:{
    type:String,
    unique:true,
    required:false
  },
  ban:{ 
    type: Boolean,
    default: false,
  },
  address:{
    type:Array,
    default:[],
    
  },
   
  wallet:{
    type:Number,
    default:0
  },
  wishlist:[{type:mongoose.Schema.Types.ObjectId, ref:"Wishlist"}],

},
{
  timestamps:true,
}
);

module.exports = mongoose.model("User",adminUserSchema)