const express = require("express");
const { addToCart, getAllCart, deleteCart, userCart, getUserCart, emptyCart, applyCoupon } = require("../controllers/cartController");
const { addOrder, createOrder, getOrder } = require("../controllers/orderController");
const { addToWishlist, getWishlist } = require("../controllers/productController");
const { registerUser, loginUser, getAllUsers, userLogout, saveAddress, login, getHomePage, registerPage, profile, getLandingPage } = require("../controllers/userController");
const verifyUser = require("../middleware/veryfyuser");
const router = express.Router();


router.get("/register",registerPage)
router.post("/register",registerUser)
router.get("/login",login);
router.post("/login",loginUser);
router.get("/logout",userLogout)
// router.get("/", getAllUsers  )
router.get("/", getLandingPage )
router.get("/home", getHomePage  )
router.get("/users",verifyUser, getAllUsers  )
router.post("/address",verifyUser ,saveAddress)
router.get("/profile",verifyUser ,profile)


router.put("/wishlist",verifyUser,addToWishlist  )
router.get("/wishlist",verifyUser,getWishlist  )

router.post("/cart", verifyUser , userCart  )
router.get("/cart", verifyUser , getUserCart  )
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