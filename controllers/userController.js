const asyncHandler = require("express-async-handler")
const bcrypt = require("bcrypt")
const User = require("../model/userModel");
const Product = require("../model/productModel");
const sentOTP = require("../services/otp");
const otpGenerator = require("otp-generator")

// let otp = Math.floor(Math.random() * 1000000)




let otp = otpGenerator.generate(6,{ upperCaseAlphabets: false, lowerCaseAlphabets:false,  specialChars: false,})
// desc Register users
//@routes GET/ api/admin/register

const registerPage = (req, res) => {
  if(req.session.uer){
    res.redirect("/")
  }
  res.render("signup.hbs")
}

const registerUser = asyncHandler(async (req, res) => {

  console.log(req.body);

  const { username, email, cfmPassword, password } = req.body
  if (!username || !email || !password || !cfmPassword) {
    res.status(400)
    throw new Error("All fields are mandatory")
  }
  // // to find the same person with the email

  const userAvailable = await User.findOne({ email })
  if (userAvailable) {
    res.status(400);
    throw new Error("The user already registered! ")
  }
  //  Hash password
  if (cfmPassword == password) {
    req.session.UserDetails = req.body

  } else {
    res.render('signup', { err: true, message: "password and confirmed password does not macth.!" })
  }
  sentOTP(req.body.email, otp)
  req.session.otp = otp
  res.render("submitOtp")

  // const hashedPassword = await bcrypt.hash(password, 10)
  // console.log("hashed password :", hashedPassword);
  // const user = await User.create({
  //   username,
  //   email,
  //   password: hashedPassword,
  // });

  // if (user){
  //   req.session.email = email
  // }
  // console.log(`user created ${user}`);
  // if (user) {
  //   res.redirect('/login')
  //   // res.status(201).json({ _id: user.id, email: user.email })
  // } else {
  //   res.status(400)
  //   throw new Error("User data is not valid")
  // }

  // res.json({ message: "Register the user" })
})

const verifyOtp = asyncHandler(async (req, res) => {
  const { username, email, password } = req.session.UserDetails
  if (req.session.otp == req.body.otp) {
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    req.session.user = user
    res.redirect("/")

  } else {
    res.render("submitOtp", { error: true })
  }


})
const getForgotPass = async (req, res) => {
  if(req.session.otpPage){   
    res.render("forgotPass",{otpPage:true})
  req.session.otpPage=false

  }else if(req.session.changePassword){
    res.render("forgotPass",{changePassword:true})
    req.session.changePassword= false

  }
  res.render("forgotPass",{mail:true})
}
const sendForgotOtp = async (req, res) => {
  sentOTP(req.body.email, otp)
  req.session.forgotOtp = otp
  req.session.forgotBody = req.body
  req.session.otpPage=true
  res.redirect("/forgot")

}
const verifyForgotOtp = async (req, res) => {
  if (req.body.otp == req.session.forgotOtp) {
    req.session.changePassword= true
    res.redirect("/forgot")

  } else
    res.render("forgotPass", { error: true, message: "Wrong Otp" })

}
const resetPassword = async (req, res) => {
  const { password, cfmPassword } = req.body;
  if(password != cfmPassword){
    res.render("forgotPass", {error: true,message: "password Mismatch.!"})
  }
  const { email } = req.session.forgotBody
  const user = await User.findOne({ email })
  const hashedPassword = await bcrypt.hash(password, 10)
  console.log(user._id);
    const updatePassword = await User.updateOne({_id:user._id},{$set:{password:hashedPassword}})
    console.log(updatePassword);
    res.redirect("/login") 

       

     
}



// desc Login user
//@routes GET/ api/admin/login

const getLogin = ((req, res) => {
if(req.session.user){
res.redirect('/')
}
else
  res.render("login")

})


const loginUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  // if (!email || !password){
  //   res.status(400);
  //   throw new Error("All fields are mandatory")
  // }
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.user = user;
    res.redirect('/')
  } else
    res.render('login', { err: true, message: "Invalid Email or Password.!" })

  //  res.json({ message: "logged the user" })

})

// desc Current user info
//@routes GET/ api/admin/current
//@access private
const userLogout = asyncHandler(async (req, res) => {
  req.session.destroy();
  res.redirect("/")
})

const getAllUsers = asyncHandler(async (req, res) => {

  console.log("this is user id", req.user);
  const user = await User.findById(req.user.id);
  console.log(user);
  // res.status(200).json(user)


});

const getLandingPage = asyncHandler(async (req, res) => {
  const products = await Product.find().lean()
  // console.log("product",products);
  res.render("landingPage", { products })


})
const getHomePage = asyncHandler(async (req, res) => {

  try {

    const products = await Product.find().lean()
    if (req.session.user) {
      Log = req.session.user;
      res.render("homepage.hbs", { products, Log })
    }
    res.render("homepage.hbs", { products })

  } catch (error) {
    console.log(error);
  }




})

const saveAddress = asyncHandler(async (req, res) => {
  const { id } = req.user
  //  const{address}= req.body;

  try {

    const user = await User.findByIdAndUpdate(id, req.body,
      { new: true })
    res.json(user)
  } catch (error) {
    console.log(error);
  }

})


const profile = asyncHandler(async (req, res) => {
  const { id } = req.user

  try {
    const userProfile = await User.findById(id)
    res.json(userProfile)

  } catch (error) {
    console.log(error);
  }



})

module.exports =
{
  registerUser,
  loginUser,
  userLogout,
  getAllUsers,
  saveAddress,
  getLogin,
  getHomePage,
  getLandingPage,
  registerPage,
  profile,
  verifyOtp,
  getForgotPass,
  sendForgotOtp,
  verifyForgotOtp,
  resetPassword
}