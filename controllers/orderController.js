
const asyncHandler = require("express-async-handler");
const uniqid = require("uniqid")
const Order = require('../model/orderModel')
const User = require('../model/userModel')
const Cart = require('../model/cartModel')
const Product = require('../model/productModel')
const Razorpay = require('razorpay');
const crypto = require("crypto");


var instance = new Razorpay({
  key_id: 'rzp_test_9dkcXL2B2Z4Ctj',
  key_secret: 'j44gx6znDQHHOLOebYixLt0W',
});



const orderController = {

  getCheckoutPage: asyncHandler(async (req, res) => {
    const id = req.user
    req.session.checkoutAddress = true
    try {

      const cart = await Cart.findOne({ orderby: id }).populate('products.product').lean();
      const user = await User.findById(id).lean();

      const outOfStockProducts = cart.products.filter(p => (p.product.quantity - p.quantity) < 1);

      if (outOfStockProducts.length > 0) {
        req.session.outOfStock = true;
        req.session.outOfStockProducts = outOfStockProducts.map(p => p.product.name);

        return res.redirect('/cart');
      }
      res.render('checkout', { cart, user });

    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("not found")
    }
  }),




  createOrder: asyncHandler(async (req, res) => {

    const { paymentMethod } = req.body

    let { address } = await User.findOne(
      { "address.id": req.body.addressId },
      { _id: 0, address: { $elemMatch: { id: req.body.addressId } } }
    );

    const id = req.user;

    if (!paymentMethod || !address) {
      res.status(404)
      throw new Error("Address Is mandatory")
    }
    let status = paymentMethod === 'COD' ? 'placed' : 'pending'
    try {
      const user = await User.findById(id)
      let userCart = await Cart.findOne({ orderby: id })

      let finalAmount = userCart.totalAfterDiscount ? userCart.totalAfterDiscount : userCart.cartTotal;

      if (paymentMethod == "ONLINE") {
        req.session.orderBody = address;
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
          address: address[0],
          paymentIntent: {
            id: uniqid(),
            method: "COD",
            amount: finalAmount,
            status: "Cash on Delivery",
            currency: "Rupees",
          },
          orderDate: Date.now(),
          orderStatus: "Processing",
          orderby: user._id

        })
        newOrder.save();

        console.log("new Order", newOrder);
        for (let i = 0; i < userCart.products.length; i++) {

          await Product.updateOne({ _id: userCart.products[i].product._id }, { $inc: { quantity: -1 * userCart.products[i].quantity, sold: 1 * userCart.products[i].quantity } });
        }
        console.log("succuss");

        await userCart.remove();
        res.json(status = false)

      }
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("not found")

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
        console.log("sdfsae", req.session.orderBody);

        let userCart = await Cart.findOne({ orderby: id })

        let newOrder = await new Order({
          products: userCart.products,
          address: req.session.orderBody[0],
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
              $inc: {
                quantity: -1 * userCart.products[i].quantity,
                sold: 1 * userCart.products[i].quantity
              }
            });
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
        .sort("-createdAt")
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
      console.log(order);
      res.render("admin/orderDetails", { order })

    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("not found")
    }

  }),
  returnOrder: asyncHandler(async (req, res) => {
    console.log("retun", req.params)
  
    try {

      const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
          $set: { orderStatus:"Returned" }
        }, { new: true })
        console.log(updatedOrder);
      res.redirect("back")
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("Not found")
    }


  })


}


module.exports = orderController;