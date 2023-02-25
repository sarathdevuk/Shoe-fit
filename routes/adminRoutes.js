const express = require("express")
const multer  = require('multer')
const { getAllUsers, adminLogin, userBan, userUnBan, getAdminLogin, getAdminDash } = require("../controllers/adminController")
const {createCategory, getAllCategory, getCategoryById, updateCategoryById, deleteCategoryById} = require("../controllers/categoryController")
const { createCoupon, getAllCoupon, updateCoupon, deleteCoupon } = require("../controllers/couponController")
const { addOffer, updateOffer, deleteOffer } = require("../controllers/offferController")
const { getOrders, editOrder, getOrderbyId, getOrder, updateOrder } = require("../controllers/orderController")
const { getAllProduct, getProductById, updateProductById, deleteProductById, addProduct, getAddProductPage, getEditProduct } = require("../controllers/productController")
const verifyUser = require("../middleware/veryfyuser")


const router = express.Router()

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


router.get("/",getAdminDash)
router.get("/login",getAdminLogin)
router.post("/login",adminLogin)
router.get("/users",getAllUsers)
router.get("/ban/:id",userBan)
router.get("/unban/:id",userUnBan)
// router.post("/add address",)



// @ category
router.post('/category', createCategory )
router.get('/category', getAllCategory )
router.get('/category/:id', getCategoryById )
router.put('/category/:id',updateCategoryById )
router.delete('/category/:id',deleteCategoryById)

// @product Routes

router.post('/product', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'sideImage', maxCount: 12 }]),  addProduct)
router.get('/addProduct',getAddProductPage)
router.get('/product',getAllProduct)
router.get('/product/:id',getProductById)
router.get('/editProduct/:id',getEditProduct)
router.post('/product/:id',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'sideImage', maxCount: 12 }]), updateProductById)
router.delete('/product/:id',deleteProductById)
// coupon
router.post("/coupon",createCoupon  )
router.get("/coupon",getAllCoupon  )
router.put("/coupon/:id", updateCoupon  )
router.delete("/coupon/:id", deleteCoupon  )
// offer
router.post("/offer",addOffer  )
router.put("/offer/:id",updateOffer  )
router.delete("/offer/:id",deleteOffer  )



// @ order  management;

// router.get("/order",getOrder)
// router.get("/order/:id",getOrderbyId)
router.put("/order/:id",updateOrder)


module.exports= router;
