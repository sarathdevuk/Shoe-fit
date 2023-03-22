const express = require("express")
const multer  = require('multer')
const { getAllUsers, adminLogin, userBan, userUnBan, getAdminLogin, getAdminDash, adminLogout, salesReport, getAdminSalesReport, searchUser, searchProduct, getAdminHome } = require("../controllers/adminController")
const {createCategory, getAllCategory, getCategoryById, updateCategoryById, deleteCategoryById, unlistCategory, listCategory, getAddCategory} = require("../controllers/categoryController")
const { createCoupon, getAllCoupon, updateCoupon, deleteCoupon, listCoupon, unlistCoupon, getAddCoupon, getEditCoupon } = require("../controllers/couponController")
const { addOffer, updateOffer, deleteOffer, getOffer, getAddOffer, getEditOffer, listOffer, unlistOffer } = require("../controllers/offferController")
const { getOrders, editOrder, getOrderbyId, getOrder, updateOrder, getAllOrders, getEditOrder, getOrderDetails,} = require("../controllers/orderController")
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


router.get("/check", (req, res)=>{
  res.send("Hai App working")
})


router.get("/",verifyAdmin ,getAdminHome)
router.get("/login", getAdminLogin)
router.post("/login", adminLogin)
router.get("/logout", adminLogout)
router.get("/users",verifyAdmin ,getAllUsers)
router.get("/ban/:id",verifyAdmin ,userBan)
router.get("/unban/:id",verifyAdmin ,userUnBan)
router.post("/searchUser",verifyAdmin ,searchUser)

// router.post("/add address",)



// @ category
router.get('/addCategory',verifyAdmin, getAddCategory )
router.post('/category',verifyAdmin, createCategory )
router.get('/category', verifyAdmin,getAllCategory )
router.get('/category/:id',verifyAdmin, getCategoryById )
router.post('/category/:id',verifyAdmin ,updateCategoryById )
router.delete('/category/:id',verifyAdmin,  deleteCategoryById)
router.get('/unlistcategory/:id',verifyAdmin,  unlistCategory)
router.get('/listcategory/:id',verifyAdmin, listCategory)

// @product Routes



router.post('/product', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'sideImage', maxCount: 12 }]),verifyAdmin,  addProduct)
router.get('/addProduct',verifyAdmin,getAddProductPage)
router.get('/product',verifyAdmin,getAllProduct)
router.get('/product/:id',verifyAdmin,getProductById)
router.get('/unlistProduct/:id',verifyAdmin,unlistProduct)
router.get('/listProduct/:id',verifyAdmin,listProduct)
router.post("/searchProduct",verifyAdmin ,searchProduct)

router.get('/editProduct/:id',verifyAdmin,getEditProduct)
router.post('/product/:id',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'sideImage', maxCount: 12 }]),verifyAdmin, updateProductById)
router.delete('/product/:id',verifyAdmin,deleteProductById)
// coupon
router.get("/coupon",verifyAdmin,getAllCoupon  )
router.get("/addCoupon",verifyAdmin,getAddCoupon )
router.post("/coupon",verifyAdmin,createCoupon  )
router.get("/editCoupon/:id",verifyAdmin,getEditCoupon )
router.post("/coupon/:id",verifyAdmin, updateCoupon  )
router.delete("/coupon/:id",verifyAdmin, deleteCoupon  )
router.get("/listCoupon/:id",verifyAdmin, listCoupon )
router.get("/unlistCoupon/:id",verifyAdmin, unlistCoupon )
// offer
router.post("/offer",upload.fields([{ name: 'image', maxCount: 1 },]),verifyAdmin, addOffer  )
router.get("/offer",verifyAdmin, getOffer  )
router.get("/addOffer",verifyAdmin, getAddOffer  )
router.get("/editOffer/:id",verifyAdmin, getEditOffer  )
router.post("/offer/:id",upload.fields([{ name: 'image', maxCount: 1 },]) ,verifyAdmin ,updateOffer  )
router.delete("/offer/:id",verifyAdmin ,deleteOffer  )
router.get("/listOffer/:id",verifyAdmin, listOffer )
router.get("/unlistOffer/:id",verifyAdmin, unlistOffer )


// @ order  management;

router.get("/orders",  verifyAdmin, getAllOrders)
router.get("/order/:id",verifyAdmin, getOrderDetails)
router.get("/editOrder/:id",verifyAdmin, getEditOrder)
router.post("/order/:id",verifyAdmin, updateOrder)
router.get("/salesReport",verifyAdmin,getAdminSalesReport)

module.exports= router;
