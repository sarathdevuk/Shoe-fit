const express = require("express")
const multer  = require('multer')
const { getAllUsers, adminLogin, userBan, userUnBan } = require("../controllers/adminController")
const {createCategory, getAllCategory, getCategoryById, updateCategoryById, deleteCategoryById} = require("../controllers/categoryController")
const { createCoupon, getAllCoupon, updateCoupon, deleteCoupon } = require("../controllers/couponController")
const { getOrders, editOrder, getOrderbyId, getOrder, updateOrder } = require("../controllers/orderController")
const { getAllProduct, getProductById, updateProductById, deleteProductById, addProduct } = require("../controllers/productController")
const verifyUser = require("../middleware/veryfyuser")
// const multiupload = require("../middleware/multer"

const router = express.Router()
// const multer = require('multer')
// const morgan = require("morgan")
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })


router.get("/login",adminLogin)
router.get("/dash",getAllUsers)
router.get("/ban/:id",userBan)
router.get("/unban/:id",userUnBan)
router.post("/add address",)



// @ category
router.post('/category', createCategory )
router.get('/category', getAllCategory )
router.get('/category/:id', getCategoryById )
router.put('/category/:id',updateCategoryById )
router.delete('/category/:id',deleteCategoryById)

// @product Routes

router.post('/product', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'sideImage', maxCount: 12 }]),  addProduct)
router.get('/product',getAllProduct)
router.get('/product/:id',getProductById)
router.put('/product/:id',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'sideImage', maxCount: 12 }]), updateProductById)
router.delete('/product/:id',deleteProductById)
// coupon
router.post("/coupon",createCoupon  )
router.get("/coupon",getAllCoupon  )
router.put("/coupon/:id", updateCoupon  )
router.delete("/coupon/:id", deleteCoupon  )



// @ order  management;

// router.get("/order",getOrder)
// router.get("/order/:id",getOrderbyId)
router.put("/order/:id",updateOrder)


module.exports= router;
