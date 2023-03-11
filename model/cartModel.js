

const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
  products:[{
    product:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"product",

    },
    quantity:{
      type: Number,
    },
    price:{
      type:Number,  
    },
   
  }],
  cartTotal:Number,
  totalAfterDiscount: Number,
  
  orderby :{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
  },
  },{
    timestamps:true

  });   

module.exports= mongoose.model("Cart",cartSchema);
