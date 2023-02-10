const express = require("express");
const { addToCart, getAllCart, deleteCart, userCart, getUserCart, emptyCart, applyCoupon } = require("../controllers/cartController");
const { addOrder, createOrder, getOrder } = require("../controllers/orderController");
const { addToWishlist } = require("../controllers/productController");
const { registerUser, loginUser, getAllUsers, userLogout, saveAddress } = require("../controllers/userController");
const verifyUser = require("../middleware/veryfyuser");
const router = express.Router();


router.post("/register",registerUser)
router.post("/login",loginUser);
router.get("/logout",userLogout)
router.get("/", getAllUsers  )
router.get("/home",verifyUser, getAllUsers  )
router.post("/address",verifyUser ,saveAddress)

router.put("/wishlist",verifyUser,addToWishlist  )

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