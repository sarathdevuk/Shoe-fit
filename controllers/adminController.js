const asyncHandler = require("express-async-handler")
const User = require("../model/userModel");
const Admin = require("../model/adminModel");



const adminController = {
 getAdminDash:(req,res) => {
 
  res.render("admin/dash")
 },

  // @admin Login
  // routes admin/login
  getAdminLogin: (req,res)=>{
    res.render("admin/adminlogin")

  },

  adminLogin: asyncHandler(async (req, res) => {
    console.log('started');
    const { email, password } = req.body;
        console.log(req.body);
   const admin = await Admin.findOne({email})
   console.log("adffmin",admin);
   if (!admin){
    res.render("admin/adminlogin" ,{error:true , message: "Invalid email or password"})
   }
   if(admin.email == email && admin.password == password){
    req.session.admin = true
    res.redirect("/admin")

   }

  }),
  // desc Get all user list on dashboard
  // routes users/dashboard;

  getAllUsers: asyncHandler(async (req, res) => {
    const user = await User.find().lean()
    console.log(user);
    res.status(200)

    res.render("admin/userManagement" ,{user})
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