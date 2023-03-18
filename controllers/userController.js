const asyncHandler = require("express-async-handler")
const bcrypt = require("bcrypt")
const User = require("../model/userModel");
const Product = require("../model/productModel");
const sentOTP = require("../services/otp");
const otpGenerator = require("otp-generator");
const Category = require("../model/categoryModel")
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

    const products = await Product.find({ unlist: false }).lean()
    if (req.session.user) {
      Log = req.session.user;
      res.render("homepage.hbs", { products, Log })
    }
    res.render("homepage.hbs", { products })

  } catch (error) {
    res.status(404)
    throw new Error("Not found")
  }


})


const profile = asyncHandler(async (req, res) => {
  const id = req.user

  try {
    const profile = await User.findById(id).lean()

    res.render("newProfile", { profile })
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

  const { firstname, lastname, phone, pincode, address, state, locality, city } = req.body
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

  } catch (error) {
    res.status(404)
    throw new Error("Not found")
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