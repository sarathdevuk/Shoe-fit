const asyncHandler = require("express-async-handler")
const User = require("../model/userModel");
const Admin = require("../model/adminModel");
const Order = require("../model/orderModel");
const Product = require("../model/productModel");





const adminController = {
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
  searchUser: asyncHandler(async (req, res) => {
    try {

      const user = await User.find({
        $or: [
          { username: new RegExp(req.body.username, "i") },
          { email: new RegExp(req.body.username, "i") },
        ],

      }).lean();
      console.log(user);
      res.render("admin/userManagement", { user });

    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("Page not found");
    }
  }),
  searchProduct: asyncHandler(async (req, res) => {
    console.log(req.body);
    try {


      const products = await Product.find({
        $or: [
          { name: new RegExp(req.body.name, "i") },
          { category: new RegExp(req.body.name, "i") },
        ],

      }).lean();

      res.render("admin/productManagement", { products });

    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("Page not found");
    }
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
  getAdminSalesReport: asyncHandler(async (req, res) => {

    console.log("dfaf", req.query.filter);
    try {
      let startDate = new Date(new Date().setDate(new Date().getDate() - 8));
      let endDate = new Date();
      let filter = req.query.filter ?? "";

      if (req.query.startDate) startDate = new Date(req.query.startDate);
      if (req.query.endDate) endDate = new Date(req.query.endDate);

      const currentDate = new Date();
      switch (req.query.filter) {
      
        case 'thisYear':
          startDate = new Date(currentDate.getFullYear(), 0, 1);
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
          break;
        case 'lastYear':
          startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
          endDate = new Date(currentDate.getFullYear() - 1, 11, 31);
          break;
        case 'thisMonth':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
          break;
        case 'lastMonth':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          break;
        default:
          if (!req.query.filter && !req.query.startDate) filter = "lastWeek";
      }

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(24, 0, 0, 0);


      let salesCount = 0;


      let deliveredOrders
      let salesSum
      let result
      if (req.query.startDate || req.query.endDate || req.query.filter ) {
        console.log("inisde query");

        const orders = await Order.find({ createdAt: { $gt: startDate, $lt: endDate } }).sort({ createdAt: -1 }).lean();
        console.log("orders", orders);
        salesCount = orders.length

        deliveredOrders = orders.filter(order => order.orderStatus === "Delivered")
        console.log("delivered", deliveredOrders);
        salesSum = deliveredOrders.reduce((acc, order) => acc + order.paymentIntent.amount, 0)

      } else {
          console.log("else case");
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

  getSalesReport: async (req, res) => {
    let startDate = new Date(new Date().setDate(new Date().getDate() - 8));
    let endDate = new Date();
    let filter = req.query.filter ?? "";

    if (req.query.startDate) startDate = new Date(req.query.startDate);
    if (req.query.endDate) endDate = new Date(req.query.endDate);

    const currentDate = new Date();
    switch (req.query.filter) {
      case 'thisYear':
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        break;
      case 'lastYear':
        startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
        endDate = new Date(currentDate.getFullYear() - 1, 11, 31);
        break;
      case 'thisMonth':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        break;
      case 'lastMonth':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        break;
      default:
        if (!req.query.filter && !req.query.startDate) filter = "lastWeek";
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(24, 0, 0, 0);

    const orders = await orderModel.find({ createdAt: { $gt: startDate, $lt: endDate } }).sort({ createdAt: -1 }).lean();
    let totalOrders = orders.length;
    let totalRevenue = 0;
    let totalPending = 0;
    let deliveredOrders = orders.filter((item) => {
      if (item.orderStatus == "pending" || item.orderStatus == 'outForDelivery') totalPending++;
      totalRevenue = totalRevenue + item.product.price;
      return item.paid;
    });
    let totalDispatch = deliveredOrders.length;

    let orderTable = orders.map(item => [item.product.name, item.total, item.orderStatus, item.quantity, item.createdAt.toLocaleDateString()]);
    // let byCategory = await orderModel.aggregate([{ $match: { createdAt: { $gt: startDate, $lt: endDate } } }, { $group: { _id: "$product.categoryId", count: { $sum: 1 }, price: { $sum: "$product.price" } } }]);
    // let categoryIds = byCategory.map(item => item._id);
    // let categories = await categoryModel.find({ _id: { $in: categoryIds } }, { category: 1 }).lean();
    // categories.forEach((item, index) => {
    //   let category = byCategory.find(c => c._id == item._id);
    //   categories[index].count = category.count;
    //   categories[index].profit = category.price;
    // });
    // let byBrand = await orderModel.aggregate([{ $match: { createdAt: { $gt: startDate, $lt: endDate } } }, { $group: { _id: "$product.brand", count: { $sum: 1 }, profit: { $sum: "$product.price" } } }]);

    res.render("admin/salesReport", {
      orders,
      totalDispatch,
      totalOrders,
      totalPending,
      totalRevenue,
      startDate: moment(new Date(startDate).setDate(new Date(startDate).getDate() + 1)).utc().format('YYYY-MM-DD'),
      endDate: moment(endDate),
    })
  },

  getAdminHome: async (req, res) => {
    try {
      if (!req.session.admin) {
        return res.redirect('/admin/login');
      }

      
      const deliveredOrders = await Order.find({ orderStatus: "Delivered" }).lean();

      let totalRevenue = 0;
      deliveredOrders.forEach(item => {
        totalRevenue += item.paymentIntent.amount;
      });

      const monthlyDataArray = await Order.aggregate([
        { $match: { orderStatus: "Delivered" } },
        { $group: { _id: { $month: "$createdAt" }, sum: { $sum: "$paymentIntent.amount" } } }
      ]);

      let monthlyDataObject = {};
      monthlyDataArray.forEach(item => {
        monthlyDataObject[item._id] = item.sum;
      });

      let monthlyData = [];
      for (let i = 1; i <= 12; i++) {
        monthlyData[i - 1] = monthlyDataObject[i] || 0;
      }

      const onlineOrdersCount = await Order.countDocuments({ "paymentIntent.method": "ONLINE PAYMENT" });
      const codOrdersCount = await Order.countDocuments({ "paymentIntent.method": "COD" });
      const userCount = await User.countDocuments();
      const productCount = await Product.countDocuments();
      const orderCount = await Order.countDocuments();
      const orderData = await Order.find().sort({ _id: -1 }).limit(5).lean()

      const startDate = new Date();
      const endDate = new Date(new Date().setDate(new Date().getDate() - 7));

      const weeklyDataArray = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gt: endDate,
              $lt: startDate
            },
            orderStatus: "Delivered"
          }
        },
        { $group: { _id: { $dayOfWeek: "$createdAt" }, sum: { $sum: "$paymentIntent.amount" } } }
      ]);

      let weeklyDataObject = {};
      weeklyDataArray.forEach(item => {
        weeklyDataObject[item._id] = item.sum;
      });

      let weeklyData = [];
      for (let i = 1; i <= 7; i++) {
        weeklyData[i - 1] = weeklyDataObject[i] || 0;
      }

      res.render("admin/dashboard", {
        weeklyData,
        totalRevenue,
        userCount,
        productCount,
        orderCount,
        orderData,
        monthlyData,
        onlineOrdersCount,
        codOrdersCount
      });

    } catch (error) {
      console.log(error);
      res.status(404);
      throw new Error("page not found");
    }
  }

}




module.exports = adminController