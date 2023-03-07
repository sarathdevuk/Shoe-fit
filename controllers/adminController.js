const asyncHandler = require("express-async-handler")
const User = require("../model/userModel");
const Admin = require("../model/adminModel");



const adminController = {
 getAdminDash:(req,res) => {
 console.log("GEt admin dash",req.session.admin)
  if(req.session.admin){
    res.render("admin/dash")
  }else{
    res.redirect("/admin/login")

  }

    
 },

  // @admin Login
  // routes admin/login
  getAdminLogin: (req,res)=>{
    if(req.session.admin){
      res.redirect("/admin")
    } else {
      res.render("admin/adminlogin")
    }
   
  },

  adminLogin: asyncHandler(async (req, res) => {
   
    const { email, password } = req.body;
   
        console.log("login Details", req.body);

   const admin = await Admin.findOne({email})
   if (!admin) {
    res.render("admin/adminLogin" ,{error:true , message: "Invalid email or password"})
     
   }

   if(admin.email === email && admin.password === password){
    req.session.admin = true
    res.redirect("/admin")
  } else {
    console.log("else error");
    res.render("admin/adminLogin" ,{error:true , message: "Invalid email or password"})
   }

  }),
  adminLogout:(req,res)=>{

    res.redirect("/admin/login")
    req.session.admin=null
  },
  // desc Get all user list on dashboard
  // routes users/dashboard;

  getAllUsers: asyncHandler(async (req, res) => {
    const user = await User.find().lean()
    res.status(200)
    res.render("admin/userManagement" ,{user})
  }),

  userBan: asyncHandler(async (req, res) => {
    const _id = req.params.id
   const  ban= await User.findByIdAndUpdate(_id, { $set: { ban: true } },)
     res.redirect("/admin/users")
  }),
  
  userUnBan :  asyncHandler(async (req, res) => {
    
        const _id = req.params.id
      const ban =  await User.findByIdAndUpdate(_id, {$set: {ban: false}} )
     res.redirect("/admin/users")
        
}),





}


module.exports = adminController