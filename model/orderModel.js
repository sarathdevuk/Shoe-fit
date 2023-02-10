const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  products:[{
    product:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"product",

    },
    quantity:{
      type: Number,
    },
    color:{
      type: String
    },
  }],
  paymentIntent:{
    
  },

  orderStatus:{
    type:String,
    default:"Not processed",

    enum:["Not processed",
   "Cash on Delivery",
   "Processing",
    "dispatched",
    "Cancelled",
    "Delivered",]
  },
  orderby :{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
  },
  },{
    timestamps:true

  });   

module.exports= mongoose.model("Order",orderSchema);
