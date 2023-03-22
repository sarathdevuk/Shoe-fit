const asyncHandler = require("express-async-handler")
const bcrypt = require("bcrypt")
const User = require("../model/userModel");
const Product = require("../model/productModel");
const sentOTP = require("../services/otp");
const otpGenerator = require("otp-generator");
const Category = require("../model/categoryModel")
const Offer = require("../model/offerModel")
const Cart = require("../model/cartModel")
const uniqid = require("uniqid");
const { query } = require("express");


// let otp = Math.floor(Math.random() * 1000000)




let otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false, })
// desc Register users
//@routes GET/ api/admin/register

const registerPage = (req, res) => {
  if (req.session.uer) {
    res.redirect("/")
  }
  res.render("signup.hbs")
}

const registerUser = asyncHandler(async (req, res) => {

  const { username, email, cfmPassword, password } = req.body
  if (!username || !email || !password || !cfmPassword) {
    res.status(400)
    throw new Error("All fields are mandatory")
  }
  // // to find the same person with the email

  const userAvailable = await User.findOne({ email })
  if (userAvailable) {
    res.status(404);
    throw new Error("The user already registered! ")
  }
  //  check both password
  if (cfmPassword == password) {
    req.session.UserDetails = req.body

  } else {
    res.render('signup', { err: true, message: "password and confirmed password does not macth.!" })
  }
  sentOTP(req.body.email, otp)
  req.session.email = req.body.email
  req.session.otp = otp
  res.redirect("/submitOtp")

})

const submitOtp = asyncHandler((req,res)=>{
  console.log("sufdksfhj");
  if(req.session.error){
    res.render("submitOtp",{error:true})
    req.session.error=null
  }else{
    res.render("submitOtp")
  }
})


const resendOtp =  asyncHandler((req, res) => {
  try {
     req.session.otp=null

      sentOTP(req.session.email, otp)
      req.session.otp = otp;
      var countDownTime = 60000; 1
      setTimeout(() => {
          otp = undefined;
      }, countDownTime);
      res.redirect("/submitOtp");
      console.log("resend otp" + otp);
  } catch (error) {
      console.error(error)
      res.status(404)
      throw new Error("not found")
  }


})


const verifyOtp = asyncHandler(async (req, res) => {
  console.log("verue");
  const { username, email,phone, password } = req.session.UserDetails
   console.log(phone);
  try {
    
    if (req.session.otp == req.body.otp) {
      console.log("verified");
      const hashedPassword = await bcrypt.hash(password, 10)
  
      const user = await User.create({
        username,
        email,
        phone,
        password: hashedPassword,
      });
      req.session.user = user
      res.redirect("/")
  
    } else {
      req.session.error =true
      res.redirect("/submitOtp")
    }
  } catch (error) {
    console.log(error);
    res.status(404)
   throw new Error("OTP ERROR")
  }


})



const getForgotPass = async (req, res) => {
  if (req.session.otpPage) {
    res.render("forgotPass", { otpPage: true })
    req.session.otpPage = false

  } else if (req.session.changePassword) {
    res.render("forgotPass", { changePassword: true })
    req.session.changePassword = false

  } else if (req.session.invalidEmail) {
    res.render("forgotPass", { mail: true, error: true })
  } else
    res.render("forgotPass", { mail: true })
}
const sendForgotOtp = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
      req.session.invalidEmail = true
      res.redirect("/forgot")
    } else {
      sentOTP(req.body.email, otp)
      req.session.forgotOtp = otp
      req.session.forgotBody = req.body
      req.session.otpPage = true
      res.redirect("/forgot")
    }


  } catch (error) {

    res.status(404)
    throw new Error("not found")
  }


}
const verifyForgotOtp = async (req, res) => {
  if (req.body.otp == req.session.forgotOtp) {
    req.session.changePassword = true
    res.redirect("/forgot")

  } else
    res.render("forgotPass", { error: true, message: "Wrong Otp" })

}
const resetPassword = async (req, res) => {
  const { password, cfmPassword } = req.body;
  if (password != cfmPassword) {
    res.render("forgotPass", { error: true, message: "password Mismatch.!" })
  }
  const { email } = req.session.forgotBody
  const user = await User.findOne({ email })
  const hashedPassword = await bcrypt.hash(password, 10)

  const updatePassword = await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } })

  res.redirect("/login")




}



// desc Login user
//@routes GET/ api/admin/login

const getLogin = ((req, res) => {
  if (req.session.user) {
    res.redirect('/')
  }
  else
    res.render("login")

})


const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });


  if (user && (await bcrypt.compare(password, user.password))) {
    if (user.ban) {
      res.render('login', { err: true, message: "Sorry You are Banned !!!" })
    } else {
      req.session.user = user;
      res.redirect('/')
    }

  } else
    res.render('login', { err: true, message: "Invalid Email or Password.!" })

})


const userLogout = asyncHandler(async (req, res) => {
  req.session.user = null
  res.redirect("/")
})



const shopPage = asyncHandler(async (req, res) => {

  try {
    // Filtering 
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields", "search"];
    excludeFields.forEach((el) => delete queryObj[el]);


    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find({ ...JSON.parse(queryStr), unlist: false }).lean();
    // Searching
    if (req.query.search) {

      const searchRegex = new RegExp(req.query.search, "i");
      query = query.find({ $or: [{ name: searchRegex }, { description: searchRegex }] });
    }


    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // pagination
    const page = req.query.page;
    const limit = 4;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const productCount = await Product.countDocuments({ unlist: false });
    const totalPage = Math.ceil(productCount / limit);
    let pagination = [];

    for (let i = 1; i <= totalPage; i++) {
      pagination.push(i)
    }

    if (req.query.page) {
      if (skip >= productCount) throw new Error("This Page does not exists");
    }

    const products = await query.lean();
    const category = await Category.find({ unlist: false }).lean();


    res.render("shopPage", { products, category, pagination })

  } catch (error) {

    res.status(404)
    throw new Error("not found");

  }

})
const getHomePage = asyncHandler(async (req, res) => {

  try {

    const limit = 8; // limit to 10 products/offers per page
    const page = req.query.page || 1;

    const [products, offer] = await Promise.all([
      Product.find({ unlist: false })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Offer.find({ unlist: false })
        .lean(),
    ]);

    if (req.session.user) {
      const cartCount = await Cart.countDocuments({ orderBy: req.session.user._id }).lean();
      const Log = req.session.user;
      //  const WishCount= req.session.user.wishlist.length 
      //  console.log(WishCount);
      return res.render("homepage", { products, offer, cartCount, Log });
    }

    return res.render("homepage", { products, offer });


  } catch (error) {
    res.status(404)
    throw new Error("Not found")
  }


})


const profile = asyncHandler(async (req, res) => {
  const id = req.user

  try {

    const profile = await User.findById(id).lean()


    if (req.session.addressMax) {

      res.render("newProfile", { profile, error: true, message: "Maximum 3 address..! " })
      req.session.addressMax = null;

    } else {

      res.render("newProfile", { profile })
    }
  } catch (error) {
    console.log(error);
    res.status(404)
    throw new Error("Not found")
  }

})

const addAddress = (req, res) => {
  res.render("addAddress")
}
const postAddress = asyncHandler(async (req, res) => {
  console.log(req.body);

  const { firstname, lastname, phone, pincode, address, state, locality, city } = req.body
  const id = req.user
  try {
    const user = await User.findById(id)

    if (user.address.length >= 3) {
      req.session.addressMax = true
      return res.redirect("/profile")
    } else {
      let object = {
        id: uniqid(),
        firstname,
        lastname,
        phone,
        address,
        pincode,
        state,
        locality,
        city,
      }

      user.address.push(object);

      await user.save()
      if (req.session.checkoutAddress) {
        res.redirect("/checkout")
        req.session.checkoutAddress = null;
      } else {
        res.redirect("/profile")
      }

    }


  } catch (error) {
    console.log(error);
    res.status(404)
    throw new Error("Not found")
  }

})

const updateProfile = asyncHandler(async (req, res) => {

  const id = req.user
  try {

    await User.updateOne(
      { _id: id },
      {
        $set: {
          username: req.body.name,
          phone: req.body.phone,
        },
      }
    );


    res.redirect("/profile")

  } catch (error) {
    console.log(error);
    res.status(404)
    throw new Error("Not Found")
  }

})
const getEditAddress = asyncHandler(async (req, res) => {


  try {

    let { address } = await User.findOne(
      { "address.id": req.params.id },
      { _id: 0, address: { $elemMatch: { id: req.params.id } } }
    );

    res.render("editAddress", { address: address[0] })


  } catch (error) {
    console.log(error);
    res.status(404)
    throw new Error("Page not found")
  }

})
const updateAddress = asyncHandler(async (req, res) => {
  const id = req.user

  try {

    await User.updateOne(
      { _id: id, address: { $elemMatch: { id: req.body.id } } },
      {
        $set: {
          "address.$": req.body,
        },
      }
    );
    if (req.session.checkoutAddress) {

      res.redirect("/checkout")
    } else {

      res.redirect("/profile")
    }

  } catch (error) {

    res.status(404)
    throw new Error("Not found")
  }

})
const deleteAddress = asyncHandler(async (req, res) => {
  const id = req.user;


  try {
    const result = await User.updateOne(
      { _id: id },
      { $pull: { address: { id: req.params.id } } }
    );

    res.redirect("/profile");
  } catch (error) {
    console.log(error);
    res.status(404)
    throw new Error("Not Found");
  }

})


module.exports =
{
  registerUser,
  loginUser,
  userLogout,
  addAddress,
  postAddress,
  getLogin,
  getHomePage,
  shopPage,
  registerPage,
  profile,
  submitOtp,
  resendOtp,
  verifyOtp,
  getForgotPass,
  sendForgotOtp,
  verifyForgotOtp,
  resetPassword,
  updateProfile,
  getEditAddress,
  updateAddress,
  deleteAddress,

}