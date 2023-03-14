
const asyncHandler = require("express-async-handler");
const { findById } = require("../model/orderModel");
const uniqid = require("uniqid")
const Order = require('../model/orderModel')
const User = require('../model/userModel')
const Cart = require('../model/cartModel')
const Product = require('../model/productModel')
const Razorpay = require('razorpay');
const crypto = require("crypto");
const { userCart } = require("./cartController");

var instance = new Razorpay({
  key_id: 'rzp_test_9dkcXL2B2Z4Ctj',
  key_secret: 'j44gx6znDQHHOLOebYixLt0W',
});



const orderController = {

  getCheckoutPage: asyncHandler(async (req, res) => {
    const id = req.user
    try {
      const cart = await Cart.findOne({ orderby: id }).populate('products.product').lean()
      const user = await User.findById(id).lean()
      console.log("userCArt", cart,"hdfhbf",user);
      res.render("chekout", { cart,user })
    } catch (error) {
      res.status(404)
      // throw new Error(error)
      console.log(error);

    }

  }),




  createOrder: asyncHandler(async (req, res) => {
    console.log("chekout body", req.body);


    const { paymentMethod, name, email, phone, address, country, state, zip, area } = req.body
    console.log(req.body);
    const id = req.user;
    if (!paymentMethod) {
      res.status(404)
      throw new Error("Create Cash order failed")
    }
    let status = paymentMethod === 'COD' ? 'placed' : 'pending'
    try {
      const user = await User.findById(id) 
      let userCart = await Cart.findOne({ orderby: id })
      console.log("quqntitryy", userCart);


      let finalAmount = userCart.totalAfterDiscount ? userCart.totalAfterDiscount : userCart.cartTotal;
      console.log("final amount", finalAmount);

      if (paymentMethod == "ONLINE") {
        req.session.orderBody = req.body
        req.session.amount = finalAmount

        var options = {
          amount: finalAmount * 100,  // amount in the smallest currency unit
          currency: "INR",
          receipt: uniqid()

        };
        instance.orders.create(options, function (err, order) {
          if (err) {
            console.log(err);
          }
          console.log("new order", order);

          res.json(order)
        });
      } else {

        
        let newOrder = await new Order({
          products: userCart.products,
          address: {
            name: name,
            email: email,
            phone: phone,
            address: address,
            country: country,
            state: state,
            area: area,
            zip: zip,

          },
          paymentIntent: {
            id: uniqid(),
            method: "COD",
            amount: finalAmount,
            status: "Cash on Delivery",       
            currency: "Rupees",
          },
          orderDate: Date.now(),
          orderStatus: "Cash on Delivery",
          orderby: user._id

        })
        newOrder.save();


        for (let i = 0; i < userCart.products.length; i++) {

          await Product.updateOne({ _id: userCart.products[i].product._id }, { $inc: { quantity: -1 * userCart.products[i].quantity, sold: 1 * userCart.products[i].quantity } });
        }
        console.log("succuss");

        await userCart.remove();
        res.json(status = false)
        
      }
    } catch (error) {
      console.log(error);
    }

  }),

  verifyPayment: asyncHandler(async (req, res) => {
    console.log("verify payment ", req.body);
    try {
      let hmac = crypto.createHmac('sha256', 'j44gx6znDQHHOLOebYixLt0W')
      hmac.update(req.body.payment.razorpay_order_id + '|' + req.body.payment.razorpay_payment_id)
      hmac = hmac.digest('hex')
      if (hmac == req.body.payment.razorpay_signature) {
        console.log("Your Order success");
        const id = req.user
        const { name, email, phone, address, country, state, zip, area } = req.session.orderBody
        let userCart = await Cart.findOne({ orderby: id })

        let newOrder = await new Order({
          products: userCart.products,
          address: {
            name: name,
            email: email,
            phone: phone,
            address: address,
            country: country,
            state: state,
            area: area,
            zip: zip,

          },
          paymentIntent: {
            id: uniqid(),
            method: "ONLINE PAYMENT",
            amount: req.session.amount,
            status: "Paid",
            currency: "Rupees",
          },
          orderDate: Date.now(),
          orderStatus: "Processing",
          orderby: id

        })
        newOrder.save();

        for (let i = 0; i < userCart.products.length; i++) {
          await Product.updateOne({ _id: userCart.products[i].product._id }, 
            { 
              $inc: { quantity: -1 * userCart.products[i].quantity,
                 sold: 1 * userCart.products[i].quantity } });
        }

        await userCart.remove()

        res.json({ status: true })
      }
    } catch (error) {
      console.log(error);
      res.json(error, { msg: true })
    }

  }),
  viewOrder: asyncHandler(async (req, res) => {
    const id = req.user;

    try {
      const order = await Order.find({ orderby: id }).populate('products.product').lean().exec()
      console.log("order", order);
      res.render("viewOrder", { order })
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("not found")
    }
  }),

  orderPlaced: asyncHandler(async (req, res) => {
    res.render("orderPlaced")
  }),


  getAllOrders: asyncHandler(async (req, res) => {
    const id = req.user;

    try {
      const order = await Order.find()
        .populate('products.product')
        .populate('orderby', 'username email')
        .lean()
        .exec();

      for (const i of order) {
        i.createdAt = new Date(i.createdAt).toLocaleString();
      }
      res.render("admin/orderManagement", { order })


    } catch (error) {
      res.status(404)
      console.log(error);
    }



  }),
  getEditOrder: asyncHandler(async (req, res) => {
    try {
      const _id = req.params.id
      const order = await Order.findOne({ _id: _id }).populate('products.product')
        .populate('orderby', 'username email')
        .lean()
        .exec();
      console.log(order);
      res.render("admin/editOrder", { order })

    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("not found")
    }

  }),
  updateOrder: asyncHandler(async (req, res) => {
    console.log(req.body);
    try {
      const { status } = req.body
      const { id } = req.params

      const updatedOrder = await Order.findByIdAndUpdate(id,
        {
          orderStatus: status,
        },
        { new: true })

      // res.json(updatedOrder)
      res.redirect("/admin/orders")
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("not found")
    }
  }),
  getOrderDetails: asyncHandler(async (req, res) => {
    try {
      const _id = req.params.id
      const order = await Order.findOne({ _id: _id }).populate('products.product')
        .populate('orderby', 'username email')
        .lean()
        .exec();
      console.log(order.products[0].product.name);
      res.render("admin/orderDetails", { order })

    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("not found")
    }

  }),




}


module.exports = orderController;