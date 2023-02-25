const mongoose = require("mongoose")

const productSchema = mongoose.Schema({

    name:{
      type :String,
      require:true
    },
    price:{
      type: Number,
      default:0,
      require:true
    },
    description:{
      type: String,
      require:true
    },
    image:{
      type:Object,
      
    },
    sideImage:{
      type:Array,

    },
    quantity: {
      type: Number,
      require:true
  },
    mrp: {
      type: Number,
      require:false
  },
    sold: {
      type: Number,
      
  },
  category:{
    type:String,

  },
  
},{
  timestamps:true
})

module.exports = mongoose.model("product",productSchema)
