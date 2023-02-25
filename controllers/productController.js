const asyncHandler = require("express-async-handler")
const { get } = require("mongoose")
const Product = require("../model/productModel")
const User = require("../model/userModel")
const Category = require("../model/categoryModel")


// @get all product

const productController = {

  addProduct: asyncHandler(async (req, res) => {

    const { name, description, quantity, price } = req.body
    console.log(req.body);
    console.log(name);

    try {

      if (!name) {
        res.status(400)
        throw new Error("All fields are mandatory")
      }
      const product = await Product.create({
        name, description, quantity, price,
        image: req.files.image,
        sideImage: req.files.sideImage
      })
      // console.log(product);
      res.status(200)
      res.redirect("/admin/product")
    // res.json(product)
    } catch (error) {
      console.log(error);
    }


  }),

  //   addProduct : async(req, res)=> {
  //     const { name , price , description, quantity } = req.body

  //     let product =  new Product({
  //         name, price, description, quantity,
  //         image: req.files.image[0],
  //         sideImage: req.files.sideImage
  //     })
  //     await product.save()
  //     res.json(product)
  // },

 getAddProductPage : (async(req,res)=>{
      res.render("admin/addProduct")
 }),
 getEditProduct : (async(req,res)=>{
      console.log(req.params.id);
  const product = await Product.findById(req.params.id).lean()
  const category= await Category.find().lean()

  console.log(category);
      res.render("admin/editProduct",{product,category})
 }),

  getAllProduct: asyncHandler(async (req, res) => {
    const products = await Product.find().lean()

    // res.json(product)
    res.render("admin/productManagement" , {products})

  }),

  getProductById: asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).lean()
    const products = await Product.find().lean()
    // console.log(product);
    if (!product) {
      res.status(404)
      throw new Error("product not found")
    }
    res.render("productPage", {product,products})
    // res.status(200).json(product)
  }),

  // updateProductById:asyncHandler(async(req,res)=>{


  // const updatedProduct= await Product.findByIdAndUpdate(req.params.id,req.body,{new:true})
  //   if(!updatedProduct){` `
  //       res.status(404)
  //       throw new Error("no Product found")
  //   }
  //   res.json(updatedProduct)

  // }),

  updateProductById: async (req, res) => {
    const _id = req.params.id
    const { name, price, description, quantity } = req.body

   const product= await Product.updateOne({ _id: _id }, {
      $set: {
        name, price, description, quantity,
        image: req.files.image,
        sideImage: req.files.sideImage
      },
    })
    // res.json(product)
    console.log(product)
        res.redirect("/admin/product")    
  },

  deleteProductById: asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
    if (!product) {
      res.status(404)
      throw new Error("Product  not found");
    }
    await product.remove()
    res.status(200).json(product)
  }),

  addToWishlist: asyncHandler(async(req,res)=>{
    const id=req.user;
    // const {productId}=req.body
      const prodId = req.params.id

    try {
      const user=await User.findById(id);
      const alreadyadded= user.wishlist.find((id)=> id.toString()===prodId);  

      if(alreadyadded){
        let user = await User.findByIdAndUpdate(
          id,
          {
            $pull:{wishlist:prodId},
          },
          {
            new:true
          }
        );
        // res.json({user})
      res.redirect('back')
          
      }else{
        let user = await User.findByIdAndUpdate(
          id,
          {
            $push:{wishlist:prodId},
          },
          {
            new:true
          }
        );
        // res.json({user})
        res.redirect('back')
      }
    } catch (error) {
      throw new Error(error)
    }


  }),
  getWishlist: asyncHandler(async(req,res)=>{
    const id=req.user;
    try {
      const {wishlist} = await User.findOne({_id:id},{wishlist:1})
      console.log("wishlsit ",wishlist);
    
      const wishItem = wishlist.map((Item) =>{
        return Item
      })
      // console.log("wish",wishItem);
      const products = await Product.find({_id : {$in:wishItem}}).lean()

      // console.log("products",products)
      // res.json(products)
        res.render("wishlist",{products})
        

    } catch (error) {
      console.log(error);
    }
 
  

  })


}

module.exports = productController;