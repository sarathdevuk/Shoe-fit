const express = require("express");
const { searchProduct } = require("../controllers/adminController");
const { addToCart, getAllCart, deleteCart, userCart, getUserCart, emptyCart, applyCoupon, deleteCartItem, changeQuantity, applyWallet } = require("../controllers/cartController");
const { addOrder, createOrder, getOrder, getCheckoutPage, verifyPayment, viewOrder, orderPlaced, returnOrder, cancelOrder } = require("../controllers/orderController");
const { addToWishlist, getWishlist, getProductById, deleteWishlist, searchProducts } = require("../controllers/productController");
const { registerUser, loginUser, getAllUsers, userLogout, saveAddress, getLogin, getHomePage, registerPage, profile, getLandingPage, verifyOtp, getforgotPass, getForgotPass, sendForgotOtp, verifyForgotOtp, changePassword, resetPassword, updateProfile, addAddress, postAddress, getEditAddress, updateAddress, shopPage, deleteAddress } = require("../controllers/userController");
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

router.get("/shop",shopPage )
router.get("/", getHomePage  )

// router.post("/address",verifyUser ,saveAddress)
router.get("/profile",verifyUser ,profile)
router.get("/address",verifyUser ,addAddress)
router.post("/address",verifyUser ,postAddress)
router.get("/editAddress/:id",verifyUser ,getEditAddress)
router.post("/editAddress/",verifyUser ,updateAddress)
router.post("/update-profile",verifyUser ,updateProfile)
router.get("/deleteAddress/:id",verifyUser ,deleteAddress)


router.get("/wishlist/:id",verifyUser,addToWishlist  )
router.get("/wishlist",verifyUser,getWishlist  )
router.get("/wishlist-remove/:id",verifyUser,deleteWishlist   )
router.get("/productDetails/:id",getProductById  )
router.get("/cart", verifyUser , getUserCart  )
router.get("/cart/:id", verifyUser , userCart  )
router.get("/delete-cart/:id", verifyUser , deleteCartItem  )
router.post("/change-product-quantity", verifyUser , changeQuantity  )
router.get("/emptyCart",verifyUser, emptyCart)

router.post("/applyCoupon" ,verifyUser, applyCoupon  )
router.post("/applyWallet" ,verifyUser, applyWallet  )
router.get("/checkout" ,verifyUser, getCheckoutPage  )
// filter

router.get("/" ,verifyUser, getCheckoutPage  )
router.get("/query" ,verifyUser, getCheckoutPage  )
router.post("/search-product" ,verifyUser, getCheckoutPage  )



// @Orders

router.post("/cash-order",verifyUser ,createOrder);
router.get("/orderPlaced",verifyUser ,orderPlaced);
router.get("/viewOrder",verifyUser,viewOrder)
router.post("/verify-payment",verifyUser, verifyPayment)
router.get("/return-order/:id",verifyUser, returnOrder)
router.get("/cancel-order/:id",verifyUser, cancelOrder)



module.exports= router;