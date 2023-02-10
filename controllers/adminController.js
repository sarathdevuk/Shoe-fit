const asyncHandler = require("express-async-handler")
const User = require("../model/userModel");



const adminController = {


  // @admin Login
  // routes admin/login

  adminLogin: asyncHandler(async (req, res) => {
    let Email = "admin@gmail.com"
    let Password = "123"
    const { email, password } = req.body;
    if (email == Email && password == Password) {
      res.json({ message: "admin dashboard" })
    }

    res.json({ message: "admin login error" })

  }),
  // desc Get all user list on dashboard
  // routes users/dashboard;

  getAllUsers: asyncHandler(async (req, res) => {
    const user = await User.find();
    res.status(200).json(user)
  }),

  userBan: asyncHandler(async (req, res) => {
    const _id = req.params.id
    await User.findByIdAndUpdate(_id, { $set: { ban: true } },
      function (err, data) {
        if (err) {
          res.json({ message: "Error" })
        } else {
          res.json({ message: "User Banned" })
        }

      })

  }),
  // userUnBan : asyncHandler(async (req, res) => {
  //   const _id = req.params.id
  //   await User.findByIdAndUpdate(_id, { $set: { ban: false } },
  //     function (err, data) {
  //       if (err) {
  //         res.json({ message: "Error" })
  //       } else {
  //         res.json({ message: "User Unbanned" })
  //       }

  //     })

  // }),

  userUnBan :  asyncHandler(async (req, res) => {
    
        const _id = req.params.id
      const ban =  await User.findByIdAndUpdate(_id, {$set: {ban: false}} )
         if(!ban){
            res.json({message: "not banned"})
         }else{
          res.json({message:"user unbanned"})
         }
}),



}


module.exports = adminController