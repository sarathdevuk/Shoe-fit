const asyncHandler = require("express-async-handler")
const bcrypt = require("bcrypt")
const User = require("../model/userModel");



// desc Register users
//@routes GET/ api/admin/register

const registerUser = asyncHandler(async (req, res) => {
  
  console.log(req.body);

  const { username, email, password } = req.body
  // if (!username || !email || !password) {
  //   res.status(400)
  //   throw new Error("All fields are mandatory")
  // }
  // // to find the same person with the email

  // const userAvailable = await User.findOne({ email })
  // if (userAvailable) {
  //   res.status(400);
  //   throw new Error("The user already registered! ")
  // }
  //  Hash password
  const hashedPassword = await bcrypt.hash(password, 10)
  console.log("hashed password :", hashedPassword);
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });
  console.log(`user created ${user}`);
  if (user) {

    res.status(201).json({ _id: user.id, email: user.email })
  } else {
    res.status(400)
    throw new Error("User data is not valid")
  }

  res.json({ message: "Register the user" })
})
// desc Login user
//@routes GET/ api/admin/login

const loginUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory")
    
  }
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.user = {
      id: user._id
  }
  console.log(req.session.user);
   res.json({ message: "logged the user" })

  }
    
})
// desc Current user info
//@routes GET/ api/admin/current
//@access private
const userLogout = asyncHandler(async (req, res) => {
  req.session.destroy();
  res.json({ message: "User logged out" })
})

const getAllUsers = asyncHandler(async (req, res) => {
//  res.json({message: " home"})
console.log("this is user id",req.user);
  const user =await User.findById(req.user.id);
  console.log(user);
  res.status(200).json(user)
});

const saveAddress = asyncHandler(async (req, res) => {
     const {id}=req.user
     const{address}= req.body;

     try {
      
     const user = await User.findByIdAndUpdate(id,req.body,
      {new:true})
     res.json(user)
     } catch (error) {
      console.log(error);
     }

  })

module.exports = { registerUser, loginUser, userLogout, getAllUsers,saveAddress }