
const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",

    },
    quantity: {
      type: Number,
    },

  }],
  paymentIntent: {
  },
  address: {
    type: Object,
    required: true,
  },
  orderDate: {
    type: Date,
  },
  dispatch: {
    type: Date,
    default: new Date(new Date().setDate(new Date().getDate() + 7))
  },
  orderStatus: {
    type: String,
    default: "Not processed",

    enum: ["Not processed",
      "Cash on Delivery",
      "Processing",
      "dispatched",
      "Out for delivery",
      "Cancelled",
      "Delivered",
      "Returned",
    ]
  },
  orderby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, {
  timestamps: true

});

module.exports = mongoose.model("Order", orderSchema);
