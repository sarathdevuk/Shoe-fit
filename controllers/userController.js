const asyncHandler = require("express-async-handler")
const bcrypt = require("bcrypt")
const User = require("../model/userModel");
const Product = require("../model/productModel");



// desc Register users
//@routes GET/ api/admin/register

const registerPage = (req,res)=> {
  res.render("signup.hbs")
}

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
    res.redirect('/login')
    // res.status(201).json({ _id: user.id, email: user.email })
  } else {
    res.status(400)
    throw new Error("User data is not valid")
  }

  res.json({ message: "Register the user" })
})
// desc Login user
//@routes GET/ api/admin/login

const getLogin = ((req, res) => {

  res.render("login")
    
})


const loginUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  // if (!email || !password){
  //   res.status(400);
  //   throw new Error("All fields are mandatory")
  // }
  const user = await User.findOne({ email});

  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.user =  user;
    res.redirect('/')
  }else
   res.render('login', {  err:true , message:"Invalid Email or Password.!" })

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

console.log("this is user id",req.user);
  const user =await User.findById(req.user.id);
  console.log(user);
  // res.status(200).json(user)

  
});

const getLandingPage = asyncHandler(async(req,res)=>{
  const products = await Product.find().lean()
  // console.log("product",products);
  res.render("landingPage",{products})
  

})
const getHomePage = asyncHandler(async(req,res)=>{

  try {

    const products = await Product.find().lean()
    if(req.session.user){
        Log= req.session.user;
        res.render("homepage.hbs",{products,Log})
    }
    res.render("homepage.hbs",{products})

  } catch (error) {
    console.log(error);
  }
   
  
 

})

const saveAddress = asyncHandler(async (req, res) => {
     const {id}=req.user
    //  const{address}= req.body;

     try {
      
     const user = await User.findByIdAndUpdate(id,req.body,
      {new:true})
     res.json(user)
     } catch (error) {
      console.log(error);
     }

  })


  const profile= asyncHandler(async(req,res)=>{
        const {id}= req.user

        try {
          const userProfile = await User.findById(id)
          res.json(userProfile)

        } catch (error) {
          console.log(error);
        }



  })

module.exports = { registerUser, loginUser, userLogout, getAllUsers,saveAddress , getLogin , getHomePage,getLandingPage, registerPage, profile }