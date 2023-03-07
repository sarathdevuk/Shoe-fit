
const mongoose = require("mongoose")

const couponSchema = mongoose.Schema({
  name: {
    type:String,
    require:true,
    uppercase:true,
    unique:true,

  },
  expiry: {
    type:Date,
    required:true

  },
  discount: {
    type:Number,
    required: true,
      
  },
  unlist:{
    type:Boolean,
    default:false,
  }
  
});

module.exports = mongoose.model("Coupon",couponSchema)