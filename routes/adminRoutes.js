const express = require("express")
const multer  = require('multer')
const { getAllUsers, adminLogin, userBan, userUnBan, getAdminLogin, getAdminDash, adminLogout } = require("../controllers/adminController")
const {createCategory, getAllCategory, getCategoryById, updateCategoryById, deleteCategoryById} = require("../controllers/categoryController")
const { createCoupon, getAllCoupon, updateCoupon, deleteCoupon } = require("../controllers/couponController")
const { addOffer, updateOffer, deleteOffer } = require("../controllers/offferController")
const { getOrders, editOrder, getOrderbyId, getOrder, updateOrder } = require("../controllers/orderController")
const { getAllProduct, getProductById, updateProductById, deleteProductById, addProduct, getAddProductPage, getEditProduct, unlistProduct, listProduct } = require("../controllers/productController")
const verifyAdmin = require("../middleware/verifyAdmin")
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


router.get("/",verifyAdmin ,getAdminDash)
router.get("/login", getAdminLogin)
router.post("/login", adminLogin)
router.get("/logout", adminLogout)
router.get("/users",verifyAdmin ,getAllUsers)
router.get("/ban/:id",verifyAdmin ,userBan)
router.get("/unban/:id",verifyAdmin ,userUnBan)
// router.post("/add address",)



// @ category
router.post('/category',verifyAdmin, createCategory )
router.get('/category', verifyAdmin,getAllCategory )
router.get('/category/:id',verifyAdmin, getCategoryById )
router.post('/category/:id',verifyAdmin ,updateCategoryById )
router.delete('/category/:id',verifyAdmin,  deleteCategoryById)

// @product Routes

router.post('/product', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'sideImage', maxCount: 12 }]),verifyAdmin,  addProduct)
router.get('/addProduct',verifyAdmin,getAddProductPage)
router.get('/product',verifyAdmin,getAllProduct)
router.get('/product/:id',verifyAdmin,getProductById)
router.get('/unlistProduct/:id',verifyAdmin,unlistProduct)
router.get('/listProduct/:id',verifyAdmin,listProduct)

router.get('/editProduct/:id',verifyAdmin,getEditProduct)
router.post('/product/:id',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'sideImage', maxCount: 12 }]),verifyAdmin, updateProductById)
router.delete('/product/:id',verifyAdmin,deleteProductById)
// coupon
router.post("/coupon",verifyAdmin,createCoupon  )
router.get("/coupon",verifyAdmin,getAllCoupon  )
router.put("/coupon/:id",verifyAdmin, updateCoupon  )
router.delete("/coupon/:id",verifyAdmin, deleteCoupon  )
// offer
router.post("/offer",verifyAdmin, addOffer  )
router.put("/offer/:id",verifyAdmin ,updateOffer  )
router.delete("/offer/:id",verifyAdmin ,deleteOffer  )



// @ order  management;

// router.get("/order",getOrder)
// router.get("/order/:id",getOrderbyId)
router.put("/order/:id",updateOrder)


module.exports= router;
