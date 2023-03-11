const asyncHandler = require("express-async-handler")
const User = require("../model/userModel");
const Admin = require("../model/adminModel");
const Order = require("../model/orderModel");





const adminController = {
  getAdminDash: (req, res) => {
    console.log("GEt admin dash", req.session.admin)
    if (req.session.admin) {
      res.render("admin/dash")
    } else {
      res.redirect("/admin/login")

    }


  },

  // @admin Login
  // routes admin/login
  getAdminLogin: (req, res) => {
    if (req.session.admin) {
      res.redirect("/admin")
    } else {
      res.render("admin/adminlogin")
    }

  },

  adminLogin: asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    console.log("login Details", req.body);

    const admin = await Admin.findOne({ email })
    if (!admin) {
      res.render("admin/adminLogin", { error: true, message: "Invalid email or password" })

    }

    if (admin.email === email && admin.password === password) {
      req.session.admin = true
      res.redirect("/admin")
    } else {
      console.log("else error");
      res.render("admin/adminLogin", { error: true, message: "Invalid email or password" })
    }

  }),
  adminLogout: (req, res) => {

    res.redirect("/admin/login")
    req.session.admin = null
  },
  // desc Get all user list on dashboard
  // routes users/dashboard;

  getAllUsers: asyncHandler(async (req, res) => {
    const user = await User.find().lean()
    res.status(200)
    res.render("admin/userManagement", { user })
  }),

  userBan: asyncHandler(async (req, res) => {
    const _id = req.params.id
    const ban = await User.findByIdAndUpdate(_id, { $set: { ban: true } },)
    req.session.user = null
    res.redirect("/admin/users")
  }),

  userUnBan: asyncHandler(async (req, res) => {

    const _id = req.params.id
    const ban = await User.findByIdAndUpdate(_id, { $set: { ban: false } })
    res.redirect("/admin/users")

  }),
  salesReport: asyncHandler(async (req, res) => {
    try {

      res.render("admin/salesReport")
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("Page not found");
    }
  }),
  getAdminSalesReport:asyncHandler( async (req, res) => {
    try {
      const start = req.query.start
      const end = req.query.end
      let orders

      let deliveredOrders
      let salesCount
      let salesSum
      let result
      if (start) {
        orders = await Order.find({ paymentIntent: { created: { $gte: start, $lt: end } } }).lean()
        console.log("orders", orders);

        deliveredOrders = orders.filter(order => order.orderStatus === "Delivered")
        salesCount = await Order.countDocuments({ paymentIntent: { created: { $gte: start, $lt: end } } }, { orderStatus: "Delivered" })
        salesSum = deliveredOrders.reduce((acc, order) => acc + order.totalPrice, 0)

      } else {

        deliveredOrders = await Order.find({ orderStatus: "Delivered" }).populate("products.product").lean()
        for (const i of deliveredOrders) {
          i.createdAt = new Date(i.createdAt).toLocaleString();
        }

        salesCount = await Order.countDocuments({ orderStatus: "Delivered" })


        result = await Order.aggregate([
          {
            $match: { orderStatus: "Delivered" }
          },
          {
            $group: { _id: null, totalPrice: { $sum: '$paymentIntent.amount' } }
          }])
        console.log("result", result);

        salesSum = result[0]?.totalPrice
        console.log("salessum", salesSum);
      }
      const users = await Order.distinct('orderby')
      const userCount = users.length

      res.render("admin/salesReport", { userCount, salesCount, salesSum, deliveredOrders })

    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("cant get")
    }
  }),

 
}




module.exports = adminController