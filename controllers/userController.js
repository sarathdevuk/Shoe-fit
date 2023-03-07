const asyncHandler = require("express-async-handler")
const bcrypt = require("bcrypt")
const User = require("../model/userModel");
const Product = require("../model/productModel");
const sentOTP = require("../services/otp");
const otpGenerator = require("otp-generator");
const Category = require("../model/categoryModel")
const uniqid = require("uniqid")


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

  console.log(req.body);

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
  //  Hash password
  if (cfmPassword == password) {
    req.session.UserDetails = req.body

  } else {
    res.render('signup', { err: true, message: "password and confirmed password does not macth.!" })
  }
  sentOTP(req.body.email, otp)
  req.session.otp = otp
  res.render("submitOtp")

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
  if (req.session.otpPage) {
    res.render("forgotPass", { otpPage: true })
    req.session.otpPage = false

  } else if (req.session.changePassword) {
    res.render("forgotPass", { changePassword: true })
    req.session.changePassword = false

  }
  res.render("forgotPass", { mail: true })
}
const sendForgotOtp = async (req, res) => {
  sentOTP(req.body.email, otp)
  req.session.forgotOtp = otp
  req.session.forgotBody = req.body
  req.session.otpPage = true
  res.redirect("/forgot")

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
  console.log(user._id);
  const updatePassword = await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } })
  console.log(updatePassword);
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
  console.log(req.body);
  const { email, password } = req.body;

  // if (!email || !password){
  //   res.status(400);
  //   throw new Error("All fields are mandatory")
  // }
  const user = await User.findOne({ email });
  console.log("user", user);

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

// desc Current user info
//@routes GET/ api/admin/current
//@access private
const userLogout = asyncHandler(async (req, res) => {
  req.session.user = null
  res.redirect("/")
})

const getAllUsers = asyncHandler(async (req, res) => {

  console.log("this is user id", req.user);
  const user = await User.findById(req.user.id);
  console.log(user);
  // res.status(200).json(user)


});

const shopPage = asyncHandler(async (req, res) => {

  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

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
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This Page does not exists");
    }
    const products = await query.lean()
    const category = await Category.find().lean()
    console.log("category", category[0].name);
    // res.json(product);
    res.render("shopPage", { products, category })

  } catch (error) {
    console.log(error);
    res.status(404)
    throw new Error("not found");

  }

})
const getHomePage = asyncHandler(async (req, res) => {

  try {

    const products = await Product.find({ unlist: false }).lean()
    if (req.session.user) {
      Log = req.session.user;
      res.render("homepage.hbs", { products, Log })
    }
    res.render("homepage.hbs", { products })

  } catch (error) {
    console.log(error);
  }


})


const profile = asyncHandler(async (req, res) => {
  const id = req.user

  try {
    const profile = await User.findById(id).lean()
    console.log("userprofile", profile);

    // res.json(userProfile)
    res.render("newProfile", { profile })
  } catch (error) {
    console.log(error);
  }

})

const addAddress = (req, res) => {
  res.render("addAddress")
}
const postAddress = asyncHandler(async (req, res) => {

  const { firstname, lastname, phone, pincode, address, state, locality, city } = req.body
  console.log(req.body);
  const id = req.user
  try {
    const user = await User.findById(id)

    let object = {
      id: uniqid(),
      firstname,
      lastname,
      phone,
      address,
      pincode,
      state,
      locality,
      city
    }
    user.address.push(object);


    await user.save()
    res.redirect("/profile")

  } catch (error) {
    console.log(error);
  }

})

const updateProfile = asyncHandler(async (req, res) => {

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

    res.redirect("/profile")

  } catch (error) {
    console.log(error);
    res.status(404)
    throw new Error("Not Found")
  }

})
const getEditAddress = asyncHandler(async (req, res) => {
  console.log("edit address Page");
  // const id = req.user
  try {

    let { address } = await User.findOne(
      { "address.id": req.params.id },
      { _id: 0, address: { $elemMatch: { id: req.params.id } } }
    );
    console.log("addresss", address);
    res.render("editAddress", { address: address[0] })


  } catch (error) {
    console.log(error);
    res.status(404)
    throw new Error("Page not found")
  }

})
const updateAddress = asyncHandler(async (req, res) => {
  const id = req.user
  console.log("req.body", req.body);
  try {

    await User.updateOne(
      { _id: id, address: { $elemMatch: { id: req.body.id } } },
      {
        $set: {
          "address.$": req.body,
        },
      }
    );

    res.redirect("/profile")

  } catch (error) {
    console.log(error);
    res.status(404)
    throw new Error("Not found")
  }

})
const deleteAddress = asyncHandler(async (req, res) => {
  const id = req.user;

  try {
    await User.updateOne(
      {
        _id: id,
        address: { $elemMatch: { id: req.params.id } },
      },
      {
        $pull: {
          address: {
            id: req.params.id,
          },
        },
      }
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
  getAllUsers,
  addAddress,
  postAddress,
  getLogin,
  getHomePage,
  shopPage,
  registerPage,
  profile,
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