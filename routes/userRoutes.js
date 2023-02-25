const express = require("express");
const { addToCart, getAllCart, deleteCart, userCart, getUserCart, emptyCart, applyCoupon, deleteCartItem } = require("../controllers/cartController");
const { addOrder, createOrder, getOrder } = require("../controllers/orderController");
const { addToWishlist, getWishlist, getProductById } = require("../controllers/productController");
const { registerUser, loginUser, getAllUsers, userLogout, saveAddress, getLogin, getHomePage, registerPage, profile, getLandingPage, verifyOtp, getforgotPass, getForgotPass, sendForgotOtp, verifyForgotOtp, changePassword, resetPassword } = require("../controllers/userController");
const verifyUser = require("../middleware/veryfyuser");
const router = express.Router();


router.get("/register",registerPage)
router.post("/register",registerUser)
router.post("/verifyOtp",verifyOtp)
router.get("/forgot",getForgotPass)
router.post("/sendOtp",sendForgotOtp)
router.post("/submitOtp",verifyForgotOtp)

router.post("/resetpassword",resetPassword)
router.get("/login",getLogin);
router.post("/login",loginUser);
router.get("/logout",userLogout)
// router.get("/", getAllUsers  )
router.get("/sample", getLandingPage )
router.get("/", getHomePage  )
router.get("/users",verifyUser, getAllUsers  )
router.post("/address",verifyUser ,saveAddress)
router.get("/profile",verifyUser ,profile)


router.get("/wishlist/:id",verifyUser,addToWishlist  )
router.get("/wishlist",verifyUser,getWishlist  )
router.get("/productDetails/:id",verifyUser,getProductById  )
router.get("/cart", verifyUser , getUserCart  )
router.post("/cart", verifyUser , userCart  )
router.get("/cart/:id", verifyUser , deleteCartItem  )

router.delete("/cart", verifyUser , emptyCart  )
router.post("/checkout" ,verifyUser, applyCoupon  )

//@cart Routes
// router.post("/cart", addToCart);
// router.get("/cart", getAllCart);
// router.delete("/cart",deleteCart)



// @Orders

router.post("/cash-order",verifyUser ,createOrder);
router.get("/order",verifyUser,getOrder)


module.exports= router;